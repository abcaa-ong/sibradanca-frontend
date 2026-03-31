# SIBRADANÇA Web App

Frontend do projeto **SIBRADANÇA**, desenvolvido para oferecer uma experiência institucional moderna, responsiva e organizada, com foco em dois grandes fluxos:

- **acesso aos formulários por setor**
- **visualização pública de estatísticas e indicadores**

A aplicação foi estruturada para separar claramente a navegação institucional da camada analítica, facilitando manutenção, evolução e integração incremental com o backend.

---

## Objetivo do projeto

O SIBRADANÇA Web App foi pensado para:

- apresentar o projeto de forma institucional e acessível
- direcionar usuários para o formulário correto de acordo com o setor
- centralizar indicadores e dados públicos em uma página analítica específica
- permitir evolução gradual da integração com o backend sem comprometer a experiência do usuário

---

## Estrutura atual da aplicação

Atualmente, o frontend está dividido em duas áreas principais:

### 1. HomePage
Responsável por:
- apresentação institucional do projeto
- navegação principal
- acesso aos formulários por setor
- redirecionamento para a página de estatísticas

### 2. StatisticsPage
Responsável por:
- exibição dos indicadores principais
- leitura analítica dos dados disponíveis no backend
- exportação de relatórios
- preparação da interface para futuros endpoints estatísticos

---

## Tecnologias utilizadas

- **React**
- **TypeScript**
- **Vite**
- **React Router DOM**
- **Framer Motion**
- **Recharts**
- **jsPDF**
- **XLSX**
- **Lucide React**

---

## Funcionalidades implementadas

### Home
- layout institucional com identidade visual do projeto
- navegação por setores
- cards de acesso para:
  - Jovens da Dança
  - Profissionais da Dança
  - Escolas, grupos e companhias
- botão para acesso ao painel de estatísticas
- estrutura preparada para menu responsivo/mobile

### Formulários por setor
Cada setor possui uma rota própria de entrada, permitindo abrir diretamente o fluxo correspondente:

- `/formulario/jovens`
- `/formulario/profissionais`
- `/formulario/instituicoes`

### Estatísticas Nacionais
- página dedicada exclusivamente para dados e indicadores
- consumo do endpoint real de resumo estatístico
- renderização dos cards principais de visão geral
- gráficos baseados no overview disponível
- exportação em:
  - CSV
  - Excel
  - PDF

---

## Rotas da aplicação

| Rota | Descrição |
|------|-----------|
| `/` | Página inicial |
| `/estatisticas-nacionais` | Painel estatístico |
| `/formulario/:sector` | Formulário por setor |

---

## Estrutura principal do projeto

```txt
src/
  assets/
  components/
    AccessFloatingMenu.tsx
    Badge.tsx
    Button.tsx
    Card.tsx
    ChartPanel.tsx
    MetricCard.tsx
    SectionTitle.tsx

  pages/
    HomePage.tsx
    SectorFormPage.tsx
    StatisticsPage.tsx

  routes/
    AppRoutes.tsx

  services/
    api.ts
    statistics.service.ts
    forms.service.ts
    geo.services.ts
    submission.service.ts

  types/
    api.ts
    statistics.ts
    forms.ts
    geo.ts
    submission.ts

  styles/
    app.css
    home-page.css
    statistics-page.css
    access-floating-menu.css

## Status técnico atual

- Build de produção validado com `npm run build`
- Frontend apontando para `VITE_API_BASE_URL`
- Fluxos principais integrados com backend por serviços separados
- Página de protocolo disponível como rota dedicada
