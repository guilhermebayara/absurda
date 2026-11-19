# Site da @bsurda (festaabsurda.com)

Instruções para qualquer sessão de trabalho neste repositório. O site é em português; o
código, os comentários e as mensagens de commit também.

## Branches e publicação

Desde 16 nov 2026 (decisão do Gui) vale o modelo de produção, homologação e teste, o mesmo do
bayara.design e do site da família:

| Branch | Papel | Agenda ao vivo |
| --- | --- | --- |
| `main` | **Produção** (festaabsurda.com). Recebe a homologação em rodadas, depois do QA, com o ok do Gui. | Sim |
| `design` | **Homologação.** Todo trabalho chega aqui por PR antes de ir ao ar, e o Gui confere na prévia dela. A documentação vai direto para cá. | Sim |
| `tst-<assunto>` | **Trabalho e teste:** a branch de cada sessão de código, ou um experimento, com prévia própria e PR para a `design`. | Não |
| `qa-AAAA-MM-DD` | **QA:** a branch de uma sessão de QA, com PR para a `design`. | Não |

**A homologação vai mudar de nome (Gui, 18 nov 2026):** o Gui vai criar a `homologa`, com os tokens,
e aposentar a `design`. Até ele avisar que fez, a homologação continua sendo a `design`. Quando
mudar, troque `design` por `homologa` neste arquivo, em `notas/` e nos fluxos de `.github/workflows/`.

