// Conferência das atrações do Sobre: depois do build, todo nome de src/data/atracoes.json
// precisa aparecer na página montada, e quem tem "riscado" ou "em memória" precisa levar a marca.
//
// Uso:  npm run build && npm run confere:atracoes
import { readFileSync, existsSync } from 'node:fs';

const PAGINA = 'dist/sobre.html';
if (!existsSync(PAGINA)) { console.log('Não achei dist/sobre.html. Rode "npm run build" antes.'); process.exit(1); }
const html = readFileSync(PAGINA, 'utf8');
const dados = JSON.parse(readFileSync('src/data/atracoes.json', 'utf8'));
const escapa = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const tem = (s) => html.includes(s) || html.includes(escapa(s));

const faltas = [];
for (const [grupo, lista] of Object.entries(dados)) {
  for (const a of lista) {
    if (!tem(a.nome)) { faltas.push(`${grupo}: "${a.nome}" não aparece no Sobre.`); continue; }
    if (a.riscado && !new RegExp(`<s[^>]*>${escapa(a.nome).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</s>`).test(html) && !html.includes(`<s>${a.nome}</s>`)) faltas.push(`${grupo}: "${a.nome}" devia estar riscado.`);
  }
}
const memorias = [...dados.quemTrouxemos, ...dados.cena].filter((a) => a.memoria).length;
if (memorias && (html.match(/<sup[^>]*>em memória<\/sup>/g) ?? []).length < memorias) faltas.push(`Faltam marcas "em memória" na página (esperadas ${memorias}).`);

if (faltas.length) { console.error('Atrações do Sobre fora de sincronia:\n- ' + faltas.join('\n- ')); process.exit(1); }
console.log(`Atrações do Sobre: ${dados.quemTrouxemos.length + dados.cena.length} nomes conferidos na página.`);
