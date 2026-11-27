// A página é um catálogo público pelo endereço direto, com exemplos inventados.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { relative, join } from 'node:path';

const dist = 'dist';
const problemas = [];
const ler = (arquivo) => readFileSync(arquivo, 'utf8');
const listarHtml = (pasta) => readdirSync(pasta, { withFileTypes: true }).flatMap((item) => {
  const arquivo = join(pasta, item.name);
  if (item.isDirectory()) return listarHtml(arquivo);
  return item.name.endsWith('.html') ? [arquivo] : [];
});
const rota = (nome) => '/' + relative(dist, nome).replace(/(?:^|\/)index\.html$/, '').replace(/\.html$/, '');
const endereco = (href, base = '/') => {
  try { return new URL(href, 'https://festaabsurda.com' + base); }
  catch { return null; }
};
const noCamarim = (href, base) => {
  const url = endereco(href, base);
  return url && /(^|\.)festaabsurda\.com$/.test(url.hostname)
    && /^\/camarim(?:[/.]|$)/.test(decodeURIComponent(url.pathname));
};
const atributo = (tag, nome) => tag.match(new RegExp(`\\s${nome}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'))?.slice(1).find((valor) => valor !== undefined);
const normaliza = (texto) => texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const entidades = (texto) => texto.replace(/&(?:#(x[\da-f]+|\d+)|(nbsp|amp|quot|apos|lt|gt|dollar));/gi, (_, numero, nome) => {
  if (numero) {
    const codigo = numero[0].toLowerCase() === 'x' ? parseInt(numero.slice(1), 16) : Number(numero);
    return codigo <= 0x10ffff ? String.fromCodePoint(codigo) : ' ';
  }
  return { nbsp: ' ', amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', dollar: '$' }[nome.toLowerCase()];
});

if (!existsSync(join(dist, 'camarim.html'))) {
  console.error('Falta /camarim no build. Rode npm run build.');
  process.exit(1);
}

const mapa = ler(join(dist, 'sitemap.xml'));
for (const [, href] of mapa.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)) {
  if (noCamarim(href)) problemas.push('O Camarim entrou no sitemap.');
}

const logos = readdirSync('notas/camarim/logo').filter((nome) => nome.endsWith('.svg'));
const downloads = logos.flatMap((nome) => [nome, nome.replace('.svg', '-1000.png'), nome.replace('.svg', '-3000.png')]);
for (const nome of logos) {
  const original = readFileSync(join('notas/camarim/logo', nome));
  for (const pasta of ['public/marca', 'dist/marca']) {
    const arquivo = join(pasta, nome);
    if (!existsSync(arquivo) || !original.equals(readFileSync(arquivo))) problemas.push(`SVG ausente ou diferente do oficial em ${arquivo}.`);
  }
}

const nomes = [
  ...readdirSync('src/content/pessoas').filter((nome) => nome.endsWith('.md'))
    .map((nome) => ler(join('src/content/pessoas', nome)).match(/^nome:\s*["']?([^"\r\n]+?)["']?\s*$/m)?.[1]),
  ...JSON.parse(ler('src/data/wig.json')).elenco.map((pessoa) => pessoa.nome),
].filter(Boolean).map(normaliza);

for (const arquivo of listarHtml(dist)) {
  const html = ler(arquivo);
  const caminho = rota(arquivo);
  const links = [...html.matchAll(/<a\b[^>]*>/gi)].map(([tag]) => tag);
  if (!noCamarim(caminho)) {
    if (links.some((link) => noCamarim(entidades(atributo(link, 'href') ?? ''), caminho))) problemas.push(`${caminho} tem link para o Camarim.`);
    continue;
  }

  const metas = html.match(/<meta\b[^>]*>/gi) ?? [];
  if (!metas.some((tag) => atributo(tag, 'name')?.toLowerCase() === 'robots'
      && atributo(tag, 'content')?.split(/[\s,]+/).includes('noindex'))) problemas.push(`${caminho} precisa de noindex.`);

  const publico = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ');
  const texto = entidades(publico.replace(/<[^>]+>/g, ' '));
  const rotulos = [...publico.matchAll(/\s(?:alt|title|aria-label)="([^"]+)"/gi)].map(([, valor]) => entidades(valor)).join(' ');
  const corpus = ` ${normaliza(texto + ' ' + rotulos)} `;
  if (nomes.some((nome) => corpus.includes(` ${nome} `))) problemas.push(`${caminho} contém nome de pessoa cadastrada no site.`);
  if (/R\$\s*\d|\b\d[\d.,]*\s+rea(?:l|is)\b/i.test(texto + ' ' + rotulos)) problemas.push(`${caminho} contém valor em reais.`);
  if (/\bdata-(?:privad[oa]|private)\b|\bdata-visibilidade=["']privad[oa]["']/i.test(html)) problemas.push(`${caminho} contém uma marca de conteúdo privado.`);

  const baixaveis = links.filter((tag) => /\sdownload(?:[\s=>]|$)/i.test(tag)).map((tag) => atributo(tag, 'href'));
  for (const href of baixaveis) {
    if (!href?.startsWith('/marca/') || !existsSync(join(dist, href))) problemas.push(`${caminho} aponta para um download ausente.`);
  }
  if (caminho === '/camarim') {
    for (const nome of downloads) {
      if (!baixaveis.includes('/marca/' + nome)) problemas.push(`Falta o download de ${nome}.`);
    }
  }
}

if (problemas.length) {
  console.error(problemas.join('\n'));
  process.exit(1);
}
console.log(`Camarim em ordem: página fora do índice, ${logos.length} SVGs oficiais e ${downloads.length} downloads.`);
