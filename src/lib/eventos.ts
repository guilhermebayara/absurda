import manuais from '../data/eventos-manual.json';
import locais from '../data/locais.json';
import historico from '../data/sympla-historico.json';
import flickr from '../data/flickr-historico.json';
import { TEMAS_DO_SITE, temaPara, type Tema } from './temas';
import { temaDaImagem, malhaDaImagem, type Malha } from './paleta';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

// Formato único de evento, seja qual for a plataforma de origem.
export interface Evento {
  id: string;
  nome: string;
  data: string; // ISO 8601
  local?: string;
  capa?: string;
  // Versão pequena da capa, usada desfocada como fundo do bloco do evento.
  capaPequena?: string;
  // Largura dividida pela altura da capa (16:9 dá 1,78; 3:4 dá 0,75).
  proporcao?: number;
  url: string;
  origem: 'shotgun' | 'sympla' | 'manual';
  // Cores do evento. Vêm da capa; sem capa, usa um par da marca.
  tema: Tema;
  // Cores dos quatro cantos da capa, para o fundo do cartão compacto. Só os próximos têm.
  malha?: Malha;
  // O link leva a um álbum de fotos (e não à página de ingressos).
  album?: 'flickr';
  // Só o dia é conhecido; a hora é um palpite e não deve ser usada para comparar.
  soDia?: boolean;
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
  // Data no fim: "13/11", "13/11/26", "31/janeiro" ou "1/novembro"...
  const mes = '(?:\\d{1,2}|jan\\w*|fev\\w*|mar\\w*|abr\\w*|mai\\w*|jun\\w*|jul\\w*|ago\\w*|set\\w*|out\\w*|nov\\w*|dez\\w*)';
  // ...seguida ou não da hora ("- 22h", "22h30") e de até duas palavras soltas, como o nome da casa.
  const hora = '(?:\\s*[-–—|,]?\\s*\\d{1,2}\\s*h(?:\\d{2})?(?:\\s+\\S{1,12}){0,2})?';
  const fim = new RegExp(`\\s*[-–—|,]?\\s*\\d{1,2}[/.]${mes}(?:[/.]\\d{2,4})?${hora}\\s*$`, 'i');
  // Data no meio, seguida de pouca coisa (hora, casa): "Festa X 02/08 - GIS" vira "Festa X".
  // Se depois da data vier um texto longo, ele é parte do nome e fica.
  const meio = /^(.{6,}?)\s*[-–—|,]?\s*\d{1,2}\/\d{1,2}(?:\/\d{2,4})?(?!\d)(.{0,25})$/;
  const limpo = nome.replace(fim, '').replace(meio, '$1');
  // Sobra de "23 e 25/7": tira o "23 e" que ficou no fim.
  return limpo.replace(/\s+\d{1,2}\s+e$/i, '').replace(/\s*[-–—|,/]\s*$/, '').trim() || nome;
}

// Pede ao Cloudinary (onde o Shotgun guarda as capas) uma versão na largura desejada.
const naLargura = (url: string, largura: number) => url.replace(/\bw_\d+/, `w_${largura}`);

function localDe(e: EventoShotgun) {
  if (e.addressVisibility && e.addressVisibility !== 'public') return undefined;
  const g = e.geolocation;
  if (!g) return undefined;
  // A API só traz o endereço. O nome da casa vem da lista em src/data/locais.json.
  const conhecido = locais.find((l) => g.street?.includes(l.endereco));
  if (conhecido) return conhecido.nome;
  // Casa ainda não cadastrada: fica o começo do endereço (rua e número).
  const rua = g.street?.split(',').slice(0, 2).join(',').trim();
  return rua || g.city || undefined;
}

