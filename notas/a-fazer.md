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

- **WIG: resumo, nome e links (respostas do Gui na aba Geral, 16/11).**
  - Resumo novo em `src/content/projetos/wig.md`: "Nasceu na @bsurda e hoje é da Charlotte. Segue
    colada: as drags da WIG são presença constante no nosso palco." Rever junto o título da seção
    "Edições com a @bsurda".
  - Nome: "WIG events" em todo o site (projeto, crachás, textos), no lugar de "Wig" e "WIG Events".
  - Links de texto na página: Instagram (instagram.com/wigevents), loja (umapenca.com/wigevents) e
    Shotgun (shotgun.live/en/venues/wig-events).
- **Equipe: tirar o selo "Lista em construção (a confirmar)".** O Gui deu a lista por fechada.
  Desempate de quem entrou no mesmo dia: alfabético (vale hoje para Barbara e Gabriel). Conferir que
  a ordem já sai assim.
- **Parcerias: tirar a página da marcação com as apresentações.** Os PDFs estão em
  `10_site/6_Parcerias/apresentacoes/para-marcas` (no Drive do Gui; o material já foi lido e está em
  `notas/parcerias-material.md`, seção "Apresentações de 2025 e 2026"). Usar só o que pode ser
  público: nunca valor, cota, bonificação, preço ou nome de contato comercial. Textos dos casos e das
  linhas de Shotgun e Xeque Mate: propostas na aba Parcerias (linhas 11 a 14); aplicar as que tiverem
  "ok". Números de público liberados pelo Gui (75 mil em 2023, 30 mil em 2025, Parada 2025). Carnaval:
  "10 anos", contando desde o primeiro trio. Maringá é PR.


Não fazer agora: **e-mail de contato.** O Gui pausou; ainda decide quais formas de contato o site
oferece. Não acrescentar e-mail nem o pix do trio ao site.

## Esperando o Gui

Estas perguntas estão na planilha "Pendências do site". Quando a
resposta chegar lá, o item vira trabalho:

- **Agenda de 2022: pastas que ficaram de fora.** MOC, Prêmio, YOLO e Anda.

Fora da planilha:

- **Página do Gui: parte de baixo.** Depende do documento piloto "Sua página no site da @bsurda: Gui
  Bayara" preenchido. Montar numa branch de teste primeiro.
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
