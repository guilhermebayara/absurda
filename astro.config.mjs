import { defineConfig } from 'astro/config';

// Endereço definitivo do site.
export default defineConfig({
  site: 'https://festaabsurda.com',
  // Endereços sem barra no fim (/agenda, e não /agenda/), como os links do site já são
  // escritos. Cada página vira um arquivo (agenda.html), que a Cloudflare serve direto em
  // /agenda. Com pastas (agenda/index.html), todo clique no menu passava por um redirecionamento.
  trailingSlash: 'never',
  build: { format: 'file' },
});
