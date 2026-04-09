# SIBRADANCA Frontend

Frontend oficial do SIBRADANCA, responsavel pela experiencia publica da plataforma e pela interface do painel interno da ONG.

## Leitura obrigatoria

Antes de configurar ou publicar, ler nesta ordem:

1. `README.md`
2. `CONTRIBUTING.md`
3. `docs/seguranca-e-operacao.md`

## Resumo rapido de configuracao em producao

1. manter o projeto atual da Vercel
2. publicar o backend novo no Render
3. confirmar que o backend responde em `/actuator/health`
4. configurar na Vercel apenas:

```env
VITE_API_BASE_URL=https://SEU_BACKEND_PUBLICO.onrender.com
VITE_TURNSTILE_SITE_KEY=SUA_CHAVE_PUBLICA_TURNSTILE
```

5. redeployar a Vercel
6. validar home, formularios, estatisticas e painel

Regra principal:

- o frontend nao recebe URL do Supabase
- o frontend nao recebe senha
- o frontend nao recebe segredo
- o frontend so conhece a URL publica do backend e, se ativado, a chave publica do captcha

## Papel do frontend

O frontend existe para:

- apresentar o sistema de forma institucional
- direcionar cada perfil para o formulario correto
- guiar o cadastro com navegacao rapida e validacao clara
- exibir o painel publico de estatisticas
- permitir acesso ao painel interno da ONG
- acionar downloads oficiais gerados pelo backend

O frontend nao decide a regra de negocio principal. A fonte de verdade continua sendo o backend.

## Escopo funcional atual

- pagina inicial institucional
- formularios de jovens, profissionais e instituicoes
- painel publico de estatisticas nacionais
- pagina publica de privacidade
- painel interno da ONG
- exportacoes iniciadas pela interface

## Tecnologias

- React
- TypeScript
- Vite
- React Router DOM
- Framer Motion
- Recharts
- Vitest
- Playwright

## Fluxo de branches

- `develop`: integracao do time
- `main`: versao estavel do frontend

Fluxo recomendado:

1. atualizar a `develop`
2. criar a branch de trabalho a partir da `develop`
3. abrir Pull Request para `develop`
4. promover a `develop` para `main` quando a integracao estiver validada

Branches de trabalho devem seguir o padrao:

- `feat/nome-da-feature`
- `fix/nome-do-ajuste`
- `docs/nome-do-documento`
- `refactor/nome-da-melhoria`
- `test/nome-do-teste`

## Rotas principais

| Rota | Descricao |
|------|-----------|
| `/` | Pagina inicial |
| `/estatisticas-nacionais` | Painel estatistico publico |
| `/formulario/jovens` | Cadastro para jovens da danca |
| `/formulario/profissionais` | Cadastro para profissionais da danca |
| `/formulario/instituicoes` | Cadastro para escolas, grupos, companhias e projetos |
| `/privacidade` | Politica e orientacoes de privacidade |
| `/painel-interno/acesso` | Entrada do painel da ONG |

## Integracao com o backend

Servicos principais consumidos pelo frontend:

- `GET /api/geo/states`
- `GET /api/geo/cities?stateCode=UF`
- `GET /api/reference/modalities`
- `GET /api/reference/contents`
- `GET /api/reference/consent-term`
- `GET /api/reference/public-form-config`
- `GET /api/reference/privacy-config`
- `POST /api/forms/youth`
- `POST /api/forms/professional`
- `POST /api/forms/institution`
- `GET /api/statistics/dashboard`
- `GET /api/statistics/export.csv`
- `GET /api/statistics/export.pdf`
- `GET /api/admin/insights/bootstrap`

## Estrutura principal

```txt
src/
  components/
  css/
  hooks/
  pages/
  routes/
  services/
  types/
  utils/
e2e/
```

## Como rodar localmente

### Pre-requisitos

- Node.js 20+
- npm

### Variaveis de ambiente

Use `.env.local` para desenvolvimento local:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_TURNSTILE_SITE_KEY=
```

Use `.env.example` apenas como referencia para publicacao.

Importante:

- nao versionar `.env.local`
- nao colocar segredos no frontend
- `VITE_*` deve conter apenas valores publicos

### Instalacao e execucao

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
```

### Testes

```bash
npm test -- --run
npm run e2e
```

## Publicacao

Configuracao recomendada na Vercel:

- Framework: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Variavel obrigatoria:

```env
VITE_API_BASE_URL=https://SEU_BACKEND_PUBLICO.onrender.com
```

Fluxo recomendado:

1. manter o projeto atual da Vercel
2. subir o backend novo no Render
3. atualizar `VITE_API_BASE_URL`
4. redeployar a Vercel

Importante:

- nao colocar URL de banco, senha, token privado ou segredo em `VITE_*`
- o frontend deve conhecer apenas a URL publica do backend
- credenciais reais ficam fora do repositorio e fora do frontend

## Seguranca e operacao

- anti-bot no frontend depende da configuracao real do backend
- em producao, o frontend deve ser publicado junto com a chave publica do anti-bot quando o backend estiver com a validacao ligada
- a Vercel deve receber apenas `VITE_API_BASE_URL` e, quando necessario, `VITE_TURNSTILE_SITE_KEY`
- a URL do banco e qualquer segredo ficam fora do frontend
- guia operacional: `docs/seguranca-e-operacao.md`

## Regras importantes

- o frontend deve continuar consumindo o backend como fonte unica de verdade
- dados pessoais nao devem aparecer nas estatisticas publicas
- captchas e protecoes publicas devem depender da configuracao real do backend
- qualquer ajuste de contrato deve ser feito em conjunto com backend e banco
- nenhum segredo real deve ser salvo no frontend ou no repositorio
