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
    scope: 'PDF com resumo e seções completas de cada cadastro',
    actionLabel: 'Baixar PDF',
    action: downloadAdminSubmissionsDetailedPdf,
  },
  {
    title: 'Base interna em camadas',
    format: 'XLSX',
    scope: 'Abas para visão ONG, base nominal, camadas e perfis',
    actionLabel: 'Baixar Excel',
    action: downloadAdminSubmissionsDetailedXlsx,
  },
  {
    title: 'Base interna em camadas',
    format: 'CSV',
    scope: 'Campos por seção, em linhas próprias para leitura e BI',
    actionLabel: 'Baixar CSV',
    action: downloadAdminSubmissionsDetailedCsv,
  },
]

const statisticsDownloadRows: DownloadRow[] = [
  {
    title: 'Relatório analítico',
    format: 'PDF',
    scope: 'Resumo executivo e blocos analíticos por categoria',
    actionLabel: 'Baixar PDF',
    action: downloadAdminStatisticsPdf,
  },
  {
    title: 'Indicadores analíticos',
    format: 'XLSX',
    scope: 'Leitura executiva, filtros, base BI e abas temáticas',
    actionLabel: 'Baixar Excel',
    action: downloadAdminStatisticsXlsx,
  },
  {
    title: 'Base estatística BI',
    format: 'CSV',
    scope: 'Camada, categoria, indicador e recorte para integração',
    actionLabel: 'Baixar CSV',
    action: downloadAdminStatisticsCsv,
  },
]

const operationalDownloadRows: DownloadRow[] = [
  {
    title: 'Cadastros operacionais',
    format: 'XLSX',
    scope: 'Consulta nominal resumida por protocolo',
    actionLabel: 'Baixar Excel',
    action: downloadAdminSubmissionsXlsx,
  },
  {
    title: 'Cadastros operacionais',
    format: 'CSV',
    scope: 'Consulta nominal resumida por protocolo',
    actionLabel: 'Baixar CSV',
    action: downloadAdminSubmissionsCsv,
  },
]

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
              <th>Escopo</th>
              <th>Ação</th>
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
        label: 'Registros consolidados',
        value: overview ? formatNumber(overview.totalResponses) : '-',
        detail: 'Volume nominal já validado pelo backend e disponível para consulta interna.',
      },
      {
        label: 'UFs com presença',
        value: formatNumber(stateSummary.filter((item) => item.totalSubmissions > 0).length),
        detail: 'Cobertura territorial rastreada pela camada estatística.',
      },
      {
        label: 'Último registro',
        value: latestRecordAt ? formatBackendDateTime(latestRecordAt) : 'Sem registro',
        detail: 'Horário mais recente encontrado nos resumos territoriais.',
      },
      {
        label: 'Perfis monitorados',
        value: sectorSummary.length ? `${sectorSummary.length}/3` : '-',
        detail: 'Jovens, profissionais e instituições acompanhados na leitura interna.',
      },
    ],
    [latestRecordAt, overview, sectorSummary.length, stateSummary],
  )

  const datasetLayers = [
    {
      title: 'Visão ONG',
      description: 'Camada executiva para coordenação, leitura rápida e acompanhamento institucional.',
      outputs: 'PDF / XLSX',
    },
    {
      title: 'Base nominal',
      description: 'Protocolos e identificação organizada para consulta operacional e auditoria.',
      outputs: 'XLSX / CSV',
    },
    {
      title: 'Base em camadas',
      description: 'Seção, campo e valor separados por estrutura do formulário para BI e revisão.',
      outputs: 'XLSX / CSV',
    },
    {
      title: 'Indicadores BI',
      description: 'Recortes analíticos prontos para Power BI, planilhas internas e leitura estatística.',
      outputs: 'PDF / XLSX / CSV',
    },
  ] as const

  return (
    <div className="admin-page-content">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Dados</p>
          <h2>Central analítica e de exportação</h2>
          <p className="admin-page-subtitle">
            Governança da base, recortes estatísticos e arquivos organizados para operação e BI.
          </p>
        </div>
      </header>

      {error ? <Card className="admin-alert admin-alert-error">{error}</Card> : null}

      <section className="admin-grid">
        <Card className="admin-metric-card">
          <span className="eyebrow">Total de cadastros</span>
          <strong>{overview?.totalResponses ?? '-'}</strong>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Jovens</span>
          <strong>{overview?.totalYouth ?? '-'}</strong>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Profissionais</span>
          <strong>{overview?.totalProfessionals ?? '-'}</strong>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Instituições</span>
          <strong>{overview?.totalInstitutions ?? '-'}</strong>
        </Card>
      </section>

      <section className="admin-section-grid">
        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Governança</p>
              <h2>Controle da base</h2>
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
              <p className="eyebrow">Camadas</p>
              <h2>Arquitetura dos arquivos</h2>
            </div>
          </div>

          <div className="admin-manifest-grid">
            {datasetLayers.map((item) => (
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
              <p className="eyebrow">Mesa analítica</p>
              <h2>Destaques para gestão e BI</h2>
            </div>
          </div>

          <div className="admin-kpi-grid admin-kpi-grid-wide">
            <div className="admin-kpi-card">
              <span className="admin-kpi-label">Modalidade</span>
              <strong>{topModality.label}</strong>
              <span className="admin-kpi-value">{topModality.value}</span>
            </div>

            <div className="admin-kpi-card">
              <span className="admin-kpi-label">Faixa etária</span>
              <strong>{topAgeRange.label}</strong>
              <span className="admin-kpi-value">{topAgeRange.value}</span>
            </div>

            <div className="admin-kpi-card">
              <span className="admin-kpi-label">Gênero</span>
              <strong>{topGender.label}</strong>
              <span className="admin-kpi-value">{topGender.value}</span>
            </div>

            <div className="admin-kpi-card">
              <span className="admin-kpi-label">Editais</span>
              <strong>{topPublicCall.label}</strong>
              <span className="admin-kpi-value">{topPublicCall.value}</span>
            </div>
          </div>
        </Card>
      </section>

      <section className="admin-section-stack">
        <DownloadTable
          eyebrow="Base interna"
          title="Arquivos completos da base"
          rows={completeDownloadRows}
          onDownload={handleDownload}
        />

        <DownloadTable
          eyebrow="Indicadores"
          title="Arquivos estatísticos"
          rows={statisticsDownloadRows}
          onDownload={handleDownload}
        />
      </section>

      <section className="admin-section-stack">
        <DownloadTable
          eyebrow="Operação"
          title="Arquivos operacionais"
          rows={operationalDownloadRows}
          onDownload={handleDownload}
        />

        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Integrações</p>
              <h2>Canais de leitura e consumo</h2>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Canal</th>
                  <th>Status</th>
                  <th>Base</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Dashboard interno</td>
                  <td>Ativo</td>
                  <td>Leitura executiva e operacional</td>
                </tr>
                <tr>
                  <td>Power BI</td>
                  <td>Disponível</td>
                  <td>CSV estatístico e base em camadas</td>
                </tr>
                <tr>
                  <td>Planilhas internas</td>
                  <td>Disponível</td>
                  <td>XLSX e CSV</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  )
}
