// Guarda do histórico: o que já está arquivado na main não pode sumir nem mudar por acidente.
//
// Compara o arquivo de eventos passados desta cópia (src/data/arquivo.json) com o que está
// publicado na main. Passa se a cópia só ACRESCENTA eventos. Falha se algum evento da main
// estiver faltando ou diferente, ou se alguma capa de public/arquivo tiver sido apagada.
//
// Uso:  npm run confere:arquivo
// Mudança pedida de propósito (corrigir um nome, trocar uma capa, tirar um evento), duas formas
// de declarar; em ambas as diferenças são mostradas, mas a conferência não falha:
//   - na máquina:  ARQUIVO_EDITADO=1 npm run confere:arquivo
//   - no GitHub:   a marca [arquivo-editado] na mensagem do commit, dizendo o que mudou e quem
//                  pediu. É ela que vale nas conferências automáticas.
//
// ARQUIVO_BASE=<commit> troca a referência da comparação. O alarme da main usa isso para
// comparar cada push com o estado anterior da própria main (.github/workflows/alarme-arquivo.yml).
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });

const MARCA = '[arquivo-editado]';
const noGitHub = process.env.CI === 'true';

let base = process.env.ARQUIVO_BASE || 'origin/main';
if (!process.env.ARQUIVO_BASE) {
  try { git('fetch', '--quiet', 'origin', 'main'); base = 'FETCH_HEAD'; } catch { /* sem rede: usa o origin/main que já existe aqui */ }
}

let daMain;
try { daMain = JSON.parse(git('show', `${base}:src/data/arquivo.json`)); }
catch {
  // Na máquina, sem rede, não dá para conferir e o trabalho segue. No GitHub, não conferir é falha.
  console.log(`Não consegui ler o arquivo de referência (${base}).${noGitHub ? '' : ' Conferência pulada.'}`);
  process.exit(noGitHub ? 1 : 0);
}

const daqui = new Map(JSON.parse(readFileSync('src/data/arquivo.json', 'utf8')).map((e) => [e.id, e]));
const problemas = [];
for (const antigo of daMain) {
  const atual = daqui.get(antigo.id);
  if (!atual) { problemas.push(`faltando: ${antigo.id} (${antigo.data?.slice(0, 10)}) ${antigo.nome}`); continue; }
  const campos = [...new Set([...Object.keys(antigo), ...Object.keys(atual)])].filter((c) => JSON.stringify(antigo[c]) !== JSON.stringify(atual[c]));
  if (campos.length > 0) problemas.push(`alterado: ${antigo.id} ${antigo.nome} (campos: ${campos.join(', ')})`);
}
const capas = git('ls-tree', '-r', '--name-only', base, 'public/arquivo/').split('\n').filter(Boolean);
for (const capa of capas) if (!existsSync(capa)) problemas.push(`capa apagada: ${capa}`);

const novos = daqui.size - daMain.filter((e) => daqui.has(e.id)).length;
if (problemas.length === 0) {
  console.log(`Histórico íntegro: ${daMain.length} eventos da main preservados${novos > 0 ? `, ${novos} novo(s) aqui` : ''}.`);
  process.exit(0);
}
console.log(`O histórico desta cópia difere do que está na main em ${problemas.length} ponto(s):`);
for (const p of problemas.slice(0, 40)) console.log('  - ' + p);
if (problemas.length > 40) console.log(`  ... e mais ${problemas.length - 40}.`);
if (process.env.ARQUIVO_EDITADO === '1') { console.log('ARQUIVO_EDITADO=1: mudança declarada como intencional. Seguindo.'); process.exit(0); }
let declarados = [];
try { declarados = git('log', '--format=%h %s%n%b%x00', `${base}..HEAD`).split('\0').map((c) => c.trim()).filter((c) => c.includes(MARCA)); } catch { /* sem histórico entre a referência e aqui */ }
if (declarados.length > 0) {
  console.log(`Mudança declarada como intencional com ${MARCA}:`);
  for (const c of declarados) console.log('  - ' + c.split('\n')[0]);
  process.exit(0);
}
console.log('\nSe faltam eventos, esta branch está atrás da main: traga a main para cá (git merge origin/main).');
console.log(`Se a mudança foi pedida de propósito, escreva ${MARCA} na mensagem do commit, com o que mudou e quem pediu.`);
process.exit(1);
