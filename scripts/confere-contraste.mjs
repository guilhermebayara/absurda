// Conferência do contraste do texto como ele aparece na página (QA de produção, 22 nov 2026).
//
// O confere:temas confere os pares de cor de cada tema, mas não vê o que a página faz com eles:
// texto com opacidade, color-mix, superfície de outra variável, adesivo sobre foto. Foi assim que o
// ano dos Lugares Improváveis (destaque com texto na cor do fundo) ficou em 3,76:1. Esta conferência
// abre cada página do build num navegador, aplica cada tema que a página pode sortear e mede todo
// texto visível contra o fundo sólido que está atrás dele, com a opacidade de cada camada.
//
// A regra (do Gui, CLAUDE.md, "Regra de contraste"): texto que se lê, 4,5:1. Texto grande (24 px,
// ou 18,66 px em negrito, como no WCAG) pode ficar em 3:1: é o que o site já faz quando usa
// --destaque em título grande e --destaque-texto só no texto pequeno. Texto grande entre 3:1 e
// 4,5:1 sai como aviso, sem falhar, para o Gui ver. Enfeite (lista ENFEITE) precisa de 3:1.
//
// Que temas entram: cada texto é medido com os temas que podem estar na página quando ele aparece.
// Dentro de um trecho de tema fixo (data-tema="#...|#...|#..."), só o dele; num trecho de paleta
// fechada (data-tema-lista), os da lista; num trecho "sorteio", a lista que a página sorteia; fora de
// trecho (topo, rodapé), todos. Os cartazes de Projetos (data-cores) são medidos com cada opção deles.
// Texto sobre foto ou degradê não tem um fundo só: fica fora da conta (a regra ali é o desenho).
//
// Uso (depois de npm run build):  npm run confere:contraste
// Precisa do navegador do Playwright. Na primeira vez:  npx playwright install chromium
import { createServer } from 'node:http';
import { existsSync, readdirSync, statSync, createReadStream } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';

const DIST = 'dist';
const LEITURA = 4.5;
const GRANDE = 3;
const VISIVEL = 3;
// Texto usado como enfeite: precisa só continuar visível (3:1). Não "corrija" o contraste deles.
const ENFEITE = [
  '.pessoa-barra', // barra inclinada entre período e número, nas páginas de pessoa
  '.parede', // parede de palavras da Home
  '[class*="barra"]', // barras inclinadas do site
];
// Fora da conta, com o motivo. Item novo aqui só com decisão do Gui.
const FORA = [
  '.so-leitor', // só para leitor de tela
  '.mineirao-palavra', // Sobre: "Mineirão" gigante, marca-d'água com opacidade 0,3 (relatado ao Gui em 22/11)
  '.lineup', // Sobre: letreiro de endereços, mesmo desenho da parede da Home
];
const TELAS = [
  { nome: 'celular', largura: 393, altura: 852 },
  { nome: 'desktop', largura: 1440, altura: 900 },
];
const JUNTAS = 4;

if (!existsSync(join(DIST, 'index.html'))) { console.log('Não achei o site gerado em dist/. Rode npm run build antes.'); process.exit(1); }

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

const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const raizDist = normalize(join(process.cwd(), DIST));
const servidor = createServer((pedido, resposta) => {
  let rota = '/';
  try { rota = decodeURIComponent(new URL(pedido.url, 'http://x').pathname); } catch { /* fica a raiz */ }
  const alvo = normalize(join(raizDist, rota));
  let arquivo = null;
  if (alvo === raizDist || alvo.startsWith(raizDist + sep)) {
    for (const c of [alvo + '.html', alvo, join(alvo, 'index.html')]) if (existsSync(c) && statSync(c).isFile()) { arquivo = c; break; }
  }
  const achou = arquivo !== null;
  if (!achou) arquivo = join(raizDist, '404.html');
  resposta.writeHead(achou ? 200 : 404, { 'content-type': TIPOS[extname(arquivo).toLowerCase()] ?? 'application/octet-stream' });
  createReadStream(arquivo).pipe(resposta);
});
await new Promise((ok) => servidor.listen(0, ok));
const porta = servidor.address().port;

let chromium;
try { ({ chromium } = await import('playwright')); } catch { console.log('Falta o Playwright: npm install'); process.exit(1); }
let navegador;
try { navegador = await chromium.launch(); } catch (e) { console.log('Não consegui abrir o Chromium. Na primeira vez: npx playwright install chromium\n' + e.message); process.exit(1); }

