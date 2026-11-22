// Lista do histórico para a guarda da produção (scripts/guarda-producao.mjs).
//
// Para cada evento de src/data/arquivo.json: o id, a data e uma marca do conteúdo (hash do
// evento com as chaves em ordem, então a ordem dos campos não conta). Mais a lista das capas de
// public/arquivo/. O /estado.json publicado leva esta lista (src/pages/estado.json.ts), e o build
// seguinte compara a dele com a que está no ar. Mesma régua do confere:arquivo, sem depender do git.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const ordena = (valor) => {
  if (Array.isArray(valor)) return valor.map(ordena);
  if (valor && typeof valor === 'object') return Object.fromEntries(Object.keys(valor).sort().map((k) => [k, ordena(valor[k])]));
  return valor;
};

/** Marca curta do conteúdo de um evento. */
export const marcaDoEvento = (evento) => createHash('sha256').update(JSON.stringify(ordena(evento))).digest('hex').slice(0, 16);

/**
 * @returns {{ eventos: { id: string, data: string, marca: string }[], capas: string[] }}
 */
export function listaDoHistorico(raiz = '.') {
  const arquivo = JSON.parse(readFileSync(`${raiz}/src/data/arquivo.json`, 'utf8'));
  const pasta = `${raiz}/public/arquivo`;
  return {
    eventos: arquivo.map((e) => ({ id: e.id, data: e.data, marca: marcaDoEvento(e) })),
    capas: existsSync(pasta) ? readdirSync(pasta).filter((f) => !f.startsWith('.')).sort() : [],
  };
}
