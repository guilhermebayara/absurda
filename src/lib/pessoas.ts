// Tema de uma pessoa: as cores da foto dela, quando há foto; senão, um tema fixo do site.
// Roda na hora de gerar o site.
import { readFile } from 'node:fs/promises';
import { temaDaImagem } from './paleta';
import { temaPara, type Tema } from './temas';

export async function temaDaPessoa(id: string, foto?: string): Promise<Tema> {
  if (foto?.startsWith('/')) {
    try { return await temaDaImagem(await readFile(`public${foto}`)); } catch { /* foto fora do lugar: cai no tema fixo */ }
  }
  return temaPara(id);
}
