// Sistema de cores do site.
//
// Um tema são três cores: fundo, texto e destaque.
//
// Regras:
// 1. Eventos sempre usam as cores tiradas da própria capa (ver paleta.ts).
// 2. Pessoas e projetos usarão as cores da foto ou capa de cada um.
// 3. Todo o resto usa um dos temas do site, listados abaixo. Cada página
//    sorteia o seu ao abrir (nunca o mesmo da página anterior) e fica nele
//    até o fim: a variedade é entre páginas, não dentro de uma página.

export interface Tema {
  fundo: string;
  texto: string;
  destaque: string;
}

// Temas do site. Partem da lógica dos avatares da marca (duas cores fortes que
// se enfrentam), mas foram montados para leitura em tela e vão além das
// combinações originais. Há fundos escuros, claros e de cor viva.
// Todos passam de 4,5:1 entre fundo e texto, e de 3:1 entre fundo e destaque.
export const TEMAS_DO_SITE: Tema[] = [
  { fundo: '#5a1235', texto: '#ffe9c9', destaque: '#ffa500' }, // vinho com laranja
  { fundo: '#0e0730', texto: '#efe6ff', destaque: '#ff3df2' }, // noite com magenta
  { fundo: '#14205e', texto: '#fcf6e4', destaque: '#78dbfc' }, // marinho com céu
  { fundo: '#06371f', texto: '#ffe6f2', destaque: '#f170ba' }, // floresta com rosa
  { fundo: '#2a1050', texto: '#f6e9ff', destaque: '#edf12e' }, // berinjela com limão
  { fundo: '#05454a', texto: '#f7ffe9', destaque: '#e8e385' }, // petróleo com palha
  { fundo: '#1b1b1b', texto: '#fffdee', destaque: '#ff4500' }, // tinta com laranja vivo
  { fundo: '#fcf6e4', texto: '#19287f', destaque: '#e8366a' }, // creme com marinho
  { fundo: '#5c0c0a', texto: '#e3f4fb', destaque: '#ffd700' }, // vinho escuro com ouro
  { fundo: '#ffe14a', texto: '#3a1247', destaque: '#c81e8a' }, // amarelo com uva
  { fundo: '#ffc4dd', texto: '#4a0f2e', destaque: '#d1002c' }, // rosa com vinho
  { fundo: '#ff8a1f', texto: '#2a0b3d', destaque: '#6b0f3a' }, // laranja com berinjela
  { fundo: '#bfe6ff', texto: '#10245c', destaque: '#e23a63' }, // céu com marinho
  { fundo: '#c9f2d0', texto: '#0c3b2e', destaque: '#7a2bd9' }, // menta com floresta
  { fundo: '#e3d2ff', texto: '#2a1050', destaque: '#c2340a' }, // lilás com berinjela
  { fundo: '#b80f7f', texto: '#fff0f8', destaque: '#ffe14a' }, // magenta com amarelo
  { fundo: '#1b35cf', texto: '#fffffd', destaque: '#ffd84a' }, // azul com ouro
  { fundo: '#b3111d', texto: '#fff1e0', destaque: '#ffd166' }, // vermelho com creme
  { fundo: '#0a664a', texto: '#f3ffe6', destaque: '#ffd84a' }, // verde com ouro
  { fundo: '#3b1f12', texto: '#ffe8cc', destaque: '#ff7a45' }, // chocolate com coral
  { fundo: '#f1ead9', texto: '#1b1b1b', destaque: '#e0480f' }, // areia com tinta
];

// Escolhe sempre o mesmo tema para o mesmo identificador,
// para a cor de um projeto ou pessoa não mudar a cada publicação.
export function temaPara(id: string): Tema {
  let soma = 0;
  for (const letra of id) soma = (soma * 31 + letra.charCodeAt(0)) >>> 0;
  return TEMAS_DO_SITE[soma % TEMAS_DO_SITE.length];
}

// Texto do atributo data-tema que o script da página lê.
export function atributo(tema: Tema): string {
  return `${tema.fundo}|${tema.texto}|${tema.destaque}`;
}
