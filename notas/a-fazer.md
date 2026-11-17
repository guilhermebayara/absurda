# A fazer

O que falta construir ou corrigir no site. É a lista de trabalho do Claude Code; o que só o Gui e o
Ed podem dar (textos, fotos, datas) fica na planilha "Pendências do site", no Drive.

Como usar:

- Cada item diz o que fazer, de onde veio e do que depende.
- "Pronto para fazer" não espera ninguém. "Esperando" só anda quando a pessoa indicada responder.
- Ao terminar um item, apague-o daqui no mesmo commit. Se o item envolveu uma decisão, registre-a em
  `notas/decisoes.md`.

## Pronto para fazer

Respostas do Gui de 16 nov 2026. Os fatos e as fontes de cada item estão em `notas/instagram-2026.md`.

- **Agenda: o atalho de anos pula no iPhone** ao tocar num ano, e às vezes na rolagem. Sessão
  dedicada, com o brief `notas/briefs/atalho-agenda.md`. Achado do Gui em 17 nov 2026.
  Em andamento na branch `tst-barra-agenda` (Claude Code, 17 nov 2026): o pulo do toque foi
  reproduzido no WebKit e há quatro variantes que se somam, escolhidas pelo endereço
  (`/agenda?barra=1` a `4`; a `0` é a `main`), com aviso no alto da página.
  Primeira rodada no iPhone (Gui, 17 nov 2026): a 0 pula; a 1 não pula, mas o conteúdo às vezes
  pisca ao abrir um ano; a 2 mistura pulo e piscada em alguns anos; a 3 não pula nem pisca, e
  sobra só a demora da fila de anos (o ano marcado sai de vista e a fila só vai depois que a
  rolagem para); a 4 teve pulos menores na rolagem. Segunda rodada, partindo da 3: a `5` leva a
  fila ao ano na hora, de uma vez, e a `6` na hora, deslizando. Esperando o Gui conferir no iPhone. Depois da escolha: tirar as variantes e o aviso (marcados com "TESTE DA BARRA" em
  `Base.astro`, `agenda.astro` e `scripts/confere-barra.mjs`), deixar só o desenho escolhido,
  registrar a regra em `CLAUDE.md` ("Banda do Safari") e em `notas/decisoes.md`, e levar à `design`.

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
- **Branch de teste para apagar no GitHub:** `teste-wig-projetos` (já está na `main`). Pela conversa
  o GitHub recusa a exclusão; o Gui ou o Claude Code apagam.

## Esperando outras pessoas

- **WIG: material do Rafa.** Fotos de capa e dos projetos, datas das temporadas do CHRONUS em BH e da
  Virada Cultural, textos da apresentação. Documento no Drive: `10_site/3_Projetos/wig/Página da WIG no
  site da @bsurda: o que precisamos de você`.
- **WIG: crachás do balé.** Se a Charlotte quiser.
- **WIG: próximos eventos na página.** Depende de a Charlotte liberar um acesso ao Shotgun dela.
- **Agenda: sessão no painel do Sympla.** Com o Ed logado, para conferir eventos que a página pública
  não mostra.

## Manutenção recorrente

- **Todo janeiro:** criar `10_site/2_Agenda/<ano novo>` no Drive.
- **Sempre que o site ganhar projeto, pessoa, marca ou seção nova:** criar a pasta correspondente em
  `10_site` com o mesmo id e, se a estrutura mudar, atualizar o "00 Leia-me".
