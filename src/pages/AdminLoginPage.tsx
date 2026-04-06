import { FormEvent, useEffect, useState } from 'react'
import { LockKeyhole } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Seo } from '../components/Seo'
import {
  clearAdminCredentials,
  hasAdminSession,
  saveAdminCredentials,
} from '../services/admin-auth.service'
import { getAdminBootstrap } from '../services/admin.service'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (hasAdminSession()) {
      navigate('/painel-interno/dashboard', { replace: true })
    }
  }, [navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      saveAdminCredentials({ username, password })
      await getAdminBootstrap()
      navigate('/painel-interno/dashboard', { replace: true })
    } catch (submitError) {
      clearAdminCredentials()
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Não foi possível entrar na central administrativa.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="admin-shell">
      <Seo
        title="Acesso ao painel interno"
        description="Login da área interna do SIBRADANÇA para a equipe da ONG."
        robots="noindex,nofollow"
      />
      <div className="admin-container admin-login-container">
        <Card className="admin-login-card">
          <div className="admin-login-icon">
            <LockKeyhole size={24} />
          </div>
          <p className="eyebrow">Central administrativa</p>
          <h1>Área restrita da ONG</h1>
          <p className="card-text">Entre com as credenciais do painel interno.</p>

          <form className="admin-login-form" onSubmit={handleSubmit}>
            <label className="admin-field">
              <span>Usuário</span>
              <input
                value={username}
                placeholder="Ex: ong.admin"
                onChange={(event) => setUsername(event.target.value)}
              />
            </label>

            <label className="admin-field">
              <span>Senha</span>
              <input
                type="password"
                value={password}
                placeholder="Digite sua senha"
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {error ? <p className="admin-error">{error}</p> : null}

            <Button type="submit" large disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
