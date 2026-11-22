// Guarda da produção, no build da Cloudflare (decisão do Gui, 20 nov 2026; ver CLAUDE.md,
// "Histórico de eventos" e "Conferências do site").
//
// Roda antes do "astro build", dentro de "npm run build". Baixa o /estado.json da produção
// (https://festaabsurda.com), que traz a lista do histórico publicada (scripts/historico.mjs),
// e compara com o histórico desta cópia:
//   - evento de lá que sumiu ou mudou aqui, ou capa de lá que sumiu aqui, é problema;
//   - na main e na homologação (WORKERS_CI_BRANCH ou CF_PAGES_BRANCH), problema falha o build, e a
//     Cloudflare não publica;
//   - em tst-..., qa-... e na máquina, só avisa.
// Na homologação, evento que falta e é mais novo que todos os desta cópia não trava: é a branch
// atrás da produção (o robô da agenda escreveu na main depois), e não um evento apagado. Avisa
// para trazer a main. Na main isso não existe, e lá tudo trava.
//
// Mudança pedida de propósito: a marca [arquivo-editado] na mensagem do commit (lida pelo git do
// próprio build, quando o clone da Cloudflare traz o histórico) ou a variável ARQUIVO_EDITADO=1 no
// painel da Cloudflare (Settings > Build > Variables), ligada só para esse build e desligada depois.
//
// Sem rede, com a produção fora do ar ou com o /estado.json sem a lista, a guarda avisa e não
// trava: não pode impedir uma correção de emergência. O confere:arquivo pelo git continua para a
// máquina e para o alarme da main.
//
// GUARDA_REFERENCIA troca a referência (endereço ou arquivo local de um estado.json), para testes.
// O resultado vai para .guarda-producao.json, que o /estado.json publica no campo "guarda".
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { listaDoHistorico } from './historico.mjs';

const PRODUCAO = 'https://festaabsurda.com/estado.json';
const TRAVADAS = ['main', 'design', 'homologa']; // a homologação, com o nome de hoje e o de amanhã
const MARCA = '[arquivo-editado]';
const SAIDA = '.guarda-producao.json';

const branch = (process.env.WORKERS_CI_BRANCH || process.env.CF_PAGES_BRANCH || '').trim();
const trava = TRAVADAS.includes(branch);
const naMain = branch === 'main';
const referencia = (process.env.GUARDA_REFERENCIA || '').trim() || PRODUCAO;

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 16 * 1024 * 1024 }).trim();
const tenta = (f) => { try { return f(); } catch { return undefined; } };

const resultado = {
  quando: new Date().toISOString(),
  branch: branch || null,
  modo: trava ? 'trava' : 'aviso',
  referencia: referencia === PRODUCAO ? 'produção' : 'outra (teste)',
  git: {
    historico: tenta(() => git('rev-parse', '--is-inside-work-tree')) === 'true',
    raso: tenta(() => git('rev-parse', '--is-shallow-repository')) === 'true',
    commits: Number(tenta(() => git('rev-list', '--count', 'HEAD')) ?? 0),
  },
};
const termina = (situacao, codigo, linhas = []) => {
  resultado.situacao = situacao;
  writeFileSync(SAIDA, JSON.stringify(resultado, null, 2) + '\n');
  for (const l of linhas) console.log(l);
  process.exit(codigo);
};
const titulo = `Guarda da produção (${branch || 'sem variável de branch'}, ${trava ? 'trava' : 'só avisa'})`;

// 1. A lista que está no ar.
let noAr;
try {
  if (/^https?:/.test(referencia)) {
    const resposta = await fetch(`${referencia}?guarda=${Date.now()}`, { cache: 'no-store', signal: AbortSignal.timeout(20000) });
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    noAr = await resposta.json();
  } else {
    noAr = JSON.parse(readFileSync(referencia, 'utf8'));
  }
} catch (erro) {
  termina('sem-referencia', 0, [`${titulo}: não consegui ler ${referencia} (${erro.message}). AVISO: histórico não conferido; o build segue.`]);
}
const lista = noAr?.historico;
if (!Array.isArray(lista?.eventos) || !Array.isArray(lista?.capas)) {
  termina('sem-referencia', 0, [`${titulo}: o estado.json de referência ainda não traz a lista do histórico. AVISO: histórico não conferido; o build segue.`]);
}
resultado.commitNoAr = lista.commit || null;

