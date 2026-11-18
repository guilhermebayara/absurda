// Conferência da pilha do Trio no Sobre, no toque (versão C da prévia tst-trio).
//
// No toque, cada ano do Trio é um cartão que sobe acompanhando o dedo e assenta sobre o anterior,
// numa pilha solta. Nada é sticky nem fixed (banda do Safari no iPhone): a pilha fica parada por
// animação ligada à rolagem, e cada cartão anda pela sua. Regras que esta conferência guarda:
// - a pilha fica parada enquanto os cartões assentam e, depois do último, sai com a rolagem normal;
// - o cartão que sobe acompanha o dedo, um para um;
// - o trajeto sai de uma medida só (--passo) e não da altura da tela: em telas de alturas
//   diferentes, os cartões ficam nos mesmos lugares a cada ponto da rolagem;
// - ao assentar, o cartão do ano fica por cima, inteiro na tela e abaixo do relógio, com o texto
//   inteiro dentro dele, inclusive num iPhone pequeno (375 x 667);
// - os cartões que já estão por baixo perdem o texto e trocam a foto pela versão pequena;
// - nenhum cartão visível fica abaixo da tela (nada animado fora da tela);
// - não existe elemento sticky ou fixed na página;
// - com movimento reduzido, a pilha vira lista simples, sem animação.
//
// Ela não vê a barra de endereço do Safari encolhendo nem a rolagem com inércia: isso só no iPhone.
//
// Uso (depois de npm run build):  npm run confere:pilha
// Precisa dos navegadores do Playwright: npx playwright install chromium webkit
// (em máquina sem as bibliotecas do WebKit: npx playwright install --with-deps webkit).
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';

const DIST = 'dist';
// Enquanto a pilha é uma das versões da prévia, ela só liga com ?trio=c. Quando o Gui escolher a
// pilha e o parâmetro sair, troque para '/sobre'.
const ENDERECO = '/sobre?trio=c';
const FOLGA = 2; // pixels: arredondamento de subpixel e rotação dos cartões
const RELOGIO = 44; // altura da faixa do relógio no iPhone, em pixels
const TELAS = [
  { nome: 'iPhone pequeno', largura: 375, altura: 667 },
  // Mesma largura, tela mais alta: o trajeto tem de ser igual ao do pequeno.
  { nome: 'iPhone alto', largura: 375, altura: 812 },
  { nome: 'iPhone', largura: 393, altura: 852 },
];

if (!existsSync(join(DIST, 'sobre.html'))) { console.log('Não achei o Sobre em dist/. Rode npm run build antes.'); process.exit(1); }

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

// Lê a pilha num ponto da rolagem. Roda dentro da página.
const ler = () => {
  const ol = document.querySelector('.trio-mesa > .trio-quadros').getBoundingClientRect();
  const mesa = document.querySelector('.trio-mesa');
  return {
    y: scrollY,
    mesa: mesa.getBoundingClientRect().top,
    ol: ol.top,
    tela: innerHeight,
    cartoes: [...document.querySelectorAll('.trio-mesa .trio-quadro')].map((q) => {
      const r = q.getBoundingClientRect();
      const centro = document.elementFromPoint(r.left + r.width / 2, Math.min(Math.max(r.top + r.height / 2, 1), innerHeight - 1));
      return {
        topo: r.top, base: r.bottom,
        visivel: getComputedStyle(q).visibility === 'visible',
        porBaixo: q.classList.contains('por-baixo'),
        mini: /-mini\.jpg$/.test(q.querySelector('img').getAttribute('src') ?? ''),
        texto: getComputedStyle(q.querySelector('.trio-texto')).visibility === 'visible',
        // O cartão tem altura fixa e corta o que sobra: o texto cabe se nada passar do pé dele.
        transborda: q.scrollHeight > q.clientHeight + 1,
        porCima: q.contains(centro),
      };
    }),
  };
};
const quadro = () => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));

