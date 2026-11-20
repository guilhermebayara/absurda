// Conferência do movimento reduzido: com "reduzir movimento" ligado no aparelho, nada no site
// pode ficar escondido nem se mexer sozinho.
//
// As entradas ([data-anima]) e os ecos (.ecoa, .eco) nascem escondidos e aparecem por animação.
// Com movimento reduzido a animação é desligada, e aí mora o risco: desligar a animação e
// esquecer de devolver o estado final deixa o conteúdo invisível justamente para quem pediu calma.
//
// O que a conferência faz: abre cada página do build num navegador com movimento reduzido, em
// celular e em desktop, rola do topo ao fim e, a cada parada, falha se encontrar:
//   - entrada ou eco ainda escondido, recortado ou deslocado;
//   - texto na tela com opacidade zero;
//   - animação por tempo em curso (as ligadas à rolagem só seguram posição e não contam;
//     troca de cor também não é movimento);
//   - qualquer elemento mudando de lugar ou de largura com a página parada;
//   - erro de script na página.
// Uma página com achado é aberta de novo: só vale o que se repetir, para carregamento lento de
// imagem ou fonte não virar alarme falso.
//
// Uso (depois de npm run build):  npm run confere:calmo
// Precisa do navegador do Playwright. Na primeira vez:  npx playwright install chromium
import { createServer } from 'node:http';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';

const DIST = 'dist';
// Escondido de propósito: fica fora da busca por texto invisível. Ao criar algo que nasce
// escondido por desenho (e não por animação de entrada), acrescente aqui, dizendo o porquê.
const DE_PROPOSITO = [
  '.so-leitor', // texto só para leitor de tela
  '[aria-hidden=true]', // enfeite
  'dialog:not([open])', // menu fechado
  'details:not([open]) > :not(summary)', // gaveta fechada
  '.trio-quadro:not(.ativo)', // Trio no Sobre: só a foto da vez aparece
  '.pulseira-area', // Equipe: a área aparece na estampa, ao passar o cursor
  '.pulseira-destino-nome', // Equipe, celular: o destino vira só a seta
  '.credito-foto:not(.aberto) .credito-foto-texto', // mini tag fechada: o crédito só aparece no hover/toque
].join(', ');
// Prévia que segue o cursor (Home e Agenda): se o ponteiro do Playwright cair num cartão,
// ela aparece e se mexe sozinha — não é animação de entrada; fica fora da conta de movimento.
const IGNORA_MOVIMENTO = '.espia, .espia-capa';
const TELAS = [
  { nome: 'celular', largura: 393, altura: 852, movel: true },
  { nome: 'desktop', largura: 1440, altura: 900, movel: false },
];
const JUNTAS = 4; // páginas abertas ao mesmo tempo

if (!existsSync(join(DIST, 'index.html'))) { console.log('Não achei o site gerado em dist/. Rode npm run build antes.'); process.exit(1); }

// Páginas: todo .html do build. /nao-existe confere a página de erro.
const paginas = [];
const anda = (pasta, rota) => {
  for (const nome of readdirSync(pasta)) {
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) anda(caminho, rota + '/' + nome);
    else if (nome.endsWith('.html')) {
      const semExt = nome.slice(0, -5);
      if (rota === '' && semExt === '404') paginas.push('/nao-existe');
      else if (rota === '' && semExt === 'index') paginas.push('/');
      else paginas.push(rota + '/' + semExt);
    }
  }
};
anda(DIST, '');
paginas.sort();

