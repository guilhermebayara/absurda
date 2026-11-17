# Brief: o atalho de anos da Agenda pula no iPhone

Achado do Gui em 17/11/2026, para uma sessão dedicada do Claude Code. Leia antes `CLAUDE.md`
(principalmente "Banda do Safari no iPhone" em "Cuidados"), `notas/decisoes.md` e
`notas/a-fazer.md`.

## O sintoma

No Safari do iPhone (iOS 26), a barra com o atalho de anos da Agenda (a fila "2026 2025 2024...",
presa no alto enquanto se rola pelo arquivo) **pula quando se toca num ano**. Às vezes pula também
durante a rolagem comum. Acontece em todas as versões: na `main`, na `design` e nas prévias de
teste. O Gui conferiu o código da `main` puro numa prévia (`tst-controle`) e a `design` com outra
mudança, e as duas pulam igual.

No desktop a barra é `sticky` comum, e nenhum pulo foi relatado lá.

## Onde mora

- `src/pages/agenda.astro`:
  - a marcação: `<div data-trilho>` envolve a `nav.anos-nav` (`data-barra="sempre"`) e os anos
    (`details.ano`, com `id="ano-AAAA"`);
  - o script: `alternar()` abre e fecha um ano com animação de altura (0,45 s ao abrir, 0,32 s ao
    fechar, pulada com movimento reduzido); o clique num ano do atalho segue o link `#ano-AAAA`,
    abre o ano e trava a medição por 600 ms (`travaAte`); `medir()` e `pintar()` marcam o ano
    que está na tela (`aria-current`) e centralizam a fila com `scrollTo` suave;
  - o CSS: `.ano` tem `scroll-margin-top: 3.5rem`; a `.anos-nav` é `sticky` no desktop.
- `src/layouts/Base.astro`:
  - o script põe a classe `pino-novo` no toque e, com um `ResizeObserver`, grava a altura do
    trilho (`--alt`) e a da barra (`--barra`) no próprio trilho;
  - o CSS "Barras presas no topo, no toque": a barra anda por animação ligada à rolagem
    (`view-timeline` do trilho, `@keyframes barra-presa`), com uma cobertura (`::before`) que
    esconde o conteúdo acima dela, atrás do relógio.
- O ano dos Marcos, no Sobre (`data-barra="estreita"`), usa o mesmo mecanismo e o Gui não viu pulo
  lá. Mas ele não tem anos para tocar.

## Hipótese principal (não confirmada)

No toque, três coisas acontecem juntas dentro do trilho: a página salta até o ano pelo link, o ano
se abre com a animação de altura e o trilho cresce a cada quadro dessa animação. O
`ResizeObserver` regrava `--alt` a cada quadro, e o trajeto da barra muda enquanto a página
salta. Na rolagem comum nada disso acontece.

Caminhos a investigar: abrir o ano sem animar a altura no toque; mudar a ordem (abrir primeiro e
saltar depois, ou o contrário); rolar até o ano por script, em vez do salto do link; congelar o
trajeto da barra durante a abertura. Seguir a lição do site da família: uma peça só andando, e
nenhuma animação ligando ou desligando no meio da rolagem.

## O que já foi testado no iPhone (Gui, 17/11/2026)

Numa branch de diagnóstico com variantes que se somavam, todas na rolagem comum:

1. O desenho de hoje: pulava.
2. O trajeto da barra sem a altura da tela na conta: **não pulou na rolagem**, mas às vezes o
   conteúdo aparecia acima da barra.
3. A 2 com a fila de anos sem rolagem pelo dedo: não pulou, mas não dá para arrastar os anos.
   Rejeitada.
4. A 3 com o ano marcado mudando só quando a rolagem para: parecia erro, e não dá para escolher um
   ano. Rejeitada.

Ninguém testou o toque num ano em nenhuma variante. As correções abaixo cuidam da rolagem, não do
toque.

### Correções da rolagem, prontas para reaproveitar

