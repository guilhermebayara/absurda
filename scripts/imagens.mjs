// Integração do Astro: cria as versões menores das fotos depois que o site é montado.
// Ver src/lib/imagens.ts. Lê todo HTML do dist, acha os endereços /img/<largura>/... e /img/og/...,
// e gera cada arquivo a partir da foto original em public/. Guarda as versões num cache
// (node_modules/.astro/absurda-imagens) para o build seguinte não refazer tudo. A pasta fica dentro
// de node_modules/.astro de propósito (leveza, 23 nov 2026): é a única que o cache de build da
// Cloudflare guarda entre builds de um site Astro. Fora dela, todo build lá refazia as ~300 versões.
// Nunca escreve em public/: public/arquivo/ (histórico) continua intocado.
//
// Com SEM_FOTOS=1 a integração não gera nada. É o build do robô da agenda no GitHub Actions
// (atualiza-agenda.yml), que só precisa do arquivo-pendente.json e joga o site fora.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const PUBLICO = path.resolve('public');
const CACHE = path.resolve('node_modules/.astro/absurda-imagens');
const LIMITE_OG = 300 * 1024;
const PADRAO = /\/img\/(\d+|og)(\/[^"'\s,)?#]+?)\.(webp|jpg)/g;

function htmls(dir) {
  const saida = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) saida.push(...htmls(p));
    else if (e.name.endsWith('.html')) saida.push(p);
  }
  return saida;
}

function original(semExt) {
  for (const ext of ['.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG']) {
    const f = path.join(PUBLICO, semExt + ext);
    if (fs.existsSync(f)) return f;
  }
}

async function gerar(tipo, semExt, destino) {
  const fonte = original(semExt);
  if (!fonte) throw new Error(`imagens: sem original em public/ para ${semExt}`);
  const est = fs.statSync(fonte);
  const chave = crypto.createHash('sha1').update(`${tipo}|${semExt}|${est.size}|${est.mtimeMs}|v1`).digest('hex');
  const emCache = path.join(CACHE, chave + path.extname(destino));
  if (!fs.existsSync(emCache)) {
    let dados;
    if (tipo === 'og') {
      // Prévia de compartilhamento: JPEG, até 1200 px de largura, menos de 300 KB.
      for (const q of [82, 76, 70, 62, 54, 46]) {
        dados = await sharp(fonte).rotate().resize({ width: 1200, withoutEnlargement: true }).jpeg({ quality: q, mozjpeg: true }).toBuffer();
        if (dados.length < LIMITE_OG) break;
      }
    } else {
      dados = await sharp(fonte).rotate().resize({ width: Number(tipo), withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
    }
    fs.mkdirSync(CACHE, { recursive: true });
    fs.writeFileSync(emCache, dados);
  }
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.copyFileSync(emCache, destino);
}

export default function imagens() {
  return {
    name: 'absurda-imagens',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        if (process.env.SEM_FOTOS === '1') {
          logger.info('SEM_FOTOS=1: versões de fotos não geradas');
          return;
        }
        const dist = fileURLToPath(dir);
        const pedidos = new Map();
        for (const f of htmls(dist)) {
          for (const m of fs.readFileSync(f, 'utf8').matchAll(PADRAO)) {
            const [url, tipo, semExt] = m;
            pedidos.set(url, { tipo, semExt: decodeURI(semExt) });
          }
        }
        const inicio = Date.now();
        const lista = [...pedidos];
        // Algumas de cada vez: o sharp já usa vários núcleos por foto.
        for (let i = 0; i < lista.length; i += 8) {
          await Promise.all(lista.slice(i, i + 8).map(([url, p]) => gerar(p.tipo, p.semExt, path.join(dist, decodeURI(url)))));
        }
        logger.info(`${lista.length} versões de fotos em ${((Date.now() - inicio) / 1000).toFixed(1)}s`);
      },
    },
  };
}
