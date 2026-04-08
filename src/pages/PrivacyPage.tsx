import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, House, Instagram, Mail, Menu, ShieldCheck, X } from 'lucide-react'
import { Link } from 'react-router-dom'

import logo from '../assets/logo-sibradanca.png'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import { Seo } from '../components/Seo'
import { SectionTitle } from '../components/SectionTitle'
import { useCleanUiTextTree } from '../hooks/useCleanUiTextTree'
import { getPublicPrivacyConfig } from '../services/reference.service'
import type { PublicPrivacyConfigResponse } from '../types/reference'

const dataGroups = [
  'Identificacao e contato informados pela propria pessoa ou instituicao.',
  'Territorio, data de nascimento, trajetoria na danca e respostas sobre pratica, renda e estrutura.',
  'Dados nominais usados para protocolo, atualizacao, contato autorizado e leitura interna da ONG.',
] as const

const publicLimits = [
  'Dados nominais, emails, telefones, CPF e CNPJ completos nao entram na leitura publica.',
  'Recortes muito pequenos podem ser protegidos para reduzir risco de reidentificacao.',
  'Exportacoes nominais e fichas completas ficam restritas ao ambiente interno da ONG.',
] as const

const holderRights = [
  'Confirmar se existe tratamento de dados pessoais.',
  'Solicitar acesso, correcao, bloqueio, eliminacao ou revogacao do consentimento, nos limites da LGPD.',
  'Saber com quem os dados foram compartilhados e quais efeitos a negativa de consentimento pode gerar.',
] as const

const securityItems = [
  'O backend aplica autenticacao administrativa, limites de requisicao e cabecalhos de seguranca.',
  'O ambiente interno registra auditoria de uso e protege exportacoes nominais.',
  'Incidentes com risco relevante devem seguir o fluxo de comunicacao previsto pela LGPD e pela ANPD.',
] as const

