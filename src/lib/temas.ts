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

// Paleta fechada do trecho de posicionamento político (página Sobre).
// Enquanto esse trecho está na tela, o site só pode usar um destes temas, nunca o
// sorteado nem cores de capa. A regra é dos produtores:
// - vermelho é a cor do posicionamento de esquerda da @bsurda (PT, PSOL);
// - verde com amarelo, e azul com amarelo, não entram: ainda carregam a ligação
//   com a extrema direita;
// - verde não entra nem sozinho, para nunca formar o par com um amarelo vizinho.
// Amarelo só aparece como detalhe sobre vermelho ou roxo.
// Ao incluir um tema novo aqui, confira essas três regras antes.
export const TEMAS_DE_POSICAO: Tema[] = [
  { fundo: '#c4101f', texto: '#fff6ea', destaque: '#ffd23f' }, // vermelho com estrela amarela
  { fundo: '#5c0c0a', texto: '#ffeede', destaque: '#ff5a4d' }, // vinho com vermelho vivo
  { fundo: '#fff3e2', texto: '#3a0a0a', destaque: '#cf0f1e' }, // creme com vermelho
  { fundo: '#431670', texto: '#fff4e0', destaque: '#ffcb05' }, // roxo com amarelo
  { fundo: '#161012', texto: '#fff1e6', destaque: '#ff4338' }, // preto com vermelho
];

// Paletas fechadas de projeto (pedido do Gui). A cor de um projeto sai da foto de capa, mas
// três projetos têm um clima que a foto nem sempre entrega, e por isso só usam os temas daqui.
// A página e o cartaz do projeto sorteiam um tema da paleta a cada visita.
// Seguem a lógica de tons do site (fundo profundo, pastel ou vivo, com um destaque que o
// enfrenta): nenhuma cor aqui deve destoar do resto. A regra de não juntar amarelo com verde ou
// azul vale só para o trecho de posicionamento; aqui essas combinações podem aparecer.
//
// Tibum: água, sol, piscina. Sempre solar, nunca página escura.
export const TEMAS_DO_TIBUM: Tema[] = [
  { fundo: '#bfe6ff', texto: '#10245c', destaque: '#d1002c' }, // piscina com boia
  { fundo: '#ffe14a', texto: '#10245c', destaque: '#0a6fb8' }, // sol com piscina
  { fundo: '#ffb24a', texto: '#3a0a2a', destaque: '#7a1fa2' }, // fim de tarde
  { fundo: '#ffc4dd', texto: '#10245c', destaque: '#0a6fb8' }, // boia rosa com piscina
];
// Trio: carnaval de rua, de dia.
export const TEMAS_DO_TRIO: Tema[] = [
  { fundo: '#ff8fc0', texto: '#2b0638', destaque: '#5b12c9' }, // rosa com roxo
  { fundo: '#ffcc2f', texto: '#4b0f5c', destaque: '#d1006f' }, // amarelo com magenta
  { fundo: '#6d28e0', texto: '#fff4e0', destaque: '#ffd23f' }, // roxo com amarelo
  { fundo: '#ff9a5c', texto: '#2b0638', destaque: '#5b12c9' }, // laranja com roxo
  { fundo: '#7be8c8', texto: '#2a1050', destaque: '#c81e8a' }, // verde-água com uva
];
// Parada: orgulho LGBTQIA+. Uma cor da bandeira por vez, e não o arco-íris inteiro; o
// arco-íris entra só como detalhe (campo "arcoiris" do projeto). Os tons vêm das listras das
// marcas da Parada (a de 2022 traz as cores da bandeira do progresso, com azul e rosa trans,
// preto e marrom), passados para a lógica de tons do site.
export const TEMAS_DA_PARADA: Tema[] = [
  { fundo: '#9be0fa', texto: '#1a1147', destaque: '#d1006f' }, // azul trans com magenta
  { fundo: '#f7b3c8', texto: '#3a0a3f', destaque: '#5b12c9' }, // rosa trans com roxo
  { fundo: '#f6c544', texto: '#3a0a3f', destaque: '#c40d5e' }, // amarelo com magenta
  { fundo: '#7be8c8', texto: '#2a1050', destaque: '#c81e55' }, // verde-água com rosa
  { fundo: '#ff9a7a', texto: '#3a0a2a', destaque: '#5b12c9' }, // coral com roxo
  { fundo: '#3d1480', texto: '#f6e9ff', destaque: '#f6c544' }, // roxo com amarelo
  { fundo: '#123a7a', texto: '#fcf6e4', destaque: '#ff8a66' }, // azul com coral
  { fundo: '#8a0f45', texto: '#ffe9f1', destaque: '#ffc94d' }, // magenta com amarelo
  { fundo: '#2b1a08', texto: '#ffe9c9', destaque: '#f4317f' }, // marrom com rosa
];
export const PALETAS_DE_PROJETO: Record<string, Tema[]> = { tibum: TEMAS_DO_TIBUM, bloco: TEMAS_DO_TRIO, parada: TEMAS_DA_PARADA };

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

// Temas do site que combinam com um conjunto de tons (matizes em graus, de uma foto).
// Vale o fundo do tema, quando ele tem cor, ou o destaque (com uma pequena desvantagem, para o
// fundo ganhar em caso de empate). Um tom sem tema próximo o bastante fica sem par.
function matiz(hex: string): { h: number; s: number } {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (d === 0) return { h: 0, s: 0 };
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s: d / (1 - Math.abs(max + min - 1) || 1) };
}
const afastamento = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));
function proximidade(tema: Tema, tom: number): number {
  const f = matiz(tema.fundo), d = matiz(tema.destaque);
  return Math.min(f.s >= 0.3 ? afastamento(f.h, tom) : 999, afastamento(d.h, tom) + 20);
}
export function temasDoSitePara(tons: number[]): Tema[] {
  const escolhidos: Tema[] = [];
  for (const tom of tons) {
    const melhor = TEMAS_DO_SITE.filter((t) => !escolhidos.includes(t)).sort((a, b) => proximidade(a, tom) - proximidade(b, tom))[0];
    if (melhor && proximidade(melhor, tom) <= 50) escolhidos.push(melhor);
  }
  return escolhidos;
}
