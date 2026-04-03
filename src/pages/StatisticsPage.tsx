import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Download, FileText, House, Instagram, Menu, X } from "lucide-react";

import logo from "../assets/logo-sibradanca.png";
import { Badge } from "../components/Badge";
import { ChartPanel } from "../components/ChartPanel";
import { MetricCard } from "../components/MetricCard";
import { SectionTitle } from "../components/SectionTitle";
import { listStates } from "../services/geo.services";
import {
  exportStatisticsCsv,
  exportStatisticsPdf,
  getStatisticsDashboard,
} from "../services/statistics.service";
import type { StateResponse } from "../types/geo";
import type {
  ChartItem,
  StatisticsDashboardResponse,
  StatisticsDetailsResponse,
  StatisticsOverviewResponse,
  StatisticsProfileResponse,
} from "../types/statistics";

type OverviewCardItem = {
  label: string;
  value: string;
};

type MetricCardItem = {
  label: string;
  percent: string;
  detail: string;
};

const sectorOptions = [
  { label: "Todos os setores", value: "" },
  { label: "Jovens da dança", value: "YOUTH" },
  { label: "Profissionais da dança", value: "PROFESSIONAL" },
  { label: "Instituições da dança", value: "INSTITUTION" },
];

const regionOptions = [
  { label: "Todas as regiões", value: "" },
  { label: "Norte", value: "NORTH" },
  { label: "Nordeste", value: "NORTHEAST" },
  { label: "Centro-Oeste", value: "CENTRAL_WEST" },
  { label: "Sudeste", value: "SOUTHEAST" },
  { label: "Sul", value: "SOUTH" },
];

const STATE_REGION_BY_CODE: Record<string, string> = {
  AC: "NORTH",
  AP: "NORTH",
  AM: "NORTH",
  PA: "NORTH",
  RO: "NORTH",
  RR: "NORTH",
  TO: "NORTH",

  AL: "NORTHEAST",
  BA: "NORTHEAST",
  CE: "NORTHEAST",
  MA: "NORTHEAST",
  PB: "NORTHEAST",
  PE: "NORTHEAST",
  PI: "NORTHEAST",
  RN: "NORTHEAST",
  SE: "NORTHEAST",

  DF: "CENTRAL_WEST",
  GO: "CENTRAL_WEST",
  MT: "CENTRAL_WEST",
  MS: "CENTRAL_WEST",

  ES: "SOUTHEAST",
  MG: "SOUTHEAST",
  RJ: "SOUTHEAST",
  SP: "SOUTHEAST",

  PR: "SOUTH",
  RS: "SOUTH",
  SC: "SOUTH",
};

function normalizeRegionValue(value?: string) {
  const normalized =
    value
      ?.trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_") ?? "";

  if (normalized === "MIDWEST") {
    return "CENTRAL_WEST";
  }

  return normalized;
}

function normalizeStateList(states: StateResponse[]): StateResponse[] {
  return states.map((item) => {
    const normalizedCode = item.code.trim().toUpperCase();

    return {
      ...item,
      code: normalizedCode,
      region:
        normalizeRegionValue(item.region) ||
        STATE_REGION_BY_CODE[normalizedCode] ||
        "",
    };
  });
}

const allStatesOption: StateResponse = {
  code: "",
  name: "Todos os estados",
  region: "",
};

const emptyOverview: StatisticsOverviewResponse = {
  totalYouth: 0,
  totalProfessionals: 0,
  totalInstitutions: 0,
  totalResponses: 0,
};

const createEmptyChart = (labels: string[]): ChartItem[] =>
  labels.map((name) => ({ name, value: 0 }));

const emptyProfile: StatisticsProfileResponse = {
  ageDistribution: createEmptyChart(["Até 17", "18 a 24", "25 a 34", "35+"]),
  genderDistribution: createEmptyChart([
    "Feminino",
    "Masculino",
    "Não binário",
    "Outro / NI",
  ]),
};

