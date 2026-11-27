// Confere os dados que chegaram ao HTML, inclusive com as gavetas fechadas.
import { coresDoTema, dois, medidasDoTema, nivelTexto, temas } from './cores-temas.mjs';

const esperados = new Map(temas.map((tema) => [
  tema.id,
  new Map(medidasDoTema(coresDoTema(tema)).map(({ cor, superficie, razao, minimo }) => [
    `${cor}/${superficie}`,
    [
      `--${cor} sobre --${superficie}`,
      `${dois(razao)}:1`,
      nivelTexto(razao),
      minimo === 3 ? (razao >= 3 ? 'AA' : 'Não passa') : '·',
      minimo === 3 ? 'Enfeite · 3:1' : 'Leitura · 4,5:1',
    ],
  ])),
]));

/** @param {string} html */
export function confereTabelas(html) {
  const problemas = [];
  const faltam = new Set(esperados.keys());
  for (const [, id, trecho] of html.matchAll(/<details\b[^>]*\sdata-camarim-tema="([^"]+)"[^>]*>([\s\S]*?)<\/details>/g)) {
    const pares = esperados.get(id);
    if (!pares || !faltam.delete(id)) {
      problemas.push(`Tema inesperado ou repetido: ${id}.`);
      continue;
    }
    const faltamPares = new Set(pares.keys());
    for (const [, par, conteudo] of trecho.matchAll(/<tr\b[^>]*\sdata-par="([^"]+)"[^>]*>([\s\S]*?)<\/tr>/g)) {
      const celulas = [...conteudo.matchAll(/<(th|td)\b[^>]*>([\s\S]*?)<\/\1>/g)]
        .map(([, , texto]) => texto.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
      if (!faltamPares.delete(par) || JSON.stringify(celulas) !== JSON.stringify(pares.get(par))) {
        problemas.push(`Divergência em ${id}, par ${par}.`);
      }
    }
    if (faltamPares.size) problemas.push(`Pares ausentes em ${id}: ${[...faltamPares].join(', ')}.`);
  }
  if (faltam.size) problemas.push(`Temas ausentes: ${[...faltam].join(', ')}.`);
  return problemas;
}
