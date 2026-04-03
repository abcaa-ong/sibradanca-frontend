import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const HomePage = lazy(() => import('../pages/HomePage'))
const SectorFormPage = lazy(() => import('../pages/SectorFormPage'))
const AdminLoginPage = lazy(() => import('../pages/AdminLoginPage'))
const AdminLayout = lazy(() => import('../components/AdminLayout'))
const AdminWorkspacePage = lazy(() => import('../pages/AdminWorkspacePage'))
const AdminSubmissionsPage = lazy(() => import('../pages/AdminSubmissionsPage'))
const AdminSubmissionDetailPage = lazy(() => import('../pages/AdminSubmissionDetailPage'))
const AdminDataHubPage = lazy(() => import('../pages/AdminDataHubPage'))
const AdminAccessHubPage = lazy(() => import('../pages/AdminAccessHubPage'))

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="page-shell" style={{ padding: '2rem' }}>Carregando página...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/formulario/:sector" element={<SectorFormPage />} />
        <Route path="/painel-interno/acesso" element={<AdminLoginPage />} />
        <Route path="/painel-interno" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminWorkspacePage />} />
          <Route path="cadastros" element={<AdminSubmissionsPage />} />
          <Route path="cadastros/:protocol" element={<AdminSubmissionDetailPage />} />
          <Route path="dados" element={<AdminDataHubPage />} />
          <Route path="acessos" element={<AdminAccessHubPage />} />
          <Route path="gestao" element={<Navigate to="../dados" replace />} />
          <Route path="usuarios" element={<Navigate to="../acessos" replace />} />
          <Route path="auditoria" element={<Navigate to="../acessos" replace />} />
          <Route path="relatorios" element={<Navigate to="../dados" replace />} />
          <Route path="administracao" element={<Navigate to="../acessos" replace />} />
          <Route path="sistema" element={<Navigate to="../acessos" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