// Roda dentro da página: mede cada texto com os temas que valem para ele.
function medir({ enfeite, fora }) {
  const tela = document.createElement('canvas').getContext('2d');
  const rgba = (c) => {
    tela.fillStyle = '#000'; tela.fillStyle = c; const v = tela.fillStyle;
    if (v.startsWith('#')) return [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16)).concat(1);
    const n = v.match(/[\d.]+/g).map(Number); return [n[0], n[1], n[2], n[3] ?? 1];
  };
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const luz = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  const sobre = (a, b) => [0, 1, 2].map((i) => a[i] * a[3] + b[i] * (1 - a[3])).concat(1);
  const raiz = document.documentElement;
  // Sem transição: a cor tem de chegar ao fim na hora em que o tema muda (o menu leva 0,2 s, por exemplo).
  const parada = document.createElement('style');
  parada.textContent = '*, *::before, *::after { transition: none !important; }';
  document.head.append(parada);
  const textos = [...document.querySelectorAll('body *')].filter((e) => !e.closest(fora) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));

  // Qual lista de temas vale para cada texto.
  const sorteio = window.__sorteio ?? [];
  const fixos = [...document.querySelectorAll('[data-tema]')].map((t) => t.dataset.temaLista ? t.dataset.temaLista.split(';') : t.dataset.tema === 'sorteio' ? sorteio : [t.dataset.tema]).flat();
  const todos = [...new Set([...sorteio, ...fixos])].filter((t) => /^#\w+\|#\w+\|#\w+$/.test(t));
  const temasDe = (e) => {
    const t = e.closest('[data-tema]');
    if (!t) return todos;
    if (t.dataset.temaLista) return t.dataset.temaLista.split(';');
    return t.dataset.tema === 'sorteio' ? sorteio : [t.dataset.tema];
  };
  const aplicar = (tema) => {
    const [f, t, d] = tema.split('|');
    raiz.style.setProperty('--fundo', f); raiz.style.setProperty('--texto', t); raiz.style.setProperty('--destaque', d);
    window.__derivadas?.(f, t, d);
  };
  const medirUm = (e) => {
    const r = e.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return null;
    const cs = getComputedStyle(e);
    if (cs.visibility !== 'visible') return null;
    let opacidade = 1;
    const camadas = [];
    for (let x = e; x; x = x.parentElement) {
      const s = getComputedStyle(x);
      opacidade *= Number(s.opacity);
      if (s.backgroundImage !== 'none' && !s.backgroundImage.startsWith('url(')) return { foto: true };
      // Foto ou vídeo atrás do texto, dentro do mesmo bloco: sem fundo único.
      const midia = [...x.querySelectorAll('img, video, picture')].find((m) => !m.contains(e) && !e.contains(m) && (() => { const q = m.getBoundingClientRect(); return q.width > 0 && q.left < r.right && q.right > r.left && q.top < r.bottom && q.bottom > r.top; })());
      if (midia) return { foto: true };
      const c = rgba(s.backgroundColor);
      if (c[3] > 0) { camadas.push(c); if (c[3] >= 1) break; }
      // Camada de fundo posicionada atrás do texto, irmã do caminho (o fundo do destaque da Home,
      // por exemplo): conta como o fundo deste nível.
      const sobreposta = (q) => q.width > 0 && q.left <= r.left && q.right >= r.right && q.top <= r.top && q.bottom >= r.bottom;
      const atras = [...(x.parentElement?.children ?? [])].find((irma) => irma !== x && !irma.contains(e) && ['absolute', 'fixed'].includes(getComputedStyle(irma).position) && sobreposta(irma.getBoundingClientRect()) && rgba(getComputedStyle(irma).backgroundColor)[3] >= 1);
      if (atras) { camadas.push(rgba(getComputedStyle(atras).backgroundColor)); break; }
    }
    if (opacidade === 0) return null;
    if (!camadas.length || camadas[camadas.length - 1][3] < 1) camadas.push(rgba(getComputedStyle(raiz).backgroundColor).slice(0, 3).concat(1));
    let fundo = camadas.pop();
    while (camadas.length) fundo = sobre(camadas.pop(), fundo);
    // Letra vazada (só contorno, como na parede da Home): vale a cor do contorno.
    const contorno = parseFloat(cs.webkitTextStrokeWidth) > 0;
    const c = rgba(contorno && rgba(cs.color)[3] === 0 ? cs.webkitTextStrokeColor : cs.color);
    const cor = sobre([c[0], c[1], c[2], c[3] * opacidade], fundo);
    const a = luz(cor), b = luz(fundo);
    const tam = parseFloat(cs.fontSize), peso = Number(cs.fontWeight) || 400;
    return { razao: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05), grande: tam >= 24 || (tam >= 18.66 && peso >= 700), enfeite: !!e.closest(enfeite) };
  };
  const nome = (e) => {
    const cl = (x) => (typeof x.className === 'string' ? x.className.split(/\s+/).filter((c) => c && !c.startsWith('astro')).slice(0, 2).join('.') : '');
    const pai = e.parentElement?.closest('[class]');
    return `${pai ? cl(pai) + ' > ' : ''}${e.tagName.toLowerCase()}${cl(e) ? '.' + cl(e) : ''}`;
  };

  const piores = new Map();
  const anotar = (e, m, tema) => {
    if (!m || m.foto) return;
    const k = nome(e) + ' "' + e.textContent.trim().slice(0, 28) + '"';
    const atual = piores.get(k);
    if (!atual || m.razao < atual.razao) piores.set(k, { ...m, tema });
  };
  const original = ['--fundo', '--texto', '--destaque'].map((v) => raiz.style.getPropertyValue(v));
  for (const tema of todos) {
    aplicar(tema);
    for (const e of textos) if (temasDe(e).includes(tema)) anotar(e, medirUm(e), tema);
  }
  aplicar(original.join('|'));
  // Cartazes de Projetos: cada um sorteia as cores dele.
  for (const cartaz of document.querySelectorAll('[data-cores]')) {
    const antes = ['--f', '--t', '--d'].map((v) => cartaz.style.getPropertyValue(v));
    for (const tema of cartaz.dataset.cores.split(';').filter(Boolean)) {
      const [f, t, d] = tema.split('|');
      cartaz.style.setProperty('--f', f); cartaz.style.setProperty('--t', t); cartaz.style.setProperty('--d', d);
      for (const e of textos) if (cartaz.contains(e)) anotar(e, medirUm(e), 'cartaz ' + tema);
    }
    ['--f', '--t', '--d'].forEach((v, i) => cartaz.style.setProperty(v, antes[i]));
  }
  return [...piores].map(([alvo, m]) => ({ alvo, ...m }));
}

