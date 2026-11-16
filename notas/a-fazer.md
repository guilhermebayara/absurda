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

- **Site: listas T/NB, PCD e aniversariantes.** O Gui quer as regras no site. Base: post "Diversidade
  importa" (lista T para pessoas trans, travestis e não bináries, por formulário, acompanhada pela
  Valentina Vianna; pessoa cis não se inscreve; ordem de chegada; ingresso por e-mail), lista PCD e
  aniversariantes do mês, que entram com mensagem no Instagram. Lugar a propor ao Gui (Contato ou
  página própria); mostrar numa branch de teste antes. Não pôr link de formulário fixo: o formulário
  muda por festa, então o texto aponta para o Instagram.
- **Textos aprovados pelo Gui (16/11): aplicar direto.** Na planilha, o Gui deu "ok" nas propostas
  destes itens, e o texto da coluna Observação ("Proposta…") é o que vai ao ar:
  - Aba Projetos (coluna Texto = "ok"): @bsurda, Trio da @bsurda, Parada da @bsurda, I Hate Remix,
    Tibum, Amorzinho, Money e PFVR. Vão para `src/content/projetos/<id>.md`.
  - Aba Edições (coluna Resposta = "ok"): YOLO, Prom, @bsurda #100, Edição 200, Halloween de 10 anos,
    Inferninho da @bsurda, Melhores do ano e Baile das Amigas. Vão para as edições especiais e
    históricas em `src/content/projetos/absurda.md`.
  Ler a planilha na hora de aplicar (o Gui pode ter mexido). Halloween, WIG, @bsurda Premium e Velcro
  ainda não foram aprovados: ficam como estão. Por ser texto aprovado, pode seguir a rotina normal
  até a `main`.
- **Textos do site no tom da @bsurda (o resto).** Reescrever resumos e textos dos projetos, frases de apoio da
  Home e do Sobre e textos das edições seguindo `notas/tom.md`. Fazer numa branch de teste e mostrar
  ao Gui antes de levar para a `main`: ele aprova cada texto. Onde houver proposta aprovada na
  planilha (colunas "Proposta:" nas abas Projetos e Edições), usar a dela.

Não fazer agora: **e-mail de contato.** O Gui pausou; ainda decide quais formas de contato o site
oferece. Não acrescentar e-mail nem o pix do trio ao site.

## Esperando o Gui

Estas perguntas estão na planilha "Pendências do site", aba Geral, linhas 12 a 18. Quando a
resposta chegar lá, o item vira trabalho:

- **WIG: resumo do projeto.** O texto atual contradiz o que o Gui disse sobre as coproduções; há uma
  proposta na planilha. Trocar em `src/content/projetos/wig.md` e rever o título da seção "Edições com
  a @bsurda".
- **WIG: links oficiais na página.** Instagram (instagram.com/wigevents), loja de merch
  (umapenca.com/wigevents) e Shotgun (shotgun.live/en/venues/wig-events), como links de texto.
- **WIG: nome do projeto no site.** Hoje é "Wig"; a grafia da marca é "WIG events".
- **Agenda: IHR Lady Gaga (2021), do Sympla.** Confirmar se é da @bsurda e se aconteceu.
- **Agenda de 2022: pastas que ficaram de fora.** MOC, Prêmio, YOLO e Anda.
- **Equipe: selo "Lista em construção (a confirmar)".** Sai quando o Gui der a lista por fechada.

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
