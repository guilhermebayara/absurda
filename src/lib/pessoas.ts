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
