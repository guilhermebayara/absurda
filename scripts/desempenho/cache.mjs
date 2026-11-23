// Auditoria de leveza (Sessão J, 23 nov 2026): cache. Não entra no build.
// Uso: npm run mede:leveza -- cache [endereço-base]
//
// 1. Cabeçalhos de cache que o site devolve para cada tipo de arquivo (um exemplo de cada).
// 2. Navegação: abre Home, Agenda, Sobre, Projetos, Equipe e volta à Home na mesma aba (celular),
//    com o cache do navegador ligado, e conta o que cada página baixa de novo, o que confere com o
//    servidor (304) e o que sai do cache sem perguntar.
import { chromium } from 'playwright';
import { TELAS, tipoDe, grava, kb } from './comum.mjs';

const base = process.argv[2] || 'https://festaabsurda.com';
const browser = await chromium.launch();

// 1. Exemplos de cada tipo, tirados da própria Home montada.
const ctx0 = await browser.newContext();
const p0 = await ctx0.newPage();
const vistos = new Map();
p0.on('response', (r) => vistos.set(r.url(), r));
await p0.goto(base + '/sobre', { waitUntil: 'networkidle' });
await p0.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } });
await p0.waitForTimeout(800);
const grupos = [['HTML', /\/sobre$/], ['CSS (/_astro/)', /\/_astro\/.*\.css$/], ['JS (/_astro/)', /\/_astro\/.*\.js$/], ['Fonte (/_astro/)', /\.woff2$/], ['/img/ (versões do build)', /\/img\/\d+\//], ['/arquivo/ (capas do histórico)', /\/arquivo\//], ['/sobre/ (foto original)', /\/sobre\/[^/]+\.(jpg|png)$/], ['Farol do Web Analytics', /cloudflareinsights/]];
const extras = [['/capas/', '/capas/'], ['/estado.json', '/estado.json'], ['/favicon.svg', '/favicon.svg'], ['Endereço inexistente em /_astro/', '/_astro/nao-existe.js']];
const cab = [];
for (const [rotulo, re] of grupos) {
  const r = [...vistos.values()].find((x) => re.test(x.url()));
  if (r) { const h = await r.allHeaders(); cab.push([rotulo, r.url().replace(base, ''), r.status(), h['cache-control'] || '(nenhum)', h['cf-cache-status'] || '']); }
}
for (const [rotulo, rota] of extras) {
  let url = base + rota;
  if (rota === '/capas/') { const h = await (await p0.request.get(base + '/projetos/absurda')).text(); url = base + (h.match(/\/capas\/[^"' ,]+\.jpg/) || ['/capas/'])[0]; }
  const r = await p0.request.get(url);
  const h = r.headers();
  cab.push([rotulo, url.replace(base, ''), r.status(), h['cache-control'] || '(nenhum)', h['cf-cache-status'] || '']);
}
await ctx0.close();

// 2. Navegação na mesma aba.
const ctx = await browser.newContext({ ...TELAS.celular });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send('Network.enable');
let atual = [];
const porId = new Map();
const servidosDoCache = new Set();
cdp.on('Network.responseReceived', (e) => { const x = { url: e.response.url, status: e.response.status, mime: e.response.mimeType, doCache: servidosDoCache.has(e.requestId) || e.response.fromDiskCache || e.response.fromMemoryCache || e.response.fromPrefetchCache, bytes: 0 }; porId.set(e.requestId, x); atual.push(x); });
// O aviso de "servido do cache" pode chegar antes da resposta.
cdp.on('Network.requestServedFromCache', (e) => { servidosDoCache.add(e.requestId); const x = porId.get(e.requestId); if (x) x.doCache = true; });
cdp.on('Network.loadingFinished', (e) => { const x = porId.get(e.requestId); if (x) x.bytes = e.encodedDataLength; });
const nav = [];
for (const rota of ['/', '/agenda', '/sobre', '/projetos', '/equipe', '/']) {
  atual = [];
  await page.goto(base + rota, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const linha = { rota, total: atual.length, doCache: 0, revalidados: 0, baixados: 0, bytes: 0, baixadosPorTipo: {} };
  for (const x of atual) {
    if (x.url.startsWith('data:')) continue;
    if (x.doCache) linha.doCache++;
    else if (x.status === 304) { linha.revalidados++; linha.bytes += x.bytes; }
    else { linha.baixados++; linha.bytes += x.bytes; const t = tipoDe(x.mime, x.url); linha.baixadosPorTipo[t] = (linha.baixadosPorTipo[t] || 0) + 1; }
  }
  nav.push(linha);
}
await browser.close();

console.log(`\nCabeçalhos de cache, ${base}`);
console.log('| Tipo | Exemplo | Status | Cache-Control | cf-cache-status |\n| --- | --- | ---: | --- | --- |');
for (const c of cab) console.log(`| ${c[0]} | \`${c[1].slice(0, 70)}\` | ${c[2]} | \`${c[3]}\` | ${c[4]} |`);
console.log('\nNavegação na mesma aba (celular, cache do navegador ligado)');
console.log('| Página | Requisições | Do cache, sem perguntar | Conferidas (304) | Baixadas | KB | Baixadas por tipo |\n| --- | ---: | ---: | ---: | ---: | ---: | --- |');
for (const n of nav) console.log(`| ${n.rota} | ${n.total} | ${n.doCache} | ${n.revalidados} | ${n.baixados} | ${kb(n.bytes)} | ${Object.entries(n.baixadosPorTipo).map(([k, v]) => `${k} ${v}`).join(', ')} |`);
console.log('\nGravado em ' + grava(`cache-${new URL(base).host.replace(/[:.]/g, '-')}.json`, { base, cab, nav }));
