// Tamanhos menores das fotos, gerados no build (QA de produção, 22 nov 2026).
//
// As fotos ficam em public/ no tamanho em que chegaram (1200 a 2000 px) e aparecem no site com 90 a
// 340 px. Este ajudante devolve, para uma foto de public/, os atributos de <img> com versões menores
// (srcset), largura e altura. Os arquivos das versões não existem no repositório: a integração de
// scripts/imagens.mjs lê o site montado, acha cada endereço /img/... e cria o arquivo com o sharp.
// Recorte e aparência não mudam: a versão é a mesma foto, só com menos pixels, e o CSS que recorta
// (object-fit, object-position) continua o mesmo.
//
// Nunca mexa em public/arquivo/ (histórico): as capas de lá também ganham versões, mas só no dist.
import fs from 'node:fs';
import path from 'node:path';

// Larguras das versões. A foto original entra no srcset também, com a largura dela.
const LARGURAS = [320, 480, 720, 960, 1280];
const PUBLICO = path.resolve('public');

// Medidas lidas do cabeçalho do arquivo, sem abrir a foto inteira (JPEG e PNG). Síncrono para dar
// para usar direto no markup: <img {...foto(src, '20rem')} />. Todas as fotos do site são JPEG sem
// rotação no EXIF (conferido em 22 nov 2026); foto girada sairia com largura e altura trocadas.
const medidas = new Map<string, { largura: number; altura: number } | undefined>();
function lerMedidas(arquivo: string) {
  const b = fs.readFileSync(arquivo);
  if (b[0] === 0x89 && b.toString('ascii', 1, 4) === 'PNG') return { largura: b.readUInt32BE(16), altura: b.readUInt32BE(20) };
  if (b[0] !== 0xff || b[1] !== 0xd8) return undefined;
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const marca = b[i + 1];
    // SOF0 a SOF15, menos DHT (C4), JPG (C8) e DAC (CC): é onde ficam as medidas.
    if (marca >= 0xc0 && marca <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marca)) return { altura: b.readUInt16BE(i + 5), largura: b.readUInt16BE(i + 7) };
    if (marca === 0xd8 || marca === 0x01 || (marca >= 0xd0 && marca <= 0xd7)) { i += 2; continue; }
    i += 2 + b.readUInt16BE(i + 2);
  }
  return undefined;
}
function medir(src: string) {
  if (!medidas.has(src)) {
    let m;
    try { m = lerMedidas(path.join(PUBLICO, decodeURI(src))); } catch { m = undefined; }
    medidas.set(src, m);
  }
  return medidas.get(src);
}

// Só foto local de public/ (começa com /, sem //) e em formato que o sharp lê.
const local = (src?: string): src is string => !!src && /^\/(?!\/)[^?#]+\.(jpe?g|png)$/i.test(src);

// Endereço de uma versão: /img/<largura>/<caminho sem extensão>.webp
export const versao = (src: string, largura: number) => `/img/${largura}${src.replace(/\.[a-z]+$/i, '')}.webp`;

/**
 * Atributos de <img> com as versões menores.
 * `sizes` diz quanto a foto ocupa na tela (como no atributo HTML). Sem ele, a foto é tratada como
 * de tela inteira, o que ainda poupa no celular.
 */
export function foto(src: string | undefined, sizes = '100vw') {
  if (!local(src)) return { src };
  const m = medir(src);
  if (!m) return { src };
  const larguras = LARGURAS.filter((l) => l < m.largura * 0.9);
  if (!larguras.length) return { src, width: m.largura, height: m.altura };
  const srcset = [...larguras.map((l) => `${versao(src, l)} ${l}w`), `${src} ${m.largura}w`].join(', ');
  return { src, srcset, sizes, width: m.largura, height: m.altura };
}

// Prévia de compartilhamento (og:image): JPEG de até 1200 px de largura e menos de 300 KB, o limite do
// WhatsApp. O arquivo é /img/og/<caminho>.jpg, gerado pela mesma integração.
export const compartilhar = (src: string): string => (local(src) ? `/img/og${src.replace(/\.[a-z]+$/i, '')}.jpg` : src);
