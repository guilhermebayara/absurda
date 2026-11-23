# Brief: atrações do Sobre, da planilha para o site

Decidido em 18/11/2026 (Gui). Para uma sessão do Claude Code construir sem precisar da conversa.

## Por quê

As listas "Quem a gente trouxe" (`palco`, em `src/lib/historia.ts`) e "E a cena de BH" (`cena`, em
`src/pages/sobre.astro`) estão escritas dentro do código. O Ed precisa revisar e acrescentar nomes
sem mexer em código. A base de edição passa a ser uma planilha; o site continua lendo um JSON do
repositório, que passa pela `homologa` como todo o resto. O site nunca lê a planilha ao vivo: uma
edição acidental iria ao ar sem homologação, e o build passaria a depender de um link externo.

## A planilha

"Atrações do site", no Drive: `10_site/4_Sobre`. Id: `1TooJ2886DL8AUeO4ETRsqAmc9VoXTRtdOrXb-L0ta7I`.
Já está criada e preenchida com as 181 atrações que estão no ar hoje (41 em "Quem a gente trouxe" e
140 na cena). A equipe não está nela: entra sozinha pela coleção `pessoas`, como hoje.

Abas:

- **Atrações:** uma linha por nome. Colunas: Nome (como aparece), Grupo ("Quem a gente trouxe" ou
  "Cena de BH"), Ordem (só para "Quem a gente trouxe"; número menor aparece primeiro), Marca ou país
  (marca entre parênteses depois do nome na cena; país nas atrações de fora do Brasil), Status
  ("ok", "a revisar" ou "fora"), Fonte, Quando, Observação interna.
- **Fora:** quem ficou de fora de propósito, com o motivo. Só para gente; não é publicada.
- **Para o site:** fórmula que puxa só as linhas "ok", com as quatro primeiras colunas. É a única
  aba publicada como CSV. Observação interna e Fonte nunca saem da planilha.
- **Leia-me:** as regras para quem edita.

## O que construir

1. **`src/data/atracoes.json`**, com duas listas: `quemTrouxemos` (nome, ordem, país quando houver) e
   `cena` (nome, marca quando houver). A bandeira do país hoje mora no código (`bandeira` no
   `palco`): faça uma tabela pequena de país para bandeira no script (EUA, Porto Rico) e falhe com
   mensagem clara se aparecer um país sem bandeira.
2. **`scripts/atracoes.mjs`**, com `npm run atracoes`. Lê o CSV da aba "Para o site" e escreve o
   JSON. Aceite `--arquivo caminho.csv` para testar sem rede. O endereço publicado só existe depois
   que o Gui publicar a aba (ver `notas/a-fazer.md`); até lá, trabalhe com um CSV exportado.
3. **Validações.** Se alguma falhar, nada é escrito e a mensagem diz o nome e a linha:
   - nome vazio ou repetido (sem diferenciar maiúscula nem acento);
   - grupo desconhecido;
   - "Quem a gente trouxe" sem Ordem, ou com Ordem repetida;
   - "The Ladies" em qualquer grupo; "Sharon Needles" só com a marcação "riscado" (regras firmes
     do Gui, listas no topo do script);
   - marcação desconhecida (valem "em memória" e "riscado") e país sem bandeira.
   Nome da Equipe na planilha não é erro: a junção com a coleção `pessoas` já tira a repetição.
4. **Resumo no fim da execução:** quantos nomes entraram e quantos saíram em relação ao JSON
   anterior, com os nomes. Nome que saiu merece aviso explícito.
5. **A página Sobre lê o JSON.** `palco` e `cena` deixam de ser listas no código. Ficam as regras:
   cena em ordem alfabética, equipe junto e destacada, link para quem tem página, marca entre
   parênteses depois do nome (a de Célio Dias, "LED", passa a vir da coluna). "Quem a gente trouxe"
   segue a coluna Ordem.
6. **Antes de ligar a página ao JSON,** prove que o JSON gerado da planilha reproduz as listas de
   hoje: mesmos nomes, mesma ordem na tela. A planilha foi montada a partir delas.
7. **Conferência `confere:atracoes`** (script em `scripts/`, comando em `package.json`, passo em
   `.github/workflows/confere-site.yml`), no modelo do `confere:agenda`: falha se algum nome do JSON
   não aparecer na página Sobre montada. Roda depois do build.
8. **CLAUDE.md:** uma seção curta "Atrações do Sobre", com o caminho (planilha, script, JSON,
   `homologa`) e a regra de que o script só escreve na `homologa`.

## O que não fazer

- Não ligar o build ao Google nem pôr a leitura da planilha no `prebuild`.
- Não criar robô agendado por ora. O script roda sob demanda ("atualiza as atrações"). Se virar
  rotina, o robô escreve na `homologa`, nunca na `main`.
- Não mexer na planilha por script. Quem a mantém é a conversa do Gui no claude.ai e o Ed.
- Não tirar do site nome que não esteja na planilha sem avisar no resumo.

## Fluxo no dia a dia

O Ed revisa na planilha (filtra "a revisar", comenta, muda para "ok"). Alguém pede ao Code
"atualiza as atrações"; ele roda `npm run atracoes` na `homologa`, confere o resumo e faz o commit. O
Gui vê na prévia da `homologa` e leva para a `main` pelo caminho de sempre.

## Depois, se valer a pena

As listas de endereços (`lineup`) e de cidades (`cidades`), também no `historia.ts`, podem seguir o
mesmo modelo, em abas novas da mesma planilha. Fora do escopo agora.


## Estado (18 nov 2026)

Construído na `homologa`: `scripts/atracoes.mjs`, `src/data/atracoes.json`, o Sobre e `historia.ts`
lendo o JSON e `npm run confere:atracoes`. A coluna "Marcação no site" da aba "Para o site" aceita
"em memória" (etiqueta ao lado do nome) e "riscado" (nome riscado). Falta só o endereço publicado do CSV.
