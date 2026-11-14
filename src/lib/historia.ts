// Números e listas da história da @bsurda, usados na página Sobre e na Home.
// Mudou aqui, muda nos dois lugares.
import { getEventos } from './eventos';

export const idade = new Date().getFullYear() - 2009;

// Todos os endereços de Belo Horizonte por onde a festa passou, montados como o line-up
// de um festival: primeiro os grandes nomes, depois os de meio de cartaz, depois todos os outros.
// Vem do arquivo de eventos, com nomes repetidos unificados. A ordem dentro de cada faixa é de época.
export const lineup = [
  ['Mineirão', 'Up e.music', 'Mercado das Borboletas', 'Mira', 'Granfinos', 'Casa Sapucaí'],
  ['Velvet Club', 'Mary in Hell', 'Matriz', 'CentoeQuatro', 'GIS', 'Deputamadre', 'O Mercado', 'Viaduto Santa Tereza',
    'Praça da Estação', 'Parque das Mangabeiras', 'Ita Park', 'Gruta', 'Avenida Afonso Pena', 'A Autêntica', 'Praça Sete', 'Funarte MG', 'Clube Labareda'],
  ['On Board', 'Quina Galeria', 'Emme Lounge', 'União Israelita', 'Anda', 'Hotel Diamante', 'Secreto', 'Roxy Club', 'Josefine Club',
    'Moss Club', 'Skorpius', 'Royalty Club', 'Studio Bar', 'Soleá', 'Rua Guaicurus', 'Necup', 'A Fábrica', 'Factory', 'A Central',
    'Avenida dos Andradas', 'Fábrica Criativa', 'Galpão La Trupe', 'QG Rooftop', 'Urbana', 'Espaço Even', 'LOL', 'Rock Content',
    'Casa Híbrido', 'Jhon Jhon Club', 'Espettos', 'Pampulha', 'Rua da Bahia', 'Dduck', 'Code Bar', 'Yanã Bar', 'Villa Paraty',
    'Catavento Cultural', 'Teatro da Cidade', 'Mamão com Açúcar', 'Jackie O', 'Church', 'Prime Hall', 'Sítio Via Lazer', 'Lab', '80Bar',
    'Zona', 'Distrital', 'Lavos', 'Galpão do Folias', 'Irregular', 'Casa Rosa do Bonfim', 'Andaluz Pub', 'Espaço Sapucaí',
    'Galpão 54', 'Espaço Loc', 'Espaço Y', 'Major Lock'],
];
export const totalDeLugares = lineup.flat().length;

export const cidades = ['Vitória', 'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'São Luís', 'Maringá', 'Londrina', 'Sete Lagoas', 'Juiz de Fora', 'Montes Claros', 'Ouro Preto', 'Divinópolis', 'Viçosa'];

// Quantos eventos a festa já fez. Regra do Gui: nada de conta exata. O número sai da Agenda,
// arredondado para baixo de 50 em 50 (400, 450, 500...), com o "+" na frente, e nunca abaixo
// de 400: ainda faltam eventos antigos no site, e a folga cobre essas lacunas. Sobe sozinho
// quando a contagem passar da próxima cinquentena.
const PISO_DE_EVENTOS = 400;
const { passados } = await getEventos();
export const eventosArredondados = Math.max(PISO_DE_EVENTOS, Math.floor(passados.length / 50) * 50);

// Números da abertura. "mais" põe um "+" na frente.
export const numeros = [
  { n: idade, rotulo: 'anos de festa' },
  { n: eventosArredondados, mais: true, rotulo: 'eventos' },
  { n: totalDeLugares, mais: false, rotulo: 'endereços em BH', nota: 'e contando' },
  // Conta as cidades da lista acima, mais Belo Horizonte (regra do Gui: vale o que está listado).
  { n: cidades.length + 1, rotulo: 'cidades' },
];

// Quem a gente trouxe. "de" e "bandeira" marcam atração de fora do Brasil.
export const palco = [
  { nome: 'Pabllo Vittar' }, { nome: 'Jão' }, { nome: 'Gloria Groove' }, { nome: 'Karol Conká' }, { nome: 'Elke Maravilha' },
  { nome: 'Gretchen' }, { nome: 'Banda Uó' }, { nome: 'Candy Mel' }, { nome: 'Mateus Carrilho' }, { nome: 'Bonde do Rolê' }, { nome: 'Deize Tigrona' }, { nome: 'Rico Dalasam' },
  { nome: 'Jaloo' }, { nome: 'Potyguara Bardo' }, { nome: 'Tiê' }, { nome: 'Kaya Conky' }, { nome: 'Pepita' }, { nome: 'Aretuza Lovi' },
  { nome: 'Penelopy Jean' }, { nome: 'Daniel Peixoto' }, { nome: 'Dornelles' }, { nome: 'S4Tan' }, { nome: 'Frimes' },
  { nome: 'Copacabana Club' }, { nome: 'Pearls Negras' },
  { nome: 'Manu Gavassi' }, { nome: 'MC Carol' }, { nome: 'Kika Boom' },
  { nome: 'Matheus Morais' }, { nome: 'Yuri Frainer' }, { nome: 'Daft Pobre' }, { nome: 'Murilo Caldas' },
  { nome: 'Jade Baraldo' }, { nome: 'Não Recomendados' }, { nome: 'Boss in Drama' }, { nome: 'Caio Caprioli' },
  { nome: 'Alyssa Edwards', de: 'EUA', bandeira: '🇺🇸' }, { nome: 'Latrice Royale', de: 'EUA', bandeira: '🇺🇸' }, { nome: 'Jujubee', de: 'EUA', bandeira: '🇺🇸' },
  { nome: 'Coco Montrese', de: 'EUA', bandeira: '🇺🇸' }, { nome: 'April Carrión', de: 'Porto Rico', bandeira: '🇵🇷' },
];
