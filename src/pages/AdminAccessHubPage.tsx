import { useEffect, useMemo, useState } from 'react'
import { Card } from '../components/Card'
import { getAdminAudit, getBackendHealthStatus } from '../services/admin.service'
import type { AdminAuditLogResponse, BackendHealthStatusResponse } from '../types/admin'
import { formatBackendDateTime } from '../utils/backend-date'

const roles = [
  ['Coordenação da ONG', 'Visão geral, análises e decisões institucionais'],
  ['Equipe de operação', 'Cadastros, protocolos e acompanhamento da base'],
  ['Equipe de dados', 'Indicadores, cruzamentos e materiais para apresentação'],
  ['Controle interno', 'Rastreabilidade, conferência e histórico de uso'],
] as const

const controls = [
  ['Acesso ao painel', 'Restrito à equipe da ONG'],
  ['Exportações', 'Feitas apenas pela equipe interna'],
  ['Histórico de uso', 'Acompanhado no ambiente interno'],
  ['Compartilhamento externo', 'Sempre mediado pela ONG'],
] as const

const lgpdPrinciples = [
  'Dados pessoais e fichas individuais ficam apenas no ambiente interno da ONG.',
  'Parceiros e apoiadores não acessam o sistema administrativo.',
  'Quando necessário, a ONG exporta e compartilha apenas o recorte adequado para cada situação.',
  'Apresentações públicas e materiais externos devem priorizar números gerais e dados sem identificação pessoal.',
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
            : 'Não foi possível carregar a área de segurança.',
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
          <p className="eyebrow">Segurança e LGPD</p>
          <h2>Acessos, proteção da base e regras de compartilhamento</h2>
          <p className="admin-page-subtitle">
            Esta área deixa claro quem usa o sistema, o que permanece interno e como a ONG leva
            as informações para fora com segurança.
          </p>
        </div>
      </header>

      {error ? <Card className="admin-alert admin-alert-error">{error}</Card> : null}

      <section className="admin-grid">
        <Card className="admin-metric-card">
          <span className="eyebrow">Sistema</span>
          <strong>{health?.status ?? '-'}</strong>
          <p className="card-text">Situação atual do ambiente interno.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Uso interno</span>
          <strong>Exclusivo</strong>
          <p className="card-text">Acesso reservado à equipe da ONG.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Última movimentação</span>
          <strong>{formatBackendDateTime(lastAudit)}</strong>
          <p className="card-text">Registro mais recente no histórico do ambiente.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Compartilhamento externo</span>
          <strong>Mediado</strong>
          <p className="card-text">A ONG exporta e envia os recortes necessários.</p>
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
              <p className="eyebrow">LGPD na prática</p>
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
            <li>Montar relatórios, apresentações e materiais de decisão a partir dos recortes internos.</li>
            <li>Baixar arquivos adequados para uso institucional, parceiros e reuniões externas.</li>
            <li>Preservar as fichas completas e os dados pessoais apenas no ambiente restrito da ONG.</li>
          </ul>
        </Card>
      </section>

      <section className="admin-section-grid">
        <Card className="admin-panel-card admin-panel-card-full">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Histórico recente</p>
              <h2>Movimentações acompanhadas no ambiente interno</h2>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ação</th>
                  <th>Responsável</th>
                  <th>Área</th>
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
        </Card>
      </section>
    </div>
  )
}
