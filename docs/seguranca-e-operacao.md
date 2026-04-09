# Seguranca e Operacao do Frontend

## Objetivo

Este documento explica como publicar o frontend do SIBRADANCA com seguranca, sem expor dados do banco, senhas, tokens privados ou configuracoes sensiveis.

## Leitura recomendada

Antes de publicar, usar este documento junto com:

- `README.md`
- `CONTRIBUTING.md`
- documentacao de producao do backend

## O que o frontend pode conhecer

O frontend deve conhecer apenas:

- a URL publica do backend
- a chave publica do captcha, quando o anti-bot estiver ativo

O frontend nunca deve receber:

- URL de conexao do Supabase
- usuario ou senha do banco
- chave secreta do captcha
- senha do painel interno
- token privado de provedor externo

## Variaveis da Vercel

### Obrigatoria

```env
VITE_API_BASE_URL=https://SEU_BACKEND_PUBLICO.onrender.com
```

### Opcional

Use somente quando o anti-bot estiver ativo no backend:

```env
VITE_TURNSTILE_SITE_KEY=SUA_CHAVE_PUBLICA_TURNSTILE
```

## Anti-bot

Configuracao recomendada para producao:

1. criar o widget do provedor anti-bot
2. configurar a chave publica na Vercel
3. configurar a chave secreta no Render
4. habilitar `APP_ANTI_BOT_ENABLED=true` no backend
5. validar os tres formularios publicos antes do deploy final

O captcha aparece no ultimo passo de cada formulario publico, antes do envio.

Se o backend estiver com o anti-bot ligado e o frontend sem `VITE_TURNSTILE_SITE_KEY`, o envio do formulario deve falhar. Por isso os dois lados precisam ser configurados juntos.

## URLs e dominios

Regras:

- a Vercel aponta para o backend publico
- o backend aponta para o banco
- a Vercel nunca aponta para URL privada de banco
- a Vercel nunca recebe segredo do Supabase ou do Render

## Fluxo de publicacao

1. confirmar que o backend novo esta no ar
2. revisar `VITE_API_BASE_URL`
3. revisar captcha somente se o backend tambem estiver configurado
4. publicar na Vercel
5. validar home, formularios, painel publico e painel interno

## Dados e privacidade

O frontend deve:

- exibir apenas leituras publicas agregadas
- deixar dados nominais apenas no painel interno
- respeitar a configuracao de privacidade vinda do backend
- usar a pagina publica de privacidade como referencia institucional

## CI e validacao

O repositrio possui workflow em `.github/workflows/frontend.yml`.

Antes de abrir PR para `develop` ou `main`, validar:

```bash
npm test -- --run
npm run build
npm run e2e
```

O CI oficial roda para:

- `develop`
- `main`

## Checklist de publicacao

1. confirmar que o backend novo esta respondendo `200` em `/actuator/health`
2. revisar `VITE_API_BASE_URL`
3. configurar `VITE_TURNSTILE_SITE_KEY` se o anti-bot estiver ativo no backend
4. fazer redeploy na Vercel
5. validar home, formularios, estatisticas e painel
6. validar captcha no ultimo passo dos tres formularios

## O que nao fazer

- nao subir URL do Supabase na Vercel
- nao subir senha em `VITE_*`
- nao versionar `.env.local`
- nao ativar captcha no frontend sem ativar a validacao correspondente no backend
- nao publicar mudanca de formulario sem validar fluxo completo
