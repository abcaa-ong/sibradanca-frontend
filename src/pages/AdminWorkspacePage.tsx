import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { AdminZeroState } from '../components/AdminZeroState'
import { ChartPanel } from '../components/ChartPanel'
import { MetricCard } from '../components/MetricCard'
import {
  getAdminDashboard,
  getAdminOverview,
  getAdminStateSummary,
} from '../services/admin.service'
import type {
  AdminBiStateSummaryResponse,
  AdminInsightsDashboardResponse,
  AdminInsightsOverviewResponse,
} from '../types/admin'
import type { ChartItem } from '../types/statistics'
import { formatBackendDateTime } from '../utils/backend-date'

const workAreas = [
  {
    title: 'Cadastros',
    audience: 'Consulta da base',
    description: 'Protocolos, fichas completas e consulta individual de cada resposta.',
    route: '/painel-interno/cadastros',
    actionLabel: 'Abrir cadastros',
    outputs: ['Protocolos', 'Fichas completas', 'Atualiza\u00e7\u00f5es'],
  },
  {
    title: 'Dados e an\u00e1lises',
    audience: 'Leitura nacional',
    description:
      'Recortes por setor, territ\u00f3rio, modalidade, forma\u00e7\u00e3o, renda e pol\u00edticas p\u00fablicas.',
    route: '/painel-interno/dados',
    actionLabel: 'Abrir dados',
    outputs: ['Indicadores', 'Territ\u00f3rio', 'Tabelas'],
  },
  {
    title: 'Exporta\u00e7\u00f5es',
    audience: 'Sa\u00eddas da base',
    description: 'Arquivos em PDF, Excel e CSV para rotina da equipe, apresenta\u00e7\u00f5es e Power BI.',
    route: '/painel-interno/exportacoes',
    actionLabel: 'Abrir exporta\u00e7\u00f5es',
    outputs: ['PDF', 'Excel', 'CSV', 'BI'],
  },
  {
    title: 'Seguran\u00e7a e LGPD',
    audience: 'Prote\u00e7\u00e3o do ambiente',
    description:
      'Acessos, hist\u00f3rico de uso e regras para compartilhar recortes da base com seguran\u00e7a.',
    route: '/painel-interno/acessos',
    actionLabel: 'Abrir seguran\u00e7a',
    outputs: ['Acessos', 'Hist\u00f3rico', 'LGPD'],
  },
] as const

type MetricCardItem = {
  label: string
  percent: string
  detail: string
}

type SystemRow = {
  label: string
  value: string
  detail: string
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value)
}

function formatPercent(numerator: number, denominator: number) {
  if (!denominator) {
    return '0%'
  }

  return `${Math.round((numerator / denominator) * 100)}%`
}

function findChartValue(items: ChartItem[] | undefined, label: string) {
  return items?.find((item) => item.name === label)?.value ?? 0
}

function sumChartValues(items: ChartItem[] | undefined) {
  return (items ?? []).reduce((total, item) => total + item.value, 0)
}

function buildMetricCard(label: string, value: number, total: number, subject: string): MetricCardItem {
  return {
    label,
    percent: formatPercent(value, total),
    detail: `${formatNumber(value)} ${subject}.`,
  }
}

function getTopChartItem(items: ChartItem[] | undefined) {
  if (!items?.length) {
    return null
  }

  return [...items].sort((left, right) => right.value - left.value)[0]
}