const conferir = async (navegador, motor, tela) => {
  const problemas = [];
  const contexto = await navegador.newContext({ viewport: { width: tela.largura, height: tela.altura }, hasTouch: true, isMobile: motor === 'chromium', reducedMotion: 'no-preference' });
  const pagina = await contexto.newPage();
  const erros = [];
  pagina.on('pageerror', (e) => erros.push(String(e.message).split('\n')[0]));
  await pagina.goto(BASE + ENDERECO, { waitUntil: 'load' });
  const base = await pagina.evaluate(() => {
    const raiz = document.documentElement.classList;
    const mesa = document.querySelector('.trio-mesa');
    const presos = [...document.querySelectorAll('body *')].filter((el) => ['sticky', 'fixed'].includes(getComputedStyle(el).position)).map((el) => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : ''));
    return {
      viva: raiz.contains('pino-novo') && raiz.contains('trio-c') && !!mesa,
      passo: mesa ? parseFloat(getComputedStyle(mesa).getPropertyValue('--passo')) : 0,
      topo: mesa ? mesa.getBoundingClientRect().top + scrollY : 0,
      n: document.querySelectorAll('.trio-mesa .trio-quadro').length,
      presos,
    };
  });
  if (!base.viva || !(base.passo > 0)) {
    problemas.push('a pilha não ligou (sem pino-novo, sem a classe trio-c ou sem --passo)');
    await contexto.close();
    return { problemas, marcas: null };
  }
  if (base.presos.length) problemas.push(`elemento sticky ou fixed no toque: ${[...new Set(base.presos)].join(', ')}`);
  const { passo: P, topo, n } = base;
  const ultimo = n - 1;
  // Pontos da rolagem: de um passo antes da pilha até um passo depois dela, de 0,1 em 0,1.
  const pontos = [];
  for (let t = -1; t <= n + 0.001; t += 0.1) pontos.push(+t.toFixed(2));
  const marcas = [];
  for (const alvo of pontos) {
    await pagina.evaluate((y) => scrollTo(0, y), Math.round(topo + alvo * P));
    await pagina.evaluate(quadro);
    await pagina.waitForTimeout(30);
    const m = await pagina.evaluate(ler);
    const t = -m.mesa / P;
    marcas.push({ alvo, t, m });
    const fixo = (v) => v.toFixed(1);
    // A pilha parada enquanto os cartões assentam; depois, sai com a rolagem.
    const esperado = t <= 0 ? null : t <= ultimo ? marcas.find((x) => Math.abs(x.alvo) < 0.001)?.m.ol : null;
    if (esperado != null && Math.abs(m.ol - esperado) > FOLGA) problemas.push(`t=${fixo(t)}: a pilha saiu do lugar (topo ${fixo(m.ol)} px, era ${fixo(esperado)} px)`);
    const parada = marcas.find((x) => Math.abs(x.alvo) < 0.001)?.m.ol;
    if (t > ultimo + 0.05 && parada != null) {
      const deveria = parada - (t - ultimo) * P;
      if (Math.abs(m.ol - deveria) > FOLGA) problemas.push(`t=${fixo(t)}: depois do último cartão a pilha não saiu com a rolagem (topo ${fixo(m.ol)} px, devia ${fixo(deveria)} px)`);
    }
    m.cartoes.forEach((c, k) => {
      // Nada visível abaixo da tela (o script esconde a partir de 40 px abaixo dela).
      if (c.visivel && c.topo > m.tela + 40 + FOLGA) problemas.push(`t=${fixo(t)}: o cartão ${k + 1} está visível fora da tela (topo ${fixo(c.topo)} px)`);
      // Subindo: acompanha o dedo, um para um (antes de começar a girar para assentar).
      if (k >= 1 && t >= Math.max(k - 2, 0) && t <= k - 0.3) {
        const deveria = m.ol + (k - t) * P;
        if (Math.abs(c.topo - deveria) > FOLGA) problemas.push(`t=${fixo(t)}: o cartão ${k + 1} não acompanha o dedo (topo ${fixo(c.topo)} px, devia ${fixo(deveria)} px)`);
      }
      // Por baixo: sem texto e com a foto pequena. Por cima: inteiro.
      const baixo = t >= k + 1 + 0.02;
      const cima = t <= k + 1 - 0.02;
      if (baixo && (!c.porBaixo || !c.mini || c.texto)) problemas.push(`t=${fixo(t)}: o cartão ${k + 1} está por baixo e não foi simplificado (${[!c.mini && 'foto grande', c.texto && 'texto à vista'].filter(Boolean).join(', ') || 'sem a classe por-baixo'})`);
      if (cima && t >= k - 0.02 && (c.porBaixo || c.mini || !c.texto)) problemas.push(`t=${fixo(t)}: o cartão ${k + 1} está por cima e perdeu ${c.mini ? 'a foto grande' : 'o texto'}`);
    });
    // Assentado: o cartão do ano por cima, inteiro na tela, abaixo do relógio e com o texto dentro.
    const k = Math.round(t);
    if (Math.abs(t - k) < 0.02 && k >= 0 && k <= ultimo) {
      const c = m.cartoes[k];
      if (!c.porCima) problemas.push(`t=${k}: o cartão ${k + 1} assentou mas não está por cima`);
      if (c.topo < RELOGIO - FOLGA || c.base > m.tela + FOLGA) problemas.push(`t=${k}: o cartão ${k + 1} não cabe inteiro na tela abaixo do relógio (de ${fixo(c.topo)} a ${fixo(c.base)} px, tela de ${m.tela} px)`);
      if (c.transborda) problemas.push(`t=${k}: o texto do cartão ${k + 1} não cabe nele`);
    }
  }
  if (erros.length) problemas.push(`erro de script: ${[...new Set(erros)].join('; ')}`);

  // Movimento reduzido: lista simples, sem animação.
  await pagina.emulateMedia({ reducedMotion: 'reduce' });
  await pagina.reload({ waitUntil: 'load' });
  const calma = await pagina.evaluate(() => {
    const cartoes = [...document.querySelectorAll('.trio-mesa .trio-quadro')];
    const anima = cartoes.flatMap((q) => q.getAnimations()).length + (document.querySelector('.trio-quadros')?.getAnimations().length ?? 0);
    const tops = cartoes.map((q) => q.getBoundingClientRect().top);
    const empilhados = tops.some((y, i) => i > 0 && y <= tops[i - 1] + 1);
    return { anima, empilhados, escondidos: cartoes.filter((q) => getComputedStyle(q).visibility !== 'visible').length };
  });
  if (calma.anima) problemas.push(`movimento reduzido: ${calma.anima} animação(ões) ainda ligadas na pilha`);
  if (calma.empilhados) problemas.push('movimento reduzido: os cartões continuam empilhados, em vez de virar lista');
  if (calma.escondidos) problemas.push(`movimento reduzido: ${calma.escondidos} cartão(ões) escondido(s)`);
  await contexto.close();
  return { problemas, marcas, passo: P };
};

