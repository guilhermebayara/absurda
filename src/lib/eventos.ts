import manuais from '../data/eventos-manual.json';
import locais from '../data/locais.json';
import historico from '../data/sympla-historico.json';
import flickr from '../data/flickr-historico.json';
import arquivo from '../data/arquivo.json';
import parada from '../data/parada.json';
import { TEMAS_DO_SITE, temaPara, type Tema } from './temas';
import { temaDaImagem, malhaDaImagem, type Malha } from './paleta';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

// Formato único de evento, seja qual for a plataforma de origem.
export interface Evento {
  id: string;
  nome: string;
  data: string; // ISO 8601
  // Hora em que o evento termina, quando a plataforma informa (ISO 8601).
  fim?: string;
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
  // Fez parte da programação de uma Parada da @bsurda: o número da edição (src/data/parada.json).
  parada?: number;
  // Conversa, oficina ou festa de parceiro dentro de uma programação: aparece na Agenda e na
  // página da Parada, mas não conta como edição da @bsurda.
  atividade?: boolean;
  // Linha única que resume as lives de uma Parada Virtual (regra do Gui: na Agenda, festa tem
  // sempre a sua linha e as lives viram uma linha só; a programação completa fica no projeto).
  lives?: boolean;
  // Só o dia é conhecido; a hora é um palpite e não deve ser usada para comparar.
  soDia?: boolean;
  // Ainda depende de uma plataforma (veio dela agora, ou da cópia estática do histórico do
  // Sympla) e não está no arquivo do site. Guarda o nome como a plataforma mandou, para o
  // arquivo poder refazer a limpeza no futuro.
  nomeBruto?: string;
  // Já está guardado no arquivo do site.
  arquivado?: boolean;
}

