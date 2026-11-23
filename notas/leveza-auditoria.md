# Auditoria de leveza (Sessão J, 23 nov 2026)

Pedido do Gui de 23 nov 2026: manter a conta Cloudflare no plano gratuito e deixar o site o mais
leve possível sem perder qualidade, contando o custo no servidor e no aparelho de quem abre. Esta
sessão só mediu. Nada no site mudou; as correções ficam para uma sessão própria, com as escolhas do
Gui nos trade-offs (seção 7).

**Como medir de novo:** `npm run mede:leveza -- <medição>` (scripts em `scripts/desempenho/`, fora
do build e do `confere-site.yml`). Medições: `build`, `builds [dias]`, `paginas [base|local] [rotas]`,
`aparelho [base|local] [rotas]`, `cache [base]` ou `tudo`. Os números completos vão para
`<tmp>/absurda-leveza/*.json`. `LEVEZA_DPR_CELULAR=2` mede o celular a 2x.

**Onde foi medido:** na produção (https://festaabsurda.com), alcançada pela rede da sessão, com o
estado de 23 nov 2026 (três eventos futuros do Shotgun no ar). Home e Agenda também num build local
com eventos de exemplo (`WORKERS_CI_BRANCH=tst-x`), servido como a Cloudflare serve (`local`).
Celular: 390 x 844 a 3x (iPhone). Desktop: 1440 x 900 a 1x.

## 0. Os tetos, conferidos na documentação em 23 nov 2026

| O quê | Plano gratuito | Fonte |
| --- | --- | --- |
| Requisições a asset estático | Grátis e sem limite ("Requests to static assets are free and unlimited") | developers.cloudflare.com/workers/static-assets/billing-and-limitations/ |
| Requisições ao Worker | 100.000 por dia, zerando à meia-noite UTC; 10 ms de CPU por requisição | developers.cloudflare.com/workers/platform/limits/ |
| Workers Builds | 3.000 minutos por mês; 1 build de cada vez na conta; 20 min de limite por build; máquina de 2 vCPU e 8 GB | developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/ |
| Arquivos por versão do Worker | 20.000 arquivos, 25 MiB cada (o site tem 1.208 arquivos, 66 MB no total) | developers.cloudflare.com/workers/platform/limits/ |
| Cache de build | Astro: só `node_modules/.astro`, mais o cache do npm; 10 GB por projeto; apagado 7 dias depois da última leitura | developers.cloudflare.com/workers/ci-cd/builds/build-caching/ |
| Build watch paths | Existe (Settings, Build, Build watch paths): exclui caminhos e pula o build quando só eles mudaram | developers.cloudflare.com/workers/ci-cd/builds/build-watch-paths/ |
| GitHub Actions | Repositório público: grátis. Privado, plano Free: US$ 12 por mês de uso incluído, cerca de 2.000 minutos de Linux a US$ 0,006 | docs.github.com/en/billing/concepts/product-billing/github-actions |

A página de limites não diz com todas as letras que os 3.000 minutos são por conta (diz que a
concorrência de 1 build é "across an account"). O plano Workers Free é da conta, então a leitura
segura é: os 3.000 minutos e o build de cada vez são divididos com o Bastidores. Se o Bastidores
estiver construindo, o build do site espera na fila. A documentação não diz se build pedido pelo
gancho conta minuto igual ao de push; o razoável é contar igual.

## 1. Conta compartilhada e build

### O Worker não roda código

- `wrangler.jsonc` só tem `assets` (pasta `dist`, `not_found_handling: "404-page"`) e `previews: {}`.
  Nada de `main`, nada de `run_worker_first`. Não há `_worker.js` em `public/` nem em `dist/`.
- `_headers` e `_redirects` são lidos pela camada de assets. O 404 sai de `dist/404.html` pela
  mesma camada.
- O único endereço do domínio que não é arquivo do site é `/cdn-cgi/rum` (POST do Web Analytics, a
  cada página vista). É serviço da própria Cloudflare na zona, e não passa pelo Worker.
- Conclusão: nenhuma requisição do site cai no Worker. As 100 mil por dia e a CPU do Worker ficam
  inteiras para o Bastidores.

### Duração dos builds (últimos 14 dias, 9 a 22 nov)

O check run "Workers Builds" chega ao GitHub já concluído (início igual ao fim), então a duração
sai da check suite do app da Cloudflare: do push até o fim do build, **com a fila incluída**. Cinco
builds com mais de 20 minutos (o limite do plano) foram descartados como ruído da check suite.

| Branch | Builds | Média (min) | Mediana (min) | Máxima (min) | Soma (min) |
| --- | ---: | ---: | ---: | ---: | ---: |
| `main` (push) | 222 | 1,98 | 1,65 | 15,3 | 441 |
| homologação (`design` e `homologa`) | 82 | 1,61 | 1,52 | 4,8 | 132 |
| teste (`tst-`, `qa-`, `teste-`, 15 branches) | 37 | 1,58 | 0,95 | 15,0 | 59 |
| gancho do robô da agenda (não aparece no GitHub) | 26 | sem dado | (1,65 suposto) | | (43) |
| **total** | **367** | | | | **~675** |

Por semana: 9 a 15 nov, 229 builds e 414 minutos (quase tudo na `main`, antes da homologação);
16 a 22 nov, 109 builds e 214 minutos, mais uns 13 do gancho. O dia mais cheio teve 67 builds (12
nov).

### Estimativa mensal de minutos de build do site

| Cenário | Produção | Homologação | Prévias `tst-`/`qa-` | Total | Do teto de 3.000 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Ritmo de 9 a 15 nov (tudo na `main`) | ~1.450 | ~300 | ~25 | **~1.800** | 60% |
| Ritmo de 16 a 22 nov (homologação em uso) | ~500 | ~250 | ~230 | **~1.000** | 33% |
| Manutenção depois do lançamento (estimado) | ~120 | ~65 | ~65 | **~250** | 8% |

Manutenção: robô 2 vezes por dia (60 builds pelo gancho), umas 3 gravações do robô por mês (3
builds pelo push), umas 8 rodadas para a `main`; 40 builds na homologação e 40 em prévias. Tudo a
1,6 minuto. O site cabe folgado no plano; o risco é o Bastidores somar a isso, e a fila de um build
de cada vez.

### Quanto do build é cada etapa

`npm run mede:leveza -- build`, nesta máquina (4 núcleos), sem as chaves das plataformas:

| Etapa | Sem cache das fotos | Com cache das fotos |
| --- | ---: | ---: |
| guarda da produção | 0,9 s | 0,5 s |
| `astro check` | 5,1 s | 4,4 s |
| `astro build` (montagem + fotos) | 8,4 s (288 versões em 6 s) | 2,6 s (288 versões em 0 s) |
| trava dos exemplos e as cinco conferências rápidas | 0,1 s | 0 s |
| **total** | **14,5 s** | **7,5 s** |

No GitHub Actions (rodada do robô de 23 nov, 01h44 UTC) o `astro build` levou 11,9 s, dos quais
**7,5 s nas 288 versões de fotos**. O build da Cloudflare tem 2 vCPU, então a conta das fotos deve
ficar perto disso.

**O cache de build da Cloudflare não ajuda nas fotos hoje.** Para Astro ele guarda só
`node_modules/.astro` (e o cache do npm). O cache das versões mora em
`node_modules/.cache/absurda-imagens`, que não está na lista. Todo build da Cloudflare refaz as 288
versões do zero. Mudando o cache para dentro de `node_modules/.astro/` (por exemplo
`node_modules/.astro/absurda-imagens`), ele passaria a ser guardado entre builds. Ganho estimado:
6 a 8 s por build, uns 8% da duração mediana. Confirmar no log de um build da Cloudflare (a linha
"288 versões de fotos em ...") antes e depois.

O resto dos ~1,6 minuto de mediana é da Cloudflare: fila, clone, `npm ci` e o envio dos arquivos. O
build em si leva uns 15 s.

### Build duplo do robô (push e gancho)

Nos últimos 14 dias o robô **não gravou nada na `main`** (nenhum evento terminou entre um arquivo e
outro: o último arquivado é de 14 nov, guardado em 17 nov). Então o build duplo aconteceu **zero
vezes** no período. Ele acontece uma vez por evento que termina, umas 2 a 4 vezes por mês. Ganho
pequeno, mas a correção já está em "A construir".

### O robô roda menos e mais tarde do que diz

O agendamento do GitHub atrasa e pula rodadas. De 12 a 23 nov, com o horário antigo (`17 9,15,21`
UTC, 3 por dia), rodaram 22 de 34 previstas: **a das 9h17 UTC (6h17 de Brasília) não rodou nenhuma
vez**; a das 15h17 UTC saiu de 1 a 4 horas depois; a das 21h17 UTC saiu de 4 a 6 horas depois (entre
22h e 0h de Brasília). Com o horário de hoje (`17 9,21`), a tendência é **uma atualização por dia,
perto da meia-noite**. Ver pergunta T4.

### Chamadas externas por build

| Chamada | Quando | Quantas | Tempo |
| --- | --- | ---: | --- |
| `https://festaabsurda.com/estado.json` (guarda da produção) | todo build | 1 | 0,5 a 0,9 s |
| Shotgun, lista de eventos (futuros e uma página de passados) | `main` e homologação | 2 | não medido daqui (sem token); o build todo leva 1,5 min |
| Shotgun (Cloudinary), capa de 160 px de cada evento futuro, para a cor | `main` e homologação | 3 hoje (1 por evento futuro) | idem |
| Shotgun (Cloudinary), "segunda imagem" dos 3 primeiros futuros, só para o `/estado.json` | `main` e homologação | 3 hoje | idem |
| Sympla | só com `SYMPLA_TOKEN` (hoje desligado) | 0 | |

Hoje são 9 chamadas por build com token e 1 sem. As três da "segunda imagem" só servem a um campo de
diagnóstico do `/estado.json` (`proporcoesDaSegundaImagem`). Daria para tirá-las sem efeito no site.

## 2. Peso das páginas (produção, cache vazio)

`npm run mede:leveza -- paginas`. KB transferidos (comprimidos). "Abertura / depois de rolar até o
fim" quando os dois diferem.

| Página | Tela | HTML | CSS | JS | Fontes | Imagens | Total | Req. |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Home | celular | 18 | 13 | 13 | 28 | 871 | 944 | 16 |
| Home | desktop | 18 | 13 | 13 | 28 | 955 | 1.028 | 16 |
| Agenda | celular | 38 | 12 | 13 | 28 | 333 | 424 | 11 |
| Agenda | desktop | 38 | 12 | 13 | 28 | 333 | 424 | 11 |
| Sobre | celular | 23 | 15 | 13 | 45 | 323 / 3.538 | 420 / 3.635 | 12 / 35 |
| Sobre | desktop | 23 | 15 | 13 | 45 | 374 / 3.228 | 470 / 3.325 | 12 / 28 |
| Projetos | celular | 12 | 9 | 13 | 28 | 1.232 | 1.295 | 14 |
| Projetos | desktop | 12 | 9 | 13 | 28 | 461 | 523 | 14 |
| Projeto @bsurda (71 fotos) | celular | 18 | 15 | 13 | 28 | 583 / 1.493 | 657 / 1.568 | 16 / 56 |
| Projeto @bsurda (71 fotos) | desktop | 18 | 15 | 13 | 28 | 1.050 / 1.632 | 1.124 / 1.707 | 24 / 62 |
| WIG | celular | 39 | 15 | 13 | 28 | 414 | 509 | 12 |
| WIG | desktop | 39 | 15 | 13 | 28 | 638 | 733 | 22 |
| Equipe | celular | 12 | 16 | 13 | 28 | 538 | 607 | 16 |
| Equipe | desktop | 12 | 16 | 13 | 28 | 258 | 327 | 20 |
| Pessoa (Charlotte) | celular | 16 | 15 | 13 | 28 | 87 | 159 | 12 |
| Pessoa (Charlotte) | desktop | 16 | 15 | 13 | 28 | 42 | 114 | 12 |
| Parcerias | ambas | 12 | 10 | 13 | 28 | 0 | 64 | 8 |
| Contato | ambas | 10 | 8 | 13 | 28 | 0 | 60 | 7 |

Build local com eventos de exemplo (as capas dos exemplos passam pelo `foto()`): Home 632 KB no
celular e 412 / 686 KB no desktop; Agenda **117 KB no celular e 87 KB no desktop**, contra 424 KB na
produção. A diferença é quase toda das capas do Shotgun (abaixo).

### Requisições a outros domínios

- `static.cloudflareinsights.com` em **todas as páginas**: o farol do Cloudflare Web Analytics
  (31,8 KB, uns 10 KB transferidos, cache de um dia), mais um POST para `/cdn-cgi/rum` por página
  vista. Ele não está no repositório: a Cloudflare injeta na entrega. É quase todo o "JS" da tabela;
  o JS do próprio site tem 1,9 KB transferidos. Nenhum motivo escrito no repositório (pergunta T5).
- `assets.shotgun.live` (capas dos eventos futuros) na Home, Agenda e projeto @bsurda.
- `images.sympla.com.br` na Home e no projeto @bsurda: a capa de um evento escrito à mão
  (`src/data/eventos-manual.json`).

### Fotos: largura servida contra a necessária

Necessária = caixa na tela x densidade, levando em conta o `object-fit: cover`. Acima de 2x é
grande demais; abaixo de 0,85 pode borrar.

**Grandes demais (bytes jogados fora):**

| Onde | Foto | Servida | Necessária | KB |
| --- | --- | ---: | ---: | ---: |
| Agenda, Home, projeto @bsurda (cartões) | 3 capas do Shotgun em `w_1280`, sem `srcset` | 1.280 px | 358 px no desktop, 528 a 792 px no celular | 333 KB juntas |
| Home, parede (celular e desktop) | capa do Sympla `-lg.png` (evento escrito à mão) | 1.400 px | 208 a 370 px na tela (624 px a 3x) | 257 KB (a `-xs`, de 600 px, tem 60 KB) |
| Sobre (celular) | `parada-bh-2018.jpg`, `ato-2026.jpg`, `parada-absurda-2025.jpg` | 1.200 px (original JPG) | ~510 px | 420 a 430 KB cada |
| Projetos (celular) | `i-hate-remix.jpg` (original JPG) | 1.400 px | 514 px | 274 KB |
| Equipe (celular) | `fab` em 720 | 720 px | 270 px | 169 KB |
| Equipe (desktop) | cinco crachás em 480 | 480 px | ~235 px | ~30 KB cada |

O caso do Sobre e de Projetos tem a mesma causa: a foto original (JPG) é o maior candidato do
`srcset`. Quando a largura pedida (`sizes` x densidade) passa da maior versão WebP que existe, o
navegador pula para o JPG original. No Sobre, `90vw` x 3 = 1.053 px, maior que a versão de 960, e
o original de 1.200 px vem inteiro. No desktop a 1440 px de largura (`100vw`), as fotos do Trio e
a capa da WIG vêm em JPG original pelo mesmo motivo (507, 387, 382, 352, 341 KB; `wig.jpg` 481 KB).
Passar esses originais para WebP na mesma largura economiza ~30% em `parada-bh-2018`, `ato-2026` e
`wig` (de 426 para 297 KB, de 419 para 294, de 480 para 390), e quase nada nas fotos do Trio (de 507
para 505 KB).

**Pequenas demais (podem borrar):**

- Capas `-p` do arquivo (240 px) no projeto @bsurda e no Sobre, mostradas com 290 a 410 px:
  razão de 0,2 a 0,4 no celular, de 0,4 a 0,6 no desktop. São 39 capas, 286 KB; as grandes
  correspondentes existem em `public/arquivo/` (2.060 KB nos originais). Pergunta T2.
- Fotos de tela cheia recortadas em caixa em pé no celular (Home `.rua` com `trio-2023`, Sobre
  `.janela` com `mineirao-10-anos`, capa do projeto @bsurda): a caixa tem 350 x 784 px, a foto é
  deitada, e o recorte pede 3.000 a 3.500 px a 3x. Servem 1.280 px (razão ~0,36). Aumentar custaria
  muito; fica como está, e entra na pergunta T1.
- Polaroides de baixo da pilha do Trio usam a `-mini` (320 px) de propósito (CLAUDE.md, "Trio no
  toque").
- Fundo desfocado do destaque da Home (`.ev-fundo`, `blur(56px)`) usa a capa de 240 px de
  propósito: com o desfoque, não faz diferença.

### Cobertura de JS e CSS (depois de rolar)

| Página | JS carregado | JS sem uso | CSS carregado | CSS sem uso |
| --- | ---: | ---: | ---: | ---: |
| Home | 48 KB | 32% | 47 KB | 38 a 43% |
| Agenda | 48 KB | 35 a 39% | 39 KB | 48 a 51% |
| Sobre | 49 KB | 31 a 37% | 65 KB | 36 a 51% |
| Projeto @bsurda | 45 KB | 36 a 39% | 57 KB | 69% |
| WIG | 45 KB | 37 a 39% | 57 KB | 63 a 68% |
| Contato | 44 KB | 36 a 40% | 25 KB | 53% |

Tamanhos sem compressão. O JS é quase todo o farol do Web Analytics (31,8 KB); sem ele, o JS da
página tem 17 KB e 18 a 21% sem uso. O CSS sem uso é o do layout comum (`Base`) e de estados que
só aparecem em outra tela ou tema. Comprimido, o CSS da página é de 8 a 16 KB: ganho pequeno, não
vale mexer agora.

### HTML

Comprimido, o HTML vai de 7 KB (Contato) a 38 KB (Agenda). Sem compressão a Agenda tem 342 KB
(94 KB só de atributos `data-astro-cid`), a WIG 193 KB (119 KB de SVG, os nomes na letra da marca)
e a Home 140 KB (85 KB de SVG, o "@" repetido nos letreiros). A compressão resolve quase tudo; o
custo que sobra é o do navegador montar a página, que não apareceu como tarefa longa (seção 3).

## 3. Custo no aparelho

`npm run mede:leveza -- aparelho`. Chromium, celular 390 x 844 a 3x, rede 4G (9 Mbps, 1,5 Mbps de
subida, 100 ms), CPU 4x mais lenta, cache vazio.

| Página | FCP (ms) | LCP (ms) | CLS | TBT (ms) |
| --- | ---: | ---: | ---: | ---: |
| Home | 904 | 920 | 0,076 | 46 |
| Agenda | 904 | 1.192 | 0 | 0 |
| Sobre | 1.180 | 1.180 | 0 | 0 |
| Projetos | 376 | 1.480 | 0 | 0 |
| Projeto @bsurda | 1.052 | 1.116 | 0 | 0 |
| WIG | 792 | 1.208 | 0 | 0 |
| Equipe | 1.276 | 1.460 | 0 | 0 |
| Pessoa (Charlotte) | 700 | 868 | 0 | 0 |
| Parcerias | 528 | 1.516 | 0 | 0 |
| Contato | 348 | 348 | 0 | 0 |

Todas dentro do "bom" do Google (LCP até 2,5 s, CLS até 0,1, TBT perto de zero). Variação entre
rodadas: LCP de 0,9 a 2,4 s, conforme a rede. A carga não é o problema.

**Página parada 10 s e rolagem de cima a baixo:**

| Página | Heap JS (MB) | Tarefas parada / rolando (ms) | Recálculos de estilo rolando (n / ms) | Layouts rolando (n / ms) | Animações rodando parada (fora da tela) | Quadros/s parada (topo / meio) | Camadas e textura estimada (topo / meio) |
| --- | ---: | ---: | ---: | ---: | --- | ---: | ---: |
| Home | 1,1 | 8 a 390 / 1.542 | 199 / 790 | 5 / 2 | 23 (23): `parede-corre` 20, `corre` 2, `pino-parede` 1 | **60 / 60** | 37 (257 MB) / 37 (257 MB) |
| Agenda | 1,0 | 5 / 1.373 | 192 / 659 | 29 / 16 | 3 (3): `corre` 1, barra 2 | **60 / 60** | 8 (144) / 8 (144) |
| Sobre | 1,0 a 1,2 | 2 / **4.815** | **452 / 1.340** | 122 / 93 | 17 (17): pilha e barra (ligadas à rolagem) | 0 / 0 | 13 (556) / **23 (733)** |
| Projetos | 1,0 | 5 / 218 | 75 / 60 | 0 | nenhuma | 0 / 0 | 16 (61) |
| Projeto @bsurda | 1,0 | 5 / 2.285 | 306 / 730 | 67 / 46 | nenhuma | 0 / 0 | 11 (235) |
| WIG | 1,6 | 5 / 1.244 | 146 / 587 | 33 / 23 | nenhuma | 0 / 0 | 4 (219) |
| Equipe | 1,0 | 3 / 365 | 82 / 55 | 3 / 2 | nenhuma | 0 / 0 | 23 (85) |
| Pessoa (Charlotte) | 1,6 | 5 / 178 | 51 / 43 | 0 | nenhuma | 0 / 0 | 4 (40) |
| Parcerias | 1,5 | 3 / 631 | 206 / 152 | 16 / 11 | nenhuma | 0 / 0 | 2 (112) |
| Contato | 1,5 | 4 / 132 | 53 / 36 | 0 | nenhuma | 0 / 0 | 2 (19) |

Leitura:

- **O que roda o tempo todo: a parede de palavras e os letreiros.** Home e Agenda fazem o compositor
  desenhar 60 quadros por segundo com a página parada, e continuam com a parede e as faixas fora da
  tela (no topo da Home, as 23 animações estão todas fora da tela). As outras páginas ficam em zero.
  O custo não aparece na thread principal (8 ms em 10 s), e sim na GPU e na bateria. Nada pausa
  essas animações fora da tela: `parede-corre` e `corre` (`Faixa.astro`) são `infinite` sem
  `IntersectionObserver`. Na Home do celular a cena da parede tem 37 camadas.
- **Sobre é a página mais cara para rolar:** 4,8 s de tarefas na thread principal com CPU 4x de cima
  a baixo, quase tudo em recálculo de estilo (452, 1,3 s) e pouco em script (0,12 s). É a pilha do
  Trio, a janela com `translateY(var(--d))` e a barra dos Marcos. A textura estimada no meio da
  pilha chega a ~733 MB. É um teto (largura x altura x 4 bytes x 9 de todas as camadas que desenham,
  sem descontar o que o navegador corta em ladrilhos), mas é o maior número do site, e camada é o que
  derruba a memória do Safari.
- **Home parada** variou entre 2 e 173 recálculos de estilo em 10 s nas rodadas. Um rastro sem a rede
  lenta não mostrou nenhum: os recálculos eram das fotos que ainda chegavam pelo 4G. Não há
  relógio rodando sozinho.
- **Animações ligadas à rolagem** (`pino-parede`, `barra-presa`, `barra-cobre`, `trio-pilha-*`)
  aparecem como "rodando", mas só andam quando a página rola. Parada, não desenham nada (Sobre e
  Agenda sem os letreiros ficam em 0 quadro).
- **Aba em segundo plano** não se mede daqui: o Chromium sem tela mantém a aba "visível" com outra
  na frente ou com a janela minimizada (testado). Pelo código: o único relógio do site é o
  `setInterval(acerta, 60000)` do `PainelEvento` (uma vez por minuto, e o navegador ainda espaça em
  segundo plano); os ouvintes de rolagem não fazem nada parados; animação CSS não desenha em aba
  escondida.

### O que o Gui deveria conferir no iPhone

1. **Memória da aba:** Safari do iPhone ligado ao Mac, menu Desenvolver, Web Inspector, aba
   Timelines com "Memory" e "Layers". Abrir Home e Sobre, rolar até a parede (Home) e até o meio da
   pilha do Trio (Sobre), e anotar o pico de memória e o número de camadas. É onde a medida daqui deu
   mais camada e mais textura.
2. **Energia:** na mesma Timelines, "CPU" com a Home parada no topo por 30 s. Se a CPU ou a energia
   não cair a quase zero, é a parede e os letreiros desenhando fora da tela.
3. **Rolagem do Sobre:** rolar de cima a baixo devagar e rápido, olhando se a pilha e a barra dos
   Marcos engasgam (no Chromium com CPU 4x foram 4,8 s de trabalho).
4. **Segundo plano:** abrir a Home, trocar de aba por 1 minuto, voltar. A parede tem de voltar sem
   piscar.
5. **Troca de tema:** trocar o tema três vezes seguidas na Home e no Sobre (a troca suave já parou no
   meio do caminho antes; ver "Troca de tema no iPhone" no CLAUDE.md).

## 4. Cache

`npm run mede:leveza -- cache`. Cabeçalhos da produção:

| Tipo | Exemplo | Cache-Control | Nome com hash |
| --- | --- | --- | --- |
| HTML | `/sobre` | `public, max-age=0, must-revalidate` | não |
| CSS, JS, fontes | `/_astro/Base.CQdyg3Yd.css` | `public, max-age=31536000, immutable` | sim |
| Versões das fotos | `/img/1280/sobre/mineirao-10-anos.webp` | `public, max-age=86400` | não (o nome é o da foto) |
| Capas do histórico | `/arquivo/sympla-273251-p.jpg` | `public, max-age=2592000` | não (o id não muda) |
| Capas das edições | `/capas/bazinga-2011-03-p.jpg` | `public, max-age=0, must-revalidate` | não |
| Fotos originais | `/sobre/*.jpg`, `/equipe/*.jpg`, `/projetos/*.jpg` | `public, max-age=0, must-revalidate` | não |
| Ícones, manifesto, `/estado.json` | `/favicon.svg` | `public, max-age=0, must-revalidate` | não |
| Farol do Web Analytics | `static.cloudflareinsights.com/beacon.min.js` | `public, max-age=86400` | (da Cloudflare) |
| Endereço inexistente em `/_astro/` | `/_astro/nao-existe.js` (404) | `public, max-age=31536000, immutable` | |

- Existe `public/_headers` com as regras de `/_astro/*`, `/arquivo/*` e `/img/*`. `/capas/*` e as
  fotos originais de `public/` ficam no padrão da Cloudflare (conferir a cada uso). Elas aparecem nas
  páginas pelo `srcset` só quando o navegador escolhe o original (seção 2), e nas capas `-p` das
  edições.
- A regra de `/_astro/*` vale também para o 404: um endereço de `/_astro/` que ainda não existe fica
  guardado como erro por um ano no navegador que pediu. Só acontece se alguém pedir um arquivo antes
  de ele existir; risco baixo.
- O HTML não traz `ETag` nem `Last-Modified`, então não há 304: cada visita baixa a página inteira
  (de 7 a 38 KB comprimidos).

**Navegação na mesma aba** (celular, cache do navegador ligado):

| Página | Requisições | Do cache, sem perguntar | Baixadas | KB |
| --- | ---: | ---: | ---: | ---: |
| Home (primeira) | 16 | 0 | 16 | 944 |
| Agenda | 11 | 8 | 3 (HTML, CSS da página, POST do Analytics) | 42 |
| Sobre | 13 | 6 | 7 | 371 |
| Projetos | 15 | 7 | 8 | 1.010 |
| Equipe | 17 | 6 | 11 | 558 |
| Home de novo | 14 | 12 | 2 (HTML, POST do Analytics) | 19 |

CSS, JS e fontes comuns saem do cache. A cada página só vêm o HTML, o CSS próprio dela, as fotos
novas e o POST do Analytics.

## 5. Nada consome recurso sem critério

Minutos do Actions: rodadas de 9 a 22 nov (o repositório é público e não paga); "por mês, privado"
é a estimativa com o GitHub Actions enxuto de 22 nov, arredondando cada trabalho para cima no minuto.

| Fluxo ou automático | Gatilho | Frequência | Actions, 14 dias (min) | Actions por mês, privado | Builds na Cloudflare | Motivo escrito hoje |
| --- | --- | --- | ---: | ---: | --- | --- |
| `atualiza-agenda.yml` (robô) | agenda `17 9,21 * * *` UTC e botão | 2 previstas por dia; na prática 1 a 2, com 1 a 6 h de atraso | 26 rodadas, 15 min | ~60 | 1 pelo gancho a cada rodada, mais 1 pelo push quando grava | Sim (cabeçalho do fluxo e CLAUDE.md). Não diz por que duas vezes por dia, nem que a das 6h17 não roda |
| `alarme-arquivo.yml` | push na `main` | por push (175 no período, quase tudo antes da homologação) | 43 (181 arredondados) | ~10 a 15 | 0 | Sim. Falta `timeout-minutes` e `paths-ignore` de documentação (já em "A construir") |
| `confere-site.yml` | só botão | antes de cada rodada para a `main` | 3 rodadas (4 a 8 min) desde 22 nov; 218 em push e 14 em PR antes | ~25 a 50 | 0 | Sim |
| `escalacoes.yml` | botão e push na `main` em 3 arquivos | 8 rodadas no período | 2,3 | ~2 | 1 pelo push quando grava nota (doc só) | Sim |
| "Confere o histórico" (fluxo antigo, já fora) | push | 217 rodadas até 19 nov | 46 | 0 | 0 | Saiu em 19 nov |
| Gancho de build (`CLOUDFLARE_DEPLOY_HOOK`) | fim de cada rodada do robô | 1 a 2 por dia | | | 1 por rodada (~60 por mês) | Sim (pegar os eventos novos do Shotgun e do Sympla) |
| Prévias por branch (Workers Builds) | cada push em qualquer branch | 109 builds em 16 a 22 nov | | | 1 por push | Sim (CLAUDE.md, "Prévias") |
| Build de commit só de documentação | push que só muda `notas/`, `CLAUDE.md`, `README.md` | **77 dos 346 builds** (22%) em 14 dias | | | 1 por push | **Não.** O site não muda; nada pede esse build |
| Cloudflare Web Analytics | cada página vista | sempre | | | 0 | **Não** (não está no repositório; foi ligado no painel) |
| Versões das fotos no build do robô (Actions) | cada rodada do robô | 1 a 2 por dia | 7,5 s por rodada | | | **Não.** O robô só precisa do `arquivo-pendente.json`; as fotos são jogadas fora |
| "Segunda imagem" do Shotgun no build | build com token | por build | | | | Diagnóstico de 2026; ninguém mais lê |

Total do Actions privado, ritmo enxuto: **~100 a 130 minutos por mês** de ~2.000. Bate com a
estimativa da decisão de 20 nov (100 a 150).

Rodando mais do que o motivo pede: o build de documentação (22% dos builds); as fotos geradas pelo
robô no Actions; os letreiros e a parede desenhando fora da tela. Sem motivo escrito: o Web
Analytics e o horário real do robô.

## 6. Correções propostas, em ordem de ganho

| # | Correção | Hoje | Ganho esperado | Tipo |
| ---: | --- | --- | --- | --- |
| 1 | Capas do Shotgun nos cartões com `srcset` (`w_400`, `w_800`, `w_1280` pelo `naLargura`) e `sizes` do cartão | Agenda e Home baixam 333 KB de capas em `w_1280` para cartões de 264 a 358 px | Desktop: de 337 para ~45 KB (−290 KB na Agenda e na Home). Celular a 3x: para ~150 KB (−190 KB). Agenda vai de 424 para ~135 KB no desktop | Defeito |
| 2 | Pausar `parede-corre` e `corre` fora da tela (`IntersectionObserver` com `animation-play-state`) | Home e Agenda: 60 quadros/s parados, com tudo fora da tela | 0 quadro/s quando a parede e as faixas não estão à vista; nada muda na tela. Conferir no iPhone se a parede volta sem piscar | Defeito (conferir no iPhone) |
| 3 | Parede da Home usa a capa pequena do evento escrito à mão (`capaPequena`, `-xs`, 600 px) | `-lg.png` de 1.400 px e 257 KB numa foto de 208 a 370 px | −197 KB na Home (celular e desktop), ~20% da página | Defeito |
| 4 | Build watch paths na Cloudflare: excluir `notas/*`, `CLAUDE.md`, `README.md` (o Gui faz no painel) | 22% dos builds são de commit só de documentação | ~20% dos minutos de build e da fila; 77 builds em 14 dias | Defeito (configuração) |
| 5 | Cache das versões das fotos dentro de `node_modules/.astro/` | Toda build da Cloudflare refaz as 288 versões (~7,5 s) | 6 a 8 s por build, ~8% | Defeito |
| 6 | Versão WebP na largura do original, para o navegador nunca pular para o JPG | Sobre celular baixa 3 originais de ~425 KB; WIG desktop baixa `wig.jpg` 481 KB | −380 KB no Sobre do celular (rolando), −90 KB na WIG do desktop; Trio quase nada | Defeito (qualidade igual, conferir) |
| 7 | `sizes` dos crachás da Equipe e dos cartazes pequenos de Projetos | `fab` 720 para 270 px; crachás 480 para 235 px no desktop | ~−130 KB na Equipe do celular, ~−75 KB no desktop | Defeito |
| 8 | Robô sem versões de fotos no Actions (variável que desliga a integração) | 7,5 s de 12 s do build em cada rodada | ~0,15 min por rodada; pouco hoje, mais com o repositório privado | Defeito |
| 9 | Gancho do robô só quando ele não gravou (já em "A construir") | Build duplo 2 a 4 vezes por mês (0 vezes nos últimos 14 dias) | 2 a 4 builds por mês | Defeito |
| 10 | Tirar as 3 leituras da "segunda imagem" do Shotgun | 3 downloads por build com token | 3 chamadas externas por build; segundos | Defeito |
| 11 | `timeout-minutes` e `paths-ignore` no alarme (já em "A construir") | | Trava contra rodada presa | Defeito |
| 12 | 404 de `/_astro/` sem cache de um ano | | Risco baixo evitado | Defeito |

Trade-offs, que viram perguntas (seção 7): densidade das fotos no celular (T1), capas `-p` borradas
(T2), rolagem do Sobre (T3), horário do robô (T4), Web Analytics (T5).

## 7. O que é defeito e o que é trade-off

**Defeito** (dá para corrigir sem decisão, porque nada muda para quem olha): itens 1 a 12 acima. O 2
e o 6 pedem conferência no iPhone.

**Trade-off** (fica mais leve, mas muda algo que se vê). Perguntas para o Gui:

- **T1. Fotos no celular a 2x em vez de 3x?** Hoje o celular recebe fotos para a densidade do iPhone
  (3x). Medido na produção, celular a 3x contra 2x:

  | Página | 3x (hoje) | 2x |
  | --- | ---: | ---: |
  | Sobre (rolando até o fim) | 3.635 KB | 2.065 KB (−43%) |
  | Projetos | 1.295 KB | 523 KB (−60%) |
  | Projeto @bsurda (rolando) | 1.568 KB | 1.409 KB (−10%) |
  | Equipe | 607 KB | 314 KB (−48%) |
  | WIG | 509 KB | 358 KB (−30%) |
  | Home | 944 KB | 839 KB (−11%) |

  O lado que se vê: num iPhone, foto grande (as do Trio, os cartazes de Projetos) fica um pouco
  menos nítida de perto. Em celular de tela 2x (quase todo Android de entrada) nada muda. Dá para
  fazer só em algumas páginas.
- **T2. Capas `-p` do arquivo mais nítidas?** No projeto @bsurda e no Sobre, 39 capas de 240 px
  aparecem com 290 a 410 px: no celular ficam borradas (razão de 0,2 a 0,4). Usar as versões
  grandes (que já existem no arquivo e ganhariam versões no `dist`, sem mexer em `public/arquivo/`)
  deixa nítido e custa mais: de 286 KB para algo entre 600 KB e 1 MB na página do projeto, rolando
  até o fim.
- **T3. Rolagem do Sobre mais leve?** Rolar o Sobre custa 4,8 s de trabalho com CPU 4x (o dobro da
  segunda página mais cara), em recálculo de estilo da pilha do Trio e da janela com parallax. Os
  caminhos são passar a janela para animação ligada à rolagem em CSS (mesmo efeito, menos trabalho,
  mas mexe em algo que já deu problema no iPhone) ou tirar o parallax da janela no toque (muda o que
  se vê). Pede antes a conferência 1 e 3 da lista do iPhone.
- **T4. Robô uma vez por dia, no horário que de fato roda?** O GitHub nunca rodou a das 6h17 e
  atrasa a das 18h17 em 4 a 6 horas. Opções: (a) deixar como está (uma ou duas por dia, sem
  controle da hora); (b) assumir uma por dia, de madrugada, e escrever isso, poupando ~30 builds e
  ~50 minutos por mês; (c) manter duas e aceitar o atraso. A agenda futura vem do Shotgun em todo
  build, então um evento anunciado entra no site no build seguinte (robô ou qualquer push).
- **T5. Cloudflare Web Analytics fica?** Custa ~10 KB e um POST em cada página vista, para todo
  visitante, e não está escrito em lugar nenhum. Se fica, a sessão de correção escreve o motivo no
  CLAUDE.md. Se sai, desliga no painel (Web Analytics da zona festaabsurda.com).

## 8. Rascunho de uma seção "Leveza" para o CLAUDE.md

Só rascunho. Quem aplica é a sessão de correção, depois das respostas do Gui.

```markdown
## Leveza (do Gui, 23 nov 2026)

O site tem de ficar no plano gratuito da Cloudflare e o mais leve possível sem perder qualidade. O
custo conta nos dois lados: no servidor e no aparelho de quem abre (memória, CPU, rede, bateria).

- **Tetos da conta "absurda" (divididos com o Bastidores):** Workers Builds, 3.000 minutos por mês e
  um build de cada vez na conta; Worker, 100 mil requisições por dia e 10 ms de CPU por requisição
  (o site não usa: é só asset estático, e requisição a asset é grátis e sem limite). Nada no site pode
  fazer uma requisição cair no Worker: nada de `main` nem de `run_worker_first` no `wrangler.jsonc`,
  nada de `_worker.js`. GitHub Actions, depois de 10/12 (privado): ~2.000 minutos por mês.
- **Nada consome recurso sem um motivo escrito.** Fluxo novo, chamada externa no build, animação que
  roda sozinha, script de terceiro: o motivo fica escrito no próprio arquivo ou aqui. O que roda mais
  vezes do que o motivo pede é defeito.
- **Quando ficar mais leve custar qualidade**, a sessão mede os dois lados (`npm run mede:leveza`) e
  não escolhe sozinha: vira pergunta para o Gui, com os números.
- **Motivo de cada automático:**
  - `atualiza-agenda.yml`: guarda os eventos que passaram e pede um build para a agenda futura vir do
    Shotgun. [frequência e horário conforme T4]
  - Gancho de build: só quando o robô não gravou nada (o push dele já gera um build).
  - `alarme-arquivo.yml`: avisa se o histórico mudou na `main` sem a marca.
  - `confere-site.yml`: testes de navegador, só pelo botão, antes de cada rodada para a `main`.
  - `escalacoes.yml`: material de trabalho, só pelo botão ou quando o próprio script muda.
  - Prévias por branch: a Cloudflare constrói cada push; commit só de `notas/`, `CLAUDE.md` e
    `README.md` não constrói (build watch paths, no painel).
  - Cloudflare Web Analytics: [motivo, conforme T5].
- **Fotos:** toda foto passa por `foto()`, inclusive as capas que vêm do Shotgun (com `w_` no
  endereço). O `sizes` é medido na tela. [densidade no celular conforme T1]
- **Animação que roda sozinha** (letreiros, parede) para quando sai da tela.
- **Medir antes e depois:** `npm run mede:leveza` (ver `scripts/desempenho/mede.mjs`). Os números de
  23 nov 2026 estão em `notas/leveza-auditoria.md`.
```

## 9. O que não deu para medir

- **Safari do iPhone**: memória, camadas, energia, segundo plano e rolagem com inércia só se veem no
  aparelho (lista na seção 3).
- **Aba em segundo plano**: o Chromium sem tela não esconde a aba (seção 3).
- **Log dos builds da Cloudflare**: sem acesso ao painel. A duração saiu da check suite do GitHub
  (com fila), e os builds do gancho não aparecem lá (contados pelas rodadas do robô). O tempo real
  das fotos no build da Cloudflare e o tempo das chamadas ao Shotgun ficam para conferir no log de
  um build (Workers, absurda, Deployments, View build).
- **Chamadas ao Shotgun e ao Sympla**: sem token aqui. Contadas pelo código e pelo `/estado.json` da
  produção.
- **Bastidores**: fora do repositório. O quanto ele gasta dos 3.000 minutos fica para o painel.
