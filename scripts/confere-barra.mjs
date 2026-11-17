// Conferência das barras presas no topo, em aparelho de toque: o atalho de anos da Agenda e o
// ano dos Marcos, no Sobre (toda página com data-trilho e data-barra; ver "Barras presas" em
// src/layouts/Base.astro).
//
// No toque a barra não é sticky (banda do Safari no iPhone): ela anda por animação ligada à
// rolagem. O achado que criou esta conferência (Gui, 17 nov 2026): no iPhone a barra pulava ao
// tocar num ano do atalho, e às vezes na rolagem. A causa do toque aparece no WebKit: enquanto o
// ano abria, o fim do trecho era contado pelo navegador e o percurso da barra por script, os dois
// discordavam por alguns quadros e a barra ia parar centenas de pixels fora do lugar.
//
// O que a conferência faz: abre cada página com barra presa num iPhone emulado, no Chromium e no
// WebKit (a mesma geração do Safari do iPhone, e o único dos dois que mostra o pulo do toque), e
// mede a barra a cada quadro, antes e depois da pintura. Falha se:
// - na rolagem, a barra presa sair do alto da tela, ou a cobertura acima dela não estiver inteira;
// - o trajeto da barra usar a altura da tela (ela muda no iPhone quando a barra de endereço
//   encolhe ou volta), ou a barra sair do lugar quando a altura da tela muda;
// - algo dentro da barra animar por tempo, ou a fila rolar sozinha, enquanto a página rola;
// - no toque num ano do atalho, a barra sair do alto da tela em qualquer quadro até o ano terminar
//   de abrir, ou o toque não levar ao ano (aberto, no alto da tela e marcado no atalho);
// - a fila de anos deixar de ser arrastável com o dedo;
// - existir elemento sticky ou fixed na página, no toque.
//
// O que ela não vê: a barra de endereço do Safari encolhendo, a rolagem com inércia do iPhone e a
// banda atrás das barras. Isso só se confere no aparelho.
//
// Uso (depois de npm run build):  npm run confere:barra
// Precisa dos navegadores do Playwright. Na primeira vez:  npx playwright install chromium webkit
// (em máquina sem as bibliotecas do WebKit: npx playwright install --with-deps webkit).
import { createServer } from 'node:http';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, normalize, relative, sep } from 'node:path';

const DIST = 'dist';
// TESTE DA BARRA (branch tst-barra-agenda): enquanto o Gui escolhe no iPhone, as variantes vêm
// pelo endereço (?barra=N). Todas as candidatas precisam passar. A 0 é o desenho da main, o
// controle: ela tem de mostrar o pulo no WebKit, senão a conferência perdeu a mão. Quando uma
// variante virar o desenho do site, troque por VARIANTES = [null] e CONTROLE = null.
const VARIANTES = [1, 2, 3, 4, 5, 6];
// Na 5 e na 6 a fila de anos acompanha a rolagem de propósito (é o que o Gui está comparando):
// nelas não vale a regra de a fila ficar parada enquanto a página rola.
const FILA_ACOMPANHA = [5, 6];
const CONTROLE = 0;
// Folga da medida, em pixels: arredondamento de subpixel.
const FOLGA = 1.5;
// Animações por tempo que podem rodar dentro da barra durante a rolagem, conferidas no aparelho.
// Os algarismos do ano dos Marcos viram quando o ano muda: é o desenho da barra, e o Gui não viu
// pulo lá.
const ANIMA_DE_PROPOSITO = ['.marcos-num', '.marcos-conta'];

if (!existsSync(join(DIST, 'index.html'))) { console.log('Não achei o site gerado em dist/. Rode npm run build antes.'); process.exit(1); }

// Páginas com barra presa: toda página do build que tenha data-trilho.
const paginas = [];
const varre = (pasta) => {
  for (const nome of readdirSync(pasta)) {
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) varre(caminho);
    else if (nome.endsWith('.html') && readFileSync(caminho, 'utf8').includes('data-trilho')) {
      paginas.push('/' + relative(DIST, caminho).split(sep).join('/').replace(/(^|\/)index\.html$/, '').replace(/\.html$/, ''));
    }
  }
};
varre(DIST);
if (paginas.length === 0) { console.log('Nenhuma página do build tem barra presa (data-trilho). Se as barras saíram do site, tire esta conferência.'); process.exit(1); }

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

