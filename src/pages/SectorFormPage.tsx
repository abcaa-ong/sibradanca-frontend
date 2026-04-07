import { useMemo, useRef } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { AccessFloatingMenu } from '../components/AccessFloatingMenu'
import { Seo } from '../components/Seo'
import { useCleanUiTextTree } from '../hooks/useCleanUiTextTree'

const sectorRouteMap = {
  jovens: 'minor-flow',
  profissionais: 'adult-flow',
  instituicoes: 'institution-flow',
} as const

type SectorSlug = keyof typeof sectorRouteMap

export default function SectorFormPage() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const { sector } = useParams<{ sector: string }>()
  const navigate = useNavigate()
  useCleanUiTextTree(rootRef, [sector])

  const initialView = useMemo(() => {
    if (!sector) return null
    return sectorRouteMap[sector as SectorSlug] ?? null
  }, [sector])

  const pageTitle = useMemo(() => {
    switch (sector) {
      case 'jovens':
        return 'Formulário para jovens da dança'
      case 'profissionais':
        return 'Formulário para profissionais da dança'
      case 'instituicoes':
        return 'Formulário para instituições da dança'
      default:
        return 'Formulários do SIBRADANÇA'
    }
  }, [sector])

  if (!initialView) {
    return <Navigate to="/" replace />
  }

  return (
    <div ref={rootRef}>
      <Seo
        title={pageTitle}
        description="Área de preenchimento dos formulários públicos do SIBRADANÇA para o Banco Nacional de Dados da Dança do Brasil."
        robots="noindex,nofollow"
      />
      <AccessFloatingMenu
        open
        initialView={initialView}
        onClose={() => navigate('/', { replace: true })}
      />
    </div>
  )
}
