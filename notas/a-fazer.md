# A fazer

O que falta construir ou corrigir no site. É a lista de trabalho do Claude Code; o que só o Gui e o
Ed podem dar (textos, fotos, datas) fica na planilha "Pendências do site", no Drive.

Como usar:

- "A construir" é o que já foi decidido e ainda não existe, com detalhe para uma sessão construir sem
  a conversa. A sessão só constrói os itens nomeados no prompt dela.
- **Item pequeno fica inteiro aqui. Item grande ganha um brief à parte em `notas/briefs/`** (decisão
  do Gui, 18 nov 2026), e aqui fica só um parágrafo curto apontando para ele. Item grande é o que
  pede mais de uma sessão, conceito com parada ou muitas regras novas. Quando o item termina, as
  regras vão para o `CLAUDE.md` e o brief é apagado no mesmo PR (fica no histórico do git). Brief de
  item engavetado fica guardado.
- "Esperando" só anda quando a pessoa indicada responder.
- Ao terminar um item, a sessão o apaga daqui no mesmo PR e escreve a regra na seção do assunto no
  `CLAUDE.md`. Se houve decisão, registra em `notas/decisoes.md`.

## A construir

- **Alarme do histórico** (`.github/workflows/alarme-arquivo.yml`): acrescentar `timeout-minutes` e
  `paths-ignore` de documentação (`notas/**`, `CLAUDE.md`, `README.md`), como pede a regra geral do
  CLAUDE.md ("Conferências do site"). Sobra da Sessão F; ficou fora da Sessão H.
- **Robô da agenda** (`.github/workflows/atualiza-agenda.yml`): quando o robô grava algo na `main`, o
  push dele já dispara um build na Cloudflare, e o gancho do fim pede outro. O gancho passa a pedir o
  build só quando o robô não gravou nada. Sobra da Sessão F; ficou fora da Sessão H.
- **Chave do estado sem evento nas prévias** (Gui, 22 nov 2026): para ver o site entre os últimos
  eventos de dezembro e os primeiros anúncios de 2027. A chave é o nome da branch: toda branch que
  começa com `tst-vazio` (por exemplo `tst-vazio`, `tst-vazio-home`) monta o site sem nenhum evento
  próximo nem acontecendo agora. Na prática: sem os eventos de exemplo e, mesmo se a branch tiver
  token, tirando da lista de próximos tudo o que `jaAcabou` ainda não deu como passado. O histórico
  fica como está. A conta mora em `src/lib/eventos.ts`, ao lado de `usaExemplos` (uma função só,
  por exemplo `forcaVazio()`, lida de `branchDoBuild()`), e o `/estado.json` da prévia diz que a chave
  está ligada. Não pode ligar na `main`, na homologação nem sem variável de branch; o
  `confere:exemplos` (ou a trava do build) passa a conferir isso também. A sessão não muda layout nem
  texto: abre a prévia `https://tst-vazio.festaabsurda.com` e lista no relatório cada página que
  muda sem evento (Home, Agenda, páginas de projeto, WIG com eventos "em breve" escritos à mão), para
  o Gui olhar e decidir. Regra no CLAUDE.md, seção "Eventos de exemplo nas prévias de teste".
- **Bios de Keoma, Lugh e Vil Araújo:** seguem de marcação. Se o Gui quiser, rascunho no mesmo modelo
  das oito de 22 nov 2026 (uma ou duas frases, só com o que o repositório sabe).

Não fazer agora: **e-mail de contato.** O Gui pausou; ainda decide quais formas de contato o site
oferece. Não acrescentar e-mail nem o pix do trio ao site.

## Esperando o Gui

Estas perguntas estão na planilha "Pendências do site". Quando a
resposta chegar lá, o item vira trabalho:

- **Agenda de 2022: pastas que ficaram de fora.** MOC, Prêmio, YOLO e Anda.
- **Parcerias: o que ainda falta da planilha.** Pessoas por edição, seguidores, perfil do público,
  fotos dos casos, logos e o texto do "Vamos conversar" (junto com o e-mail, pausado).
- **Página do Gui: parte de baixo.** Depende do documento piloto "Sua página no site da @bsurda: Gui
  Bayara" preenchido. Montar numa branch de teste primeiro.
  A lista de sets sai da aba "Sets do Gui" da planilha, que já tem a IHR especial Rock in Rio
  (06/07/2017, Studio Bar).

## Esperando outras pessoas

- **WIG: o que falta do Rafa e da Charlotte.** O Rafa respondeu as partes 1, 2, 3 e quase toda a 5
  (19 nov 2026). Faltam: fotos de capa e dos projetos, Arraiá das Piranhas (se entra, edições,
  parceiros), edições com a @bsurda, eventos antes de 2023, e a leitura da Charlotte (crédito do
  CHRONUS, "filha da patroa" para a Joanna, balé). Documento no Drive: `10_site/3_Projetos/wig/Página da WIG no
  site da @bsurda: o que precisamos de você`.
- **WIG: fotos novas do elenco (2027).** Quando chegarem, tirar o adesivo "New Girl" da Guta (campo
  `adesivo` em `src/data/wig.json`) e rever o crédito das fotos.
- **WIG: crachás do balé.** Se a Charlotte quiser.
- **WIG: próximos eventos na página.** Depende de a Charlotte liberar um acesso ao Shotgun dela.
- **Agenda: sessão no painel do Sympla.** Com o Ed logado, para conferir eventos que a página pública
  não mostra.

## Engavetado

- **Página do sistema (`/camarim`).** Engavetada pelo Gui em 17 nov 2026, até o site estabilizar no
  ar. Não comece sem ele pedir. Brief em `notas/briefs/camarim.md`.

## Manutenção recorrente

- **Depois do lançamento:** o Gui volta o repositório para privado (Settings, "Change
  visibility"). Antes disso, confira se o GitHub Actions enxuto (sessão F, 22 nov 2026) já está na
  `main`.

- **Todo janeiro:** criar `10_site/2_Agenda/<ano novo>` no Drive.
- **Sempre que o site ganhar projeto, pessoa, marca ou seção nova:** criar a pasta correspondente em
  `10_site` com o mesmo id e, se a estrutura mudar, atualizar o "00 Leia-me".