let pw;
try { pw = await import('playwright'); } catch { console.log('Falta o Playwright. Rode npm ci.'); process.exit(1); }
const APARELHO = { ...pw.devices['iPhone 15'], reducedMotion: 'no-preference' };

// ---- O que roda dentro da página ----

// Liga a medição: a cada quadro guarda a posição da barra, antes da pintura (no rAF) e depois
// dela (numa mensagem enfileirada no rAF, que o navegador entrega depois de pintar o quadro).
const ligar = (deProposito) => {
  const trilho = document.querySelector('[data-trilho]');
  const barra = trilho.querySelector(':scope > [data-barra]');
  const fila = barra.querySelector('ul');
  const m = (window.__barra = { ligada: true, quadros: [] });
  const ler = (fase) => {
    const b = barra.getBoundingClientRect();
    const t = trilho.getBoundingClientRect();
    const q = { fase, y: Math.round(scrollY), topo: +b.top.toFixed(1), preso: t.top < -1 && t.bottom > b.height + 1, fundo: Math.round(-t.top), cobertura: +getComputedStyle(barra, '::before').opacity, fila: Math.round(fila ? fila.scrollLeft : 0) };
    if (fase === 'antes') {
      q.anima = barra.getAnimations({ subtree: true })
        .filter((a) => a.playState === 'running' && (!a.timeline || a.timeline.constructor.name === 'DocumentTimeline'))
        .filter((a) => !deProposito.some((s) => a.effect?.target?.closest?.(s)))
        .map((a) => `${a.effect?.target?.tagName?.toLowerCase() ?? '?'}${a.effect?.pseudoElement ?? ''} (${a.transitionProperty ?? a.animationName ?? 'animação'})`);
    }
    m.quadros.push(q);
  };
  const passo = () => {
    if (!m.ligada) return;
    ler('antes');
    // Se um script rolou a página no meio do quadro, a leitura de depois não vale: a animação
    // ligada à rolagem só é atualizada no quadro seguinte, e um dedo nunca rola no meio do quadro.
    const y = scrollY;
    const canal = new MessageChannel();
    canal.port1.onmessage = () => { if (m.ligada && scrollY === y) ler('depois'); };
    canal.port2.postMessage(0);
    requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
};
const desligar = () => { window.__barra.ligada = false; return window.__barra.quadros; };
// Leva a página a um ponto do trecho (em pixels a partir do topo dele), de uma vez.
const irAoTrecho = (dy) => { const t = document.querySelector('[data-trilho]'); scrollTo(0, t.getBoundingClientRect().top + scrollY + dy); };
const estado = () => {
  const trilho = document.querySelector('[data-trilho]');
  const barra = trilho.querySelector(':scope > [data-barra]');
  const fila = barra.querySelector('ul');
  const presos = [...document.querySelectorAll('body *')].filter((e) => {
    const s = getComputedStyle(e);
    return (s.position === 'sticky' || s.position === 'fixed') && s.display !== 'none' && e.getClientRects().length > 0;
  }).map((e) => `${e.tagName.toLowerCase()}${e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).join('.') : ''}`);
  const trajeto = barra.getAnimations().filter((a) => a.timeline && a.timeline.constructor.name !== 'DocumentTimeline').map((a) => ({ inicio: a.rangeStart?.rangeName ?? String(a.rangeStart), fim: a.rangeEnd?.rangeName ?? String(a.rangeEnd) }));
  const sf = fila ? getComputedStyle(fila) : null;
  const rf = fila ? fila.getBoundingClientRect() : null;
  return {
    toque: document.documentElement.classList.contains('pino-novo'),
    posicao: getComputedStyle(barra).position,
    presos, trajeto,
    anos: [...barra.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href').slice(1)),
    fila: fila && { rola: ['auto', 'scroll'].includes(sf.overflowX), sobra: fila.scrollWidth - fila.clientWidth, gesto: sf.touchAction, x: rf.left + rf.width / 2, y: rf.top + rf.height / 2, esquerda: fila.scrollLeft },
  };
};
const depoisDoToque = (id) => {
  const bloco = document.getElementById(id);
  const atalho = document.querySelector(`[data-barra] a[href="#${id}"]`);
  return { aberto: bloco.open === true, topo: +bloco.getBoundingClientRect().top.toFixed(1), margem: parseFloat(getComputedStyle(bloco).scrollMarginTop) || 0, marcado: atalho.hasAttribute('aria-current'), marcados: document.querySelectorAll('[data-barra] a[aria-current]').length };
};

// ---- A leitura das medidas ----

// Devolve os problemas de uma sequência de quadros. "rolando" liga as conferências que só valem
// enquanto a página rola (nada se mexendo dentro da barra).
const ler = (quadros, { rolando, filaLivre = false }) => {
  const problemas = [];
  for (const fase of ['antes', 'depois']) {
    const q = quadros.filter((x) => x.fase === fase);
    const fora = q.filter((x) => x.preso && Math.abs(x.topo) > FOLGA);
    if (fora.length) {
      const pior = fora.reduce((a, b) => (Math.abs(b.topo) > Math.abs(a.topo) ? b : a));
      problemas.push(`a barra saiu do alto da tela em ${fora.length} quadro(s) (${fase} da pintura): chegou a ${Math.round(Math.abs(pior.topo))}px fora, com a página ${pior.fundo}px dentro do trecho`);
    }
    const vazada = q.filter((x) => x.preso && x.fundo > 2 && x.cobertura < 0.99);
    if (vazada.length) problemas.push(`a cobertura acima da barra não estava inteira em ${vazada.length} quadro(s) (${fase} da pintura): o conteúdo aparece acima dela`);
  }
  if (rolando) {
    const q = quadros.filter((x) => x.fase === 'antes');
    const mexe = new Set();
    let filaAndou = 0;
    for (let i = 1; i < q.length; i++) {
      if (q[i].y === q[i - 1].y) continue;
      for (const a of q[i].anima ?? []) mexe.add(a);
      if (q[i].fila !== q[i - 1].fila) filaAndou++;
    }
    if (mexe.size) problemas.push(`anima por tempo dentro da barra enquanto a página rola: ${[...mexe].join(', ')}`);
    if (filaAndou && !filaLivre) problemas.push(`a fila da barra rolou sozinha em ${filaAndou} quadro(s) enquanto a página rolava`);
  }
  return problemas;
};

// Arrasta o dedo na tela (só no Chromium, pelo protocolo dele): toques de verdade, um a cada quadro.
const arrastar = async (cdp, pagina, de, dx, dy, passos = 14) => {
  const dedo = (i) => [{ x: de.x + (dx * i) / passos, y: de.y + (dy * i) / passos }];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: dedo(0) });
  for (let i = 1; i <= passos; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: dedo(i) }); await pagina.waitForTimeout(16); }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
};

