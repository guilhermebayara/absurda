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
- `2026-11-17`: o atalho de anos da Agenda deixa de pular no iPhone. Depois de duas rodadas de
  variantes conferidas pelo Gui no aparelho (branch `tst-barra-agenda`), fica assim: o trajeto das
  barras presas é contado do topo do trecho, sem a altura da tela; no toque, o ano abre e fecha de
  uma vez, sem animar a altura (com ela a barra pulava e o conteúdo piscava); a fila de anos vai ao
  ano marcado na hora, deslizando (esperar a rolagem parar deixava o ano fora de vista). Medir o
  trajeto uma vez só e saltar ao ano por script não ajudaram e ficaram de fora. A causa do toque
  aparece no WebKit do Playwright, e a regra virou a conferência `confere:barra`. Feito pelo Claude
  Code. (CLAUDE.md, "Conferências do site" e "Cuidados"; `src/layouts/Base.astro`;
  `src/pages/agenda.astro`.)
- `2026-11-17`: o menu do celular fica reto em cima, unido ao alto da tela, e só arredonda
  embaixo; ao abrir, o foco vai para o próprio menu, e o "Fechar" não aparece mais com a moldura
  de foco. Pedido do Gui, ao conferir a `design` no iPhone. Feito pelo Claude Code. (CLAUDE.md,
  "Cuidados"; `src/layouts/Base.astro`.)
- `2026-11-18`: no toque, o Trio do Sobre vira uma pilha de polaroides. A cena presa com barra de
  avanço parecia automática, como stories, e as pessoas achavam que a rolagem tinha quebrado. O Gui
  comparou três versões no iPhone (branch `tst-trio`): A, lista de cartões; B, a cena presa com uma
  régua de anos no lugar da barra; C, cartões que sobem com o dedo e assentam numa pilha solta. Ficou
  a C, com os cartões redesenhados como polaroides, e mais respiro entre uma polaroide assentar e a
  próxima cobrir o texto dela. Desktop sem mudança. A regra virou a conferência `confere:pilha`.
  Feito pelo Claude Code. (CLAUDE.md, "Conferências do site" e "Cuidados"; `src/pages/sobre.astro`;
  `scripts/confere-pilha.mjs`.)
- `2026-11-18`: a lista de atrações do Sobre passa a ter uma planilha como base de edição e revisão
  ("Atrações do site", em `10_site/4_Sobre`), para o Ed revisar sem mexer em código. O site não lê a
  planilha ao vivo: um script copia a aba "Para o site" para `src/data/atracoes.json` na `design`, e o
  Gui confere na prévia antes de ir à `main`. Só linhas com Status "ok" vão ao site; quem ficou de
  fora de propósito fica na aba "Fora", com o motivo. A equipe segue entrando sozinha pela página
  Equipe. Por quê: editar JSON é arriscado para quem não mexe em código, e ligar o build ao Google
  poria uma edição acidental no ar sem homologação. (`notas/briefs/atracoes.md`.)

- **2026-11-18, atrações do Sobre: marcações e ajustes de nomes (Gui).** A aba "Para o site" ganhou a
  coluna "Marcação no site". "em memória" (Laranja, Elke Maravilha, Boss in Drama) aparece como
  etiqueta ao lado do nome; "riscado" risca o nome. Sharon Needles volta, riscada, no fim de "Quem a
  gente trouxe" (substitui o antigo "não deve aparecer"). Djalma Não Entende de Política e Vii_ctor
  saem; Paige entra na cena. The Ladies segue fora. Regra mora em `scripts/atracoes.mjs` e é
  conferida por `npm run confere:atracoes`.

- **2026-11-18, Sharon Needles riscada: discreta (Gui).** O risco do nome dela não pode chamar atenção
  demais. Fita zebrada ou símbolo de interdição foram descartados por isso. A saída é uma tarja preta
  com cara de fita isolante (preta sempre, grossa, pouca inclinação, pontas levemente cortadas),
  sem cor nem padrão. Regra mora no CSS de `src/pages/sobre.astro` (`.nomes s`).

- **2026-11-18, fita da Sharon Needles: cor de fita de verdade (Gui).** Ajuste da decisão anterior: como
  virou fita isolante, o preto não precisa ser absoluto. A fita usa grafite escuro, com sinais de mal
  colada (torta, pontas rasgadas, ruga, ponta dobrada). Continua discreta. Regra no CSS de
  `src/pages/sobre.astro` (`.nomes s`).