// 2. A comparação.
const aqui = listaDoHistorico();
const daqui = new Map(aqui.eventos.map((e) => [e.id, e]));
const capasDaqui = new Set(aqui.capas);
const maisNovoDaqui = aqui.eventos.reduce((max, e) => (e.data > max ? e.data : max), '');
const problemas = [];
const atras = [];
const idsAtras = new Set();
for (const antigo of lista.eventos) {
  const atual = daqui.get(antigo.id);
  if (!atual) {
    if (!naMain && antigo.data > maisNovoDaqui) { atras.push(`${antigo.id} (${antigo.data.slice(0, 10)})`); idsAtras.add(antigo.id); continue; }
    problemas.push(`faltando: ${antigo.id} (${antigo.data.slice(0, 10)})`);
  } else if (atual.marca !== antigo.marca) {
    problemas.push(`alterado: ${antigo.id} (${antigo.data.slice(0, 10)})`);
  }
}
for (const capa of lista.capas) {
  if (capasDaqui.has(capa)) continue;
  if (idsAtras.has(capa.replace(/(-p)?\.\w+$/, ''))) continue;
  problemas.push(`capa apagada: public/arquivo/${capa}`);
}
resultado.comparados = lista.eventos.length;
resultado.capas = lista.capas.length;
const linhas = [];
if (atras.length > 0) {
  resultado.atras = atras;
  linhas.push(`${titulo}: AVISO: esta branch está atrás da produção em ${atras.length} evento(s) novo(s): ${atras.join(', ')}. Traga a main (git merge origin/main).`);
}
if (problemas.length === 0) {
  termina('ok', 0, [...linhas, `${titulo}: histórico íntegro (${lista.eventos.length - atras.length} eventos e ${lista.capas.length} capas do ar conferidos; ${aqui.eventos.length} eventos aqui).`]);
}
resultado.problemas = problemas.slice(0, 30);
linhas.push(`${titulo}: o histórico desta cópia difere do que está no ar em ${problemas.length} ponto(s):`);
for (const p of problemas.slice(0, 40)) linhas.push('  - ' + p);
if (problemas.length > 40) linhas.push(`  ... e mais ${problemas.length - 40}.`);

// 3. Mudança declarada?
let declarado = '';
if (process.env.ARQUIVO_EDITADO === '1') declarado = 'variável ARQUIVO_EDITADO=1';
if (!declarado && resultado.git.historico) {
  // Do commit que está no ar até aqui, quando o clone tem esse trecho; senão, só o commit deste build.
  const temONoAr = lista.commit && tenta(() => git('cat-file', '-e', `${lista.commit}^{commit}`)) !== undefined;
  const mensagens = tenta(() => (temONoAr ? git('log', '--format=%B%x00', `${lista.commit}..HEAD`) : git('log', '-1', '--format=%B'))) || '';
  if (mensagens.includes(MARCA)) declarado = `marca ${MARCA} ${temONoAr ? 'num commit desde o que está no ar' : 'no commit deste build'}`;
}
if (declarado) {
  resultado.declarado = declarado;
  termina('declarado', 0, [...linhas, `Mudança declarada como intencional (${declarado}). Seguindo.`]);
}
if (!trava) termina('aviso', 0, [...linhas, `AVISO: em "${branch || 'máquina'}" a guarda só avisa. Na main e na homologação este build falharia.`]);
termina('falha', 1, [
  ...linhas,
  '',
  'Build interrompido: a Cloudflare não publica. Se faltam eventos, traga a main para esta branch.',
  `Se a mudança foi pedida de propósito, escreva ${MARCA} na mensagem do commit, com o que mudou e quem pediu,`,
  'ou ligue ARQUIVO_EDITADO=1 nas variáveis de build da Cloudflare para este build (e desligue depois).',
]);