const achados = [];
const motores = [];
for (const motor of ['chromium', 'webkit']) {
  try { motores.push([motor, await pw[motor].launch()]); } catch (erro) {
    achados.push(`Não consegui abrir o ${motor}. Rode: npx playwright install${motor === 'webkit' ? ' --with-deps' : ''} ${motor}\n  (${String(erro.message).split('\n')[0]})`);
  }
}
let rodadas = 0;
try {
  for (const [motor, navegador] of motores) {
    const porTela = [];
    for (const tela of TELAS) {
      const r = await conferir(navegador, motor, tela);
      rodadas++;
      if (r.problemas.length) achados.push(`${tela.nome} (${tela.largura} x ${tela.altura}) no ${motor}:\n  - ${[...new Set(r.problemas)].slice(0, 12).join('\n  - ')}`);
      porTela.push({ tela, ...r });
    }
    // As duas primeiras telas têm a mesma largura. Então o trajeto tem de ser o mesmo: só a altura
    // da tela muda, e ela não entra na conta. Compara a posição de cada cartão em relação à pilha.
    const [a, b] = porTela;
    if (a?.marcas && b?.marcas && Math.abs(a.passo - b.passo) > 0.5) achados.push(`${motor}: o passo da pilha muda com a altura da tela (${a.passo.toFixed(1)} px em ${a.tela.altura} de altura, ${b.passo.toFixed(1)} px em ${b.tela.altura})`);
    else if (a?.marcas && b?.marcas) {
      for (const ma of a.marcas) {
        const mb = b.marcas.find((x) => x.alvo === ma.alvo);
        if (!mb || Math.abs(ma.t - mb.t) > 0.005) continue;
        const k = ma.m.cartoes.findIndex((c, i) => Math.abs((c.topo - ma.m.ol) - (mb.m.cartoes[i].topo - mb.m.ol)) > FOLGA);
        if (k >= 0) { achados.push(`${motor}: o trajeto muda com a altura da tela (cartão ${k + 1} em t=${ma.t.toFixed(1)})`); break; }
      }
    }
  }
} finally {
  for (const [, navegador] of motores) await navegador.close();
  servidor.close();
}

if (achados.length) {
  console.log(`A pilha do Trio não passou:\n${achados.join('\n')}`);
  process.exit(1);
}
console.log(`Pilha do Trio em ordem: ${rodadas} rodadas em ${motores.map(([m]) => m).join(' e ')}, em ${TELAS.map((t) => `${t.largura} x ${t.altura}`).join(' e ')}, e lista simples com movimento reduzido.`);