- **2026-11-18, novo formato de trabalho (Gui), o mesmo do site de memórias da família.** A conversa é
  a gestão (decisões, documentação, prompts, merge de PRs, branches); o código é feito em sessões do
  Claude Code com letra no título, cada uma numa `tst-<assunto>` nascida da homologação, com PR sem
  merge e relatório com a tabela "O quê | Onde ver". QA em `qa-AAAA-MM-DD`, também por PR.
  Documentação vai direto para a homologação, não mais para a `main`. A lista do que falta construir
  passa a ser "A construir", em `notas/a-fazer.md`. A homologação vai virar `homologa` (com os
  tokens); até o Gui avisar, segue sendo a `design`. Por quê: decisões tomadas olhando a tela, uma
  sessão por assunto e a produção recebendo só rodadas já conferidas. (CLAUDE.md, "Branches e
  publicação", "Quem faz o quê" e "Sessões de código".)

- **2026-11-18, briefs só para item grande (Gui).** Na lista "A construir", item pequeno fica inteiro
  na própria lista; item grande (mais de uma sessão, conceito com parada ou muitas regras) ganha um
  brief em `notas/briefs/`. Quando o item termina, as regras vão para o `CLAUDE.md` e o brief sai.
  Mesmo critério do bayara.design. O brief do atalho de anos da Agenda saiu por isso: o item já foi
  feito e a regra mora em "Barra presa não pode pular". (`notas/a-fazer.md`.)

- **2026-11-18, repositório público até o lançamento (Gui).** A cota de 2.000 minutos do GitHub
  Actions chegou a 90% no mês, e em repositório público os minutos são de graça. O site ainda não
  foi divulgado, então o repositório fica público durante a parte pesada do trabalho e volta a
  ser privado depois do lançamento. Varredura feita antes: nenhum token, senha ou e-mail privado
  no histórico. Os segredos ficam na Cloudflare e no GitHub, que não os mostra. Junto, os fluxos
  ficam mais econômicos para quando voltar a ser privado. (`notas/a-fazer.md`.)


- **2026-11-19, conferências do GitHub num trabalho só, em PR e na homologação (Gui, pedido de
  18 nov).** A guarda do histórico virou o primeiro passo de `confere-site.yml` e o fluxo à parte
  saiu. Roda no PR para a `design` ou a `main` e no push na `design`, nunca em mudança só de
  documentação, com `concurrency`, cache dos navegadores do Playwright e `timeout-minutes`. Por quê:
  cada mudança rodava duas vezes e cada fluxo cobrava no mínimo um minuto cheio; com o repositório
  privado de novo, a cota de 2.000 minutos não fecha o mês. (CLAUDE.md, "Conferências do site".)

- **2026-11-19, eventos de exemplo nas prévias de teste (Gui, pedido de 18 nov).** Branch de teste
  sem o token do Shotgun mostra cinco eventos de exemplo, com "(exemplo)" no nome. Só entram se a
  Cloudflare informar a branch do build (`WORKERS_CI_BRANCH` ou `CF_PAGES_BRANCH`), se ela não for
  `main`, `design` nem `homologa` e se faltar o token. Por quê: sem isso, Home e Agenda não se
  conferem com evento futuro numa prévia de teste. (CLAUDE.md, "Eventos de exemplo nas prévias".)

- **2026-11-19, atrações sem link publicado (Gui).** A aba "Para o site" não vai ser publicada na
  web. A conversa lê a planilha pelo Google conectado e gera o JSON numa branch de teste, com PR para
  a `design`. Por quê: um passo a menos para o Gui e nenhum link público da planilha. Na leitura de
  hoje, a planilha bate com o site (nenhum nome entrou nem saiu). (CLAUDE.md, "Atrações do Sobre".)

- **2026-11-19, WIG com as respostas do Rafa (Gui).** A Guta Leão entra no casting com um adesivo
  "New Girl" no crachá, no lugar da frase, até as fotos novas do elenco (2027), porque entrou agora e
  a foto dela não é da sessão das outras. Ramon e Nalla entram como assistentes de backstage; o Rafa
  ganha a frase "a tia das drags". WIG Party, WIGokê e Chá com Charlotte entram como projetos, na
  ordem do Rafa, mesmo antes da Charlotte responder: o Gui quer que ela veja a página o mais completa
  possível e itera depois. (`notas/briefs/wig-rafa.md`; ao terminar, CLAUDE.md, seção "WIG".)

- **2026-11-19, trava dos exemplos no build, capas de exemplo em 16:9 e cartão que não cresce (Gui).**
  `npm run build` apaga `dist/exemplos/` e falha se houver exemplo na `main`, na homologação ou sem
  variável de branch (`scripts/trava-exemplos.mjs`). Exemplos só com capa 16:9. O cartão de evento mantém
  16:9 e recorta a capa. Por quê: a conferência só pegava o problema onde existia a variável de branch, e
  a capa em pé deformava o cartão. (CLAUDE.md, "Eventos de exemplo" e "Cartão de evento não cresce".)

- **2026-11-19, WIG: regras de montagem da página (sessão C).** O Brunch de 11/07/2026 está na Agenda e
  só entra na conta (`naAgenda`); evento marcado para depois aparece "(em breve)" e não conta. Datas
  novas sem local conhecido saem sem local. Detalhe em CLAUDE.md, seção "WIG".

- **2026-11-19, endereço das prévias (Gui).** Prévia de branch é `https://<branch>.festaabsurda.com`
  (homologação: https://design.festaabsurda.com), e não o endereço `workers.dev`. Vale para todos os
  projetos do Gui: branch como subdomínio do domínio principal. (CLAUDE.md, "Branches e publicação".)

- **2026-11-20, WIG: ajustes do Gui na prévia (sessão C, rodada 2).** Datas, eventos e o recorte das
  capas em retrato no card 16:9 aprovados como estão (o recorte pode cortar texto da arte, e o Gui
  aceitou). Ramon ganha a frase "pé no palco". Rótulos: o rodapé dos bastidores passa a "Backstage";
  no topo, o Rafa continua "Produção" e Ramon e Nalla viram "assist. produção"; a linha de função
  "Assistente de backstage" sai. Foto com a mesma altura em todos os crachás (a linha abaixo do nome
  tem altura fixa). O adesivo "New Girl" da Guta fica no lugar da frase dela, e a foto dela é a nova.
  (CLAUDE.md, seção "WIG" e "Cartão de evento não cresce com a capa".)

- **2026-11-20, crédito das fotos da WIG sai da página (Gui).** A linha de crédito do elenco (e o aviso
  das fotos de outra fonte) deixa de aparecer; os dados ficam no `wig.json`. O formato de mini tag
  sobre a foto, no site todo, fica para uma sessão própria (item em "A construir"). (CLAUDE.md, seção
  "WIG".)

- **2026-11-20, crédito de foto como mini tag, no site todo (Gui, 19 nov; sessão D).** Foto com crédito
  ganha `CreditoFoto.astro` sobre ela: símbolo pequeno (enfeite, 3:1) que expande e mostra o crédito
  (leitura, 4,5:1); hover abre; no toque, toque no símbolo e fecha fora; teclado foca e Enter abre.
  Tamanho em cqw da foto. Aplicado nos crachás da WIG com crédito de sessão e na foto da Parada de BH
  2018 no Sobre. Por quê: reduzir elemento de interface sem esconder o crédito. (CLAUDE.md, seção
  "WIG"; `src/components/CreditoFoto.astro`.)

- **2026-11-20, confere:calmo ignora a prévia que segue o cursor (sessão D).** `.espia` (Home) e
  `.espia-capa` (Agenda) saem da conta de animação e de "mexe com a página parada": se o ponteiro do
  Playwright cair num cartão, a prévia aparece e se mexe sozinha, e isso não é defeito de entrada.
  (`scripts/confere-calmo.mjs`.)

- **2026-11-20, rodada para a `main` pela conversa (Gui).** A passagem da `design` para a `main` é
  fast-forward feito pela conversa, com o ok do Gui, e não pelo botão de PR do GitHub. Por quê: o
  botão criou na `main` um commit que a `design` não tinha (PR #10), e o GitHub passou a acusar
  conflito sem diferença de conteúdo. (CLAUDE.md, "Sessões de código".)

- **2026-11-20, GitHub Actions enxuto (Gui).** Testes rápidos e guarda da produção vão para o build
  da Cloudflare, que já bloqueia a publicação. Testes de navegador saem dos PRs e rodam por disparo
  manual na `design`, pela conversa, antes de cada rodada para a `main`. O alarme do histórico fica.
  O robô da agenda vira um trabalho só e cai para duas rodadas por dia (6h17 e 18h17). Por quê: o
  repositório volta a ser privado depois de 10/12 e o plano gratuito tem cota de minutos; a
  estimativa cai de 700 a 800 minutos por mês para 100 a 150. (`notas/briefs/actions.md`; ao
  terminar, CLAUDE.md, "Conferências do site".)

- `2026-11-20`: a @bsurda sai da conta Cloudflare que divide com o site da família e vai para uma
  conta própria, antes de o site ser divulgado. Motivo: o Bastidor, sistema interno da @bsurda, vai
  morar em bastidor.festaabsurda.com e precisa estar na mesma conta do domínio; e a regra é uma conta
  por projeto. O Gui faz a mudança no painel; uma sessão confere depois. (`notas/briefs/conta-cloudflare-propria.md`.)

- **2026-11-22, GitHub Actions enxuto: como ficou (sessão F).** Feito como o brief de 20 nov pedia,
  com três ajustes no caminho. (1) O clone da Cloudflare só traz o último commit (conferido na
  prévia: um commit, raso), então a guarda da produção lê `[arquivo-editado]` só no último commit
  do push; quando a marca não estiver nele, o Gui liga `ARQUIVO_EDITADO=1` nas variáveis de build
  da Cloudflare para aquele build. (2) Na homologação, evento que falta e é mais novo que todos os
  da branch só avisa: é a `design` atrás da produção porque o robô escreveu na `main` depois, e
  travar ali impediria até commit de documentação de publicar a prévia. Na `main` tudo trava. (3)
  Enquanto a produção não publicar o `/estado.json` com a lista do histórico, a guarda avisa e não
  confere; ela passa a valer de verdade a partir da primeira rodada para a `main` com esta mudança.
  O `confere-site.yml` mantém o `confere:arquivo` pelo git como primeiro passo, porque custa
  segundos e é a última conferência antes do fast-forward. (CLAUDE.md, "Histórico de eventos",
  "Levar para a `main`" e "Conferências do site"; `scripts/guarda-producao.mjs`.)

- **2026-11-22, contato só pelo Instagram (Gui).** O `contato@exemplo.com` sai do site inteiro (rodapé,
  `/contato`, Parcerias, `src/config.ts`); no lugar, o link de mensagem do Instagram da @bsurda
  (`SITE.mensagem`). Nenhum e-mail entra enquanto o contato estiver pausado. Por quê: o endereço era
  de marcação e era o único achado do QA que alguém de fora via e clicava. (CLAUDE.md, "Contato".)

- **2026-11-22, formulário do Contato sai (Gui).** `/contato` fica só com a mensagem pelo Instagram e
  as redes, até o contato ser decidido. O formulário fica guardado, desligado, em
  `src/components/guardado/FormularioContato.astro`. (CLAUDE.md, "Contato".)

- **2026-11-22, bios de marcação viram rascunho (Gui).** André Victor, Ayumi, Barbara Deister,
  Charlotte, Ed Luiz, FAB, Gabriel Cadete e Gui Bayara ganham bio de uma ou duas frases no tom de
  `notas/tom.md`, só com o que o repositório sabe (páginas, `notas/equipe-tabela.md`,
  `notas/equipe-insumos.md`, projetos). Rascunho até o Gui aprovar; ele pode trocar qualquer uma.
  Keoma, Lugh e Vil seguem com a bio de marcação (não estavam no pedido). (CLAUDE.md, "Páginas de
  pessoa".)

- **2026-11-22, imagem padrão de compartilhamento (Gui).** A marca da @bsurda em laranja sobre o vinho
  do primeiro tema do site (o par do favicon), 1200 x 630, gerada no repositório
  (`npm run compartilhar`, `public/compartilhar.png`, 9 KB, contraste 6,76:1). Vale para a Home e para
  toda página sem foto própria; `twitter:card` passa a `summary_large_image`. Página com foto continua
  com a dela, agora numa versão de menos de 300 KB. (CLAUDE.md, "Fotos, ícones e prévia de
  compartilhamento".)

- **2026-11-22, defeitos do QA de produção (sessão H).** Ficha das páginas de pessoa em tablet: de 721
  a 960 px o texto desce para baixo dos crachás. Ano dos Lugares Improváveis passa ao par `--vivo` e
  `--sobre-vivo` (estava em 3,76:1), e o "+" dos números do Sobre a `--destaque-texto` (3,18:1 no
  celular, achado pela conferência nova). Pulseiras (4,54:1), FAB (4,61:1), Halloween, backstage da
  WIG (4,5:1) e Amorzinho (10,17:1) passam com a cor assentada: os valores do QA (3,7 a 4,49) eram de
  medida no meio da troca de tema, e ficaram como estão. Na conta das cores do `Base.astro`, quando nenhum lado chega à leitura (superfície viva sobre
  fundo azul médio, tirado de capa: 4,32:1 com um exemplo), a cor vai a branco ou preto puro. Contraste vira conferência de navegador
  (`confere:contraste`), com texto grande em 3:1 como o site já fazia com `--destaque`. Nome do evento
  em destaque na Home vira `h2`. Faixa dos Lugares Improváveis recebe foco. Fotos ganham versões
  menores no build, sem mudar recorte (`/sobre` de 4,6 para 3,3 MB no desktop e 0,85 MB no celular;
  `/projetos` de 2,4 para 0,5 MB; `/equipe` de 2,5 para 0,5 MB). Ícones de toque e manifesto gerados
  do favicon. (CLAUDE.md, "Fotos, ícones e prévia de compartilhamento", "Regra de contraste",
  "Páginas de pessoa" e "Conferências do site".)

- **2026-11-22, chave do estado sem evento pelo nome da branch (Gui).** Branch que começa com
  `tst-vazio` monta o site sem evento próximo, para o Gui ver como ele fica entre os últimos eventos
  de dezembro e os primeiros anúncios de 2027. Escolhida no lugar de uma variável de build na
  Cloudflare (valeria para todas as branches do Worker, a produção inclusive, se ficasse ligada) e de
  um arquivo no repositório (precisaria de trava para não chegar à `main`). (`notas/a-fazer.md`, "A
  construir"; ao terminar, CLAUDE.md, "Eventos de exemplo nas prévias de teste".)

- **2026-11-22, chave do estado sem evento construída (Sessão I).** Ficou como `forcaVazio()` em
  `src/lib/eventos.ts`, ao lado de `usaExemplos`: liga quando a branch do build começa com
  `tst-vazio`, nunca na `main`, na homologação nem sem variável de branch. Com ela, nada de exemplos e
  lista de próximos vazia mesmo com token; o histórico fica igual e o `/estado.json` traz o campo
  `vazio`. A conferência entrou no `confere:exemplos` (roda dentro do build), que lê o
  `dist/estado.json`. Ficaram de fora de propósito os eventos "(em breve)" da WIG, escritos à mão, e a
  próxima saída do Trio, que sai da regra do calendário: o Gui decide se a chave deve escondê-los
  também. (CLAUDE.md, "Eventos de exemplo nas prévias de teste".)

- **2026-11-22, site sem evento fica como está (Gui).** Olhando a prévia da chave (`tst-vazio`), a Home
  e a Agenda sem evento ficam como estão: "Nenhuma data anunciada no momento", o convite para o
  Instagram e o primeiro tema do site. A chave continua tirando só os próximos da Agenda: a próxima
  saída do Trio (regra do calendário) e o "(em breve)" da WIG (escrito à mão) seguem na prévia, porque
  no intervalo entre dezembro e janeiro os dois estariam no ar de verdade. (CLAUDE.md, "Eventos de
  exemplo nas prévias de teste".)

- **2026-11-22, homologação passa a ser a `homologa` (Gui).** A `homologa` nasceu da `design` no
  mesmo commit (Sessão I, #14) e assume o papel dela: PRs das sessões, documentação, disparo do
  `confere-site.yml` antes da rodada e fast-forward para a `main`. Prévia em
  https://homologa.festaabsurda.com. Na Cloudflare, a prévia nomeada `homologa` recebe as variáveis
  que eram da `design` (`SHOTGUN_TOKEN`, `SHOTGUN_ORGANIZER_ID`; o `SYMPLA_TOKEN` quando houver
  evento lá). Depois de conferida, o Gui apaga a branch `design` e a prévia dela. As entradas
  anteriores deste arquivo seguem dizendo `design`. Por quê: o nome já estava combinado desde 18/11
  e é o mesmo dos outros projetos. As listas do código já aceitavam `homologa`; tirar `design` delas
  fica em "A construir". (CLAUDE.md, "Branches e publicação".)

- **2026-11-23, leveza: escolhas depois da auditoria J (Gui).** Fotos no celular a 2x em Projetos,
  Equipe e Sobre, e na densidade do aparelho no resto. As capas de edição que apareciam borradas no
  projeto @bsurda e no Sobre passam a usar a versão grande do arquivo. O robô da agenda roda uma vez
  por dia, de madrugada, porque o GitHub nunca rodou a rodada das 6h17 e atrasava a das 18h17 em 4 a
  6 horas. O Cloudflare Web Analytics sai: custava um script e um envio por página vista para todo
  visitante, sem motivo escrito. A rolagem do Sobre fica para depois da conferência no iPhone. Por
  quê: o princípio de leveza de 23/11 (custo no servidor e no aparelho, nada sem motivo escrito),
  com o Gui escolhendo onde a nitidez vale o peso. (`notas/briefs/leveza-correcoes.md`; ao terminar,
  CLAUDE.md, "Leveza".)

- **2026-11-23, correções de leveza construídas (Sessão K).** Capas do Shotgun com `srcset` (400, 800
  e 1280 px pelo `w_` do endereço) dentro do próprio `foto()`, o que vale também para o destaque da
  Home. Maior versão de cada foto em WebP na largura do original. Celular a 2x por uma opção do
  `foto()` (`ate2x`), que acrescenta ao `sizes` a mesma medida encolhida nas telas de 2,5x ou mais
  (escolhido no lugar de reescrever cada `sizes` à mão); vale em `/projetos`, `/equipe` e `/sobre`, e
  não nas páginas de cada projeto e de cada pessoa. Letreiros e parede param fora da tela por
  `data-corre` e `animation-play-state`, sem mexer nas camadas. Cache longo de `/_astro/` escrito no
  build, um arquivo por regra, porque o `_headers` não separa resposta de erro. Robô às 5h43 de
  Brasília (`43 8 * * *` UTC): depois do fim da maioria das festas, para o build do dia já tirar do
  destaque a festa da noite. O alarme ficou sem `concurrency`, para nenhum push ficar sem conferência.
  A `design` saiu das listas do código (a branch já não existe). (CLAUDE.md, "Leveza".)

- **2026-11-23, rolagem do Sobre fica como está e build sem commit de documentação (Gui).** Depois
  da Sessão K, o Gui navegou no iPhone e não viu problema: a pilha do Trio e a janela com parallax do
  Sobre ficam como estão (a pergunta T3 da auditoria fecha). Na mesma noite, a conversa ligou os build
  watch paths no painel da Cloudflare (exclui `notas/**`, `CLAUDE.md` e `README.md`), com o ok do Gui,
  porque 22% dos builds eram de commit só de documentação. O Gui pediu o mesmo para os outros
  projetos (registro em claude/otimizacao.md, no projeto do Claude). (CLAUDE.md, "Leveza".)

- **2026-11-23, conteúdo da planilha (Gui e Ed).** Aprovados os textos de Bazinga!, É Você
  Satanás?, Viiish!, Velcro e @bsurda Mobile, as bios de Ed, Gui, Keoma, Charlotte, Lugh e Vil,
  os 31 mil seguidores, o "Quem vem", o "Vamos conversar" e o caso Amstel em Parcerias. Saem os
  registros do POPline (2018) e da Dduck (2022), que ninguém confirmou. A Agenda de 2022 fica sem MOC,
  Anda, YOLO e Prêmio por enquanto. (Construído na Sessão L; o brief foi apagado.)

- **2026-11-26, camarim volta (Gui).** A página do sistema (`/camarim`) sai da gaveta, no mesmo
  desenho de 16/11 (escondida, montada com o código do site, duas etapas), com um acréscimo: cada
  combinação de cor de cada tema mostra a razão de contraste e o nível WCAG (AAA, AA, AA só texto
  grande, e o de elemento gráfico para enfeite), ao lado da regra do site, com a mesma conta do
  `confere:temas`. Por quê: o site está estável no ar, e o Gui quer a página como a do site da família
  e a do portfólio. A construção vai no Codex enquanto ele é a ferramenta principal (claude/ferramentas.md
  no projeto do Claude). (`notas/briefs/camarim.md`.)

- **2026-11-26, nome das sessões (Gui).** As sessões novas se chamam ABS-1, ABS-2 e assim por diante,
  no lugar das letras; as que já rodaram (até a L) ficam com a letra. Por quê: a mesma letra aparecia
  em vários projetos ao mesmo tempo. (CLAUDE.md, "Sessões de código".)
