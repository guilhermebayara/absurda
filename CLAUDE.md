# Site da @bsurda (festaabsurda.com)

Instruções para qualquer sessão de trabalho neste repositório. O site é em português; o
código, os comentários e as mensagens de commit também.

## Branches e publicação

Desde 16 nov 2026 (decisão do Gui) vale o modelo de produção, homologação e teste, o mesmo do
bayara.design e do site da família:

| Branch | Papel | Agenda ao vivo |
| --- | --- | --- |
| `main` | **Produção** (festaabsurda.com). Recebe a homologação em rodadas, depois do QA, com o ok do Gui. | Sim |
| `homologa` | **Homologação.** Todo trabalho chega aqui por PR antes de ir ao ar, e o Gui confere na prévia dela. A documentação vai direto para cá. | Sim |
| `tst-<assunto>` | **Trabalho e teste:** a branch de cada sessão de código, ou um experimento, com prévia própria e PR para a `homologa`. | Não |
| `qa-AAAA-MM-DD` | **QA:** a branch de uma sessão de QA, com PR para a `homologa`. | Não |

**A homologação é a `homologa` desde 22 nov 2026 (Gui).** Ela substituiu a `design`, que foi
aposentada. Em `notas/decisoes.md`, as entradas antigas continuam dizendo `design`: é a mesma
homologação, com o nome da época.

