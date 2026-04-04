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
    label: 'Participacoes nesta demonstracao',
    value: '5.240',
    description: 'Exemplo de volume para mostrar como o Banco Nacional da Danca pode aparecer ao publico.',
  },
  {
    label: 'Jovens e estudantes',
    value: '2.380',
    description: 'Participacoes de quem esta comecando, estudando ou fortalecendo seu caminho na danca.',
  },
  {
    label: 'Profissionais da danca',
    value: '1.960',
    description: 'Pessoas que atuam, ensinam, criam ou sustentam sua trajetoria no setor.',
  },
  {
    label: 'Escolas, grupos e projetos',
    value: '900',
    description: 'Instituicoes e iniciativas que mantem formacao, circulacao e presenca territorial.',
  },
]

const sourceCards: SourceCard[] = [
  {
    title: 'Juventudes da danca',
    description: 'Mostra idade, formacao, modalidades e caminhos de permanencia de quem esta chegando ao setor.',
    highlights: ['Faixa etaria', 'Modalidades', 'Formacao'],
  },
  {
    title: 'Profissionais da danca',
    description: 'Aponta trabalho, renda, editais, circulacao e temas que pedem mais apoio.',
    highlights: ['Atuacao', 'Renda', 'Apoio publico'],
  },
  {
    title: 'Instituicoes da danca',
    description: 'Mostra estrutura, territorio, acao formativa e capacidade de continuidade de escolas e grupos.',
    highlights: ['Estrutura', 'Territorio', 'Acao formativa'],
  },
]

const noteCards: NoteCard[] = [
  {
    title: 'Visao publica e segura',
    description: 'Aqui aparecem somente numeros gerais. Nenhuma informacao pessoal e mostrada nesta pagina.',
    icon: ShieldCheck,
  },
  {
    title: 'Panorama da danca no Brasil',
    description: 'Os numeros foram organizados para mostrar, de forma clara, como esse retrato nacional pode aparecer.',
    icon: Database,
  },
  {
    title: 'Presenca da danca pelo pais',
    description: 'A ideia e mostrar alcance, diversidade e distribuicao da danca no Brasil com leitura acessivel.',
    icon: Globe2,
  },
]

const regionCards: RegionCard[] = [
  {
    title: 'Norte',
    value: '655',
    description: 'Participacoes distribuidas entre capitais, interior e redes locais da regiao.',
  },
  {
    title: 'Nordeste',
    value: '1.325',
    description: 'Uma das maiores concentracoes desta previa, com forte presenca territorial.',
  },
  {
    title: 'Centro-Oeste',
    value: '710',
    description: 'Participacoes ligadas a formacao, grupos e articulacao regional.',
  },
  {
    title: 'Sudeste',
    value: '1.710',
    description: 'Maior volume desta leitura, reunindo capitais, interior e polos culturais.',
  },
  {
    title: 'Sul',
    value: '840',
    description: 'Participacoes de escolas, grupos, profissionais e acoes continuas na danca.',
  },
]

const cityCards: CityCard[] = [
  {
    title: 'Salvador',
    value: '210',
    description: 'Presenca forte em formacao, grupos, festivais e acoes ligadas a danca.',
  },
  {
    title: 'Recife',
    value: '185',
    description: 'Cidade com movimento importante em escolas, coletivos e circulacao cultural.',
  },
  {
    title: 'Belo Horizonte',
    value: '172',
    description: 'Participacoes ligadas a criacao, companhias, estudos e projetos.',
  },
  {
    title: 'Rio de Janeiro',
    value: '168',
    description: 'Presenca de profissionais, instituicoes e iniciativas de diferentes perfis.',
  },
  {
    title: 'Sao Paulo',
    value: '160',
    description: 'Concentracao relevante de praticas, formacao e articulacao do setor.',
  },
  {
    title: 'Belem',
    value: '132',
    description: 'Leitura importante da regiao Norte, com escolas, grupos e articulacoes locais.',
  },
]

const sectorDistribution: ChartItem[] = [
  { name: 'Jovens', value: 2380 },
  { name: 'Profissionais', value: 1960 },
  { name: 'Instituicoes', value: 900 },
]

const regionDistribution: ChartItem[] = [
  { name: 'Sudeste', value: 1710 },
  { name: 'Nordeste', value: 1325 },
  { name: 'Sul', value: 840 },
  { name: 'Centro-Oeste', value: 710 },
  { name: 'Norte', value: 655 },
]

