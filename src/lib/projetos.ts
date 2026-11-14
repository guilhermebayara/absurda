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
import { temaPara, temasDoSitePara, PALETAS_DE_PROJETO, type Tema } from './temas';
import { temaDaImagem, matizesDaImagem } from './paleta';

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
  if (id === 'absurda') return !evento.atividade && !Object.values(FILTROS).some((f) => f.test(nome));
  // Parada: além do nome, vale quem está marcado como parte da programação de uma edição.
  if (id === 'parada' && evento.parada) return true;
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
// - Projeto com paleta fechada (Tibum, Trio, Parada): a paleta inteira, com ou sem foto. Os
//   três fogem à regra da foto pelo caráter de cada um (decisão do Gui).
// - Projeto com foto de capa: igual às páginas de pessoa. Primeiro as cores tiradas da própria
//   foto; depois, os temas do site que combinam com os tons vivos dela. Foto de poucas cores
//   rende menos opções. Por isso a foto principal de um projeto é escolhida pensando na cor.
// - Sem foto: um tema do site, sempre o mesmo para o mesmo projeto.
const temas = new Map<string, Promise<Tema[]>>();
export function temasDoProjeto(id: string, capa?: string): Promise<Tema[]> {
  if (!temas.has(id)) {
    temas.set(id, (async () => {
      const paleta = PALETAS_DE_PROJETO[id];
      if (paleta) return paleta;
      if (!capa?.startsWith('/')) return [temaPara(id)];
      try {
        const imagem = await readFile(`public${capa}`);
        return [await temaDaImagem(imagem), ...temasDoSitePara(await matizesDaImagem(imagem))];
      } catch { return [temaPara(id)]; }
    })());
  }
  return temas.get(id)!;
}
