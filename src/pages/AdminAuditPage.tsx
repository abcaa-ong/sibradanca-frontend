import { useEffect, useState } from 'react'
import { Card } from '../components/Card'
import { getAdminAudit } from '../services/admin.service'
import type { AdminAuditLogResponse } from '../types/admin'
import { formatBackendDateTime } from '../utils/backend-date'

const auditFocus = [
  'Historico de movimentacoes internas da base',
  'Trilha de consulta para conferencias e revisoes',
  'Registro de eventos associados a protocolos e operacao',
  'Base de apoio para controle institucional e conformidade',
] as const

export default function AdminAuditPage() {
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogResponse[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      setError('')

      try {
        const auditData = await getAdminAudit()
        setAuditLogs(auditData)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar a auditoria.')
      }
    }

    void loadData()
  }, [])

  return (
    <div className="admin-page-content">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Auditoria e conformidade</p>
          <h2>Historico e rastreabilidade da base</h2>
          <p className="admin-page-subtitle">
            Area reservada para trilhas de verificacao, acompanhamento institucional e controle de movimentacoes da operacao interna.
          </p>
        </div>
      </header>

      {error ? <Card className="admin-alert admin-alert-error">{error}</Card> : null}

      <section className="admin-section-grid">
        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Finalidade</p>
              <h2>O que esta area acompanha</h2>
            </div>
          </div>

          <ul className="admin-purpose-list">
            {auditFocus.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>

        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Uso interno</p>
              <h2>Perfis que consultam esta camada</h2>
            </div>
          </div>

          <ul className="admin-purpose-list">
            <li><strong>Auditoria:</strong> rastreabilidade e verificacao de historicos.</li>
            <li><strong>Coordenacao:</strong> acompanhamento institucional e governanca.</li>
            <li><strong>Operacao:</strong> conferencia de eventos ligados aos registros.</li>
            <li><strong>Suporte:</strong> apoio na investigacao de ocorrencias e inconsistencias.</li>
          </ul>
        </Card>
      </section>

      <section className="admin-section-grid">
        <Card className="admin-panel-card admin-panel-card-full">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Historico recente</p>
              <h2>Eventos acompanhados no ambiente interno</h2>
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
                {auditLogs.map((item, index) => (
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
