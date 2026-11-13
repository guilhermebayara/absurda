// Liga os eventos da Agenda aos projetos, pelo nome do evento.
//
// Regras (do Gui):
// - I Hate Remix tem esse nome, ou "IHR", no título.
// - As @bsurdas são as que não trazem nome de projeto no título.
// - Edições especiais da @bsurda (Bazinga!, YOLO...) não viraram projeto: continuam sendo
//   @bsurda e ganham destaque dentro da página dela (campo "especiais" do projeto).
//
// Um evento pode pertencer a dois projetos quando o título traz os dois nomes
// (por exemplo, uma WIG com IHR). "Pré carnaval" e "pré Halloween" não contam como o evento em si.
import type { Evento } from './eventos';
import { readFile } from 'node:fs/promises';
import { temaPara, PALETAS_DE_PROJETO, TEMAS_DO_SITE, type Tema } from './temas';
import { matizesDaImagem } from './paleta';

const FILTROS: Record<string, RegExp> = {
  'i-hate-remix': /i hate remix|\bihr\b/i,
  tibum: /tibum/i,
  parada: /\bparada\b/i,
  bloco: /\btrio\b/i,
  halloween: /halloween/i,
  money: /\bmoney\b/i,
  wig: /\bwig\b|hallowig/i,
  pfvr: /\bpfvr\b/i,
  amorzinho: /amorzinho/i,
};

// Também fica de fora o after da Parada LGBT de BH: é da parada da cidade, e não da Parada da @bsurda.
const semPrevia = (nome: string) => nome.replace(/pr[ée][ -]?(carnaval|halloween|parada)/gi, '').replace(/parada lgbt\b/gi, '');

export function ehDoProjeto(id: string, evento: Evento): boolean {
  const nome = semPrevia(evento.nome);
  if (id === 'absurda') return !Object.values(FILTROS).some((f) => f.test(nome));
  return FILTROS[id]?.test(nome) ?? false;
}

// Edição especial: o filtro vem do próprio projeto (texto de expressão regular).
export function daEspecial(filtro: string, evento: Evento): boolean {
  return new RegExp(filtro, 'i').test(evento.nome);
}

// Primas de um projeto: @bsurdas (sem nome de projeto no título) que casam com o filtro.
export function ehPrima(filtro: string, evento: Evento): boolean {
  return ehDoProjeto('absurda', evento) && new RegExp(filtro, 'i').test(semPrevia(evento.nome));
}

// O Trio sai sempre no domingo anterior ao domingo de carnaval (regra do Gui). O domingo de
// carnaval cai 49 dias antes da Páscoa; o Trio, 56. Devolve a próxima saída a partir de "agora".
function pascoa(ano: number): Date {
  const a = ano % 19, b = Math.floor(ano / 100), c = ano % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(ano, mes - 1, dia));
}
export function proximoTrio(agora = new Date()): string {
  for (let ano = agora.getUTCFullYear(); ; ano++) {
    const dia = new Date(pascoa(ano).getTime() - 56 * 86400000);
    // 14h em Belo Horizonte (17h UTC), o horário de costume da saída.
    const saida = new Date(Date.UTC(dia.getUTCFullYear(), dia.getUTCMonth(), dia.getUTCDate(), 17));
    if (saida.getTime() >= agora.getTime()) return saida.toISOString();
  }
}

export interface Resumo { proximos: Evento[]; passados: Evento[]; desde?: string; porAno: { ano: string; n: number }[] }

export function resumoDoProjeto(id: string, todos: { proximos: Evento[]; passados: Evento[] }): Resumo {
  const proximos = todos.proximos.filter((e) => ehDoProjeto(id, e));
  const passados = todos.passados.filter((e) => ehDoProjeto(id, e));
  const anos = passados.map((e) => e.data.slice(0, 4));
  const porAno = [...new Set(anos)].sort().map((ano) => ({ ano, n: anos.filter((a) => a === ano).length }));
  return { proximos, passados, desde: porAno[0]?.ano, porAno };
}

// Cores do projeto. Devolve uma lista: a página e o cartaz do projeto sorteiam um tema dela a
// cada visita, para o site continuar multicolorido. O primeiro da lista é o que vale sem script.
//
// - Projeto com paleta fechada (Tibum, Trio, Parada): a paleta inteira, com ou sem foto.
// - Projeto com foto de capa: os temas do site que combinam com os tons vivos da foto. Foto de
//   poucas cores rende um tema só; foto colorida rende até três. Assim toda cor que aparece
//   num projeto é uma cor do site, e nenhuma destoa.
// - Sem foto: um tema do site, sempre o mesmo para o mesmo projeto.
function matiz(hex: string): { h: number; s: number } {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (d === 0) return { h: 0, s: 0 };
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s: d / (1 - Math.abs(max + min - 1) || 1) };
}
const afastamento = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));
// Quão perto um tema do site está de um tom: vale o fundo, quando ele tem cor, ou o destaque
// (com uma pequena desvantagem, para o fundo ganhar em caso de empate).
function proximidade(tema: Tema, tom: number): number {
  const f = matiz(tema.fundo), d = matiz(tema.destaque);
  return Math.min(f.s >= 0.3 ? afastamento(f.h, tom) : 999, afastamento(d.h, tom) + 20);
}

const temas = new Map<string, Promise<Tema[]>>();
export function temasDoProjeto(id: string, capa?: string): Promise<Tema[]> {
  if (!temas.has(id)) {
    temas.set(id, (async () => {
      const paleta = PALETAS_DE_PROJETO[id];
      if (paleta) return paleta;
      if (!capa?.startsWith('/')) return [temaPara(id)];
      try {
        const tons = await matizesDaImagem(await readFile(`public${capa}`));
        const escolhidos: Tema[] = [];
        for (const tom of tons) {
          const melhor = TEMAS_DO_SITE.filter((t) => !escolhidos.includes(t)).sort((a, b) => proximidade(a, tom) - proximidade(b, tom))[0];
          if (melhor && proximidade(melhor, tom) <= 50) escolhidos.push(melhor);
        }
        return escolhidos.length > 0 ? escolhidos : [temaPara(id)];
      } catch { return [temaPara(id)]; }
    })());
  }
  return temas.get(id)!;
}
