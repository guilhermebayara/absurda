import manuais from '../data/eventos-manual.json';
import { TEMAS_DA_MARCA, type Tema } from './temas';

// Formato único de evento, seja qual for a plataforma de origem.
export interface Evento {
  id: string;
  nome: string;
  data: string; // ISO 8601
  local?: string;
  capa?: string;
  url: string;
  origem: 'shotgun' | 'sympla' | 'manual';
  // Cores do evento. Virão da capa; sem capa, usa um par da marca.
  tema: Tema;
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
  // Enquanto são eventos de marcação, cada um recebe um par diferente da marca
  // para dar para ver a página mudando de cor.
  const ordem = [8, 0, 5, 3, 2, 10];
  return manuais.map((e, i) => ({ ...e, tema: TEMAS_DA_MARCA[ordem[i % ordem.length]] })) as Evento[];
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

export function partesDaData(iso: string) {
  const partes = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).formatToParts(new Date(iso));
  const pega = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? '';
  const minuto = pega('minute');
  return {
    dia: pega('day'),
    mes: pega('month').replace('.', ''),
    semana: pega('weekday'),
    hora: minuto === '00' ? `${pega('hour')}h` : `${pega('hour')}h${minuto}`,
    ano: new Date(iso).getFullYear(),
  };
}
