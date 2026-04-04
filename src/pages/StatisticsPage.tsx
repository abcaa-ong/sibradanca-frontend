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
    label: 'Cadastros de exemplo',
    value: '5.240',
    description: 'Número usado para mostrar como a leitura nacional pode aparecer na tela.',
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
    title: 'Visão pública e segura',
    description:
      'Esta tela mostra só números gerais. Nenhum nome, CPF, telefone, e-mail ou cadastro individual aparece aqui.',
    icon: ShieldCheck,
  },
  {
    title: 'Exemplo para apresentação',
    description:
      'Os números desta página foram criados para mostrar como esse acompanhamento pode aparecer quando a base crescer.',
    icon: Database,
  },
  {
    title: 'Visão nacional do movimento',
    description:
      'A proposta é mostrar o alcance da iniciativa no país, os perfis da dança e os principais retratos do setor.',
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
  { name: 'Em periferias/interior', value: 455 },
]

const policyDistribution: ChartItem[] = [
  { name: 'Já acessou edital', value: 710 },
  { name: 'Foi contemplado', value: 295 },
  { name: 'Precisa de apoio na escrita', value: 890 },
  { name: 'Precisa de orientação jurídica', value: 540 },
  { name: 'Busca formação em gestão', value: 760 },
]

const highlightMetrics = [
  {
    label: 'Presença fora do eixo Rio-São Paulo',
    percent: '72%',
    detail: 'A maior parte dos registros de exemplo está distribuída em outros estados e regiões do país.',
  },
  {
    label: 'Dança ligada à formação',
    percent: '68%',
    detail: 'Participações com ligação com escolas, grupos de estudo, projetos e processos de aprendizagem.',
  },
  {
    label: 'Instituições com atividade contínua',
    percent: '61%',
    detail: 'Organizações com rotina de aulas, ensaios, temporadas, circulação ou ação territorial.',
  },
  {
    label: 'Temas que mais aparecem',
    percent: '45%',
    detail: 'Parte dos registros de exemplo destaca editais, gestão e financiamento como temas centrais.',
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
                Esta tela foi pensada para apresentações e divulgação do projeto. Ela mostra um
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
              title="Um exemplo de como a leitura nacional pode ganhar forma"
              description="Os números abaixo foram organizados para apresentar visualmente o potencial do projeto."
            />

            <div className="statistics-kpi-grid statistics-kpi-grid--four">
              {overviewCards.map((item) => (
                <article key={item.label} className="card statistics-kpi-card">
                  <span className="eyebrow">Resumo</span>
                  <h3 className="statistics-kpi-title">{item.label}</h3>
                  <strong className="statistics-kpi-value">{item.value}</strong>
                  <p className="card-text">{item.description}</p>
                </article>
              ))}
            </div>

            <div className="statistics-chart-grid two-columns">
              <ChartPanel title="Distribuição por perfil" data={sectorDistribution} />
              <ChartPanel title="Participação por perfil" data={sectorDistribution} type="pie" />
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
              <ChartPanel title="Distribuição por região" data={regionDistribution} />
              <ChartPanel title="Estados com maior volume" data={stateDistribution} />
              <ChartPanel title="Regiões no total nacional" data={regionDistribution} type="pie" />
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
              <ChartPanel title="Faixa etária" data={ageDistribution} type="pie" />
              <ChartPanel title="Gênero" data={genderDistribution} type="pie" />
              <ChartPanel title="Modalidades mais presentes" data={modalityDistribution} />
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
              <ChartPanel title="Trajetórias de formação" data={trainingDistribution} />
              <ChartPanel title="Estrutura institucional" data={institutionalDistribution} />
              <ChartPanel title="Temas ligados a apoio público" data={policyDistribution} />
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