const falhas = [];
const avisos = [];
const fila = TELAS.flatMap((t) => paginas.map((p) => ({ tela: t, p })));
async function trabalhar() {
  for (let item = fila.shift(); item; item = fila.shift()) {
    const { tela, p } = item;
    const ctx = await navegador.newContext({ viewport: { width: tela.largura, height: tela.altura }, reducedMotion: 'reduce' });
    const pg = await ctx.newPage();
    try {
      await pg.goto(`http://localhost:${porta}${p}`, { waitUntil: 'load' });
      await pg.waitForTimeout(300);
      for (const m of await pg.evaluate(medir, { enfeite: ENFEITE.join(', '), fora: FORA.join(', ') })) {
        const r = m.razao.toFixed(2).replace('.', ',');
        const onde = `${p} (${tela.nome}): ${m.alvo}, ${r}:1 com o tema ${m.tema}`;
        if (m.enfeite) { if (m.razao < VISIVEL) falhas.push(`${onde} (enfeite, mínimo 3:1)`); }
        else if (m.grande) { if (m.razao < GRANDE) falhas.push(`${onde} (texto grande, mínimo 3:1)`); else if (m.razao < LEITURA) avisos.push(onde); }
        else if (m.razao < LEITURA) falhas.push(`${onde} (texto de leitura, mínimo 4,5:1)`);
      }
    } catch (e) {
      falhas.push(`${p} (${tela.nome}): a página não abriu (${e.message.split('\n')[0]})`);
    }
    await ctx.close();
  }
}
await Promise.all(Array.from({ length: JUNTAS }, trabalhar));
await navegador.close();
servidor.close();

const unicos = (l) => [...new Set(l)].sort();
if (avisos.length) {
  console.log(`Aviso: texto grande entre 3:1 e 4,5:1 (passa, mas fica aqui para o Gui ver):`);
  for (const a of unicos(avisos)) console.log('  ' + a);
}
if (falhas.length) {
  console.log(`\nContraste abaixo da regra em ${unicos(falhas).length} ponto(s):`);
  for (const f of unicos(falhas)) console.log('  ' + f);
  process.exit(1);
}
console.log(`Contraste ok: ${paginas.length} páginas, ${TELAS.length} telas, todos os temas que cada página sorteia.`);
