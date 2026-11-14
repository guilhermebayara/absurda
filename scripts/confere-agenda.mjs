// Conferência da Agenda: depois do build, todo evento guardado no arquivo tem de aparecer na
// Agenda montada.
//
// Uso:  npm run build && npm run confere:agenda
//
// Nasceu de um achado (14 nov 2026): eventos escritos à mão com "só o dia" tiravam da Agenda
// outro evento do mesmo dia, e a @bsurda Hold My Hand (25/06/2022) sumiu sem que nenhuma
// conferência notasse. O arquivo estava inteiro; o que falhou foi a montagem da página.
//
// Ficam de fora, de propósito: o que está em FORA_DA_AGENDA (src/lib/eventos.ts) e o que foi
// anunciado como adiado. Cada evento é procurado pelo link, pela capa guardada ou pelo nome.
import { readFileSync, existsSync } from 'node:fs';

const PAGINA = 'dist/agenda.html';
if (!existsSync(PAGINA)) { console.log('Não achei dist/agenda.html. Rode "npm run build" antes.'); process.exit(1); }

const html = readFileSync(PAGINA, 'utf8');
const arquivo = JSON.parse(readFileSync('src/data/arquivo.json', 'utf8'));
const codigo = readFileSync('src/lib/eventos.ts', 'utf8');
const lista = codigo.match(/FORA_DA_AGENDA[^=]*=\s*\[([^\]]*)\]/);
if (!lista) { console.log('Não achei a lista FORA_DA_AGENDA em src/lib/eventos.ts.'); process.exit(1); }
const fora = new Set([...lista[1].matchAll(/'([^']+)'/g)].map((m) => m[1]));

const limpa = (url) => url.split('?')[0].replace(/\/$/, '');
const escapa = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const faltando = [];
let conferidos = 0;
for (const e of arquivo) {
  if (fora.has(e.id) || /\badiad[oa]\b/i.test(e.nome)) continue;
  conferidos += 1;
  // O nome pode ter sido limpo para exibição, então valem o link, a capa guardada ou o nome.
  const aparece = (e.url && html.includes(limpa(e.url))) || html.includes(`/arquivo/${e.id}.`) || html.includes(`/arquivo/${e.id}-p.`) || html.includes(escapa(e.nome.trim()));
  if (!aparece) faltando.push(e);
}

if (faltando.length > 0) {
  console.log(`Agenda incompleta: ${faltando.length} evento(s) do arquivo não aparecem na página.`);
  for (const e of faltando) console.log(`  ${e.data.slice(0, 10)}  ${e.id}  ${e.nome.trim()}`);
  console.log('O arquivo não foi alterado: o evento se perdeu na montagem (ver semRepetidos em src/lib/eventos.ts).');
  process.exit(1);
}
console.log(`Agenda em ordem: os ${conferidos} eventos do arquivo aparecem na página.`);
