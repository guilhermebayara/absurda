// Gera os ícones de toque e o manifesto a partir de public/favicon.svg (QA de produção, 22 nov 2026):
// public/favicon.ico (16 e 32 px), public/apple-touch-icon.png (180 px), public/icone-192.png,
// public/icone-512.png e public/site.webmanifest. Rode `npm run icones` quando o favicon mudar.
import fs from 'node:fs';
import sharp from 'sharp';

// Os mesmos de src/config.ts (nome e descrição) e do fundo do favicon.
const SITE_NOME = '@bsurda';
const SITE_DESCRICAO = 'Maior festa pop LGBTQIA+ de MG. Sem frescuras, desde 2009.';
const COR_FUNDO = '#711a40';

const svg = fs.readFileSync('public/favicon.svg');
const png = (lado) => sharp(svg, { density: 72 * (lado / 192.47) * 4 }).resize(lado, lado).png({ compressionLevel: 9 }).toBuffer();

// .ico com as imagens em PNG dentro (aceito por todos os navegadores atuais).
async function ico(lados) {
  const imagens = await Promise.all(lados.map(png));
  const cabeca = Buffer.alloc(6 + 16 * lados.length);
  cabeca.writeUInt16LE(0, 0); cabeca.writeUInt16LE(1, 2); cabeca.writeUInt16LE(lados.length, 4);
  let pos = cabeca.length;
  lados.forEach((l, i) => {
    const o = 6 + 16 * i;
    cabeca.writeUInt8(l >= 256 ? 0 : l, o); cabeca.writeUInt8(l >= 256 ? 0 : l, o + 1);
    cabeca.writeUInt16LE(1, o + 4); cabeca.writeUInt16LE(32, o + 6);
    cabeca.writeUInt32LE(imagens[i].length, o + 8); cabeca.writeUInt32LE(pos, o + 12);
    pos += imagens[i].length;
  });
  return Buffer.concat([cabeca, ...imagens]);
}

fs.writeFileSync('public/favicon.ico', await ico([16, 32, 48]));
fs.writeFileSync('public/apple-touch-icon.png', await png(180));
fs.writeFileSync('public/icone-192.png', await png(192));
fs.writeFileSync('public/icone-512.png', await png(512));
fs.writeFileSync('public/site.webmanifest', JSON.stringify({
  name: SITE_NOME,
  short_name: SITE_NOME,
  description: SITE_DESCRICAO,
  start_url: '/',
  display: 'browser',
  background_color: COR_FUNDO,
  theme_color: COR_FUNDO,
  icons: [
    { src: '/icone-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icone-512.png', sizes: '512x512', type: 'image/png' },
  ],
}, null, 2) + '\n');
console.log('ícones e manifesto gerados');
