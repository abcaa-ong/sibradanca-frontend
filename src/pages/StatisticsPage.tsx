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

type RegionCard = {
  title: string
  value: string
  description: string
}

type CityCard = {
  title: string
  value: string
  description: string
}

type SourceCard = {
  title: string
  description: string
  highlights: string[]
}

type TopicCard = {
  title: string
  description: string
}

const overviewCards: OverviewCard[] = [
  {
    label: 'Cadastros neste exemplo',
    value: '5.240',
    description: 'Volume usado para mostrar como o retrato nacional pode ganhar forma em uma apresentação.',
  },
  {
    label: 'Jovens e estudantes',
    value: '2.380',
    description: 'Pessoas em fase de descoberta, formação e crescimento dentro da dança.',
  },
  {
    label: 'Profissionais da área',
    value: '1.960',
    description: 'Pessoas que atuam, trabalham, ensinam, criam ou vivem a dança no dia a dia.',
  },
  {
    label: 'Escolas, grupos e projetos',
    value: '900',
    description: 'Escolas, grupos, companhias, projetos, coletivos e espaços dedicados ao setor.',
  },
]

const sourceCards: SourceCard[] = [
  {
    title: 'Jovens da dança',
    description: 'Mostra quem está começando, estudando e criando vínculo com a dança em diferentes territórios.',
    highlights: ['Faixa etária', 'Modalidades', 'Formação'],
  },
  {
    title: 'Profissionais da área',
    description: 'Ajuda a entender trabalho, trajetória, circulação, renda e temas que pedem mais apoio.',
    highlights: ['Atuação', 'Editais', 'Sustentação da carreira'],
  },
  {
    title: 'Escolas, grupos e projetos',
    description: 'Revela presença institucional, atividade contínua, interiorização e capacidade de formação.',
    highlights: ['Estrutura', 'Território', 'Ação formativa'],
  },
]

const noteCards: NoteCard[] = [
  {
    title: 'Números em visão pública',
    description:
      'Esta página mostra apenas números gerais e recortes amplos. Nenhum cadastro individual aparece aqui.',
    icon: ShieldCheck,
  },
  {
    title: 'Prévia para apresentações',
    description:
      'Os números desta tela foram montados para mostrar como esse acompanhamento pode aparecer quando a base crescer.',
    icon: Database,
  },
  {
    title: 'Alcance nacional da iniciativa',
    description:
      'A ideia é mostrar presença, diversidade e alcance da dança no Brasil de maneira simples e clara.',
    icon: Globe2,
  },
]

const regionCards: RegionCard[] = [
  {
    title: 'Norte',
    value: '655',
    description: 'Participações distribuídas entre capitais, interior e redes locais da região.',
  },
  {
    title: 'Nordeste',
    value: '1.325',
    description: 'Uma das maiores concentrações desta prévia, com forte presença territorial.',
  },
  {
    title: 'Centro-Oeste',
    value: '710',
    description: 'Participações ligadas a formação, grupos e articulação regional.',
  },
  {
    title: 'Sudeste',
    value: '1.710',
    description: 'Maior volume da demonstração, reunindo capitais, interior e polos culturais.',
  },
  {
    title: 'Sul',
    value: '840',
    description: 'Participações de escolas, grupos, profissionais e ações ligadas à dança.',
  },
]

