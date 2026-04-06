import { useEffect, useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { AdminZeroState } from '../components/AdminZeroState'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import {
  downloadAdminStatisticsCsv,
  downloadAdminStatisticsPdf,
  downloadAdminStatisticsXlsx,
  getAdminBootstrap,
  downloadAdminSubmissionsCsv,
  downloadAdminSubmissionsDetailedCsv,
  downloadAdminSubmissionsDetailedPdf,
  downloadAdminSubmissionsDetailedXlsx,
  downloadAdminSubmissionsXlsx,
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
    scope: 'Ficha completa por protocolo.',
    actionLabel: 'Baixar PDF',
    action: downloadAdminSubmissionsDetailedPdf,
  },
  {
    title: 'Base completa da equipe',
    format: 'XLSX',
    scope: 'Planilha completa da base.',
    actionLabel: 'Baixar Excel',
    action: downloadAdminSubmissionsDetailedXlsx,
  },
  {
    title: 'Base completa da equipe',
    format: 'CSV',
    scope: 'Base detalhada em linhas.',
    actionLabel: 'Baixar CSV',
    action: downloadAdminSubmissionsDetailedCsv,
  },
]

const statisticsDownloadRows: DownloadRow[] = [
  {
    title: 'Relat\u00f3rio geral da base',
    format: 'PDF',
    scope: 'Resumo visual da base.',
    actionLabel: 'Baixar PDF',
    action: downloadAdminStatisticsPdf,
  },
  {
    title: 'Indicadores da base',
    format: 'XLSX',
    scope: 'Recortes da base para relat\u00f3rios e BI.',
    actionLabel: 'Baixar Excel',
    action: downloadAdminStatisticsXlsx,
  },
  {
    title: 'Indicadores em CSV',
    format: 'CSV',
    scope: 'Recortes da base para dashboards.',
    actionLabel: 'Baixar CSV',
    action: downloadAdminStatisticsCsv,
  },
]

const operationalDownloadRows: DownloadRow[] = [
  {
    title: 'Cadastros do dia a dia',
    format: 'XLSX',
    scope: 'Consulta r\u00e1pida por protocolo.',
    actionLabel: 'Baixar Excel',
    action: downloadAdminSubmissionsXlsx,
  },
  {
    title: 'Cadastros do dia a dia',
    format: 'CSV',
    scope: 'Confer\u00eancia r\u00e1pida da base.',
    actionLabel: 'Baixar CSV',
    action: downloadAdminSubmissionsCsv,
  },
]

const formJourneyCards = [
  {
    title: 'Jovens da dan\u00e7a',
    description: 'Identifica\u00e7\u00e3o, territ\u00f3rio, pr\u00e1tica, custos e conte\u00fados do setor jovem.',
    outputs: 'Painel / PDF / Excel',
  },
  {
    title: 'Profissionais da dan\u00e7a',
    description: 'Atua\u00e7\u00e3o profissional, renda, custos, forma\u00e7\u00e3o e editais.',
    outputs: 'Painel / PDF / Excel / Power BI',
  },
  {
    title: 'Institui\u00e7\u00f5es da dan\u00e7a',
    description: 'Estrutura, equipe, territ\u00f3rio, p\u00fablico atendido e gest\u00e3o.',
    outputs: 'Painel / PDF / Excel / Power BI',
  },
  {
    title: 'Leitura nacional consolidada',
    description: 'Leitura conjunta dos tr\u00eas setores do Banco Nacional de Dados da Dan\u00e7a.',
    outputs: 'Painel / PDF / XLSX / CSV',
  },
] as const

const internalFlowRows = [
  {
    stage: 'Cadastro recebido',
    detail: 'O formul\u00e1rio entra na base com protocolo e data de envio.',
    use: 'Acompanhamento do dia a dia.',
  },
  {
    stage: 'Ficha individual',
    detail: 'Cada protocolo fica dispon\u00edvel para leitura completa.',
    use: 'Confer\u00eancia, atendimento e revis\u00e3o.',
  },
  {
    stage: 'Planilha da base',
    detail: 'A base sai organizada em linhas e colunas para estudo, confer\u00eancia e cruzamento.',
    use: 'Excel, cruzamentos e relat\u00f3rios.',
  },
  {
    stage: 'Arquivo para BI',
    detail: 'Os recortes saem prontos para dashboards, Power BI e leitura anal\u00edtica.',
    use: 'Leitura anal\u00edtica e apresenta\u00e7\u00f5es.',
  },
  {
    stage: 'Material externo',
    detail: 'A ONG escolhe o recorte que pode ser compartilhado sem expor dados pessoais.',
    use: 'Reuni\u00f5es, parceiros e apresenta\u00e7\u00f5es.',
  },
] as const

