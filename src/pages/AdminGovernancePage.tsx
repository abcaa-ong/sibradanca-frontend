import { useEffect, useState } from 'react'
import { Card } from '../components/Card'
import { getAdminOverview, getBackendHealthStatus } from '../services/admin.service'
import type { AdminInsightsOverviewResponse, BackendHealthStatusResponse } from '../types/admin'

const serviceStatus = [
  ['Backend', 'Ativo', 'API principal do sistema'],
  ['Banco de dados', 'Conectado', 'Base única do projeto'],
  ['Exportações', 'Disponíveis', 'PDF, CSV e Excel'],
  ['Credenciais', 'Controladas', 'Acesso interno por perfil'],
  ['Análise de dados', 'Disponível', 'Base pronta para BI'],
] as const

const adminModules = [
  {
    title: 'Ambiente',
    text: 'Saúde do backend, banco e rotinas do sistema.',
  },
  {
    title: 'Segurança',
    text: 'Permissões, credenciais e uso do ambiente interno.',
  },
  {
    title: 'Suporte',
    text: 'Incidentes, manutenção e apoio para a equipe.',
  },
  {
    title: 'Integrações',
    text: 'Arquivos, BI e conexões com outras ferramentas.',
  },
] as const

export default function AdminGovernancePage() {
  const [health, setHealth] = useState<BackendHealthStatusResponse | null>(null)
  const [overview, setOverview] = useState<AdminInsightsOverviewResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      setError('')

      try {
        const overviewData = await getAdminOverview()

        setOverview(overviewData)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar a administração.')
      }

      try {
        const healthData = await getBackendHealthStatus()
        setHealth(healthData)
      } catch {
        setHealth({ status: 'Sem resposta' })
      }
    }

    void loadData()
  }, [])

  return (
    <div className="admin-page-content">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Administração</p>
          <h2>Sistema, suporte e ambiente</h2>
          <p className="admin-page-subtitle">
            Esta área acompanha o funcionamento do sistema e o apoio interno da ONG.
          </p>
        </div>
      </header>

      {error ? <Card className="admin-alert admin-alert-error">{error}</Card> : null}

      <section className="admin-grid">
        <Card className="admin-metric-card">
          <span className="eyebrow">Backend</span>
          <strong>{health?.status ?? '-'}</strong>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Base principal</span>
          <strong>{overview?.totalResponses ?? '-'}</strong>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Perfis internos</span>
          <strong>5</strong>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Formatos ativos</span>
          <strong>4</strong>
          <p className="card-text">PDF, CSV, XLSX e base para BI.</p>
        </Card>
      </section>

      <section className="admin-section-grid">
        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Módulos</p>
              <h2>Frentes da administração</h2>
            </div>
          </div>

          <div className="admin-governance-grid">
            {adminModules.map((item) => (
              <div key={item.title} className="admin-governance-card">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Rotina</p>
              <h2>Uso esperado desta área</h2>
            </div>
          </div>

          <ul className="admin-purpose-list">
            <li>Controlar acessos internos e permissões.</li>
            <li>Acompanhar a saúde do sistema.</li>
            <li>Organizar suporte e manutenção.</li>
            <li>Garantir que as exportações e integrações estejam disponíveis.</li>
          </ul>
        </Card>
      </section>

      <section className="admin-section-grid">
        <Card className="admin-panel-card admin-panel-card-full">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Serviços</p>
              <h2>Situação atual do ambiente</h2>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Serviço</th>
                  <th>Situação</th>
                  <th>Uso</th>
                </tr>
              </thead>
              <tbody>
                {serviceStatus.map(([service, status, usage]) => (
                  <tr key={service}>
                    <td>{service}</td>
                    <td>{status}</td>
                    <td>{usage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  )
}