// Servidor do build, com a mesma regra de endereço da Cloudflare: /agenda entrega agenda.html.
const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.xml': 'application/xml', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.mp4': 'video/mp4', '.webm': 'video/webm' };
const raizDist = normalize(join(process.cwd(), DIST));
const servidor = createServer((pedido, resposta) => {
  let rota = '/';
  try { rota = decodeURIComponent(new URL(pedido.url, 'http://x').pathname); } catch { /* fica a raiz */ }
  const alvo = normalize(join(raizDist, rota));
  let arquivo = null;
  if (alvo === raizDist || alvo.startsWith(raizDist + sep)) {
    for (const c of [alvo, alvo + '.html', join(alvo, 'index.html')]) if (existsSync(c) && statSync(c).isFile()) { arquivo = c; break; }
  }
  const achou = arquivo !== null;
  if (!achou) arquivo = join(raizDist, '404.html');
  if (!existsSync(arquivo)) { resposta.writeHead(404).end(); return; }
  resposta.writeHead(achou ? 200 : 404, { 'content-type': TIPOS[extname(arquivo).toLowerCase()] ?? 'application/octet-stream' });
  resposta.end(readFileSync(arquivo));
});
await new Promise((ok) => servidor.listen(0, '127.0.0.1', ok));
const BASE = `http://127.0.0.1:${servidor.address().port}`;

// Navegador. Nas sessões na nuvem ele já vem instalado num caminho fixo.
let chromium;
try { ({ chromium } = await import('playwright')); } catch { console.log('Falta o Playwright. Rode npm install.'); process.exit(1); }
let navegador;
try { navegador = await chromium.launch(); } catch (erro) {
  const fixo = '/opt/pw-browsers/chromium';
  if (existsSync(fixo)) navegador = await chromium.launch({ executablePath: fixo });
  else { console.log('Não consegui abrir o navegador do Playwright. Rode: npx playwright install chromium\n' + String(erro.message).split('\n')[0]); process.exit(1); }
}

// Roda dentro da página, a cada parada da rolagem.
const olha = async ({ deProposito, ignoraMovimento }) => {
  const achados = [];
  const nomeDe = (e) => (e.tagName.toLowerCase() + '.' + (typeof e.className === 'string' ? e.className : '').trim().split(/\s+/).slice(0, 2).join('.')).replace(/\.$/, '').slice(0, 50);
  const naTela = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight; };
  // Espera as imagens à vista, para o carregamento delas não parecer movimento.
  const imagens = [...document.images].filter((i) => naTela(i) && !i.complete);
  await Promise.race([Promise.all(imagens.map((i) => new Promise((ok) => { i.addEventListener('load', ok, { once: true }); i.addEventListener('error', ok, { once: true }); }))), new Promise((ok) => setTimeout(ok, 3000))]);
  // 1. Animação por tempo em curso.
  for (const a of document.getAnimations()) {
    if (a.playState !== 'running') continue;
    if (a.timeline && a.timeline.constructor.name !== 'DocumentTimeline') continue;
    const nome = a.animationName || a.transitionProperty || 'feita por script';
    if (/^(color|background-color|border.*color|outline-color|text-decoration-color|fill|stroke|--)/.test(nome)) continue;
    const alvo = a.effect && a.effect.target;
    if (alvo && typeof alvo.closest === 'function' && alvo.closest(ignoraMovimento)) continue;
    achados.push(`animação em curso (${nome}) em ${alvo ? nomeDe(alvo) : '?'}`);
  }
  // 2. Entrada ou eco que não chegou ao estado final.
  for (const e of document.querySelectorAll('[data-anima], .ecoa, .eco')) {
    if (!naTela(e) || e.closest(deProposito)) continue;
    const s = getComputedStyle(e);
    if (Number(s.opacity) < 0.99) achados.push(`entrada escondida (opacidade ${s.opacity}): ${nomeDe(e)}`);
    if (e.hasAttribute('data-anima')) {
      if (s.clipPath !== 'none' && !/^inset\((0(px|%)?\s*){1,4}\)$/.test(s.clipPath)) achados.push(`entrada recortada (${s.clipPath}): ${nomeDe(e)}`);
      if (s.transform !== 'none' && s.transform !== 'matrix(1, 0, 0, 1, 0, 0)') achados.push(`entrada deslocada (${s.transform}): ${nomeDe(e)}`);
    }
    if (e.classList.contains('ecoa') && s.getPropertyValue('--ab').trim() !== '1') achados.push(`eco de título fechado (--ab ${s.getPropertyValue('--ab').trim() || 'vazio'}): "${e.textContent.trim().slice(0, 24)}"`);
  }
  // 3. Texto na tela com opacidade zero.
  const passeio = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let no; (no = passeio.nextNode());) {
    if (!no.textContent.trim()) continue;
    const el = no.parentElement;
    if (!el || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(el.tagName) || !naTela(el) || el.closest(deProposito)) continue;
    let opacidade = 1;
    for (let a = el; a; a = a.parentElement) opacidade *= Number(getComputedStyle(a).opacity);
    if (opacidade < 0.05) achados.push(`texto invisível: "${no.textContent.trim().slice(0, 30)}" em ${nomeDe(el)}`);
  }
  // 4. Alguma coisa muda de lugar com a página parada?
  const retrato = [...document.querySelectorAll('body *')].filter((e) => naTela(e) && !e.closest(ignoraMovimento)).slice(0, 1500).map((e) => { const r = e.getBoundingClientRect(); return [e, r.left, r.top, r.width]; });
  await new Promise((ok) => setTimeout(ok, 450));
  for (const [e, esquerda, topo, largura] of retrato) {
    const r = e.getBoundingClientRect();
    if (Math.abs(r.left - esquerda) > 0.6 || Math.abs(r.top - topo) > 0.6 || Math.abs(r.width - largura) > 0.6) achados.push(`mexe com a página parada: ${nomeDe(e)}`);
  }
  return achados;
};

