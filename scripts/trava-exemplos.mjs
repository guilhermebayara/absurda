// Trava dos eventos de exemplo, no próprio build (decisão do Gui, 19 nov 2026).
// Roda no fim de "npm run build". Na main, na homologação, ou sem a variável de branch da Cloudflare
// (WORKERS_CI_BRANCH ou CF_PAGES_BRANCH), apaga dist/exemplos/ (as capas de public/exemplos/ vão
// junto no build e não têm uso ali) e falha se o site montado tiver algum evento de exemplo.
// Só a prévia de uma branch de teste (variável presente e fora da lista) mantém os exemplos.
// Nada muda no painel da Cloudflare: o build já é o comando de lá.
import { readFileSync, readdirSync, statSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const SEM_EXEMPLO = ['main', 'design', 'homologa']; // mesma lista de BRANCHES_SEM_EXEMPLO, em src/lib/eventos.ts
const branch = (process.env.WORKERS_CI_BRANCH || process.env.CF_PAGES_BRANCH || '').trim();
const travado = !branch || SEM_EXEMPLO.includes(branch);

if (!existsSync('dist')) { console.log('Trava dos exemplos: não achei a pasta dist.'); process.exit(1); }
if (!travado) { console.log(`Trava dos exemplos: prévia de teste "${branch}", exemplos liberados.`); process.exit(0); }

if (existsSync('dist/exemplos')) { rmSync('dist/exemplos', { recursive: true, force: true }); console.log('Trava dos exemplos: dist/exemplos apagada.'); }

const ids = JSON.parse(readFileSync('src/data/eventos-exemplo.json', 'utf8')).map((e) => e.id);
const achados = [];
const anda = (pasta) => {
  for (const nome of readdirSync(pasta)) {
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) { anda(caminho); continue; }
    if (!/\.(html|json|xml|txt|js|css)$/.test(nome)) continue;
    const texto = readFileSync(caminho, 'utf8');
    if (ids.some((id) => texto.includes(id)) || /\(exemplo\)/.test(texto) || texto.includes('/exemplos/')) achados.push(caminho);
  }
};
anda('dist');

if (achados.length > 0) {
  console.error(`Trava dos exemplos: o build de "${branch || 'sem variável de branch'}" tem evento de exemplo em:`);
  for (const a of achados) console.error(`  - ${a}`);
  process.exit(1);
}
console.log(`Trava dos exemplos: "${branch || 'sem variável de branch'}" sem nenhum exemplo.`);