const stateDistribution: ChartItem[] = [
  { name: 'Sao Paulo', value: 620 },
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
  { name: 'Sao Paulo', value: 160 },
  { name: 'Belem', value: 132 },
]

const ageDistribution: ChartItem[] = [
  { name: 'Ate 17 anos', value: 2290 },
  { name: '18 a 24 anos', value: 980 },
  { name: '25 a 34 anos', value: 1135 },
  { name: '35 a 49 anos', value: 610 },
  { name: '50 anos ou mais', value: 225 },
]

const genderDistribution: ChartItem[] = [
  { name: 'Mulheres', value: 2810 },
  { name: 'Homens', value: 1710 },
  { name: 'Nao binario', value: 290 },
  { name: 'Outro ou nao informado', value: 430 },
]

const modalityDistribution: ChartItem[] = [
  { name: 'Ballet classico', value: 960 },
  { name: 'Dancas urbanas', value: 890 },
  { name: 'Danca contemporanea', value: 780 },
  { name: 'Dancas populares', value: 710 },
  { name: 'Jazz', value: 655 },
  { name: 'Danca de salao', value: 520 },
]

const trainingDistribution: ChartItem[] = [
  { name: 'Estudam atualmente', value: 1430 },
  { name: 'Autodidatas', value: 860 },
  { name: 'Formacao tecnica', value: 720 },
  { name: 'Graduacao', value: 480 },
  { name: 'Pos-graduacao', value: 170 },
]

const institutionalDistribution: ChartItem[] = [
  { name: 'Com acao formativa', value: 620 },
  { name: 'Com programacao anual', value: 540 },
  { name: 'Com CNPJ', value: 510 },
  { name: 'Com bolsas e apoios', value: 290 },
  { name: 'No interior e periferias', value: 455 },
]

const policyDistribution: ChartItem[] = [
  { name: 'Ja participou de edital', value: 710 },
  { name: 'Foi contemplado', value: 295 },
  { name: 'Busca apoio para escrita', value: 890 },
  { name: 'Busca orientacao juridica', value: 540 },
  { name: 'Busca formacao em gestao', value: 760 },
]

const financingDistribution: ChartItem[] = [
  { name: 'Familia', value: 980 },
  { name: 'Trabalho proprio', value: 910 },
  { name: 'Instituicoes', value: 540 },
  { name: 'Bolsas e apoios', value: 420 },
  { name: 'Patrocinios', value: 210 },
]

const contentInterestDistribution: ChartItem[] = [
  { name: 'Cursos e formacao', value: 940 },
  { name: 'Festivais e eventos', value: 860 },
  { name: 'Editais e oportunidades', value: 790 },
  { name: 'Conteudo digital', value: 650 },
  { name: 'Gestao e carreira', value: 520 },
]

const demoTopicCards: TopicCard[] = [
  {
    title: 'Aprendizagem e trajetoria',
    description: 'Mostra como as pessoas entram na danca, seguem estudando e constroem permanencia no setor.',
  },
  {
    title: 'Territorio e presenca',
    description: 'Ajuda a visualizar onde a danca esta mais presente e como ela se espalha pelo pais.',
  },
  {
    title: 'Estrutura e apoio',
    description: 'Revela condicoes de funcionamento, sustentacao e fortalecimento das iniciativas.',
  },
]

