import { useState } from 'react'
import { ArrowLeft, ClipboardList, House, Instagram, Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'

import logo from '../assets/logo-sibradanca.png'
import { Badge } from '../components/Badge'
import { ChartPanel } from '../components/ChartPanel'
import { SectionTitle } from '../components/SectionTitle'

type ChartItem = {
  name: string
  value: number
}

type OverviewCard = {
  label: string
  value: string
}

const overviewCards: OverviewCard[] = [
  { label: 'Cadastros totais', value: '5.240' },
  { label: 'Jovens', value: '2.380' },
  { label: 'Profissionais', value: '1.960' },
  { label: 'Instituições', value: '900' },
]

const profileDistribution: ChartItem[] = [
  { name: 'Jovens', value: 2380 },
  { name: 'Profissionais', value: 1960 },
  { name: 'Instituições', value: 900 },
]

const regionDistribution: ChartItem[] = [
  { name: 'Sudeste', value: 1710 },
  { name: 'Nordeste', value: 1325 },
  { name: 'Sul', value: 840 },
  { name: 'Centro-Oeste', value: 710 },
  { name: 'Norte', value: 655 },
]

const stateDistribution: ChartItem[] = [
  { name: 'São Paulo', value: 620 },
  { name: 'Bahia', value: 510 },
  { name: 'Pernambuco', value: 470 },
  { name: 'Rio de Janeiro', value: 455 },
  { name: 'Minas Gerais', value: 430 },
  { name: 'Distrito Federal', value: 285 },
]

const cityHighlights: ChartItem[] = [
  { name: 'Salvador', value: 210 },
  { name: 'Recife', value: 185 },
  { name: 'Belo Horizonte', value: 172 },
  { name: 'Rio de Janeiro', value: 168 },
  { name: 'São Paulo', value: 160 },
  { name: 'Belém', value: 132 },
]

const ageDistribution: ChartItem[] = [
  { name: 'Até 17 anos', value: 2290 },
  { name: '18 a 24 anos', value: 980 },
  { name: '25 a 34 anos', value: 1135 },
  { name: '35 a 49 anos', value: 610 },
  { name: '50 anos ou mais', value: 225 },
]

const genderDistribution: ChartItem[] = [
  { name: 'Mulheres', value: 2810 },
  { name: 'Homens', value: 1710 },
  { name: 'Não binário', value: 290 },
  { name: 'Outro ou não informado', value: 430 },
]

const modalityDistribution: ChartItem[] = [
  { name: 'Ballet clássico', value: 960 },
  { name: 'Danças urbanas', value: 890 },
  { name: 'Dança contemporânea', value: 780 },
  { name: 'Danças populares', value: 710 },
  { name: 'Jazz', value: 655 },
  { name: 'Dança de salão', value: 520 },
]

const trainingDistribution: ChartItem[] = [
  { name: 'Em formação', value: 1430 },
  { name: 'Autodidatas', value: 860 },
  { name: 'Cursos técnicos', value: 720 },
  { name: 'Graduação', value: 480 },
  { name: 'Pós-graduação', value: 170 },
]

const supportDistribution: ChartItem[] = [
  { name: 'Cursos e formação', value: 940 },
  { name: 'Festivais e eventos', value: 860 },
  { name: 'Editais e oportunidades', value: 790 },
  { name: 'Conteúdo digital', value: 650 },
  { name: 'Gestão e carreira', value: 520 },
]

const formatNumber = (value: number) => new Intl.NumberFormat('pt-BR').format(value)

export default function StatisticsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="page-shell">
      <header className="site-header">
        <div className="container header-inner">
          <div className="brand-mini">
            <div className="brand-mini-icon">
              <img src={logo} alt="Logo SIBRADANÇA" />
            </div>
          </div>

          <nav className="desktop-nav">
            <Link to="/">Página inicial</Link>
            <Link to="/">Formulários</Link>
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
              <span>Página inicial</span>
            </Link>

            <Link to="/" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>
              <ClipboardList size={18} />
              <span>Formulários</span>
            </Link>

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

      <main className="statistics-page">
        <section className="statistics-hero section-space">
          <div className="container">
            <div className="statistics-hero-copy">
              <Badge dark>Banco Nacional da Dança</Badge>
              <h1>Banco Nacional da Dança do Brasil</h1>
              <p className="statistics-hero-description">Acompanhe a presença da dança no país.</p>
            </div>

            <div className="statistics-hero-actions">
              <Link to="/" className="btn btn-primary btn-large">
                <ArrowLeft size={18} />
                Voltar para os formulários
              </Link>
            </div>
          </div>
        </section>

        <section className="section-space">
          <div className="container">
            <SectionTitle badge="Visão geral" title="Base cadastrada" />

            <div className="statistics-kpi-grid statistics-kpi-grid--four">
              {overviewCards.map((item) => (
                <article key={item.label} className="card statistics-kpi-card">
                  <span className="eyebrow">Base</span>
                  <h3 className="statistics-kpi-title">{item.label}</h3>
                  <strong className="statistics-kpi-value">{item.value}</strong>
                </article>
              ))}
            </div>

            <div className="statistics-chart-grid two-columns">
              <ChartPanel
                title="Cadastros por perfil"
                data={profileDistribution}
                eyebrowLabel="Perfis"
                summaryItems={3}
              />
              <ChartPanel
                title="Distribuição dos cadastros"
                data={profileDistribution}
                type="pie"
                eyebrowLabel="Perfis"
                summaryItems={3}
              />
            </div>
          </div>
        </section>

        <section className="section-space">
          <div className="container">
            <SectionTitle badge="Brasil" title="Distribuição nacional" />

            <div className="statistics-chart-grid two-columns">
              <ChartPanel
                title="Cadastros por região"
                data={regionDistribution}
                eyebrowLabel="Regiões"
                summaryItems={5}
              />
              <ChartPanel
                title="Estados com maior presença"
                data={stateDistribution}
                eyebrowLabel="Estados"
                summaryItems={6}
              />
            </div>

            <div className="statistics-compact-stage">
              <div className="card statistics-compact-panel">
                <div className="panel-top">
                  <div>
                    <span className="eyebrow">Cidades</span>
                    <h3 className="statistics-compact-title">Municípios em destaque</h3>
                  </div>
                </div>

                <div className="statistics-compact-grid">
                  {cityHighlights.map((item) => (
                    <div key={item.name} className="statistics-compact-item">
                      <span>{item.name}</span>
                      <strong>{formatNumber(item.value)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-space">
          <div className="container">
            <SectionTitle badge="Perfis" title="Retratos da base" />

            <div className="statistics-chart-grid three-columns">
              <ChartPanel
                title="Faixa etária"
                data={ageDistribution}
                type="pie"
                eyebrowLabel="Idades"
                summaryItems={5}
              />
              <ChartPanel
                title="Gênero"
                data={genderDistribution}
                type="pie"
                eyebrowLabel="Perfis"
                summaryItems={4}
              />
              <ChartPanel
                title="Modalidades mais presentes"
                data={modalityDistribution}
                eyebrowLabel="Modalidades"
                summaryItems={6}
              />
            </div>
          </div>
        </section>

        <section className="section-space">
          <div className="container">
            <SectionTitle badge="Formação e interesses" title="Trajetórias da dança" />

            <div className="statistics-chart-grid two-columns">
              <ChartPanel
                title="Formação"
                data={trainingDistribution}
                eyebrowLabel="Formação"
                summaryItems={5}
              />
              <ChartPanel
                title="Interesses mais frequentes"
                data={supportDistribution}
                eyebrowLabel="Interesses"
                summaryItems={5}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <img src={logo} alt="Logo SIBRADANÇA" />
            <p>
              <strong>SIBRADANÇA - Sistema Brasileiro de Evidências da Dança</strong>
            </p>
          </div>

          <div className="footer-links">
            <Link to="/">Formulários</Link>
            <Link to="/estatisticas-nacionais">Estatísticas nacionais</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SIBRADANÇA · Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  )
}
