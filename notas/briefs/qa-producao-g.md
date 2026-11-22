# Achados do QA de produção (Sessão G, 22/11/2026)

Sessão só de leitura em https://festaabsurda.com (375, 768 e 1440 px, as 31 páginas do sitemap e a
404). Sem erro de console, imagem quebrada ou link interno quebrado; Lighthouse 96 a 100 em
acessibilidade e 100 em SEO. Este arquivo separa o que é defeito (vai para uma sessão sem perguntar)
do que é decisão do Gui (perguntas na conversa de 22/11).

## Defeitos (para uma sessão)

1. **Páginas de pessoa cortam os links à direita em tablet.** `/equipe/fab`, `/equipe/grabs` e
   `/equipe/nath-leles` a 768 px: a coluna "Redes / Fora daqui" passa 19 a 55 px da tela e some
   (o `<html>` tem `overflow-x: clip`). Em 820 px sobram uns 4 px. A coluna precisa quebrar ou
   encolher; conferir todas as páginas de pessoa de 700 a 900 px.
2. **Contraste abaixo de 4,5:1 em texto de leitura**, contra a regra de contraste do CLAUDE.md:
   - `/sobre`, ano nas fotos dos Lugares Improváveis: 3,78:1;
   - `/projetos/wig`, texto do crachá do backstage: 3,7 a 4,2:1;
   - `/equipe`, pulseiras: 4,46:1;
   - `/projetos/halloween` e `/equipe/fab`: 4,37 a 4,49:1;
   - `/projetos`, cartaz do Amorzinho (verde): 2,2 a 2,8:1, medido talvez no meio da transição de
     tema. Conferir com a cor assentada.
   Texto de leitura vai a 4,5:1 pelo caminho que o site já usa (`--destaque-texto`, `--suave`,
   `--sobre-vivo`). Se algum desses for enfeite pela regra (3:1), não mexer e relatar qual. O achado
   vira conferência: o `confere:temas` deixou passar, então ele (ou uma conferência nova) passa a
   medir esses textos.
3. **Ordem de títulos na Home:** um `h3` (`.ev-nome`) logo depois do `h1`. Corrigir a hierarquia sem
   mudar o visual.
4. **Faixa de Lugares Improváveis no `/sobre` sem teclado:** o contêiner `.improvaveis` rola na
   horizontal e não recebe foco. Tornar a faixa focável e rolável pelas setas, sem botão novo nem
   mudança visual.
5. **Peso das imagens:** fotos de 1200 a 2000 px exibidas em 90 a 340 px, sem `srcset` nem
   `width`/`height` (`/sobre` 4,7 MB, `/projetos` 2,4 MB, `/equipe` 1,6 MB). Gerar tamanhos menores
   no build (o `astro:assets` ou equivalente), sem mudar recorte nem aparência. A imagem do LCP da
   Home (capa do evento em destaque) e a capa da primeira seção de `/projetos` ganham
   `fetchpriority="high"`. A prévia `wig.jpg` (480 KB) cai para menos de 300 KB, limite do WhatsApp.
   Não mexer em `public/arquivo/` (histórico): só gerar versões novas no build, se precisar.
6. **Ícones de toque e manifesto:** `/favicon.ico`, `/apple-touch-icon.png` e `/site.webmanifest`
   dão 404. Gerar a partir do `favicon.svg` que já existe.

Fica de fora (não é do site): a nota 81 de Boas práticas vem do script que a Cloudflare injeta.

## Decisões do Gui (perguntas de 22/11)

1. O que mostrar no lugar do e-mail de marcação (`contato@exemplo.com`, em `src/config.ts`), que
   está no rodapé de todas as páginas e em `/contato`.
2. O formulário de marcação de `/contato` (não envia).
3. As oito bios de marcação ("Bio de marcação. Aqui entra…"): André Victor, Ayumi, Barbara Deister,
   Charlotte, Ed Luiz, FAB, Gabriel Cadete e Gui Bayara.
4. A imagem padrão de compartilhamento (`og:image`) para a Home e as páginas sem foto própria
   (`/agenda`, `/projetos`, `/equipe`, `/parcerias`, `/contato` e algumas páginas de projeto e de
   pessoa). A pasta `7_Geral/imagem-de-compartilhamento` do Drive está prevista para ela.

## Não deu para conferir

Safari e iPhone; 53 links da Shotgun (429); `ig.me/m/bsurda` e o Pixieset (teste manual);
contraste do Amorzinho com a cor assentada; leitor de tela e zoom de 200%; Home e Agenda com evento
futuro.