const emptyDetails: StatisticsDetailsResponse = {
  modalities: createEmptyChart([
    "Ballet Clássico",
    "Dança Contemporânea",
    "Jazz",
    "Hip Hop / Street Dance",
    "Dança de Salão",
  ]),
  incomeDistribution: createEmptyChart([
    "Até 1 SM",
    "1 a 2 SM",
    "2 a 3 SM",
    "3 a 5 SM",
    "5+ SM",
  ]),
  publicCallsParticipation: createEmptyChart([
    "Já participou",
    "Foi contemplado",
    "Não foi contemplado",
  ]),
  financingDistribution: createEmptyChart([
    "Você",
    "Família",
    "Escola",
    "Edital",
    "Patrocínio",
  ]),
  courseCostDistribution: createEmptyChart([
    "Não se aplica",
    "Até R$ 100",
    "R$ 101 a R$ 300",
    "R$ 301+",
  ]),
  monthlyFeeDistribution: createEmptyChart([
    "Não se aplica",
    "Até R$ 100",
    "R$ 101 a R$ 300",
    "R$ 301+",
  ]),
  monthlyRevenueDistribution: createEmptyChart([
    "Até R$ 5 mil",
    "R$ 5 mil a R$ 15 mil",
    "R$ 15 mil a R$ 30 mil",
    "R$ 30 mil+",
  ]),
  danceEducationDistribution: createEmptyChart([
    "Livre",
    "Técnica",
    "Graduação",
    "Pós-graduação",
    "Autodidata",
  ]),
  costumesCostDistribution: createEmptyChart([
    "Não se aplica",
    "Até R$ 100",
    "R$ 101 a R$ 300",
    "R$ 301+",
  ]),
  editalDifficultyDistribution: createEmptyChart([
    "Falta de informação",
    "Escrita do projeto",
    "Documentação",
    "Prazos curtos",
    "Burocracia",
  ]),
  educationIndicators: createEmptyChart([
    "Estuda atualmente",
    "Quer formação formal",
    "Possui formação formal",
    "Autodidata",
  ]),
  institutionIndicators: createEmptyChart([
    "Com CNPJ",
    "Usam sistema de gestão",
    "Oferecem bolsas",
  ]),
};

const emptyDashboard: StatisticsDashboardResponse = {
  overview: emptyOverview,
  profile: emptyProfile,
  details: emptyDetails,
};

const numberFormatter = new Intl.NumberFormat("pt-BR");

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatPercent(numerator: number, denominator: number) {
  if (!denominator) {
    return "0%";
  }

  return `${Math.round((numerator / denominator) * 100)}%`;
}

function buildOverviewCards(
  overview: StatisticsOverviewResponse,
): OverviewCardItem[] {
  return [
    {
      label: "Total de cadastros",
      value: formatNumber(overview.totalResponses),
    },
    { label: "Jovens da dança", value: formatNumber(overview.totalYouth) },
    {
      label: "Profissionais da dança",
      value: formatNumber(overview.totalProfessionals),
    },
    {
      label: "Instituições da dança",
      value: formatNumber(overview.totalInstitutions),
    },
  ];
}

function buildSectorDistribution(
  overview: StatisticsOverviewResponse,
): ChartItem[] {
  return [
    { name: "Jovens", value: overview.totalYouth },
    { name: "Profissionais", value: overview.totalProfessionals },
    { name: "Instituições", value: overview.totalInstitutions },
  ];
}

function findChartValue(items: ChartItem[], name: string) {
  return items.find((item) => item.name === name)?.value ?? 0;
}

function sumChartValues(items: ChartItem[]) {
  return items.reduce((total, item) => total + item.value, 0);
}

function buildMetricCard(
  label: string,
  value: number,
  total: number,
  subject: string,
): MetricCardItem {
  return {
    label,
    percent: formatPercent(value, total),
    detail: `${formatNumber(value)} de ${formatNumber(total)} ${subject}.`,
  };
}

