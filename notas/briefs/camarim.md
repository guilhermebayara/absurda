# Brief: a página do sistema (`/camarim`)

Pedido do Gui em 16/11/2026, engavetado em 17/11 até o site estabilizar no ar e retomado em
26/11/2026, com um acréscimo: o nível WCAG de cada combinação de cor. Duas etapas, cada uma numa
sessão própria. Leia antes `CLAUDE.md`, `notas/decisoes.md` e `notas/a-fazer.md`.

Referências (só leitura, outros repositórios do Gui, mesmo caminho em duas etapas):
- site da família, `guilhermebayara/bayaranascimento`, branch `homologa`: a página `/sistema`
  (`src/pages/sistema.astro`, `src/visual/sistema.ts`) e a seção "Sistema" de `docs/visual.md`;
- portfólio, `guilhermebayara/bayara`, branch `homologa`: a página `/boneca` e o brief
  `docs/briefs/boneca.md`.

Uma tentativa da etapa 1 em 16/11 (branch `teste-componentes`) foi descartada com o engavetamento.
Não procure por ela: a etapa 1 recomeça do zero, a partir da `homologa` de agora, que já tem a Leveza,
o `foto()` e o resto das sessões até a L.

## O que é

Uma página que mostra o sistema visual do site: tokens, temas, as cores que a página calcula, o nível
WCAG de cada combinação e cada peça, montada com o mesmo código que o site usa. É ferramenta de
trabalho do Gui e das próximas sessões, não página para o público.

- **Endereço:** `/camarim`. Camarim é onde a festa se monta antes de subir ao palco: as peças
  aparecem ali prontas, antes de irem para a pista.
- **Escondida, não trancada.** O site não tem login. A página é `noindex`, fica fora do sitemap, não
  tem link de lugar nenhum e não traz conteúdo privado: nada de token, valor de patrocínio, cota,
  contato pessoal ou dado que o site não mostra em outra página. Se vazar, mostra só o visual.
- **Leveza** (seção "Leveza" do `CLAUDE.md`): a página é estática como o resto, sem script de
  terceiro e sem nada que caia no Worker. Animação que roda sozinha para fora da tela (`data-corre`).

## Etapa 1: peças viram componentes, sem mudança visual

Algumas peças já são componentes em `src/components/` (`Botao`, `Capa`, `CartaoEvento`, `Cracha`,
`CrachaWig`, `CreditoFoto`, `Eco`, `ElencoWig`, `EventosWig`, `Faixa`, `PainelEvento`, os de `marca/`)
e servem de modelo. Outras estão escritas dentro das páginas.

1. **Fotos antes.** Todas as páginas, em 390 e 1440 px, com movimento reduzido e em mais de um tema
   (o tema é sorteado: fixe o sorteio para as fotos de antes e de depois saírem iguais). Fora do
   repositório, ou em `notas/camarim/antes/` se ajudarem a revisar. Na prévia de teste entram os
   eventos de exemplo; use um build local com `WORKERS_CI_BRANCH=tst-x` para Home e Agenda com evento.
2. **Extrair cada peça** que se repete para `src/components/`, com o mesmo HTML e as mesmas classes.
   Candidatas, a confirmar lendo o código: cartaz de projeto (vivo, adormecido e o da WIG), ficha de
   pessoa (rótulo, valor e filete), pulseira, linha de evento da Agenda e o atalho de anos, bloco de
   marco do Sobre, cartão do rodapé e do menu no celular, barra inclinada, parede de palavras, bloco
   de lista (T/NB, PCD, aniversariantes), casos e marcas de Parcerias, blocos de "O que a WIG faz",
   polaroide do Trio. O que só existe uma vez e é layout da página fica na página.
3. **Sem tocar no que é delicado:** as marcas `>>> conta das cores` e `<<< conta das cores` de
   `Base.astro`, a regra de nenhum `sticky` ou `fixed` no toque, os modelos de `pino-novo`, o
   `data-corre` das animações, o `foto()` com o `sizes` e o `ate2x` de cada lugar, e o
   `fetchpriority` das imagens que aparecem primeiro (ver "Cuidados" e "Leveza" no `CLAUDE.md`).
4. **Fotos depois.** Idênticas, ou cada diferença explicada e aprovada pelo Gui. Esta etapa não muda
   desenho: nada novo, nenhum ajuste de passagem. Achados vão no relatório.
5. **Peso igual:** `npm run mede:leveza` antes e depois, nas mesmas páginas da auditoria J. O HTML e
   o CSS servidos não podem crescer além de ruído; se crescerem, explique.
6. Todas as conferências de "Levar para a `main`" passando. Branch `tst-componentes`, nascida da
   `homologa` igualada; PR para a `homologa`, sem merge.

