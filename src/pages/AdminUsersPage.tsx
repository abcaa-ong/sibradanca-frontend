import { Card } from '../components/Card'

const accessMatrix = [
  ['Gestor', 'Visao geral e relatorios', 'Ativo'],
  ['Operacao', 'Cadastros e protocolos', 'Ativo'],
  ['Auditoria', 'Historico e conformidade', 'Ativo'],
  ['Equipe de dados', 'Bases e exportacoes', 'Ativo'],
  ['Administrador', 'Acessos e sistema', 'Ativo'],
] as const

const accountRoutines = [
  {
    title: 'Contas internas',
    text: 'Cadastro das pessoas que entram no ambiente interno.',
  },
  {
    title: 'Permissoes',
    text: 'Definicao do que cada equipe pode ver, baixar ou alterar.',
  },
  {
    title: 'Senha',
    text: 'Troca de senha, recuperacao de acesso e bloqueio quando necessario.',
  },
  {
    title: 'Notificacoes',
    text: 'Mensagens internas, alertas e avisos de uso do sistema.',
  },
] as const

const accountStatus = [
  ['Contas internas', '5 perfis previstos'],
  ['Recuperacao de acesso', 'Disponivel'],
  ['Politica de senha', 'Ativa'],
  ['Alertas internos', 'Configuraveis'],
] as const

export default function AdminUsersPage() {
  return (
    <div className="admin-page-content">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Usuarios</p>
          <h2>Contas e acessos internos</h2>
          <p className="admin-page-subtitle">
            Esta area organiza quem entra no sistema e o que cada equipe pode fazer.
          </p>
        </div>
      </header>

      <section className="admin-grid">
        {accountStatus.map(([label, value]) => (
          <Card key={label} className="admin-metric-card">
            <span className="eyebrow">{label}</span>
            <strong>{value}</strong>
          </Card>
        ))}
      </section>

      <section className="admin-section-grid">
        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Rotinas</p>
              <h2>O que esta area concentra</h2>
            </div>
          </div>

          <div className="admin-governance-grid">
            {accountRoutines.map((item) => (
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
              <p className="eyebrow">Fluxos</p>
              <h2>Operacoes esperadas</h2>
            </div>
          </div>

          <ul className="admin-purpose-list">
            <li>Criar ou desativar acessos internos.</li>
            <li>Definir perfil e permissao por equipe.</li>
            <li>Recuperar acesso quando a conta for perdida.</li>
            <li>Centralizar avisos e notificacoes do ambiente.</li>
          </ul>
        </Card>
      </section>

      <section className="admin-section-grid">
        <Card className="admin-panel-card admin-panel-card-full">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Perfis</p>
              <h2>Matriz de acesso</h2>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Perfil</th>
                  <th>Uso principal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {accessMatrix.map(([role, scope, status]) => (
                  <tr key={role}>
                    <td>{role}</td>
                    <td>{scope}</td>
                    <td>{status}</td>
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
