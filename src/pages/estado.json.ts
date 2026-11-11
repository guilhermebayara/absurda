// Resumo da última busca de eventos, para conferir se as integrações estão funcionando.
// Não contém tokens.
import { getEventos, estado } from '../lib/eventos';

export async function GET() {
  await getEventos();
  return new Response(JSON.stringify(estado, null, 2), { headers: { 'Content-Type': 'application/json' } });
}
