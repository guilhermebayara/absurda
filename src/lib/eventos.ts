import manuais from '../data/eventos-manual.json';
import { TEMAS_DA_MARCA, temaPara, type Tema } from './temas';
import { temaDaImagem } from './paleta';

// Formato único de evento, seja qual for a plataforma de origem.
export interface Evento {
  id: string;
  nome: string;
  data: string; // ISO 8601
  local?: string;
  capa?: string;
  url: string;
  origem: 'shotgun' | 'sympla' | 'manual';
  // Cores do evento. Vêm da capa; sem capa, usa um par da marca.
  tema: Tema;
}

// Resumo do que aconteceu na busca, publicado em /estado.json para conferência.
// Nunca inclui o token nem endereços com o token.
export const estado: Record<string, unknown> = {};

const env = (nome: string) => (process.env[nome] ?? (import.meta.env as Record<string, string | undefined>)[nome])?.trim();

// ---------- Shotgun ----------
// Documentação: https://shotguntheapp.notion.site/Organizer-events-API-e2bb2f2c63fa4caf827a9d4949ae62ae

interface EventoShotgun {
  id: number;
  name: string;
  startTime: string;
  url: string;
  coverUrl?: string | null;
  coverThumbnailUrl?: string | null;
  addressVisibility?: string;
  geolocation?: { street?: string; city?: string } | null;
  publishedAt?: string | null;
  cancelledAt?: string | null;
}

// Os nomes no Shotgun costumam terminar com a data e a hora ("Festa X 13/11 - 22h").
// Como o site já mostra a data em destaque, esse final sai do nome.
export function limparNome(nome: string) {
  return nome
    .replace(/\s*[-–—|,]?\s*\d{1,2}[/.]\d{1,2}(?:[/.]\d{2,4})?(?:\s*[-–—|,]?\s*\d{1,2}\s*h(?:\d{2})?)?\s*$/i, '')
    .replace(/\s*[-–—|,]\s*$/, '')
    .trim() || nome;
}

// Pede ao Cloudinary (onde o Shotgun guarda as capas) uma versão na largura desejada.
const naLargura = (url: string, largura: number) => url.replace(/\bw_\d+/, `w_${largura}`);

function localDe(e: EventoShotgun) {
  if (e.addressVisibility && e.addressVisibility !== 'public') return undefined;
  const g = e.geolocation;
  if (!g) return undefined;
  // O endereço vem completo; fica só o começo (rua e número).
  const rua = g.street?.split(',').slice(0, 2).join(',').trim();
  return rua || g.city || undefined;
}

async function temaDaCapa(url: string | undefined, id: string): Promise<Tema> {
  if (!url) return temaPara(id);
  try {
    const resposta = await fetch(naLargura(url, 96));
    if (!resposta.ok) return temaPara(id);
    return await temaDaImagem(Buffer.from(await resposta.arrayBuffer()));
  } catch {
    return temaPara(id);
  }
}

async function paginaShotgun(organizador: string, token: string, parametros: Record<string, string>) {
  const endereco = new URL(`https://smartboard-api.shotgun.live/api/shotgun/organizers/${encodeURIComponent(organizador)}/events`);
  endereco.searchParams.set('key', token);
  for (const [chave, valor] of Object.entries(parametros)) endereco.searchParams.set(chave, valor);
  const resposta = await fetch(endereco);
  if (!resposta.ok) throw new Error(`Shotgun respondeu ${resposta.status}`);
  const corpo = (await resposta.json()) as { data?: EventoShotgun[] };
  return corpo.data ?? [];
}