// ---------- Próximo ou passado ----------
// O corte é o FIM do evento, não o começo (pedido do Gui): enquanto a festa está acontecendo
// ela continua em destaque, com o link de ingressos, e só depois vai para o histórico e para o
// arquivo. Vale a hora de término que a plataforma informar; sem ela (ou se vier sem sentido),
// conta-se uma noite de festa a partir do começo.
const NOITE_DE_FESTA = 8 * 3600 * 1000;
const TERMINO_MAXIMO = 3 * 24 * 3600 * 1000;
export function fimDe(e: { data: string; fim?: string }) {
  const comeco = new Date(e.data).getTime();
  const informado = e.fim ? new Date(e.fim).getTime() : NaN;
  return informado > comeco && informado - comeco <= TERMINO_MAXIMO ? informado : comeco + NOITE_DE_FESTA;
}
export const jaAcabou = (e: { data: string; fim?: string }, agora = Date.now()) => fimDe(e) < agora;

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
  endTime?: string | null;
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
  return limpo.replace(/\s+\d{1,2}\s+[ea]$/i, '').replace(/\s*[-–—|,/]\s*$/, '').trim() || nome;
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
        const fim = e.endTime ?? undefined;
        const futuro = !jaAcabou({ data: e.startTime, fim }, agora);
        // Só os próximos têm cor e proporção lidas da capa; para os passados não faz diferença.
        const lido = futuro ? await lerCapa(capa, id) : { tema: temaPara(id) };
        return {
          id,
          nome: limparNome(e.name),
          data: e.startTime,
          fim,
          local: localDe(e),
          capa: capa ? naLargura(capa, futuro ? 1280 : 600) : undefined,
          capaPequena: capa ? naLargura(capa, 240) : undefined,
          proporcao: lido.proporcao,
          url: e.url,
          origem: 'shotgun',
          nomeBruto: e.name,
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
      // Quantos vieram com hora de término, para conferir se o corte usa o fim informado.
      comHoraDeFim: [...futuros, ...passados].filter((e) => e.endTime).length,
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
  id: string | number;
  reference_id?: number;
  name: string;
  start_date: string;
  end_date?: string | null;
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

// Eventos do Sympla que não aconteceram, mas que não puderam ser cancelados na
// plataforma (cancelar lá devolveria os ingressos). Pelo número do evento.
// Eventos que não entram na agenda, venham de onde vierem (pedido dos produtores).
const FORA_DA_AGENDA = [
  'sympla-35115', // Please Come to Brazil, 2015
  'sympla-818582', // @bsurda Latina, 30/5/2020
  'sympla-781533', // @bsurda Leviosa, 9/5/2020: não aconteceu, quarentena
  'sympla-20129', // NÊGA, 6/6/2014: ocultado a pedido do Gui
];
// Nomes corrigidos à mão (pedido do Gui): eventos antigos cujo nome na plataforma trazia a
// data, a hora ou a casa, ou um erro de digitação. A agenda já mostra data e casa ao lado.
// O arquivo (src/data/arquivo.json) continua com o nome original; a troca é só na exibição.
const NOMES_CORRIGIDOS: Record<string, string> = {
  // A capa diz I Hate Remix; o Sympla foi criado como "@bsurda Especial Beyoncé" (Gui, nov 2026).
  'sympla-1460342': 'I Hate Remix Especial Beyoncé',
  // Lançamento da Amorzinho, no dia do disco da Charli. No Shotgun ficou o nome antigo,
  // "@bsurda Fashion, Music, Film" (Gui, 16 nov 2026). O nome liga o evento ao projeto.
  'shotgun-560392': 'AMORZINHO',
  'sympla-3035929': 'OFICINA VOGUE 5ª PARADA DA @BSURDA',
  'sympla-3035921': 'OFICINA DRAG 5ª PARADA DA @BSURDA',
  'sympla-2030418': 'CHRONUS - o espetáculo Drag (Temporada em São Paulo)',
  'sympla-2016142': '4ª PARADA DA @BSURDA - Comunicação e Design LGBT+',
  'sympla-2016075': '4ª PARADA DA @BSURDA - Empreendedorismo e Empregabilidade LGBT+',
  'sympla-805879': '@BSURDA LOCAL',
  'sympla-563012': '@bsurda 10 anos Halloween',
  'sympla-515915': 'RU@',
  'sympla-422613': 'TIBUM VERÃO + COLONIA DE FÉRIAS',
  'sympla-429908': 'MONEY',
  'sympla-403043': 'I Hate Remix esp Britney',
  'sympla-317613': '@bsurda',
  'sympla-273251': '@BSURDA EDIÇÃO 200',
  'sympla-205786': 'Latina #absurda8anos',
  'sympla-103636': '@bsurda Sem Frescuras! (SETE LAGOAS)',
  'sympla-68479': '@bsurda JOKER',
  'sympla-62071': '@bsurda YOLO #3 - BONDE DO ROLÊ e MC CAROL',
  'sympla-61019': 'MONEY',
  'sympla-58480': 'I HATE REMIX',
  'sympla-50851': 'FESTIVAL @BSURDA 2016 COM RICO DALASAM E JALOO',
  'sympla-38733': '@BSURDA EM HOGWARTS',
  'sympla-38472': '@BSURDA COM LATRICE',
  'sympla-36809': 'FESTONNA BH',
  'sympla-38362': 'BAILE DAS AMIGAS',
  'sympla-36725': 'ARRAIÁ SEM FRESCURAS',
  'sympla-31960': '@BSURDA COM ALYSSA EDWARDS E COCO MONTRESE',
  'sympla-33009': 'MONEY edição Pour It Up',
  'sympla-33434': 'PUTZBRILHA! BH',
  'sympla-32476': '@bsurda YOLO edição RIO DE JANEIRO',
  'sympla-27406': '@BSURDA COM JUJUBEE',
  'sympla-24184': 'HALLOWEEN "SEM FRESCURAS"',
  'sympla-23617': '@bsurda apresenta: ✝✝ INFERNINHO DA @BSURDA ✝✝',
  'sympla-21569': '@bsurda IFUNCKING w/ BONDE DO ROLE, DANIEL PEIXOTO E OMULU',
  'sympla-20958': 'ARRAIÁ SEM FRESCURAS',
  'sympla-20129': 'NÊGA',
};
// Quarentena: da primeira @bsurda Em Casa até a véspera da Sentadinha, tudo aconteceu online.
const ONLINE_DE = new Date('2020-05-29T00:00:00-03:00').getTime();
const ONLINE_ATE = new Date('2021-09-18T00:00:00-03:00').getTime();
const naQuarentena = (e: Evento) => { const t = new Date(e.data).getTime(); return t >= ONLINE_DE && t < ONLINE_ATE; };
const SYMPLA_FORA = ['784522']; // I Hate Remix Lady Gaga, 6/2/2021: adiado pela quarentena
// Eventos em que a data cadastrada está certa e a do nome não (erro de digitação).
const DATA_CADASTRADA_VALE = [/aquece @ code bar/i];

// Procura no nome uma data no formato dia/mês ("22/10", "22.10.2022"). Se ela existir e
// for diferente da data cadastrada, devolve a cadastrada com o dia e o mês trocados.
function dataDoNome(nome: string, iso: string) {
  const achado = nome.match(/(?<!\d)(\d{1,2})[/.](\d{1,2})(?:[/.](\d{2,4}))?(?!\d)/);
  if (!achado) return iso;
  const dia = Number(achado[1]);
  const mes = Number(achado[2]);
  if (dia < 1 || dia > 31 || mes < 1 || mes > 12) return iso;
  // A data cadastrada, vista no horário de Brasília.
  const local = new Date(new Date(iso).getTime() - 3 * 3600 * 1000);
  if (local.getUTCDate() === dia && local.getUTCMonth() + 1 === mes) return iso;
  // Festa que começa depois da meia-noite costuma levar no nome a data da véspera.
  const vespera = new Date(local.getTime() - 24 * 3600 * 1000);
  if (vespera.getUTCDate() === dia && vespera.getUTCMonth() + 1 === mes) return iso;
  let ano = local.getUTCFullYear();
  if (achado[3]) ano = Number(achado[3].length === 2 ? `20${achado[3]}` : achado[3]);
  const nova = new Date(Date.UTC(ano, mes - 1, dia, local.getUTCHours() + 3, local.getUTCMinutes()));
  return Number.isNaN(nova.getTime()) ? iso : nova.toISOString();
}

async function contaSympla(token: string, chave: string): Promise<Evento[]> {
  try {
    // A versão 3 da API é a que devolve o histórico completo da conta. A mais nova
    // (1.6.0) deixa de fora os eventos de 2015 a 2022, sem explicação na documentação.
    const brutos: EventoSympla[] = [];
    let paginasLidas = 0;
    // O limite de páginas é só uma trava de segurança.
    for (let pagina = 1; pagina <= 30; pagina++) {
      const endereco = new URL('https://api.sympla.com.br/public/v3/events');
      endereco.searchParams.set('published', 'all');
      endereco.searchParams.set('page_size', '200');
      endereco.searchParams.set('page', String(pagina));
      const resposta = await fetch(endereco, { headers: { s_token: token } });
      if (!resposta.ok) throw new Error(`Sympla respondeu ${resposta.status}`);
      const corpo = (await resposta.json()) as { data?: EventoSympla[]; pagination?: { has_next?: boolean } };
      const lote = corpo.data ?? [];
      brutos.push(...lote);
      paginasLidas++;
      if (!corpo.pagination?.has_next || lote.length === 0) break;
    }
    const ajustadas: string[] = [];
    const agora = Date.now();
    const validos = brutos.filter((e) => !e.cancelled && !e.private_event && e.published !== 0 && !SYMPLA_FORA.includes(String(e.reference_id ?? e.id)));
    const eventos = (
      await Promise.all(
        validos.map(async (e): Promise<Evento | null> => {
          const cadastrada = dataSympla(e.start_date);
          if (!cadastrada) return null;
          // Em alguns eventos a data cadastrada é a da abertura das vendas, e a da
          // festa está só no nome. Quando as duas não batem, vale a do nome.
          const data = DATA_CADASTRADA_VALE.some((r) => r.test(e.name)) ? cadastrada : dataDoNome(e.name, cadastrada);
          if (data !== cadastrada) ajustadas.push(`${e.name}: ${cadastrada.slice(0, 10)} > ${data.slice(0, 10)}`);
          // O número de referência é o mesmo que aparece no endereço público do evento.
          const id = `sympla-${e.reference_id ?? e.id}`;
          const capa = e.image || undefined;
          const fim = (e.end_date && dataSympla(e.end_date)) || undefined;
          const futuro = !jaAcabou({ data, fim }, agora);
          const lido = futuro ? await lerCapa(capa, id) : { tema: temaPara(id) };
          const casa = e.address?.name?.trim() || [e.address?.address, e.address?.address_num].filter(Boolean).join(', ') || e.address?.city;
          return { id, nome: limparNome(e.name), data, fim, local: casa || undefined, capa, capaPequena: capa, proporcao: lido.proporcao, url: e.url, origem: 'sympla', nomeBruto: e.name, tema: lido.tema, malha: lido.malha };
        }),
      )
    ).filter((e): e is Evento => e !== null);
    estado[chave] = {
      ligado: true,
      recebidos: brutos.length,
      exibidos: eventos.length,
      futuros: eventos.filter((e) => !jaAcabou(e, agora)).length,
      comCapa: eventos.filter((e) => e.capa).length,
      comHoraDeFim: eventos.filter((e) => e.fim).length,
      // Como a data chega, para conferir o fuso.
      exemploDeData: brutos[0]?.start_date ?? null,
      datasTiradasDoNome: ajustadas,
      // Conferência: por ano, quantos vieram e quantos caíram em cada filtro.
      porAno: Object.fromEntries(
        [...new Set(brutos.map((e) => e.start_date.slice(0, 4)))].sort().map((ano) => {
          const doAno = brutos.filter((e) => e.start_date.startsWith(ano));
          return [ano, { vieram: doAno.length, privados: doAno.filter((e) => e.private_event).length, naoPublicados: doAno.filter((e) => e.published === 0).length, cancelados: doAno.filter((e) => e.cancelled).length }];
        }),
      ),
      paginas: paginasLidas,
      maisAntigo: eventos.map((e) => e.data).sort()[0]?.slice(0, 10) ?? null,
    };
    return eventos;
  } catch (erro) {
    // O site continua sendo gerado mesmo se o Sympla estiver fora do ar.
    estado[chave] = { ligado: true, erro: erro instanceof Error ? erro.message : 'erro desconhecido' };
    return [];
  }
}

// Cada conta do Sympla tem a sua chave e só enxerga os eventos que ela mesma criou.
// Por isso o site aceita mais de uma: SYMPLA_TOKEN e SYMPLA_TOKEN_3.
// SYMPLA_TOKEN_2 saiu (pedido do Gui): era uma chave de teste da mesma conta, que só trazia
// os mesmos eventos de novo. O número 2 fica vago para não confundir com ela.
async function fonteSympla(): Promise<Evento[]> {
  const contas = [['SYMPLA_TOKEN', 'sympla'], ['SYMPLA_TOKEN_3', 'sympla3']] as const;
  if (!env('SYMPLA_TOKEN')) estado.sympla = { ligado: false, motivo: 'faltando SYMPLA_TOKEN' };
  const listas = await Promise.all(contas.map(([variavel, chave]) => { const token = env(variavel); return token ? contaSympla(token, chave) : Promise.resolve([]); }));
  return listas.flat();
}

// ---------- Histórico do Sympla ----------
// Cópia estática, feita uma vez em novembro de 2026, dos eventos encerrados que
// aparecem na página de produtor (sympla.com.br/produtor/festaabsurda). Inclui os
// criados por outras contas e compartilhados com a @bsurda, que o token não enxerga.
// Estes eventos também entram no arquivo do site (nomeBruto): o robô baixa a capa de cada um
// para public/arquivo, e a partir daí a agenda deixa de depender do servidor do Sympla.
async function fonteHistorico(): Promise<Evento[]> {
  return (historico as Array<{ id: string; nome: string; data: string; url: string; capa?: string; local?: string }>).map((e) => {
    const casa = locais.find((l) => e.local?.includes(l.endereco))?.nome ?? e.local;
    return { id: e.id, nome: limparNome(e.nome), data: e.data, local: casa, capa: e.capa, capaPequena: e.capa?.replace('-lg.', '-xs.'), url: e.url, origem: 'sympla', nomeBruto: e.nome, tema: temaPara(e.id) };
  });
}

// ---------- Arquivo do site ----------
// Cópia permanente dos eventos que já passaram, guardada no próprio repositório
// (src/data/arquivo.json, com as capas em public/arquivo). Um robô, três vezes por dia, acrescenta
// aqui o que passou desde a última vez (ver scripts/arquivar.mjs). A partir daí o
// evento não depende mais da plataforma: se o Shotgun ou o Sympla mudarem, saírem do
// ar ou deixarem de entregar o histórico, ele continua no site.
interface Arquivado { id: string; nome: string; data: string; url: string; origem: 'shotgun' | 'sympla'; local?: string; capa?: string; capaPequena?: string }
async function fonteArquivo(): Promise<Evento[]> {
  return (arquivo as Arquivado[]).map((e) => ({ ...e, nome: limparNome(e.nome), tema: temaPara(e.id), arquivado: true }));
}

// ---------- Álbuns do Flickr ----------
// Cópia estática, feita em novembro de 2026, dos álbuns de flickr.com/photos/absurdaparty:
// as festas de 2009 a 2013, de antes das plataformas de ingresso. O nome, a data e a
// casa vieram do título de cada álbum, e o link leva às fotos.
async function fonteFlickr(): Promise<Evento[]> {
  // Algumas têm a arte original da festa, guardada em public/capas (as cinco primeiras edições).
  return (flickr as Array<{ id: string; nome: string; data: string; url: string; local?: string; capa?: string; capaPequena?: string }>).map((e) => ({ ...e, origem: 'manual', tema: temaPara(e.id), album: 'flickr', soDia: true }));
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
        // Item de programação da Parada escrito à mão nunca substitui nem é substituído por outro
        // evento do mesmo dia: numa Parada há vários eventos por dia, e todos ficam.
        (f.id.startsWith('parada-') || e.id.startsWith('parada-') ? false :
        ((e.url !== '' && chave(f.url) === chave(e.url)) ||
        // Plataformas diferentes, começando com menos de uma hora e meia de diferença
        (f.origem !== e.origem && Math.abs(hora(f) - hora(e)) <= 90 * 60 * 1000) ||
        // Um dos dois só tem o dia (álbum de fotos): basta ser no mesmo dia
        (f.origem !== e.origem && (f.soDia || e.soDia) && dia(f) === dia(e)) ||
        // Mesma plataforma, mesmo nome e mesmo dia (dois lotes de ingresso da mesma noite)
        (f.origem === e.origem && f.nome.toLowerCase() === e.nome.toLowerCase() && dia(f) === dia(e)))),
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
      if (e.capa && !jaAcabou(e, agora)) {
        const lido = await lerCapa(e.capaPequena ?? e.capa, e.id);
        return { ...e, proporcao: e.proporcao ?? lido.proporcao, tema: lido.tema, malha: lido.malha };
      }
      return { ...e, tema: TEMAS_DO_SITE[i % TEMAS_DO_SITE.length] };
    }),
  );
}

