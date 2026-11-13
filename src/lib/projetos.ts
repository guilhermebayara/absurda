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

const semPrevia = (nome: string) => nome.replace(/pr[ée][ -]?(carnaval|halloween)/gi, '');

export function ehDoProjeto(id: string, evento: Evento): boolean {
  const nome = semPrevia(evento.nome);
  if (id === 'absurda') return !Object.values(FILTROS).some((f) => f.test(nome));
  return FILTROS[id]?.test(nome) ?? false;
}

// Edição especial: o filtro vem do próprio projeto (texto de expressão regular).
export function daEspecial(filtro: string, evento: Evento): boolean {
  return new RegExp(filtro, 'i').test(evento.nome);
}

export interface Resumo { proximos: Evento[]; passados: Evento[]; desde?: string; porAno: { ano: string; n: number }[] }

export function resumoDoProjeto(id: string, todos: { proximos: Evento[]; passados: Evento[] }): Resumo {
  const proximos = todos.proximos.filter((e) => ehDoProjeto(id, e));
  const passados = todos.passados.filter((e) => ehDoProjeto(id, e));
  const anos = passados.map((e) => e.data.slice(0, 4));
  const porAno = [...new Set(anos)].sort().map((ano) => ({ ano, n: anos.filter((a) => a === ano).length }));
  return { proximos, passados, desde: porAno[0]?.ano, porAno };
}