async function fonteShotgun(): Promise<Evento[]> {
  const token = env('SHOTGUN_TOKEN');
  const organizador = env('SHOTGUN_ORGANIZER_ID');
  if (!token || !organizador) {
    estado.shotgun = { ligado: false, motivo: `faltando ${!token ? 'SHOTGUN_TOKEN' : ''}${!token && !organizador ? ' e ' : ''}${!organizador ? 'SHOTGUN_ORGANIZER_ID' : ''}` };
    return [];
  }
  try {
    const futuros = await paginaShotgun(organizador, token, {});
    // Os passados vêm paginados. O limite de páginas é só uma trava de segurança.
    const passados: EventoShotgun[] = [];
    for (let pagina = 0; pagina < 60; pagina++) {
      const lote = await paginaShotgun(organizador, token, { past_events: 'true', page: String(pagina), limit: '50' });
      passados.push(...lote);
      if (lote.length < 50) break;
    }
    const validos = (lista: EventoShotgun[]) => lista.filter((e) => !e.cancelledAt && e.publishedAt !== null);
    const agora = Date.now();
    const eventos = await Promise.all(
      [...validos(futuros), ...validos(passados)].map(async (e): Promise<Evento> => {
        const id = `shotgun-${e.id}`;
        const capa = e.coverUrl ?? e.coverThumbnailUrl ?? undefined;
        const futuro = new Date(e.startTime).getTime() >= agora;
        return {
          id,
          nome: limparNome(e.name),
          data: e.startTime,
          local: localDe(e),
          capa: capa ? naLargura(capa, futuro ? 1080 : 600) : undefined,
          url: e.url,
          origem: 'shotgun',
          // Só os próximos têm a cor tirada da capa; para os passados não faz diferença.
          tema: futuro ? await temaDaCapa(capa, id) : temaPara(id),
        };
      }),
    );
    estado.shotgun = {
      ligado: true,
      futuros: futuros.length,
      passados: passados.length,
      comCapa: eventos.filter((e) => e.capa).length,
      exemploDeLocal: eventos.find((e) => e.local)?.local ?? null,
      maisAntigo: passados.at(-1)?.startTime?.slice(0, 10) ?? null,
    };
    return eventos;
  } catch (erro) {
    // O site continua sendo gerado mesmo se o Shotgun estiver fora do ar.
    estado.shotgun = { ligado: true, erro: erro instanceof Error ? erro.message.replace(/key=[^&\s]+/g, 'key=***') : 'erro desconhecido' };
    return [];
  }
}

// ---------- Sympla ----------
// Entra quando houver token (variável SYMPLA_TOKEN).
async function fonteSympla(): Promise<Evento[]> {
  return [];
}

// ---------- Manuais ----------
async function fonteManual(): Promise<Evento[]> {
  return (manuais as Array<Omit<Evento, 'tema'>>).map((e, i) => ({ ...e, tema: TEMAS_DA_MARCA[[8, 0, 5, 3, 2, 10][i % 6]] }));
}

let guardado: Promise<{ proximos: Evento[]; passados: Evento[] }> | null = null;

// Busca uma vez só por geração do site, mesmo que várias páginas peçam.
export function getEventos() {
  guardado ??= (async () => {
    const [shotgun, sympla, manual] = await Promise.all([fonteShotgun(), fonteSympla(), fonteManual()]);
    // Os eventos de marcação só aparecem enquanto nenhuma plataforma devolve eventos de verdade.
    const reais = [...shotgun, ...sympla];
    const marcacao = manual.filter((e) => e.id.startsWith('m'));
    const todos = [...reais, ...manual.filter((e) => !e.id.startsWith('m')), ...(reais.length === 0 ? marcacao : [])];
    // Tira repetidos (mesmo evento vindo de duas fontes) e ordena por data.
    const unicos = [...new Map(todos.map((e) => [e.id, e])).values()].sort((a, b) => a.data.localeCompare(b.data));
    const agora = new Date().toISOString();
    estado.geradoEm = agora;
    estado.total = { proximos: unicos.filter((e) => e.data >= agora).length, passados: unicos.filter((e) => e.data < agora).length };
    return {
      proximos: unicos.filter((e) => e.data >= agora),
      passados: unicos.filter((e) => e.data < agora).reverse(),
    };
  })();
  return guardado;
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
    ano: Number(new Intl.DateTimeFormat('pt-BR', { year: 'numeric', timeZone: 'America/Sao_Paulo' }).format(new Date(iso))),
  };
}
