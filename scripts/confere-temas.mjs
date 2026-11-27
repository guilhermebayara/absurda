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
import { coresDoTema, dois, medidasDoTema, temas } from './cores-temas.mjs';

// Temas das páginas de pessoa, quando existe um build.
const dePessoa = [];
// Páginas de projeto com foto também levam as cores da foto: entram na mesma conferência.
for (const pasta of ['equipe', 'projetos']) {
  if (!existsSync('dist/' + pasta)) continue;
  for (const arq of readdirSync('dist/' + pasta).filter((a) => a.endsWith('.html'))) {
    // A página de pessoa sorteia um tema entre os da lista data-temas: todos precisam passar.
    const lista = readFileSync('dist/' + pasta + '/' + arq, 'utf8').match(/data-temas="([^"]+)"/)?.[1].split(';') ?? [];
    lista.forEach((t, i) => {
      const m = t.match(/^(#[0-9a-fA-F]{3,6})\|(#[0-9a-fA-F]{3,6})\|(#[0-9a-fA-F]{3,6})$/);
      if (m) dePessoa.push({ fundo: m[1], texto: m[2], destaque: m[3], nome: `página /${pasta}/${arq.replace('.html', '')} (tema ${i + 1})` });
    });
  }
}

const problemas = [];
for (const t of [...temas, ...dePessoa]) {
  try {
    for (const { cor, superficie, razao, minimo, confere } of medidasDoTema(coresDoTema(t))) {
      if (confere && razao < minimo) problemas.push(`${t.nome}: ${cor} sobre ${superficie} com ${dois(razao)}:1 (mínimo ${dois(minimo)}:1)`);
    }
  } catch (erro) {
    problemas.push(`${t.nome}: ${erro.message}`);
  }
}

if (problemas.length === 0) {
  console.log(`Cores em ordem: ${temas.length} temas${dePessoa.length ? ` e ${dePessoa.length} temas de páginas de pessoa e de projeto` : ''} com texto legível, destaque visível e subtema vivo com leitura.`);
  process.exit(0);
}
console.log(`${problemas.length} problema(s) de contraste (temas de src/lib/temas.ts${dePessoa.length ? ' e páginas de pessoa' : ''}):`);
for (const p of problemas) console.log('  - ' + p);
process.exit(1);
