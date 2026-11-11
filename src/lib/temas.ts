// Sistema de cores do site.
//
// Um tema são três cores: fundo, texto e destaque. Cada trecho de página
// declara o seu, e a página troca de cor conforme a pessoa rola.
//
// De onde vem o tema de cada coisa:
// 1. Eventos: das cores da capa (quando Shotgun e Sympla estiverem ligados).
// 2. Pessoas e projetos: das cores da foto ou capa de cada um.
// 3. Sem imagem: um dos pares dos avatares da marca, listados abaixo.
//
// Enquanto as imagens são de marcação, tudo usa a opção 3.

export interface Tema {
  fundo: string;
  texto: string;
  destaque: string;
}

// Pares tirados do arquivo de avatares. Só entram os que têm contraste
// suficiente para texto (4,5:1 ou mais entre fundo e texto).
export const TEMAS_DA_MARCA: Tema[] = [
  { fundo: '#711a40', texto: '#ffa500', destaque: '#f55275' },
  { fundo: '#ffa500', texto: '#711a40', destaque: '#0c032c' },
  { fundo: '#0c032c', texto: '#ff00ff', destaque: '#1e90ff' },
  { fundo: '#ffff00', texto: '#b63339', destaque: '#711a40' },
  { fundo: '#fcf6e4', texto: '#19287f', destaque: '#f1ac0d' },
  { fundo: '#1b35cf', texto: '#fffffd', destaque: '#78dbfc' },
  { fundo: '#6c0d0b', texto: '#87ceeb', destaque: '#ffa500' },
  { fundo: '#2f1459', texto: '#ee82ee', destaque: '#edf12e' },
  { fundo: '#ee82ee', texto: '#2f1459', destaque: '#680f5a' },
  { fundo: '#680f5a', texto: '#ffd700', destaque: '#f170ba' },
  { fundo: '#ff4500', texto: '#17271c', destaque: '#fffdee' },
  { fundo: '#008080', texto: '#f7ffe9', destaque: '#e8e385' },
];

// Escolhe sempre o mesmo tema para o mesmo identificador,
// para a cor de um evento ou projeto não mudar a cada publicação.
export function temaPara(id: string): Tema {
  let soma = 0;
  for (const letra of id) soma = (soma * 31 + letra.charCodeAt(0)) >>> 0;
  return TEMAS_DA_MARCA[soma % TEMAS_DA_MARCA.length];
}

// Mesmo tema com fundo e texto trocados, para alternar dentro da mesma paleta.
export function inverter(tema: Tema): Tema {
  return { fundo: tema.texto, texto: tema.fundo, destaque: tema.destaque };
}

// Texto do atributo data-tema que o script da página lê.
export function atributo(tema: Tema): string {
  return `${tema.fundo}|${tema.texto}|${tema.destaque}`;
}