const highlightMetrics = [
  {
    label: 'Presenca fora do eixo Rio-Sao Paulo',
    percent: '72%',
    detail: 'A maior parte dos registros desta previa esta distribuida em outros estados e regioes do pais.',
  },
  {
    label: 'Ligacao com formacao',
    percent: '68%',
    detail: 'Boa parte das participacoes passa por escolas, grupos de estudo e processos de aprendizagem.',
  },
  {
    label: 'Atividade continua',
    percent: '61%',
    detail: 'Muitas instituicoes mantem aulas, ensaios, temporadas, circulacao ou acao territorial.',
  },
  {
    label: 'Temas que mais aparecem',
    percent: '45%',
    detail: 'Editais, gestao e financiamento aparecem com frequencia entre os assuntos mais citados.',
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
              <img src={logo} alt="Logo SIBRADANCA" />
            </div>
          </div>

          <nav className="desktop-nav">
            <Link to="/">Pagina inicial</Link>
            <Link to="/">Formularios</Link>
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
              <span>Pagina inicial</span>
            </Link>

            <Link to="/" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>
              <ClipboardList size={18} />
              <span>Formularios</span>
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
              <Badge dark>Estatisticas nacionais</Badge>
              <h1>O Banco Nacional da Danca do Brasil em numeros</h1>
              <p className="statistics-hero-description">
                Esta demonstracao mostra como o projeto pode apresentar ao publico um retrato da
                danca no Brasil, com informacoes gerais sobre territorios, perfis e modalidades.
              </p>
            </div>

            <div className="statistics-hero-actions">
              <Link to="/" className="btn btn-primary btn-large">
                <ArrowLeft size={18} />
                Voltar para os formularios
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
              badge="Visao geral"
              title="Um retrato nacional da danca em numeros"
              description="Os numeros abaixo ajudam a visualizar como essa apresentacao pode mostrar a forca e a diversidade da danca no pais."
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
              badge="Leitura dos formularios"
              title="O que os formularios ajudam a revelar sobre a danca no Brasil"
              description="Jovens, profissionais e instituicoes aparecem aqui de forma reunida, sem expor informacoes pessoais."
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
                  <span className="eyebrow">Tema desta leitura</span>
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
              badge="Territorio"
              title="A danca pelo Brasil"
              description="Regioes, estados e municipios ajudam a mostrar onde essa mobilizacao nacional ganha presenca."
            />

            <div className="statistics-chart-grid three-columns">
              <ChartPanel
                title="Presenca por regiao"
                data={regionDistribution}
                eyebrowLabel="Regioes"
                summaryItems={5}
              />
              <ChartPanel
                title="Estados com maior presenca"
                data={stateDistribution}
                eyebrowLabel="Estados"
                summaryItems={6}
              />
              <ChartPanel
                title="Peso de cada regiao no total"
                data={regionDistribution}
                type="pie"
                eyebrowLabel="Regioes"
                summaryItems={5}
              />
            </div>

            <div className="statistics-region-summary">
              {regionCards.map((item) => (
                <article key={item.title} className="card statistics-region-card">
                  <span className="eyebrow">Regiao</span>
                  <h3>{item.title}</h3>
                  <strong>{item.value}</strong>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>

            <div className="statistics-chart-grid two-columns statistics-city-stage">
              <ChartPanel
                title="Municipios em destaque"
                data={cityDistribution}
                eyebrowLabel="Municipios"
                summaryItems={6}
              />
              <div className="statistics-city-summary">
                {cityCards.map((item) => (
                  <article key={item.title} className="card statistics-city-card">
                    <span className="eyebrow">Municipio</span>
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
              badge="Perfis da danca"
              title="Quem faz parte desse retrato nacional"
              description="Idades, identidades e modalidades ajudam a mostrar a diversidade da danca no Brasil."
            />

            <div className="statistics-chart-grid three-columns">
              <ChartPanel
                title="Idades mais presentes"
                data={ageDistribution}
                type="pie"
                eyebrowLabel="Faixas etarias"
                summaryItems={5}
              />
              <ChartPanel
                title="Como as pessoas se identificam"
                data={genderDistribution}
                type="pie"
                eyebrowLabel="Genero"
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
              badge="Formacao e estrutura"
              title="Como a danca se organiza e segue crescendo"
              description="Aqui aparecem caminhos de estudo, presenca das instituicoes e temas que pedem mais apoio."
            />

            <div className="statistics-chart-grid two-columns">
              <ChartPanel
                title="Caminhos de formacao"
                data={trainingDistribution}
                eyebrowLabel="Formacao"
                summaryItems={5}
              />
              <ChartPanel
                title="Como escolas e grupos se estruturam"
                data={institutionalDistribution}
                eyebrowLabel="Instituicoes"
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
                  <span className="eyebrow">Apresentacao publica</span>
                  <h3>Uma forma de mostrar o movimento da danca no Brasil</h3>
                  <p>
                    Esta demonstracao mostra crescimento, distribuicao, modalidades e diferentes
                    retratos da danca. A leitura completa segue no ambiente interno da ONG.
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
              badge="Sustentacao e circulacao"
              title="O que fortalece a continuidade da danca"
              description="Apoio, formacao e circulacao ajudam a entender como a danca segue viva em diferentes contextos."
            />

            <div className="statistics-chart-grid three-columns">
              <ChartPanel
                title="Quem ajuda a sustentar a pratica"
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
            <img src={logo} alt="Logo SIBRADANCA" />
            <p>
              <strong>SIBRADANCA - Sistema Brasileiro de Evidencias da Danca</strong>
            </p>
          </div>

          <div className="footer-links">
            <Link to="/">Formularios</Link>
            <Link to="/estatisticas-nacionais">Estatisticas nacionais</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SIBRADANCA · Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  )
}
