// Resumo da última busca de eventos, para conferir se as integrações estão funcionando.
// Não contém tokens.
//
// Traz também a lista do histórico (id, data e marca de cada evento arquivado, e as capas), que
// o build seguinte baixa da produção para conferir que nada sumiu ou mudou
// (scripts/guarda-producao.mjs), e o resultado da guarda neste build.
import { existsSync, readFileSync } from 'node:fs';
import { getEventos, estado } from '../lib/eventos';
import { listaDoHistorico } from '../../scripts/historico.mjs';

export async function GET() {
  await getEventos();
  const guarda = existsSync('.guarda-producao.json') ? JSON.parse(readFileSync('.guarda-producao.json', 'utf8')) : null;
  const historico = { commit: process.env.WORKERS_CI_COMMIT_SHA || null, ...listaDoHistorico() };
  return new Response(JSON.stringify({ ...estado, guarda, historico }, null, 2), { headers: { 'Content-Type': 'application/json' } });
}
