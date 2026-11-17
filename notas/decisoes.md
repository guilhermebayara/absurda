# Decisões

Registro das decisões sobre o site, com data, motivo e onde a regra mora. Só se acrescenta no fim:
quando uma decisão muda, entra uma linha nova dizendo o que mudou, sem apagar a antiga. A regra em
vigor está sempre no `CLAUDE.md` ou na nota indicada; este arquivo é o histórico.

Formato: `AAAA-MM-DD`: o que foi decidido. Por quê. (Onde mora.)

## Novembro de 2026

- `2026-11-13`: um evento só vira passado quando a festa acaba, não quando começa. Enquanto acontece,
  segue em destaque e com ingresso. (CLAUDE.md, "Histórico de eventos"; `jaAcabou` em
  `src/lib/eventos.ts`.)
- `2026-11-14`: o número de eventos do Sobre e da Home sai da Agenda, arredondado de 50 em 50, com
  piso de 400. Assim cresce sozinho e nunca mostra um número quebrado. (`src/lib/historia.ts`.)
- `2026-11-14`: a Parada da @bsurda é guarda-chuva. Cada evento da programação aparece na Agenda
  com a etiqueta "Nª Parada"; até 2023 a Parada era só um conjunto de eventos. (CLAUDE.md;
  `src/data/parada.json`.)
- `2026-11-14`: nas Paradas Virtuais, festa tem linha própria na Agenda, as lives viram uma linha só
  por edição e a programação completa fica na página do projeto. Pedido do Gui, para a Agenda não
  virar uma lista de 40 lives. (CLAUDE.md.)
- `2026-11-14`: nova conferência `confere:agenda`. Motivo: um evento de 2022 sumiu da Agenda, engolido
  por outro do mesmo dia, sem nenhuma conferência perceber. (CLAUDE.md, "Conferências do site".)
- `2026-11-14`: a data de entrada de quem mudou de papel aos poucos (Gui, Charlotte) é a da primeira
  aparição. A Charlotte entra em 8 jun 2019, como drag queen e DJ residente. (`notas/equipe-tabela.md`.)
- `2026-11-14`: números dos crachás ligados. Saem sempre da conta de `src/lib/pessoas.ts`; a pessoa
  não escolhe nem edita. (CLAUDE.md, "Páginas de pessoa".)
- `2026-11-14`: a parte padrão da página de pessoa é uma ficha na língua do crachá (opção A, entre
  três desenhos). Dali para baixo, cada pessoa escolhe os blocos pelo documento "Sua página no site da
  @bsurda", testado primeiro com o Gui. (CLAUDE.md, "Páginas de pessoa".)
- `2026-11-14`: cores da página de pessoa vêm primeiro das fotos dela; a pessoa pode citar até duas
  cores pelo nome, e o tom é sempre nosso. (CLAUDE.md.)
- `2026-11-14`: WIG ganha crachás próprios para o elenco, paleta fechada e capa temporária. Só a
  Charlotte tem página; as outras levam ao Instagram. (CLAUDE.md, "WIG"; `notas/wig.md`.)
- `2026-11-15`: crachás da WIG variam o material pelo papel (casting, bastidores, direção em dourado),
  todos do mesmo tamanho e com o nome em uma linha. A Charlotte é « drag sobremesa », e "Patroa" fica
  só no selo. (CLAUDE.md, "WIG".)
- `2026-11-15`: eventos que são só da WIG aparecem só na página dela, nunca na Agenda; coprodução entra
  na Agenda. Furdunço da Bôta e Boat da Bôta não são da WIG. (CLAUDE.md, "WIG";
  `src/data/wig-eventos.json`.)
- `2026-11-15`: a página da WIG apresenta os projetos dela (Brunch, Tela Tuck, CHRONUS, Arraiá) em
  blocos, com as datas dentro. Aprovado pelo Gui na branch de teste. (CLAUDE.md, "WIG".)
- `2026-11-15`: a conta de edições da WIG soma as edições com a @bsurda e os eventos só dela, para o
  número não parecer pequeno. O projeto @bsurda mostra o mesmo "+400" do Sobre. (CLAUDE.md, "WIG".)
- `2026-11-15`: a WIG sai de perto dos adormecidos na página Projetos. Ela só mudou de tutela e segue
  muito próxima: a maioria das drags nas festas é dela. Cartaz sólido e com foto, mas nunca maior que
  um cartaz vivo. (CLAUDE.md, "WIG".)
