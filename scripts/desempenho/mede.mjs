// Auditoria de leveza (Sessão J, 23 nov 2026): ponto de entrada das medições. Não entra no build,
// nas conferências nem no confere-site.yml. Serve para a sessão de correção medir o depois do mesmo
// jeito que a auditoria mediu o antes (notas/leveza-auditoria.md).
//
//   npm run mede:leveza -- build                     etapas do npm run build, sem e com cache das fotos
//   npm run mede:leveza -- builds [dias]             builds da Cloudflare e rodadas do Actions (precisa do gh)
//   npm run mede:leveza -- paginas [base|local] [rotas]   peso, fotos e cobertura (Playwright)
//   npm run mede:leveza -- aparelho [base|local] [rotas]  LCP, CLS, TBT, animações, quadros e camadas
//   npm run mede:leveza -- cache [base]              cabeçalhos de cache e navegação entre páginas
//   npm run mede:leveza -- tudo                      todas, na produção (build e builds incluídos)
//
// "base" é um endereço (padrão https://festaabsurda.com); "local" serve o dist/ como a Cloudflare
// serve (rode o build antes; com WORKERS_CI_BRANCH=tst-x o dist traz os eventos de exemplo).
// "rotas" é uma lista separada por vírgula, por exemplo /,/agenda. Os resultados completos vão para
// <tmp>/absurda-leveza/*.json; as tabelas saem no terminal. LEVEZA_DPR_CELULAR=2 mede o celular a 2x.
import { spawnSync } from 'node:child_process';

const SCRIPTS = { build: 'etapas-build.mjs', builds: 'builds.mjs', paginas: 'paginas.mjs', aparelho: 'aparelho.mjs', cache: 'cache.mjs' };
const [qual = 'tudo', ...resto] = process.argv.slice(2);
const lista = qual === 'tudo' ? Object.keys(SCRIPTS) : [qual];
for (const q of lista) {
  if (!SCRIPTS[q]) { console.error(`Medição desconhecida: ${q}. Use ${Object.keys(SCRIPTS).join(', ')} ou tudo.`); process.exit(1); }
  console.log(`\n=== ${q}`);
  const r = spawnSync('node', [`scripts/desempenho/${SCRIPTS[q]}`, ...(qual === 'tudo' ? [] : resto)], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
