# Brief: página da WIG com as respostas do Rafa

Decidido em 19/11/2026 (Gui). Para uma sessão do Claude Code construir sem precisar da conversa.

## Por quê

O Rafa respondeu boa parte do documento "Página da WIG no site da @bsurda: o que precisamos de você"
(Drive, `10_site/3_Projetos/wig`). O Gui quer que a Charlotte veja a página o mais completa
possível; depois a gente itera com ela. Tudo o que é rascunho de texto fica marcado como rascunho no
relatório, não na página.

Telefone e e-mail que aparecem no documento **não entram** no site nem no repositório (o contato
está pausado e o repositório está público).

## 1. Elenco e bastidores (`src/data/wig.json`)

- **Guta Leão** entra no casting. Instagram: https://www.instagram.com/agutaleao/. Foto:
  `notas/briefs/wig-fotos/guta-leao.jpg` (vai para `public/projetos/wig/guta-leao.jpg`, no mesmo
  tamanho e peso das outras). Ela não tem frase.
- **Adesivo "New Girl" (Gui):** a Guta entrou agora e a foto dela não é da mesma sessão das outras.
  O crachá dela leva um adesivo "New Girl" colado no canto, no lugar da frase. Adesivo é objeto
  físico: sólido, levemente torto, com cara de adesivo de verdade, dentro da paleta `TEMAS_DA_WIG` e
  com leitura (4,5:1). Medido em cqw, como o resto do crachá. O adesivo sai quando chegarem as fotos
  novas do elenco (o Rafa disse 2027). Deixe isso num campo do JSON (por exemplo, `adesivo: "New
  Girl"`), não escrito à mão no componente.
- **Rafael Pessoa** ganha a frase "a tia das drags".
- **Ramon** entra nos bastidores, como "Assistente de backstage". Instagram:
  https://www.instagram.com/ramon4lmeida/. Sem frase. Foto: `notas/briefs/wig-fotos/ramon.jpg`.
- **Nalla** entra nos bastidores, como "Assistente de backstage", com a frase "dama de vermelho".
  Instagram: https://www.instagram.com/mechamamdenalla/. Foto: `notas/briefs/wig-fotos/nalla.jpg`.
- Bastidores seguem a regra do material (cor viva). Ramon e Nalla depois do Rafa.
- Grafias: "Mallibu" com dois L; "Aria" sem acento.
- O crédito das fotos (@jonas__dias, retoques @iagorci) vale para as fotos da sessão. As três novas
  vieram de outra fonte: não podem aparecer como se fossem dessa sessão. Se a página mostra o crédito
  como da sessão inteira, diga que vale para "as fotos do casting de 2025" ou equivalente, e relate.

## 2. Projetos (`series` em `src/data/wig-eventos.json`)

Ordem nova (do Rafa): WIG Brunch, WIG Party, Tela Tuck, CHRONUS, Chá com Charlotte, Arraiá das
Piranhas, WIGokê. Os quatro textos atuais foram confirmados. Os três novos ganham texto no tom de
`notas/tom.md`, a partir do que o Rafa escreveu:

- **WIG Party:** festas feitas por drag, comandadas por artistas drag, com pop, hyperpop, house e funk.
  Começou em 2016 como festa da @bsurda. Edições com a @bsurda já estão na Agenda: ligue a série a
  elas em vez de copiar (não repita evento na página).
- **Chá com Charlotte:** programa com cheirinho de casa de vó, que resgata histórias a partir de
  receitas que marcaram cada convidado.
- **WIGokê:** apresentado pela Charlotte. Além de soltar a voz, a pessoa se entrega a uma performance
  completa, com direito a peruca.

Projeto sem data conhecida aparece sem "Ver as datas".

## 3. Datas (`eventos` em `src/data/wig-eventos.json`)

Acrescente o que falta; não apague nem mude o que existe, salvo data errada. Mantenha os links do
Sympla que já existem. Quando o nome do evento não for conhecido, use o nome do projeto com a
convidada. Elenco de cada edição pode entrar como campo (`elenco`, `convidadas`), se a página já
tiver onde mostrar; se não tiver, guarde no dado e não crie layout novo.

**WIG Brunch, 15 edições**, todas com Charlotte Drag:

- 23/09/2023: Jaddy Stone, Mannu Mallibu, Mira MiuMiu, Nickary Aycker
- 20/01/2024: convidada Aimée Lumière; Joanna Mescladi, Leona Souki, Monalisa LeBlanc
- 25/05/2024: convidadas Ravena Creole e Márcia Pantera; Mannu Mallibu, Mira MiuMiu, Nickary Aycker
- 20/07/2024: convidada Miranda Lebrão; Jaddy Stone, Joanna Mescladi, Monalisa LeBlanc
- 14/09/2024: convidadas Shannon Skarllet e Nayla Brizard; new face Ana Ty; Mira MiuMiu, Nickary Aycker
- 07/12/2024 (Natalino): Jaddy Stone, Joanna Mescladi, Leona Souki (último brunch dela), Mannu
  Mallibu, Mira MiuMiu, Nickary Aycker
- 15/03/2025: convidada Mellody Queen; Aria Dreamz (estreia), Joanna Mescladi, Mannu Mallibu,
  Nickary Aycker
