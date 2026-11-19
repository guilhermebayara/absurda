// Lista dos eventos que já passaram e ainda dependem de uma plataforma: os que o
// robô de arquivo (scripts/arquivar.mjs) precisa copiar para dentro do site.
// Só traz o que já é público na Agenda.
import { getEventos } from '../lib/eventos';

export async function GET() {
  const { passados } = await getEventos();
  const pendentes = passados
    .filter((e) => !e.exemplo && e.nomeBruto && (e.origem === 'shotgun' || e.origem === 'sympla'))
    .map((e) => ({ id: e.id, nome: e.nomeBruto, data: e.data, url: e.url, origem: e.origem, local: e.local, capa: e.capa }));
  return new Response(JSON.stringify(pendentes, null, 2), { headers: { 'Content-Type': 'application/json' } });
}
