import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import AdminAccessHubPage from '../pages/AdminAccessHubPage'
import AdminDataHubPage from '../pages/AdminDataHubPage'
import AdminExportsPage from '../pages/AdminExportsPage'
import AdminLoginPage from '../pages/AdminLoginPage'
import AdminSubmissionDetailPage from '../pages/AdminSubmissionDetailPage'
import AdminSubmissionsPage from '../pages/AdminSubmissionsPage'
import AdminWorkspacePage from '../pages/AdminWorkspacePage'
import HomePage from '../pages/HomePage'
import SectorFormPage from '../pages/SectorFormPage'
import StatisticsPage from '../pages/StatisticsPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/estatisticas" element={<StatisticsPage />} />
      <Route path="/estatisticas-nacionais" element={<StatisticsPage />} />
      <Route path="/formulario/:sector" element={<SectorFormPage />} />
      <Route path="/painel-interno/acesso" element={<AdminLoginPage />} />
      <Route path="/painel-interno" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminWorkspacePage />} />
        <Route path="cadastros" element={<AdminSubmissionsPage />} />
        <Route path="cadastros/:protocol" element={<AdminSubmissionDetailPage />} />
        <Route path="dados" element={<AdminDataHubPage />} />
        <Route path="exportacoes" element={<AdminExportsPage />} />
        <Route path="acessos" element={<AdminAccessHubPage />} />
        <Route path="gestao" element={<Navigate to="../dashboard" replace />} />
        <Route path="usuarios" element={<Navigate to="../acessos" replace />} />
        <Route path="auditoria" element={<Navigate to="../acessos" replace />} />
        <Route path="relatorios" element={<Navigate to="../exportacoes" replace />} />
        <Route path="administracao" element={<Navigate to="../acessos" replace />} />
        <Route path="sistema" element={<Navigate to="../dashboard" replace />} />
      </Route>
    </Routes>
  )
}
