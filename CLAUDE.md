# Site da @bsurda (festaabsurda.com)

Instruções para qualquer sessão de trabalho neste repositório. O site é em português; o
código, os comentários e as mensagens de commit também.

## Branches e publicação

**Fase atual (site ainda não divulgado):** pode-se publicar direto na `main`. `main` e
`design` andam iguais.

**Depois que o site for a público, a regra muda:**

- `design` é a **homologação**. É a única branch, além da `main`, com os tokens do Shotgun
  e do Sympla configurados na Cloudflare. Toda mudança passa por ela antes de ir ao ar.
- **Branches novas** servem para testes específicos e para comparar layouts. Elas não têm
  os tokens: a agenda aparece só com o histórico arquivado, sem os eventos ao vivo.
- `main` é **produção**. Só recebe o que já passou pela homologação.

## Antes de começar qualquer rodada: igualar a agenda

O histórico de eventos passados é escrito na `main` por um robô (ver abaixo). Uma branch
que fica parada perde os eventos que passaram nesse tempo. Por isso, **antes de iterar em
`design` ou de criar uma branch de teste, traga a `main`**:

```
git fetch origin main
git checkout design && git merge origin/main      # ou: git checkout -b teste-x origin/main
```

Branch de teste nasce sempre da `main` atualizada (ou da `design` já igualada).

## Histórico de eventos: só acrescenta

- `src/data/arquivo.json` e `public/arquivo/` guardam os eventos que já passaram, com as
  capas. Quem escreve neles é o robô `.github/workflows/atualiza-agenda.yml`, três vezes
  por dia, **direto na `main`**, usando `scripts/arquivar.mjs`. O robô só acrescenta: nunca
  edita nem apaga uma entrada existente.
- **Não altere nem remova eventos já arquivados**, nem apague capas, a menos que o Gui ou
  o Ed peçam expressamente (corrigir um nome, trocar uma capa, tirar um evento). Mudança
  de layout nunca é motivo para mexer nesses arquivos.
- Ao resolver conflito de merge em `arquivo.json`, **vale a versão da `main`**, mais os
  eventos novos que só existirem do outro lado.
- A guarda `npm run confere:arquivo` compara o arquivo da cópia atual com o da `main` e
  falha se algum evento da `main` estiver faltando ou alterado, ou se uma capa tiver sido
  apagada. Rode antes de levar qualquer coisa para a `main`. Ela também roda sozinha no
  GitHub a cada push fora da `main`.
- Mudança pedida de propósito: escreva a marca `[arquivo-editado]` na mensagem do commit,
  dizendo o que mudou e quem pediu. É a marca que as conferências do GitHub leem. Na
  máquina, `ARQUIVO_EDITADO=1 npm run confere:arquivo` faz o mesmo papel.
- **Alarme na `main`:** não existe bloqueio de verdade (o GitHub só oferece em repositório
  privado no plano pago, e este repositório fica privado e sem custo). No lugar,
  `.github/workflows/alarme-arquivo.yml` confere cada push na `main` contra o estado
  anterior e falha, com aviso por e-mail, se o histórico mudou sem a marca. Se o alarme
  tocar, restaure o arquivo a partir do commit anterior antes de qualquer outra coisa.
- Eventos que não devem voltar (por exemplo, festas que não aconteceram) ficam na lista
  `FORA_DA_AGENDA` em `src/lib/eventos.ts`, para o robô não trazer de volta.

## Levar para a `main`

1. `git fetch origin main` e traga a `main` para a branch.
2. `npm run build` sem erro.
3. `npm run confere:arquivo` passando.
4. Só então `main`. A publicação na Cloudflare sai sozinha a cada push.

## Cuidados que já custaram tempo

- **Fundo da página no iPhone:** `<html>` tem a cor da página; `<body>` e `<main>` não têm
  fundo. Não pinte a faixa do navegador com script nem com elemento fixo (ver o comentário
  em `src/layouts/Base.astro`).
- **Letreiros no Safari:** cada grupo animado precisa ser curto (até uns dez nomes), ou o
  Safari deixa de desenhar.
- **Tokens e chaves** nunca entram no código nem em conversa: só nos segredos da Cloudflare
  e do GitHub.
- **Trecho de posicionamento do Sobre:** usa a paleta fechada `TEMAS_DE_POSICAO` em
  `src/lib/temas.ts`. As regras de cor estão comentadas lá.
- Os produtores dizem **"Trio da @bsurda"**, nunca "bloco".