**Prévias (do Gui, 19 nov 2026):** cada branch tem a sua em `https://<branch>.festaabsurda.com`
(a da homologação: https://homologa.festaabsurda.com). A produção é https://festaabsurda.com. Em
relatório, tabela e prompt use sempre esse endereço, nunca o `workers.dev`.

- **Conta Cloudflare (desde 22 nov 2026):** o site e o domínio estão na conta "absurda", a mesma do
  Bastidor (Worker `absurda`; a homologação é a prévia nomeada `homologa`, com variáveis próprias).
- Só a `main` e a homologação têm o token do Shotgun configurado na Cloudflare (o do Sympla volta
  quando houver evento lá; sem ele o site segue com o histórico arquivado do Sympla). As outras
  branches não têm, então a agenda delas mostra só o histórico arquivado.
- Toda `tst-<assunto>` e toda `qa-...` nasce da `homologa` depois de trazer a `main` para ela (ver
  "Antes de começar qualquer rodada"). Assim a sessão encontra a documentação nova, que mora na
  `homologa`, e o que já foi juntado.
- Caminho de uma mudança de código: `tst-<assunto>` → PR para a `homologa`, sem merge → o Gui olha a
  prévia da branch → a conversa junta o PR com squash → QA → `main` por fast-forward da `homologa`, em
  rodadas, com o ok do Gui. Nunca force um push.
- **Mudança só de documentação ou de regras de trabalho** (`CLAUDE.md`, `notas/`) vai direto para a
  `homologa`. Chega à `main` na rodada seguinte.
- O robô do histórico continua escrevendo direto na `main` (ver "Histórico de eventos").
- Hoje o site ainda não foi divulgado e poderia ir direto para a `main`, mas o Gui quer o fluxo de
  homologação desde já.

## Quem faz o quê (do Gui, desde 16 nov 2026)

- **Conversa no claude.ai (projeto "Gestão de projetos") é a gestão.** O Gui discute, decide e vê resultados.
  A conversa coordena: registra decisões na documentação (commit direto na `homologa`), escreve os
  prompts das sessões de código e cuida dos PRs com conflito; o Gui junta os outros e apaga as branches. Também cuida do
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
`homologa` ou de criar uma branch de teste, traga a `main`**:

```
git fetch origin main
git checkout homologa && git merge origin/main
git checkout -b tst-x                              # ou qa-AAAA-MM-DD
```

Branch de sessão, de teste e de QA nasce sempre da `homologa` já igualada.

## Histórico de eventos: só acrescenta

- `src/data/arquivo.json` e `public/arquivo/` guardam os eventos que já passaram, com as
  capas. Quem escreve neles é o robô `.github/workflows/atualiza-agenda.yml`, uma vez por
  dia (5h43 de Brasília, ver "Leveza"), **direto na `main`**, usando `scripts/arquivar.mjs`. O robô só
  acrescenta: nunca edita nem apaga uma entrada existente.
- **Não altere nem remova eventos já arquivados**, nem apague capas, a menos que o Gui ou
  o Ed peçam expressamente (corrigir um nome, trocar uma capa, tirar um evento). Mudança
  de layout nunca é motivo para mexer nesses arquivos.
- Ao resolver conflito de merge em `arquivo.json`, **vale a versão da `main`**, mais os
  eventos novos que só existirem do outro lado.
- A guarda `npm run confere:arquivo` compara o arquivo da cópia atual com o da `main` e
  falha se algum evento da `main` estiver faltando ou alterado, ou se uma capa tiver sido
  apagada. Rode antes de levar qualquer coisa para a `main`. No GitHub ela é o primeiro passo
  dos testes de navegador (ver "Conferências do site", para quando rodam).
- **Guarda da produção, no build da Cloudflare (Gui, 20 nov 2026):** `scripts/guarda-producao.mjs`
  é o primeiro passo de `npm run build`. O `/estado.json` publicado traz a lista do histórico (id,
  data e uma marca do conteúdo de cada evento, e as capas, de `scripts/historico.mjs`), e o build
  baixa a da produção (https://festaabsurda.com/estado.json) e compara. Na `main` e na homologação,
  evento do ar que sumiu ou mudou, ou capa apagada, falha o build, e a Cloudflare não publica. Em
  `tst-...`, `qa-...` e na máquina, só avisa. Na homologação, evento que falta e é mais novo que
  todos os da branch só avisa: é a branch atrás da produção (o robô escreveu na `main` depois), e
  a saída é trazer a `main`. Sem rede, com a produção fora do ar ou sem a lista no ar, a guarda
  avisa e não trava, para não impedir uma correção de emergência. O resultado de cada build fica
  no campo `guarda` do `/estado.json` da prévia.
- Mudança pedida de propósito: escreva a marca `[arquivo-editado]` na mensagem do commit,
  dizendo o que mudou e quem pediu. É a marca que o alarme, o `confere:arquivo` e a guarda da
  produção leem. **O clone da Cloudflare só traz o último commit**, então lá a marca só vale no
  último commit do push (na rodada para a `main`, o último commit da `homologa`). Quando não der,
  o Gui liga `ARQUIVO_EDITADO=1` nas variáveis de build da Cloudflare (Settings, Build, Variables)
  para esse build e desliga depois. Na máquina, `ARQUIVO_EDITADO=1 npm run confere:arquivo` faz o
  mesmo papel.
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
2. `npm run build` sem erro. Ele já roda a guarda da produção, `astro check` (tipos e
   diagnósticos do Astro) e, depois do site, `confere:temas`, `confere:links`, `confere:agenda`,
   `confere:atracoes` e `confere:exemplos`. É o mesmo build da Cloudflare, que roda a cada push e
   não publica se ele falhar (ver "Conferências do site").
3. `npm run confere:arquivo` passando.
4. `npm run confere:calmo`, `npm run confere:parede`, `npm run confere:barra`,
   `npm run confere:pilha` e `npm run confere:contraste` passando: os testes de navegador, que não
   rodam na Cloudflare.
5. Só em rodadas, depois do QA, com o ok do Gui na prévia da `homologa`. **Antes da rodada, a
   conversa dispara o `confere-site.yml` na `homologa`** ("Run workflow" na aba Actions, ou pela
   ferramenta do GitHub) e só segue com ele verde. Então `main`, por fast-forward da `homologa`. A
   publicação na Cloudflare sai sozinha a cada push.

## Sessões de código

Cada sessão (no Claude Code, no Codex ou em outra ferramenta) recebe da conversa um prompt com o
identificador no começo do título ("ABS-1 · assunto", "ABS-2 · assunto"; as sessões até a L usaram
uma letra). Regras de toda sessão:

- Ler este arquivo, `notas/decisoes.md` e `notas/a-fazer.md` antes de começar.
- Trazer a `main` para a `homologa` e nascer dela, numa `tst-<assunto>`.
- Construir só os itens de "A construir" nomeados no prompt.
- Antes de cada push: `npm run build` e as conferências de "Levar para a `main`".
- Abrir PR para a `homologa` e **não fazer o merge**. Quando os PRs forem empilhados (um nascido do
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

Depois da sessão, a conversa confere os PRs e registra as respostas do Gui. **Quem junta é o Gui
(19 nov 2026):** PR sem conflito para a `homologa` ele junta com squash e apaga a branch pelo botão do PR. A
passagem da `homologa` para a `main` não usa o botão (ele cria um commit que a `homologa` não tem e trava
o fast-forward): a conversa faz o fast-forward, só com o ok do Gui (20 nov 2026). PRs
empilhados entram em ordem. A conversa só cuida do PR com conflito: trazer a `homologa` para a
branch, juntar os dois lados, rodar build e conferências, fazer o push, esperar as conferências do
GitHub e só então juntar. PR que entrou dentro de outro é fechado com um comentário dizendo em qual.
Depois do merge, conferir se a prévia da `homologa` publicou. Quem apaga as branches incorporadas é o Gui: a conversa lista quais apagar e quando, e nem a sessão nem a conversa apagam branch. Branch que nunca foi incorporada só se apaga com pedido do Gui.

## Conferências do site

Além das guardas do histórico, dez conferências rodam na máquina. Todas rodam depois do build.

**Onde cada uma roda (GitHub Actions enxuto, do Gui, 20 nov 2026):** o que precisa travar a
publicação roda no build da Cloudflare, que já acontece a cada push com cota própria; o GitHub não
repete esse trabalho. Motivo: depois de 10/12 o repositório volta a ser privado, e o plano gratuito
tem cota mensal de minutos.
- **No build (`npm run build`, o comando da Cloudflare):** antes do site, a guarda da produção
  (ver "Histórico de eventos") e `astro check`; depois, a trava dos exemplos, `confere:temas`,
  `confere:links`, `confere:agenda`, `confere:atracoes` e `confere:exemplos`
  (`npm run confere:rapidos` roda as cinco). Qualquer falha falha o build, e a Cloudflare não
  publica a branch; o check "Workers Builds" do commit fica vermelho no GitHub. Tudo isso acrescenta
  uns 7 segundos ao build, quase todos do `astro check`.
- **No GitHub, só por disparo manual:** `.github/workflows/confere-site.yml` (`workflow_dispatch`)
  roda o `confere:arquivo`, o build e os testes de navegador (`confere:calmo`, `confere:parede`,
  `confere:barra`, `confere:pilha` e `confere:contraste`), em uns 6 minutos. Não roda em push nem em PR. A conversa
  dispara na `homologa` antes de cada rodada para a `main` (ver "Levar para a `main`"); uma sessão
  pode disparar na própria branch quando o prompt pedir. Disparo novo na mesma branch cancela o
  anterior, os navegadores ficam no cache (versão do Playwright na chave) e o trabalho tem
  `timeout-minutes`.
- **Na máquina:** a sessão roda o build e as cinco de navegador antes de cada push, como sempre.
- **Os outros fluxos:** `alarme-arquivo.yml` (cada push na `main`) e `escalacoes.yml` ficam como
  estavam (o alarme ganhou `timeout-minutes` e `paths-ignore` de documentação em 23 nov 2026, e
  fica sem `concurrency` de propósito: cada push é conferido). `atualiza-agenda.yml` é um trabalho
  só, uma vez por dia, às 5h43 de Brasília: arquiva e, no fim, pede o build pelo gancho só quando não
  gravou nada (quando grava, o push na `main` já gera o build).
Fluxo novo segue o mesmo modelo: um trabalho só, sem gatilho de push ou PR quando der para rodar na
Cloudflare; com gatilho de push, `paths-ignore` de documentação (`notas/**`, `CLAUDE.md`,
`README.md`); sempre `concurrency` e `timeout-minutes`.

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

- `npm run confere:contraste` (QA de produção, 22 nov 2026): abre cada página no navegador, em celular
  e desktop, aplica cada tema que a página pode sortear (o do trecho fixo, a paleta fechada, a lista
  do sorteio, as opções de cada cartaz de Projetos) e mede todo texto visível contra o fundo sólido
  atrás dele, com opacidade e transição desligada. Falha com texto de leitura abaixo de 4,5:1, texto
  grande (24 px, ou 18,66 px em negrito) abaixo de 3:1 ou enfeite da lista `ENFEITE` abaixo de 3:1.
  Texto grande entre 3:1 e 4,5:1 sai como aviso, sem falhar. Texto sobre foto ou degradê fica fora
  da conta. O que fica de fora de propósito entra na lista `FORA` do script, com o motivo, e só com
  decisão do Gui. Lê a lista do sorteio em `window.__sorteio` (posta pelo script de `Base.astro`).

- `npm run confere:exemplos`: falha se a `main` ou a homologação tiverem evento de exemplo (ver
  "Eventos de exemplo nas prévias de teste").

- `npm run confere:atracoes`: falha se algum nome de `src/data/atracoes.json` não aparecer na página
  Sobre montada, ou se faltar a marca "riscado" ou "em memória" de quem a tem.

**Regra de contraste (do Gui):** texto que se lê precisa de contraste de leitura (4,5:1).
Enfeite pode ousar e abrir mão disso, desde que continue visível (3:1): a barra inclinada, o
"@" das faixas, e também texto usado como enfeite, como a parede de palavras da Home. Não
"corrija" o contraste de um enfeite: o efeito dele depende justamente dessa ousadia.
Na prática: `--destaque` é cor de enfeite. Texto pequeno na cor de destaque usa
`--destaque-texto`, e texto secundário usa `--suave`; o script de `src/layouts/Base.astro`
ajusta as duas para 4,5:1 só nos temas em que seria preciso. Etiqueta ou adesivo sólido com texto
(o ano sobre a foto dos Lugares Improváveis, por exemplo) usa o par `--vivo` e `--sobre-vivo`, e
nunca `--destaque` com texto na cor do fundo. O `confere:temas` confere os pares de cada tema; o
`confere:contraste` confere o que a página faz com eles.

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
- **Tablet (QA de produção, 22 nov 2026):** de 721 a 960 px o texto da página desce para baixo dos
  dois crachás, que continuam lado a lado. Ao lado deles a coluna ficava com 150 a 250 px e os links
  da ficha saíam da tela.
- **Bio:** curta, uma ou duas frases no tom de `notas/tom.md`, só com o que se sabe da pessoa (página,
  escalações, projetos). Nada inventado. As de 22 nov 2026 são rascunho até o Gui aprovar; as de Ed Luiz, Gui Bayara, Keoma, Charlotte, Lugh e Vil Araújo foram aprovadas em 23 nov 2026 (planilha). As de FAB, André Victor, Ayumi, Barbara Deister e Gabriel Cadete seguem em rascunho.
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

**WIG, respostas do Rafa (do Gui, 19 nov 2026):**
- **Elenco** em `src/data/wig.json`: dez drags e produtores mais Ramon e Nalla, assistentes nos
  bastidores. Grafias: "Mallibu" com dois L, "Aria" sem acento.
- **Rótulos (Gui, 20 nov 2026):** o rodapé do crachá dos bastidores diz "Backstage", e não "Bastidores"
  (o campo `papel` continua `bastidores`). No topo, o Rafa segue "Produção"; Ramon e Nalla levam
  "assist. produção" (campo `rotulo`, que troca o padrão do papel). Não existe mais linha de função
  abaixo do nome.
- **Frases:** Rafael "a tia das drags", Ramon "pé no palco", Nalla "dama de vermelho".
- **Foto com a mesma altura (Gui, 20 nov 2026):** a linha abaixo do nome (`.cw-linha`) tem altura fixa e
  guarda a frase, o adesivo ou nada. Com isso a foto tem a mesma altura em todos os crachás. Linha nova
  no crachá entra dentro dessa altura, nunca acrescenta uma.
- **Adesivo (`adesivo` no JSON):** a Guta Leão leva o "New Girl" no lugar da frase dela (a linha
  abaixo do nome), até as fotos novas do elenco (2027); quando elas chegarem, tire o campo. O adesivo é
  objeto: sólido (`--vivo` com `--sobre-vivo`), meio torto, borda da cor do papel, medido em cqw. A foto
  atual da Guta já é a nova, no mesmo recorte das outras.
- **Crédito das fotos (Gui, 20 nov 2026; mini tag em 20 nov 2026):** foto com crédito ganha a mini tag
  `CreditoFoto.astro` sobre ela (símbolo que expande no hover; no toque, toque no símbolo e fecha fora;
  teclado foca e Enter abre). Foto sem crédito não leva nada. O símbolo é enfeite (3:1, `--enfeite` sobre
  `--texto`); o texto aberto é leitura (4,5:1, `--fundo` sobre `--texto`). Tamanho em cqw da foto. Na WIG,
  os dados estão em `src/data/wig.json` (`creditos` vale só para casting/direção da sessão de 2025; quem
  tem `foraDaSessao: true` — Guta, Ramon, Nalla — e os bastidores, como o Rafa, ficam sem crédito). Também
  entra na foto da Parada de BH 2018 no Sobre (`foto Lugh`, via `Capa`). Nome novo no elenco precisa da
  curva em `wig-letras.json` (sem ela, o nome sai em fonte simples; Guta, Ramon e Nalla já têm).
- **Ordem dos projetos** (do Rafa): WIG Brunch, WIG Party, Tela Tuck, CHRONUS, Chá com Charlotte,
  Arraiá das Piranhas, WIGokê. Projeto sem data (Chá, WIGokê) sai só com o texto; sem `local` ou `url`, a linha
  da data sai sem eles. Campos `convidadas`, `elenco`, `newFace`, `dj` e `obs` ficam no dado, sem layout.
- **Coprodução na Agenda não se repete:** o Brunch de 11/07/2026 (Dacota Monteiro) está na Agenda e
  entra só na conta (`naAgenda` da série). A WIG Party aponta para a lista de edições da própria página.
- **Futuro:** evento marcado para depois (corte de `jaAcabou`, noite do último dia) aparece na lista com
  "(em breve)" e não entra na conta das sessões nem na ficha de edições.
- **Apresentação:** três parágrafos no corpo de `src/content/projetos/wig.md`, sem linha do tempo; o
  `resumo` curto continua para o topo, a página Projetos e a descrição. Os textos são rascunho até a
  Charlotte e o Gui aprovarem.


## Contato (do Gui, 22 nov 2026)

- **Só pelo Instagram.** Nenhum e-mail entra no site enquanto o contato estiver pausado (nem no
  rodapé, nem no Contato, nem em Parcerias). O link de mensagem mora em `SITE.mensagem`
  (`src/config.ts`, `https://ig.me/m/bsurda`) e é o mesmo em todo lugar: rodapé ("Mensagem no
  Instagram"), `/contato`, botão de Parcerias e o "mandar mensagem" das listas na Agenda.
- **`/contato` sem formulário**, até o contato ser decidido: só o botão de mensagem, as redes e o
  atalho para as listas da Agenda. O formulário está guardado, desligado, em
  `src/components/guardado/FormularioContato.astro` (nenhuma página usa).

## Fotos, ícones e prévia de compartilhamento (QA de produção, 22 nov 2026)

- **Versões menores das fotos, geradas no build.** Toda foto de `public/` mostrada no site passa por
  `foto(src, sizes)` de `src/lib/imagens.ts`: `<img {...foto(src, '(max-width: 720px) 90vw, 28rem')} />`.
  Ele devolve `srcset` (WebP de 320 a 1280 px, e um WebP na largura da original), `sizes`, `width` e
  `height`. Os
  arquivos `/img/<largura>/...` não existem no repositório: a integração `scripts/imagens.mjs` lê o
  site montado e cria só os que as páginas pedem, com cache em `node_modules/.astro`. Recorte e
  aparência não mudam (o CSS que recorta é o mesmo); `img { height: auto }` no `Base.astro` faz o
  `height` só reservar espaço. O `sizes` diz quanto a foto ocupa na tela: errar para menos deixa a
  foto borrada, então meça na tela antes de escolher. Nunca mexa em `public/arquivo/`: as capas de lá
  ganham versões só no `dist`. Foto nova: JPEG ou PNG em `public/`, sem rotação no EXIF (o
  ajudante lê as medidas do cabeçalho do arquivo).
- **Trio do Sobre:** o script que troca a foto pela `-mini` tira o `srcset` junto e devolve quando a
  foto grande volta. Sem isso, o navegador continuaria no `srcset`.
- **Imagem que aparece primeiro:** a capa do destaque da Home (`PainelEvento`), o primeiro cartaz de
  `/projetos` e a capa do topo da página de projeto levam `fetchpriority="high"` e não são `lazy`.
- **Prévia de compartilhamento.** Página com foto própria (`imagem` no `Base`) usa uma versão JPEG de
  até 1200 px e menos de 300 KB (o limite do WhatsApp), em `/img/og/...`. Página sem foto usa
  `public/compartilhar.png` (1200 x 630): a marca em laranja sobre o vinho do primeiro tema, com
  contraste de leitura. `twitter:card` é sempre `summary_large_image`. Marca ou tema novo:
  `npm run compartilhar`. Guardar a cópia no Drive (`7_Geral/imagem-de-compartilhamento`) é da conversa.
- **Ícones:** `favicon.ico`, `apple-touch-icon.png`, `icone-192.png`, `icone-512.png` e
  `site.webmanifest` saem de `public/favicon.svg` com `npm run icones`. Mudou o favicon, rode de novo.
- **Títulos:** o nome do evento em destaque na Home é `h2` (vem logo depois do `h1`). Classe nova de
  título segue a ordem: nada de pular nível para ganhar tamanho, o tamanho vem do CSS.
- **Faixa que rola para o lado** (Lugares Improváveis no Sobre) recebe foco (`tabindex="0"` e
  `aria-label`) para rolar pelas setas do teclado. Faixa nova segue o mesmo modelo.

## Leveza (do Gui, 23 nov 2026)

O site tem de ficar no plano gratuito da Cloudflare e o mais leve possível sem perder qualidade. O
custo conta nos dois lados: no servidor e no aparelho de quem abre (memória, CPU, rede, bateria). Os
números de antes estão em `notas/leveza-auditoria.md` (Sessão J); as correções, na Sessão K.

- **Tetos da conta "absurda" (divididos com o Bastidores):** Workers Builds, 3.000 minutos por mês e
  um build de cada vez na conta; Worker, 100 mil requisições por dia e 10 ms de CPU por requisição
  (o site não usa: é só asset estático, e requisição a asset é grátis e sem limite). Nada no site pode
  fazer uma requisição cair no Worker: nada de `main` nem de `run_worker_first` no `wrangler.jsonc`,
  nada de `_worker.js`. GitHub Actions, depois de 10/12 (privado): uns 2.000 minutos por mês.
- **Nada consome recurso sem um motivo escrito.** Fluxo novo, chamada externa no build, animação que
  roda sozinha, script de terceiro: o motivo fica escrito no próprio arquivo ou aqui. O que roda mais
  vezes do que o motivo pede é defeito.
- **Quando ficar mais leve custar qualidade**, a sessão mede os dois lados (`npm run mede:leveza`) e
  não escolhe sozinha: vira pergunta para o Gui, com os números.
- **Sem script de terceiro.** O Cloudflare Web Analytics foi desligado no painel em 23 nov 2026
  (custava um script e um envio por página vista, para todo visitante, sem motivo escrito); conferido
  no mesmo dia, nenhuma página da produção traz mais o `static.cloudflareinsights.com`. Ligar de novo,
  ou pôr qualquer script de fora, é decisão do Gui, com o motivo escrito aqui.
- **Motivo de cada automático:**
  - `atualiza-agenda.yml`: guarda os eventos que passaram e pede um build para a agenda futura vir do
    Shotgun. Uma vez por dia, às 5h43 de Brasília (`43 8 * * *` UTC), fora da hora cheia. O GitHub
    atrasa e pula rodadas agendadas (de 12 a 23 nov a das 6h17 nunca rodou e a das 18h17 saía de 4 a
    6 horas depois), então uma rodada é o que de fato acontecia; com o atraso de costume, ela sai entre
    6h e 9h, depois do fim da maioria das festas. O build de lá roda com `SEM_FOTOS=1`: o robô só
    precisa do `arquivo-pendente.json`.
  - Gancho de build: só quando o robô não gravou nada (o push dele já gera um build).
  - `alarme-arquivo.yml`: avisa se o histórico mudou na `main` sem a marca. Não roda em commit só de
    documentação.
  - `confere-site.yml`: testes de navegador, só pelo botão, antes de cada rodada para a `main`.
  - `escalacoes.yml`: material de trabalho, só pelo botão ou quando o próprio script muda.
  - Prévias por branch: a Cloudflare constrói cada push. Commit só de `notas/`, `CLAUDE.md` e
    `README.md` não constrói: build watch paths do painel (Settings, Build, "Exclude paths" com
    `notas/**`, `CLAUDE.md` e `README.md`), ligados em 23 nov 2026 na produção, na base das prévias e
    na prévia `homologa`. Cada prévia nomeada tem a sua configuração; ao criar outra, repita. Na base,
    salvar sem "Apply to existing Previews", que pode levar a base (sem o token do Shotgun) para a
    homologação.
  - Chamadas externas no build: a produção (`/estado.json`, guarda), as listas do Shotgun e uma capa
    pequena de cada evento futuro, para as cores. Nada mais (a "segunda imagem" saiu em 23 nov 2026).
- **Fotos:** toda foto passa por `foto()` (ver "Fotos, ícones e prévia de compartilhamento"),
  inclusive as capas do Shotgun, que ganham `srcset` de 400, 800 e 1280 px trocando o `w_` do
  endereço. O `sizes` é medido na tela. A maior versão também é WebP, na largura da foto, para o
  navegador nunca cair no JPG original. Capa do Sympla (`-lg`, 1.400 px) não passa pelo `foto()`: onde
  ela aparece pequena, use a `-xs` (`capaPequena`), como na parede da Home.
- **Densidade no celular (escolha do Gui):** em Projetos (`/projetos`), Equipe (`/equipe`) e Sobre as
  fotos são pedidas como num celular de 2x, mesmo num iPhone de 3x (`foto(src, sizes, { ate2x: true })`,
  ou `ate2x` em `Capa` e `Cracha`). O resto do site pede a densidade do aparelho. A foto ocupa o mesmo
  espaço; só a versão baixada é menor.
- **Capas de edição (escolha do Gui):** no projeto @bsurda (edições especiais) e no Sobre (Mineirão),
  a capa é a versão grande do arquivo pelo `foto()`, e não a `-p` de 240 px, que aparecia borrada. As
  versões saem só no `dist`; `public/arquivo/` não muda.
- **Cache das versões das fotos** em `node_modules/.astro/absurda-imagens`: é a pasta que o cache de
  build da Cloudflare guarda para um site Astro. Fora dela, cada build lá refazia todas as versões.
- **Cache no navegador:** `/_astro/` guarda por um ano, com uma regra por arquivo escrita no fim do
  `dist/_headers` pelo build (`scripts/cabecalhos.mjs`). Com `/_astro/*`, um endereço que ainda não
  existia ficava guardado por um ano como erro 404.
- **Animação que roda sozinha** (letreiros de `Faixa.astro`, parede da Home) para quando sai da tela:
  o trecho leva `data-corre`, o script de `Base.astro` põe a classe `corre-parada` fora da tela, e o
  CSS do trecho pausa a própria animação (`animation-play-state`). Animação nova sem fim segue o mesmo
  modelo. A rolagem do Sobre (pilha do Trio, parallax da janela) fica como está até o Gui conferir
  no iPhone.
- **Medir antes e depois:** `npm run mede:leveza` (ver `scripts/desempenho/mede.mjs`).

## Atrações do Sobre (do Gui, 18 nov 2026)

"Quem a gente trouxe" e "E a cena de BH" saem de `src/data/atracoes.json`, gerado por `npm run
atracoes` a partir da planilha "Atrações do site" (Drive, `10_site/4_Sobre`), aba "Para o site",
que o Ed revisa. O site nunca lê a planilha ao vivo: o script copia na `homologa`, o Gui confere na
prévia e só então vai à `main`.
- **Atualizar (do Gui, 19 nov 2026):** a aba não é publicada na web. Quando a planilha mudar, a
  conversa lê a aba "Para o site" pelo Google conectado, exporta como CSV e roda `npm run atracoes --
  --arquivo x.csv` numa `tst-atracoes-AAAA-MM-DD`, com PR para a `homologa`, como qualquer mudança. É
  só dado: a conversa não mexe no código para isso. Se uma validação falhar, nada é escrito. O resumo
  diz quem entrou e quem saiu. `ATRACOES_CSV_URL` continua aceito pelo script, mas não é usado.
- Só linhas com Status "ok" chegam à aba "Para o site". A aba "Fora" é privada.
- Colunas: Nome, Grupo, Ordem (só "Quem a gente trouxe"), Marca ou país, Marcação no site ("em
  memória" ou "riscado"). Sharon Needles só entra riscada; The Ladies não entra.
- A equipe entra na cena sozinha pela coleção `pessoas`; não vai na planilha.
- Não ponha nome à mão em `sobre.astro` nem em `historia.ts`. Detalhe em `notas/briefs/atracoes.md`.

## Eventos de exemplo nas prévias de teste (do Gui, 18 nov 2026)

Prévia de `tst-...` ou `qa-...` não tem o token do Shotgun e só mostra o histórico. Para conferir Home
e Agenda com evento futuro, `src/lib/eventos.ts` (`fonteExemplo`) acrescenta os eventos de
`src/data/eventos-exemplo.json`: dois próximos (um azul e um rosa), um acontecendo agora, um da
Sympla e um de nome longo. As datas saem do dia do build (`comecaEmHoras` e `duracaoHoras`).
- Só entram quando a Cloudflare informa a branch do build (`WORKERS_CI_BRANCH` ou `CF_PAGES_BRANCH`),
  ela não é `main` nem `homologa` (lista `BRANCHES_SEM_EXEMPLO`) e falta o `SHOTGUN_TOKEN`.
  Sem a variável de branch, nada de exemplo. Se a homologação mudar de nome, ponha o nome novo na lista.
- O nome termina em "(exemplo)", para a página dizer que é de exemplo sem mexer no layout. Cada
  exemplo tem link próprio (`#id`), senão `semRepetidos` tira todos menos um. As capas ficam em
  `public/exemplos/`.
- Não vão para o histórico: `arquivo-pendente.json` ignora `exemplo: true` e não têm `nomeBruto`.
- `npm run confere:exemplos` falha se o build da `main`, da homologação (ou qualquer build com
  `--producao`) tiver evento de exemplo, se o build não tiver variável de branch e mesmo assim tiver
  exemplo, ou se o arquivo do histórico guardar um. Roda dentro do próprio `npm run build`, também
  na Cloudflare.
- **Capa dos exemplos só em 16:9 (Gui, 19 nov 2026):** todas as capas de `public/exemplos/` são 16:9
  (1280 x 720). Capa em pé não entra mais: ela fazia o cartão crescer e parecer distorcido.
- **Trava no próprio build (Gui, 19 nov 2026):** `npm run build` termina com `scripts/trava-exemplos.mjs`.
  Na `main`, na homologação ou sem a variável de branch, o script apaga `dist/exemplos/` (as capas vão
  junto no build e não têm uso ali) e falha se o site montado tiver algum evento de exemplo (id, "(exemplo)"
  ou `/exemplos/`). Só a prévia de uma branch de teste mantém os exemplos. Nada muda no painel da
  Cloudflare, porque o build já é o comando de lá. A lista de branches é a mesma de
  `BRANCHES_SEM_EXEMPLO`: se a homologação mudar de nome, troque nos dois lugares.
- Teste local: `WORKERS_CI_BRANCH=tst-x npm run build`. Item novo de exemplo: acrescente em
  `src/data/eventos-exemplo.json`, sempre com "(exemplo)" no nome.
- **Chave do estado sem evento (Gui, 22 nov 2026):** branch cujo nome começa com `tst-vazio` (por
  exemplo `tst-vazio`, `tst-vazio-home`) monta o site sem nenhum evento próximo nem acontecendo agora,
  para ver como ele fica entre os últimos eventos do ano e os primeiros anúncios do seguinte. A conta
  é `forcaVazio()`, em `src/lib/eventos.ts`, lida de `branchDoBuild()`: com ela ligada não entram os
  exemplos e, mesmo se a branch tiver token, a lista de próximos sai vazia (o que `jaAcabou` ainda não
  deu como passado some, sem virar passado). O histórico fica igual. O `/estado.json` da prévia diz
  `"vazio": { "ligado": true, "branch": ..., "tirados": n }`. Nunca liga na `main`, na homologação
  (`BRANCHES_SEM_EXEMPLO`) nem sem variável de branch; o `confere:exemplos` lê o `dist/estado.json` e
  falha se ela ligar nesses casos, numa branch que não começa com `tst-vazio`, ou se não ligar numa
  que começa. Não toca no que é escrito à mão fora da Agenda: os eventos "(em breve)" da WIG
  (`wig-eventos.json`) e a próxima saída do Trio (regra do calendário) continuam aparecendo.
  Teste local: `WORKERS_CI_BRANCH=tst-vazio npm run build`.

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

A sessão trabalha numa branch `qa-AAAA-MM-DD`, nascida da `homologa` depois de trazer a `main`, e
abre PR para a `homologa` sem fazer o merge. Correção grande ou arriscada vai numa `qa-<assunto>`
separada, com PR próprio. A sessão de QA **nunca commita nem publica na `homologa` nem na `main`**:
a conversa junta o PR depois que o Gui olhar, e a `homologa` vai para a `main` com a aprovação dele.

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
- **Cartão de evento não cresce com a capa (Gui, 19 nov 2026):** o cartão de `CartaoEvento.astro`
  (Home e Agenda) mantém sempre a capa em 16:9, com `object-fit: cover`. Capa em retrato ou quadrada
  é recortada no centro, nunca esticada, e o cartão não muda de altura. Conferido com as 73 capas reais
  do arquivo que não são 16:9 (retrato de 0,40 a 0,89 e quadradas): nenhuma distorce. O recorte pode
  cortar texto da arte, e o Gui aceitou esse recorte (20 nov 2026). O destaque grande da Home (`PainelEvento.astro`) continua com o desenho em pé
  para capa em retrato, de propósito.
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
- **Repositório público até o lançamento (Gui, 18 nov 2026):** tudo o que entra em commit, PR,
  nota ou comentário fica visível para qualquer pessoa e fica no histórico. Nada de dado pessoal de
  terceiros, número interno que não pode sair ou conversa privada nas notas.
- **Trecho de posicionamento do Sobre:** usa a paleta fechada `TEMAS_DE_POSICAO` em
  `src/lib/temas.ts`. As regras de cor estão comentadas lá.
- Os produtores dizem **"Trio da @bsurda"**, nunca "bloco".
- **Tom dos textos (do Gui):** texto corrido do site segue `notas/tom.md`, tirado das legendas do
  Instagram e das descrições antigas dos eventos: perto, animado, com humor de pista, sem tom de
  verbete. Fichas, datas, créditos e rótulos continuam secos.