export default function PrivacyPage() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [privacyConfig, setPrivacyConfig] = useState<PublicPrivacyConfigResponse | null>(null)

  useCleanUiTextTree(rootRef, [mobileMenuOpen, privacyConfig?.contactEmail ?? ''])

  useEffect(() => {
    let isMounted = true

    async function loadPrivacyConfig() {
      try {
        const response = await getPublicPrivacyConfig()
        if (isMounted) {
          setPrivacyConfig(response)
        }
      } catch {
        if (isMounted) {
          setPrivacyConfig({
            controllerName: 'SIBRADANCA',
            contactEmail: '',
          })
        }
      }
    }

    void loadPrivacyConfig()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="page-shell privacy-page" ref={rootRef}>
      <Seo
        title="Privacidade e protecao de dados do SIBRADANCA"
        description="Politica publica de privacidade do SIBRADANCA com finalidade do tratamento, direitos do titular, leitura publica agregada e protecao de dados do projeto."
        path="/privacidade"
      />

      <header className="site-header">
        <div className="container header-inner">
          <div className="brand-mini">
            <div className="brand-mini-icon">
              <img src={logo} alt="Logo SIBRADANCA" />
            </div>
          </div>

          <nav className="desktop-nav">
            <Link to="/">Pagina inicial</Link>
            <Link to="/estatisticas-nacionais">Estatisticas nacionais</Link>
            <Link to="/privacidade">Privacidade</Link>
            <a
              href="https://www.instagram.com/sibradanca"
              target="_blank"
              rel="noreferrer"
              className="instagram-link"
            >
              <Instagram size={16} />
              <span>sibradanca</span>
            </a>
          </nav>

          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen ? (
          <div className="mobile-menu">
            <Link to="/" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>
              <House size={18} />
              <span>Pagina inicial</span>
            </Link>

            <Link
              to="/estatisticas-nacionais"
              className="mobile-menu-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShieldCheck size={18} />
              <span>Estatisticas nacionais</span>
            </Link>

            <Link
              to="/privacidade"
              className="mobile-menu-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShieldCheck size={18} />
              <span>Privacidade</span>
            </Link>
          </div>
        ) : null}
      </header>

      <main className="privacy-main">
        <section className="section-space">
          <div className="container privacy-hero">
            <Badge dark>Privacidade e LGPD</Badge>
            <h1>Como o SIBRADANCA trata dados pessoais</h1>
            <p className="privacy-hero-copy">
              O projeto coleta dados para formar uma base nacional da danca, apoiar leitura
              estatistica, orientar politicas publicas e organizar o acompanhamento interno da
              ONG. A leitura publica usa dados agregados; o ambiente interno concentra o acesso
              nominal e as exportacoes operacionais.
            </p>

            <div className="privacy-hero-actions">
              <Link to="/" className="btn btn-primary btn-large">
                <ArrowLeft size={18} />
                Voltar aos formularios
              </Link>
            </div>
          </div>
        </section>

        <section className="section-space">
          <div className="container">
            <SectionTitle
              badge="Base de tratamento"
              title="O que entra no sistema e para que serve"
              description="A coleta busca formar um retrato institucional da danca sem misturar leitura publica com uso interno da base."
            />

            <div className="privacy-grid">
              <Card className="privacy-card">
                <p className="eyebrow">Dados coletados</p>
                <ul className="privacy-list">
                  {dataGroups.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Card>

              <Card className="privacy-card">
                <p className="eyebrow">Uso publico e interno</p>
                <ul className="privacy-list">
                  {publicLimits.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </section>

        <section className="section-space">
          <div className="container">
            <SectionTitle
              badge="Titular dos dados"
              title="Direitos e canal de atendimento"
              description="A pessoa titular pode acionar a equipe controladora para tratar pedidos relacionados aos seus dados."
            />

            <div className="privacy-grid">
              <Card className="privacy-card">
                <p className="eyebrow">Direitos do titular</p>
                <ul className="privacy-list">
                  {holderRights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Card>

              <Card className="privacy-card">
                <p className="eyebrow">Canal institucional</p>
                <div className="privacy-contact">
                  <strong>{privacyConfig?.controllerName || 'SIBRADANCA'}</strong>
                  {privacyConfig?.contactEmail ? (
                    <a href={`mailto:${privacyConfig.contactEmail}`}>
                      <Mail size={16} />
                      <span>{privacyConfig.contactEmail}</span>
                    </a>
                  ) : (
                    <p>
                      Defina e publique o email oficial do encarregado ou do canal de atendimento
                      do titular antes da abertura oficial do produto.
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="section-space">
          <div className="container">
            <SectionTitle
              badge="Menores e seguranca"
              title="Cuidados adicionais no cadastro jovem"
              description="Cadastros de menores exigem cuidado reforcado, leitura em melhor interesse e orientacao clara para a equipe."
            />

            <div className="privacy-grid">
              <Card className="privacy-card">
                <p className="eyebrow">Cadastro jovem</p>
                <ul className="privacy-list">
                  <li>
                    O formulario para menores deve ser preenchido pelo responsavel legal ou com a
                    sua autorizacao.
                  </li>
                  <li>
                    O uso estatistico dos dados depende de consentimento apresentado de forma
                    destacada no final do fluxo.
                  </li>
                  <li>
                    Leituras publicas e materiais externos nao devem expor dados nominais de
                    criancas e adolescentes.
                  </li>
                </ul>
              </Card>

              <Card className="privacy-card">
                <p className="eyebrow">Seguranca operacional</p>
                <ul className="privacy-list">
                  {securityItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <img src={logo} alt="Logo SIBRADANCA" />
            <p>
              <strong>SIBRADANCA - Sistema Brasileiro de Evidencias da Danca</strong>
            </p>
          </div>

          <div className="footer-links">
            <Link to="/">Formularios</Link>
            <Link to="/privacidade">Politica de privacidade</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SIBRADANCA · Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  )
}
