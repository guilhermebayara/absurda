// Auditoria de leveza (Sessão J, 23 nov 2026): custo no aparelho. Não entra no build.
// Uso: npm run mede:leveza -- aparelho [endereço-base | local] [rotas separadas por vírgula]
//
// Chromium com celular emulado (390 x 844 a 3x), rede 4G (9 Mbps de descida, 1,5 Mbps de subida,
// 100 ms de ida e volta) e CPU quatro vezes mais lenta. Para cada página, cache vazio:
// - LCP, CLS (maior janela de sessão) e TBT (soma do que passa de 50 ms em cada tarefa longa, do
//   começo até 10 s depois do load), como aproximação do INP;
// - página parada 10 s: memória do JS, animações rodando (e quantas fora da tela), tempo de tarefas,
//   recálculos de estilo e de layout (Performance.getMetrics, diferença entre o começo e o fim);
// - rolagem de cima a baixo: as mesmas contas;
// - quadros que o compositor desenha por segundo com a página parada, no topo e no meio da página
//   (animação de transform não aparece no tempo da thread principal, mas faz a GPU desenhar).
// A aba em segundo plano não se mede aqui: o Chromium sem tela mantém a aba "visible" mesmo com
// outra na frente ou a janela minimizada (testado em 23 nov 2026).
import { chromium } from 'playwright';
import { PAGINAS, TELAS, servidor, rolaAteOFim, grava } from './comum.mjs';

const arg = process.argv[2] || 'https://festaabsurda.com';
let base = arg, local;
if (arg === 'local') { local = await servidor('dist', 4322); base = local.base; }
const so = process.argv[3] ? process.argv[3].split(',') : null;

const REDE = { offline: false, latency: 100, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (1.5 * 1024 * 1024) / 8 };
const OBS = `
  window.__lev = { lcp: 0, cls: 0, longas: [] };
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lev.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
  let s = 0, ini = 0, ult = 0;
  new PerformanceObserver((l) => { for (const e of l.getEntries()) { if (e.hadRecentInput) continue; if (e.startTime - ult > 1000 || e.startTime - ini > 5000) { s = 0; ini = e.startTime; } s += e.value; ult = e.startTime; window.__lev.cls = Math.max(window.__lev.cls, s); } }).observe({ type: 'layout-shift', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lev.longas.push([e.startTime, e.duration]); }).observe({ type: 'longtask', buffered: true });
`;
const CHAVES = ['JSHeapUsedSize', 'TaskDuration', 'ScriptDuration', 'RecalcStyleCount', 'RecalcStyleDuration', 'LayoutCount', 'LayoutDuration', 'Nodes'];
async function metricas(cdp) {
  const { metrics } = await cdp.send('Performance.getMetrics');
  return Object.fromEntries(metrics.filter((m) => CHAVES.includes(m.name)).map((m) => [m.name, m.value]));
}
const diferenca = (a, b, ms) => ({
  segundos: +(ms / 1000).toFixed(1),
  heapMB: +(b.JSHeapUsedSize / 1048576).toFixed(1),
  tarefasMs: Math.round((b.TaskDuration - a.TaskDuration) * 1000),
  scriptMs: Math.round((b.ScriptDuration - a.ScriptDuration) * 1000),
  estilos: b.RecalcStyleCount - a.RecalcStyleCount,
  estilosMs: Math.round((b.RecalcStyleDuration - a.RecalcStyleDuration) * 1000),
  layouts: b.LayoutCount - a.LayoutCount,
  layoutsMs: Math.round((b.LayoutDuration - a.LayoutDuration) * 1000),
});
const animacoes = (page) => page.evaluate(() => {
  const vh = innerHeight, vw = innerWidth;
  const lista = document.getAnimations().filter((a) => a.playState === 'running');
  const fora = lista.filter((a) => { const el = a.effect?.target; if (!el?.getBoundingClientRect) return false; const r = el.getBoundingClientRect(); return r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw || (r.width === 0 && r.height === 0); });
  const infinitas = lista.filter((a) => a.effect?.getTiming?.().iterations === Infinity);
  const nomes = {};
  for (const a of lista) { const k = a.animationName || a.transitionProperty || a.constructor.name; nomes[k] = (nomes[k] || 0) + 1; }
  return { rodando: lista.length, foraDaTela: fora.length, infinitas: infinitas.length, nomes };
});

// Camadas do compositor e memória estimada das texturas (largura x altura x 4 bytes x densidade²).
async function camadas(cdp, page, dpr) {
  const espera = new Promise((r) => cdp.once('LayerTree.layerTreeDidChange', r));
  await cdp.send('LayerTree.enable');
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const { layers = [] } = await Promise.race([espera, page.waitForTimeout(3000).then(() => ({}))]);
  await cdp.send('LayerTree.disable');
  const desenhadas = layers.filter((l) => l.drawsContent);
  const mb = desenhadas.reduce((s, l) => s + l.width * l.height * 4 * dpr * dpr, 0) / 1048576;
  return { camadas: layers.length, desenhadas: desenhadas.length, mbEstimados: Math.round(mb) };
}

