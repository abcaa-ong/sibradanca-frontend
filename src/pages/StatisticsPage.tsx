import { useState } from 'react'
import {
  ArrowLeft,
  ClipboardList,
  Database,
  Globe2,
  House,
  Instagram,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import logo from '../assets/logo-sibradanca.png'
import { Badge } from '../components/Badge'
import { ChartPanel } from '../components/ChartPanel'
import { MetricCard } from '../components/MetricCard'
import { SectionTitle } from '../components/SectionTitle'

type ChartItem = {
  name: string
  value: number
}

type OverviewCard = {
  label: string
  value: string
  description: string
}

type NoteCard = {
  title: string
  description: string
  icon: typeof Globe2
}

const overviewCards: OverviewCard[] = [
  {
    label: 'Participações apresentadas',
    value: '5.240',
    description: 'Uma amostra ilustrativa para mostrar como o painel pode aparecer em escala nacional.',
  },
  {
    label: 'Jovens da dança',
    value: '2.380',
    description: 'Participações de quem está começando, estudando ou crescendo na dança.',
  },
  {
    label: 'Profissionais da dança',
    value: '1.960',
    description: 'Participações de quem atua, trabalha ou desenvolve sua trajetória na área.',
  },
  {
    label: 'Instituições da dança',
    value: '900',
    description: 'Escolas, grupos, companhias, projetos, coletivos e espaços dedicados à dança.',
  },
]

const noteCards: NoteCard[] = [
  {
    title: 'Informações gerais',
    description:
      'Esta página mostra apenas números amplos e visões de conjunto. Nenhum cadastro individual aparece aqui.',
    icon: ShieldCheck,
  },
  {
    title: 'Demonstração visual',
    description:
      'Os números desta tela foram montados para apresentar como essa leitura pública pode ficar quando a base crescer.',
    icon: Database,
  },
  {
    title: 'Olhar nacional',
    description:
      'A ideia é mostrar presença, diversidade e alcance da dança no Brasil de forma simples e clara.',
    icon: Globe2,
  },
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
  { name: 'SP', value: 620 },
  { name: 'BA', value: 510 },
  { name: 'PE', value: 470 },
  { name: 'RJ', value: 455 },
  { name: 'MG', value: 430 },
  { name: 'DF', value: 285 },
]

const ageDistribution: ChartItem[] = [
  { name: 'Até 17', value: 2290 },
  { name: '18 a 24', value: 980 },
  { name: '25 a 34', value: 1135 },
  { name: '35 a 49', value: 610 },
  { name: '50+', value: 225 },
]

const genderDistribution: ChartItem[] = [
  { name: 'Mulheres', value: 2810 },
  { name: 'Homens', value: 1710 },
  { name: 'Não binário', value: 290 },
  { name: 'Outro / NI', value: 430 },
]

const modalityDistribution: ChartItem[] = [
  { name: 'Ballet clássico', value: 960 },
  { name: 'Danças urbanas', value: 890 },
  { name: 'Contemporânea', value: 780 },
  { name: 'Danças populares', value: 710 },
  { name: 'Jazz', value: 655 },
  { name: 'Salão', value: 520 },
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
  { name: 'Com bolsas', value: 290 },
  { name: 'No interior e periferias', value: 455 },
]

const policyDistribution: ChartItem[] = [
  { name: 'Já acessou edital', value: 710 },
  { name: 'Foi contemplado', value: 295 },
  { name: 'Busca apoio para escrita', value: 890 },
  { name: 'Busca orientação jurídica', value: 540 },
  { name: 'Busca formação em gestão', value: 760 },
]

const highlightMetrics = [
  {
    label: 'Presença fora do eixo Rio-São Paulo',
    percent: '72%',
    detail: 'A maior parte dos registros de exemplo está distribuída em outros estados e regiões do país.',
  },
  {
    label: 'Ligação com formação',
    percent: '68%',
    detail: 'Boa parte das participações de exemplo passa por escolas, grupos de estudo e processos de aprendizagem.',
  },
  {
    label: 'Atividade contínua',
    percent: '61%',
    detail: 'Muitas instituições de exemplo mantêm aulas, ensaios, temporadas, circulação ou ação territorial.',
  },
  {
    label: 'Temas que mais aparecem',
    percent: '45%',
    detail: 'Editais, gestão e financiamento aparecem com frequência entre os temas mais citados.',
  },
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
              <h1>Uma prévia pública de como o Banco Nacional da Dança pode aparecer no Brasil</h1>
              <p className="statistics-hero-description">
                Esta página foi pensada para apresentações e divulgação do projeto. Ela mostra um
                retrato geral da iniciativa, sem expor informações pessoais.
              </p>
            </div>

            <div className="statistics-hero-actions">
              <Link to="/" className="btn btn-primary btn-large">
                <ArrowLeft size={18} />
                Voltar para os formulários
              </Link>
            </div>

            <div className="statistics-note-grid">
              {noteCards.map((item) => {
                const Icon = item.icon

                return (
                  <article key={item.title} className="card statistics-note-card">
                    <div className="icon-wrap statistics-note-icon">
                      <Icon size={22} />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="section-space">
          <div className="container">
            <SectionTitle
              badge="Visão geral"
              title="Um exemplo de como essa leitura nacional pode ganhar forma"
              description="Os números abaixo foram organizados para mostrar de maneira clara o potencial do projeto."
            />

            <div className="statistics-kpi-grid statistics-kpi-grid--four">
              {overviewCards.map((item) => (
                <article key={item.label} className="card statistics-kpi-card">
                  <span className="eyebrow">Dado geral</span>
                  <h3 className="statistics-kpi-title">{item.label}</h3>
                  <strong className="statistics-kpi-value">{item.value}</strong>
                  <p className="card-text">{item.description}</p>
                </article>
              ))}
            </div>

            <div className="statistics-chart-grid two-columns">
              <ChartPanel title="Quem está participando" data={sectorDistribution} eyebrowLabel="Brasil" />
              <ChartPanel title="Participação total" data={sectorDistribution} type="pie" eyebrowLabel="Brasil" />
            </div>
          </div>
        </section>

        <section className="section-space">
          <div className="container">
            <SectionTitle
              badge="Território"
              title="Como a dança pode ser vista por região e por estado"
              description="Uma leitura pública para mostrar alcance, presença e distribuição da iniciativa pelo país."
            />

            <div className="statistics-chart-grid three-columns">
              <ChartPanel title="Onde o movimento aparece" data={regionDistribution} eyebrowLabel="Mapa" />
              <ChartPanel title="Estados com mais cadastros" data={stateDistribution} eyebrowLabel="Mapa" />
              <ChartPanel title="Retrato por região" data={regionDistribution} type="pie" eyebrowLabel="Mapa" />
            </div>
          </div>
        </section>

        <section className="section-space">
          <div className="container">
            <SectionTitle
              badge="Perfis da dança"
              title="Quem aparece nesse retrato nacional da dança"
              description="Faixa etária, gênero e modalidades ajudam a mostrar diversidade, alcance e presença no setor."
            />

            <div className="statistics-chart-grid three-columns">
              <ChartPanel title="Idades" data={ageDistribution} type="pie" eyebrowLabel="Perfis" />
              <ChartPanel title="Como as pessoas se identificam" data={genderDistribution} type="pie" eyebrowLabel="Perfis" />
              <ChartPanel title="Práticas que mais aparecem" data={modalityDistribution} eyebrowLabel="Perfis" />
            </div>
          </div>
        </section>

        <section className="section-space">
          <div className="container">
            <SectionTitle
              badge="Formação e estrutura"
              title="Sinais de formação, continuidade e organização da dança"
              description="Uma leitura sobre aprendizagem, permanência, organizações e necessidades apontadas pelo setor."
            />

            <div className="statistics-chart-grid two-columns">
              <ChartPanel title="Caminhos de formação" data={trainingDistribution} eyebrowLabel="Leitura" />
              <ChartPanel title="Como as instituições se organizam" data={institutionalDistribution} eyebrowLabel="Leitura" />
              <ChartPanel title="Assuntos que mais pedem apoio" data={policyDistribution} eyebrowLabel="Leitura" />
              <div className="statistics-callout">
                <div className="card statistics-callout-card">
                  <span className="eyebrow">Apresentação pública</span>
                  <h3>Uma forma de mostrar o movimento sem expor cadastros individuais</h3>
                  <p>
                    A versão pública do SIBRADANÇA pode mostrar crescimento, distribuição,
                    modalidades e retratos do setor sem expor informações pessoais. A parte
                    completa continua reservada à ONG.
                  </p>
                </div>
              </div>
            </div>

            <div className="statistics-metric-grid">
              {highlightMetrics.map((item) => (
                <MetricCard
                  key={item.label}
                  label={item.label}
                  percent={item.percent}
                  detail={item.detail}
                  eyebrowLabel="Destaque"
                />
              ))}
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
