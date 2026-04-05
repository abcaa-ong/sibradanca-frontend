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

type StatusCard = {
  label: string
  value: string
}

const overviewCards: OverviewCard[] = [
  { label: 'Cadastros totais', value: '5.240' },
  { label: 'Jovens', value: '2.380' },
  { label: 'Profissionais', value: '1.960' },
  { label: 'Institui\u00e7\u00f5es', value: '900' },
]

const statusCards: StatusCard[] = [
  { label: 'Cobertura nacional', value: '27 UFs' },
  { label: 'Formul\u00e1rios ativos', value: '3 frentes' },
  { label: 'Base demonstrativa', value: '5.240 registros' },
  { label: 'Leitura p\u00fablica', value: 'Sem dados pessoais' },
]

const profileDistribution: ChartItem[] = [
  { name: 'Jovens', value: 2380 },
  { name: 'Profissionais', value: 1960 },
  { name: 'Institui\u00e7\u00f5es', value: 900 },
]

const regionDistribution: ChartItem[] = [
  { name: 'Sudeste', value: 1710 },
  { name: 'Nordeste', value: 1325 },
  { name: 'Sul', value: 840 },
  { name: 'Centro-Oeste', value: 710 },
  { name: 'Norte', value: 655 },
]

const stateDistribution: ChartItem[] = [
  { name: 'S\u00e3o Paulo', value: 620 },
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
  { name: 'S\u00e3o Paulo', value: 160 },
  { name: 'Bel\u00e9m', value: 132 },
]

const ageDistribution: ChartItem[] = [
  { name: 'At\u00e9 17 anos', value: 2290 },
  { name: '18 a 24 anos', value: 980 },
  { name: '25 a 34 anos', value: 1135 },
  { name: '35 a 49 anos', value: 610 },
  { name: '50 anos ou mais', value: 225 },
]

const genderDistribution: ChartItem[] = [
  { name: 'Mulheres', value: 2810 },
  { name: 'Homens', value: 1710 },
  { name: 'N\u00e3o bin\u00e1rio', value: 290 },
  { name: 'Outro ou n\u00e3o informado', value: 430 },
]

const modalityDistribution: ChartItem[] = [
  { name: 'Ballet cl\u00e1ssico', value: 960 },
  { name: 'Dan\u00e7as urbanas', value: 890 },
  { name: 'Dan\u00e7a contempor\u00e2nea', value: 780 },
  { name: 'Dan\u00e7as populares', value: 710 },
  { name: 'Jazz', value: 655 },
  { name: 'Dan\u00e7a de sal\u00e3o', value: 520 },
]

const trainingDistribution: ChartItem[] = [
  { name: 'Em forma\u00e7\u00e3o', value: 1430 },
  { name: 'Autodidatas', value: 860 },
  { name: 'Cursos t\u00e9cnicos', value: 720 },
  { name: 'Gradua\u00e7\u00e3o', value: 480 },
  { name: 'P\u00f3s-gradua\u00e7\u00e3o', value: 170 },
]

const supportDistribution: ChartItem[] = [
  { name: 'Cursos e forma\u00e7\u00e3o', value: 940 },
  { name: 'Festivais e eventos', value: 860 },
  { name: 'Editais e oportunidades', value: 790 },
  { name: 'Conte\u00fado digital', value: 650 },
  { name: 'Gest\u00e3o e carreira', value: 520 },
]

const institutionStructureDistribution: ChartItem[] = [
  { name: 'Com aulas regulares', value: 710 },
  { name: 'Atua\u00e7\u00e3o em periferias', value: 520 },
  { name: 'Uso de espa\u00e7o p\u00fablico', value: 430 },
  { name: 'Sede pr\u00f3pria', value: 390 },
  { name: 'Com bolsas ativas', value: 265 },
]

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value)
}

