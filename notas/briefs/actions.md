# Brief: GitHub Actions enxuto

Decidido pelo Gui em 20/11/2026. Para uma sessão construir sem a conversa.

## Por quê

Depois de 10/12 o repositório volta a ser privado. No privado, o plano gratuito do GitHub tem cota
mensal de Actions (2.000 minutos) e não protege branches. A Cloudflare já faz o build de cada push,
com cota própria, e o resultado aparece no PR como "Workers Builds". O que precisa travar a
publicação roda no build da Cloudflare; o GitHub não repete esse trabalho.

Estimativa (num mês de trabalho como a semana de 16 a 20/11): hoje de 700 a 800 minutos por mês;
depois, de 100 a 150.

## Ordem

A guarda da produção entra e é provada **antes** de qualquer corte no GitHub. Se ela não funcionar
no build da Cloudflare, pare e relate; não corte nada.

## 1. Guarda da produção no build da Cloudflare

Hoje o `package.json` não tem `prebuild`, e o `confere:arquivo` compara com a `main` pelo Git. Não
se sabe se o clone da Cloudflare tem histórico, então a guarda não depende dele:

- O `/estado.json` publicado passa a trazer a lista do histórico: para cada evento de
  `src/data/arquivo.json`, o id e uma marca do conteúdo (hash), e a lista de capas de
  `public/arquivo/`.
- Na `main` e na homologação, o build baixa o `/estado.json` da produção (https://festaabsurda.com)
  e falha se um evento de lá sumiu ou mudou, ou se uma capa sumiu, a menos que a mensagem do commit
  traga `[arquivo-editado]`. Descubra como ler a mensagem do commit no build da Cloudflare; se não
  houver como, use uma variável de ambiente que o Gui liga no painel quando a edição for de
  propósito, e documente.
- Sem rede ou com a produção fora do ar, a guarda avisa e não trava (para não impedir uma
  correção de emergência). Diga isso no relatório.
- Em `tst-...` e `qa-...`, a guarda compara do mesmo jeito, mas só avisa.
- O `confere:arquivo` pelo Git continua existindo para a máquina e para o alarme.

## 2. Testes rápidos no build da Cloudflare

Depois do `astro build`, no mesmo comando de build: `trava-exemplos` (já está), `confere:temas`,
`confere:links`, `confere:agenda`, `confere:atracoes` e `confere:exemplos`. Antes do build:
`astro check` e a guarda do item 1. Qualquer falha falha o build, e a Cloudflare não publica.
Meça quanto tempo isso acrescenta ao build e relate.

## 3. GitHub

- `confere-site.yml`: sai o gatilho de `push` e de `pull_request`. Fica só `workflow_dispatch`,
  com os testes de navegador (`calmo`, `parede`, `barra`, `pilha`), o cache do Playwright,
  `concurrency` com `cancel-in-progress` e `timeout-minutes`. Ele precisa do build antes dos
  testes: mantenha `npm ci` e `npm run build`, e tire os passos que agora rodam na Cloudflare.
  A conversa dispara este fluxo na `design` antes de cada rodada para a `main`.
- `alarme-arquivo.yml`: fica como está.
- `atualiza-agenda.yml`: os dois trabalhos viram um só (arquivar e, no fim, pedir o build pelo
  gancho, mesmo se o arquivo falhar ou for pulado). Cron para 6h17 e 18h17 de Brasília
  (`17 9,21 * * *`). `timeout-minutes`.
- `escalacoes.yml`: fica como está.
- Todo fluxo com gatilho de push mantém `paths-ignore` de documentação (`notas/**`, `CLAUDE.md`,
  `README.md`).

## Provas para o relatório

- Build de uma branch de teste com um evento do arquivo apagado de propósito: a Cloudflare falha
  na `main` (simule com a variável de branch) e só avisa na `tst`.
- Build normal da branch passa, com o tempo a mais medido.
- Disparo manual do `confere-site.yml` na branch de teste passa.
- Minutos: a soma das rodadas da sessão no GitHub.

## Ao terminar

A seção "Conferências do site" do `CLAUDE.md` e a seção "Levar para a `main`" passam a dizer onde
cada conferência roda e que a conversa dispara os testes de navegador antes da rodada. Tire o item
de "A construir" e apague este brief no mesmo PR.
