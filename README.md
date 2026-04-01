# SIBRADANÇA Web App

Frontend oficial do SIBRADANÇA, responsável pela experiência pública da plataforma.

O projeto foi estruturado para:

- apresentar o sistema de forma institucional
- direcionar cada perfil para o formulário correto
- exibir o painel público de estatísticas
- exportar indicadores em CSV e PDF a partir dos arquivos oficiais gerados pelo backend

## Papel do frontend

No MVP atual, o frontend:

- não calcula estatísticas por conta própria
- não consulta o IBGE em tempo real
- não persiste dados críticos fora do backend

O frontend consome a API oficial e atua como camada de navegação, cadastro e visualização.

## Tecnologias

- React
- TypeScript
- Vite
- React Router DOM
- Lucide React
- jsPDF
- jspdf-autotable

## Rotas principais

| Rota | Descrição |
|------|-----------|
| `/` | Página inicial |
| `/estatisticas-nacionais` | Painel estatístico público |
| `/formulario/jovens` | Formulário de jovens da dança |
| `/formulario/profissionais` | Formulário de profissionais da dança |
| `/formulario/instituicoes` | Formulário de instituições da dança |

## Integração com o backend

Serviços principais consumidos pelo frontend:

- `GET /api/geo/states`
- `GET /api/geo/cities?stateCode=UF`
- `GET /api/reference/modalities`
- `GET /api/reference/contents`
- `GET /api/reference/consent-term`
- `GET /api/forms`
- `POST /api/forms/youth`
- `POST /api/forms/professional`
- `POST /api/forms/institution`
- `GET /api/statistics/dashboard`
- `GET /api/statistics/export.csv`
- `GET /api/statistics/export.pdf`

## Exportação de dados

O painel estatístico permite exportação em:

- CSV
- PDF

Observações importantes:

- os arquivos são gerados pelo backend
- o frontend apenas aciona o download dos relatórios oficiais
- o CSV sai com compatibilidade para Excel/Windows usando UTF-8 BOM, `;` e quebra de linha `CRLF`

## Estrutura principal

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
    forms.service.ts
    geo.services.ts
    statistics.service.ts
  types/
    api.ts
    forms.ts
    geo.ts
    statistics.ts
```

## Como rodar localmente

### Pré-requisitos

- Node.js 20+
- npm

### Variável de ambiente

Use o arquivo `.env.local` e ajuste a URL conforme a porta do backend local:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Para produção, use o `.env.example` apenas como referência com placeholder público:

```env
VITE_API_BASE_URL=https://SEU_BACKEND_PUBLICO.exemplo.com
```

Importante:

- não publicar `.env.local` no repositório
- não versionar URLs privadas ou segredos
- o frontend deve apontar sempre para a URL pública oficial do backend

### Instalação e execução

```bash
npm install
npm run dev
```

### Build de produção

```bash
npm run build
```

### Publicação na Vercel

Configuração recomendada:

- Framework: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Variável obrigatória: `VITE_API_BASE_URL=https://SEU_BACKEND_PUBLICO.exemplo.com`

### Testes

```bash
npm test -- --run
```

## Status atual

- interface preservada conforme o frontend atualizado
- integração principal com backend validada
- painel estatístico funcionando com dados reais da API
- exportação CSV/PDF validada
- protocolo removido da interface pública
- exportação oficial ligada ao backend

## Observações importantes

- o frontend deve continuar usando o backend como fonte única de verdade
- dados pessoais não devem ser expostos no painel público
- qualquer ajuste de contrato deve ser feito em conjunto com o backend
- arquivos locais gerados pelo TypeScript (`*.tsbuildinfo`) não devem ser commitados
