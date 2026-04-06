import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  Database,
  HeartHandshake,
  House,
  Instagram,
  Landmark,
  MapPinned,
  Menu,
  Users,
  X,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import logo from '../assets/logo-sibradanca.png'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Seo } from '../components/Seo'
import { SectionTitle } from '../components/SectionTitle'

const colors = {
  yellow: '#f4eb00',
  blue: '#48a9e6',
  pink: '#ef2f8d',
  green: '#7be33d',
  purple: '#b36ce6',
  cyan: '#6fd8e6',
} as const

const highlights = [
  {
    title: 'Retrato nacional da dança',
    description:
      'Uma leitura ampla para mostrar quem dança, onde está e como o setor se movimenta pelo Brasil.',
    icon: MapPinned,
    color: colors.yellow,
  },
  {
    title: 'Participação guiada',
    description:
      'Os formulários foram organizados para facilitar o preenchimento de jovens, profissionais e instituições.',
    icon: ClipboardList,
    color: colors.blue,
  },
  {
    title: 'Leitura para decisões',
    description:
      'A base ajuda a orientar diagnósticos, relatórios e ações futuras para o desenvolvimento da dança.',
    icon: Landmark,
    color: colors.green,
  },
  {
    title: 'Navegação acolhedora',
    description:
      'Cada perfil encontra rapidamente o formulário certo, com uma navegação clara e direta.',
    icon: HeartHandshake,
    color: colors.pink,
  },
]

const accessJourneys = [
  {
    title: 'Jovens da dança',
    description:
      'Fluxo pensado para participantes menores de 18 anos, com perguntas guiadas e preenchimento simples.',
    badge: 'Setor 01',
    icon: Users,
    route: '/formulario/jovens',
  },
  {
    title: 'Profissionais da dança',
    description:
      'Percurso para pessoas adultas que atuam, estudam ou desenvolvem atividades ligadas à dança.',
    badge: 'Setor 02',
    icon: BookOpen,
    route: '/formulario/profissionais',
  },
  {
    title: 'Escolas, grupos e companhias',
    description:
      'Cadastro institucional para organizações, coletivos, projetos, escolas e companhias do setor.',
    badge: 'Setor 03',
    icon: Database,
    route: '/formulario/instituicoes',
  },
]

const floatingShapes = [
  { className: 'shape yellow square s1', duration: 7 },
  { className: 'shape blue square s2', duration: 8 },
  { className: 'shape purple square s3', duration: 6 },
  { className: 'shape green square s4', duration: 7.5 },
  { className: 'shape pink circle s5', duration: 5.5 },
  { className: 'shape cyan circle s6', duration: 6.2 },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
}

