import { expect, test, type Page } from '@playwright/test'

type SubmissionCapture = {
  youth: unknown[]
  professional: unknown[]
  institution: unknown[]
}

const modalities = [
  { id: 1, name: 'Ballet clássico' },
  { id: 2, name: 'Danças urbanas' },
  { id: 3, name: 'Dança contemporânea' },
]

const contents = [
  { id: 1, name: 'Vídeos' },
  { id: 2, name: 'Cursos online' },
]

const states = [
  { code: 'SP', name: 'São Paulo', region: 'Sudeste' },
  { code: 'BA', name: 'Bahia', region: 'Nordeste' },
]

const citiesByState: Record<string, { id: number; name: string; stateCode: string }[]> = {
  SP: [
    { id: 101, name: 'São Paulo', stateCode: 'SP' },
    { id: 102, name: 'Campinas', stateCode: 'SP' },
  ],
  BA: [
    { id: 201, name: 'Salvador', stateCode: 'BA' },
  ],
}

function apiResponse(data: unknown, message = 'ok') {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      success: true,
      message,
      data,
    }),
  }
}

async function setupPublicFormMocks(
  page: Page,
  captures: SubmissionCapture,
  options?: {
    cityDelayMs?: number
  },
) {
  const cityDelayMs = options?.cityDelayMs ?? 0

  await page.route('**/api/reference/modalities', async (route) => {
    await route.fulfill(apiResponse(modalities))
  })

  await page.route('**/api/reference/contents', async (route) => {
    await route.fulfill(apiResponse(contents))
  })

  await page.route('**/api/reference/consent-term', async (route) => {
    await route.fulfill(
      apiResponse({
        id: 1,
        code: 'LGPD-2026',
        title: 'Termo vigente de consentimento do SIBRADANÇA',
      }),
    )
  })

  await page.route('**/api/geo/states', async (route) => {
    await route.fulfill(apiResponse(states))
  })

  await page.route('**/api/geo/cities?*', async (route) => {
    const url = new URL(route.request().url())
    const stateCode = (url.searchParams.get('stateCode') ?? '').toUpperCase()

    if (cityDelayMs > 0) {
      await page.waitForTimeout(cityDelayMs)
    }

    await route.fulfill(apiResponse(citiesByState[stateCode] ?? []))
  })

  await page.route('**/api/forms/youth', async (route) => {
    captures.youth.push(route.request().postDataJSON())
    await route.fulfill(
      apiResponse({
        protocol: 'SIB-YTH-0001',
      }),
    )
  })

  await page.route('**/api/forms/professional', async (route) => {
    captures.professional.push(route.request().postDataJSON())
    await route.fulfill(
      apiResponse({
        protocol: 'SIB-PRO-0001',
      }),
    )
  })

  await page.route('**/api/forms/institution', async (route) => {
    captures.institution.push(route.request().postDataJSON())
    await route.fulfill(
      apiResponse({
        protocol: 'SIB-INS-0001',
      }),
    )
  })
}

async function clickPrimaryAction(page: Page) {
  await page.locator('.access-action-btn.is-primary').click()
}

