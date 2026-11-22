// Gera a imagem padrão de compartilhamento (public/compartilhar.png): a marca da @bsurda sobre a cor
// do site, 1200 x 630, menos de 300 KB (Gui, 22 nov 2026). Vale para a Home e para toda página sem
// foto própria (ver imagem em src/layouts/Base.astro). Rode `npm run compartilhar` quando a marca
// ou o tema mudarem. A marca sai de src/components/marca/Completo.astro, para não haver duas cópias.
import fs from 'node:fs';
import sharp from 'sharp';

// Primeiro tema do site (vinho com laranja), o mesmo par do favicon. A marca usa o destaque, que
// nesse par passa do contraste de leitura (conferido abaixo).
const FUNDO = '#5a1235';
const MARCA = '#ffa500';
const [L, A] = [1200, 630];
const SAIDA = 'public/compartilhar.png';

const fonte = fs.readFileSync('src/components/marca/Completo.astro', 'utf8');
const desenho = fonte.slice(fonte.indexOf('>', fonte.indexOf('<svg')) + 1, fonte.lastIndexOf('</svg>')).trim();
const [vw, vh] = fonte.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).slice(1).map(Number);

// A marca ocupa 74% da largura, no meio.
const largura = L * 0.74;
const escala = largura / vw;
const x = (L - largura) / 2;
const y = (A - vh * escala) / 2;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${A}" viewBox="0 0 ${L} ${A}">
  <rect width="${L}" height="${A}" fill="${FUNDO}"/>
  <g transform="translate(${x} ${y}) scale(${escala})" fill="${MARCA}">${desenho}</g>
</svg>`;

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const [a, b] = [lum(FUNDO), lum(MARCA)].sort((m, n) => n - m);
const contraste = (a + 0.05) / (b + 0.05);
if (contraste < 4.5) throw new Error(`contraste da marca ${contraste.toFixed(2)}:1, abaixo de 4,5:1`);

const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true }).toBuffer();
if (png.length >= 300 * 1024) throw new Error(`imagem com ${Math.round(png.length / 1024)} KB, acima de 300 KB`);
fs.writeFileSync(SAIDA, png);
console.log(`${SAIDA}: ${L} x ${A}, ${Math.round(png.length / 1024)} KB, contraste ${contraste.toFixed(2)}:1`);
