// Mapa do site para os buscadores: todas as páginas públicas, com o endereço oficial.
// Página nova em src/pages precisa entrar na lista "fixas"; pessoas e projetos entram sozinhos.
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

const fixas = ['/', '/agenda', '/projetos', '/sobre', '/equipe', '/parcerias', '/contato', '/listas'];

export async function GET({ site }: APIContext) {
  const projetos = (await getCollection('projetos')).map((p) => `/projetos/${p.id}`);
  const pessoas = (await getCollection('pessoas')).map((p) => `/equipe/${p.id}`);
  const enderecos = [...fixas, ...projetos, ...pessoas].map((caminho) => new URL(caminho, site).href);
  const corpo = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${enderecos.map((e) => `  <url><loc>${e}</loc></url>`).join('\n')}\n</urlset>\n`;
  return new Response(corpo, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
