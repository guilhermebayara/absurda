// Temas de uma pessoa. A página dela sorteia um a cada visita (pedido do Gui), para as páginas
// de pessoa também alternarem de cor.
// - Com foto: primeiro as cores tiradas da própria foto, que é a cara da pessoa no site; depois,
//   os temas do site que combinam com os tons vivos da foto. Foto escura, sem tom vivo, leva
//   dois temas fixos da pessoa no lugar.
// - Sem foto: três temas do site, sempre os mesmos para a mesma pessoa.
// Roda na hora de gerar o site.
import { readFile } from 'node:fs/promises';
import { temaDaImagem, matizesDaImagem } from './paleta';
import { temaPara, temasDoSitePara, type Tema } from './temas';

export async function temasDaPessoa(id: string, foto?: string): Promise<Tema[]> {
  if (foto?.startsWith('/')) {
    try {
      const imagem = await readFile(`public${foto}`);
      const daFoto = await temaDaImagem(imagem);
      const doSite = temasDoSitePara(await matizesDaImagem(imagem));
      // Foto escura, sem tom vivo que case com o site: para a página não ficar sempre no mesmo
      // quase preto, entram dois temas fixos da pessoa.
      return [daFoto, ...(doSite.length > 0 ? doSite : [temaPara(id), temaPara(`${id}-2`)].filter((t, i, l) => l.indexOf(t) === i))];
    } catch { /* foto fora do lugar: cai nos temas fixos */ }
  }
  const fixos = [temaPara(id), temaPara(`${id}-2`), temaPara(`${id}-3`)];
  return fixos.filter((t, i) => fixos.indexOf(t) === i);
}

// ---------- Número do crachá ----------
// O número sai sozinho, pela ordem de entrada na festa (pedido do Gui): ninguém digita.
// Conta quem tem crachá (sócios e DJs, de hoje e de outras fases). A ordem:
//   1. data de entrada: `entrou` (data completa) ou, sem ela, o ano em `desde`;
//   2. mesmo ano sem data completa de um dos dois: vale `ordem` (o Gui disse quem veio antes);
//   3. mesmo dia: ordem alfabética (Gui, 16 nov 2026; hoje vale para Barbara e Gabriel).
// Um `numero` escrito à mão no arquivo da pessoa continua valendo por cima da conta.
//
// Enquanto faltar data de alguém, os números ficam guardados e o crachá mostra XXX: um número
// publicado cedo mudaria quando a pessoa que falta entrasse na fila. Quando o Gui e o Ed
// fecharem as datas, basta trocar CRACHAS_FECHADOS para true.
// Ligado em 14 nov 2026, a pedido do Gui. Se entrar alguém antigo depois, os números de quem vem
// atrás na fila mudam, e ele sabe disso.
export const CRACHAS_FECHADOS = true;

interface DadosDaPessoa { nome: string; grupo: string; ordem: number; desde?: number; ate?: number; entrou?: string; saiu?: string; numero?: number }

export function numerosDosCrachas(pessoas: Array<{ id: string; data: DadosDaPessoa }>) {
  const comCracha = pessoas.filter((p) => p.data.grupo === 'socios' || p.data.grupo === 'residentes');
  const semData = comCracha.filter((p) => !p.data.entrou && !p.data.desde).map((p) => p.data.nome);
  const ano = (p: DadosDaPessoa) => (p.entrou ? Number(p.entrou.slice(0, 4)) : p.desde ?? 9999);
  const fila = [...comCracha].sort((a, b) => {
    const [x, y] = [a.data, b.data];
    if (ano(x) !== ano(y)) return ano(x) - ano(y);
    if (x.entrou && y.entrou && x.entrou !== y.entrou) return x.entrou.localeCompare(y.entrou);
    if (!(x.entrou && y.entrou)) return x.ordem - y.ordem;
    return x.nome.localeCompare(y.nome, 'pt-BR');
  });
  const numeros = new Map(fila.map((p, i) => [p.id, p.data.numero ?? i + 1]));
  return { numeros, fila: fila.map((p) => p.data.nome), semData, prontos: semData.length === 0 };
}

// O número que o crachá mostra: só depois de fechado.
export function numeroDoCracha(id: string, pessoas: Array<{ id: string; data: DadosDaPessoa }>) {
  const dado = pessoas.find((p) => p.id === id)?.data.numero;
  return dado ?? (CRACHAS_FECHADOS ? numerosDosCrachas(pessoas).numeros.get(id) : undefined);
}
