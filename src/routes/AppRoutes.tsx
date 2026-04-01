import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'

const HomePage = lazy(() => import('../pages/HomePage'))
const StatisticsPage = lazy(() => import('../pages/StatisticsPage'))
const SectorFormPage = lazy(() => import('../pages/SectorFormPage'))

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="page-shell" style={{ padding: '2rem' }}>Carregando página...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/estatisticas-nacionais" element={<StatisticsPage />} />
        <Route path="/formulario/:sector" element={<SectorFormPage />} />
      </Routes>
    </Suspense>
  )
}
