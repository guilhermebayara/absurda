# Achados do QA de produção (Sessão G, 22/11/2026)

Sessão só de leitura em https://festaabsurda.com (375, 768 e 1440 px, as 31 páginas do sitemap e a
404). Sem erro de console, imagem quebrada ou link interno quebrado; Lighthouse 96 a 100 em
acessibilidade e 100 em SEO. Este arquivo separa o que é defeito (vai para uma sessão sem perguntar)
do que é decisão do Gui (respondida em 22/11).

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

## Decisões do Gui (22/11/2026, de manhã)

Registrar em `notas/decisoes.md` e construir junto com os defeitos.

7. **Contato só pelo Instagram.** O `contato@exemplo.com` sai do site inteiro (rodapé, `/contato`,
   `src/config.ts`). No lugar fica o link de mensagem do Instagram da @bsurda, que já existe no
   site. Nenhum e-mail entra (o contato segue pausado).
8. **Formulário de `/contato` sai** até o contato ser decidido. A página fica só com as redes, no
   tom do site. O código do formulário pode ficar guardado, desligado, para voltar depois.
9. **Bios de marcação viram rascunho.** As oito páginas (André Victor, Ayumi, Barbara Deister,
   Charlotte, Ed Luiz, FAB, Gabriel Cadete e Gui Bayara) ganham uma bio curta, uma ou duas frases no
   tom de `notas/tom.md`, escrita só com o que o repositório já sabe de cada pessoa (dados da
   página, `notas/equipe-insumos.md`, escalações, projetos). Nada inventado: o que não se sabe fica
   de fora. As oito vão inteiras no relatório para o Gui aprovar; ele pode trocar qualquer uma.
10. **Imagem padrão de compartilhamento: a marca da @bsurda sobre a cor do site.** Gerada no
    repositório (1200 x 630, menos de 300 KB), com um tema da paleta e contraste de leitura na
    marca. Vira o `og:image` da Home e de toda página sem foto própria; `twitter:card` passa a
    `summary_large_image`. Página com foto própria continua com a dela. Guardar uma cópia na pasta
    `7_Geral/imagem-de-compartilhamento` do Drive é tarefa da conversa, não da sessão.

## Sobras da Sessão F (Actions), também para esta sessão

11. **Alarme do histórico** (`alarme-arquivo.yml`): acrescentar `timeout-minutes` e `paths-ignore` de
    documentação (`notas/**`, `CLAUDE.md`, `README.md`), como pede a regra geral do CLAUDE.md.
12. **Robô da agenda** (`atualiza-agenda.yml`): quando o robô grava algo na `main`, o push dele já
    dispara um build na Cloudflare; o gancho no fim pede outro. O gancho passa a pedir o build só
    quando o robô não gravou nada.

## Não deu para conferir

Safari e iPhone; 53 links da Shotgun (429); `ig.me/m/bsurda` e o Pixieset (teste manual);
contraste do Amorzinho com a cor assentada; leitor de tela e zoom de 200%; Home e Agenda com evento
futuro.
