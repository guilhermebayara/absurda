// Conferência das cores: todo tema de src/lib/temas.ts precisa respeitar a regra de contraste
// do site. A regra (do Gui):
//   - texto que se lê precisa de contraste de leitura: texto sobre fundo, no mínimo 4,5:1;
//   - enfeite pode ousar, mas tem de continuar visível: destaque sobre fundo, no mínimo 3:1.
// O destaque não precisa de 4,5:1: quando ele colore texto pequeno, a página usa
// --destaque-texto, que o script de src/layouts/Base.astro ajusta sozinho para 4,5:1
// (o mesmo vale para o texto secundário, --suave, e para o enfeite sobre faixas, --enfeite).
// Texto usado como enfeite (a parede de palavras da Home, por exemplo) fica com o destaque puro.
//
// Uso:  npm run confere:temas
import { readFileSync } from 'node:fs';

const LEITURA = 4.5;
const VISIVEL = 3;
const fonte = readFileSync('src/lib/temas.ts', 'utf8');
const temas = [...fonte.matchAll(/\{\s*fundo:\s*'(#[0-9a-fA-F]{3,6})',\s*texto:\s*'(#[0-9a-fA-F]{3,6})',\s*destaque:\s*'(#[0-9a-fA-F]{3,6})'\s*\},?\s*(?:\/\/\s*(.*))?/g)]
  .map(([, fundo, texto, destaque, nome]) => ({ fundo, texto, destaque, nome: nome?.trim() || `${fundo} / ${texto}` }));
if (temas.length === 0) { console.log('Não consegui ler nenhum tema em src/lib/temas.ts. O formato mudou?'); process.exit(1); }

const canais = (hex) => { let h = hex.slice(1); if (h.length === 3) h = [...h].map((c) => c + c).join(''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const linear = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const luz = (hex) => { const [r, g, b] = canais(hex).map(linear); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const razao = (a, b) => { const x = luz(a), y = luz(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const dois = (n) => n.toFixed(2).replace('.', ',');

const problemas = [];
for (const t of temas) {
  const leitura = razao(t.texto, t.fundo);
  const visivel = razao(t.destaque, t.fundo);
  if (leitura < LEITURA) problemas.push(`${t.nome}: texto sobre fundo com ${dois(leitura)}:1 (mínimo ${dois(LEITURA)}:1)`);
  if (visivel < VISIVEL) problemas.push(`${t.nome}: destaque sobre fundo com ${dois(visivel)}:1 (mínimo ${dois(VISIVEL)}:1 para continuar visível)`);
}

if (problemas.length === 0) {
  console.log(`Cores em ordem: ${temas.length} temas com texto legível e destaque visível.`);
  process.exit(0);
}
console.log(`${problemas.length} problema(s) de contraste em src/lib/temas.ts:`);
for (const p of problemas) console.log('  - ' + p);
process.exit(1);
