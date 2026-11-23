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
//
// Leveza (23 nov 2026): a maior versão é um WebP na largura da própria foto; capas do Shotgun ganham
// srcset pelo endereço do Cloudinary; "ate2x" pede as fotos como num celular de 2x (Projetos, Equipe
// e Sobre, escolha do Gui); "caixa" corrige o sizes de foto recortada numa caixa mais estreita.
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

// Capa que vem do Shotgun (Cloudinary): a largura está no próprio endereço (w_1280). O Cloudinary
// entrega a mesma capa em outras larguras trocando esse número, sem aumentar além do original
// (c_limit). Leveza, 23 nov 2026: antes os cartões baixavam a de 1280 px para caixas de 260 a 360 px.
const SHOTGUN = /^https:\/\/assets\.shotgun\.live\/.*\bw_(\d+)/;
const LARGURAS_SHOTGUN = [400, 800, 1280];
const naLargura = (url: string, largura: number) => url.replace(/\bw_\d+/, `w_${largura}`);

// Endereço de uma versão: /img/<largura>/<caminho sem extensão>.webp
export const versao = (src: string, largura: number) => `/img/${largura}${src.replace(/\.[a-z]+$/i, '')}.webp`;

// Celular a 2x (escolha do Gui, 23 nov 2026, em Projetos, Equipe e Sobre). O navegador escolhe a
// versão pela conta "sizes x densidade da tela". Num iPhone (3x) isso pede fotos 50% mais largas
// que num celular de 2x. Para pedir como um celular de 2x, cada medida do sizes ganha, antes dela,
// a mesma medida encolhida nas telas de 2,5x ou mais: 2/3 a 3x (dá 2x) e 0,8 a 2,5x (dá 2x).
// A foto ocupa o mesmo espaço; só a versão baixada é menor.
function ate2x(sizes: string) {
  return sizes
    .split(/,(?![^(]*\))/)
    .map((parte) => parte.trim())
    .flatMap((parte) => {
      const m = parte.match(/^(\(.*\))\s+(\S.*)$/);
      const condicao = m ? `${m[1]} and ` : '';
      const medida = m ? m[2] : parte;
      return [`${condicao}(min-resolution: 3dppx) calc(${medida} * 0.667)`, `${condicao}(min-resolution: 2.5dppx) calc(${medida} * 0.8)`, parte];
    })
    .join(', ');
}

// Foto recortada (object-fit: cover) numa caixa mais estreita que ela, como capa deitada num
// quadrado: a parte que aparece é só o meio, e a foto inteira precisa de mais pixels que a largura da
// caixa. Cada medida do sizes é multiplicada pela razão entre a proporção da foto e a da caixa.
function recortada(sizes: string, fator: number) {
  if (fator <= 1.05) return sizes;
  const f = Math.round(fator * 100) / 100;
  return sizes
    .split(/,(?![^(]*\))/)
    .map((parte) => {
      const m = parte.trim().match(/^(\(.*\))\s+(\S.*)$/);
      return m ? `${m[1]} calc(${m[2]} * ${f})` : `calc(${parte.trim()} * ${f})`;
    })
    .join(', ');
}

interface Opcoes {
  /** Pede as fotos como num celular de 2x, mesmo numa tela de 3x (ver ate2x). */
  ate2x?: boolean;
  /** Proporção (largura / altura) da caixa onde a foto aparece recortada com object-fit: cover. */
  caixa?: number;
}

/**
 * Atributos de <img> com as versões menores.
 * `sizes` diz quanto a foto ocupa na tela (como no atributo HTML). Sem ele, a foto é tratada como
 * de tela inteira, o que ainda poupa no celular.
 */
export function foto(src: string | undefined, sizes = '100vw', opcoes: Opcoes = {}) {
  const remota = src?.match(SHOTGUN);
  if (src && remota) {
    const maior = Number(remota[1]);
    const larguras = [...new Set([...LARGURAS_SHOTGUN.filter((l) => l < maior), maior])];
    if (larguras.length < 2) return { src };
    return { src, srcset: larguras.map((l) => `${naLargura(src, l)} ${l}w`).join(', '), sizes: opcoes.ate2x ? ate2x(sizes) : sizes };
  }
  if (!local(src)) return { src };
  const m = medir(src);
  if (!m) return { src };
  // A versão na largura da própria foto é WebP também (leveza, 23 nov 2026): quando a conta pede
  // mais que a maior versão, o navegador ia para o JPG original, uns 30% mais pesado.
  const larguras = [...LARGURAS.filter((l) => l < m.largura * 0.9), m.largura];
  const srcset = larguras.map((l) => `${versao(src, l)} ${l}w`).join(', ');
  const cortada = opcoes.caixa ? recortada(sizes, m.largura / m.altura / opcoes.caixa) : sizes;
  return { src, srcset, sizes: opcoes.ate2x ? ate2x(cortada) : cortada, width: m.largura, height: m.altura };
}

// Prévia de compartilhamento (og:image): JPEG de até 1200 px de largura e menos de 300 KB, o limite do
// WhatsApp. O arquivo é /img/og/<caminho>.jpg, gerado pela mesma integração.
export const compartilhar = (src: string): string => (local(src) ? `/img/og${src.replace(/\.[a-z]+$/i, '')}.jpg` : src);
