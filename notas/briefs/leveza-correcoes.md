# Correções de leveza (depois da auditoria da Sessão J)

Os números e o diagnóstico estão em `notas/leveza-auditoria.md` (PR #15, Sessão J, 23 nov 2026).
Este brief diz o que construir. Medir antes e depois com `npm run mede:leveza`, na mesma página e
na mesma tela, e pôr a tabela de antes e depois no relatório.

## Escolhas do Gui (23 nov 2026)

- **T1, fotos no celular:** 2x em Projetos, Equipe e Sobre. O resto do site continua pedindo a
  densidade do aparelho (3x no iPhone).
- **T2, capas das edições:** as 39 capas de 240 px (`-p`) que aparecem borradas no projeto @bsurda e
  no Sobre passam a usar a versão grande do arquivo, pelo `foto()`, com versões geradas só no `dist`.
  Nunca mexer em `public/arquivo/`.
- **T3, rolagem do Sobre:** ainda não decidida. Depende da conferência no iPhone (itens 1 e 3 da
  lista da seção 3 da auditoria). Não mexer na pilha do Trio nem no parallax da janela.
- **T4, robô da agenda:** uma vez por dia, de madrugada. Ajustar o `cron` de `atualiza-agenda.yml`
  para um horário de madrugada que fuja da hora cheia, e escrever no cabeçalho do fluxo e no
  CLAUDE.md que o GitHub atrasa e pula rodadas agendadas, e por isso é uma só.
- **T5, Cloudflare Web Analytics:** desligado. Quem desliga é o painel (Web Analytics da zona
  festaabsurda.com); a sessão confere que o farol sumiu das páginas e registra no CLAUDE.md que o
  site não tem script de terceiro.

## O que construir (defeitos da seção 6 da auditoria)

1. Capas do Shotgun nos cartões (Home, Agenda, projeto @bsurda) com `srcset` (`w_400`, `w_800`,
   `w_1280`) e o `sizes` do cartão.
2. Parede da Home e letreiros (`parede-corre`, `corre` em `Faixa.astro`) param quando saem da tela
   (`IntersectionObserver` com `animation-play-state`). Nada muda na tela. Conferir com o
   `confere:parede` e o `confere:calmo`, e listar no relatório o que o Gui confere no iPhone (a
   parede volta sem piscar depois de sair e voltar à tela e depois de trocar de aba).
3. Parede da Home usa a capa pequena do evento escrito à mão (`-xs`), e não a `-lg`.
4. Cache das versões das fotos dentro de `node_modules/.astro/`, para o cache de build da Cloudflare
   guardar entre builds.
5. Versão WebP na largura do original, para o `srcset` nunca cair no JPG original.
6. `sizes` dos crachás da Equipe e dos cartazes pequenos de Projetos, medidos na tela.
7. Build do robô no Actions sem gerar versões de fotos (variável que desliga a integração).
8. Tirar as 3 leituras da "segunda imagem" do Shotgun e o campo `proporcoesDaSegundaImagem` do
   `/estado.json`.
9. 404 de `/_astro/` sem cache de um ano (`public/_headers`).
10. Os itens já em "A construir": gancho do robô só quando ele não gravou; `timeout-minutes` e
    `paths-ignore` no alarme; tirar a `design` do código.

Fora desta sessão: build watch paths (excluir `notas/*`, `CLAUDE.md` e `README.md`) é configuração
do painel da Cloudflare, feita pelo Gui ou pela conversa com o ok dele.

## Ao terminar

- Aplicar no `CLAUDE.md` a seção "Leveza", a partir do rascunho da seção 8 da auditoria, já com as
  escolhas acima.
- Tirar este item de "A construir" e apagar este brief no mesmo PR.
