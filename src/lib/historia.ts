// Números e listas da história da @bsurda, usados na página Sobre e na Home.
// Mudou aqui, muda nos dois lugares.

export const idade = new Date().getFullYear() - 2009;

// Todos os endereços de Belo Horizonte por onde a festa passou, montados como o line-up
// de um festival: primeiro os grandes nomes, depois os de meio de cartaz, depois todos os outros.
// Vem do arquivo de eventos, com nomes repetidos unificados. A ordem dentro de cada faixa é de época.
export const lineup = [
  ['Mineirão', 'Up e.music', 'Mercado das Borboletas', 'Granfinos', 'Casa Sapucaí', 'Mira'],
  ['Velvet Club', 'Mary in Hell', 'CentoeQuatro', 'Hotel Diamante', 'Royalty Club', 'Studio Bar', 'GIS', 'Deputamadre', 'O Mercado',
    'A Central', 'Viaduto Santa Tereza', 'Praça da Estação', 'Parque das Mangabeiras', 'Church', 'Lab', 'Funarte MG'],
  ['On Board', 'Quina Galeria', 'Emme Lounge', 'União Israelita', 'Matriz', 'Anda', 'Secreto', 'Roxy Club', 'Josefine Club', 'Moss Club',
    'Skorpius', 'Soleá', 'Rua Guaicurus', 'Necup', 'A Fábrica', 'Factory', 'Avenida dos Andradas', 'Ita Park', 'Fábrica Criativa',
    'Galpão La Trupe', 'QG Rooftop', 'Gruta', 'Urbana', 'Espaço Even', 'LOL', 'Rock Content', 'Casa Híbrido', 'Jhon Jhon Club', 'Espettos',
    'Pampulha', 'Rua da Bahia', 'Avenida Afonso Pena', 'Dduck', 'Code Bar', 'Yanã Bar', 'Villa Paraty', 'Catavento Cultural',
    'Teatro da Cidade', 'Mamão com Açúcar', 'Jackie O', 'Prime Hall', 'A Autêntica', 'Sítio Via Lazer', '80Bar', 'Zona', 'Distrital', 'Lavos',
    'Galpão do Folias', 'Irregular', 'Praça Sete', 'Casa Rosa do Bonfim', 'Andaluz Pub', 'Espaço Sapucaí', 'Galpão 54', 'Espaço Loc',
    'Espaço Y', 'Clube Labareda', 'Major Lock'],
];
export const totalDeLugares = lineup.flat().length;

export const cidades = ['Vitória', 'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Maringá', 'Londrina', 'Sete Lagoas', 'Juiz de Fora', 'Montes Claros'];

// Números da abertura. "mais" põe um "+" na frente.
export const numeros = [
  { n: idade, rotulo: 'anos de festa' },
  { n: 390, mais: true, rotulo: 'eventos' },
  { n: totalDeLugares, mais: false, rotulo: 'endereços em BH', nota: 'e contando' },
  { n: cidades.length + 1, rotulo: 'cidades', nota: 'a confirmar' },
];

// Quem a gente trouxe. "de" marca atração de fora do Brasil.
export const palco = [
  { nome: 'Pabllo Vittar' }, { nome: 'Jão' }, { nome: 'Gloria Groove' }, { nome: 'Karol Conká' }, { nome: 'Elke Maravilha' },
  { nome: 'Gretchen' }, { nome: 'Banda Uó' }, { nome: 'Candy Mel' }, { nome: 'Mateus Carrilho' }, { nome: 'Bonde do Rolê' }, { nome: 'Deize Tigrona' }, { nome: 'Rico Dalasam' },
  { nome: 'Jaloo' }, { nome: 'Potyguara Bardo' }, { nome: 'Tiê' }, { nome: 'Kaya Conky' }, { nome: 'Pepita' }, { nome: 'Aretuza Lovi' },
  { nome: 'Penelopy Jean' }, { nome: 'Daniel Peixoto' }, { nome: 'Dornelles' }, { nome: 'S4Tan' }, { nome: 'Frimes' },
  { nome: 'Copacabana Club' }, { nome: 'Pearls Negras' },
  { nome: 'Alyssa Edwards', de: 'EUA' }, { nome: 'Latrice Royale', de: 'EUA' }, { nome: 'Jujubee', de: 'EUA' },
  { nome: 'Coco Montrese', de: 'EUA' }, { nome: 'April Carrión', de: 'Porto Rico' },
];
