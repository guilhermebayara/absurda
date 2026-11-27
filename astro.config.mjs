import { defineConfig } from 'astro/config';
// Versões menores das fotos, criadas no fim do build (ver src/lib/imagens.ts).
import imagens from './scripts/imagens.mjs';
import logosCamarim from './scripts/logos-camarim.mjs';
// Cache de um ano para cada arquivo de /_astro/, escrito no dist/_headers (ver o script).
import cabecalhos from './scripts/cabecalhos.mjs';

// Endereço definitivo do site.
export default defineConfig({
  site: 'https://festaabsurda.com',
  // Endereços sem barra no fim (/agenda, e não /agenda/), como os links do site já são
  // escritos. Cada página vira um arquivo (agenda.html), que a Cloudflare serve direto em
  // /agenda. Com pastas (agenda/index.html), todo clique no menu passava por um redirecionamento.
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [imagens(), logosCamarim(), cabecalhos()],
});
