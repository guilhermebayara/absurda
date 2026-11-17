# Brief: a página do sistema (`/camarim`)

Pedido do Gui em 16/11/2026, para sessões do Claude Code, em duas etapas. Leia antes `CLAUDE.md`,
`notas/decisoes.md` e `notas/a-fazer.md`. Referências: a página de sistema do site da família
(`guilhermebayara/bayaranascimento`, `/conceito/sistema`, e a seção "Sistema (fase 2)" do
`docs/visual.md` de lá) e o brief da `/boneca` do portfólio (`guilhermebayara/bayara`,
`docs/briefs/boneca.md`), que seguem o mesmo caminho.

## O que é

Uma página que mostra o sistema visual do site: tokens, temas e cada peça, montada com o mesmo
código que o site usa. É ferramenta de trabalho do Gui e das próximas sessões, não página para o
público.

- **Endereço:** `/camarim`. Camarim é onde a festa se monta antes de subir ao palco: as peças
  aparecem ali prontas, antes de irem para a pista.
- **Escondida, não trancada.** O site não tem login. A página é `noindex`, fica fora do sitemap, não
  tem link de lugar nenhum e não traz conteúdo privado: nada de token, valor de patrocínio, cota,
  contato pessoal ou dado que o site não mostra em outra página. Se vazar, mostra só o visual.

## Etapa 1: peças viram componentes, sem mudança visual

Algumas peças já são componentes em `src/components/` (`Botao`, `Cracha`, `CrachaWig`, `CartaoEvento`,
`PainelEvento`, `Faixa`, `Eco`, `Capa`) e servem de modelo. Outras estão escritas dentro das páginas.

1. **Fotos antes.** Todas as páginas, em 390 e 1440 px, com movimento reduzido e em mais de um tema.
   Fora do repositório (ou em `notas/camarim/antes/`, se ajudarem a revisar).
2. **Extrair cada peça** que se repete para `src/components/`, com o mesmo HTML e as mesmas classes.
   Candidatas, a confirmar lendo o código: cartaz de projeto (vivo, adormecido e o da WIG), ficha de
   pessoa (rótulo, valor e filete), pulseira, linha de evento da Agenda e o atalho de anos, bloco de
   marco do Sobre, cartão do rodapé e do menu no celular, faixa com "@", barra inclinada, parede de
   palavras, bloco de lista (T/NB, PCD, aniversariantes), casos e marcas de Parcerias, blocos de "O
   que a WIG faz". O que só existe uma vez e é layout da página fica na página.
3. **Sem tocar no que é delicado:** as marcas `>>> conta das cores` e `<<< conta das cores` de
   `Base.astro`, a regra de nenhum `sticky` ou `fixed` no toque e os modelos de `pino-novo`
   (ver "Cuidados" no `CLAUDE.md`).
4. **Fotos depois.** Idênticas, ou cada diferença explicada e aprovada pelo Gui. Esta etapa não muda
   desenho: nada novo, nenhum ajuste de passagem. Achados vão no relatório.
5. Todas as conferências passando. Trabalhar numa branch `teste-componentes`, nascida da `main`
   atualizada; vai para a `design` depois que o Gui olhar.

## Etapa 2: a página

Em cima dos componentes da etapa 1, numa branch `tst-camarim`.

- **Tokens.** Cada tema de `src/lib/temas.ts` com nome, cores e as cores que a página calcula
  (`--destaque-texto`, `--suave`, `--enfeite`, `--vivo`, `--sobre-vivo`, `--vivo-detalhe`), lado a lado,
  e as paletas fechadas (Tibum, Trio, Parada, WIG, posicionamento). Escala de tipo com amostras reais,
  espaçamentos, `--raio-cartao` e `--folga-cartao`, movimentos.
- **Peças,** cada uma em mais de um tema e com seus estados: aberta e fechada, hover e foco, texto
  longo, celular onde muda. Cada peça com uma linha sobre quando se usa e onde mora no código.
- **Regras** escritas ao lado das peças que governam: contraste de leitura (4,5:1) e de enfeite
  (3:1); objeto que imita coisa física é sólido (subtema vivo); crachá da @bsurda e da WIG; cartões
  no celular; nada preso no toque; tom de texto (`notas/tom.md`).
- **Conteúdo de exemplo** inventado e neutro: nada de bio, foto ou dado de pessoa real. Crachá e
  pulseira de exemplo usam nome fictício.
- A página segue as regras do próprio site e as do Gui: sem travessão, português, comedida.

## A conferência

No mesmo commit da página, criar `npm run confere:camarim` (script em `scripts/`, rodando no
`confere-site.yml`), que falha se:

- `/camarim` não existir, não for `noindex`, estiver no sitemap ou tiver link de outra página;
- `/camarim` mostrar nome de pessoa real, valor em reais ou qualquer coisa marcada como privada;
- opcional, se sair barato: algum componente de `src/components/` não aparecer em `/camarim`, para
  peça nova não ficar de fora.

Acrescentar o comando à lista de "Conferências do site" e de "Levar para a `main`" no `CLAUDE.md`.

## Pronto quando

- Etapa 1 na `design` com as fotos batendo, aprovada pelo Gui.
- Etapa 2 na `design`, o Gui viu `/camarim` na prévia, e as duas vão para a `main` com o ok dele.
- `notas/decisoes.md` registra onde o sistema mora, e o item sai de `notas/a-fazer.md`.