// ---- Um navegador, uma página, uma variante ----

const conferir = async (navegador, motor, rota, variante) => {
  const problemas = [];
  const anota = (onde, lista) => { for (const p of lista) problemas.push(`${onde}: ${p}`); };
  const contexto = await navegador.newContext(APARELHO);
  const pagina = await contexto.newPage();
  const cdp = motor === 'chromium' ? await contexto.newCDPSession(pagina) : null;
  const medir = async (acao, opcoes) => {
    await pagina.evaluate(ligar, ANIMA_DE_PROPOSITO);
    await pagina.waitForTimeout(80);
    await acao();
    return ler(await pagina.evaluate(desligar), opcoes);
  };
  try {
    await pagina.goto(BASE + rota + (variante === null ? '' : `?barra=${variante}`), { waitUntil: 'load' });
    await pagina.evaluate(() => document.fonts.ready);
    await pagina.waitForTimeout(700);
    const e = await pagina.evaluate(estado);
    if (!e.toque) return ['a página não ligou o modo de toque (classe pino-novo): a conferência não mediu nada'];

    // Nada preso por sticky ou fixed.
    if (e.presos.length) problemas.push(`elemento sticky ou fixed no toque (banda do Safari): ${[...new Set(e.presos)].slice(0, 5).join(', ')}`);
    if (e.posicao === 'sticky' || e.posicao === 'fixed') problemas.push(`a barra está ${e.posicao} no toque`);
    // O trajeto não usa a altura da tela: começa e termina contado a partir do topo do trecho.
    if (e.trajeto.length === 0) problemas.push('a barra não tem animação ligada à rolagem');
    for (const t of e.trajeto) if (t.inicio !== 'contain' || t.fim !== 'contain') problemas.push(`o trajeto da barra usa a altura da tela (animation-range de "${t.inicio}" a "${t.fim}"; o combinado é de "contain" a "contain", contado do topo do trecho)`);

    // Rolagem: desce por dentro do trecho e volta. No Chromium, com o dedo; no WebKit, por passos.
    await pagina.evaluate(irAoTrecho, -250);
    await pagina.waitForTimeout(200);
    const partida = await pagina.evaluate(() => scrollY);
    anota('rolagem', await medir(async () => {
      if (cdp) {
        for (let i = 0; i < 5; i++) { await arrastar(cdp, pagina, { x: 196, y: 540 }, 0, -420); await pagina.waitForTimeout(350); }
        for (let i = 0; i < 2; i++) { await arrastar(cdp, pagina, { x: 196, y: 160 }, 0, 380); await pagina.waitForTimeout(350); }
      } else {
        // O WebKit do Playwright não aceita gesto de toque sintético: rola por passos.
        for (let i = 0; i < 40; i++) { await pagina.evaluate(() => scrollBy(0, 55)); await pagina.waitForTimeout(24); }
        for (let i = 0; i < 20; i++) { await pagina.evaluate(() => scrollBy(0, -45)); await pagina.waitForTimeout(24); }
      }
      await pagina.waitForTimeout(500);
    }, { rolando: true, filaLivre: FILA_ACOMPANHA.includes(variante) }));
    if (Math.abs((await pagina.evaluate(() => scrollY)) - partida) < 400) problemas.push('rolagem: a página não rolou, e a conferência não mediu nada');

    // Altura da tela mudando com a barra presa, como quando a barra de endereço encolhe e volta.
    await pagina.evaluate(irAoTrecho, 900);
    await pagina.waitForTimeout(200);
    const tela = pagina.viewportSize();
    // Mede com a tela já assentada em cada altura. No emulador, mudar a altura da tela muda também
    // as medidas em svh e lvh da página, o que no iPhone não acontece; os quadros da troca não contam.
    for (const altura of [tela.height + 100, tela.height, tela.height + 86, tela.height]) {
      await pagina.setViewportSize({ width: tela.width, height: altura });
      await pagina.waitForTimeout(300);
      anota(`tela com ${altura}px de altura`, await medir(() => pagina.waitForTimeout(150), { rolando: false }));
    }

    // Toque num ano do atalho, com a barra presa: um ano abaixo, outro abaixo com o primeiro já
    // aberto, um acima e o último. Mede até o ano terminar de abrir.
    if (e.anos.length >= 6) {
      const n = e.anos.length;
      const alvos = [e.anos[Math.floor(n * 0.4)], e.anos[Math.floor(n * 0.75)], e.anos[2], e.anos[n - 2]];
      await pagina.evaluate(irAoTrecho, 300);
      await pagina.waitForTimeout(300);
      for (const id of alvos) {
        const onde = `toque em ${id.replace('ano-', '')}`;
        anota(onde, await medir(async () => {
          await pagina.tap(`[data-barra] a[href="#${id}"]`);
          await pagina.waitForTimeout(1300);
        }, { rolando: false }));
        const d = await pagina.evaluate(depoisDoToque, id);
        if (!d.aberto) problemas.push(`${onde}: o ano não abriu`);
        if (Math.abs(d.topo - d.margem) > 4) problemas.push(`${onde}: o toque não levou ao ano (ele ficou a ${Math.round(d.topo)}px do alto da tela; o esperado é ${Math.round(d.margem)}px)`);
        if (!d.marcado || d.marcados !== 1) problemas.push(`${onde}: o ano tocado não ficou marcado sozinho no atalho (${d.marcados} marcado(s))`);
      }
    }

    // A fila de anos continua arrastável com o dedo.
    if (e.fila) {
      if (!e.fila.rola || e.fila.sobra < 40) problemas.push('a fila de anos não rola para o lado');
      if (!/auto|pan-x|manipulation/.test(e.fila.gesto)) problemas.push(`a fila de anos não aceita o dedo (touch-action: ${e.fila.gesto})`);
      if (cdp) {
        await pagina.evaluate(irAoTrecho, 300);
        await pagina.waitForTimeout(600);
        const antes = await pagina.evaluate(estado);
        // Arrasta para um lado ou para o outro, conforme onde a fila está.
        const paraFrente = antes.fila.esquerda < antes.fila.sobra / 2;
        await arrastar(cdp, pagina, { x: paraFrente ? 300 : 90, y: antes.fila.y }, paraFrente ? -210 : 210, 0);
        await pagina.waitForTimeout(700);
        const depois = await pagina.evaluate(estado);
        if (Math.abs(depois.fila.esquerda - antes.fila.esquerda) < 80) problemas.push(`arrastei a fila de anos com o dedo e ela não ficou onde deixei (andou ${Math.round(Math.abs(depois.fila.esquerda - antes.fila.esquerda))}px de uns 200)`);
      }
    }
  } finally {
    await contexto.close();
  }
  return problemas;
};