const visita = async (contexto, tela, rota) => {
  const pagina = await contexto.newPage();
  const achados = new Set();
  pagina.on('pageerror', (e) => achados.add('erro de script: ' + e.message));
  try {
    await pagina.goto(BASE + rota, { waitUntil: 'load' });
    await pagina.evaluate(() => document.fonts.ready);
    await pagina.waitForTimeout(250);
    const altura = await pagina.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < altura; y += tela.altura * 0.85) {
      await pagina.evaluate((yy) => scrollTo(0, yy), y);
      await pagina.waitForTimeout(160);
      for (const a of await pagina.evaluate(olha, { deProposito: DE_PROPOSITO, ignoraMovimento: IGNORA_MOVIMENTO })) achados.add(a);
    }
  } catch (erro) {
    achados.add('a página não abriu até o fim: ' + String(erro.message).split('\n')[0]);
  }
  await pagina.close();
  return achados;
};

const problemas = [];
for (const tela of TELAS) {
  const contexto = await navegador.newContext({ viewport: { width: tela.largura, height: tela.altura }, isMobile: tela.movel, hasTouch: tela.movel, reducedMotion: 'reduce' });
  const fila = [...paginas];
  await Promise.all(Array.from({ length: JUNTAS }, async () => {
    for (let rota; (rota = fila.shift()) !== undefined;) {
      const primeira = await visita(contexto, tela, rota);
      if (primeira.size === 0) continue;
      const segunda = await visita(contexto, tela, rota);
      const repetidos = [...primeira].filter((a) => segunda.has(a));
      if (repetidos.length) problemas.push({ onde: `${rota} (${tela.nome})`, achados: repetidos });
    }
  }));
  await contexto.close();
}
await navegador.close();
servidor.close();

if (problemas.length === 0) {
  console.log(`Movimento reduzido em ordem: ${paginas.length} páginas, em celular e desktop, sem nada escondido nem em movimento.`);
  process.exit(0);
}
problemas.sort((a, b) => a.onde.localeCompare(b.onde));
console.log(`Com movimento reduzido, ${problemas.length} página(s) com problema:`);
for (const p of problemas) {
  console.log('  ' + p.onde);
  for (const a of p.achados.slice(0, 12)) console.log('    - ' + a);
  if (p.achados.length > 12) console.log(`    - e mais ${p.achados.length - 12}`);
}
console.log('Se algo acima fica escondido de propósito, acrescente à lista DE_PROPOSITO em scripts/confere-calmo.mjs.');
process.exit(1);