export default function AdminWorkspacePage() {
  const navigate = useNavigate()
  const [overview, setOverview] = useState<AdminInsightsOverviewResponse | null>(null)
  const [dashboard, setDashboard] = useState<AdminInsightsDashboardResponse | null>(null)
  const [stateSummary, setStateSummary] = useState<AdminBiStateSummaryResponse[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setError('')
      setIsLoading(true)

      try {
        const [overviewData, dashboardData, stateData] = await Promise.all([
          getAdminOverview(),
          getAdminDashboard(),
          getAdminStateSummary(),
        ])

        setOverview(overviewData)
        setDashboard(dashboardData)
        setStateSummary(stateData)
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'N\u00e3o foi poss\u00edvel carregar o painel interno.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadData()
  }, [])

  const sectorDistribution = useMemo<ChartItem[]>(
    () => [
      { name: 'Jovens', value: overview?.totalYouth ?? 0 },
      { name: 'Profissionais', value: overview?.totalProfessionals ?? 0 },
      { name: 'Institui\u00e7\u00f5es', value: overview?.totalInstitutions ?? 0 },
    ],
    [overview],
  )

  const topStates = useMemo<ChartItem[]>(
    () =>
      [...stateSummary]
        .sort((left, right) => right.totalSubmissions - left.totalSubmissions)
        .slice(0, 6)
        .map((item) => ({
          name: item.stateCode,
          value: item.totalSubmissions,
        })),
    [stateSummary],
  )

  const strategicMetrics = useMemo<MetricCardItem[]>(() => {
    const details = dashboard?.details
    const currentOverview = overview

    if (!details || !currentOverview) {
      return []
    }

    const professionals = currentOverview.totalProfessionals
    const institutions = currentOverview.totalInstitutions
    const familyFinanced = findChartValue(details.financingDistribution, 'Fam\u00edlia')
    const publicCallParticipants = findChartValue(details.publicCallsParticipation, 'J\u00e1 participou')
    const institutionsWithCnpj = findChartValue(details.institutionIndicators, 'Com CNPJ')
    const aboveOneMinimumWage =
      sumChartValues(details.incomeDistribution) - findChartValue(details.incomeDistribution, 'At\u00e9 1 SM')

    return [
      buildMetricCard(
        'Profissionais acima de 1 sal\u00e1rio m\u00ednimo',
        aboveOneMinimumWage,
        professionals,
        'profissionais',
      ),
      buildMetricCard('Custeados pela fam\u00edlia', familyFinanced, professionals, 'profissionais'),
      buildMetricCard('Institui\u00e7\u00f5es com CNPJ', institutionsWithCnpj, institutions, 'institui\u00e7\u00f5es'),
      buildMetricCard('Participa\u00e7\u00e3o em editais', publicCallParticipants, professionals, 'profissionais'),
    ]
  }, [dashboard, overview])

  const operationalRows = useMemo<SystemRow[]>(() => {
    const totalResponses = overview?.totalResponses ?? 0
    const activeStates = stateSummary.filter((item) => item.totalSubmissions > 0)
    const topState = [...activeStates].sort((left, right) => right.totalSubmissions - left.totalSubmissions)[0]
    const latestSubmission = [...activeStates]
      .map((item) => item.lastSubmissionAt)
      .filter((value): value is string => Boolean(value))
      .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0]

    return [
      {
        label: 'Cobertura territorial',
        value: `${formatNumber(activeStates.length)} UFs`,
        detail: `${formatPercent(activeStates.length, 27)} do territ\u00f3rio nacional j\u00e1 aparece na base.`,
      },
      {
        label: 'Setores com registros',
        value: `${sectorDistribution.filter((item) => item.value > 0).length}/3`,
        detail: 'Jovens, profissionais e institui\u00e7\u00f5es j\u00e1 est\u00e3o reunidos na base.',
      },
      {
        label: '\u00daltimo cadastro',
        value: latestSubmission ? formatBackendDateTime(latestSubmission) : 'Sem registro',
        detail: 'Registro mais recente recebido pelo sistema.',
      },
      {
        label: 'UF com maior presen\u00e7a',
        value: topState ? `${topState.stateCode} (${formatNumber(topState.totalSubmissions)})` : 'Sem registro',
        detail: `${formatNumber(totalResponses)} cadastros j\u00e1 comp\u00f5em a leitura atual da base.`,
      },
    ]
  }, [overview, sectorDistribution, stateSummary])

  const executiveRows = useMemo<SystemRow[]>(() => {
    const ageLeader = getTopChartItem(dashboard?.profile.ageDistribution)
    const genderLeader = getTopChartItem(dashboard?.profile.genderDistribution)
    const modalityLeader = getTopChartItem(dashboard?.details.modalities)
    const callLeader = getTopChartItem(dashboard?.details.publicCallsParticipation)

    return [
      {
        label: 'Faixa et\u00e1ria em destaque',
        value: ageLeader ? `${ageLeader.name} (${formatNumber(ageLeader.value)})` : 'Sem leitura',
        detail: 'Faixa et\u00e1ria mais presente na leitura atual da base.',
      },
      {
        label: 'G\u00eanero em destaque',
        value: genderLeader ? `${genderLeader.name} (${formatNumber(genderLeader.value)})` : 'Sem leitura',
        detail: 'Recorte de g\u00eanero mais presente entre os registros dispon\u00edveis.',
      },
      {
        label: 'Modalidade em destaque',
        value: modalityLeader ? `${modalityLeader.name} (${formatNumber(modalityLeader.value)})` : 'Sem leitura',
        detail: 'Modalidade mais recorrente entre os formul\u00e1rios.',
      },
      {
        label: 'Editais e apoio p\u00fablico',
        value: callLeader ? `${callLeader.name} (${formatNumber(callLeader.value)})` : 'Sem leitura',
        detail: 'Leitura mais presente nos recortes ligados a editais e pol\u00edticas p\u00fablicas.',
      },
    ]
  }, [dashboard])

  const hasBaseData = (overview?.totalResponses ?? 0) > 0

  return (
    <div className="admin-page-content">
      <header className="admin-page-header admin-page-header-compact">
        <div>
          <p className="eyebrow">Painel da ONG</p>
          <h2>Banco Nacional de Dados da Dan\u00e7a do Brasil</h2>
          <p className="admin-page-subtitle">
            A ONG consulta os cadastros, acompanha a leitura nacional da base e prepara os
            arquivos institucionais em um \u00fanico ambiente.
          </p>
        </div>
      </header>

      {error ? <Card className="admin-alert admin-alert-error">{error}</Card> : null}

      <section className="admin-grid">
        <Card className="admin-metric-card">
          <span className="eyebrow">Base total</span>
          <strong>{overview ? formatNumber(overview.totalResponses) : '-'}</strong>
          <p className="card-text">Cadastros dispon\u00edveis na base.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Jovens</span>
          <strong>{overview ? formatNumber(overview.totalYouth) : '-'}</strong>
          <p className="card-text">Frente jovem da dan\u00e7a.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Profissionais</span>
          <strong>{overview ? formatNumber(overview.totalProfessionals) : '-'}</strong>
          <p className="card-text">Frente profissional da dan\u00e7a.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Institui\u00e7\u00f5es</span>
          <strong>{overview ? formatNumber(overview.totalInstitutions) : '-'}</strong>
          <p className="card-text">Escolas, grupos, projetos e espa\u00e7os.</p>
        </Card>
      </section>

      {!isLoading && !error && !hasBaseData ? (
        <section className="admin-section-grid">
          <AdminZeroState
            className="admin-panel-card-full"
            title="A nova base ainda n\u00e3o recebeu cadastros"
            description="O painel j\u00e1 est\u00e1 conectado ao banco novo, mas esta etapa ainda n\u00e3o recebeu formul\u00e1rios enviados. Assim que os primeiros protocolos entrarem, a leitura nacional come\u00e7a a aparecer aqui."
            items={[
              'Os formul\u00e1rios p\u00fablicos j\u00e1 alimentam esta base nova.',
              'As fichas completas aparecem conforme os cadastros entram.',
              'Gr\u00e1ficos, tabelas e exporta\u00e7\u00f5es passam a refletir os protocolos recebidos.',
            ]}
            note="Enquanto a base est\u00e1 vazia, a equipe ainda pode acessar os m\u00f3dulos do sistema e preparar a rotina de trabalho."
          />
        </section>
      ) : (
        <section className="admin-section-grid">
          <Card className="admin-panel-card">
            <div className="admin-panel-header">
              <div>
                <p className="eyebrow">Base em opera\u00e7\u00e3o</p>
                <h2>Como a base est\u00e1 hoje</h2>
              </div>
            </div>

            <div className="admin-system-list">
              {operationalRows.map((item) => (
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
                <p className="eyebrow">Leitura nacional</p>
                <h2>O que mais aparece na base</h2>
              </div>
            </div>

            <div className="admin-system-list">
              {executiveRows.map((item) => (
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
        </section>
      )}

      <section className="admin-section-grid">
        <Card className="admin-panel-card admin-panel-card-full">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">M\u00f3dulos do sistema</p>
              <h2>Onde a equipe trabalha a base</h2>
            </div>
          </div>

          <div className="admin-module-grid">
            {workAreas.map((area) => (
              <div key={area.title} className="admin-module-card admin-module-card-system">
                <div className="admin-module-head">
                  <p className="admin-module-audience">{area.audience}</p>
                  <span className="admin-status-chip">Ativo</span>
                </div>
                <h3>{area.title}</h3>
                <p>{area.description}</p>
                <div className="admin-pill-list">
                  {area.outputs.map((item) => (
                    <span key={`${area.title}-${item}`} className="admin-pill">
                      {item}
                    </span>
                  ))}
                </div>
                <div className="admin-card-action">
                  <Button onClick={() => navigate(area.route)}>{area.actionLabel}</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {hasBaseData ? (
        <>
          <section className="statistics-chart-grid two-columns">
            <ChartPanel
              title="Cadastros por setor"
              data={sectorDistribution}
              eyebrowLabel="Base atual"
              isLoading={isLoading}
              emptyMessage="Carregando distribui\u00e7\u00e3o dos setores..."
              noDataMessage="Os gr\u00e1ficos come\u00e7am a aparecer quando a base receber os primeiros protocolos."
            />

            <ChartPanel
              title="Participa\u00e7\u00e3o por setor"
              data={sectorDistribution}
              type="pie"
              eyebrowLabel="Base atual"
              isLoading={isLoading}
              emptyMessage="Carregando participa\u00e7\u00e3o dos setores..."
              noDataMessage="Os gr\u00e1ficos come\u00e7am a aparecer quando a base receber os primeiros protocolos."
            />

            <ChartPanel
              title="Faixa et\u00e1ria"
              data={dashboard?.profile.ageDistribution ?? []}
              type="pie"
              eyebrowLabel="Pessoas"
              isLoading={isLoading}
              emptyMessage="Carregando faixa et\u00e1ria..."
              noDataMessage="Ainda n\u00e3o h\u00e1 cadastros suficientes para exibir este recorte."
            />

            <ChartPanel
              title="G\u00eanero"
              data={dashboard?.profile.genderDistribution ?? []}
              type="pie"
              eyebrowLabel="Pessoas"
              isLoading={isLoading}
              emptyMessage="Carregando g\u00eanero..."
              noDataMessage="Ainda n\u00e3o h\u00e1 cadastros suficientes para exibir este recorte."
            />
          </section>

          <section className="statistics-chart-grid two-columns">
            <ChartPanel
              title="Modalidades em destaque"
              data={dashboard?.details.modalities ?? []}
              eyebrowLabel="Dan\u00e7a"
              isLoading={isLoading}
              emptyMessage="Carregando modalidades..."
              noDataMessage="As modalidades aparecem aqui assim que os primeiros formul\u00e1rios forem enviados."
            />

            <ChartPanel
              title="Estados com maior presen\u00e7a"
              data={topStates}
              eyebrowLabel="Territ\u00f3rio"
              isLoading={isLoading}
              emptyMessage="Carregando leitura territorial..."
              noDataMessage="A leitura territorial aparece aqui conforme a base come\u00e7ar a receber cadastros."
            />
          </section>
        </>
      ) : null}

      {hasBaseData && strategicMetrics.length ? (
        <section className="admin-section-grid">
          <Card className="admin-panel-card admin-panel-card-full">
            <div className="admin-panel-header">
              <div>
                <p className="eyebrow">Indicadores r\u00e1pidos</p>
                <h2>Destaques da leitura nacional</h2>
              </div>
            </div>

            <section className="statistics-metric-grid">
              {strategicMetrics.map((item) => (
                <MetricCard
                  key={item.label}
                  label={item.label}
                  percent={item.percent}
                  detail={item.detail}
                  eyebrowLabel="Base"
                />
              ))}
            </section>
          </Card>
        </section>
      ) : null}

      <section className="admin-section-grid">
        <Card className="admin-panel-card admin-panel-card-full">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Acesso r\u00e1pido</p>
              <h2>Entradas principais da equipe</h2>
            </div>
          </div>

          <div className="admin-quick-actions admin-quick-actions-inline">
            <Button onClick={() => navigate('/painel-interno/cadastros')}>Abrir cadastros</Button>
            <Button variant="outline" onClick={() => navigate('/painel-interno/dados')}>
              Abrir dados e an\u00e1lises
            </Button>
            <Button variant="outline" onClick={() => navigate('/painel-interno/exportacoes')}>
              Abrir exporta\u00e7\u00f5es
            </Button>
            <Button variant="outline" onClick={() => navigate('/painel-interno/acessos')}>
              Abrir seguran\u00e7a e LGPD
            </Button>
          </div>
        </Card>
      </section>
    </div>
  )
}