Ficaram na branch `teste-componentes` (commits `0aa530e` e `09a3063`), que pode ter sido apagada.
O essencial:

- **Trajeto sem a altura da tela** (`Base.astro`, as duas barras, `sempre` e `estreita`). No lugar
  de `animation-range: contain 0% exit calc(100% - var(--barra, 0px))`, use
  `animation-range: contain 0% contain calc(0% + var(--alt, 0px) - var(--barra, 0px))`. O trecho
  `contain` começa quando o topo do trilho encosta no alto da tela; daí a barra anda exatamente a
  altura do trilho menos a dela. Com `exit calc(100% - ...)` a conta usa a altura da tela, que no
  iPhone muda quando a barra de endereço encolhe ou volta.
- **Cobertura de uma vez** (o `::before` das duas barras): `animation-range: contain 0% contain
  calc(0% + 1px)` no lugar de `contain calc(0% + 3rem)`. Em 3rem ela surgia aos poucos e o
  conteúdo aparecia acima da barra. Nesse instante ela está toda acima da tela, então surgir de uma
  vez não se vê. Ainda não conferido no iPhone.
- **Nada se mexendo dentro da barra na rolagem** (`agenda.astro`, só no toque, com a classe
  `pino-novo`): a fila de anos se centraliza só 250 ms depois que a rolagem para, sem animação; o
  ano marcado acende sem transição (`:global(html.pino-novo) .anos-nav a,
  :global(html.pino-novo) .anos-nav a::before { transition: none; }`). Isso sozinho não tirou o
  pulo, mas entrou junto na variante 2 que funcionou.

### Conferência `confere:barra`

O script `scripts/confere-barra.mjs` da mesma branch abre as páginas com `data-trilho` num iPhone
emulado (Chromium), rola com o dedo e falha se:
- a barra presa sai do alto da tela;
- o trajeto depende da altura da tela;
- algo dentro dela anima por tempo ou rola sozinho enquanto a página rola (os algarismos do ano dos
  Marcos ficam numa lista de exceções conferidas no aparelho).

Refaça ou recupere o script e acrescente o caso do toque: tocar num ano do atalho e medir a
posição da barra a cada quadro, até o ano terminar de abrir.

## Como reproduzir fora do iPhone

- O Chromium com emulação de iPhone **não reproduz** o pulo, nem na rolagem nem mudando a altura
  da tela.
- O **WebKit do Playwright** (26.6, a mesma geração do Safari do iOS 26) mostrou o erro uma vez: na
  `main`, com a página levada direto para o meio dos anos, a barra estava 1.199 px fora do lugar
  até a altura da tela mudar. Não repetiu em 20 tentativas. O Gui autorizou instalar:
  `npx playwright install --with-deps webkit`. Teste nele o toque num ano.
- O mais fiel é o **Simulador de iOS do Xcode, num Mac**, se o Gui conectar uma pasta do Mac à
  sessão pelo Remote Control.
- O Gui confere no iPhone. Leve a ele uma rodada com poucas variantes que se somam, cada uma
  escolhida pelo endereço (`/agenda?barra=1`, `2`...), com um aviso no alto da página dizendo qual
  está ligada. Assim uma só conferência isola a causa.

## Regras

- Em aparelho de toque, nada de `sticky` nem `fixed` (banda do Safari).
- A fila de anos continua arrastável com o dedo, e tocar num ano continua levando a ele.
- Trabalhe numa `tst-barra-agenda`, nascida da `main` atualizada. Rode todas as conferências.
  Vai para a `design` depois do ok do Gui no iPhone.

## Pronto quando

- No iPhone, tocar num ano e rolar pelo arquivo não fazem a barra pular, nem mostram conteúdo
  acima dela. Vale também para o ano dos Marcos, no Sobre.
- `confere:barra` existe, roda no `confere-site.yml` e cobre a rolagem e o toque.
- `CLAUDE.md` ("Conferências do site", "Levar para a main" e "Banda do Safari") e
  `notas/decisoes.md` registram a regra; o item sai de `notas/a-fazer.md`.
