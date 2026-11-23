// Conferência dos eventos de exemplo: depois do build, a main e a homologação nunca podem ter
// evento de exemplo (src/data/eventos-exemplo.json), e o arquivo do histórico nunca os guarda.
// Confere também a chave do estado sem evento (branch "tst-vazio..."), pelo dist/estado.json.
//
// Uso:  npm run build && npm run confere:exemplos
//       npm run confere:exemplos -- --producao   (trata o build como main, seja qual for a branch)
//
// Nasceu do pedido do Gui (18 nov 2026): as prévias de teste mostram eventos de exemplo para
// conferir Home e Agenda, e isso não pode vazar para o site no ar. A branch do build vem de
// WORKERS_CI_BRANCH (ou CF_PAGES_BRANCH), as variáveis da Cloudflare. Sem nenhuma das duas, o
// build também não pode ter exemplo (no GitHub e na máquina a variável não existe).
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const SEM_EXEMPLO = ['main', 'homologa'];
const producao = process.argv.includes('--producao');
const variavel = (process.env.WORKERS_CI_BRANCH || process.env.CF_PAGES_BRANCH || '').trim();

if (!existsSync('dist')) { console.log('Não achei a pasta dist. Rode "npm run build" antes.'); process.exit(1); }

const exemplos = JSON.parse(readFileSync('src/data/eventos-exemplo.json', 'utf8'));
const ids = exemplos.map((e) => e.id);
const problemas = [];

// 1. O histórico guardado nunca tem exemplo.
const arquivo = readFileSync('src/data/arquivo.json', 'utf8');
for (const id of ids) if (arquivo.includes(`"${id}"`)) problemas.push(`o arquivo do histórico (src/data/arquivo.json) guarda o exemplo ${id}`);
const marca = /\(exemplo\)/;
if (marca.test(arquivo)) problemas.push('o arquivo do histórico tem um nome com "(exemplo)"');
if (existsSync('public/arquivo') && readdirSync('public/arquivo').some((f) => ids.some((id) => f.startsWith(id)))) problemas.push('public/arquivo tem capa de exemplo');

// 2. O que o build gerou.
const paginas = [];
const anda = (pasta) => {
  for (const nome of readdirSync(pasta)) {
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) { if (nome !== 'exemplos') anda(caminho); continue; }
    if (/\.(html|json)$/.test(nome)) paginas.push(caminho);
  }
};
anda('dist');
const achados = new Set();
for (const p of paginas) {
  const texto = readFileSync(p, 'utf8');
  if (ids.some((id) => texto.includes(id)) || marca.test(texto) || texto.includes('/exemplos/capa-')) achados.add(p);
}

let ramo = variavel;
if (!ramo) {
  try { ramo = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || execSync('git branch --show-current', { encoding: 'utf8' }).trim(); } catch { ramo = ''; }
}
const naProducao = producao || SEM_EXEMPLO.includes(variavel) || (!variavel && SEM_EXEMPLO.includes(ramo));
const semVariavel = !variavel;

if (achados.size > 0) {
  if (naProducao) problemas.push(`o build de "${producao ? 'produção' : ramo}" tem evento de exemplo em: ${[...achados].join(', ')}`);
  else if (semVariavel) problemas.push(`o build não recebeu WORKERS_CI_BRANCH nem CF_PAGES_BRANCH e mesmo assim tem evento de exemplo em: ${[...achados].join(', ')}`);
}

// 3. A chave do estado sem evento (branch "tst-vazio...") nunca liga na main, na homologação nem
// sem a variável de branch, e liga sempre que a branch da variável começa com "tst-vazio".
let vazio = null;
if (existsSync('dist/estado.json')) {
  try { vazio = JSON.parse(readFileSync('dist/estado.json', 'utf8')).vazio ?? null; } catch { vazio = null; }
}
const vazioLigado = Boolean(vazio && vazio.ligado);
if (vazioLigado && naProducao) problemas.push(`a chave do estado sem evento está ligada no build de "${producao ? 'produção' : ramo}"`);
if (vazioLigado && semVariavel) problemas.push('a chave do estado sem evento está ligada num build sem WORKERS_CI_BRANCH nem CF_PAGES_BRANCH');
if (!vazioLigado && !naProducao && variavel.startsWith('tst-vazio')) problemas.push(`a branch "${variavel}" começa com "tst-vazio" e a chave do estado sem evento não ligou (veja "vazio" em dist/estado.json)`);
if (vazioLigado && !variavel.startsWith('tst-vazio')) problemas.push(`a chave do estado sem evento ligou na branch "${variavel}", que não começa com "tst-vazio"`);

if (problemas.length > 0) {
  console.log('Evento de exemplo no lugar errado:');
  for (const p of problemas) console.log(`  - ${p}`);
  process.exit(1);
}
console.log(`Exemplos em ordem: ${achados.size > 0 ? `aparecem só na prévia de teste "${variavel}"` : 'nenhum evento de exemplo neste build'}; o arquivo do histórico não os guarda.`);
console.log(`Chave do estado sem evento: ${vazioLigado ? `ligada na prévia de teste "${variavel}" (${vazio.tirados} evento(s) tirado(s) dos próximos)` : 'desligada'}.`);
