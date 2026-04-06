import { useEffect, useMemo, useState } from 'react'
import { AdminZeroState } from '../components/AdminZeroState'
import { Card } from '../components/Card'
import { getAdminAudit, getBackendHealthStatus } from '../services/admin.service'
import type { AdminAuditLogResponse, BackendHealthStatusResponse } from '../types/admin'
import { formatBackendDateTime } from '../utils/backend-date'

const roles = [
  ['Coordena\u00e7\u00e3o da ONG', 'Vis\u00e3o geral e decis\u00f5es institucionais'],
  ['Equipe de opera\u00e7\u00e3o', 'Cadastros, protocolos e base'],
  ['Equipe de dados', 'Indicadores, cruzamentos e materiais'],
  ['Controle interno', 'Confer\u00eancia e hist\u00f3rico de uso'],
] as const

const controls = [
  ['Acesso ao painel', 'Restrito \u00e0 equipe da ONG'],
  ['Exporta\u00e7\u00f5es', 'Feitas apenas pela equipe interna'],
  ['Hist\u00f3rico de uso', 'Acompanhado no ambiente interno'],
  ['Compartilhamento externo', 'Sempre mediado pela ONG'],
] as const

const lgpdPrinciples = [
  'Dados pessoais e fichas individuais ficam apenas no ambiente interno da ONG.',
  'Parceiros e apoiadores n\u00e3o acessam o sistema administrativo.',
  'A ONG exporta e compartilha apenas o recorte adequado.',
  'Materiais externos usam n\u00fameros gerais, sem identifica\u00e7\u00e3o pessoal.',
] as const

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
            : 'N\u00e3o foi poss\u00edvel carregar a \u00e1rea de seguran\u00e7a.',
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
          <p className="eyebrow">Seguran\u00e7a e LGPD</p>
          <h2>Acessos, prote\u00e7\u00e3o da base e regras de compartilhamento</h2>
          <p className="admin-page-subtitle">
            Quem acessa o sistema, o que fica interno e como a ONG compartilha a base com seguran\u00e7a.
          </p>
        </div>
      </header>

      {error ? <Card className="admin-alert admin-alert-error">{error}</Card> : null}

      <section className="admin-grid">
        <Card className="admin-metric-card">
          <span className="eyebrow">Sistema</span>
          <strong>{health?.status ?? '-'}</strong>
          <p className="card-text">Status do ambiente interno.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Uso interno</span>
          <strong>Exclusivo</strong>
          <p className="card-text">Acesso reservado \u00e0 ONG.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">\u00daltima movimenta\u00e7\u00e3o</span>
          <strong>{formatBackendDateTime(lastAudit)}</strong>
          <p className="card-text">Registro mais recente do ambiente.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Compartilhamento externo</span>
          <strong>Mediado</strong>
          <p className="card-text">A ONG exporta os recortes necess\u00e1rios.</p>
        </Card>
      </section>

      <section className="admin-section-grid">
        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Quem usa o sistema</p>
              <h2>Perfis de acesso da equipe</h2>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Perfil</th>
                  <th>Uso principal</th>
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
              <p className="eyebrow">Regras do ambiente</p>
              <h2>Como a base deve ser tratada</h2>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tema</th>
                  <th>Diretriz</th>
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
        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">LGPD na pr\u00e1tica</p>
              <h2>O que fica interno e o que pode sair</h2>
            </div>
          </div>

          <ul className="admin-purpose-list">
            {lgpdPrinciples.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>

        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Rotina da ONG</p>
              <h2>Fluxo esperado de uso</h2>
            </div>
          </div>

          <ul className="admin-purpose-list">
            <li>Acompanhar os cadastros e consultar a base completa dentro do sistema.</li>
            <li>Montar relat\u00f3rios e materiais de decis\u00e3o a partir dos recortes internos.</li>
            <li>Baixar arquivos adequados para uso institucional e reuni\u00f5es externas.</li>
            <li>Preservar fichas completas e dados pessoais no ambiente restrito da ONG.</li>
          </ul>
        </Card>
      </section>

      <section className="admin-section-grid">
        <Card className="admin-panel-card admin-panel-card-full">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Hist\u00f3rico recente</p>
              <h2>Movimenta\u00e7\u00f5es acompanhadas no ambiente interno</h2>
            </div>
          </div>

          {recentAudit.length ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>A\u00e7\u00e3o</th>
                    <th>Respons\u00e1vel</th>
                    <th>\u00c1rea</th>
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
                      <td>{formatBackendDateTime(item.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <AdminZeroState
              eyebrow="Hist\u00f3rico recente"
              title="Ainda n\u00e3o h\u00e1 movimenta\u00e7\u00f5es registradas nesta base"
              description="O hist\u00f3rico de uso come\u00e7a a aparecer quando a equipe acessa o ambiente, consulta fichas e trabalha os primeiros protocolos."
              items={[
                'As a\u00e7\u00f5es administrativas passam a ser registradas conforme o uso do sistema.',
                'O acompanhamento ajuda a equipe a revisar acessos, consultas e rotinas internas.',
              ]}
            />
          )}
        </Card>
      </section>
    </div>
  )
}
