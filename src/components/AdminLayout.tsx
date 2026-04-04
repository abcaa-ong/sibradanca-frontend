import { BarChart3, Download, FileSpreadsheet, Home, LogOut, ShieldCheck } from 'lucide-react'
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { Button } from './Button'
import { clearAdminCredentials, hasAdminSession } from '../services/admin-auth.service'

const navSections = [
  {
    title: 'Banco Nacional da Dança do Brasil',
    items: [
      {
        to: '/painel-interno/dashboard',
        label: 'Visão geral',
        icon: Home,
      },
      {
        to: '/painel-interno/cadastros',
        label: 'Cadastros',
        icon: FileSpreadsheet,
      },
      {
        to: '/painel-interno/dados',
        label: 'Dados e análises',
        icon: BarChart3,
      },
      {
        to: '/painel-interno/exportacoes',
        label: 'Exportações',
        icon: Download,
      },
      {
        to: '/painel-interno/acessos',
        label: 'Segurança e LGPD',
        icon: ShieldCheck,
      },
    ],
  },
] as const

export default function AdminLayout() {
  const navigate = useNavigate()

  if (!hasAdminSession()) {
    return <Navigate to="/painel-interno/acesso" replace />
  }

  function handleLogout() {
    clearAdminCredentials()
    navigate('/painel-interno/acesso', { replace: true })
  }

  return (
    <div className="admin-app-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <p className="eyebrow">SIBRADANÇA</p>
          <h1>Painel interno da ONG</h1>
          <p className="admin-sidebar-text">
            Base nacional, análises, exportações e segurança reunidas em um único ambiente.
          </p>
        </div>

        <nav className="admin-sidebar-nav" aria-label="Navegação do painel interno">
          {navSections.map((section) => (
            <div key={section.title} className="admin-sidebar-group">
              <p className="admin-sidebar-group-title">{section.title}</p>

              {section.items.map((item) => {
                const Icon = item.icon

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      isActive ? 'admin-sidebar-link admin-sidebar-link-active' : 'admin-sidebar-link'
                    }
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <p className="admin-sidebar-footnote">Uso exclusivo da equipe da ONG.</p>

          <Button variant="outline" onClick={handleLogout}>
            <LogOut size={16} /> Sair
          </Button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-main-inner">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
