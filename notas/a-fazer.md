# A fazer

O que falta construir ou corrigir no site. É a lista de trabalho do Claude Code; o que só o Gui e o
Ed podem dar (textos, fotos, datas) fica na planilha "Pendências do site", no Drive.

Como usar:

- Cada item diz o que fazer, de onde veio e do que depende.
- "Pronto para fazer" não espera ninguém. "Esperando" só anda quando a pessoa indicada responder.
- Ao terminar um item, apague-o daqui no mesmo commit. Se o item envolveu uma decisão, registre-a em
  `notas/decisoes.md`.

## Pronto para fazer

- **WIG: resumo do projeto contradiz a relação real.** O resumo diz "Muitas edições ainda são
  coprodução nossa", e o Gui disse que coprodução é rara (`notas/decisoes.md`, 2026-11-15). Propor
  outro texto ao Gui antes de trocar; proposta da conversa: "Nasceu na @bsurda e hoje é da Charlotte.
  Segue colada: as drags da WIG são presença constante no nosso palco." Vale também rever o título da
  seção "Edições com a @bsurda". (`src/content/projetos/wig.md`.)

## Esperando o Gui

- **WIG: links oficiais na página.** Instagram (instagram.com/wigevents), loja de merch
  (umapenca.com/wigevents) e Shotgun (shotgun.live/en/venues/wig-events), como links de texto. O Gui
  ainda não disse se entram.
- **WIG: nome do projeto no site.** Hoje é "Wig"; o Gui disse que a grafia é "WIG events". Falta saber
  se troca o nome da página e se o "e" é minúsculo (no Sympla e no crachá está "WIG Events").
- **Página do Gui: parte de baixo.** Depende do documento piloto "Sua página no site da @bsurda: Gui
  Bayara" preenchido. Montar numa branch de teste primeiro.
- **Equipe: selo "Lista em construção (a confirmar)".** Sai quando o Gui der a lista por fechada.
- **Agenda: dois eventos do Sympla a confirmar.** Summer Eletrohits (19/07/2025) e IHR Lady Gaga (2021).
- **Agenda de 2022: pastas que ficaram de fora.** MOC, Prêmio, YOLO e Anda.
- **Branches de teste para apagar no GitHub:** `teste-perfil` e `teste-wig-projetos`. Por aqui o GitHub
  recusa a exclusão; o Gui apaga pela página de branches.

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
