// Auditoria de leveza (Sessão J, 23 nov 2026): peso das páginas. Não entra no build.
// Uso: npm run mede:leveza -- paginas [endereço-base | local] [rotas separadas por vírgula]
//   sem argumento: https://festaabsurda.com (produção)
//   "local": serve dist/ como a Cloudflare serve (ver comum.mjs); rode o build antes.
//
// Para cada página e tela (celular 390 x 844 a 3x, desktop 1440 x 900 a 1x), com cache vazio:
// bytes transferidos por tipo e requisições, na abertura e depois de rolar até o fim; requisições
// a outros domínios; cada foto visível com a largura servida contra a largura na tela; e quanto do
// JS e do CSS carregado ficou sem uso (cobertura do Chromium, depois de rolar).
import { chromium } from 'playwright';
import { PAGINAS, TELAS, servidor, tipoDe, rolaAteOFim, grava, kb } from './comum.mjs';

const arg = process.argv[2] || 'https://festaabsurda.com';
let base = arg, local;
if (arg === 'local') { local = await servidor('dist', 4321); base = local.base; }
const host = new URL(base).host;
const so = process.argv[3] ? process.argv[3].split(',') : null;

const browser = await chromium.launch();
const resultados = [];

const paginas = so ? so.map((rota) => PAGINAS.find(([, conhecida]) => conhecida === rota) ?? [rota, rota]) : PAGINAS;
for (const [nome, rota] of paginas) {
  for (const [tela, opcoes] of Object.entries(TELAS)) {
    const ctx = await browser.newContext({ ...opcoes });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    const pedidos = new Map();
    cdp.on('Network.responseReceived', (e) => pedidos.set(e.requestId, { url: e.response.url, mime: e.response.mimeType, status: e.response.status, bytes: 0 }));
    cdp.on('Network.loadingFinished', (e) => { const p = pedidos.get(e.requestId); if (p) p.bytes = e.encodedDataLength; });
    await page.coverage.startJSCoverage({ resetOnNavigation: false });
    await page.coverage.startCSSCoverage({ resetOnNavigation: false });

    await page.goto(base + rota, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const soma = () => {
      const t = {}; let n = 0, total = 0; const fora = new Set();
      for (const p of pedidos.values()) {
        if (p.url.startsWith('data:')) continue;
        const k = tipoDe(p.mime, p.url);
        t[k] = (t[k] || 0) + p.bytes; total += p.bytes; n++;
        try { const h = new URL(p.url).host; if (h !== host) fora.add(h); } catch {}
      }
      return { porTipo: t, total, requisicoes: n, outrosDominios: [...fora] };
    };
    const abertura = soma();
    await rolaAteOFim(page);
    await page.waitForLoadState('networkidle').catch(() => {});
    const rolada = soma();

    // Fotos: largura servida contra a necessária (caixa na tela x densidade, com object-fit: cover).
    // naturalWidth de foto com srcset vem dividido pela densidade escolhida; a largura real do
    // arquivo sai de uma cópia sem srcset (new Image), lida depois de somar os bytes.
    const fotos = await page.evaluate(async (dpr) => {
      const lista = [...document.images].filter((i) => i.complete && i.naturalWidth && i.getBoundingClientRect().width > 4 && getComputedStyle(i).visibility !== 'hidden');
      return Promise.all(lista.map(async (i) => {
        const r = i.getBoundingClientRect();
        const src = i.currentSrc || i.src;
        const real = await new Promise((ok) => { const c = new Image(); c.onload = () => ok([c.naturalWidth, c.naturalHeight]); c.onerror = () => ok([i.naturalWidth, i.naturalHeight]); c.src = src; });
        const fit = getComputedStyle(i).objectFit;
        const escala = fit === 'cover' ? Math.max(r.width / real[0], r.height / real[1]) : r.width / real[0];
        const precisa = Math.round(real[0] * escala * dpr);
        return { src: src.replace(location.origin, ''), servida: real[0], naTela: Math.round(r.width), precisa, razao: +(real[0] / precisa).toFixed(2), srcset: !!i.srcset, lazy: i.loading === 'lazy' };
      }));
    }, opcoes.deviceScaleFactor);

    const js = await page.coverage.stopJSCoverage();
    const css = await page.coverage.stopCSSCoverage();
    const uso = (lista) => {
      let total = 0, usado = 0;
      for (const e of lista) {
        const tam = e.text?.length ?? e.source?.length ?? 0;
        total += tam;
        if (e.ranges) usado += e.ranges.reduce((s, r) => s + r.end - r.start, 0);
        else if (e.functions) {
          // JS: soma os trechos executados (blocos com count > 0 no nível de cima de cada função).
          const marcas = new Uint8Array(tam);
          for (const f of e.functions) for (const r of f.ranges) marcas.fill(r.count > 0 ? 1 : 0, r.startOffset, r.endOffset);
          usado += marcas.reduce((s, x) => s + x, 0);
        }
      }
      return { total, usado, semUso: total - usado, pct: total ? Math.round((100 * (total - usado)) / total) : 0 };
    };
    resultados.push({ nome, rota, tela, abertura, rolada, fotos, cobertura: { js: uso(js), css: uso(css) } });
    process.stdout.write(`${nome} ${tela}: ${kb(abertura.total)} KB na abertura, ${kb(rolada.total)} KB depois de rolar, ${rolada.requisicoes} req\n`);
    await ctx.close();
  }
}
await browser.close();
local?.fecha();

// Tabelas.
const tipos = ['HTML', 'CSS', 'JS', 'fontes', 'imagens', 'outros'];
console.log(`\nPeso (KB transferidos, cache vazio) em ${base}. Abertura / depois de rolar até o fim.`);
console.log('| Página | Tela | ' + tipos.join(' | ') + ' | Total | Req. | Outros domínios |\n| --- | --- | ' + tipos.map(() => '---:').join(' | ') + ' | ---: | ---: | --- |');
for (const r of resultados) {
  const c = (t) => (r.abertura.porTipo[t] || 0) === (r.rolada.porTipo[t] || 0) ? kb(r.rolada.porTipo[t] || 0) : `${kb(r.abertura.porTipo[t] || 0)} / ${kb(r.rolada.porTipo[t] || 0)}`;
  console.log(`| ${r.nome} | ${r.tela} | ${tipos.map(c).join(' | ')} | ${kb(r.abertura.total)} / ${kb(r.rolada.total)} | ${r.abertura.requisicoes} / ${r.rolada.requisicoes} | ${r.rolada.outrosDominios.join(', ') || 'nenhum'} |`);
}
console.log('\nCobertura (depois de rolar): KB carregados e % sem uso.');
console.log('| Página | Tela | JS | JS sem uso | CSS | CSS sem uso |\n| --- | --- | ---: | ---: | ---: | ---: |');
for (const r of resultados) console.log(`| ${r.nome} | ${r.tela} | ${kb(r.cobertura.js.total)} | ${r.cobertura.js.pct}% | ${kb(r.cobertura.css.total)} | ${r.cobertura.css.pct}% |`);
console.log('\nFotos fora da faixa (servida/necessária acima de 2 = grande demais; abaixo de 0,85 = pode borrar):');
for (const r of resultados) for (const f of r.fotos) if (f.razao > 2 || f.razao < 0.85) console.log(`  ${r.nome} ${r.tela}: ${f.src} servida ${f.servida}px, precisa ${f.precisa}px (razão ${f.razao})${f.srcset ? '' : ', sem srcset'}`);
console.log('\nGravado em ' + grava(`paginas-${host.replace(/[:.]/g, '-')}.json`, { base, quando: new Date().toISOString(), resultados }));
