// Auditoria de leveza (Sessão J, 23 nov 2026): mede quanto cada etapa de "npm run build" leva.
// Não entra no build nem no confere-site.yml. Uso: npm run mede:leveza -- build
//
// Roda as mesmas etapas de "npm run build", uma por uma, e mede cada uma. Faz o build duas vezes:
// a primeira com o cache das fotos apagado (como um build da Cloudflare sem cache) e a segunda com
// o cache cheio. Grava o resultado em <tmp>/absurda-leveza/build-<data>.json e imprime uma tabela.
// Variáveis: as mesmas do build (WORKERS_CI_BRANCH etc.). Nenhuma chave é lida nem impressa aqui.
import { spawnSync } from 'node:child_process';
import { rmSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CACHE_FOTOS = path.resolve('node_modules/.cache/absurda-imagens');
const SAIDA = path.join(os.tmpdir(), 'absurda-leveza');

function roda(nome, comando, args) {
  const inicio = performance.now();
  const r = spawnSync(comando, args, { encoding: 'utf8', env: process.env, maxBuffer: 64 * 1024 * 1024 });
  const ms = performance.now() - inicio;
  const saida = (r.stdout || '') + (r.stderr || '');
  const fotos = saida.match(/(\d+) versões de fotos em ([\d.]+)s/);
  const paginas = saida.match(/(\d+) page\(s\) built in ([\d.]+)s/);
  return {
    etapa: nome,
    segundos: +(ms / 1000).toFixed(1),
    ok: r.status === 0,
    ...(fotos ? { fotos: +fotos[1], segundosFotos: +fotos[2] } : {}),
    ...(paginas ? { paginas: +paginas[1], segundosAstro: +paginas[2] } : {}),
  };
}

const ETAPAS = [
  ['guarda da produção', 'node', ['scripts/guarda-producao.mjs']],
  ['astro check', 'npx', ['astro', 'check']],
  ['astro build (montagem + fotos)', 'npx', ['astro', 'build']],
  ['trava dos exemplos', 'node', ['scripts/trava-exemplos.mjs']],
  ['confere:temas', 'node', ['scripts/confere-temas.mjs']],
  ['confere:links', 'node', ['scripts/confere-links.mjs']],
  ['confere:agenda', 'node', ['scripts/confere-agenda.mjs']],
  ['confere:atracoes', 'node', ['scripts/confere-atracoes.mjs']],
  ['confere:exemplos', 'node', ['scripts/confere-exemplos.mjs']],
];

function rodada(rotulo) {
  const linhas = ETAPAS.map(([n, c, a]) => roda(n, c, a));
  const total = +linhas.reduce((s, l) => s + l.segundos, 0).toFixed(1);
  return { rotulo, total, linhas };
}

const rodadas = [];
if (existsSync(CACHE_FOTOS)) rmSync(CACHE_FOTOS, { recursive: true, force: true });
rodadas.push(rodada('sem cache das fotos'));
rodadas.push(rodada('com cache das fotos'));

mkdirSync(SAIDA, { recursive: true });
const arquivo = path.join(SAIDA, `build-${new Date().toISOString().slice(0, 10)}.json`);
writeFileSync(arquivo, JSON.stringify({ quando: new Date().toISOString(), branch: process.env.WORKERS_CI_BRANCH || null, rodadas }, null, 2) + '\n');

console.log('| Etapa | ' + rodadas.map((r) => r.rotulo).join(' | ') + ' |');
console.log('| --- | ' + rodadas.map(() => '---:').join(' | ') + ' |');
for (let i = 0; i < ETAPAS.length; i++) {
  const extra = (l) => (l.fotos !== undefined ? ` (fotos: ${l.fotos} em ${l.segundosFotos} s)` : '');
  console.log(`| ${ETAPAS[i][0]} | ` + rodadas.map((r) => `${r.linhas[i].segundos} s${extra(r.linhas[i])}${r.linhas[i].ok ? '' : ' FALHOU'}`).join(' | ') + ' |');
}
console.log('| **total** | ' + rodadas.map((r) => `**${r.total} s**`).join(' | ') + ' |');
console.log(`\nGravado em ${path.relative(process.cwd(), arquivo)}`);