function buildEconomyCards(
  details: StatisticsDetailsResponse,
  overview: StatisticsOverviewResponse,
): MetricCardItem[] {
  const professionals = overview.totalProfessionals;
  const institutions = overview.totalInstitutions;
  const familyFinanced = findChartValue(
    details.financingDistribution,
    "Família",
  );
  const aboveOneMinimumWage =
    sumChartValues(details.incomeDistribution) -
    findChartValue(details.incomeDistribution, "Até 1 SM");

  return [
    buildMetricCard(
      "Renda acima de 1 SM",
      aboveOneMinimumWage,
      professionals,
      "profissionais",
    ),
    buildMetricCard(
      "Instituições com CNPJ",
      findChartValue(details.institutionIndicators, "Com CNPJ"),
      institutions,
      "instituições",
    ),
    buildMetricCard(
      "Custeados pela família",
      familyFinanced,
      professionals,
      "profissionais",
    ),
    buildMetricCard(
      "Usam sistema de gestão",
      findChartValue(details.institutionIndicators, "Usam sistema de gestão"),
      institutions,
      "instituições",
    ),
  ];
}

function buildEducationCards(
  details: StatisticsDetailsResponse,
  overview: StatisticsOverviewResponse,
): MetricCardItem[] {
  const professionals = overview.totalProfessionals;

  return [
    buildMetricCard(
      "Estuda dança atualmente",
      findChartValue(details.educationIndicators, "Estuda atualmente"),
      professionals,
      "profissionais",
    ),
    buildMetricCard(
      "Quer formação formal",
      findChartValue(details.educationIndicators, "Quer formação formal"),
      professionals,
      "profissionais",
    ),
    buildMetricCard(
      "Possui formação formal",
      findChartValue(details.educationIndicators, "Possui formação formal"),
      professionals,
      "profissionais",
    ),
    buildMetricCard(
      "Autodidata",
      findChartValue(details.educationIndicators, "Autodidata"),
      professionals,
      "profissionais",
    ),
  ];
}

function buildPublicPolicyCards(
  details: StatisticsDetailsResponse,
  overview: StatisticsOverviewResponse,
): MetricCardItem[] {
  const professionals = overview.totalProfessionals;

  return [
    buildMetricCard(
      "Já participou de edital",
      findChartValue(details.publicCallsParticipation, "Já participou"),
      professionals,
      "profissionais",
    ),
    buildMetricCard(
      "Foi contemplado",
      findChartValue(details.publicCallsParticipation, "Foi contemplado"),
      professionals,
      "profissionais",
    ),
    buildMetricCard(
      "Não foi contemplado",
      findChartValue(details.publicCallsParticipation, "Não foi contemplado"),
      professionals,
      "profissionais",
    ),
    buildMetricCard(
      "Falta de informação",
      findChartValue(
        details.editalDifficultyDistribution,
        "Falta de informação",
      ),
      professionals,
      "profissionais",
    ),
  ];
}

