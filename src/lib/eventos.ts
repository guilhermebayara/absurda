import manuais from '../data/eventos-manual.json';

// Formato único de evento, seja qual for a plataforma de origem.
export interface Evento {
  id: string;
  nome: string;
  data: string; // ISO 8601
  local?: string;
  capa?: string;
  url: string;
  origem: 'shotgun' | 'sympla' | 'manual';
}

// Cada fonte devolve eventos já convertidos para o formato acima.
// Shotgun e Sympla entram aqui quando os tokens existirem
// (variáveis SHOTGUN_TOKEN, SHOTGUN_ORGANIZER_ID e SYMPLA_TOKEN na Cloudflare).
async function fonteShotgun(): Promise<Evento[]> {
  return [];
}

async function fonteSympla(): Promise<Evento[]> {
  return [];
}

async function fonteManual(): Promise<Evento[]> {
  return manuais as Evento[];
}

export async function getEventos() {
  const fontes = await Promise.all([fonteShotgun(), fonteSympla(), fonteManual()]);
  const todos = fontes.flat().sort((a, b) => a.data.localeCompare(b.data));
  const agora = new Date().toISOString();
  return {
    proximos: todos.filter((e) => e.data >= agora),
    passados: todos.filter((e) => e.data < agora).reverse(),
  };
}

export function formatarData(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(iso));
}
