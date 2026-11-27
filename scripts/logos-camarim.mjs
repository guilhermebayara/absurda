// Downloads transparentes, gerados dos SVGs oficiais sem rasterizar a prévia da página.
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, rename, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const CACHE = 'node_modules/.astro/absurda-logos';
const TAMANHOS = [1000, 3000];

export default function logosCamarim() {
  return {
    name: 'absurda-logos',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const inicio = performance.now();
        const pasta = join(fileURLToPath(dir), 'marca');
        const arquivos = (await readdir(pasta)).filter((nome) => nome.endsWith('.svg')).sort();
        await mkdir(CACHE, { recursive: true });
        let bytes = 0;
        let gerados = 0;
        for (const nome of arquivos) {
          const svg = await readFile(join(pasta, nome));
          const base = nome.slice(0, -4);
          for (const tamanho of TAMANHOS) {
            const chave = createHash('sha256').update(`png-v1|${sharp.versions.vips}|${base}|${tamanho}|`).update(svg).digest('hex');
            const cache = join(CACHE, chave + '.png');
            const destino = join(pasta, `${base}-${tamanho}.png`);
            if (!(await stat(cache).catch((erro) => {
              if (erro.code !== 'ENOENT') throw erro;
            }))) {
              // Renderiza o vetor direto na largura final, sem ampliar um bitmap intermediário.
              const ajustado = svg.toString('utf8').replace(/<svg\b/, `<svg width="${tamanho}"`);
              const png = await sharp(Buffer.from(ajustado)).png().toBuffer();
              const temporario = cache + '.' + process.pid;
              await writeFile(temporario, png);
              await rename(temporario, cache);
              gerados++;
            }
            await copyFile(cache, destino);
            bytes += (await stat(destino)).size;
          }
        }
        logger.info(`${arquivos.length * TAMANHOS.length} PNGs, ${gerados} gerados, ${bytes} bytes em ${((performance.now() - inicio) / 1000).toFixed(3)} s`);
      },
    },
  };
}