export default function StatisticsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="page-shell">
      <header className="site-header">
        <div className="container header-inner">
          <div className="brand-mini">
            <div className="brand-mini-icon">
              <img src={logo} alt="Logo SIBRADAN\u00c7A" />
            </div>
          </div>

          <nav className="desktop-nav">
            <Link to="/">P\u00e1gina inicial</Link>
            <Link to="/">Formul\u00e1rios</Link>
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
              <span>P\u00e1gina inicial</span>
            </Link>

            <Link to="/" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>
              <ClipboardList size={18} />
              <span>Formul\u00e1rios</span>
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
              <Badge dark>Estat\u00edsticas nacionais</Badge>
              <h1>Banco Nacional de Dados da Dan\u00e7a do Brasil</h1>
              <p className="statistics-hero-description">
                Painel p\u00fablico com leitura demonstrativa da base nacional da dan\u00e7a, sem exibir
                informa\u00e7\u00f5es pessoais.
              </p>
            </div>

            <div className="statistics-hero-actions">
              <Link to="/" className="btn btn-primary btn-large">
                <ArrowLeft size={18} />
                Voltar para os formul\u00e1rios
              </Link>
            </div>

            <div className="statistics-status-strip">
              {statusCards.map((item) => (
                <article key={item.label} className="card statistics-status-card">
                  <span className="eyebrow">{item.label}</span>
                  <strong className="statistics-status-value">{item.value}</strong>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-space">
          <div className="container">
            <SectionTitle badge="Base nacional" title="Vis\u00e3o geral da base" />

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
                title="Presen\u00e7a por regi\u00e3o"
                data={regionDistribution}
                eyebrowLabel="Territ\u00f3rio"
                summaryItems={5}
              />
            </div>
          </div>
        </section>

        <section className="section-space">
          <div className="container">
            <SectionTitle badge="Territ\u00f3rio" title="Presen\u00e7a da dan\u00e7a no Brasil" />

            <div className="statistics-chart-grid two-columns">
              <ChartPanel
                title="Estados com maior presen\u00e7a"
                data={stateDistribution}
                eyebrowLabel="Estados"
                summaryItems={6}
              />

              <div className="card statistics-compact-panel">
                <div className="panel-top">
                  <div>
                    <span className="eyebrow">Cidades</span>
                    <h3 className="statistics-compact-title">Munic\u00edpios em destaque</h3>
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
            <SectionTitle badge="Perfis da base" title="Quem aparece nesta leitura" />

            <div className="statistics-chart-grid three-columns">
              <ChartPanel
                title="Faixa et\u00e1ria"
                data={ageDistribution}
                type="pie"
                eyebrowLabel="Idades"
                summaryItems={5}
              />
              <ChartPanel
                title="G\u00eanero"
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
            <SectionTitle badge="Estrutura da dan\u00e7a" title="Forma\u00e7\u00e3o, interesses e institui\u00e7\u00f5es" />

            <div className="statistics-chart-grid three-columns">
              <ChartPanel
                title="Forma\u00e7\u00e3o"
                data={trainingDistribution}
                eyebrowLabel="Percursos"
                summaryItems={5}
              />
              <ChartPanel
                title="Interesses mais frequentes"
                data={supportDistribution}
                eyebrowLabel="Temas"
                summaryItems={5}
              />
              <ChartPanel
                title="Estrutura das institui\u00e7\u00f5es"
                data={institutionStructureDistribution}
                eyebrowLabel="Institui\u00e7\u00f5es"
                summaryItems={5}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <img src={logo} alt="Logo SIBRADAN\u00c7A" />
            <p>
              <strong>SIBRADAN\u00c7A \u2013 Sistema Brasileiro de Evid\u00eancias da Dan\u00e7a</strong>
            </p>
          </div>

          <div className="footer-links">
            <Link to="/">Formul\u00e1rios</Link>
            <a href="#">Pol\u00edtica de privacidade</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>\u00a9 {new Date().getFullYear()} SIBRADAN\u00c7A \u00b7 Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  )
}