// Evento -> número da edição da Parada de que fez parte.
const daParada = new Map<string, number>(parada.edicoes.flatMap((ed) => ed.eventos.map((id) => [id, ed.numero] as [string, number])));

let guardado: Promise<{ proximos: Evento[]; passados: Evento[] }> | null = null;

// Busca uma vez só por geração do site, mesmo que várias páginas peçam.
export function getEventos() {
  guardado ??= (async () => {
    const [shotgun, sympla, antigos, manual, albuns, guardados] = await Promise.all([fonteShotgun(), fonteSympla(), fonteHistorico(), fonteManual(), fonteFlickr(), fonteArquivo()]);
    // Os eventos de marcação só aparecem enquanto nenhuma plataforma devolve eventos de verdade.
    // O que já está no arquivo vem antes do que as plataformas mandam agora: para um
    // evento passado, vale a cópia guardada.
    // Exceção: evento que foi para o arquivo mas ainda não acabou (arquivado quando o corte
    // era o começo da festa). Enquanto durar, vale a versão da plataforma, com as cores da capa.
    const reais = [...guardados.filter((e) => jaAcabou(e)), ...shotgun, ...sympla, ...antigos, ...guardados.filter((e) => !jaAcabou(e))];
    // Os de marcação têm id m1, m2...; outros manuais também podem começar com "m" (manual-...).
    const ehMarcacao = (e: Evento) => /^m\d+$/.test(e.id);
    const marcacao = manual.filter(ehMarcacao);
    // Os cadastrados à mão vêm primeiro: quando o mesmo evento também chega por uma
    // plataforma (como o Halloween de 2025, criado no Sympla e vendido em outro site),
    // vale a versão manual.
    const todos = [...manual.filter((e) => !ehMarcacao(e)), ...albuns, ...reais, ...(reais.length === 0 ? marcacao : [])];
    // Tira repetidos (mesmo evento vindo de duas fontes) e ordena por data.
    // Eventos anunciados como adiados ficam fora: a data nova aparece como outro evento.
    const unicos = semRepetidos(todos.filter((e) => !/\badiad[oa]\b/i.test(e.nome) && !FORA_DA_AGENDA.includes(e.id))).map((e) => (!e.local && naQuarentena(e) ? { ...e, local: 'Online' } : e))
      // A troca de nome vem depois de tirar os repetidos, que comparam o nome original.
      .map((e) => (NOMES_CORRIGIDOS[e.id] ? { ...e, nome: NOMES_CORRIGIDOS[e.id] } : e))
      // Marca quem fez parte da programação de uma Parada da @bsurda.
      .map((e) => (daParada.has(e.id) ? { ...e, parada: daParada.get(e.id) } : e))
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    estado.repetidosRemovidos = todos.length - unicos.length;
    estado.arquivo = { guardados: guardados.length, passadosAindaSoNaPlataforma: unicos.filter((e) => e.nomeBruto && jaAcabou(e)).length };
    const agoraMs = Date.now();
    const agora = new Date().toISOString();
    estado.geradoEm = agora;
    estado.total = { proximos: unicos.filter((e) => !jaAcabou(e, agoraMs)).length, passados: unicos.filter((e) => jaAcabou(e, agoraMs)).length };
    return {
      proximos: unicos.filter((e) => !jaAcabou(e, agoraMs)),
      passados: unicos.filter((e) => jaAcabou(e, agoraMs)).reverse(),
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
