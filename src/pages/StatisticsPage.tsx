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
  { label: 'Base simulada', value: '5.240' },
  { label: 'Juventudes', value: '2.380' },
  { label: 'Profissionais', value: '1.960' },
  { label: 'Instituições', value: '900' },
]

const sectorDistribution: ChartItem[] = [
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

const cityDistribution: ChartItem[] = [
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
  { name: 'Estudam atualmente', value: 1430 },
  { name: 'Autodidatas', value: 860 },
  { name: 'Formação técnica', value: 720 },
  { name: 'Graduação', value: 480 },
  { name: 'Pós-graduação', value: 170 },
]

const institutionalDistribution: ChartItem[] = [
  { name: 'Com ação formativa', value: 620 },
  { name: 'Com programação anual', value: 540 },
  { name: 'Com CNPJ', value: 510 },
  { name: 'Com bolsas e apoios', value: 290 },
  { name: 'No interior e periferias', value: 455 },
]

const policyDistribution: ChartItem[] = [
  { name: 'Já participou de edital', value: 710 },
  { name: 'Foi contemplado', value: 295 },
  { name: 'Busca apoio para escrita', value: 890 },
  { name: 'Busca orientação jurídica', value: 540 },
  { name: 'Busca formação em gestão', value: 760 },
]

const contentInterestDistribution: ChartItem[] = [
  { name: 'Cursos e formação', value: 940 },
  { name: 'Festivais e eventos', value: 860 },
  { name: 'Editais e oportunidades', value: 790 },
  { name: 'Conteúdo digital', value: 650 },
  { name: 'Gestão e carreira', value: 520 },
]

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
              <Badge dark>Estatísticas nacionais</Badge>
              <h1>Banco Nacional da Dança do Brasil</h1>
              <p className="statistics-hero-description">
                Amostra pública de um painel analítico nacional da dança.
              </p>
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
            <SectionTitle badge="Panorama nacional" title="Visão geral da base" />

            <div className="statistics-kpi-grid statistics-kpi-grid--four">
              {overviewCards.map((item) => (
                <article key={item.label} className="card statistics-kpi-card">
                  <span className="eyebrow">Panorama</span>
                  <h3 className="statistics-kpi-title">{item.label}</h3>
                  <strong className="statistics-kpi-value">{item.value}</strong>
                </article>
              ))}
            </div>

            <div className="statistics-chart-grid two-columns">
              <ChartPanel
                title="Participação por perfil"
                data={sectorDistribution}
                eyebrowLabel="Perfis"
                summaryItems={3}
              />
              <ChartPanel
                title="Distribuição dos perfis"
                data={sectorDistribution}
                type="pie"
                eyebrowLabel="Perfis"
                summaryItems={3}
              />
            </div>
          </div>
        </section>

        <section className="section-space">
          <div className="container">
            <SectionTitle badge="Territórios" title="A dança pelo Brasil" />

            <div className="statistics-chart-grid three-columns">
              <ChartPanel
                title="Participação por região"
                data={regionDistribution}
                eyebrowLabel="Regiões"
                summaryItems={5}
              />
              <ChartPanel
                title="Estados com mais cadastros"
                data={stateDistribution}
                eyebrowLabel="Estados"
                summaryItems={6}
              />
              <ChartPanel
                title="Municípios em destaque"
                data={cityDistribution}
                eyebrowLabel="Municípios"
                summaryItems={6}
              />
            </div>
          </div>
        </section>

        <section className="section-space">
          <div className="container">
            <SectionTitle badge="Perfis" title="Perfis da base" />

            <div className="statistics-chart-grid three-columns">
              <ChartPanel
                title="Faixas etárias"
                data={ageDistribution}
                type="pie"
                eyebrowLabel="Idades"
                summaryItems={5}
              />
              <ChartPanel
                title="Gênero"
                data={genderDistribution}
                type="pie"
                eyebrowLabel="Perfil"
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
            <SectionTitle badge="Formação e apoio" title="Formação e apoio" />

            <div className="statistics-chart-grid two-columns">
              <ChartPanel
                title="Caminhos de formação"
                data={trainingDistribution}
                eyebrowLabel="Formação"
                summaryItems={5}
              />
              <ChartPanel
                title="Estrutura das instituições"
                data={institutionalDistribution}
                eyebrowLabel="Instituições"
                summaryItems={5}
              />
              <ChartPanel
                title="Temas ligados a apoio público"
                data={policyDistribution}
                eyebrowLabel="Apoio"
                summaryItems={5}
              />
              <ChartPanel
                title="O que as pessoas mais buscam"
                data={contentInterestDistribution}
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