async function quadrosPorSegundo(cdp, page, ms) {
  const eventos = [];
  const coleta = (d) => eventos.push(...d.value);
  cdp.on('Tracing.dataCollected', coleta);
  const fim = new Promise((r) => cdp.once('Tracing.tracingComplete', r));
  await cdp.send('Tracing.start', { categories: 'cc,disabled-by-default-devtools.timeline.frame', transferMode: 'ReportEvents' });
  await page.waitForTimeout(ms);
  await cdp.send('Tracing.end');
  await fim;
  cdp.off('Tracing.dataCollected', coleta);
  return Math.round(eventos.filter((e) => e.name === 'ProxyImpl::ScheduledActionDraw').length / (ms / 1000));
}

const browser = await chromium.launch();
const resultados = [];
for (const [nome, rota] of PAGINAS) {
  if (so && !so.includes(rota)) continue;
  const ctx = await browser.newContext({ ...TELAS.celular });
  await ctx.addInitScript(OBS);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', REDE);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await cdp.send('Performance.enable', { timeDomain: 'timeTicks' });

  await page.goto(base + rota, { waitUntil: 'load', timeout: 120000 });
  await page.waitForTimeout(3000);
  const carga = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0;
    const tbt = window.__lev.longas.filter(([t]) => t >= fcp && t <= nav.loadEventEnd + 10000).reduce((s, [, d]) => s + Math.max(0, d - 50), 0);
    return { fcp: Math.round(fcp), lcp: Math.round(window.__lev.lcp), cls: +window.__lev.cls.toFixed(3), tbt: Math.round(tbt), load: Math.round(nav.loadEventEnd), tarefasLongas: window.__lev.longas.length };
  });

  // Parada 10 s.
  let a = await metricas(cdp), t = Date.now();
  await page.waitForTimeout(10000);
  const anParada = await animacoes(page);
  const parada = { ...diferenca(a, await metricas(cdp), Date.now() - t), animacoes: anParada };

  // Rolagem de cima a baixo.
  a = await metricas(cdp); t = Date.now();
  await rolaAteOFim(page, 300, 100);
  const anRolada = await animacoes(page);
  const rolada = { ...diferenca(a, await metricas(cdp), Date.now() - t), animacoes: anRolada };

  // Quadros por segundo com a página parada: no topo e no meio.
  const quadros = {};
  for (const [onde, y] of [['topo', 0], ['meio', 0.5]]) {
    await page.evaluate((y) => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * y), y);
    await page.waitForTimeout(1500);
    quadros[onde] = await quadrosPorSegundo(cdp, page, 3000);
    quadros[onde + 'Camadas'] = await camadas(cdp, page, TELAS.celular.deviceScaleFactor);
  }

  resultados.push({ nome, rota, carga, parada, rolada, quadros });
  console.log(`${nome}: LCP ${carga.lcp} ms, CLS ${carga.cls}, TBT ${carga.tbt} ms | parada: ${parada.tarefasMs} ms de tarefas, ${parada.estilos} estilos, ${parada.layouts} layouts, ${anParada.rodando} animações (${anParada.foraDaTela} fora da tela) | quadros/s parada: topo ${quadros.topo}, meio ${quadros.meio} | camadas no meio: ${quadros.meioCamadas.desenhadas}, ~${quadros.meioCamadas.mbEstimados} MB`);
  await ctx.close();
}
await browser.close();
local?.fecha();

console.log(`\nCarga (celular, 4G, CPU 4x), ${base}`);
console.log('| Página | FCP (ms) | LCP (ms) | CLS | TBT (ms) | Tarefas longas |\n| --- | ---: | ---: | ---: | ---: | ---: |');
for (const r of resultados) console.log(`| ${r.nome} | ${r.carga.fcp} | ${r.carga.lcp} | ${r.carga.cls} | ${r.carga.tbt} | ${r.carga.tarefasLongas} |`);
console.log('\nParada 10 s / rolagem de cima a baixo (celular, CPU 4x)');
console.log('| Página | Heap JS (MB) | Tarefas (ms) | Script (ms) | Estilos (n / ms) | Layouts (n / ms) | Animações rodando, parada (fora da tela) | Quadros/s parada (topo / meio) | Camadas desenhadas e MB de textura estimados (topo / meio) |\n| --- | ---: | ---: | ---: | ---: | ---: | --- | ---: | ---: |');
for (const r of resultados) {
  console.log(`| ${r.nome} | ${r.parada.heapMB} / ${r.rolada.heapMB} | ${r.parada.tarefasMs} / ${r.rolada.tarefasMs} | ${r.parada.scriptMs} / ${r.rolada.scriptMs} | ${r.parada.estilos} (${r.parada.estilosMs}) / ${r.rolada.estilos} (${r.rolada.estilosMs}) | ${r.parada.layouts} (${r.parada.layoutsMs}) / ${r.rolada.layouts} (${r.rolada.layoutsMs}) | ${r.parada.animacoes.rodando} (${r.parada.animacoes.foraDaTela}): ${Object.entries(r.parada.animacoes.nomes).map(([k, v]) => `${k} ${v}`).join(', ') || 'nenhuma'} | ${r.quadros.topo} / ${r.quadros.meio} | ${r.quadros.topoCamadas.desenhadas} (${r.quadros.topoCamadas.mbEstimados}) / ${r.quadros.meioCamadas.desenhadas} (${r.quadros.meioCamadas.mbEstimados}) |`);
}
console.log('\nGravado em ' + grava(`aparelho-${new URL(base).host.replace(/[:.]/g, '-')}.json`, { base, quando: new Date().toISOString(), rede: REDE, cpu: 4, resultados }));
