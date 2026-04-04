import { useMemo } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { AccessFloatingMenu } from '../components/AccessFloatingMenu'

const sectorRouteMap = {
  jovens: 'minor-flow',
  profissionais: 'adult-flow',
  instituicoes: 'institution-flow',
} as const

type SectorSlug = keyof typeof sectorRouteMap

export default function SectorFormPage() {
  const { sector } = useParams<{ sector: string }>()
  const navigate = useNavigate()

  const initialView = useMemo(() => {
    if (!sector) return null
    return sectorRouteMap[sector as SectorSlug] ?? null
  }, [sector])

  if (!initialView) {
    return <Navigate to="/" replace />
  }

  return <AccessFloatingMenu open initialView={initialView} onClose={() => navigate('/', { replace: true })} />
}
