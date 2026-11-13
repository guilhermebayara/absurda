// Conferência das cores: todo tema de src/lib/temas.ts precisa respeitar a regra de contraste
// do site. A regra (do Gui):
//   - texto que se lê precisa de contraste de leitura: texto sobre fundo, no mínimo 4,5:1;
//   - enfeite pode ousar, mas tem de continuar visível: destaque sobre fundo, no mínimo 3:1.
// O destaque não precisa de 4,5:1: quando ele colore texto pequeno, a página usa
// --destaque-texto, que o script de src/layouts/Base.astro ajusta sozinho para 4,5:1
// (o mesmo vale para o texto secundário, --suave, e para o enfeite sobre faixas, --enfeite).
// Texto usado como enfeite (a parede de palavras da Home, por exemplo) fica com o destaque puro.
//
// Confere também as cores que a página calcula a partir de cada tema, com a própria conta do
// script de src/layouts/Base.astro (o trecho entre as marcas ">>> conta das cores" e "<<< conta
// das cores" é executado aqui, então a conferência nunca diverge da página):
//   - subtema "vivo" (crachá de produção, pulseira, bloco de marca): --sobre-vivo sobre --vivo
//     com leitura (4,5:1) e --vivo-detalhe sobre --vivo visível (3:1);
//   - --destaque-texto e --suave sobre o fundo, com leitura (4,5:1);
//   - --enfeite sobre a superfície invertida (a cor do texto), visível (3:1).
// Depois de um build, entram também os temas que só existem nas páginas geradas e levam crachá:
// os das páginas de pessoa, tirados da foto de cada uma (dist/equipe/*.html).
//
// Uso:  npm run confere:temas
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

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

// A conta da página: o trecho marcado do script de Base.astro, executado com uma página de
// mentira que só guarda as variáveis que ele escreve.
const base = readFileSync('src/layouts/Base.astro', 'utf8');
const trecho = base.match(/\/\/ >>> conta das cores[\s\S]*?\/\/ <<< conta das cores/);
if (!trecho) { console.log('Não achei em src/layouts/Base.astro o trecho entre as marcas ">>> conta das cores" e "<<< conta das cores". Sem ele não dá para conferir as cores calculadas.'); process.exit(1); }
const escritas = {};
const pagina = { window: {}, document: { documentElement: { style: { setProperty: (nome, valor) => { escritas[nome] = valor; } } } } };
try { vm.runInNewContext(trecho[0], pagina); } catch (e) { console.log('O trecho da conta das cores de Base.astro não rodou sozinho: ' + e.message); process.exit(1); }
if (typeof pagina.window.__derivadas !== 'function') { console.log('O trecho da conta das cores de Base.astro não define mais window.__derivadas.'); process.exit(1); }
const derivadas = (t) => { for (const k of Object.keys(escritas)) delete escritas[k]; pagina.window.__derivadas(t.fundo, t.texto, t.destaque); return { ...escritas }; };
// As cores calculadas chegam como "#rrggbb" ou "rgb(r,g,b)".
const cor = (c) => { const m = String(c).match(/^rgba?\(([^)]+)\)/); return m ? '#' + m[1].split(/[ ,/]+/).slice(0, 3).map((v) => Math.round(Number(v)).toString(16).padStart(2, '0')).join('') : c; };

// Temas das páginas de pessoa, quando existe um build.
const dePessoa = [];
if (existsSync('dist/equipe')) {
  for (const arq of readdirSync('dist/equipe').filter((a) => a.endsWith('.html'))) {
    // A página de pessoa sorteia um tema entre os da lista data-temas: todos precisam passar.
    const lista = readFileSync('dist/equipe/' + arq, 'utf8').match(/data-temas="([^"]+)"/)?.[1].split(';') ?? [];
    lista.forEach((t, i) => {
      const m = t.match(/^(#[0-9a-fA-F]{3,6})\|(#[0-9a-fA-F]{3,6})\|(#[0-9a-fA-F]{3,6})$/);
      if (m) dePessoa.push({ fundo: m[1], texto: m[2], destaque: m[3], nome: `página /equipe/${arq.replace('.html', '')} (tema ${i + 1})` });
    });
  }
}

const problemas = [];
for (const t of [...temas, ...dePessoa]) {
  const medidas = [
    ['texto sobre fundo', razao(t.texto, t.fundo), LEITURA],
    ['destaque sobre fundo', razao(t.destaque, t.fundo), VISIVEL],
  ];
  const d = derivadas(t);
  const faltam = ['--vivo', '--sobre-vivo', '--vivo-detalhe', '--destaque-texto', '--suave', '--enfeite'].filter((k) => !d[k]);
  if (faltam.length) { problemas.push(`${t.nome}: a conta de Base.astro não calculou ${faltam.join(', ')}`); continue; }
  medidas.push(
    ['texto sobre o vivo (crachá de produção, pulseira)', razao(cor(d['--sobre-vivo']), cor(d['--vivo'])), LEITURA],
    ['detalhe sobre o vivo', razao(cor(d['--vivo-detalhe']), cor(d['--vivo'])), VISIVEL],
    ['destaque em texto pequeno (--destaque-texto) sobre fundo', razao(cor(d['--destaque-texto']), t.fundo), LEITURA],
    ['texto secundário (--suave) sobre fundo', razao(cor(d['--suave']), t.fundo), LEITURA],
    ['enfeite sobre a superfície invertida', razao(cor(d['--enfeite']), t.texto), VISIVEL],
  );
  for (const [oQue, valor, minimo] of medidas) if (valor < minimo) problemas.push(`${t.nome}: ${oQue} com ${dois(valor)}:1 (mínimo ${dois(minimo)}:1)`);
}

if (problemas.length === 0) {
  console.log(`Cores em ordem: ${temas.length} temas${dePessoa.length ? ` e ${dePessoa.length} temas de páginas de pessoa` : ''} com texto legível, destaque visível e subtema vivo com leitura.`);
  process.exit(0);
}
console.log(`${problemas.length} problema(s) de contraste (temas de src/lib/temas.ts${dePessoa.length ? ' e páginas de pessoa' : ''}):`);
for (const p of problemas) console.log('  - ' + p);
process.exit(1);
