// Conferência dos links: depois do build, nenhum link interno, âncora ou imagem do próprio
// site pode apontar para algo que não existe.
//
// Uso:  npm run build && npm run confere:links
//
// Olha só o que mora no site (endereços que começam com "/" ou "#"). Link externo não entra:
// Shotgun, Pixieset e as redes recusam visita automática, então esses se conferem no clique.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
if (!existsSync(DIST)) { console.log('Não achei a pasta dist. Rode "npm run build" antes.'); process.exit(1); }

const paginas = [];
const varre = (pasta) => { for (const nome of readdirSync(pasta)) { const c = join(pasta, nome); if (statSync(c).isDirectory()) varre(c); else if (nome.endsWith('.html')) paginas.push(c); } };
varre(DIST);

// O site é publicado com cada página num arquivo (agenda.html servido em /agenda).
const arquivoDe = (caminho) => {
  const limpo = decodeURIComponent(caminho);
  for (const tentativa of [limpo, `${limpo}.html`, join(limpo, 'index.html')]) {
    const c = join(DIST, tentativa);
    if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return null;
};
const lidas = new Map();
const ler = (arquivo) => { if (!lidas.has(arquivo)) lidas.set(arquivo, readFileSync(arquivo, 'utf8')); return lidas.get(arquivo); };
const temId = (html, id) => new RegExp(`\\sid=["']${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`).test(html);

const problemas = new Map();
const anota = (pagina, texto) => problemas.set(texto, [...(problemas.get(texto) ?? []), pagina]);
let conferidos = 0;

for (const pagina of paginas) {
  const html = ler(pagina);
  const nome = pagina.slice(DIST.length);
  const alvos = [
    ...[...html.matchAll(/<a\b[^>]*?\shref=["']([^"']*)["']/g)].map((m) => ['link', m[1]]),
    ...[...html.matchAll(/<(?:img|source|script|video|audio)\b[^>]*?\ssrc=["']([^"']*)["']/g)].map((m) => ['arquivo', m[1]]),
    ...[...html.matchAll(/<link\b[^>]*?\shref=["']([^"']*)["']/g)].map((m) => ['arquivo', m[1]]),
    ...[...html.matchAll(/\sdata-espia=["']([^"']+)["']/g)].map((m) => ['capa', m[1]]),
  ];
  for (const [tipo, bruto] of alvos) {
    const alvo = bruto.replace(/&amp;/g, '&');
    if (tipo === 'link' && alvo === '') { anota(nome, 'link sem endereço (href vazio)'); continue; }
    if (!alvo.startsWith('/') && !alvo.startsWith('#')) continue; // externo, mailto, dados embutidos
    if (alvo.startsWith('//')) continue;
    conferidos++;
    const [caminho, ancora] = alvo.split('?')[0].split('#');
    const destino = caminho === '' ? pagina : arquivoDe(caminho);
    if (!destino) { anota(nome, `${tipo} sem destino: ${alvo}`); continue; }
    if (ancora && destino.endsWith('.html') && !temId(ler(destino), ancora)) anota(nome, `âncora sem alvo: ${alvo}`);
  }
}

if (problemas.size === 0) {
  console.log(`Links íntegros: ${conferidos} endereços internos conferidos em ${paginas.length} páginas.`);
  process.exit(0);
}
console.log(`${problemas.size} endereço(s) interno(s) com problema:`);
for (const [texto, onde] of problemas) console.log(`  - ${texto}  (em ${[...new Set(onde)].slice(0, 3).join(', ')}${new Set(onde).size > 3 ? ` e mais ${new Set(onde).size - 3}` : ''})`);
process.exit(1);
