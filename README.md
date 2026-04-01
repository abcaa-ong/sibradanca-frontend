# SIBRADANÇA Web App

Frontend oficial do SIBRADANÇA, responsável pela experiência pública da plataforma.

O projeto foi estruturado para:

- apresentar o sistema de forma institucional
- direcionar cada perfil para o formulário correto
- permitir consulta e acompanhamento por protocolo
- exibir o painel público de estatísticas
- exportar indicadores em CSV e PDF a partir dos dados agregados do backend

## Papel do frontend

No MVP atual, o frontend:

- não calcula estatísticas por conta própria
- não consulta o IBGE em tempo real
- não persiste dados críticos fora do backend

O frontend consome a API oficial e atua como camada de navegação, cadastro, visualização e exportação.

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
| `/acompanhar-protocolo` | Consulta e recuperação por protocolo |

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
- `GET /api/statistics/overview`
- `GET /api/statistics/profile`
- `GET /api/statistics/details`
- `POST /api/protocol-recovery`

## Exportação de dados

O painel estatístico permite exportação em:

- CSV
- PDF

Observações importantes:

- os dados exportados vêm do backend
- o frontend apenas formata os agregados recebidos da API
- o CSV foi ajustado para compatibilidade com Excel/Windows usando UTF-8 BOM, `;` e quebra de linha `CRLF`

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
    ProtocolCenterPage.tsx
    SectorFormPage.tsx
    StatisticsPage.tsx
  routes/
    AppRoutes.tsx
  services/
    api.ts
    forms.service.ts
    geo.services.ts
    protocol-recovery.service.ts
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

Use o arquivo `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### Instalação e execução

```bash
npm install
npm run dev
```

### Build de produção

```bash
npm run build
```

### Testes

```bash
npm test -- --run
```

## Status atual

- interface preservada conforme o frontend atualizado
- integração principal com backend validada
- painel estatístico funcionando com dados reais da API
- exportação CSV/PDF validada
- navegação de protocolo disponível

## Observações importantes

- o frontend deve continuar usando o backend como fonte única de verdade
- dados pessoais não devem ser expostos no painel público
- qualquer ajuste de contrato deve ser feito em conjunto com o backend
- arquivos locais gerados pelo TypeScript (`*.tsbuildinfo`) não devem ser commitados