// Baixa uma versão pequena da capa para tirar as cores e medir a proporção.
async function lerCapa(url: string | undefined, id: string): Promise<{ tema: Tema; proporcao?: number; malha?: Malha }> {
  if (!url) return { tema: temaPara(id) };
  try {
    let imagem: Buffer;
    if (url.startsWith('/')) {
      // Capa guardada no próprio site (pasta public).
      imagem = await readFile(`public${url}`);
    } else {
      const resposta = await fetch(naLargura(url, 160));
      if (!resposta.ok) return { tema: temaPara(id) };
      imagem = Buffer.from(await resposta.arrayBuffer());
    }
    const { width, height } = await sharp(imagem).metadata();
    return { tema: await temaDaImagem(imagem), proporcao: width && height ? width / height : undefined, malha: await malhaDaImagem(imagem) };
  } catch {
    return { tema: temaPara(id) };
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
        // Só os próximos têm cor e proporção lidas da capa; para os passados não faz diferença.
        const lido = futuro ? await lerCapa(capa, id) : { tema: temaPara(id) };
        return {
          id,
          nome: limparNome(e.name),
          data: e.startTime,
          local: localDe(e),
          capa: capa ? naLargura(capa, futuro ? 1280 : 600) : undefined,
          capaPequena: capa ? naLargura(capa, 240) : undefined,
          proporcao: lido.proporcao,
          url: e.url,
          origem: 'shotgun',
          tema: lido.tema,
          malha: lido.malha,
        };
      }),
    );
    estado.shotgun = {
      ligado: true,
      futuros: futuros.length,
      passados: passados.length,
      comCapa: eventos.filter((e) => e.capa).length,
      // Endereços que ainda não têm nome de casa cadastrado em locais.json.
      locaisSemNome: [...new Set(eventos.map((e) => e.local).filter((l) => l && !locais.some((c) => c.nome === l)))],
      // Formatos de capa dos próximos eventos, e se a API manda uma segunda imagem diferente.
      proporcoesDosProximos: eventos.filter((e) => e.proporcao).map((e) => Number(e.proporcao!.toFixed(2))),
      proporcoesDaSegundaImagem: await Promise.all(
        futuros.slice(0, 3).map(async (e) => {
          try {
            if (!e.coverThumbnailUrl) return null;
            const r = await fetch(naLargura(e.coverThumbnailUrl, 160));
            const { width, height } = await sharp(Buffer.from(await r.arrayBuffer())).metadata();
            return width && height ? Number((width / height).toFixed(2)) : null;
          } catch {
            return null;
          }
        }),
      ),
      comSegundaImagemDiferente: [...futuros, ...passados].filter((e) => e.coverThumbnailUrl && e.coverUrl && e.coverThumbnailUrl !== e.coverUrl).length,
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
// Documentação: https://developers.sympla.com.br/api-doc/index.html
// Entra quando houver token (variável SYMPLA_TOKEN), gerado no Sympla em
// Minha Conta > Integrações.

interface EventoSympla {
  id: string;
  reference_id?: number;
  name: string;
  start_date: string;
  url: string;
  image?: string | null;
  private_event?: number;
  published?: number;
  cancelled?: number;
  address?: { name?: string; address?: string; address_num?: string; city?: string } | null;
}

// O Sympla devolve a data no horário de Brasília, sem fuso ("2026-11-13 22:00:00").
// Aqui ela vira ISO completo. Se já vier com fuso, fica como está.
function dataSympla(texto: string) {
  const limpo = texto.trim().replace(' ', 'T');
  const comFuso = /(?:Z|[+-]\d{2}:?\d{2})$/.test(limpo) ? limpo : `${limpo}-03:00`;
  const data = new Date(comFuso);
  return Number.isNaN(data.getTime()) ? null : data.toISOString();
}

async function fonteSympla(): Promise<Evento[]> {
  const token = env('SYMPLA_TOKEN');
  if (!token) {
    estado.sympla = { ligado: false, motivo: 'faltando SYMPLA_TOKEN' };
    return [];
  }
  try {
    const brutos: EventoSympla[] = [];
    let cursor: string | undefined;
    // O limite de páginas é só uma trava de segurança.
    for (let pagina = 0; pagina < 30; pagina++) {
      const endereco = new URL('https://api.sympla.com.br/public/v1.6.0/events');
      endereco.searchParams.set('published', 'true');
      endereco.searchParams.set('timezone', 'America/Sao_Paulo');
      endereco.searchParams.set('sort', 'desc');
      endereco.searchParams.set('field_sort', 'start_date');
      endereco.searchParams.set('page_size', '200');
      if (cursor) endereco.searchParams.set('cursor', cursor);
      const resposta = await fetch(endereco, { headers: { s_token: token } });
      if (!resposta.ok) throw new Error(`Sympla respondeu ${resposta.status}`);
      const corpo = (await resposta.json()) as { data?: EventoSympla[]; pagination?: { next_cursor?: string | null } };
      brutos.push(...(corpo.data ?? []));
      cursor = corpo.pagination?.next_cursor ?? undefined;
      if (!cursor) break;
    }
    const agora = Date.now();
    const validos = brutos.filter((e) => !e.cancelled && !e.private_event && e.published !== 0);
    const eventos = (
      await Promise.all(
        validos.map(async (e): Promise<Evento | null> => {
          const data = dataSympla(e.start_date);
          if (!data) return null;
          // O número de referência é o mesmo que aparece no endereço público do evento.
          const id = `sympla-${e.reference_id ?? e.id}`;
          const capa = e.image || undefined;
          const futuro = new Date(data).getTime() >= agora;
          const lido = futuro ? await lerCapa(capa, id) : { tema: temaPara(id) };
          const casa = e.address?.name?.trim() || [e.address?.address, e.address?.address_num].filter(Boolean).join(', ') || e.address?.city;
          return { id, nome: limparNome(e.name), data, local: casa || undefined, capa, capaPequena: capa, proporcao: lido.proporcao, url: e.url, origem: 'sympla', tema: lido.tema, malha: lido.malha };
        }),
      )
    ).filter((e): e is Evento => e !== null);
    estado.sympla = {
      ligado: true,
      recebidos: brutos.length,
      exibidos: eventos.length,
      futuros: eventos.filter((e) => new Date(e.data).getTime() >= agora).length,
      comCapa: eventos.filter((e) => e.capa).length,
      // Como a data chega, para conferir o fuso.
      exemploDeData: brutos[0]?.start_date ?? null,
      maisAntigo: eventos.map((e) => e.data).sort()[0]?.slice(0, 10) ?? null,
    };
    return eventos;
  } catch (erro) {
    // O site continua sendo gerado mesmo se o Sympla estiver fora do ar.
    estado.sympla = { ligado: true, erro: erro instanceof Error ? erro.message : 'erro desconhecido' };
    return [];
  }
}

// ---------- Histórico do Sympla ----------
// Cópia estática, feita uma vez em novembro de 2026, dos eventos encerrados que
// aparecem na página de produtor (sympla.com.br/produtor/festaabsurda). Inclui os
// criados por outras contas e compartilhados com a @bsurda, que o token não enxerga.
async function fonteHistorico(): Promise<Evento[]> {
  return (historico as Array<{ id: string; nome: string; data: string; url: string; capa?: string; local?: string }>).map((e) => {
    const casa = locais.find((l) => e.local?.includes(l.endereco))?.nome ?? e.local;
    return { id: e.id, nome: limparNome(e.nome), data: e.data, local: casa, capa: e.capa, capaPequena: e.capa?.replace('-lg.', '-xs.'), url: e.url, origem: 'sympla', tema: temaPara(e.id) };
  });
}

// ---------- Álbuns do Flickr ----------
// Cópia estática, feita em novembro de 2026, dos álbuns de flickr.com/photos/absurdaparty:
// as festas de 2009 a 2013, de antes das plataformas de ingresso. O nome, a data e a
// casa vieram do título de cada álbum, e o link leva às fotos.
async function fonteFlickr(): Promise<Evento[]> {
  return (flickr as Array<{ id: string; nome: string; data: string; url: string; local?: string }>).map((e) => ({ ...e, origem: 'manual', tema: temaPara(e.id), album: 'flickr', soDia: true }));
}

// O mesmo evento pode chegar por mais de um caminho: token e histórico do Sympla,
// ou vendido no Shotgun e no Sympla ao mesmo tempo. Fica o primeiro da lista.
function semRepetidos(lista: Evento[]) {
  const chave = (url: string) => url.toLowerCase().split('?')[0].replace(/\/$/, '');
  const hora = (e: Evento) => new Date(e.data).getTime();
  const dia = (e: Evento) => new Date(hora(e) - 3 * 3600 * 1000).toISOString().slice(0, 10);
  const ficam: Evento[] = [];
  for (const e of lista) {
    const repetido = ficam.some(
      (f) =>
        f.id === e.id ||
        chave(f.url) === chave(e.url) ||
        // Plataformas diferentes, começando com menos de uma hora e meia de diferença
        (f.origem !== e.origem && Math.abs(hora(f) - hora(e)) <= 90 * 60 * 1000) ||
        // Um dos dois só tem o dia (álbum de fotos): basta ser no mesmo dia
        (f.origem !== e.origem && (f.soDia || e.soDia) && dia(f) === dia(e)) ||
        // Mesma plataforma, mesmo nome e mesmo horário
        (f.origem === e.origem && f.nome.toLowerCase() === e.nome.toLowerCase() && hora(f) === hora(e)),
    );
    if (!repetido) ficam.push(e);
  }
  return ficam;
}

// ---------- Manuais ----------
async function fonteManual(): Promise<Evento[]> {
  const agora = Date.now();
  return Promise.all(
    (manuais as Array<Omit<Evento, 'tema'>>).map(async (e, i): Promise<Evento> => {
      // Evento futuro com capa: cores e proporção saem da capa, como nos automáticos.
      if (e.capa && new Date(e.data).getTime() >= agora) {
        const lido = await lerCapa(e.capaPequena ?? e.capa, e.id);
        return { ...e, proporcao: e.proporcao ?? lido.proporcao, tema: lido.tema, malha: lido.malha };
      }
      return { ...e, tema: TEMAS_DO_SITE[i % TEMAS_DO_SITE.length] };
    }),
  );
}

let guardado: Promise<{ proximos: Evento[]; passados: Evento[] }> | null = null;

// Busca uma vez só por geração do site, mesmo que várias páginas peçam.
export function getEventos() {
  guardado ??= (async () => {
    const [shotgun, sympla, antigos, manual, albuns] = await Promise.all([fonteShotgun(), fonteSympla(), fonteHistorico(), fonteManual(), fonteFlickr()]);
    // Os eventos de marcação só aparecem enquanto nenhuma plataforma devolve eventos de verdade.
    const reais = [...shotgun, ...sympla, ...antigos];
    const marcacao = manual.filter((e) => e.id.startsWith('m'));
    // Os cadastrados à mão vêm primeiro: quando o mesmo evento também chega por uma
    // plataforma (como o Halloween de 2025, criado no Sympla e vendido em outro site),
    // vale a versão manual.
    const todos = [...manual.filter((e) => !e.id.startsWith('m')), ...albuns, ...reais, ...(reais.length === 0 ? marcacao : [])];
    // Tira repetidos (mesmo evento vindo de duas fontes) e ordena por data.
    const unicos = semRepetidos(todos).sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    estado.repetidosRemovidos = todos.length - unicos.length;
    const agoraMs = Date.now();
    const agora = new Date().toISOString();
    estado.geradoEm = agora;
    estado.total = { proximos: unicos.filter((e) => new Date(e.data).getTime() >= agoraMs).length, passados: unicos.filter((e) => new Date(e.data).getTime() < agoraMs).length };
    return {
      proximos: unicos.filter((e) => new Date(e.data).getTime() >= agoraMs),
      passados: unicos.filter((e) => new Date(e.data).getTime() < agoraMs).reverse(),
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