- 26/04/2025: convidada Organzza; Carambola (estreia), Jaddy Stone, Mira MiuMiu
- 14/06/2025: convidada Betina Polaroid; new face Lian Queer; Joanna Mescladi, Mannu Mallibu
- 09/08/2025: convidada Desiree Beck; new face Junxciel; Aria Dreamz, Jaddy Stone
- 26/10/2025: convidada Poseidon; new face Guta Leão; Carambola, Mira MiuMiu
- 18/04/2026: convidada Natasha Princess; new face Camponeusa; Jaddy Stone, Joanna Mescladi, Mannu Mallibu
- 11/07/2026: convidada Dacota Monteiro; new face Stevie Hitchcock; Aria Dreamz, Mira MiuMiu, Nickary Aycker
- 05/09/2026: convidada Adora Black; new face Meigay Lallibob; Carambola, Joanna Mescladi, Mannu Mallibu
- 24/10/2026: convidada Frimes; new face Lillia Azul; Jaddy Stone, Joanna Mescladi, Nickary Aycker

**Tela Tuck, 24 sessões:**

- Drag Race Brasil: 10/07/2025 (Charlotte e Carambola, DJ Ed); 17/07/2025 (Charlotte e Mannu
  Mallibu, DJ Ed); 24/07/2025 (Jaddy Stone e Joanna Mescladi, DJ Joanna); 31/07/2025 (Charlotte e
  Mellody Queen); 07/08/2025 (Charlotte e Bhelchi); 14/08/2025 (Charlotte e Mercedez Vulcão);
  21/08/2025 (Charlotte e Ruby Nox); 28/08/2025 (Charlotte e Chanel); 04/09/2025 (Charlotte e Mira
  MiuMiu); 11/09/2025, final, Tela Tuck ft. Festa de Assistir (Charlotte, Aria Dreamz, Joanna
  Mescladi, Safira, Voga). De 31/07 a 11/09, DJ Charlotte.
- Corrida das Blogueiras 7, com Joanna Mescladi: 28/10/2025 (e Aria Dreamz); 11/11/2025 (e Manille);
  18/11/2025 (e Kitty Kawakubo); 25/11/2025 (e Mady Beeong); 02/12/2025; 09/12/2025 (e Vini
  Freire); 16/12/2025 (e Jordan); 13/01/2026, final (com Charlotte, Lian Queer e Mannu Mallibu).
- 21/04/2026: final do BBB26, com Charlotte e Joanna Mescladi.
- Corrida das Blogueiras 8, com Joanna Mescladi: 27/10/2026 (e Mannu Mallibu); 03/11/2026 (e
  Jordan); 10/11/2026 (e Breia e Rhanyane); 17/11/2026 (e Madrinha); 24/11/2026 (e Gabriel e Sarah
  Vika). A de 24/11 ainda vai acontecer: use `jaAcabou` como em todo o site.

**CHRONUS:**

- 05 e 06/11/2021: Teatro da Cidade, BH (1ª temporada)
- 03 e 04/06/2022: Galpão Cine Horto, BH (2ª temporada)
- 04/09/2022: Parque Municipal, BH (Virada Cultural)
- 04 a 06/08/2023: Galpão do Folias, São Paulo (temporada em SP)
- 04/10/2023: Baile Hallowmigas, São Paulo (atração)

O espetáculo encerrou a primeira fase; uma segunda temporada é projeto futuro. A `nota` da série
pode dizer isso. CHRONUS é coprodução: confira o que já está na Agenda antes de acrescentar, para
não repetir.

**Arraiá das Piranhas:** o Rafa não respondeu. Fica como está.

## 4. Apresentação

A página abre com uma frase só. Troque por dois ou três parágrafos curtos, no tom de `notas/tom.md`,
a partir destas respostas do Rafa:

- A WIG é uma agência drag que cuida de drags e é gerida por uma drag. Mostra que drag ocupa espaço
  além do palco de boate: eventos corporativos, palestras, teatro.
- Nasceu como festa da @bsurda em 2016. Em 2023 virou agência, com a Charlotte produzindo (e
  agenciada) e o Rafa na produção e no backstage. Primeiro evento como agência: 02/06/2023.
- Relação com a @bsurda: irmandade e confiança; "a WIG não existiria sem a @bsurda". Festas da @bsurda
  com drags da WIG, Brunch com DJs da @bsurda, WIG Party em coprodução.
- Acontece sobretudo em BH (Mira, O Quinteiro, Gis, Autêntica, Casa Sapucaí); já foi a São Paulo.
- Marcos: 2016 festa da @bsurda; 2023 agência e temporada do CHRONUS em SP; 2025 chegam Aria e
  Carambola; 2026 primeira atração internacional numa WIG Party (Keiona), homenagem na Câmara
  Municipal de BH pela promoção da comunidade LGBTQIAPN+, matéria na Globo Minas e os 10 anos com
  WIG Party (Jasmine Kennedie).
- Grafia: "WIG events" para a marca; "WIGurls" vale (começou como brincadeira interna).
- Bordão: "Faz o W".

Use os marcos com moderação: a página não vira linha do tempo. O relatório traz o texto inteiro para
o Gui e a Charlotte aprovarem.

## Ao terminar

As regras novas (adesivo, assistentes de backstage, ordem dos projetos) vão para a seção "WIG" do
`CLAUDE.md`. Apague este brief e a pasta `notas/briefs/wig-fotos/` no mesmo PR.
