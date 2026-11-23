// Peças comuns da auditoria de leveza (Sessão J, 23 nov 2026). Não entram no build.
import http from 'node:http';
import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export const PAGINAS = [
  ['Home', '/'],
  ['Agenda', '/agenda'],
  ['Sobre', '/sobre'],
  ['Projetos', '/projetos'],
  ['Projeto @bsurda (71 fotos)', '/projetos/absurda'],
  ['WIG', '/projetos/wig'],
  ['Equipe', '/equipe'],
  ['Pessoa (Charlotte)', '/equipe/charlotte'],
  ['Parcerias', '/parcerias'],
  ['Contato', '/contato'],
];

// LEVEZA_DPR_CELULAR troca a densidade do celular (padrão 3, a do iPhone), para medir o outro lado de um trade-off.
export const TELAS = {
  celular: { viewport: { width: 390, height: 844 }, deviceScaleFactor: Number(process.env.LEVEZA_DPR_CELULAR || 3), isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};

export const PASTA = path.join(os.tmpdir(), 'absurda-leveza');
export const grava = (nome, dados) => {
  fs.mkdirSync(PASTA, { recursive: true });
  const f = path.join(PASTA, nome);
  fs.writeFileSync(f, JSON.stringify(dados, null, 2));
  return f;
};

// Serve uma pasta como a Cloudflare serve o site: "/agenda" acha "agenda.html", 404.html no que não
// existe, cabeçalhos de public/_headers (só Cache-Control) e compressão gzip no texto.
export function servidor(pasta = 'dist', porta = 4321) {
  const regras = [];
  try {
    let atual;
    for (const linha of fs.readFileSync(path.join(pasta, '_headers'), 'utf8').split('\n')) {
      if (/^\S/.test(linha) && !linha.startsWith('#')) regras.push((atual = { padrao: linha.trim(), cab: {} }));
      else if (atual && /^\s+[\w-]+:/.test(linha)) { const [k, ...v] = linha.trim().split(':'); atual.cab[k] = v.join(':').trim(); }
    }
  } catch {}
  const tipos = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain' };
  const s = http.createServer((req, res) => {
    let u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let f = path.join(pasta, u);
    if (u.endsWith('/')) f = path.join(f, 'index.html');
    // /projetos acha projetos.html mesmo com a pasta projetos/ ao lado (antes dava 404).
    else if ((!fs.existsSync(f) || fs.statSync(f).isDirectory()) && fs.existsSync(f + '.html')) f += '.html';
    let status = 200;
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { f = path.join(pasta, '404.html'); status = 404; }
    const ext = path.extname(f);
    const cab = { 'content-type': tipos[ext] || 'application/octet-stream', 'cache-control': 'public, max-age=0, must-revalidate' };
    for (const r of regras) {
      const re = new RegExp('^' + r.padrao.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
      if (re.test(u) && r.cab['Cache-Control']) cab['cache-control'] = r.cab['Cache-Control'];
    }
    let corpo = fs.readFileSync(f);
    if (/text|json|svg|xml|javascript|manifest/.test(cab['content-type']) && /gzip/.test(req.headers['accept-encoding'] || '')) {
      corpo = zlib.gzipSync(corpo);
      cab['content-encoding'] = 'gzip';
    }
    res.writeHead(status, cab);
    res.end(corpo);
  });
  return new Promise((ok) => s.listen(porta, () => ok({ base: `http://localhost:${porta}`, fecha: () => s.close() })));
}

export function tipoDe(mime = '', url = '', recurso = '') {
  if (/html/.test(mime)) return 'HTML';
  if (/css/.test(mime)) return 'CSS';
  if (/javascript|ecmascript/.test(mime)) return 'JS';
  if (/font|woff/.test(mime) || /\.woff2?$/.test(url)) return 'fontes';
  if (/^image\//.test(mime)) return 'imagens';
  return 'outros';
}

export async function rolaAteOFim(page, passo = 500, pausa = 120) {
  await page.evaluate(async ({ passo, pausa }) => {
    const espera = (ms) => new Promise((r) => setTimeout(r, ms));
    for (let y = 0; y < document.documentElement.scrollHeight; y += passo) {
      window.scrollTo(0, y);
      await espera(pausa);
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await espera(400);
  }, { passo, pausa });
}

export const kb = (b) => (b / 1024).toFixed(b < 10240 ? 1 : 0);
