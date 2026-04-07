import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { ChartPanel } from '../components/ChartPanel'
import { MetricCard } from '../components/MetricCard'
import { getAdminBootstrap } from '../services/admin.service'
import type {
  AdminBiStateSummaryResponse,
  AdminInsightsDashboardResponse,
  AdminInsightsOverviewResponse,
} from '../types/admin'
import type { ChartItem } from '../types/statistics'
import { formatBackendDateTime } from '../utils/backend-date'
import { cleanUiText as t } from '../utils/ui-text'

const workAreas = [
  {
    title: 'Cadastros',
    audience: 'Consulta da base',
    description: 'Protocolos, fichas completas e consulta individual de cada resposta.',
    route: '/painel-interno/cadastros',
    actionLabel: 'Abrir cadastros',
    outputs: ['Protocolos', 'Fichas completas', 'Atualizações'],
  },
  {
    title: 'Dados e análises',
    audience: 'Leitura nacional',
    description: 'Indicadores por perfil, território, modalidades e recortes da base.',
    route: '/painel-interno/dados',
    actionLabel: 'Abrir dados',
    outputs: ['Indicadores', 'Território', 'Tabelas'],
  },
  {
    title: 'Exportações',
    audience: 'Saídas da base',
    description: 'Planilhas, PDFs e arquivos de apoio para a rotina da equipe.',
    route: '/painel-interno/exportacoes',
    actionLabel: 'Abrir exportações',
    outputs: ['PDF', 'Excel', 'CSV', 'BI'],
  },
  {
    title: 'Segurança e LGPD',
    audience: 'Proteção do ambiente',
    description: 'Acessos, histórico e regras do ambiente interno da ONG.',
    route: '/painel-interno/acessos',
    actionLabel: 'Abrir segurança',
    outputs: ['Acessos', 'Histórico', 'LGPD'],
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
  return items?.find((item) => t(item.name) === t(label))?.value ?? 0
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
        const bootstrap = await getAdminBootstrap()
        setOverview(bootstrap.overview)
        setDashboard(bootstrap.dashboard)
        setStateSummary(bootstrap.stateSummary)
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Não foi possível carregar o painel interno.',
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
      { name: 'Instituições', value: overview?.totalInstitutions ?? 0 },
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
    const familyFinanced = findChartValue(details.financingDistribution, 'Família')
    const publicCallParticipants = findChartValue(details.publicCallsParticipation, 'Já participou')
    const institutionsWithCnpj = findChartValue(details.institutionIndicators, 'Com CNPJ')
    const aboveOneMinimumWage =
      sumChartValues(details.incomeDistribution) - findChartValue(details.incomeDistribution, 'Até 1 SM')

    return [
      buildMetricCard(
        'Profissionais acima de 1 salário mínimo',
        aboveOneMinimumWage,
        professionals,
        'profissionais',
      ),
      buildMetricCard('Custeados pela família', familyFinanced, professionals, 'profissionais'),
      buildMetricCard('Instituições com CNPJ', institutionsWithCnpj, institutions, 'instituições'),
      buildMetricCard('Participação em editais', publicCallParticipants, professionals, 'profissionais'),
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
        detail: `${formatPercent(activeStates.length, 27)} do território nacional já aparece na base.`,
      },
      {
        label: 'Setores com registros',
        value: `${sectorDistribution.filter((item) => item.value > 0).length}/3`,
        detail: 'Jovens, profissionais e instituições já estão reunidos na base.',
      },
      {
        label: 'Último cadastro',
        value: latestSubmission ? formatBackendDateTime(latestSubmission) : 'Sem registro',
        detail: 'Registro mais recente recebido pelo sistema.',
      },
      {
        label: 'UF com maior presença',
        value: topState ? `${topState.stateCode} (${formatNumber(topState.totalSubmissions)})` : 'Sem registro',
        detail: `${formatNumber(totalResponses)} cadastros já compõem a leitura atual da base.`,
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
        label: 'Faixa etária em destaque',
        value: ageLeader ? `${t(ageLeader.name)} (${formatNumber(ageLeader.value)})` : 'Sem leitura',
        detail: 'Faixa etária mais presente na leitura atual da base.',
      },
      {
        label: 'Identidade de gênero em destaque',
        value: genderLeader ? `${t(genderLeader.name)} (${formatNumber(genderLeader.value)})` : 'Sem leitura',
        detail: 'Recorte de identidade de gênero mais presente entre os registros disponíveis.',
      },
      {
        label: 'Modalidade em destaque',
        value: modalityLeader ? `${t(modalityLeader.name)} (${formatNumber(modalityLeader.value)})` : 'Sem leitura',
        detail: 'Modalidade mais recorrente entre os formulários.',
      },
      {
        label: 'Editais e apoio público',
        value: callLeader ? `${t(callLeader.name)} (${formatNumber(callLeader.value)})` : 'Sem leitura',
        detail: 'Leitura mais presente nos recortes ligados a editais e políticas públicas.',
      },
    ]
  }, [dashboard])

  const hasBaseData = (overview?.totalResponses ?? 0) > 0

  return (
    <div className="admin-page-content">
      <header className="admin-page-header admin-page-header-compact">
        <div>
          <p className="eyebrow">{t('Painel da ONG')}</p>
          <h2>{t('Banco Nacional de Dados da Dança do Brasil')}</h2>
          <p className="admin-page-subtitle">
            {t('Cadastros, leituras e arquivos de trabalho da equipe em um só ambiente.')}
          </p>
        </div>
      </header>

      {error ? <Card className="admin-alert admin-alert-error">{t(error)}</Card> : null}

      <section className="admin-grid">
        <Card className="admin-metric-card">
          <span className="eyebrow">{t('Base total')}</span>
          <strong>{isLoading ? '...' : overview ? formatNumber(overview.totalResponses) : '-'}</strong>
          <p className="card-text">{t('Cadastros disponíveis na base.')}</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">{t('Jovens')}</span>
          <strong>{isLoading ? '...' : overview ? formatNumber(overview.totalYouth) : '-'}</strong>
          <p className="card-text">{t('Frente jovem da dança.')}</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">{t('Profissionais')}</span>
          <strong>{isLoading ? '...' : overview ? formatNumber(overview.totalProfessionals) : '-'}</strong>
          <p className="card-text">{t('Frente profissional da dança.')}</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">{t('Instituições')}</span>
          <strong>{isLoading ? '...' : overview ? formatNumber(overview.totalInstitutions) : '-'}</strong>
          <p className="card-text">{t('Escolas, grupos, projetos e espaços.')}</p>
        </Card>
      </section>

      {isLoading ? <p className="admin-inline-note">{t('Atualizando os números da base...')}</p> : null}

      {!isLoading && !error && !hasBaseData ? (
        <p className="admin-inline-note">
          {t('Base nova. Os primeiros cadastros vão aparecer aqui assim que os formulários forem enviados.')}
        </p>
      ) : null}

      {!isLoading && !error && hasBaseData ? (
        <section className="admin-section-grid">
          <Card className="admin-panel-card">
            <div className="admin-panel-header">
              <div>
                <p className="eyebrow">{t('Base em operação')}</p>
                <h2>{t('Como a base está hoje')}</h2>
              </div>
            </div>

            <div className="admin-system-list">
              {operationalRows.map((item) => (
                <div key={item.label} className="admin-system-row">
                  <div>
                    <span className="admin-system-label">{t(item.label)}</span>
                    <p className="admin-system-detail">{t(item.detail)}</p>
                  </div>
                  <strong className="admin-system-value">{t(item.value)}</strong>
                </div>
              ))}
            </div>
          </Card>

          <Card className="admin-panel-card">
            <div className="admin-panel-header">
              <div>
                <p className="eyebrow">{t('Leitura nacional')}</p>
                <h2>{t('O que mais aparece na base')}</h2>
              </div>
            </div>

            <div className="admin-system-list">
              {executiveRows.map((item) => (
                <div key={item.label} className="admin-system-row">
                  <div>
                    <span className="admin-system-label">{t(item.label)}</span>
                    <p className="admin-system-detail">{t(item.detail)}</p>
                  </div>
                  <strong className="admin-system-value">{t(item.value)}</strong>
                </div>
              ))}
            </div>
          </Card>
        </section>
      ) : null}

      <section className="admin-section-grid">
        <Card className="admin-panel-card admin-panel-card-full">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">{t('Módulos do sistema')}</p>
              <h2>{t('Onde a equipe trabalha a base')}</h2>
            </div>
          </div>

          <div className="admin-module-grid">
            {workAreas.map((area) => (
              <div key={area.title} className="admin-module-card admin-module-card-system">
                <div className="admin-module-head">
                  <p className="admin-module-audience">{t(area.audience)}</p>
                  <span className="admin-status-chip">{t('Ativo')}</span>
                </div>
                <h3>{t(area.title)}</h3>
                <p>{t(area.description)}</p>
                <div className="admin-pill-list">
                  {area.outputs.map((item) => (
                    <span key={`${area.title}-${item}`} className="admin-pill">
                      {t(item)}
                    </span>
                  ))}
                </div>
                <div className="admin-card-action">
                  <Button onClick={() => navigate(area.route)}>{t(area.actionLabel)}</Button>
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
              emptyMessage="Carregando distribuição dos setores..."
              noDataMessage="Os gráficos começam a aparecer quando a base receber os primeiros protocolos."
            />

            <ChartPanel
              title="Participação por setor"
              data={sectorDistribution}
              type="pie"
              eyebrowLabel="Base atual"
              isLoading={isLoading}
              emptyMessage="Carregando participação dos setores..."
              noDataMessage="Os gráficos começam a aparecer quando a base receber os primeiros protocolos."
            />

            <ChartPanel
              title="Faixa etária"
              data={dashboard?.profile.ageDistribution ?? []}
              type="pie"
              eyebrowLabel="Pessoas"
              isLoading={isLoading}
              emptyMessage="Carregando faixa etária..."
              noDataMessage="Ainda não há cadastros suficientes para exibir este recorte."
            />

            <ChartPanel
              title="Identidade de gênero"
              data={dashboard?.profile.genderDistribution ?? []}
              type="pie"
              eyebrowLabel="Pessoas"
              isLoading={isLoading}
              emptyMessage="Carregando identidades de gênero..."
              noDataMessage="Ainda não há cadastros suficientes para exibir este recorte."
            />
          </section>

          <section className="statistics-chart-grid two-columns">
            <ChartPanel
              title="Modalidades em destaque"
              data={dashboard?.details.modalities ?? []}
              eyebrowLabel="Dança"
              isLoading={isLoading}
              emptyMessage="Carregando modalidades..."
              noDataMessage="As modalidades aparecem aqui assim que os primeiros formulários forem enviados."
            />

            <ChartPanel
              title="Estados com maior presença"
              data={topStates}
              eyebrowLabel="Território"
              isLoading={isLoading}
              emptyMessage="Carregando leitura territorial..."
              noDataMessage="A leitura territorial aparece aqui conforme a base começar a receber cadastros."
            />
          </section>
        </>
      ) : null}

      {hasBaseData && strategicMetrics.length ? (
        <section className="admin-section-grid">
          <Card className="admin-panel-card admin-panel-card-full">
            <div className="admin-panel-header">
              <div>
                <p className="eyebrow">{t('Indicadores rápidos')}</p>
                <h2>{t('Destaques da leitura nacional')}</h2>
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
              <p className="eyebrow">{t('Acesso rápido')}</p>
              <h2>{t('Entradas principais da equipe')}</h2>
            </div>
          </div>

          <div className="admin-quick-actions admin-quick-actions-inline">
            <Button onClick={() => navigate('/painel-interno/cadastros')}>{t('Abrir cadastros')}</Button>
            <Button variant="outline" onClick={() => navigate('/painel-interno/dados')}>
              {t('Abrir dados e análises')}
            </Button>
            <Button variant="outline" onClick={() => navigate('/painel-interno/exportacoes')}>
              {t('Abrir exportações')}
            </Button>
            <Button variant="outline" onClick={() => navigate('/painel-interno/acessos')}>
              {t('Abrir segurança e LGPD')}
            </Button>
          </div>
        </Card>
      </section>
    </div>
  )
}