**Prévias:** cada branch tem a sua em `https://<branch>-absurda.gbayara.workers.dev` (a da
homologação: https://design-absurda.gbayara.workers.dev). A produção é https://festaabsurda.com.

- `design` mantém esse nome: é a única branch, além da `main`, com os tokens do Shotgun e do
  Sympla configurados na Cloudflare. As branches de teste não têm os tokens, então a agenda delas
  mostra só o histórico arquivado.
- Toda `tst-<assunto>` e toda `qa-...` nasce da `design` depois de trazer a `main` para ela (ver
  "Antes de começar qualquer rodada"). Assim a sessão encontra a documentação nova, que mora na
  `design`, e o que já foi juntado.
- Caminho de uma mudança de código: `tst-<assunto>` → PR para a `design`, sem merge → o Gui olha a
  prévia da branch → a conversa junta o PR com squash → QA → `main` por fast-forward da `design`, em
  rodadas, com o ok do Gui. Nunca force um push.
- **Mudança só de documentação ou de regras de trabalho** (`CLAUDE.md`, `notas/`) vai direto para a
  `design`. Chega à `main` na rodada seguinte.
- O robô do histórico continua escrevendo direto na `main` (ver "Histórico de eventos").
- Hoje o site ainda não foi divulgado e poderia ir direto para a `main`, mas o Gui quer o fluxo de
  homologação desde já.

## Quem faz o quê (do Gui, desde 16 nov 2026)

- **Código do site:** feito majoritariamente pelo Claude Code.
- **Conversa no claude.ai (projeto "Carreira") é a gestão.** O Gui discute, decide e vê resultados.
  A conversa coordena: registra decisões na documentação (commit direto na `design`), escreve os
  prompts das sessões de código, junta os PRs e apaga as branches já incorporadas. Também cuida do
  Drive, da planilha de pendências e de documentos para outras pessoas. Não escreve código do site.
- **Código:** feito em sessões do Claude Code (ver "Sessões de código"). O Opus constrói. O Fable entra
  só em conceito visual, porque o limite dele é curto. Sessão grande só quando o Gui disser que há
  limite.
- **A ponte é a documentação.** Tudo o que foi decidido e ainda não existe fica em "A construir", em
  `notas/a-fazer.md`, com detalhe para uma sessão construir sem a conversa. Item grande tem um brief à
  parte em `notas/briefs/`; item pequeno fica inteiro na lista. Toda decisão nova entra em `notas/decisoes.md` (data, o quê, por quê e onde a regra
  mora; só se acrescenta). **Toda sessão do Claude Code lê os dois antes de começar.** Ao terminar um
  item, a sessão o tira de "A construir" no mesmo PR e escreve a regra na seção do assunto, aqui
  no CLAUDE.md.

## Antes de começar qualquer rodada: igualar a agenda

O histórico de eventos passados é escrito na `main` por um robô (ver abaixo). Uma branch
que fica parada perde os eventos que passaram nesse tempo. Por isso, **antes de iterar em
`design` ou de criar uma branch de teste, traga a `main`**:

```
git fetch origin main
git checkout design && git merge origin/main      # ou: git checkout -b tst-x origin/main
```

Branch de teste nasce sempre da `main` atualizada (ou da `design` já igualada).

## Histórico de eventos: só acrescenta

- `src/data/arquivo.json` e `public/arquivo/` guardam os eventos que já passaram, com as
  capas. Quem escreve neles é o robô `.github/workflows/atualiza-agenda.yml`, três vezes
  por dia, **direto na `main`**, usando `scripts/arquivar.mjs`. O robô só acrescenta: nunca
  edita nem apaga uma entrada existente.
- **Não altere nem remova eventos já arquivados**, nem apague capas, a menos que o Gui ou
  o Ed peçam expressamente (corrigir um nome, trocar uma capa, tirar um evento). Mudança
  de layout nunca é motivo para mexer nesses arquivos.
- Ao resolver conflito de merge em `arquivo.json`, **vale a versão da `main`**, mais os
  eventos novos que só existirem do outro lado.
- A guarda `npm run confere:arquivo` compara o arquivo da cópia atual com o da `main` e
  falha se algum evento da `main` estiver faltando ou alterado, ou se uma capa tiver sido
  apagada. Rode antes de levar qualquer coisa para a `main`. Ela também roda sozinha no
  GitHub a cada push fora da `main`.
- Mudança pedida de propósito: escreva a marca `[arquivo-editado]` na mensagem do commit,
  dizendo o que mudou e quem pediu. É a marca que as conferências do GitHub leem. Na
  máquina, `ARQUIVO_EDITADO=1 npm run confere:arquivo` faz o mesmo papel.
- **Alarme na `main`:** não existe bloqueio de verdade (o GitHub só oferece em repositório
  privado no plano pago, e este repositório fica privado e sem custo). No lugar,
  `.github/workflows/alarme-arquivo.yml` confere cada push na `main` contra o estado
  anterior e falha, com aviso por e-mail, se o histórico mudou sem a marca. Se o alarme
  tocar, restaure o arquivo a partir do commit anterior antes de qualquer outra coisa.
- **Quando um evento vira passado (do Gui):** no FIM da festa, não no começo. Enquanto ela
  acontece, continua em destaque e com o link de ingressos. A regra mora em `jaAcabou`, em
  `src/lib/eventos.ts`: vale a hora de término da plataforma e, sem ela, oito horas depois do
  começo. Qualquer lugar novo que separe próximos de passados usa essa função.
- **Parada da @bsurda é guarda-chuva (do Gui):** até 2023 a Parada foi só um conjunto de eventos;
  o evento próprio começa em 2025, e mesmo assim outros eventos entram na programação. Cada
  evento aparece na Agenda como evento normal e ganha a etiqueta "Nª Parada". Quem fez parte de
  cada edição está escrito à mão em `src/data/parada.json` (id do evento na Agenda). Em 2020 vale
  a janela inteira: tudo o que aconteceu de 20/06 a 14/08 é Parada. Conversa,
  oficina ou festa de parceiro leva `atividade: true` no evento, para não contar como edição da
  @bsurda. Em 2024 não houve Parada da @bsurda.
  Na Agenda (do Gui): festa tem sempre a sua linha; conversa e oficina presenciais também, uma
  linha cada; as lives das Paradas Virtuais (2020 e 2021) viram uma linha só por edição, dizendo
  quantas foram e de quando a quando (`lives: true`). A programação completa fica na página do
  projeto, no campo `programacao` de `src/content/projetos/parada.md`. Evento escrito à mão com id
  `parada-...` nunca substitui outro evento do mesmo dia (ver `semRepetidos`).
- Eventos que não devem voltar (por exemplo, festas que não aconteceram) ficam na lista
  `FORA_DA_AGENDA` em `src/lib/eventos.ts`, para o robô não trazer de volta.

## Levar para a `main`

1. `git fetch origin main` e traga a `main` para a branch.
2. `npm run build` sem erro.
3. `npm run confere:arquivo` passando.
4. `npm run confere:links`, `npm run confere:agenda`, `npm run confere:temas`,
   `npm run confere:calmo`, `npm run confere:parede`, `npm run confere:barra`,
   `npm run confere:pilha` e `npm run confere:atracoes` passando (ver
   "Conferências do site").
5. Só em rodadas, depois do QA, com o ok do Gui na prévia da `design`. Então `main`, por
   fast-forward da `design`. A publicação na Cloudflare sai sozinha a cada push.

## Sessões de código

Cada sessão do Claude Code recebe da conversa um prompt com uma letra no título ("Sessão A:
...", "Sessão B: ..."). Regras de toda sessão:

- Ler este arquivo, `notas/decisoes.md` e `notas/a-fazer.md` antes de começar.
- Trazer a `main` para a `design` e nascer dela, numa `tst-<assunto>`.
- Construir só os itens de "A construir" nomeados no prompt.
- Antes de cada push: `npm run build` e as conferências de "Levar para a `main`".
- Abrir PR para a `design` e **não fazer o merge**. Quando os PRs forem empilhados (um nascido do
  outro), dizer a ordem de juntar.
- **Redesenho grande é conceito primeiro, com parada:** duas propostas numa branch de teste, e a
  sessão espera a escolha do Gui antes de construir.
- **Quando o prompt diz que o Gui não está** (dormindo ou fora), a sessão escolhe o caminho mais
  simples dentro das regras e relata a alternativa.
- Só a `main` e a homologação têm os tokens do Shotgun e do Sympla. Se algo só se confere com
  evento futuro e a prévia da branch não mostra, a sessão diz isso na linha da tabela.
- Terminar com o relatório: o que foi feito, os PRs (com a ordem), o que ficou para o Gui decidir
  e o que não deu para conferir. Por último, a tabela "O quê | Onde ver", uma linha por assunto, com
  o endereço completo e clicável da prévia da branch (ver "Prévias").

Depois da sessão, a conversa confere os PRs, registra as respostas do Gui e só junta depois que ele
olhar. Merge com squash pela API (`gh api -X PUT repos/guilhermebayara/absurda/pulls/<n>/merge -f
merge_method=squash`). PRs empilhados entram em ordem. Com conflito: trazer a `design` para a
branch, juntar os dois lados, rodar build e conferências, fazer o push, esperar as conferências do
GitHub e só então juntar. PR que entrou dentro de outro é fechado com um comentário dizendo em qual.
Depois do merge, conferir se a prévia da `design` publicou e apagar as branches incorporadas. As
sessões não conseguem apagar branch pelo git nem pela API: na página Branches do GitHub, no
navegador embutido, um `fetch` com `method: 'DELETE'` para
`/guilhermebayara/absurda/branches/<branch>` e o cabeçalho `GitHub-Verified-Fetch: true` apaga a
branch. Branch que nunca foi incorporada só se apaga com pedido do Gui.

## Conferências do site

Além da guarda do histórico, oito conferências rodam na máquina e, sozinhas, no GitHub a cada
push fora da `main` (`.github/workflows/confere-site.yml`). As oito rodam depois do build:

- `npm run confere:links`: falha se algum link interno, âncora ou imagem do próprio site
  apontar para algo que não existe. Link externo não entra.
- `npm run confere:agenda`: falha se algum evento do arquivo não aparecer na Agenda montada. O
  arquivo pode estar inteiro e o evento sumir na montagem (foi o que aconteceu com um evento de
  2022, engolido por outro do mesmo dia). Ficam de fora só os de `FORA_DA_AGENDA` e os adiados.
- `npm run confere:temas`: falha se um tema de `src/lib/temas.ts`, ou o tema de uma página de
  pessoa, sair da regra de contraste. Olha também as cores que a página calcula (subtema vivo,
  `--destaque-texto`, `--suave`, `--enfeite`), executando o próprio trecho de `Base.astro` que
  fica entre as marcas `>>> conta das cores` e `<<< conta das cores`. Não tire as marcas.
- `npm run confere:calmo`: abre cada página num navegador com movimento reduzido, em celular e
  desktop, e falha se uma entrada ou um eco ficar escondido ou se algo se mexer sozinho. Usa o
  Playwright (na primeira vez numa máquina: `npx playwright install chromium`). O que nasce
  escondido de propósito entra na lista `DE_PROPOSITO` do script.
- `npm run confere:parede`: abre a Home em várias telas de celular e desktop e falha se alguma
  fileira da parede de palavras não cobrir a tela inteira. No celular cada fileira tem dois grupos
  e não três (com três, o Safari do iPhone ficava sem memória e as palavras piscavam todas
  juntas), então cada grupo precisa ser mais largo que a tela. Também usa o Playwright.
- `npm run confere:barra`: abre as páginas com barra presa no topo (atalho de anos da Agenda, ano
  dos Marcos no Sobre) num iPhone emulado, no Chromium e no WebKit, e mede a barra a cada quadro.
  Falha se a barra sair do alto da tela na rolagem ou ao tocar num ano do atalho, se o trajeto
  dela usar a altura da tela, se algo animar por tempo dentro dela enquanto a página rola, se a
  fila de anos deixar de ser arrastável, se o toque não levar ao ano ou se houver `sticky` ou
  `fixed` no toque. Precisa também do WebKit (`npx playwright install --with-deps webkit`), que é quem mostra
  o pulo do toque. A barra de endereço do Safari e a rolagem com inércia só se conferem no iPhone.
- `npm run confere:pilha`: abre o Sobre num iPhone emulado (375 x 667, 375 x 812 e 393 x 852), no
  Chromium e no WebKit, e rola pela pilha de polaroides do Trio. Falha se a pilha sair do lugar
  enquanto as polaroides assentam ou não sair com a rolagem depois da última, se a polaroide que
  sobe não acompanhar o dedo, se o trajeto mudar com a altura da tela, se a polaroide do ano não
  ficar por cima, inteira abaixo do relógio e com o texto dentro, se as de baixo não forem
  simplificadas (sem texto, foto pequena), se houver polaroide visível fora da tela, se houver
  `sticky` ou `fixed`, ou se, com movimento reduzido, a pilha não virar lista simples.

- `npm run confere:atracoes`: falha se algum nome de `src/data/atracoes.json` não aparecer na página
  Sobre montada, ou se faltar a marca "riscado" ou "em memória" de quem a tem.

**Regra de contraste (do Gui):** texto que se lê precisa de contraste de leitura (4,5:1).
Enfeite pode ousar e abrir mão disso, desde que continue visível (3:1): a barra inclinada, o
"@" das faixas, e também texto usado como enfeite, como a parede de palavras da Home. Não
"corrija" o contraste de um enfeite: o efeito dele depende justamente dessa ousadia.
Na prática: `--destaque` é cor de enfeite. Texto pequeno na cor de destaque usa
`--destaque-texto`, e texto secundário usa `--suave`; o script de `src/layouts/Base.astro`
ajusta as duas para 4,5:1 só nos temas em que seria preciso.

**Subtema "vivo" (do Gui):** objeto que imita coisa física (crachá, pulseira) é sempre sólido,
nunca na cor da página, senão parece vazado. Além da superfície invertida (`--texto` com
`--fundo` por cima), todo tema tem uma segunda superfície sólida: `--vivo` (o destaque), com
`--sobre-vivo` para texto e `--vivo-detalhe` para enfeite. O script de `Base.astro` calcula as
três e garante leitura (4,5:1). Use esse par quando precisar de duas cores de objeto no mesmo
bloco, como produção e cabine nos crachás da Equipe.

**Páginas de pessoa (do Gui):** o topo é padrão (crachá, nome, função, ano, bio e links); dali para
baixo cada pessoa escolhe os blocos, pelo documento "Sua página no site da @bsurda", e o layout é
acertado caso a caso com o Gui.
- A parte padrão é uma ficha que fala a língua do crachá (escolha do Gui entre três desenhos):
  linha de fato com período e número, bio, e até três linhas de rótulo e valor com filete:
  "Redes" (perfis da pessoa), "Na @bsurda" (projetos da festa) e "Fora daqui" (projetos dela). Todo
  link é texto, do mesmo peso; sem ícone de rede e sem botão para rede. O código do crachá fecha
  a ficha. O único botão é "Toda a equipe".
- Foto do crachá: quem está na festa hoje usa sempre foto tirada num evento da @bsurda. Quem já
  fez parte segue a ordem: foto na @bsurda; foto em ambiente de festa; escolha livre.
- Número do crachá: sai sempre da conta de `src/lib/pessoas.ts`. A pessoa não escolhe nem edita.
- Cores: a prioridade é puxar as cores das fotos da pessoa. Ela pode dizer até duas cores pelo nome
  ("azul", "verde floresta"); o tom é sempre escolhido por nós, para encaixar no site, e nós
  decidimos se as duas entram no mesmo tema ou se viram temas à parte.

**WIG (do Gui):** a página do projeto usa a paleta fechada `TEMAS_DA_WIG` e, no lugar do "Quem
faz", mostra o elenco em crachás da WIG (`CrachaWig.astro`, dados em `src/data/wig.json`): mesma
proporção e mesmo furo do crachá da @bsurda, com o "w" e a letra da marca, sem verso, ano nem número.
O material muda com o papel, como na @bsurda: casting na superfície invertida, bastidores na cor
viva, direção em dourado (só a Charlotte, que também leva o selo "Patroa"). Todos do mesmo tamanho
e com o nome em uma linha; a Charlotte se destaca pelo material e pelo lugar na composição. Só ela
tem página no site (o crachá da WIG aparece lá também, abaixo da ficha); os outros levam ao
Instagram de cada pessoa. O elenco vem antes das edições com a @bsurda, com um título só. O nome na letra da marca entra
como curva (`src/data/wig-letras.json`); o arquivo da fonte não entra no site. Tudo dentro do
crachá da WIG é medido pela largura dele (cqw), para ele redimensionar inteiro sem quebrar.
Os eventos que são só da WIG (brunchs, Tela Tuck, Arraiá das Piranhas) aparecem só
na página do projeto, na seção "O que a WIG faz" (um bloco por projeto, com as datas dentro), e nunca na Agenda; ficam em `src/data/wig-eventos.json`,
escritos à mão. Coprodução com a @bsurda entra na Agenda como qualquer evento. A conta de edições da ficha da WIG soma as duas coisas:
as edições com a @bsurda e os eventos só dela. No projeto @bsurda a ficha mostra o mesmo número
arredondado do Sobre ("+400", `eventosArredondados` em `src/lib/historia.ts`). Na página Projetos a WIG tem seção própria ("Também é da casa"), com cartaz sólido e foto como os
projetos vivos, da altura dos adormecidos e ao lado deles no desktop (nunca maior que um cartaz vivo): ela só mudou de tutela e segue muito próxima, então nunca aparece junto dos adormecidos
(Money, PFVR), que ficam em cartazes vazados. Furdunço da Bôta e Boat da Bôta não são da WIG
(a Charlotte produz, mas é projeto à parte) e não entram.

## Atrações do Sobre (do Gui, 18 nov 2026)

"Quem a gente trouxe" e "E a cena de BH" saem de `src/data/atracoes.json`, gerado por `npm run
atracoes` a partir da planilha "Atrações do site" (Drive, `10_site/4_Sobre`), aba "Para o site",
que o Ed revisa. O site nunca lê a planilha ao vivo: o script copia na `design`, o Gui confere na
prévia e só então vai à `main`.
- `ATRACOES_CSV_URL` guarda o endereço da aba publicada como CSV; `npm run atracoes -- --arquivo x.csv`
  lê um arquivo. Se uma validação falhar, nada é escrito. O resumo diz quem entrou e quem saiu.
- Só linhas com Status "ok" chegam à aba "Para o site". A aba "Fora" é privada.
- Colunas: Nome, Grupo, Ordem (só "Quem a gente trouxe"), Marca ou país, Marcação no site ("em
  memória" ou "riscado"). Sharon Needles só entra riscada; The Ladies não entra.
- A equipe entra na cena sozinha pela coleção `pessoas`; não vai na planilha.
- Não ponha nome à mão em `sobre.astro` nem em `historia.ts`. Detalhe em `notas/briefs/atracoes.md`.

## Pasta do site no Drive (do Gui)

Tudo o que entra no site (fotos, textos, capas) chega pela pasta `10_site` do Drive do Gui
(`Mercurio/1_Institucional/2_Absurda/10_site`). É lá que outras pessoas sobem arquivos, agora e na
manutenção. Segue o menu do site:

- `0_Caixa de entrada`: o que a pessoa não sabe onde vai.
- `1_Home`: `fotos`, `videos`.
- `2_Agenda/<ano>`: uma pasta por ano, de 2009 em diante (criar a do ano novo todo janeiro).
- `3_Projetos/<id>`: o nome é o id da página. Sempre `0-capa`, `1-fotos`, `2-textos`, `3-edicoes`.
  As edições especiais e históricas da festa ficam em `absurda/3-edicoes`. A WIG tem estrutura
  própria (por projeto dela). Projeto novo: copiar `_modelo-projeto-novo`.
- `4_Sobre`: `marcos`, `lugares-improvaveis`, `trio`, `posicionamento`, `casas`.
- `5_Equipe/<id>`: `0-cracha`, `1-fotos` e o documento da página. Pessoa nova: `_modelo-pessoa-nova`.
- `6_Parcerias`: `marcas/<marca>` (com `logo` e `fotos`; uma por marca de `parceiros.json`),
  `apresentacoes`, `numeros-e-publico`. Marca nova: `_modelo-marca-nova`.
- `7_Geral`: `marca-absurda`, `imagem-de-compartilhamento`, `contato`.
- `9_Substituidos`: o que saiu do site. Nada se apaga.

Quando o site ganhar projeto, pessoa, marca ou seção nova, crie a pasta correspondente com o mesmo
id. O documento "00 Leia-me" na raiz explica as regras para quem sobe arquivos (nome com data,
assunto e crédito; `_top` para a preferida) e precisa acompanhar qualquer mudança de estrutura. Ao
lado fica a planilha "Pendências do site". Documentos que pedem material a alguém (como o da WIG
para o Rafa) são Google Docs dentro da pasta da página.

## Sessões de QA

Vale para sessões abertas só para conferir o site. As regras acima continuam valendo
inteiras; esta seção diz o que muda quando o trabalho é QA.

### Onde a sessão trabalha

A sessão trabalha numa branch `qa-AAAA-MM-DD`, nascida da `design` depois de trazer a `main`, e
abre PR para a `design` sem fazer o merge. Correção grande ou arriscada vai numa `qa-<assunto>`
separada, com PR próprio. A sessão de QA **nunca commita nem publica na `design` nem na `main`**:
a conversa junta o PR depois que o Gui olhar, e a `design` vai para a `main` com a aprovação dele.

Outra sessão pode estar publicando ao mesmo tempo. Traga a `main` de
novo antes de cada push e nunca force um push. Se o push for recusado, traga a `main`,
confira de novo e repita.

### Antes de começar e antes de cada push

- Antes de começar: igualar a agenda trazendo a `main` (seção "Antes de começar qualquer
  rodada").
- Antes de cada push: `npm run build` sem erro e `npm run confere:arquivo` passando, mais
  qualquer conferência que tenha sido acrescentada ao repositório depois desta regra.

### O que QA não decide

QA corrige defeito: algo quebrado, link errado, erro de build, comportamento diferente do
que foi combinado. QA **nunca altera nem remove** evento do histórico, capa, texto, cor,
layout ou qualquer conteúdo definido pelo Gui ou pelo Ed. Isso é decisão dos dois. Se algo
assim parecer errado, a sessão relata e espera. Na dúvida entre defeito e decisão, trate
como decisão.

Tokens e chaves continuam fora do código e da conversa, também em relatório, log colado e
mensagem de commit.

### Relatório no fim

Toda sessão de QA termina com um relatório curto, nesta ordem:

1. O que foi conferido.
2. O que foi corrigido, com o commit de cada correção e a branch onde ficou.
3. O que foi encontrado e ficou para o Gui decidir.
4. O que não deu para conferir, e por quê (por exemplo, Safari no iPhone, que só se
   verifica no aparelho).
5. A tabela "O quê | Onde ver" (ver "Sessões de código").

### Achado vira conferência

Regra nova que nascer de um achado de QA vira conferência automática no repositório
(script em `scripts/`, comando em `package.json` e, quando couber, fluxo em
`.github/workflows/`), no modelo do `confere:arquivo`. Assim ela continua valendo sem
depender de memória. A sessão propõe a conferência no relatório; criá-la segue as mesmas
regras de branch desta seção.

## Cuidados que já custaram tempo

- **Fundo da página no iPhone:** `<html>` tem a cor da página; `<body>` e `<main>` não têm
  fundo. Não pinte a faixa do navegador com script nem com elemento fixo (ver o comentário
  em `src/layouts/Base.astro`).
- **Banda do Safari no iPhone (iOS 26):** o Safari desenha uma banda sólida atrás das suas
  barras quando existe um elemento preso (`sticky` ou `fixed`) encostado numa borda da tela,
  mesmo invisível. Uma barra `sticky` no topo basta para a banda aparecer embaixo também, e
  ela não some mais até recarregar. Não pode haver banda: em aparelho de toque, nenhum
  `sticky` ou `fixed`. O que precisa ficar parado usa animação ligada à rolagem (classe
  `pino-novo`, posta pelo script de `Base.astro`): a cena de tela inteira da Home (parede), a
  pilha do Trio no Sobre e as barras do topo (`data-trilho` e `data-barra`: atalho de anos da Agenda,
  ano dos Marcos no Sobre). Enquanto presa, a barra ganha uma cobertura na cor da página por
  cima, para o texto não aparecer acima dela, atrás do relógio. As prévias que seguem o cursor
  somem no toque. Ao criar algo preso novo, siga um desses modelos e confira no iPhone.
- **Barra presa não pode pular (do Gui, conferido no iPhone):** o trajeto da barra e o trecho por
  onde ela anda saem da mesma medida (`--alt` menos `--barra`, com `animation-range` de `contain` a
  `contain`), sem a altura da tela na conta. E nada dentro do trecho muda de altura com animação
  no toque: os anos da Agenda abrem e fecham de uma vez, só o conteúdo entra de leve. Com a altura
  animada, a barra pulava e o conteúdo piscava. A fila de anos vai ao ano marcado na hora,
  deslizando, e nunca com o dedo em cima dela. `npm run confere:barra` guarda a regra.
- **Cartões no celular:** no iPhone a página aparece atrás do relógio e da barra de endereço,
  então uma cena parada de tela inteira parece um retângulo cortado. A saída (do Gui) é a do
  rodapé: no celular, rodapé e menu são cartões, com `--raio-cartao` e `--folga-cartao`
  (em `Base.astro`). O menu é reto em cima, unido ao alto da
  tela, e só arredonda embaixo; ao abrir, nenhum botão dele recebe o foco sozinho. Cena nova parada no celular segue o
  mesmo desenho.
- **Trio no toque (do Gui):** a cena presa com barra de avanço parecia automática, como stories,
  e as pessoas achavam que a rolagem tinha quebrado. No toque, cada ano é uma polaroide (foto
  quadrada, margem larga embaixo com ano, número e texto, cores fixas de papel) que sobe junto com
  o dedo e assenta sobre a anterior, com giro e deslocamento fixos por ano. As de baixo são
  empurradas de leve, ficam menores e mais escuras, perdem o texto e trocam a foto pela versão
  `-mini` (em `public/sobre/`; foto nova do Trio precisa da sua). O trajeto sai só de `--passo`
  (altura da polaroide, folga e `--respiro`, a rolagem entre uma assentar e a próxima começar a
  cobri-la). Desktop continua com a cena presa. Com movimento reduzido ou no `.toque`, lista
  simples. `npm run confere:pilha` guarda a regra.
- **Troca de tema no iPhone:** a troca suave só liga depois que a página abriu (classe
  `troca-viva`). Ligada desde o início, o Safari às vezes parava no meio do caminho entre
  dois temas, com cores ilegíveis.
- **Letreiros no Safari:** cada grupo animado precisa ser curto (até uns dez nomes), ou o
  Safari deixa de desenhar. E camada animada que nunca aparece na tela também gasta memória:
  quando ela falta, o Safari do iPhone apaga as camadas e redesenha, e tudo pisca junto (foi o
  caso da parede da Home, que no celular passou a ter dois grupos por fileira, e não três).
- **Tokens e chaves** nunca entram no código nem em conversa: só nos segredos da Cloudflare
  e do GitHub.
- **Trecho de posicionamento do Sobre:** usa a paleta fechada `TEMAS_DE_POSICAO` em
  `src/lib/temas.ts`. As regras de cor estão comentadas lá.
- Os produtores dizem **"Trio da @bsurda"**, nunca "bloco".
- **Tom dos textos (do Gui):** texto corrido do site segue `notas/tom.md`, tirado das legendas do
  Instagram e das descrições antigas dos eventos: perto, animado, com humor de pista, sem tom de
  verbete. Fichas, datas, créditos e rótulos continuam secos.
