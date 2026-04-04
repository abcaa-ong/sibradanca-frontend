import { useEffect, useMemo, useState } from 'react'
import { Card } from '../components/Card'
import { getAdminAudit, getBackendHealthStatus } from '../services/admin.service'
import type { AdminAuditLogResponse, BackendHealthStatusResponse } from '../types/admin'

const roles = [
  ['Gestao', 'Indicadores e relatorios'],
  ['Operacao', 'Cadastros e protocolos'],
  ['Auditoria', 'Historico e conferencia'],
  ['Dados', 'Planilhas e cruzamentos'],
  ['Administracao', 'Contas e permissoes'],
] as const

const controls = [
  ['Autenticacao', 'Ativa'],
  ['Auditoria', 'Ativa'],
  ['Permissoes', 'Restritas'],
  ['Recuperacao', 'Em configuracao'],
] as const

function formatDateTime(value: string | null) {
  if (!value) {
    return '-'
  }

  return new Date(value).toLocaleString('pt-BR')
}

export default function AdminAccessHubPage() {
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogResponse[]>([])
  const [health, setHealth] = useState<BackendHealthStatusResponse | null>(null)
  const [error, setError] = useState('')

  const recentAudit = useMemo(() => auditLogs.slice(0, 8), [auditLogs])
  const lastAudit = recentAudit[0]?.createdAt ?? null

  useEffect(() => {
    async function loadData() {
      setError('')

      try {
        const auditData = await getAdminAudit()
        setAuditLogs(auditData)
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Nao foi possivel carregar a area de acessos.',
        )
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
      <header className="admin-page-header admin-page-header-compact">
        <div>
          <p className="eyebrow">Acessos</p>
          <h2>Seguranca e auditoria</h2>
          <p className="admin-page-subtitle">
            Contas internas, permissoes e historico operacional.
          </p>
        </div>
      </header>

      {error ? <Card className="admin-alert admin-alert-error">{error}</Card> : null}

      <section className="admin-grid">
        <Card className="admin-metric-card">
          <span className="eyebrow">Ambiente</span>
          <strong>{health?.status ?? '-'}</strong>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Auditorias</span>
          <strong>{auditLogs.length}</strong>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Ultimo registro</span>
          <strong>{formatDateTime(lastAudit)}</strong>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Acesso interno</span>
          <strong>Ativo</strong>
        </Card>
      </section>

      <section className="admin-section-grid">
        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Perfis</p>
              <h2>Perfis de acesso</h2>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Perfil</th>
                  <th>Escopo</th>
                </tr>
              </thead>
              <tbody>
                {roles.map(([role, usage]) => (
                  <tr key={role}>
                    <td>{role}</td>
                    <td>{usage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Controles</p>
              <h2>Estado dos controles</h2>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Controle</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {controls.map(([label, status]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    <td>{status}</td>
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
              <p className="eyebrow">Auditoria</p>
              <h2>Historico recente</h2>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Acao</th>
                  <th>Ator</th>
                  <th>Alvo</th>
                  <th>Detalhe</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {recentAudit.map((item, index) => (
                  <tr key={`${item.targetKey}-${index}`}>
                    <td>{item.action}</td>
                    <td>{item.actor}</td>
                    <td>{item.targetKey}</td>
                    <td>{item.details}</td>
                    <td>{formatDateTime(item.createdAt)}</td>
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
