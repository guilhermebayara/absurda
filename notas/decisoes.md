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
