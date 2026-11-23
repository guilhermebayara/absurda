// Auditoria de leveza (Sessão J, 23 nov 2026): builds da Cloudflare e rodadas do GitHub Actions.
// Não entra no build nem no confere-site.yml. Uso: npm run mede:leveza -- builds [dias]
//
// Precisa do "gh" autenticado (lê só dados públicos do repositório: commits, PRs, check suites e
// rodadas do Actions). Nenhuma chave é lida nem impressa.
//
// Builds da Cloudflare: o check run "Workers Builds" chega ao GitHub já concluído (início igual ao
// fim), então a duração sai da check suite do app da Cloudflare (criada no push, atualizada no fim
// do build): inclui a fila. A branch sai do endereço do build (".../previews/<branch>/builds/..." ou
// ".../production/builds/..."). Builds pedidos pelo gancho (robô da agenda) não aparecem no GitHub:
// são contados pelas rodadas do atualiza-agenda.yml, uma por rodada.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const sh = promisify(execFile);
const REPO = 'guilhermebayara/absurda';
const dias = Number(process.argv[2] || 14);
const desde = new Date(Date.now() - dias * 864e5);
const desdeIso = desde.toISOString();

async function api(rota) {
  const { stdout } = await sh('gh', ['api', '--paginate', rota], { maxBuffer: 256 * 1024 * 1024 });
  // --paginate junta páginas; em listas vem um array por página, em objetos um objeto por página.
  const pedacos = stdout.trim().replace(/\]\s*\[/g, ',').replace(/\}\s*\{(?="total_count"|"workflow_runs")/g, '}\n{');
  if (pedacos.startsWith('[')) return JSON.parse(pedacos);
  return pedacos.split('\n').filter(Boolean).map((l) => JSON.parse(l));
}
async function emLotes(lista, n, f) {
  const saida = [];
  for (let i = 0; i < lista.length; i += n) saida.push(...(await Promise.all(lista.slice(i, i + n).map(f))));
  return saida;
}
const min = (a, b) => (new Date(b) - new Date(a)) / 60000;
const r1 = (x) => Math.round(x * 10) / 10;

// 1. Commits que podem ter tido build: main, homologa e os commits de cada PR do período.
const shas = new Set();
for (const b of ['main', 'homologa']) {
  for (const c of await api(`repos/${REPO}/commits?sha=${b}&since=${desdeIso}&per_page=100`)) shas.add(c.sha);
}
const prs = (await api(`repos/${REPO}/pulls?state=all&per_page=100`)).filter((p) => new Date(p.created_at) >= new Date(desde - 7 * 864e5));
for (const p of prs) for (const c of await api(`repos/${REPO}/pulls/${p.number}/commits?per_page=100`)) shas.add(c.sha);

// 2. Check suite e check run da Cloudflare de cada commit.
const builds = (
  await emLotes([...shas], 8, async (sha) => {
    const [suites] = await api(`repos/${REPO}/commits/${sha}/check-suites?per_page=100`);
    const [runs] = await api(`repos/${REPO}/commits/${sha}/check-runs?per_page=100`);
    const cf = (suites.check_suites || []).filter((s) => s.app?.slug === 'cloudflare-workers-and-pages' && s.status === 'completed');
    const run = (runs.check_runs || []).find((r) => r.name.startsWith('Workers Builds'));
    return cf.map((s) => {
      const url = run?.details_url || '';
      const branch = /\/production\/builds\//.test(url) && !/previews/.test(url) ? 'main' : (url.match(/previews\/([^/]+)\/builds/) || [])[1] || s.head_branch || '?';
      return { sha: sha.slice(0, 7), branch, inicio: s.created_at, fim: s.updated_at, minutos: min(s.created_at, s.updated_at), resultado: s.conclusion, conta: url.split('/')[3] };
    });
  })
).flat().filter((b) => new Date(b.inicio) >= desde);

// 3. Rodadas do GitHub Actions no período.
const rodadas = (await api(`repos/${REPO}/actions/runs?per_page=100&created=>=${desdeIso.slice(0, 10)}`)).flatMap((p) => p.workflow_runs || []);
const acoes = rodadas.map((r) => ({ fluxo: r.name, evento: r.event, branch: r.head_branch, inicio: r.run_started_at, minutos: min(r.run_started_at, r.updated_at), resultado: r.conclusion, sha: r.head_sha.slice(0, 7) }));

// 4. O robô da agenda: rodadas, commits que ele gravou na main e builds duplos.
const robo = acoes.filter((a) => a.fluxo === 'Atualiza a agenda');
const { stdout: log } = await sh('git', ['log', 'origin/main', `--since=${desdeIso}`, '--author=arquivo-da-agenda', '--format=%H %cI %s']);
const gravacoes = log.trim().split('\n').filter((l) => l.includes('Arquivo da agenda'));

// Tabelas.
const porBranch = {};
for (const b of builds) {
  const chave = b.branch === 'main' ? 'main (push)' : b.branch === 'homologa' || b.branch === 'design' ? `${b.branch} (homologação)` : b.branch.startsWith('tst-') || b.branch.startsWith('qa-') ? `${b.branch}` : b.branch;
  (porBranch[chave] ||= []).push(b.minutos);
}
const linhas = Object.entries(porBranch).sort((a, b) => b[1].length - a[1].length);
console.log(`\nBuilds da Cloudflare vistos no GitHub, últimos ${dias} dias (desde ${desdeIso.slice(0, 10)}): ${builds.length}`);
console.log('| Branch | Builds | Média (min) | Máxima (min) | Soma (min) |\n| --- | ---: | ---: | ---: | ---: |');
for (const [b, l] of linhas) console.log(`| ${b} | ${l.length} | ${r1(l.reduce((s, x) => s + x, 0) / l.length)} | ${r1(Math.max(...l))} | ${r1(l.reduce((s, x) => s + x, 0))} |`);
const tot = builds.reduce((s, b) => s + b.minutos, 0);
console.log(`| **total** | **${builds.length}** | ${r1(tot / builds.length)} | ${r1(Math.max(...builds.map((b) => b.minutos)))} | **${r1(tot)}** |`);

const porFluxo = {};
for (const a of acoes) {
  const k = `${a.fluxo} (${a.evento})`;
  const f = (porFluxo[k] ||= { n: 0, min: 0, cobrados: 0 });
  f.n++; f.min += a.minutos; f.cobrados += Math.max(1, Math.ceil(a.minutos));
}
console.log(`\nRodadas do GitHub Actions, últimos ${dias} dias: ${acoes.length}`);
console.log('| Fluxo (gatilho) | Rodadas | Minutos de relógio | Minutos arredondados por rodada |\n| --- | ---: | ---: | ---: |');
for (const [k, f] of Object.entries(porFluxo).sort((a, b) => b[1].cobrados - a[1].cobrados)) console.log(`| ${k} | ${f.n} | ${r1(f.min)} | ${f.cobrados} |`);

console.log(`\nRobô da agenda: ${robo.length} rodadas (cada uma pede um build pelo gancho), ${gravacoes.length} gravações na main (cada uma é mais um build pelo push).`);
for (const g of gravacoes) console.log('  ' + g);

const dir = path.join(os.tmpdir(), 'absurda-leveza');
mkdirSync(dir, { recursive: true });
const arq = path.join(dir, `builds-${new Date().toISOString().slice(0, 10)}.json`);
writeFileSync(arq, JSON.stringify({ desde: desdeIso, builds, acoes, gravacoes }, null, 2));
console.log(`\nGravado em ${arq}`);
