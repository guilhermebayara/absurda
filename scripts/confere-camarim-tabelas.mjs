// A posição importa: uma razão correta na coluna ou na paleta errada também é erro.
import { coresDoTema, dois, medidasDoTema, nivelTexto, paletas, USOS } from './cores-temas.mjs';

const texto = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const celulas = (html, tag) => [...html.matchAll(new RegExp(`<${tag}\\b[^>]* data-par="([^"]+)"[^>]*>([\\s\\S]*?)</${tag}>`, 'g'))]
  .map(([, par, valor]) => [par, texto(valor)]);

/** @param {string} html */
export function confereTabelas(html) {
  const problemas = [];
  const tabelas = [...html.matchAll(/<table\b[^>]* data-paleta="([^"]+)"[^>]*>([\s\S]*?)<\/table>/g)];
  if (tabelas.length !== paletas.length) problemas.push('Quantidade incorreta de tabelas de paleta.');
  for (const { id, temas } of paletas) {
    const tabela = tabelas.find(([, nome]) => nome === id)?.[2] ?? '';
    const linhas = [...tabela.matchAll(/<tr\b[^>]* data-camarim-tema="([^"]+)"[^>]*>([\s\S]*?)<\/tr>/g)];
    if (linhas.length !== temas.length) problemas.push(`Quantidade incorreta de temas em ${id}.`);
    const colunas = medidasDoTema(coresDoTema(temas[0])).map(({ cor, superficie, minimo }) => [
      cor + '/' + superficie,
      `${USOS[cor + '/' + superficie]} --${cor} sobre --${superficie} ${minimo === 3 ? 'Enfeite · 3:1' : 'Leitura · 4,5:1'}`,
    ]);
    if (JSON.stringify(celulas(tabela, 'th')) !== JSON.stringify(colunas)) problemas.push(`Cabeçalho incorreto em ${id}.`);
    for (const [i, tema] of temas.entries()) {
      const linha = linhas[i];
      if (linha?.[1] !== tema.id || !texto(linha[2].split('</th>')[0]).endsWith(tema.nome)) {
        problemas.push(`Linha ausente ou incorreta para ${tema.id}.`);
        continue;
      }
      const esperadas = medidasDoTema(coresDoTema(tema)).map(({ cor, superficie, razao, minimo }) => [
        cor + '/' + superficie,
        `${dois(razao)}:1 ${nivelTexto(razao)}` + (minimo === 3 ? ` Enfeite · ${razao >= 3 ? 'AA' : 'Não passa'}` : ''),
      ]);
      const grupos = [...linha[2].matchAll(/<td\b[^>]* data-cumpre="(sim|nao)"[^>]*>/g)].map(m => m[1]);
      const esperados = medidasDoTema(coresDoTema(tema)).map(({ razao, minimo }) => razao >= minimo ? 'sim' : 'nao');
      if (JSON.stringify(grupos) !== JSON.stringify(esperados)) problemas.push(`Uso classificado no grupo errado para ${tema.id}.`);
      if (JSON.stringify(celulas(linha[2], 'td')) !== JSON.stringify(esperadas)) problemas.push(`Divergência nos pares de ${tema.id}.`);
    }
  }
  return problemas;
}