- `2026-11-15`: a relação com a WIG, nas palavras do Gui: a Charlotte toca o projeto, as drags dela se
  apresentam na @bsurda com frequência, os brunchs muitas vezes têm DJs da @bsurda, a maioria dos
  eventos é só da WIG com a @bsurda como apoio, e coprodução é rara. A grafia é "WIG events".
  (`notas/wig.md`.)
- `2026-11-15`: a pasta `10_site` do Drive vira o lugar por onde todo material entra no site, agora e
  na manutenção, organizada pelo menu do site e com modelos para o que for novo. Pedido do Gui, porque
  outras pessoas vão subir arquivos lá. (CLAUDE.md, "Pasta do site no Drive".)
- `2026-11-15`: pedidos de material a outras pessoas são Google Docs dentro da pasta da página, porque
  quem é de fora não consegue preencher um documento do Claude. O da página do Gui segue no Claude.
  (CLAUDE.md, "Pasta do site no Drive".)
- `2026-11-16`: a parede de palavras da Home tem dois grupos por fileira no celular, e não três, e
  ganhou a conferência `confere:parede`. Com três, o Safari do iPhone ficava sem memória e as palavras
  piscavam juntas. Feito pelo Claude Code. (CLAUDE.md, "Conferências do site" e "Cuidados".)
- `2026-11-16`: o código do site passa a ser feito pelo Claude Code. A conversa do projeto no claude.ai
  fica com discussão, documentação, Drive e branches de teste. (CLAUDE.md, "Quem faz o quê".)
- `2026-11-16`: decisões passam a ser registradas neste arquivo, e o que falta construir em
  `notas/a-fazer.md`, para nada depender da memória de uma conversa. (CLAUDE.md, "Quem faz o quê".)
- `2026-11-16`: a planilha "Pendências do site" guarda só o que o Gui e o Ed precisam responder, e as
  perguntas soltas da conversa (WIG, Agenda, Equipe) entram na aba Geral. Os caminhos da planilha
  apontam para a estrutura nova da pasta `10_site`. (`notas/a-fazer.md`.)
- `2026-11-16`: os textos do site ficam menos secos e mais descontraídos, no tom das legendas do
  Instagram, que é o canal principal da @bsurda hoje. Guia em `notas/tom.md`. Pedido do Gui.
  (CLAUDE.md, "Cuidados".)
- `2026-11-16`: a primeira edição da @bsurda foi na quinta-feira, 12 nov 2009, no Velvet Club. O "11"
  do texto antigo do Sympla está errado. (`src/data/marcos.json`.)
- `2026-11-16`: a festa de 24/07/2026 é a primeira Amorzinho; o nome "Fashion, Music, Film" no Shotgun
  ficou desatualizado. Corrige-se por `NOMES_CORRIGIDOS`, sem editar o arquivo. (`src/lib/eventos.ts`.)
- `2026-11-16`: festa de graça sem ingresso, como a @bsurda na Rua de 10/01/2026, também entra na
  Agenda, escrita à mão. (`notas/a-fazer.md`.)
- `2026-11-16`: o site explica as listas T/NB e PCD e o convite dos aniversariantes, com as regras do
  post "Diversidade importa". (`notas/a-fazer.md`.)
- `2026-11-16`: em Parcerias, marca que apareceu como apoio ou patrocínio entra por padrão; o Gui
  revisa e tira se for o caso. (`notas/a-fazer.md`.)
- `2026-11-16`: e-mail e demais formas de contato no site ficam pausados até o Gui decidir quais
  oferecer. (`notas/a-fazer.md`.)
- `2026-11-16`: o @bsurda Summer Eletrohits de 19/07/2025 no Lab (`sympla-2975375`) não aconteceu:
  naquela noite foi só o Club Mayhem, no Mira. Fica fora da Agenda (ele já não entra no arquivo).
  (`notas/equipe-tabela.md`.)
- `2026-11-16`: o Gui aprovou na planilha os textos propostos de oito projetos e oito edições; a lista
  está em `notas/a-fazer.md`. (Planilha "Pendências do site".)
- `2026-11-16`: a Universal Music entra em Parcerias ligada à IHR Ariana Grande de 2026 (Petal), com
  "(a confirmar)": houve duas IHR da Ariana no período lido (14/11/2025 e 01/08/2026) e a nota não
  dizia qual. A Zang Tattoo ganhou também os registros de 2023 que estão nas descrições do Sympla.
  Feito pelo Claude Code. (`src/data/parceiros.json`.)
- `2026-11-16`: o Gui aprovou toda a reescrita dos textos no tom da @bsurda (branch `teste-tom`):
  resumos dos projetos, texto do Halloween, edições sem texto e frases de apoio. Bazinga!, É Você
  Satanás?, Viiish! e Mobile seguem sem texto, por falta de fatos. (Os próprios arquivos.)
