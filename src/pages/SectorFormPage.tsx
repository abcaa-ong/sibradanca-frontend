import { useMemo } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { AccessFloatingMenu } from '../components/AccessFloatingMenu'
import { Seo } from '../components/Seo'

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

  const pageTitle = useMemo(() => {
    switch (sector) {
      case 'jovens':
        return 'Formul\u00e1rio para jovens da dan\u00e7a'
      case 'profissionais':
        return 'Formul\u00e1rio para profissionais da dan\u00e7a'
      case 'instituicoes':
        return 'Formul\u00e1rio para institui\u00e7\u00f5es da dan\u00e7a'
      default:
        return 'Formul\u00e1rios do SIBRADAN\u00c7A'
    }
  }, [sector])

  if (!initialView) {
    return <Navigate to="/" replace />
  }

  return (
    <>
      <Seo
        title={pageTitle}
        description="\u00c1rea de preenchimento dos formul\u00e1rios p\u00fablicos do SIBRADAN\u00c7A para o Banco Nacional de Dados da Dan\u00e7a do Brasil."
        robots="noindex,nofollow"
      />
      <AccessFloatingMenu
        open
        initialView={initialView}
        onClose={() => navigate('/', { replace: true })}
      />
    </>
  )
}
