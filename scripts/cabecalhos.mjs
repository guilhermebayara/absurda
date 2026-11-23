// Integração do Astro: escreve no dist/_headers o cache longo dos arquivos de /_astro/, um por um
// (leveza, 23 nov 2026).
//
// Os arquivos de /_astro/ (CSS, scripts, fontes) têm o conteúdo no nome, então o navegador pode
// guardar cada um por um ano. A regra era "/_astro/*", e a Cloudflare aplica o _headers também à
// resposta de erro: um endereço de /_astro/ que ainda não existia ficava guardado como 404 por um
// ano no navegador que pediu. Com uma regra por arquivo que existe, o 404 fica com o cabeçalho
// padrão (sem cache). O _headers aceita até 100 regras; se um dia passar de LIMITE arquivos, volta a
// regra geral, com aviso no build.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const LIMITE = 80;
const CACHE = '  Cache-Control: public, max-age=31536000, immutable';

export default function cabecalhos() {
  return {
    name: 'absurda-cabecalhos',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const dist = fileURLToPath(dir);
        const arquivo = path.join(dist, '_headers');
        const pasta = path.join(dist, '_astro');
        const nomes = fs.existsSync(pasta) ? fs.readdirSync(pasta).filter((n) => fs.statSync(path.join(pasta, n)).isFile()).sort() : [];
        let regras;
        if (nomes.length > LIMITE) {
          logger.warn(`${nomes.length} arquivos em /_astro/, mais que ${LIMITE}: volta a regra geral /_astro/* (o 404 de lá também fica guardado por um ano)`);
          regras = ['/_astro/*', CACHE];
        } else {
          regras = nomes.flatMap((n) => [`/_astro/${n}`, CACHE]);
        }
        const texto = fs.existsSync(arquivo) ? fs.readFileSync(arquivo, 'utf8') : '';
        fs.writeFileSync(arquivo, `${texto.trimEnd()}\n\n# Escrito no build por scripts/cabecalhos.mjs: um por arquivo de /_astro/.\n${regras.join('\n')}\n`);
        logger.info(`_headers: cache de um ano para ${nomes.length} arquivos de /_astro/`);
      },
    },
  };
}