- `2026-11-16`: as regras das listas T/NB e PCD e do convite dos aniversariantes ficam dentro da
  Agenda, e não numa página própria: são só regras, e a Agenda é o caminho de quem vai à festa.
  Pedido do Gui. (`src/pages/agenda.astro`.)
- `2026-11-17`: cartão de evento que quase some no fundo da página (abaixo de 1,35:1, como capa preta
  em página preta) ganha um véu da própria cor do texto e um filete fino; a página não muda de tom.
  Em cartão claro entra só o filete, para não tirar leitura. A conta roda no navegador, porque o
  fundo muda com o sorteio e a rolagem. Pedido do Gui. (`src/components/CartaoEvento.astro`.)
- `2026-11-16`: a IHR Lady Gaga de 2021 do Sympla não aconteceu: o evento ficou aberto só para manter
  os ingressos vendidos na pandemia, porque cancelar cancelaria os ingressos. Fica fora da Agenda.
  (`src/lib/eventos.ts`, `SYMPLA_FORA`.)
- `2026-11-16`: o projeto se escreve "WIG events" em todo o site, e o resumo dele passa a ser o
  proposto na planilha. (`notas/a-fazer.md`.)
- `2026-11-16`: a lista da Equipe está fechada (sai o selo "em construção"), e quem entrou no mesmo
  dia segue a ordem alfabética. (`notas/a-fazer.md`.)
- `2026-11-16`: a Shotgun aparece em Parcerias também como patrocinadora: a @bsurda foi selecionada
  no Shotgun Pride 2026. (`notas/parcerias-material.md`.)
- `2026-11-16`: os números de público das apresentações podem ir ao site, e o carnaval conta "10 anos"
  desde o primeiro trio. (`notas/parcerias-material.md`.)
- `2026-11-17`: o Gui aprovou Parcerias fora da marcação (branch `teste-parcerias`): números de
  público liberados, "Quem já passou" no lugar do perfil de público, formatos sem valor nem cota,
  casos e textos de Shotgun e Xeque Mate com as propostas da planilha. Números que eram só
  expectativa (Parada 2025) ficam fora. (`src/pages/parcerias.astro`, `src/data/parceiros.json`.)
- `2026-11-16`: auditoria de tom do site inteiro. O que ficou fora do tom virou proposta na aba "Textos
  (tom)" da planilha; o bloco de posições do Sobre fica no registro firme, como pede o guia para os
  marcos. Fichas, rótulos e listas de evento não entram na auditoria. (`notas/tom.md`.)
- `2026-11-17`: o Gui aprovou as 17 linhas da aba "Textos (tom)", inclusive MPB e Confessions II
  revistas, e reescreveu a frase do Google: "Maior festa pop LGBTQIA+ de MG. Sem frescuras, desde
  2009." Aplicadas como estão na coluna C. (`src/config.ts` e os arquivos de cada texto.)
- `2026-11-16`: o sistema visual do site vai ter página própria em `/camarim`, escondida (sem índice,
  sem link, sem conteúdo privado) e montada com os mesmos componentes do site, como a do site da
  família e a `/boneca` do portfólio. Primeiro as peças viram componentes, sem mudança visual.
  Pedido do Gui. (`notas/briefs/camarim.md`.)
- `2026-11-16`: fim da fase de publicar direto na `main`. Passa a valer produção (`main`),
  homologação (`design`, que mantém o nome por causa dos tokens da Cloudflare) e teste
  (`tst-<assunto>`), como no bayara.design e no site da família. Código só vai à `main` depois da
  conferência do Gui na `design`; documentação pode ir direto. (CLAUDE.md, "Branches e publicação".)
- `2026-11-17`: a página do sistema (`/camarim`) fica engavetada até o site estabilizar no ar.
  Decisão do Gui. A etapa 1 (peças viram componentes) foi feita e testada: HTML e fotos iguais aos
  da `main` e, no iPhone, o mesmo comportamento da `main` (teste na `design`, depois revertido).
  Nada dela fica na `design` nem na `main`. O brief fica guardado. (`notas/briefs/camarim.md`.)
- `2026-11-17`: o atalho de anos da Agenda pula no iPhone ao tocar num ano, e às vezes na
  rolagem. Acontece no código da `main`: o Gui conferiu na `design` com os componentes e numa
  prévia com o código da `main` puro, e as duas pulam igual. Vira trabalho de uma sessão
  dedicada. (`notas/briefs/atalho-agenda.md`; `notas/a-fazer.md`.)
