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

- **Eventos futuros de exemplo nas prévias de teste.** Pedido do Gui em 18 nov 2026. As branches sem
  os tokens do Shotgun e do Sympla mostram só o histórico, então não dá para conferir Home e Agenda
  com evento futuro numa prévia de teste. Quando faltar o token do Shotgun e a branch não for a
  `main` nem a homologação, o site entra com uns poucos eventos de exemplo, com datas contadas a
  partir do dia do build (alguns próximos, um acontecendo agora, um com capa 3:4 e outro 16:9, um da
  Sympla, um com nome longo). Os dados ficam num arquivo próprio em `src/data/`. Regras:
  - nunca aparecem na `main` nem na homologação, mesmo se o token faltar lá (a branch vem da variável
    de branch do build da Cloudflare; sem ela, nada de exemplo);
  - nunca entram no arquivo do histórico (`scripts/arquivar.mjs` não os vê);
  - uma conferência nova falha se o build da `main` tiver algum evento de exemplo;
  - a página deixa claro que são de exemplo, sem atrapalhar o layout (por exemplo, no nome).

- **WIG: página com as respostas do Rafa.** Decidido em 19 nov 2026. Elenco novo (Guta Leão com
  adesivo "New Girl"; Ramon e Nalla como assistentes de backstage; frase do Rafa), sete projetos na
  ordem do Rafa, datas completas do Brunch, do Tela Tuck e do CHRONUS, e apresentação em parágrafos.
  O Gui quer a página o mais completa possível para a Charlotte ver; depois itera com ela. Brief em
  `notas/briefs/wig-rafa.md`, fotos em `notas/briefs/wig-fotos/`.

- **Trava dos exemplos na `main`.** Decidido pelo Gui em 19 nov 2026, depois da Sessão B. Hoje o
  código já deixa os exemplos de fora da `main`, mas a conferência só pega isso onde existe a
  variável de branch, e as capas de `public/exemplos/` vão junto para a `main` sem uso. O próprio
  build, quando a branch for `main` (ou a homologação), apaga `dist/exemplos/` e falha se o site
  montado tiver algum evento de exemplo. Sem mudar nada no painel da Cloudflare. Pacote pequeno.

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
- **WIG: crachás do balé.** Se a Charlotte quiser.
- **WIG: próximos eventos na página.** Depende de a Charlotte liberar um acesso ao Shotgun dela.
- **Agenda: sessão no painel do Sympla.** Com o Ed logado, para conferir eventos que a página pública
  não mostra.

## Engavetado

- **Página do sistema (`/camarim`).** Engavetada pelo Gui em 17 nov 2026, até o site estabilizar no
  ar. Não comece sem ele pedir. Brief em `notas/briefs/camarim.md`.

## Manutenção recorrente

- **Depois do lançamento:** o Gui volta o repositório para privado (Settings, "Change
  visibility"). Antes disso, confira se o item de economia de minutos já foi feito.

- **Todo janeiro:** criar `10_site/2_Agenda/<ano novo>` no Drive.
- **Sempre que o site ganhar projeto, pessoa, marca ou seção nova:** criar a pasta correspondente em
  `10_site` com o mesmo id e, se a estrutura mudar, atualizar o "00 Leia-me".
