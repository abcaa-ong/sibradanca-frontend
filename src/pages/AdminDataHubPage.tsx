import { useEffect, useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import {
  downloadAdminStatisticsCsv,
  downloadAdminStatisticsPdf,
  downloadAdminStatisticsXlsx,
  downloadAdminSubmissionsCsv,
  downloadAdminSubmissionsDetailedCsv,
  downloadAdminSubmissionsDetailedPdf,
  downloadAdminSubmissionsDetailedXlsx,
  downloadAdminSubmissionsXlsx,
  getAdminDashboard,
  getAdminOverview,
  getAdminSectorSummary,
  getAdminStateSummary,
} from '../services/admin.service'
import type {
  AdminBiSectorSummaryResponse,
  AdminBiStateSummaryResponse,
  AdminInsightsDashboardResponse,
  AdminInsightsOverviewResponse,
} from '../types/admin'
import { formatBackendDateTime } from '../utils/backend-date'

type DownloadAction = () => Promise<{ blob: Blob; filename: string | null }>

type DownloadRow = {
  title: string
  format: 'PDF' | 'XLSX' | 'CSV'
  scope: string
  actionLabel: string
  action: DownloadAction
}

const completeDownloadRows: DownloadRow[] = [
  {
    title: 'Fichas por protocolo',
    format: 'PDF',
    scope: 'Leitura completa de cada cadastro, com respostas separadas por etapa do formulário.',
    actionLabel: 'Baixar PDF',
    action: downloadAdminSubmissionsDetailedPdf,
  },
  {
    title: 'Base completa da equipe',
    format: 'XLSX',
    scope: 'Abas com panorama da base, cadastros e respostas organizadas por tema.',
    actionLabel: 'Baixar Excel',
    action: downloadAdminSubmissionsDetailedXlsx,
  },
  {
    title: 'Base completa da equipe',
    format: 'CSV',
    scope: 'Linhas por cadastro, etapa, campo e resposta para leitura aprofundada.',
    actionLabel: 'Baixar CSV',
    action: downloadAdminSubmissionsDetailedCsv,
  },
]

const statisticsDownloadRows: DownloadRow[] = [
  {
    title: 'Relatório geral da base',
    format: 'PDF',
    scope: 'Resumo visual para reuniões, apresentações e alinhamentos da ONG.',
    actionLabel: 'Baixar PDF',
    action: downloadAdminStatisticsPdf,
  },
  {
    title: 'Indicadores da base',
    format: 'XLSX',
    scope: 'Planilha com recortes por tema para relatórios, planilhas e Power BI.',
    actionLabel: 'Baixar Excel',
    action: downloadAdminStatisticsXlsx,
  },
  {
    title: 'Indicadores em CSV',
    format: 'CSV',
    scope: 'Recortes organizados para dashboards, cruzamentos e análises.',
    actionLabel: 'Baixar CSV',
    action: downloadAdminStatisticsCsv,
  },
]

const operationalDownloadRows: DownloadRow[] = [
  {
    title: 'Cadastros do dia a dia',
    format: 'XLSX',
    scope: 'Consulta rápida por protocolo e situação do cadastro.',
    actionLabel: 'Baixar Excel',
    action: downloadAdminSubmissionsXlsx,
  },
  {
    title: 'Cadastros do dia a dia',
    format: 'CSV',
    scope: 'Consulta operacional rápida para conferências e revisões.',
    actionLabel: 'Baixar CSV',
    action: downloadAdminSubmissionsCsv,
  },
]

const formJourneyCards = [
  {
    title: 'Jovens da dança',
    description:
      'Entram com identidade, território, modalidades, formação, consumo cultural e condições de permanência.',
    outputs: 'Painel / PDF / Excel',
  },
  {
    title: 'Profissionais da dança',
    description:
      'Entram com trajetória, trabalho, renda, circulação, apoio público e temas que pedem fortalecimento.',
    outputs: 'Painel / PDF / Excel / Power BI',
  },
  {
    title: 'Instituições da dança',
    description:
      'Entram com estrutura, ação formativa, território, rotina de atividades, equipe e alcance institucional.',
    outputs: 'Painel / PDF / Excel / Power BI',
  },
  {
    title: 'Leitura nacional consolidada',
    description:
      'Cruza as três frentes para gerar panorama da base, relatórios, dashboards e materiais da ONG.',
    outputs: 'Painel / PDF / XLSX / CSV',
  },
] as const

const internalFlowRows = [
  {
    stage: 'Cadastro recebido',
    detail: 'A resposta chega ao sistema, entra na base e fica disponível para consulta da equipe.',
    use: 'Acompanhamento diário e conferência da entrada da base.',
  },
  {
    stage: 'Ficha em PDF',
    detail: 'Cada protocolo pode ser lido de ponta a ponta, com respostas organizadas por formulário e etapa.',
    use: 'Leitura institucional, reuniões internas e revisão detalhada.',
  },
  {
    stage: 'Planilha completa',
    detail: 'A equipe baixa abas por tema, perfis e respostas para estudos internos.',
    use: 'Excel, relatórios, cruzamentos e acompanhamento de programas.',
  },
  {
    stage: 'Base para Power BI',
    detail: 'Recortes em XLSX e CSV saem prontos para dashboards e painéis analíticos.',
    use: 'Power BI, visualizações e acompanhamento da base nacional.',
  },
  {
    stage: 'Material para fora',
    detail: 'A ONG prepara o recorte certo antes de compartilhar qualquer informação com parceiros.',
    use: 'Apresentações, reuniões e materiais externos sem abrir o sistema.',
  },
] as const

const sharingRows = [
  {
    material: 'Fichas completas e dados pessoais',
    use: 'Consulta interna da equipe e leitura por protocolo.',
    sharing: 'Ficam no ambiente interno da ONG.',
  },
  {
    material: 'Base completa em planilhas',
    use: 'Cruzamentos, análises, estudos e montagem de relatórios internos.',
    sharing: 'Sai apenas em recortes preparados pela ONG.',
  },
  {
    material: 'Indicadores gerais',
    use: 'Leitura institucional, diretorias, reuniões e demonstrações do projeto.',
    sharing: 'Pode sair em materiais sem dados pessoais.',
  },
  {
    material: 'Arquivos para Power BI e dashboards',
    use: 'Visualizações, painéis internos e aprofundamento analítico.',
    sharing: 'Uso interno ou recortes preparados pela ONG.',
  },
] as const

function getTopItem(
  items: Array<{ name: string; value: number }> | undefined,
  fallbackLabel: string,
) {
  if (!items?.length) {
    return { label: fallbackLabel, value: '-' }
  }

  const [topItem] = [...items].sort((left, right) => right.value - left.value)
  return {
    label: topItem.name,
    value: String(topItem.value),
  }
}

function triggerDownload(blob: Blob, filename: string | null) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename ?? 'arquivo'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value)
}