const sharingRows = [
  {
    material: 'Fichas completas e dados pessoais',
    use: 'Consulta interna por protocolo.',
    sharing: 'Ficam no ambiente interno da ONG.',
  },
  {
    material: 'Base completa em planilhas',
    use: 'Cruzamentos, estudos internos e relat\u00f3rios da equipe.',
    sharing: 'Sai apenas em recortes preparados pela ONG.',
  },
  {
    material: 'Indicadores gerais',
    use: 'Diretoria, reuni\u00f5es e apresenta\u00e7\u00f5es.',
    sharing: 'Pode sair em materiais sem dados pessoais.',
  },
  {
    material: 'Arquivos para Power BI e dashboards',
    use: 'Dashboards, BI e leitura anal\u00edtica.',
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
              <th>A\u00e7\u00e3o</th>
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
  const [isLoading, setIsLoading] = useState(true)

  const stateTopList = useMemo(
    () => [...stateSummary].sort((left, right) => right.totalSubmissions - left.totalSubmissions).slice(0, 8),
    [stateSummary],
  )

  useEffect(() => {
    async function loadData() {
      setError('')
      setIsLoading(true)

      try {
        const bootstrap = await getAdminBootstrap()
        setOverview(bootstrap.overview)
        setDashboard(bootstrap.dashboard)
        setSectorSummary(bootstrap.sectorSummary)
        setStateSummary(bootstrap.stateSummary)
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'N\u00e3o foi poss\u00edvel carregar a \u00e1rea de dados.',
        )
      } finally {
        setIsLoading(false)
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
      setError(downloadError instanceof Error ? downloadError.message : 'N\u00e3o foi poss\u00edvel gerar o arquivo.')
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
        label: 'Cadastros dispon\u00edveis',
        value: overview ? formatNumber(overview.totalResponses) : '-',
        detail: 'Base pronta para consulta e exporta\u00e7\u00e3o.',
      },
      {
        label: 'Presen\u00e7a territorial',
        value: formatNumber(stateSummary.filter((item) => item.totalSubmissions > 0).length),
        detail: 'Estados e Distrito Federal com registros.',
      },
      {
        label: '\u00daltimo envio recebido',
        value: latestRecordAt ? formatBackendDateTime(latestRecordAt) : 'Sem registro',
        detail: 'Cadastro mais recente da base.',
      },
      {
        label: 'Frentes reunidas',
        value: sectorSummary.length ? `${sectorSummary.length}/3` : '-',
        detail: 'Jovens, profissionais e institui\u00e7\u00f5es.',
      },
    ],
    [latestRecordAt, overview, sectorSummary.length, stateSummary],
  )

  const hasBaseData = (overview?.totalResponses ?? 0) > 0

  return (
    <div className="admin-page-content">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Dados</p>
          <h2>Base nacional, leituras e arquivos de trabalho</h2>
          <p className="admin-page-subtitle">
            Tudo o que entra pelos formul\u00e1rios passa para a base, aparece no painel e pode sair
            em planilha, PDF, CSV e BI.
          </p>
        </div>
      </header>

      {error ? <Card className="admin-alert admin-alert-error">{error}</Card> : null}

      {isLoading ? (
        <section className="admin-section-grid">
          <AdminZeroState
            className="admin-panel-card-full"
            eyebrow="Carregando a base"
            title="A base interna está sendo organizada para a equipe"
            description="O sistema está reunindo a visão geral, a leitura territorial e os arquivos de trabalho desta área. Assim que a resposta chegar, a base aparece completa neste painel."
            items={[
              'Os dados entram pelo formulário, passam pelo backend e chegam nesta área.',
              'As tabelas, leituras e exportações abrem assim que o carregamento termina.',
              'Se o backend saiu de repouso no Render, a primeira abertura pode levar um pouco mais.',
            ]}
          />
        </section>
      ) : null}

      <section className="admin-grid">
        <Card className="admin-metric-card">
          <span className="eyebrow">Base total</span>
          <strong>{isLoading ? '...' : overview ? formatNumber(overview.totalResponses) : '-'}</strong>
          <p className="card-text">Cadastros na base.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Jovens</span>
          <strong>{isLoading ? '...' : overview ? formatNumber(overview.totalYouth) : '-'}</strong>
          <p className="card-text">Registros da frente jovem.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Profissionais</span>
          <strong>{isLoading ? '...' : overview ? formatNumber(overview.totalProfessionals) : '-'}</strong>
          <p className="card-text">Registros da frente profissional.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Institui\u00e7\u00f5es</span>
          <strong>{isLoading ? '...' : overview ? formatNumber(overview.totalInstitutions) : '-'}</strong>
          <p className="card-text">Registros de escolas, grupos e projetos.</p>
        </Card>
      </section>

      <section className="admin-section-grid">
        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Controle da base</p>
              <h2>Leitura atual da base</h2>
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
              <h2>Como os formul\u00e1rios alimentam a base</h2>
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

      {!isLoading && !hasBaseData ? (
        <section className="admin-section-grid">
          <AdminZeroState
            className="admin-panel-card-full"
            eyebrow="Leituras e arquivos"
            title="Os relat\u00f3rios come\u00e7am quando a base receber os primeiros cadastros"
            description="A \u00e1rea de dados j\u00e1 est\u00e1 pronta para organizar os protocolos, montar planilhas, PDFs, CSVs e recortes para BI. Como esta base nova ainda est\u00e1 vazia, os indicadores e arquivos ser\u00e3o preenchidos conforme os formul\u00e1rios forem enviados."
            items={[
              'Cada cadastro passa a aparecer na base, nas tabelas e nos recortes do painel.',
              'As sa\u00eddas em PDF, Excel, CSV e BI refletem exatamente os protocolos recebidos.',
              'A equipe pode usar esta \u00e1rea para acompanhar a entrada dos primeiros registros.',
            ]}
          />
        </section>
      ) : null}

      {!isLoading && hasBaseData ? (
        <>
      <section className="admin-section-grid">
        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Perfis</p>
              <h2>Distribui\u00e7\u00e3o por frente</h2>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Perfil</th>
                  <th>Total</th>
                  <th>Estados</th>
                  <th>\u00daltimo registro</th>
                </tr>
              </thead>
              <tbody>
                {sectorSummary.map((item) => (
                  <tr key={item.sector}>
                    <td>{item.sectorLabel}</td>
                    <td>{formatNumber(item.totalSubmissions)}</td>
                    <td>{formatNumber(item.totalStates)}</td>
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
              <p className="eyebrow">Territ\u00f3rio</p>
              <h2>Distribui\u00e7\u00e3o por estado</h2>
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
                  <th>Institui\u00e7\u00f5es</th>
                </tr>
              </thead>
              <tbody>
                {stateTopList.map((item) => (
                  <tr key={item.stateCode}>
                    <td>{item.stateCode}</td>
                    <td>{formatNumber(item.totalSubmissions)}</td>
                    <td>{formatNumber(item.totalYouth)}</td>
                    <td>{formatNumber(item.totalProfessionals)}</td>
                    <td>{formatNumber(item.totalInstitutions)}</td>
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
              <h2>Leituras centrais da base</h2>
            </div>
          </div>

          <div className="admin-kpi-grid admin-kpi-grid-wide">
            <div className="admin-kpi-card">
              <span className="admin-kpi-label">Modalidade em destaque</span>
              <strong>{topModality.label}</strong>
              <span className="admin-kpi-value">{topModality.value}</span>
            </div>

            <div className="admin-kpi-card">
              <span className="admin-kpi-label">Faixa et\u00e1ria em destaque</span>
              <strong>{topAgeRange.label}</strong>
              <span className="admin-kpi-value">{topAgeRange.value}</span>
            </div>

            <div className="admin-kpi-card">
              <span className="admin-kpi-label">G\u00eanero em destaque</span>
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
          title="Arquivos completos do Banco Nacional de Dados da Dan\u00e7a"
          rows={completeDownloadRows}
          onDownload={handleDownload}
        />

        <DownloadTable
          eyebrow="Indicadores"
          title="Arquivos para an\u00e1lises, dashboards e apresenta\u00e7\u00f5es"
          rows={statisticsDownloadRows}
          onDownload={handleDownload}
        />
      </section>

      <section className="admin-section-stack">
        <DownloadTable
          eyebrow="Opera\u00e7\u00e3o"
          title="Arquivos do dia a dia"
          rows={operationalDownloadRows}
          onDownload={handleDownload}
        />
        </section>
        </>
      ) : null}

      <section className="admin-section-stack">
        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Fluxo da equipe</p>
              <h2>Do formul\u00e1rio ao arquivo</h2>
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
              <p className="eyebrow">Sa\u00edda da base</p>
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
              <h2>Onde a equipe usa esses arquivos</h2>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Canal</th>
                  <th>Situa\u00e7\u00e3o</th>
                  <th>Uso principal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Painel interno da ONG</td>
                  <td>Ativo</td>
                  <td>Acompanhamento da equipe, leitura da base e consulta di\u00e1ria.</td>
                </tr>
                <tr>
                  <td>PDFs e relat\u00f3rios</td>
                  <td>Dispon\u00edvel</td>
                  <td>Leitura institucional, reuni\u00f5es, conselhos e apresenta\u00e7\u00f5es.</td>
                </tr>
                <tr>
                  <td>Excel, CSV e Power BI</td>
                  <td>Dispon\u00edvel</td>
                  <td>Cruzamentos, dashboards, recortes e aprofundamento anal\u00edtico.</td>
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
