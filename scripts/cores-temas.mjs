// A mesma conta de Base.astro atende o Camarim e o confere:temas.
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const base = readFileSync('src/layouts/Base.astro', 'utf8');
const trecho = base.match(/\/\/ >>> conta das cores[\s\S]*?\/\/ <<< conta das cores/)?.[0];
if (!trecho) throw new Error('Falta o trecho marcado da conta das cores em Base.astro.');

const escritas = new Map();
/** @type {Record<string, any>} */
const pagina = {
  window: {},
  document: { documentElement: { style: {
    /** @param {string} nome @param {string} valor */
    setProperty: (nome, valor) => escritas.set(nome, valor),
  } } },
};
runInNewContext(trecho, pagina);
if (typeof pagina.window.__derivadas !== 'function') throw new Error('Falta __derivadas na conta das cores.');

const fonte = readFileSync('src/lib/temas.ts', 'utf8');
export const paletas = [...fonte.matchAll(/^export const (TEMAS_\w+): Tema\[\] = \[([\s\S]*?)^\];/gm)]
  .map(([, id, bloco]) => {
    const temas = [...bloco.matchAll(/\{\s*fundo:\s*'(#[\da-f]{3,6})',\s*texto:\s*'(#[\da-f]{3,6})',\s*destaque:\s*'(#[\da-f]{3,6})'\s*\},?[^\S\n]*(?:\/\/\s*([^\n]*))?/gi)]
      .map(([, fundo, texto, destaque, nome], i) => ({ id: `${id}-${i + 1}`, fundo, texto, destaque, nome: nome?.trim() || `${fundo} / ${texto}` }));
    if (!temas.length || temas.length !== (bloco.match(/\bfundo:/g) ?? []).length) throw new Error(`Não consegui ler todos os temas de ${id}.`);
    return { id, temas };
  });
if (!paletas.length) throw new Error('Não consegui ler as paletas de src/lib/temas.ts.');
export const temas = paletas.flatMap((paleta) => paleta.temas);

const pares = [
  ['texto', 'fundo', 4.5],
  ['destaque', 'fundo', 3],
  ['destaque-texto', 'fundo', 4.5],
  ['suave', 'fundo', 4.5],
  ['fundo', 'texto', 4.5],
  ['enfeite', 'texto', 3],
  ['sobre-vivo', 'vivo', 4.5],
  ['vivo-detalhe', 'vivo', 3],
];
const derivadas = ['destaque-texto', 'suave', 'enfeite', 'vivo', 'sobre-vivo', 'vivo-detalhe'];

/** @param {{ fundo: string, texto: string, destaque: string }} tema */
export function coresDoTema({ fundo, texto, destaque }) {
  escritas.clear();
  pagina.window.__derivadas(fundo, texto, destaque);
  /** @type {Record<string, string>} */
  const cores = { fundo, texto, destaque };
  for (const nome of derivadas) {
    const valor = escritas.get('--' + nome);
    if (!valor) throw new Error(`Base.astro não calculou --${nome}.`);
    cores[nome] = '#' + pagina.rgb(valor).map((v) => v.toString(16).padStart(2, '0')).join('');
  }
  return cores;
}

/** @param {Record<string, string>} cores */
export function medidasDoTema(cores) {
  return pares.map(([cor, superficie, minimo]) => {
    const razao = Number(pagina.razao(pagina.rgb(cores[cor]), pagina.rgb(cores[superficie])));
    return { cor: String(cor), superficie: String(superficie), minimo: Number(minimo), razao };
  });
}

/** @param {number} valor */
export const dois = (valor) => valor.toFixed(2).replace('.', ',');

/** @param {number} valor */
export function nivelTexto(valor) {
  if (valor >= 7) return 'AAA';
  if (valor >= 4.5) return 'AA · AAA em texto grande';
  if (valor >= 3) return 'AA só texto grande';
  return 'Não passa';
}
