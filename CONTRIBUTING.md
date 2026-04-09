# Contribuicao

## Fluxo de trabalho recomendado

1. atualizar a `develop`
2. criar a branch de trabalho a partir da `develop`
3. implementar apenas o escopo combinado
4. validar localmente
5. atualizar documentacao quando necessario
6. abrir Pull Request para `develop`
7. promover `develop` para `main` quando a integracao estiver validada

## Padrao de branches

- `feat/nome-da-feature`
- `fix/nome-do-ajuste`
- `docs/nome-do-documento`
- `refactor/nome-da-melhoria`
- `test/nome-do-teste`

## Regras importantes

- nao colocar segredo em `VITE_*`
- nao versionar `.env.local`
- o frontend publicado deve apontar apenas para a URL publica do backend
- validar `npm test -- --run`
- validar `npm run build`
- validar `npm run e2e` quando o fluxo afetar cadastro ou painel
- revisar `docs/seguranca-e-operacao.md` quando a alteracao tocar ambiente, captcha ou publicacao