function getField(page: Page, fieldText: string) {
  return page.locator('.access-field', { hasText: fieldText }).first()
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getFieldByExactLabel(page: Page, label: string) {
  const normalizedLabel = label.replace(/\s+\*$/, '')

  return page
    .locator('.access-field')
    .filter({ has: page.locator('span', { hasText: new RegExp(`^${escapeRegExp(normalizedLabel)}(?: \\*)?$`) }) })
    .first()
}

async function selectFieldOption(page: Page, fieldText: string, value: string | { label?: string; index?: number }) {
  await getField(page, fieldText).locator('select').selectOption(value)
}

async function clickChoice(page: Page, fieldText: string, choiceText: 'Sim' | 'Não') {
  await getFieldByExactLabel(page, fieldText)
    .getByRole('button', { name: new RegExp(`^${escapeRegExp(choiceText)}$`) })
    .click()
}

async function toggleFirstCheckbox(page: Page, fieldText: string) {
  await page.locator('.access-field', { hasText: fieldText }).locator('.access-check-card').first().click()
}

async function fillTextField(page: Page, label: string, value: string) {
  await getFieldByExactLabel(page, label).locator('input, textarea').fill(value)
}

test.describe('cadastros públicos', () => {
  test('conclui o cadastro de jovens com dados válidos', async ({ page }) => {
    const captures: SubmissionCapture = { youth: [], professional: [], institution: [] }
    await setupPublicFormMocks(page, captures)

    await page.goto('/formulario/jovens')

    await page.getByLabel(/Nome completo/i).fill('Ana Jovem')
    await page.getByLabel(/Email/i).fill('ana.jovem@example.com')
    await page.getByLabel(/WhatsApp/i).fill('11987654321')
    await clickPrimaryAction(page)

    await selectFieldOption(page, 'Região', { label: 'Sudeste' })
    await selectFieldOption(page, 'Estado *', 'SP')
    await selectFieldOption(page, 'Cidade *', { label: 'São Paulo' })
    await clickPrimaryAction(page)

    await page.locator('.access-date-grid').getByLabel('Ano').selectOption('2010')
    await page.locator('.access-date-grid').getByLabel('Mês').selectOption('04')
    await page.locator('.access-date-grid').getByLabel('Dia').selectOption('07')
    await page.getByLabel(/Tempo de prática na dança/i).selectOption({ index: 1 })
    await toggleFirstCheckbox(page, 'Modalidades de dança')
    await clickPrimaryAction(page)

    await page.getByLabel(/Faixa de renda familiar/i).selectOption({ index: 1 })
    await clickPrimaryAction(page)

    await clickChoice(page, 'Tem interesse em seguir carreira na dança?', 'Sim')
    await clickChoice(page, 'Pesquisa conteúdos sobre dança na internet?', 'Sim')
    await toggleFirstCheckbox(page, 'Quem banca os custos da dança?')
    await clickPrimaryAction(page)

    await page.locator('.access-consent-card').first().click()
    await clickPrimaryAction(page)

    await expect(page.getByText('Cadastro enviado com sucesso')).toBeVisible()
    expect(captures.youth).toHaveLength(1)
    expect(captures.youth[0]).toMatchObject({
      fullName: 'Ana Jovem',
      cityId: 101,
      birthDate: '2010-04-07',
      age: 16,
      consentAccepted: true,
    })
  })

  test('conclui o cadastro profissional com dados válidos', async ({ page }) => {
    const captures: SubmissionCapture = { youth: [], professional: [], institution: [] }
    await setupPublicFormMocks(page, captures)

    await page.goto('/formulario/profissionais')

    await page.getByLabel(/Nome completo/i).fill('Carlos Profissional')
    await page.getByLabel(/Email/i).fill('carlos.profissional@example.com')
    await page.getByLabel(/WhatsApp/i).fill('11999998888')
    await clickPrimaryAction(page)

    await selectFieldOption(page, 'Região', { label: 'Sudeste' })
    await selectFieldOption(page, 'Estado *', 'SP')
    await selectFieldOption(page, 'Cidade *', { label: 'São Paulo' })
    await clickPrimaryAction(page)

    await page.locator('.access-date-grid').getByLabel('Ano').selectOption('2000')
    await page.locator('.access-date-grid').getByLabel('Mês').selectOption('04')
    await page.locator('.access-date-grid').getByLabel('Dia').selectOption('07')
    await page.getByLabel(/Tempo de prática na dança/i).selectOption({ index: 1 })
    await toggleFirstCheckbox(page, 'Modalidades de dança')
    await clickPrimaryAction(page)

    await clickChoice(page, 'Atua profissionalmente com dança?', 'Sim')
    await clickChoice(page, 'Possui DRT?', 'Não')
    await clickChoice(page, 'Atua atualmente na dança?', 'Sim')
    await clickChoice(page, 'Pretende seguir carreira na dança?', 'Sim')
    await toggleFirstCheckbox(page, 'Funções na dança')
    await page.getByLabel(/Tipo de atuação/i).selectOption({ index: 1 })
    await clickPrimaryAction(page)

    await page.getByLabel(/Renda média salarial da sua casa/i).selectOption({ index: 1 })
    await page.getByLabel(/Renda média mensal total/i).fill('2500')
    await page.getByLabel(/Renda mensal média exclusivamente com a dança/i).fill('1200')
    await clickChoice(page, 'A dança é sua renda principal?', 'Sim')
    await clickChoice(page, 'Possui outra fonte de renda?', 'Não')
    await clickPrimaryAction(page)

    await page.getByLabel(/Mensalidade de escola ou grupo/i).fill('180')
    await page.getByLabel(/Cursos e formações/i).fill('120')
    await page.getByLabel(/Figurinos e acessórios/i).fill('90')
    await page.getByLabel(/Festivais e competições/i).fill('140')
    await page.getByLabel(/Viagens e deslocamentos/i).fill('110')
    await fillTextField(page, 'Outros', '60')
    await toggleFirstCheckbox(page, 'Quem banca os custos da dança?')
    await clickChoice(page, 'Você pesquisa conteúdos sobre dança na internet?', 'Sim')
    await clickPrimaryAction(page)

    await page.getByLabel(/Formação acadêmica/i).selectOption({ index: 1 })
    await clickChoice(page, 'Estuda dança atualmente?', 'Sim')
    await clickChoice(page, 'Pretende estudar dança formalmente?', 'Sim')
    await page.getByLabel(/Cursos presenciais por ano/i).fill('2')
    await page.getByLabel(/Cursos online por ano/i).fill('3')
    await clickPrimaryAction(page)

    await clickChoice(page, 'Já participou de editais públicos?', 'Sim')
    await clickChoice(page, 'Foi contemplado(a)?', 'Não')
    await clickChoice(page, 'Se inscreveu e não foi contemplado(a)?', 'Sim')
    await clickPrimaryAction(page)

    await page.locator('.access-consent-card').first().click()
    await clickPrimaryAction(page)

    await expect(page.getByText('Cadastro enviado com sucesso')).toBeVisible()
    expect(captures.professional).toHaveLength(1)
    expect(captures.professional[0]).toMatchObject({
      fullName: 'Carlos Profissional',
      cityId: 101,
      birthDate: '2000-04-07',
      age: 26,
      consentAccepted: true,
    })
  })

  test('conclui o cadastro institucional com CNPJ alfanumérico e regras territoriais', async ({ page }) => {
    const captures: SubmissionCapture = { youth: [], professional: [], institution: [] }
    await setupPublicFormMocks(page, captures)

    await page.goto('/formulario/instituicoes')

    await page.getByLabel(/Nome completo do responsável/i).fill('Marina Gestora')
    await page.getByLabel(/Email institucional/i).fill('contato@escolaexemplo.org')
    await page.getByLabel(/WhatsApp institucional/i).fill('11988887777')
    await clickPrimaryAction(page)

    await page.getByLabel(/Razão social/i).fill('Escola Exemplo LTDA')
    await page.getByLabel(/Nome fantasia/i).fill('Escola Exemplo')
    await page.getByLabel(/Tipo de atuação/i).selectOption({ index: 1 })
    await page.getByLabel(/Natureza jurídica/i).selectOption({ index: 1 })
    await page.getByLabel(/A instituição é/i).selectOption({ index: 1 })
    await page.getByLabel(/Ano de fundação/i).fill('2020')
    await clickChoice(page, 'Possui CNPJ?', 'Sim')
    await page.getByLabel(/^CNPJ/i).fill('12.ABC.345/01DE-35')
    await clickPrimaryAction(page)

    await selectFieldOption(page, 'Região', { label: 'Sudeste' })
    await selectFieldOption(page, 'Estado *', 'SP')
    await selectFieldOption(page, 'Cidade *', { label: 'São Paulo' })
    await page.getByLabel(/Rede social/i).fill('@escolaexemplo')
    await page.getByLabel(/Tipo de localização/i).selectOption({ index: 1 })
    await clickChoice(page, 'Atua em periferias? *', 'Sim')
    await clickChoice(page, 'Atua em área rural? *', 'Não')
    await clickPrimaryAction(page)

    await toggleFirstCheckbox(page, 'Modalidades oferecidas')
    await page.getByLabel(/Número de salas/i).fill('3')
    await page.getByLabel(/Aulas por semana/i).fill('12')
    await page.getByLabel(/Tipo de espaço/i).selectOption({ index: 1 })
    await toggleFirstCheckbox(page, 'Infraestrutura disponível')
    await clickChoice(page, 'Possui sede própria? *', 'Sim')
    await clickChoice(page, 'Atua em sede alugada? *', 'Não')
    await clickChoice(page, 'Usa espaço público? *', 'Sim')
    await clickPrimaryAction(page)

    await page.getByLabel(/Número de professores/i).fill('8')
    await page.getByLabel(/Média de alunos ativos/i).fill('120')
    await page.getByLabel(/Alunos ativos no momento/i).fill('98')
    await page.getByLabel(/Mensalidade média/i).fill('250')
    await page.getByLabel(/Capacidade média de público/i).fill('80')
    await clickChoice(page, 'Possui bolsas? *', 'Sim')
    await page.getByLabel(/Quantidade de bolsistas/i).fill('12')
    await clickChoice(page, 'Os alunos pagam mensalidade?', 'Sim')
    await clickChoice(page, 'Atende população em situação de vulnerabilidade?', 'Sim')
    await clickPrimaryAction(page)

    await page.getByLabel(/Funcionários CLT/i).fill('4')
    await page.getByLabel(/Contratos PJ/i).fill('3')
    await page.getByLabel(/Faturamento mensal médio/i).fill('15000')
    await page.getByLabel(/Número total de pessoas na equipe/i).fill('10')
    await page.getByLabel(/Público mensal/i).fill('350')
    await clickChoice(page, 'Usa sistema de gestão?', 'Sim')
    await clickChoice(page, 'Recebeu recurso público nos últimos 2 anos?', 'Sim')
    await page.getByLabel(/Faixa de orçamento anual/i).selectOption({ index: 1 })
    await toggleFirstCheckbox(page, 'Principais fontes de renda')
    await clickPrimaryAction(page)

    await page.getByLabel(/Quem arca com os custos dos eventos/i).selectOption({ index: 1 })
    await toggleFirstCheckbox(page, 'Profissionais da estrutura')
    await clickChoice(page, 'Já se cadastrou em editais públicos?', 'Sim')
    await clickChoice(page, 'Já foi contemplada em edital?', 'Não')
    await clickChoice(page, 'Conhece os mecanismos de acesso a políticas públicas?', 'Sim')
    await clickChoice(page, 'Usaria plataforma gratuita para divulgar aulas e eventos?', 'Sim')
    await clickChoice(page, 'Conhece o plano municipal de cultura?', 'Sim')
    await clickChoice(page, 'Participa de conselho de cultura?', 'Não')
    await clickChoice(page, 'Tem interesse em parcerias públicas?', 'Sim')
    await toggleFirstCheckbox(page, 'Dificuldades com editais')
    await toggleFirstCheckbox(page, 'Canais de divulgação')
    await page.getByLabel(/Principal desafio da instituição/i).fill('Sustentabilidade financeira e ampliação de público.')
    await clickPrimaryAction(page)

    await page.locator('.access-consent-card').first().click()
    await clickPrimaryAction(page)

    await expect(page.getByText('Cadastro enviado com sucesso')).toBeVisible()
    expect(captures.institution).toHaveLength(1)
    expect(captures.institution[0]).toMatchObject({
      responsibleName: 'Marina Gestora',
      cityId: 101,
      cnpj: '12ABC34501DE35',
      hasCnpj: true,
      consentAccepted: true,
    })
  })

  test('mostra carregamento de cidades e libera a navegação quando a lista chega', async ({ page }) => {
    const captures: SubmissionCapture = { youth: [], professional: [], institution: [] }
    await setupPublicFormMocks(page, captures, { cityDelayMs: 1_200 })

    await page.goto('/formulario/jovens')
    await page.getByLabel(/Nome completo/i).fill('Teste Carregamento')
    await page.getByLabel(/Email/i).fill('teste@example.com')
    await page.getByLabel(/WhatsApp/i).fill('11987654321')
    await clickPrimaryAction(page)

    await selectFieldOption(page, 'Região', { label: 'Sudeste' })
    await selectFieldOption(page, 'Estado *', 'SP')

    const citySelect = getField(page, 'Cidade *').locator('select')
    await expect(citySelect).toBeDisabled()
    await expect(citySelect.locator('option').first()).toHaveText(/Carregando cidades/i)

    await expect(citySelect).toBeEnabled()
    await citySelect.selectOption({ label: 'São Paulo' })
    await clickPrimaryAction(page)

    await expect(getFieldByExactLabel(page, 'Idade *').locator('input')).toBeVisible()
  })
})
