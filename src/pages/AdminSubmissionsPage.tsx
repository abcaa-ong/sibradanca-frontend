import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminZeroState } from '../components/AdminZeroState'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { getAdminOverview, getAdminSubmissions } from '../services/admin.service'
import type {
  AdminInsightsOverviewResponse,
  AdminSubmissionSummaryResponse,
} from '../types/admin'
import { formatBackendDateTime } from '../utils/backend-date'

function formatSector(value: string) {
  if (value === 'YOUTH') return 'Jovens'
  if (value === 'PROFESSIONAL') return 'Profissionais'
  if (value === 'INSTITUTION') return 'Instituições'
  return value
}

export default function AdminSubmissionsPage() {
  const navigate = useNavigate()
  const [overview, setOverview] = useState<AdminInsightsOverviewResponse | null>(null)
  const [submissions, setSubmissions] = useState<AdminSubmissionSummaryResponse[]>([])
  const [protocolFilter, setProtocolFilter] = useState('')
  const [sectorFilter, setSectorFilter] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function loadData(nextProtocol = protocolFilter, nextSector = sectorFilter) {
    setError('')
    setIsLoading(true)

    try {
      const [overviewData, submissionsData] = await Promise.all([
        getAdminOverview(),
        getAdminSubmissions({
          limit: 30,
          protocol: nextProtocol || undefined,
          sector: nextSector || undefined,
        }),
      ])

      setOverview(overviewData)
      setSubmissions(submissionsData)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os cadastros.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void loadData()
  }

  function handleClear() {
    setProtocolFilter('')
    setSectorFilter('')
    void loadData('', '')
  }

  const hasAnySubmission = submissions.length > 0
  const hasActiveFilters = Boolean(protocolFilter || sectorFilter)

  return (
    <div className="admin-page-content">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Cadastros</p>
          <h2>Registros da base</h2>
          <p className="admin-page-subtitle">Busca, consulta e abertura de ficha.</p>
        </div>
      </header>

      {error ? <Card className="admin-alert admin-alert-error">{error}</Card> : null}

      <section className="admin-grid">
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

        <Card className="admin-metric-card">
          <span className="eyebrow">Total</span>
          <strong>{overview?.totalResponses ?? '-'}</strong>
        </Card>
      </section>

      <section className="admin-section-grid">
        <Card className="admin-panel-card admin-panel-card-full">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Busca</p>
              <h2>Buscar cadastros</h2>
            </div>
          </div>

          <form className="admin-filter-bar" onSubmit={handleSearch}>
            <label className="admin-filter-field">
              <span>Protocolo</span>
              <input
                value={protocolFilter}
                onChange={(event) => setProtocolFilter(event.target.value)}
                placeholder="Ex.: SIB-ABC12345"
              />
            </label>

            <label className="admin-filter-field">
              <span>Perfil</span>
              <select value={sectorFilter} onChange={(event) => setSectorFilter(event.target.value)}>
                <option value="">Todos</option>
                <option value="YOUTH">Jovens</option>
                <option value="PROFESSIONAL">Profissionais</option>
                <option value="INSTITUTION">Instituições</option>
              </select>
            </label>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Carregando...' : 'Buscar'}
            </Button>

            <Button type="button" variant="outline" onClick={handleClear}>
              Limpar
            </Button>
          </form>

          {hasAnySubmission ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Protocolo</th>
                    <th>Perfil</th>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Telefone</th>
                    <th>Cidade</th>
                    <th>UF</th>
                    <th>Data</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((item) => (
                    <tr key={item.protocol}>
                      <td>{item.protocol}</td>
                      <td>{formatSector(item.sector)}</td>
                      <td>{item.subjectName}</td>
                      <td>{item.email || '-'}</td>
                      <td>{item.phone || '-'}</td>
                      <td>{item.city || '-'}</td>
                      <td>{item.state || '-'}</td>
                      <td>{formatBackendDateTime(item.submittedAt)}</td>
                      <td>
                        <div className="admin-table-actions">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(`/painel-interno/cadastros/${item.protocol}`)}
                          >
                            Ver ficha
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {!hasAnySubmission && !isLoading && !hasActiveFilters ? (
            <AdminZeroState
              eyebrow="Cadastros"
              title="Nenhum protocolo entrou nesta base ainda"
              description="Assim que os formulários começarem a ser enviados, os protocolos aparecem aqui para consulta individual, conferência e abertura de ficha."
              items={[
                'Jovens, profissionais e instituições entram nesta mesma base.',
                'Cada envio gera protocolo, ficha completa e data de recebimento.',
                'Os filtros passam a funcionar conforme os primeiros registros entram.',
              ]}
            />
          ) : null}

          {!hasAnySubmission && !isLoading && hasActiveFilters ? (
            <p className="admin-empty-state">Nenhum cadastro encontrado para os filtros informados.</p>
          ) : null}
        </Card>
      </section>
    </div>
  )
}