## Etapa 2: a página

Em cima dos componentes da etapa 1, numa branch `tst-camarim`. Só começa depois que a etapa 1 estiver
na `homologa`.

- **Tokens.** Cada tema de `src/lib/temas.ts` com nome, as três cores de base e as cores que a página
  calcula (`--destaque-texto`, `--suave`, `--enfeite`, `--vivo`, `--sobre-vivo`, `--vivo-detalhe`),
  lado a lado, e as paletas fechadas (site, posicionamento, Tibum, Trio, Parada, WIG). Escala de tipo
  com amostras reais, espaçamentos, `--raio-cartao` e `--folga-cartao`, movimentos.
- **Nível WCAG de cada combinação de cor (Gui, 26/11/2026).** Para cada tema, cada par que o site
  usa de verdade, com a razão de contraste (duas casas, vírgula) e o nível:
  - pares: texto sobre fundo; destaque sobre fundo; `--destaque-texto` sobre fundo; `--suave` sobre
    fundo; fundo sobre texto (superfície invertida); `--enfeite` sobre texto; `--sobre-vivo` sobre
    `--vivo`; `--vivo-detalhe` sobre `--vivo`. Se a etapa 1 mostrar outro par em uso, ele entra;
  - nível de texto (WCAG 2.2, 1.4.3 e 1.4.6): AAA a partir de 7:1; AA a partir de 4,5:1; "AA só
    texto grande" de 3:1 a 4,5:1 (AAA de texto grande a partir de 4,5:1); abaixo de 3:1, não passa;
  - par que o site usa como enfeite ou objeto (destaque sobre fundo, `--enfeite`, `--vivo-detalhe`)
    mostra também o nível de elemento gráfico (1.4.11, AA a partir de 3:1), com o rótulo "enfeite";
  - ao lado do nível WCAG, a regra do site que o par segue: leitura (4,5:1) ou enfeite (3:1). A
    página não "corrige" enfeite: ele pode ficar abaixo de AA de texto de propósito;
  - **uma conta só.** A razão sai da mesma conta do `confere:temas` (luminância relativa do WCAG),
    e as cores calculadas saem do trecho marcado de `Base.astro`, como o `confere:temas` já faz. Nada
    de segunda versão da conta: se precisar, a sessão leva a conta para um módulo que os dois usam,
    sem mudar o resultado do `confere:temas`;
  - os números saem no build, em HTML: nada de cálculo no navegador para mostrar a tabela.
- **Peças,** cada uma em mais de um tema e com seus estados: aberta e fechada, hover e foco, texto
  longo, celular onde muda. Cada peça com uma linha sobre quando se usa e onde mora no código.
- **Regras** escritas ao lado das peças que governam: contraste de leitura (4,5:1) e de enfeite
  (3:1); objeto que imita coisa física é sólido (subtema vivo); crachá da @bsurda e da WIG; cartões
  no celular; nada preso no toque; tom de texto (`notas/tom.md`).
- **Conteúdo de exemplo** inventado e neutro: nada de bio, foto ou dado de pessoa real. Crachá e
  pulseira de exemplo usam nome fictício. Foto de exemplo: as capas de `public/exemplos/`.
- A página segue as regras do próprio site e as do Gui: sem travessão, português, comedida.
- O desenho da página é da sessão, no idioma do site e das duas referências. Se ele pedir uma escolha
  que muda o que se vê (por exemplo, como mostrar dezenas de temas sem a página virar um muro), a
  sessão monta duas versões na prévia e pergunta.

## A conferência

No mesmo commit da página, criar `npm run confere:camarim` (script em `scripts/`, rodando no
`confere-site.yml`, ou no build se for rápido como as outras de `confere:rapidos`), que falha se:

- `/camarim` não existir, não for `noindex`, estiver no sitemap ou tiver link de outra página;
- `/camarim` mostrar nome de pessoa real, valor em reais ou qualquer coisa marcada como privada;
- a tabela de contraste de `/camarim` divergir do `confere:temas` (mesmo tema, mesmo par, razão
  diferente);
- opcional, se sair barato: algum componente de `src/components/` não aparecer em `/camarim`, para
  peça nova não ficar de fora.

Acrescentar o comando à lista de "Conferências do site" e de "Levar para a `main`" no `CLAUDE.md`.

## Pronto quando

- Etapa 1 na `homologa` com as fotos batendo, aprovada pelo Gui.
- Etapa 2 na `homologa`, o Gui viu `/camarim` na prévia, e as duas vão para a `main` com o ok dele.
- `notas/decisoes.md` registra onde o sistema mora, o `CLAUDE.md` ganha a seção do camarim, este brief
  é apagado e o item sai de `notas/a-fazer.md`.
