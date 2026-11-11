// Sistema de cores do site.
//
// Um tema são três cores: fundo, texto e destaque.
//
// Regras:
// 1. Eventos sempre usam as cores tiradas da própria capa (ver paleta.ts).
// 2. Pessoas e projetos usarão as cores da foto ou capa de cada um.
// 3. Todo o resto usa um dos temas do site, listados abaixo, e muda pouco:
//    uma página sorteia um tema por visita e fica nele.

export interface Tema {
  fundo: string;
  texto: string;
  destaque: string;
}

// Temas do site. Partem das cores dos avatares da marca, mas foram montados
// para leitura em tela: fundos profundos, texto claro e suave, e a cor viva
// dos avatares guardada para o destaque. Todos passam de 7:1 entre fundo e texto.
export const TEMAS_DO_SITE: Tema[] = [
  { fundo: '#5a1235', texto: '#ffe9c9', destaque: '#ffa500' }, // vinho com laranja
  { fundo: '#0e0730', texto: '#efe6ff', destaque: '#ff3df2' }, // noite com magenta
  { fundo: '#14205e', texto: '#fcf6e4', destaque: '#78dbfc' }, // marinho com céu
  { fundo: '#06371f', texto: '#ffe6f2', destaque: '#f170ba' }, // floresta com rosa
  { fundo: '#2a1050', texto: '#f6e9ff', destaque: '#edf12e' }, // berinjela com limão
  { fundo: '#05454a', texto: '#f7ffe9', destaque: '#e8e385' }, // petróleo com palha
  { fundo: '#1b1b1b', texto: '#fffdee', destaque: '#ff4500' }, // tinta com laranja vivo
  { fundo: '#fcf6e4', texto: '#19287f', destaque: '#f55275' }, // creme com marinho
  { fundo: '#5c0c0a', texto: '#e3f4fb', destaque: '#ffd700' }, // vinho escuro com ouro
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