function FloatingShapes() {
  return (
    <div className="floating-shapes" aria-hidden="true">
      {floatingShapes.map((shape, index) => (
        <motion.div
          key={index}
          className={shape.className}
          animate={{ y: [0, -14, 0, 12, 0], rotate: [0, 2, -2, 0] }}
          transition={{ duration: shape.duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

function HeroArtwork() {
  return (
    <motion.div
      className="hero-artwork"
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <div className="artboard-bg" />

      <div className="art square yellow a1" />
      <div className="art square pink a2" />
      <div className="art square blue a3" />
      <div className="art square yellow a4" />
      <div className="art square green a5" />
      <div className="art square purple a6" />
      <div className="art square cyan a7" />
      <div className="art circle pink a8" />
      <div className="art circle blue a9" />
      <div className="art circle green a10" />

      <motion.div
        className="brand-card"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="brand-dots">
          <span className="dot pink" />
          <span className="dot yellow" />
          <span className="dot blue" />
          <span className="dot green" />
        </div>

        <img src={logo} alt="Logo SIBRADANÇA" className="hero-logo" />
        <p className="hero-logo-text">
          Conectando artistas, escolas, companhias e profissionais para fortalecer políticas
          públicas e o desenvolvimento da dança brasileira.
        </p>
      </motion.div>
    </motion.div>
  )
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const scrollToForms = () => {
    document.getElementById('formularios')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const scrollToAbout = () => {
    document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="page-shell">
      <Seo
        title="SIBRADAN\u00c7A \u2014 Banco Nacional de Dados da Dan\u00e7a do Brasil"
        description="Conhe\u00e7a a plataforma p\u00fablica do SIBRADAN\u00c7A, acesse os formul\u00e1rios de jovens, profissionais e institui\u00e7\u00f5es e acompanhe a apresenta\u00e7\u00e3o nacional do projeto."
        path="/"
      />
      <FloatingShapes />
      <header className="site-header">
        <div className="container header-inner">
          <div className="brand-mini">
            <div className="brand-mini-icon">
              <img src={logo} alt="Logo SIBRADANÇA" />
            </div>
          </div>

          <nav className="desktop-nav">
            <a href="#sobre">Sobre</a>
            <a href="#formularios">Formulários</a>
            <Link to="/estatisticas-nacionais">Estatísticas nacionais</Link>
            <a href="#parceiros">Parceiros</a>
            <a
              href="https://www.instagram.com/sibradanca"
              target="_blank"
              rel="noreferrer"
              id="nameInstagram"
              className="instagram-link"
            >
              <Instagram size={16} />
              <span>sibradanca</span>
            </a>
          </nav>

          <div className="header-actions">
            <motion.div variants={itemVariants}>
              <Button large onClick={scrollToForms}>
                Participar <ArrowRight size={18} />
              </Button>
            </motion.div>

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
        </div>

        {mobileMenuOpen ? (
          <div className="mobile-menu">
            <a href="#sobre" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>
              <House size={18} />
              <span>Sobre</span>
            </a>

            <a
              href="#formularios"
              className="mobile-menu-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ClipboardList size={18} />
              <span>Formulários</span>
            </a>

            <Link
              to="/estatisticas-nacionais"
              className="mobile-menu-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Database size={18} />
              <span>Estatísticas nacionais</span>
            </Link>

            <a
              href="#parceiros"
              className="mobile-menu-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Landmark size={18} />
              <span>Parceiros</span>
            </a>

            <button
              type="button"
              className="mobile-menu-link mobile-menu-action"
              onClick={() => {
                setMobileMenuOpen(false)
                scrollToForms()
              }}
            >
              <ArrowRight size={18} />
              <span>Participar</span>
            </button>

            <a
              href="https://www.instagram.com/sibradanca"
              target="_blank"
              rel="noreferrer"
              className="mobile-menu-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Instagram size={18} />
              <span>Instagram</span>
            </a>
          </div>
        ) : null}
      </header>

      <main>
        <section className="hero-section">
          <div className="container hero-grid">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="hero-copy"
            >
              <motion.div variants={itemVariants}>
                <Badge>Sistema Brasileiro de Evidências da Dança</Badge>
              </motion.div>

              <motion.h1 variants={itemVariants}>O banco nacional de dados da dança no Brasil</motion.h1>

              <motion.p variants={itemVariants} className="hero-description">
                O SIBRADANÇA é um observatório nacional dedicado à dança no Brasil. Nesta página,
                você conhece a plataforma e encontra os formulários de participação.
              </motion.p>

              <motion.div variants={itemVariants} className="hero-actions">
                <Button large onClick={scrollToAbout}>
                  Saiba mais <ArrowRight size={18} />
                </Button>
              </motion.div>
            </motion.div>

            <HeroArtwork />
          </div>
        </section>

        <section id="sobre" className="section-space">
          <div className="container">
            <SectionTitle
              badge="Sobre o SIBRADANÇA"
              title="Uma plataforma nacional voltada à participação de jovens, profissionais e instituições da dança"
              description="Conheça o projeto e saiba como participar."
            />

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="stats-grid"
            >
              {highlights.map((item) => {
                const Icon = item.icon

                return (
                  <motion.div key={item.title} variants={itemVariants}>
                    <Card hover>
                      <div className="icon-wrap" style={{ backgroundColor: item.color }}>
                        <Icon size={24} />
                      </div>
                      <p className="eyebrow">{item.title}</p>
                      <p className="card-text">{item.description}</p>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>

        <section id="formularios" className="section-space">
          <div className="container">
            <SectionTitle
              badge="Formulários de participação"
              title="Escolha como você participa da dança"
              description="Selecione a opção que mais combina com a sua atuação."
            />

            <div className="access-grid">
              {accessJourneys.map((item) => {
                const Icon = item.icon

                return (
                  <Card key={item.title} className="access-card" hover>
                    <div className="access-card-header">
                      <Badge tone="blue">{item.badge}</Badge>
                      <div className="icon-wrap access-icon">
                        <Icon size={22} />
                      </div>
                    </div>
                    <h3>{item.title}</h3>
                    <p className="card-text">{item.description}</p>
                    <Button onClick={() => navigate(item.route)}>
                      Iniciar cadastro <ArrowRight size={16} />
                    </Button>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        <section id="parceiros" className="section-space">
          <div className="container">
            <SectionTitle
              badge="Rede institucional"
              title="Parceiros e apoiadores da dança"
              description="Instituições, redes e organizações que fortalecem o projeto."
            />

            <div className="partners-grid">
              <Card className="partner-card">
                <div className="partner-logo placeholder" />
                <h4>Apoiadores institucionais</h4>
                <p>Espaço reservado para instituições e organizações que apoiam a iniciativa.</p>
              </Card>

              <Card className="partner-card">
                <div className="partner-logo placeholder" />
                <h4>Organizações culturais</h4>
                <p>Área destinada a coletivos, espaços e iniciativas ligadas ao campo da dança.</p>
              </Card>

              <Card className="partner-card">
                <div className="partner-logo placeholder" />
                <h4>Redes de pesquisa</h4>
                <p>Espaço para grupos de estudo, pesquisadores e instituições acadêmicas do setor.</p>
              </Card>

              <Card className="partner-card">
                <div className="partner-logo placeholder" />
                <h4>Articulação da dança</h4>
                <p>Área voltada a parceiros, iniciativas e redes dedicadas ao desenvolvimento da dança.</p>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <img src={logo} alt="Logo SIBRADANÇA" />
            <p>
              <strong>SIBRADANÇA – Sistema Brasileiro de Evidências da Dança</strong>
            </p>
          </div>

          <div className="footer-links">
            <a href="#formularios">Formulários</a>
            <a href="#">Política de privacidade</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SIBRADANÇA · Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  )
}
