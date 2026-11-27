# Ficha de crítica e QA de design do site da @bsurda

Esta é a ficha do projeto no padrão da gestão geral (documento "Crítica de design e QA de design", do
projeto "Gestão de projetos" no claude.ai). A base do método vale para todos os produtos; aqui ficam só
as personalizações da @bsurda. Quem escreve o prompt de uma sessão de crítica ou de QA lê esta ficha e
entrega à sessão o que ela pede. Escrita em 27 nov 2026. O que está marcado "inferido" o Gui confirma ou
corrige antes da primeira crítica.

## 1. Produto e estágio

Site da @bsurda (festaabsurda.com): agenda, projetos, equipe, parcerias, sobre e contato de uma festa
LGBTQIA+ de Belo Horizonte. Estágio: refinamento antes da divulgação. A produção ainda não foi
divulgada. Prévia para a crítica e o QA: https://homologa.festaabsurda.com (tem o token do Shotgun, então
mostra a agenda ao vivo). Prévias de `tst-...` mostram eventos de exemplo (ver CLAUDE.md, "Eventos de
exemplo nas prévias de teste").

## 2. Fluxos e cenários de chegada

Escolha do chat por rodada; a lista abaixo é o cardápio. Cada fluxo leva a medida de toques e rolagens
até a ação principal.

| Fluxo | De onde a pessoa chega | Aparelho | Tarefa e ação principal |
|---|---|---|---|
| Home até o ingresso | Link do Instagram (bio ou post) | Celular, 390 px | Saber qual é a próxima festa e chegar ao ingresso |
| Agenda | Home ou link direto | Celular e desktop | Achar uma festa pela data ou pelo ano (barra de anos) |
| Equipe e página de pessoa | Link de uma pessoa da equipe | Celular | Ver quem é, abrir o Instagram dela |
| Projetos | Menu | Celular e desktop | Entender o que a @bsurda faz além da festa |
| Parcerias | Marca ou patrocinador, por indicação | Desktop e celular | Ver o que a @bsurda oferece e mandar mensagem pelo Instagram |
| Sobre | Menu | Celular, iPhone com WebKit | Conhecer a história (Marcos, Trio, Lugares Improváveis) |

Inferido: o Instagram é a origem da maior parte das visitas, e o celular é o aparelho principal.

## 3. Objetivos visuais e onde estão escritos

- Voz e tom: `notas/tom.md` (perto, animado, humor de pista, sem tom de verbete; fichas, datas e
  rótulos continuam secos).
- Cor, contraste e objetos: CLAUDE.md, seções "Conferências do site" (regra de contraste, subtema
  "vivo") e "Cuidados que já custaram tempo".
- Direção de conceito e gosto visual do Gui para o site: inferido, a confirmar com ele antes da
  primeira crítica. A sessão infere o objetivo visual de cada fluxo, marca como inferido e o Gui corrige.

## 4. Lentes extras do projeto

1. **Voz e tom.** Todo texto corrido contra `notas/tom.md`. Texto com cara de verbete, emoji, "nós" no
   lugar de "a gente" e ficha que ficou fria entram como achado. Em caso de dúvida, é pergunta.
2. **O crachá como objeto.** Crachá e pulseira são sólidos e imitam coisa física; a crítica olha se a
   Equipe e as páginas de pessoa mantêm esse idioma.
3. **Festa primeiro.** Quem chega pelo Instagram quer saber da próxima festa. O que atrasa esse
   caminho em mais de um toque ou uma rolagem é achado.
4. **Estados da agenda.** Com evento, sem evento próximo (entre o fim do ano e os primeiros anúncios)
   e com evento acontecendo agora. A prévia `tst-vazio` mostra o estado sem evento.

## 5. Decisões fechadas e premissas abertas

**Fechadas (a sessão não questiona; dúvida sai como pergunta ao Gui):**

| Decisão | Motivo |
|---|---|
| O tema de cores é sorteado a cada visita (a lista do sorteio está em `src/lib/temas.ts`) | Identidade do site: a festa muda de cara a cada vez (Gui, 27 nov 2026, ao questionar o relatório do Cursor) |
| Contato só pelo Instagram, sem e-mail e sem formulário | O contato está pausado (Gui, 22 nov 2026; CLAUDE.md, "Contato") |
| Regras de uso da logo ficam "a definir" no `/camarim` | Escolha do Gui; cada versão diz "Quando usar: a definir" |
| `/camarim` é oculto (`noindex`, fora do sitemap, sem links) | Material de trabalho da marca e do site, não é página pública |
| Enfeite pode ousar no contraste (3:1), texto de leitura não (4,5:1) | Regra do Gui; a parede de palavras da Home depende disso |
| Recorte da capa do evento em 16:9 no cartão | O Gui aceitou o recorte (20 nov 2026) |
| Objetos físicos (crachá, pulseira) são sempre sólidos | Regra do Gui (subtema "vivo") |

**Premissas abertas (a sessão pode cavar):**

- A altura do topo (hero) das páginas índice: Projetos, Equipe e Parcerias. O Gui liberou a crítica
  desse ponto em 27 nov 2026.
- A ordem e o peso dos blocos da Home dentro do caminho até o ingresso.
- A densidade de texto de Parcerias para quem decide por uma marca.

## 6. Larguras e estados

Matriz padrão da base: 320, 390, 768, 1024 e 1440 px. Acrescentar:

- **721 a 960 px:** faixa onde as páginas de pessoa descem o texto para baixo dos dois crachás (QA de
  produção de 22 nov 2026). Medir nela.
- **iPhone com WebKit** (375 x 667, 375 x 812 e 393 x 852) para Sobre, barras presas e pilha do Trio.
  Safari real no iPhone só o Gui confere.
- **Movimento reduzido:** o site tem versão própria (lista simples no Trio, sem animação).
- **Sem JavaScript:** o site é estático; conferir o que some sem script (sorteio de tema, prévia que
  segue o cursor).

## 7. Gabarito do QA

- Regras do repositório: CLAUDE.md inteiro, com atenção a "Conferências do site", "Fotos, ícones e prévia
  de compartilhamento", "Leveza" e "Cuidados que já custaram tempo".
- O que os testes já travam: `confere:temas`, `confere:links`, `confere:agenda`, `confere:atracoes`,
  `confere:exemplos`, `confere:camarim` (no build); `confere:calmo`, `confere:parede`, `confere:barra`,
  `confere:pilha` e `confere:contraste` (navegador, na máquina ou por `confere-site.yml`). A sessão de
  QA não repete o que eles já garantem.
- Norma de acessibilidade: WCAG 2.2 AA (alvo de toque de 24 px, 44 px como recomendação).
- Falta medir (candidatos a `confere:` novo): alvo de toque pequeno, foco visível e não encoberto,
  rolagem horizontal indevida, alt vazio em foto que carrega a cena, ordem de títulos, movimento
  automático acima de 5 segundos (2.2.2).
- QA não decide conteúdo: texto, foto e estado de projeto vão como "conteúdo" para o Gui.

## 8. Prévia e dados de exemplo

- Crítica e QA de produção: https://homologa.festaabsurda.com, com a agenda ao vivo.
- Estado sem evento próximo: prévia de uma branch `tst-vazio-...`.
- Evento de exemplo (capa, nome longo, acontecendo agora): prévia de uma `tst-...`.
- Lista das páginas: Home, Agenda, Projetos (e cada projeto), Equipe (e cada pessoa), Parcerias, Sobre,
  Contato e as páginas de cada projeto da casa e da WIG. O chat da @bsurda guarda a lista com os
  endereços completos.
