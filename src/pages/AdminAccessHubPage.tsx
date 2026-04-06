import { useEffect, useMemo, useState } from 'react'
import { AdminZeroState } from '../components/AdminZeroState'
import { Card } from '../components/Card'
import { getAdminAudit, getBackendHealthStatus } from '../services/admin.service'
import type { AdminAuditLogResponse, BackendHealthStatusResponse } from '../types/admin'
import { formatBackendDateTime } from '../utils/backend-date'

const roles = [
  ['Coordenação da ONG', 'Visão geral e decisões institucionais'],
  ['Operação', 'Cadastros, protocolos e conferência diária'],
  ['Dados', 'Indicadores, cruzamentos e materiais analíticos'],
  ['Controle interno', 'Histórico de uso, acessos e rastreabilidade'],
] as const

const accessRules = [
  ['Painel interno', 'Acesso restrito à equipe da ONG.'],
  ['Exportações', 'Geradas apenas dentro do ambiente administrativo.'],
  ['Dados pessoais', 'Permanecem no ambiente interno.'],
  ['Materiais externos', 'Saem apenas em recortes preparados pela ONG.'],
] as const

const lgpdItems = [
  'Fichas completas e dados nominais ficam internos.',
  'Parceiros não acessam o painel administrativo.',
  'A ONG define o recorte antes de qualquer compartilhamento.',
  'Materiais externos usam números gerais, sem identificação pessoal.',
] as const

export default function AdminAccessHubPage() {
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogResponse[]>([])
  const [health, setHealth] = useState<BackendHealthStatusResponse | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const recentAudit = useMemo(() => auditLogs.slice(0, 8), [auditLogs])
  const lastAudit = recentAudit[0]?.createdAt ?? null

  useEffect(() => {
    async function loadData() {
      setError('')
      setIsLoading(true)

      const [auditResult, healthResult] = await Promise.allSettled([
        getAdminAudit(),
        getBackendHealthStatus(),
      ])

      if (auditResult.status === 'fulfilled') {
        setAuditLogs(auditResult.value)
      } else {
        setError(
          auditResult.reason instanceof Error
            ? auditResult.reason.message
            : 'Não foi possível carregar a área de segurança.',
        )
      }

      if (healthResult.status === 'fulfilled') {
        setHealth(healthResult.value)
      } else {
        setHealth({ status: 'Sem resposta' })
      }

      setIsLoading(false)
    }

    void loadData()
  }, [])

  return (
    <div className="admin-page-content">
      <header className="admin-page-header admin-page-header-compact">
        <div>
          <p className="eyebrow">Segurança e LGPD</p>
          <h2>Acesso, proteção da base e compartilhamento</h2>
          <p className="admin-page-subtitle">
            Esta área mostra quem usa o sistema, o status do ambiente e as regras para manter a
            base protegida.
          </p>
        </div>
      </header>

      {error ? <Card className="admin-alert admin-alert-error">{error}</Card> : null}

      {isLoading ? (
        <section className="admin-section-grid">
          <AdminZeroState
            className="admin-panel-card-full"
            eyebrow="Carregando a área"
            title="A área de segurança está reunindo acessos e status do ambiente"
            description="O sistema está consultando o histórico recente e a saúde do backend para abrir esta tela com a leitura mais atual."
            items={[
              'Quando o backend sai de repouso, a primeira consulta pode demorar um pouco mais.',
            ]}
          />
        </section>
      ) : null}

      <section className="admin-grid">
        <Card className="admin-metric-card">
          <span className="eyebrow">Sistema</span>
          <strong>{isLoading ? '...' : health?.status ?? '-'}</strong>
          <p className="card-text">Status do ambiente interno.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Acesso</span>
          <strong>Exclusivo</strong>
          <p className="card-text">Uso reservado à equipe da ONG.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Última movimentação</span>
          <strong>{isLoading ? '...' : formatBackendDateTime(lastAudit)}</strong>
          <p className="card-text">Evento mais recente do ambiente.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Compartilhamento</span>
          <strong>Mediado</strong>
          <p className="card-text">Recortes sempre preparados pela ONG.</p>
        </Card>
      </section>

      <section className="admin-section-grid">
        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Perfis de acesso</p>
              <h2>Quem usa o painel</h2>
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
                {accessRules.map(([label, rule]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    <td>{rule}</td>
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
              <p className="eyebrow">LGPD</p>
              <h2>O que fica interno e o que pode sair</h2>
            </div>
          </div>

          <ul className="admin-purpose-list">
            {lgpdItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>

        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Histórico recente</p>
              <h2>Movimentações do ambiente</h2>
            </div>
          </div>

          {recentAudit.length ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ação</th>
                    <th>Responsável</th>
                    <th>Área</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAudit.map((item, index) => (
                    <tr key={`${item.targetKey}-${index}`}>
                      <td>{item.action}</td>
                      <td>{item.actor}</td>
                      <td>{item.targetKey}</td>
                      <td>{formatBackendDateTime(item.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <AdminZeroState
              eyebrow="Histórico"
              title="Ainda não há movimentações registradas nesta base"
              description="O histórico passa a aparecer quando a equipe consulta fichas, abre módulos e trabalha os primeiros protocolos."
              items={['As ações administrativas são registradas conforme o uso do sistema.']}
            />
          )}
        </Card>
      </section>
    </div>
  )
}