const cityCards: CityCard[] = [
  {
    title: 'Salvador',
    value: '210',
    description: 'Presença forte em formação, grupos, festivais e ações ligadas à dança.',
  },
  {
    title: 'Recife',
    value: '185',
    description: 'Cidade com movimento importante em escolas, coletivos e circulação cultural.',
  },
  {
    title: 'Belo Horizonte',
    value: '172',
    description: 'Participações ligadas a formação, criação, companhias e projetos.',
  },
  {
    title: 'Rio de Janeiro',
    value: '168',
    description: 'Presença de profissionais, instituições e iniciativas de diferentes perfis.',
  },
  {
    title: 'São Paulo',
    value: '160',
    description: 'Concentração relevante de práticas, formação e articulação do setor.',
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

const cityDistribution: ChartItem[] = [
  { name: 'Salvador', value: 210 },
  { name: 'Recife', value: 185 },
  { name: 'Belo Horizonte', value: 172 },
  { name: 'Rio de Janeiro', value: 168 },
  { name: 'São Paulo', value: 160 },
  { name: 'Belém', value: 132 },
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
  { name: 'Já participou de edital', value: 710 },
  { name: 'Foi contemplado', value: 295 },
  { name: 'Busca apoio para escrita', value: 890 },
  { name: 'Busca orientação jurídica', value: 540 },
  { name: 'Busca formação em gestão', value: 760 },
]

const financingDistribution: ChartItem[] = [
  { name: 'Família', value: 980 },
  { name: 'Trabalho próprio', value: 910 },
  { name: 'Instituições', value: 540 },
  { name: 'Bolsas e apoios', value: 420 },
  { name: 'Patrocínios', value: 210 },
]

const contentInterestDistribution: ChartItem[] = [
  { name: 'Cursos e formação', value: 940 },
  { name: 'Festivais e eventos', value: 860 },
  { name: 'Editais e oportunidades', value: 790 },
  { name: 'Conteúdo digital', value: 650 },
  { name: 'Gestão e carreira', value: 520 },
]

const demoTopicCards: TopicCard[] = [
  {
    title: 'Aprendizagem e trajetória',
    description: 'Mostra como as pessoas entram na dança, seguem estudando e constroem permanência no setor.',
  },
  {
    title: 'Território e presença',
    description: 'Ajuda a visualizar onde a dança está mais presente e como ela se espalha pelo país.',
  },
  {
    title: 'Estrutura e apoio',
    description: 'Revela as condições de funcionamento, sustentação e fortalecimento das iniciativas.',
  },
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
              <Badge dark>Demonstração pública</Badge>
              <h1>Uma demonstração de como o Banco Nacional da Dança pode ser visto no Brasil</h1>
              <p className="statistics-hero-description">
                Esta página foi pensada para pitchs, eventos e apresentações do projeto. Ela mostra
                um retrato amplo da iniciativa, sem expor informações pessoais.
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
              title="Um exemplo de como esse retrato nacional pode ganhar forma"
              description="Os números abaixo foram organizados para mostrar, de maneira simples, como esse painel pode ser apresentado em uma demonstração pública."
            />

            <div className="statistics-kpi-grid statistics-kpi-grid--four">
              {overviewCards.map((item) => (
                <article key={item.label} className="card statistics-kpi-card">
                  <span className="eyebrow">Panorama</span>
                  <h3 className="statistics-kpi-title">{item.label}</h3>
                  <strong className="statistics-kpi-value">{item.value}</strong>
                  <p className="card-text">{item.description}</p>
                </article>
              ))}
            </div>

            <div className="statistics-chart-grid two-columns">
              <ChartPanel
                title="Quem aparece nesta leitura"
                data={sectorDistribution}
                eyebrowLabel="Perfis"
                summaryItems={3}
              />
              <ChartPanel
                title="Como os perfis se distribuem"
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
            <SectionTitle
              badge="Leitura dos formulários"
              title="O que esta demonstração pode mostrar sobre a base"
              description="A proposta é reunir, em um mesmo painel, as três frentes do cadastro nacional: jovens, profissionais e instituições."
            />

            <div className="statistics-source-grid">
              {sourceCards.map((item) => (
                <article key={item.title} className="card statistics-source-card">
                  <span className="eyebrow">Parte do cadastro</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <div className="statistics-source-tags">
                    {item.highlights.map((highlight) => (
                      <span key={`${item.title}-${highlight}`} className="statistics-source-tag">
                        {highlight}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div className="statistics-source-grid statistics-source-grid-topics">
              {demoTopicCards.map((item) => (
                <article key={item.title} className="card statistics-source-card">
                  <span className="eyebrow">Tema que aparece aqui</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-space">
          <div className="container">
            <SectionTitle
              badge="Território"
              title="Como a dança pode ser vista por região, estado e município"
              description="Uma leitura pública para mostrar alcance, presença e distribuição da iniciativa pelo país."
            />

            <div className="statistics-chart-grid three-columns">
              <ChartPanel
                title="Presença por região"
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
              <ChartPanel
                title="Peso de cada região no total"
                data={regionDistribution}
                type="pie"
                eyebrowLabel="Regiões"
                summaryItems={5}
              />
            </div>

            <div className="statistics-region-summary">
              {regionCards.map((item) => (
                <article key={item.title} className="card statistics-region-card">
                  <span className="eyebrow">Região</span>
                  <h3>{item.title}</h3>
                  <strong>{item.value}</strong>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>

            <div className="statistics-chart-grid two-columns">
              <ChartPanel
                title="Municípios em destaque"
                data={cityDistribution}
                eyebrowLabel="Municípios"
                summaryItems={6}
              />
              <div className="statistics-city-summary">
                {cityCards.map((item) => (
                  <article key={item.title} className="card statistics-city-card">
                    <span className="eyebrow">Município</span>
                    <h3>{item.title}</h3>
                    <strong>{item.value}</strong>
                    <p>{item.description}</p>
                  </article>
                ))}
              </div>
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
              <ChartPanel
                title="Idades mais presentes"
                data={ageDistribution}
                type="pie"
                eyebrowLabel="Faixas etárias"
                summaryItems={5}
              />
              <ChartPanel
                title="Como as pessoas se identificam"
                data={genderDistribution}
                type="pie"
                eyebrowLabel="Gênero"
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
            <SectionTitle
              badge="Formação e estrutura"
              title="Sinais de formação, continuidade e organização da dança"
              description="Uma leitura sobre formação em dança, presença das instituições e temas que pedem mais apoio."
            />

            <div className="statistics-chart-grid two-columns">
              <ChartPanel
                title="Caminhos de formação"
                data={trainingDistribution}
                eyebrowLabel="Formação"
                summaryItems={5}
              />
              <ChartPanel
                title="Como escolas e grupos se estruturam"
                data={institutionalDistribution}
                eyebrowLabel="Instituições"
                summaryItems={5}
              />
              <ChartPanel
                title="Assuntos que mais pedem apoio"
                data={policyDistribution}
                eyebrowLabel="Temas"
                summaryItems={5}
              />
              <div className="statistics-callout">
                <div className="card statistics-callout-card">
                  <span className="eyebrow">Apresentação</span>
                  <h3>Uma forma de apresentar o movimento da dança no país</h3>
                  <p>
                    Esta prévia mostra crescimento, distribuição, modalidades e retratos do setor
                    sem expor informações pessoais. A leitura completa continua reservada à ONG.
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

        <section className="section-space">
          <div className="container">
            <SectionTitle
              badge="Sustentação e circulação"
              title="Temas que ajudam a entender continuidade, apoio e desenvolvimento"
              description="Esta parte amplia a leitura da demonstração com recortes sobre sustentação da prática, busca por conteúdo e caminhos de fortalecimento da dança."
            />

            <div className="statistics-chart-grid three-columns">
              <ChartPanel
                title="Quem ajuda a sustentar a prática"
                data={financingDistribution}
                eyebrowLabel="Apoio"
                summaryItems={5}
              />
              <ChartPanel
                title="O que as pessoas mais buscam"
                data={contentInterestDistribution}
                eyebrowLabel="Interesses"
                summaryItems={5}
              />
              <ChartPanel
                title="Temas mais citados sobre apoio"
                data={policyDistribution}
                type="pie"
                eyebrowLabel="Fortalecimento"
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
