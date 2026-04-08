import { useEffect, useMemo, useState } from 'react'
import { AdminZeroState } from '../components/AdminZeroState'
import { Card } from '../components/Card'
import { getAdminAudit, getBackendHealthStatus } from '../services/admin.service'
import type { AdminAuditLogResponse, BackendHealthStatusResponse } from '../types/admin'
import { formatBackendDateTime } from '../utils/backend-date'
import { cleanUiText as t } from '../utils/ui-text'

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
  'Solicitações de titulares devem ter canal oficial e resposta registrada.',
  'Incidentes com risco relevante precisam de avaliação e comunicação conforme a LGPD.',
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
          <p className="eyebrow">{t('Segurança e LGPD')}</p>
          <h2>{t('Acesso, proteção da base e compartilhamento')}</h2>
          <p className="admin-page-subtitle">
            {t(
              'Esta área mostra quem usa o sistema, o status do ambiente e as regras para manter a base protegida.',
            )}
          </p>
        </div>
      </header>

      {error ? <Card className="admin-alert admin-alert-error">{t(error)}</Card> : null}

      {isLoading ? (
        <section className="admin-section-grid">
          <AdminZeroState
            className="admin-panel-card-full"
            eyebrow="Carregando a área"
            title="A área de segurança está organizando os acessos mais recentes"
            description="Os registros internos e o status do ambiente estão sendo preparados para abrir esta tela."
          />
        </section>
      ) : null}

      <section className="admin-grid">
        <Card className="admin-metric-card">
          <span className="eyebrow">{t('Sistema')}</span>
          <strong>{isLoading ? '...' : t(health?.status ?? '-')}</strong>
          <p className="card-text">{t('Status do ambiente interno.')}</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">{t('Acesso')}</span>
          <strong>{t('Exclusivo')}</strong>
          <p className="card-text">{t('Uso reservado à equipe da ONG.')}</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">{t('Última movimentação')}</span>
          <strong>{isLoading ? '...' : formatBackendDateTime(lastAudit)}</strong>
          <p className="card-text">{t('Evento mais recente do ambiente.')}</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">{t('Compartilhamento')}</span>
          <strong>{t('Mediado')}</strong>
          <p className="card-text">{t('Recortes sempre preparados pela ONG.')}</p>
        </Card>
      </section>

      <section className="admin-section-grid">
        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">{t('Perfis de acesso')}</p>
              <h2>{t('Quem usa o painel')}</h2>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('Perfil')}</th>
                  <th>{t('Uso principal')}</th>
                </tr>
              </thead>
              <tbody>
                {roles.map(([role, usage]) => (
                  <tr key={role}>
                    <td>{t(role)}</td>
                    <td>{t(usage)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">{t('Regras do ambiente')}</p>
              <h2>{t('Como a base deve ser tratada')}</h2>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('Tema')}</th>
                  <th>{t('Diretriz')}</th>
                </tr>
              </thead>
              <tbody>
                {accessRules.map(([label, rule]) => (
                  <tr key={label}>
                    <td>{t(label)}</td>
                    <td>{t(rule)}</td>
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
              <p className="eyebrow">{t('LGPD')}</p>
              <h2>{t('O que fica interno e o que pode sair')}</h2>
            </div>
          </div>

          <ul className="admin-purpose-list">
            {lgpdItems.map((item) => (
              <li key={item}>{t(item)}</li>
            ))}
          </ul>
        </Card>

        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">{t('Histórico recente')}</p>
              <h2>{t('Movimentações do ambiente')}</h2>
            </div>
          </div>

          {recentAudit.length ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t('Ação')}</th>
                    <th>{t('Responsável')}</th>
                    <th>{t('Área')}</th>
                    <th>{t('Data')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAudit.map((item, index) => (
                    <tr key={`${item.targetKey}-${index}`}>
                      <td>{t(item.action)}</td>
                      <td>{t(item.actor)}</td>
                      <td>{t(item.targetKey)}</td>
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
