import { expect, test, type Page } from '@playwright/test'

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

async function setupAdminMocks(page: Page) {
  await page.route('**/api/admin/insights/bootstrap', async (route) => {
    await route.fulfill(
      apiResponse({
        overview: {
          totalYouth: 12,
          totalProfessionals: 8,
          totalInstitutions: 4,
          totalResponses: 24,
        },
        dashboard: {
          overview: {
            totalYouth: 12,
            totalProfessionals: 8,
            totalInstitutions: 4,
            totalResponses: 24,
          },
          profile: {
            ageDistribution: [
              { name: '18 a 24 anos', value: 6 },
              { name: '25 a 34 anos', value: 7 },
            ],
            genderDistribution: [
              { name: 'Mulheres', value: 10 },
              { name: 'Homens', value: 9 },
              { name: 'Pessoa não binária', value: 2 },
            ],
          },
          details: {
            modalities: [{ name: 'Ballet clássico', value: 5 }],
            incomeDistribution: [{ name: 'Até 1 SM', value: 3 }],
            publicCallsParticipation: [{ name: 'Já participou', value: 4 }],
            financingDistribution: [{ name: 'Família', value: 6 }],
            courseCostDistribution: [],
            monthlyFeeDistribution: [],
            monthlyRevenueDistribution: [],
            danceEducationDistribution: [],
            costumesCostDistribution: [],
            editalDifficultyDistribution: [],
            educationIndicators: [],
            institutionIndicators: [{ name: 'Com CNPJ', value: 3 }],
          },
        },
        sectorSummary: [
          {
            sector: 'YOUTH',
            sectorLabel: 'Jovens',
            totalSubmissions: 12,
            totalStates: 3,
            firstSubmissionAt: '2026-04-01T10:00:00Z',
            lastSubmissionAt: '2026-04-07T10:00:00Z',
          },
        ],
        stateSummary: [
          {
            stateCode: 'SP',
            stateName: 'São Paulo',
            totalSubmissions: 9,
            totalYouth: 4,
            totalProfessionals: 3,
            totalInstitutions: 2,
            lastSubmissionAt: '2026-04-07T10:00:00Z',
          },
        ],
      }),
    )
  })
}

test('login administrativo abre o dashboard com textos limpos', async ({ page }) => {
  await setupAdminMocks(page)

  await page.goto('/painel-interno/acesso')

  await page.getByLabel(/Usuário/i).fill('ong.admin')
  await page.getByLabel(/Senha/i).fill('Sibradanca!Painel2026')
  await page.getByRole('button', { name: /Entrar/i }).click()

  await expect(page).toHaveURL(/\/painel-interno\/dashboard$/)
  await expect(page.getByText('Painel da ONG')).toBeVisible()
  await expect(page.getByText('Banco Nacional de Dados da Dança do Brasil')).toBeVisible()

  const visibleText = await page.locator('body').innerText()
  expect(visibleText).not.toContain('\\u00')
})