function downloadBlob(blob: Blob, filename: string) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function StatisticsPage() {
  const [sector, setSector] = useState("");
  const [region, setRegion] = useState("");
  const [state, setState] = useState(allStatesOption.code);
  const [stateOptions, setStateOptions] = useState<StateResponse[]>([
    allStatesOption,
  ]);
  const [overview, setOverview] =
    useState<StatisticsOverviewResponse>(emptyOverview);
  const [profile, setProfile] =
    useState<StatisticsProfileResponse>(emptyProfile);
  const [details, setDetails] =
    useState<StatisticsDetailsResponse>(emptyDetails);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadStatistics() {
      try {
        setIsLoading(true);
        setError(null);

        const territorialFilters =
          state && state.trim() !== ""
            ? { stateCode: state }
            : region && region.trim() !== ""
              ? { region }
              : {};

        const statisticsFilters = {
          ...territorialFilters,
          ...(sector ? { sector } : {}),
        };

        const [statesResponse, dashboardResponse] = await Promise.all([
          listStates(),
          getStatisticsDashboard(statisticsFilters),
        ]);

        if (!isMounted) {
          return;
        }

        setStateOptions([
          allStatesOption,
          ...normalizeStateList(statesResponse),
        ]);
        setOverview(dashboardResponse.overview ?? emptyDashboard.overview);
        setProfile(dashboardResponse.profile ?? emptyDashboard.profile);
        setDetails(dashboardResponse.details ?? emptyDashboard.details);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar o painel estatístico.",
        );
        setOverview(emptyOverview);
        setProfile(emptyProfile);
        setDetails(emptyDetails);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadStatistics();

    return () => {
      isMounted = false;
    };
  }, [state, region, sector]);

  useEffect(() => {
    if (!region) {
      return;
    }

    const normalizedRegion = normalizeRegionValue(region);

    const stateStillValid = stateOptions.some(
      (item) =>
        item.code === state &&
        normalizeRegionValue(item.region) === normalizedRegion,
    );

    if (state && !stateStillValid) {
      setState("");
    }
  }, [region, state, stateOptions]);

  const filteredStateOptions = useMemo(() => {
    const realStates = stateOptions.filter((item) => item.code !== "");
    const normalizedRegion = normalizeRegionValue(region);

    if (!normalizedRegion) {
      return [allStatesOption, ...realStates];
    }

    const regionStates = realStates.filter(
      (item) => normalizeRegionValue(item.region) === normalizedRegion,
    );

    return [allStatesOption, ...regionStates];
  }, [stateOptions, region]);

  const overviewCards = useMemo(() => buildOverviewCards(overview), [overview]);
  const sectorDistributionData = useMemo(
    () => buildSectorDistribution(overview),
    [overview],
  );
  const economyCards = useMemo(
    () => buildEconomyCards(details, overview),
    [details, overview],
  );
  const educationCards = useMemo(
    () => buildEducationCards(details, overview),
    [details, overview],
  );
  const publicPolicyCards = useMemo(
    () => buildPublicPolicyCards(details, overview),
    [details, overview],
  );

  const ageData = useMemo(() => profile.ageDistribution, [profile]);
  const genderData = useMemo(() => profile.genderDistribution, [profile]);
  const modalitiesData = useMemo(() => details.modalities, [details]);
  const incomeData = useMemo(() => details.incomeDistribution, [details]);
  const publicCallsParticipationData = useMemo(
    () => details.publicCallsParticipation,
    [details],
  );
  const financingData = useMemo(() => details.financingDistribution, [details]);
  const costCoursesData = useMemo(
    () => details.courseCostDistribution,
    [details],
  );
  const monthlyFeeData = useMemo(
    () => details.monthlyFeeDistribution,
    [details],
  );
  const monthlyRevenueData = useMemo(
    () => details.monthlyRevenueDistribution,
    [details],
  );
  const danceEducationLevelData = useMemo(
    () => details.danceEducationDistribution,
    [details],
  );
  const costumesCostData = useMemo(
    () => details.costumesCostDistribution,
    [details],
  );
  const institutionIndicatorsData = useMemo(
    () => details.institutionIndicators,
    [details],
  );
  const mainEditalDifficultiesData = useMemo(
    () => details.editalDifficultyDistribution,
    [details],
  );

  const hasOverviewData = overview.totalResponses > 0;

  const handleExportCsv = async () => {
    try {
      const response = await exportStatisticsCsv({
        ...(state ? { stateCode: state } : {}),
        ...(region ? { region } : {}),
        ...(sector ? { sector } : {}),
      });
      downloadBlob(response.blob, response.filename ?? "sibradanca-estatisticas.csv");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível gerar o arquivo solicitado.");
    }
  };

  const handleExportPdf = async () => {
    try {
      const response = await exportStatisticsPdf({
        ...(state ? { stateCode: state } : {}),
        ...(region ? { region } : {}),
        ...(sector ? { sector } : {}),
      });
      downloadBlob(response.blob, response.filename ?? "sibradanca-estatisticas.pdf");
      return;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível gerar o arquivo solicitado.");
      return;
    }
    /*
    const [{ jsPDF }, { autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);

    const doc = new jsPDF();
    const generatedAt = new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date());

    doc.setFontSize(14);
    doc.text("Relatório Estatístico - SIBRADANÇA", 14, 16);
    doc.setFontSize(10);
    doc.text(`Setor: ${selectedSectorLabel}`, 14, 24);
    doc.text(`Região: ${selectedRegionLabel}`, 14, 30);
    doc.text(`Estado: ${selectedStateLabel}`, 14, 36);
    doc.text(`Gerado em: ${generatedAt}`, 14, 42);

    autoTable(doc, {
      startY: 48,
      head: [["Categoria", "Indicador", "Valor", "Detalhe"]],
      body: exportRows.map((row) => [
        row.categoria,
        row.indicador,
        String(row.valor),
        row.detalhe,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 24, 40] },
    });

    doc.save("sibradanca-estatisticas.pdf");
    */
  };

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
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen ? (
          <div className="mobile-menu">
            <Link
              to="/"
              className="mobile-menu-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <House size={18} />
              <span>Página inicial</span>
            </Link>

            {/* <Link
              to="/estatisticas"
              className="mobile-menu-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FileText size={18} />
              <span>Painel estatístico</span>
            </Link> */}

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
              <Badge dark>Painel Estatístico</Badge>
              <h1>
                Dados agregados e anonimizados do mapeamento nacional da dança
              </h1>
            </div>

            <div className="statistics-toolbar card">
              <div className="statistics-filters">
                <label className="access-field">
                  <span>Setor</span>
                  <select
                    value={sector}
                    onChange={(event) => setSector(event.target.value)}
                  >
                    {sectorOptions.map((item) => (
                      <option key={item.value || "ALL"} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="access-field">
                  <span>Região</span>
                  <select
                    value={region}
                    onChange={(event) => setRegion(event.target.value)}
                  >
                    {regionOptions.map((item) => (
                      <option key={item.value || "ALL"} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="access-field">
                  <span>Estado</span>
                  <select
                    value={state}
                    onChange={(event) => setState(event.target.value)}
                  >
                    {filteredStateOptions.map((item) => (
                      <option key={item.code || "ALL"} value={item.code}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="statistics-export-actions">
                <button className="btn btn-primary" onClick={handleExportCsv}>
                  <Download size={16} /> Exportar CSV
                </button>
                <button className="btn btn-primary" onClick={handleExportPdf}>
                  <FileText size={16} /> Exportar PDF
                </button>
              </div>
            </div>

            {isLoading ? (
              <div
                className="card"
                style={{ marginTop: "1rem", padding: "1rem 1.25rem" }}
              >
                Carregando resumo estatístico...
              </div>
            ) : null}

            {error ? (
              <div
                className="card"
                style={{
                  marginTop: "1rem",
                  padding: "1rem 1.25rem",
                  color: "#991b1b",
                }}
              >
                <strong>Não foi possível carregar os dados.</strong>
                <p style={{ marginTop: "0.5rem" }}>{error}</p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="section-space">
          <div className="container">
            <div className="section-title statistics-section-title">
              <h2>Visão geral</h2>
              <p>
                {hasOverviewData
                  ? "Esses dados estão em tempo real."
                  : "Sem dados reais no momento."}
              </p>
            </div>

            <div className="statistics-kpi-grid">
              {overviewCards.map((item) => (
                <div key={item.label} className="card statistics-kpi-card">
                  <span className="eyebrow">Resumo</span>
                  <h3 className="statistics-kpi-title">{item.label}</h3>
                  <strong className="statistics-kpi-value">{item.value}</strong>
                </div>
              ))}
            </div>

            <div className="statistics-chart-grid two-columns">
              <ChartPanel
                title="Cadastros por setor"
                data={sectorDistributionData}
                isLoading={isLoading}
                emptyMessage="Carregando dados..."
              />
              <ChartPanel
                title="Participação por setor"
                data={sectorDistributionData}
                type="pie"
                isLoading={isLoading}
                emptyMessage="Carregando dados..."
              />
            </div>
          </div>
        </section>

        <section className="section-space">
          <div className="container">
            <SectionTitle
              badge="Perfil da Dança no Brasil"
              title="Dados de perfil da dança no Brasil"
              description="Indicadores por idade, gênero, modalidade e território."
            />

            <div className="statistics-chart-grid three-columns">
              <ChartPanel
                title="Distribuição por faixa etária"
                data={ageData}
                type="pie"
                isLoading={isLoading}
              />
              <ChartPanel
                title="Distribuição por gênero"
                data={genderData}
                type="pie"
                isLoading={isLoading}
              />
              <ChartPanel
                title="Modalidades mais praticadas"
                data={modalitiesData}
                isLoading={isLoading}
              />
            </div>
          </div>
        </section>

        <section className="section-space">
          <div className="container">
            <SectionTitle
              badge="Economia da Dança"
              title="Indicadores econômicos e de estrutura"
              description="Leitura agregada de renda, custeio e estrutura institucional."
            />

            <div className="statistics-metric-grid">
              {economyCards.map((item) => (
                <MetricCard
                  key={item.label}
                  label={item.label}
                  percent={item.percent}
                  detail={item.detail}
                />
              ))}
            </div>

            <div className="statistics-chart-grid two-columns">
              <ChartPanel
                title="Faixa de renda (profissionais)"
                data={incomeData}
                isLoading={isLoading}
              />
              <ChartPanel title="Quem financia a dança" data={financingData} isLoading={isLoading} />
              <ChartPanel
                title="Gasto com cursos e formações"
                data={costCoursesData}
                isLoading={isLoading}
              />
              <ChartPanel title="Gasto com mensalidade" data={monthlyFeeData} isLoading={isLoading} />
              <ChartPanel
                title="Estrutura institucional"
                data={institutionIndicatorsData}
                isLoading={isLoading}
              />
              <ChartPanel
                title="Faturamento mensal (instituições)"
                data={monthlyRevenueData}
                isLoading={isLoading}
              />
            </div>
          </div>
        </section>

        <section className="section-space">
          <div className="container">
            <SectionTitle
              badge="Formação em Dança"
              title="Acesso, continuidade e níveis de formação"
              description="Indicadores sobre estudo atual, formação formal e autodidatismo."
            />

            <div className="statistics-metric-grid">
              {educationCards.map((item) => (
                <MetricCard
                  key={item.label}
                  label={item.label}
                  percent={item.percent}
                  detail={item.detail}
                />
              ))}
            </div>

            <div className="statistics-chart-grid two-columns">
              <ChartPanel
                title="Nível de formação em dança"
                data={danceEducationLevelData}
                isLoading={isLoading}
              />
              <ChartPanel title="Gasto com figurinos" data={costumesCostData} isLoading={isLoading} />
            </div>
          </div>
        </section>

        <section className="section-space">
          <div className="container">
            <SectionTitle
              badge="Políticas Públicas"
              title="Participação, acesso e dificuldades em mecanismos públicos"
              description="Indicadores sobre editais e barreiras relatadas."
            />

            <div className="statistics-metric-grid">
              {publicPolicyCards.map((item) => (
                <MetricCard
                  key={item.label}
                  label={item.label}
                  percent={item.percent}
                  detail={item.detail}
                />
              ))}
            </div>

            <div className="statistics-chart-grid two-columns">
              <ChartPanel
                title="Participação em editais"
                data={publicCallsParticipationData}
                isLoading={isLoading}
              />
              <ChartPanel
                title="Principais dificuldades com editais"
                data={mainEditalDifficultiesData}
                isLoading={isLoading}
              />
            </div>

            <p className="statistics-footer-note">
              Dados anonimizados • Atualização contínua •
            </p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <img src={logo} alt="Logo SIBRADANÇA" />
            <p>
              <strong>
                SIBRADANÇA – Sistema Brasileiro de Evidências da Dança
              </strong>
            </p>
          </div>

          <div className="footer-links">
            <a href="#">Atualizar dados</a>
            <a href="#">Política de privacidade</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} SIBRADANÇA · Todos os direitos
            reservados
          </p>
        </div>
      </footer>
    </div>
  );
}