// ---- A rodada ----

const achados = [];
const avisos = [];
let rodadas = 0;
const motores = [];
for (const motor of ['chromium', 'webkit']) {
  try { motores.push([motor, await pw[motor].launch()]); } catch (erro) {
    achados.push(`Não consegui abrir o ${motor}. Rode: npx playwright install${motor === 'webkit' ? ' --with-deps' : ''} ${motor}\n  (${String(erro.message).split('\n')[0]})`);
  }
}
try {
  for (const [motor, navegador] of motores) {
    for (const rota of paginas) {
      for (const variante of VARIANTES) {
        const nome = `${rota}${variante === null ? '' : `?barra=${variante}`} no ${motor}`;
        const problemas = await conferir(navegador, motor, rota, variante);
        rodadas++;
        if (problemas.length) achados.push(`${nome}:\n  - ${problemas.join('\n  - ')}`);
      }
      // O controle: o desenho antigo precisa mostrar o pulo do toque no WebKit.
      if (CONTROLE !== null && motor === 'webkit') {
        const problemas = await conferir(navegador, motor, rota, CONTROLE);
        const temToque = problemas.some((p) => p.startsWith('toque'));
        const pulou = problemas.some((p) => p.startsWith('toque') && p.includes('saiu do alto da tela'));
        if (problemas.length) avisos.push(`Controle (${rota}?barra=${CONTROLE} no ${motor}, o desenho da main), como esperado:\n  - ${problemas.join('\n  - ')}`);
        if (rota === '/agenda' && !pulou) achados.push(`O controle (${rota}?barra=${CONTROLE} no ${motor}) não mostrou o pulo do toque${temToque ? '' : ' (nenhum problema no toque)'}. A conferência deixou de enxergar o defeito: confira a medição antes de confiar nela.`);
      }
    }
  }
} finally {
  for (const [, navegador] of motores) await navegador.close();
  servidor.close();
}

if (avisos.length) console.log(avisos.join('\n') + '\n');
if (achados.length) {
  console.log(`A barra presa não passou:\n${achados.join('\n')}`);
  process.exit(1);
}
console.log(`Barras presas em ordem: ${paginas.join(', ')} em ${motores.map(([m]) => m).join(' e ')}${VARIANTES[0] === null ? '' : `, variantes ${VARIANTES.join(', ')}`} (${rodadas} rodadas de rolagem${paginas.includes('/agenda') ? ' e toque' : ''}).`);
