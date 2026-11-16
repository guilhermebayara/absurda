// Conferência da parede de palavras da Home: nenhuma fileira pode abrir buraco na tela.
//
// Cada fileira da parede são grupos iguais de palavras andando juntos: quando um sai, o outro já
// entrou. Isso só fecha a tela se, a qualquer momento da volta, os grupos visíveis cobrirem a
// largura inteira, ou seja, se (grupos visíveis - 1) x largura do grupo >= largura da tela.
// No celular a parede usa dois grupos e não três (o terceiro só gastava memória, e o Safari do
// iPhone apagava as camadas e as palavras piscavam todas juntas). Com dois grupos, cada grupo
// precisa ser mais largo que a tela. Uma fileira com palavras curtas demais quebra essa conta.
//
// O que a conferência faz: abre a Home do build com movimento ligado, em várias telas de
// celular (em pé e deitado) e de desktop, e mede cada fileira. Falha se alguma não cobrir a tela.
//
// Uso (depois de npm run build):  npm run confere:parede
// Precisa do navegador do Playwright. Na primeira vez:  npx playwright install chromium
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';

const DIST = 'dist';
// Telas: as menores e as mais largas de cada tipo, que são as que apertam a conta.
const TELAS = [
  { nome: 'celular pequeno', largura: 320, altura: 568, movel: true },
  { nome: 'celular', largura: 375, altura: 667, movel: true },
  { nome: 'celular grande', largura: 430, altura: 932, movel: true },
  { nome: 'celular deitado', largura: 568, altura: 320, movel: true },
  { nome: 'tablet estreito e baixo', largura: 720, altura: 400, movel: true },
  { nome: 'desktop', largura: 1440, altura: 900, movel: false },
  { nome: 'desktop largo', largura: 2560, altura: 1440, movel: false },
  { nome: 'desktop ultralargo', largura: 3440, altura: 1440, movel: false },
];

if (!existsSync(join(DIST, 'index.html'))) { console.log('Não achei o site gerado em dist/. Rode npm run build antes.'); process.exit(1); }

// Servidor do build, com a mesma regra de endereço da Cloudflare: /agenda entrega agenda.html.
const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm' };
const raizDist = normalize(join(process.cwd(), DIST));
const servidor = createServer((pedido, resposta) => {
  let rota = '/';
  try { rota = decodeURIComponent(new URL(pedido.url, 'http://x').pathname); } catch { /* fica a raiz */ }
  const alvo = normalize(join(raizDist, rota));
  let arquivo = null;
  if (alvo === raizDist || alvo.startsWith(raizDist + sep)) {
    for (const c of [alvo, alvo + '.html', join(alvo, 'index.html')]) if (existsSync(c) && statSync(c).isFile()) { arquivo = c; break; }
  }
  if (!arquivo) { resposta.writeHead(404).end(); return; }
  resposta.writeHead(200, { 'content-type': TIPOS[extname(arquivo).toLowerCase()] ?? 'application/octet-stream' });
  resposta.end(readFileSync(arquivo));
});
await new Promise((ok) => servidor.listen(0, '127.0.0.1', ok));
const BASE = `http://127.0.0.1:${servidor.address().port}`;

let chromium;
try { ({ chromium } = await import('playwright')); } catch { console.log('Falta o Playwright. Rode npm ci.'); process.exit(1); }
const navegador = await chromium.launch();
const achados = [];
try {
  for (const tela of TELAS) {
    const pagina = await navegador.newPage({ viewport: { width: tela.largura, height: tela.altura }, isMobile: tela.movel, hasTouch: tela.movel, reducedMotion: 'no-preference' });
    await pagina.goto(BASE + '/', { waitUntil: 'load' });
    await pagina.evaluate(() => document.fonts.ready);
    const medidas = await pagina.evaluate(() => {
      const parede = document.querySelector('[data-parede]');
      if (!parede) return null;
      const tela = document.documentElement.clientWidth;
      return [...parede.querySelectorAll('.parede-trilho')].map((trilho, i) => {
        const grupos = [...trilho.children].filter((g) => getComputedStyle(g).display !== 'none');
        const largura = grupos.length ? grupos[0].getBoundingClientRect().width : 0;
        const palavras = grupos[0] ? [...grupos[0].children].map((p) => p.textContent.trim()).join(', ').slice(0, 50) : '';
        return { fileira: i + 1, grupos: grupos.length, largura, tela, palavras };
      });
    });
    if (!medidas) { achados.push(`${tela.nome}: a parede ([data-parede]) não está na Home.`); await pagina.close(); continue; }
    for (const m of medidas) {
      const cobre = (m.grupos - 1) * m.largura;
      if (cobre < m.tela) {
        achados.push(`${tela.nome} (${tela.largura}x${tela.altura}): fileira ${m.fileira} ("${m.palavras}…") tem ${m.grupos} grupo(s) de ${Math.round(m.largura)}px e cobre só ${Math.round(cobre)}px de ${m.tela}px. Ponha mais palavras na fileira${m.grupos < 3 ? ' ou volte o terceiro grupo nessa tela (src/pages/index.astro)' : ''}.`);
      }
    }
    await pagina.close();
  }
} finally {
  await navegador.close();
  servidor.close();
}

if (achados.length) {
  console.log(`A parede da Home abre buraco na tela:\n- ${achados.join('\n- ')}`);
  process.exit(1);
}
console.log(`Parede da Home em ordem: todas as fileiras cobrem a tela em ${TELAS.length} tamanhos de tela.`);