function DownloadTable({
  title,
  eyebrow,
  rows,
  onDownload,
  className = '',
}: {
  title: string
  eyebrow: string
  rows: DownloadRow[]
  onDownload: (action: DownloadAction) => Promise<void>
  className?: string
}) {
  return (
    <Card className={`admin-panel-card admin-download-card ${className}`.trim()}>
      <div className="admin-panel-header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Arquivo</th>
              <th>Formato</th>
              <th>Uso</th>
              <th>Acao</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={`${title}-${item.title}-${item.format}`}>
                <td>{item.title}</td>
                <td>{item.format}</td>
                <td>{item.scope}</td>
                <td>
                  <div className="admin-table-actions">
                    <Button onClick={() => void onDownload(item.action)}>
                      <Download size={16} /> {item.actionLabel}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default function AdminDataHubPage() {
  const [overview, setOverview] = useState<AdminInsightsOverviewResponse | null>(null)
  const [dashboard, setDashboard] = useState<AdminInsightsDashboardResponse | null>(null)
  const [sectorSummary, setSectorSummary] = useState<AdminBiSectorSummaryResponse[]>([])
  const [stateSummary, setStateSummary] = useState<AdminBiStateSummaryResponse[]>([])
  const [error, setError] = useState('')

  const stateTopList = useMemo(
    () => [...stateSummary].sort((left, right) => right.totalSubmissions - left.totalSubmissions).slice(0, 8),
    [stateSummary],
  )

  useEffect(() => {
    async function loadData() {
      setError('')

      try {
        const [overviewData, dashboardData, sectorData, stateData] = await Promise.all([
          getAdminOverview(),
          getAdminDashboard(),
          getAdminSectorSummary(),
          getAdminStateSummary(),
        ])

        setOverview(overviewData)
        setDashboard(dashboardData)
        setSectorSummary(sectorData)
        setStateSummary(stateData)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar a área de dados.')
      }
    }

    void loadData()
  }, [])

  async function handleDownload(action: DownloadAction) {
    setError('')

    try {
      const file = await action()
      triggerDownload(file.blob, file.filename)
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : 'Não foi possível gerar o arquivo.')
    }
  }

  const topModality = getTopItem(dashboard?.details.modalities, 'Sem registros')
  const topAgeRange = getTopItem(dashboard?.profile.ageDistribution, 'Sem registros')
  const topGender = getTopItem(dashboard?.profile.genderDistribution, 'Sem registros')
  const topPublicCall = getTopItem(dashboard?.details.publicCallsParticipation, 'Sem registros')

  const latestRecordAt = useMemo(
    () =>
      [...stateSummary]
        .map((item) => item.lastSubmissionAt)
        .filter((value): value is string => Boolean(value))
        .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0] ?? null,
    [stateSummary],
  )

  const dataControlRows = useMemo(
    () => [
      {
        label: 'Cadastros disponíveis',
        value: overview ? formatNumber(overview.totalResponses) : '-',
        detail: 'Base pronta para consulta da equipe, leitura institucional, exportação e apresentação da ONG.',
      },
      {
        label: 'Presença territorial',
        value: formatNumber(stateSummary.filter((item) => item.totalSubmissions > 0).length),
        detail: 'Estados e Distrito Federal que já aparecem nesta leitura nacional da base.',
      },
      {
        label: 'Último envio recebido',
        value: latestRecordAt ? formatBackendDateTime(latestRecordAt) : 'Sem registro',
        detail: 'Cadastro mais recente que entrou no sistema.',
      },
      {
        label: 'Frentes reunidas',
        value: sectorSummary.length ? `${sectorSummary.length}/3` : '-',
        detail: 'Jovens, profissionais e instituições lidos dentro da mesma base nacional.',
      },
    ],
    [latestRecordAt, overview, sectorSummary.length, stateSummary],
  )

  return (
    <div className="admin-page-content">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Dados</p>
          <h2>Painel de dados, análises e exportações</h2>
          <p className="admin-page-subtitle">
            Aqui a ONG acompanha tudo o que chega pelos formulários, entende o retrato nacional e
            prepara arquivos para planilhas, Power BI, relatórios e apresentações.
          </p>
        </div>
      </header>

      {error ? <Card className="admin-alert admin-alert-error">{error}</Card> : null}

      <section className="admin-grid">
        <Card className="admin-metric-card">
          <span className="eyebrow">Base total</span>
          <strong>{overview?.totalResponses ?? '-'}</strong>
          <p className="card-text">Cadastros reunidos no Banco Nacional da Dança.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Jovens</span>
          <strong>{overview?.totalYouth ?? '-'}</strong>
          <p className="card-text">Participações da frente jovem desta base nacional.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Profissionais</span>
          <strong>{overview?.totalProfessionals ?? '-'}</strong>
          <p className="card-text">Pessoas ligadas ao trabalho, à formação e à atuação em dança.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Instituições</span>
          <strong>{overview?.totalInstitutions ?? '-'}</strong>
          <p className="card-text">Escolas, grupos, companhias, projetos e coletivos da base.</p>
        </Card>
      </section>

      <section className="admin-section-grid">
        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Controle da base</p>
              <h2>Leitura atual da base nacional</h2>
            </div>
          </div>

          <div className="admin-system-list">
            {dataControlRows.map((item) => (
              <div key={item.label} className="admin-system-row">
                <div>
                  <span className="admin-system-label">{item.label}</span>
                  <p className="admin-system-detail">{item.detail}</p>
                </div>
                <strong className="admin-system-value">{item.value}</strong>
              </div>
            ))}
          </div>
        </Card>

        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Entrada da base</p>
              <h2>Como cada formulário chega para a ONG</h2>
            </div>
          </div>

          <div className="admin-manifest-grid">
            {formJourneyCards.map((item) => (
              <div key={item.title} className="admin-manifest-card">
                <span className="admin-manifest-badge">{item.outputs}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="admin-section-grid">
        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Perfis</p>
              <h2>Distribuição por perfil</h2>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Perfil</th>
                  <th>Total</th>
                  <th>Estados</th>
                  <th>Último registro</th>
                </tr>
              </thead>
              <tbody>
                {sectorSummary.map((item) => (
                  <tr key={item.sector}>
                    <td>{item.sectorLabel}</td>
                    <td>{item.totalSubmissions}</td>
                    <td>{item.totalStates}</td>
                    <td>{formatBackendDateTime(item.lastSubmissionAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Território</p>
              <h2>Distribuição por estado</h2>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>UF</th>
                  <th>Total</th>
                  <th>Jovens</th>
                  <th>Profissionais</th>
                  <th>Instituições</th>
                </tr>
              </thead>
              <tbody>
                {stateTopList.map((item) => (
                  <tr key={item.stateCode}>
                    <td>{item.stateCode}</td>
                    <td>{item.totalSubmissions}</td>
                    <td>{item.totalYouth}</td>
                    <td>{item.totalProfessionals}</td>
                    <td>{item.totalInstitutions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section className="admin-section-grid">
        <Card className="admin-panel-card admin-panel-card-full">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Destaques</p>
              <h2>O que a base já mostra para a ONG</h2>
            </div>
          </div>

          <div className="admin-kpi-grid admin-kpi-grid-wide">
            <div className="admin-kpi-card">
              <span className="admin-kpi-label">Modalidade em destaque</span>
              <strong>{topModality.label}</strong>
              <span className="admin-kpi-value">{topModality.value}</span>
            </div>

            <div className="admin-kpi-card">
              <span className="admin-kpi-label">Faixa etária em destaque</span>
              <strong>{topAgeRange.label}</strong>
              <span className="admin-kpi-value">{topAgeRange.value}</span>
            </div>

            <div className="admin-kpi-card">
              <span className="admin-kpi-label">Gênero em destaque</span>
              <strong>{topGender.label}</strong>
              <span className="admin-kpi-value">{topGender.value}</span>
            </div>

            <div className="admin-kpi-card">
              <span className="admin-kpi-label">Tema ligado a editais</span>
              <strong>{topPublicCall.label}</strong>
              <span className="admin-kpi-value">{topPublicCall.value}</span>
            </div>
          </div>
        </Card>
      </section>

      <section className="admin-section-stack">
        <DownloadTable
          eyebrow="Base completa"
          title="Arquivos completos da base nacional"
          rows={completeDownloadRows}
          onDownload={handleDownload}
        />

        <DownloadTable
          eyebrow="Indicadores"
          title="Arquivos para análises e apresentações"
          rows={statisticsDownloadRows}
          onDownload={handleDownload}
        />
      </section>

      <section className="admin-section-stack">
        <DownloadTable
          eyebrow="Operação"
          title="Arquivos para conferência do dia a dia"
          rows={operationalDownloadRows}
          onDownload={handleDownload}
        />

        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Fluxo da equipe</p>
              <h2>Do formulário até o material final</h2>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Etapa</th>
                  <th>O que a ONG encontra</th>
                  <th>Para que serve</th>
                </tr>
              </thead>
              <tbody>
                {internalFlowRows.map((item) => (
                  <tr key={item.stage}>
                    <td>{item.stage}</td>
                    <td>{item.detail}</td>
                    <td>{item.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section className="admin-section-grid">
        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Saída da base</p>
              <h2>O que fica interno e o que pode sair</h2>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Uso</th>
                  <th>Compartilhamento</th>
                </tr>
              </thead>
              <tbody>
                {sharingRows.map((item) => (
                  <tr key={item.material}>
                    <td>{item.material}</td>
                    <td>{item.use}</td>
                    <td>{item.sharing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Canais de trabalho</p>
              <h2>Onde a equipe usa esse material</h2>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Canal</th>
                  <th>Situação</th>
                  <th>Uso principal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Painel interno da ONG</td>
                  <td>Ativo</td>
                  <td>Acompanhamento da equipe, leitura da base e consulta diária.</td>
                </tr>
                <tr>
                  <td>PDFs e relatórios</td>
                  <td>Disponível</td>
                  <td>Leitura institucional, reuniões, conselhos e apresentações.</td>
                </tr>
                <tr>
                  <td>Excel, CSV e Power BI</td>
                  <td>Disponível</td>
                  <td>Cruzamentos, dashboards, recortes e aprofundamento analítico.</td>
                </tr>
                <tr>
                  <td>Materiais para parceiros</td>
                  <td>Preparado pela ONG</td>
                  <td>Recortes selecionados antes de qualquer envio externo.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  )
}
