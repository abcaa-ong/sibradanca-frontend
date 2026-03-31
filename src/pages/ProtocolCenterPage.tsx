import { useMemo, useState } from 'react'
import { ArrowLeft, KeyRound, MailSearch, RefreshCw, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { SectionTitle } from '../components/SectionTitle'
import {
  getInstitutionForm,
  getProfessionalForm,
  getYouthForm,
} from '../services/forms.service'
import { requestProtocolRecovery } from '../services/protocol-recovery.service'
import type {
  InstitutionFormResponse,
  ProfessionalFormResponse,
  YouthFormResponse,
} from '../types/forms'

type ProtocolSector = 'youth' | 'professional' | 'institution'
type ProtocolLookupResponse = YouthFormResponse | ProfessionalFormResponse | InstitutionFormResponse

const sectorOptions: { value: ProtocolSector; label: string }[] = [
  { value: 'youth', label: 'Jovens da Dança' },
  { value: 'professional', label: 'Profissionais da Dança' },
  { value: 'institution', label: 'Instituições da Dança' },
]

const hiddenFields = new Set([
  'respondentId',
  'institutionId',
  'protocol',
  'consentCode',
])

function formatLabel(key: string) {
  const withSpaces = key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .trim()

  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1)
}

function formatValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : '—'
  }

  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Não'
  }

  if (typeof value === 'string') {
    if (!value.trim()) return '—'

    if (/^\d{4}-\d{2}-\d{2}([tT ].*)?$/.test(value)) {
      const date = new Date(value)

      if (!Number.isNaN(date.getTime())) {
        return new Intl.DateTimeFormat('pt-BR', {
          dateStyle: 'medium',
          timeStyle: value.includes('T') ? 'short' : undefined,
        }).format(date)
      }
    }

    return value
  }

  if (value === null || value === undefined) {
    return '—'
  }

  return String(value)
}

async function loadFormBySector(sector: ProtocolSector, protocol: string) {
  if (sector === 'youth') {
    return getYouthForm(protocol)
  }

  if (sector === 'professional') {
    return getProfessionalForm(protocol)
  }

  return getInstitutionForm(protocol)
}

export default function ProtocolCenterPage() {
  const navigate = useNavigate()
  const [sector, setSector] = useState<ProtocolSector>('youth')
  const [protocol, setProtocol] = useState('')
  const [email, setEmail] = useState('')
  const [isLoadingLookup, setIsLoadingLookup] = useState(false)
  const [isLoadingRecovery, setIsLoadingRecovery] = useState(false)
  const [lookupError, setLookupError] = useState('')
  const [recoveryMessage, setRecoveryMessage] = useState('')
  const [lookupResult, setLookupResult] = useState<ProtocolLookupResponse | null>(null)

  const visibleEntries = useMemo(() => {
    if (!lookupResult) {
      return [] as Array<[string, unknown]>
    }

    return Object.entries(lookupResult).filter(([key]) => !hiddenFields.has(key))
  }, [lookupResult])

  const handleLookup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setLookupError('')
    setLookupResult(null)
    setIsLoadingLookup(true)

    try {
      const response = await loadFormBySector(sector, protocol.trim().toUpperCase())
      setLookupResult(response)
    } catch (error) {
      setLookupError(
        error instanceof Error ? error.message : 'Não foi possível consultar o protocolo.',
      )
    } finally {
      setIsLoadingLookup(false)
    }
  }

  const handleRecovery = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setRecoveryMessage('')
    setIsLoadingRecovery(true)

    try {
      const response = await requestProtocolRecovery({ email: email.trim() })
      setRecoveryMessage(
        response.status === 'requested'
          ? 'Solicitação registrada. Se existir protocolo para este e-mail, o backend enviará as orientações de recuperação.'
          : 'Solicitação enviada com sucesso.',
      )
    } catch (error) {
      setRecoveryMessage(
        error instanceof Error ? error.message : 'Não foi possível solicitar a recuperação.',
      )
    } finally {
      setIsLoadingRecovery(false)
    }
  }

  return (
    <div className="page-shell protocol-page-shell">
      <main className="protocol-page-main">
        <section className="section-space">
          <div className="container protocol-page-header">
            <Button variant="outline" onClick={() => navigate('/') }>
              <ArrowLeft size={16} /> Voltar para a Home
            </Button>

            <SectionTitle
              badge="Protocolo e recuperação"
              title="Acompanhe um cadastro já enviado"
              description="Consulte um protocolo por setor e veja o status real . Também é possível solicitar a recuperação do protocolo por e-mail."
            />
          </div>
        </section>

        <section className="section-space protocol-page-section">
          <div className="container protocol-page-grid">
            <Card className="protocol-card">
              <div className="protocol-card-heading">
                <div className="icon-wrap access-icon">
                  <Search size={20} />
                </div>
                <div>
                  <h2>Consultar protocolo</h2>
                  <p>Consulta direta do formulário escolhido.</p>
                </div>
              </div>

              <form className="protocol-form" onSubmit={handleLookup}>
                <label className="access-field">
                  <span>Setor</span>
                  <select value={sector} onChange={(event) => setSector(event.target.value as ProtocolSector)}>
                    {sectorOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="access-field">
                  <span>Protocolo</span>
                  <input
                    type="text"
                    value={protocol}
                    onChange={(event) => setProtocol(event.target.value)}
                    placeholder="Ex: SIB-AB12CD34"
                  />
                </label>

                <Button type="submit" large disabled={isLoadingLookup || !protocol.trim()}>
                  {isLoadingLookup ? <RefreshCw size={16} className="spin-icon" /> : <Search size={16} />}
                  {isLoadingLookup ? 'Consultando...' : 'Consultar agora'}
                </Button>
              </form>

              {lookupError ? <p className="protocol-feedback protocol-feedback--error">{lookupError}</p> : null}
            </Card>

            <Card className="protocol-card">
              <div className="protocol-card-heading">
                <div className="icon-wrap access-icon">
                  <MailSearch size={20} />
                </div>
                <div>
                  <h2>Recuperar protocolo por e-mail</h2>
                </div>
              </div>

              <form className="protocol-form" onSubmit={handleRecovery}>
                <label className="access-field">
                  <span>E-mail</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="seuemail@exemplo.com"
                  />
                </label>

                <Button type="submit" large disabled={isLoadingRecovery || !email.trim()}>
                  {isLoadingRecovery ? <RefreshCw size={16} className="spin-icon" /> : <KeyRound size={16} />}
                  {isLoadingRecovery ? 'Solicitando...' : 'Solicitar recuperação'}
                </Button>
              </form>

              {recoveryMessage ? <p className="protocol-feedback">{recoveryMessage}</p> : null}
            </Card>
          </div>
        </section>

        {lookupResult ? (
          <section className="section-space protocol-page-section">
            <div className="container">
              <Card className="protocol-result-card">
                <div className="protocol-result-header">
                  <div>
                    <p className="eyebrow">Resultado carregado do backend</p>
                    <h3>{lookupResult.protocol}</h3>
                  </div>
                  <div className="protocol-status-pill">
                    <strong>{lookupResult.canUpdate ? 'Atualização liberada' : 'Aguardando janela de 6 meses'}</strong>
                    <small>
                      Próxima atualização: {formatValue(lookupResult.nextUpdateAvailableAt)}
                    </small>
                  </div>
                </div>

                <div className="protocol-result-grid">
                  {visibleEntries.map(([key, value]) => (
                    <div key={key} className="protocol-result-item">
                      <span>{formatLabel(key)}</span>
                      <strong>{formatValue(value)}</strong>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  )
}
