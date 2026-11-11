// Tira um tema (fundo, texto, destaque) das cores de uma imagem.
// Roda na hora de gerar o site, não no navegador de quem visita.
import sharp from 'sharp';
import type { Tema } from './temas';

type RGB = [number, number, number];

const hex = ([r, g, b]: RGB) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

function luminancia([r, g, b]: RGB) {
  const f = (v: number) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contraste(a: RGB, b: RGB) {
  const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (escuro + 0.05);
}

function saturacao([r, g, b]: RGB) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

// Saturação pesada pelo brilho: cor viva de verdade, não um marrom escuro.
const vivacidade = (c: RGB) => saturacao(c) ** 2 * (Math.max(...c) / 255);

const distancia = (a: RGB, b: RGB) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// Empurra uma cor para o claro ou para o escuro até dar leitura sobre o fundo.
function garantirLeitura(cor: RGB, fundo: RGB, minimo: number): RGB {
  if (contraste(cor, fundo) >= minimo) return cor;
  const alvo: RGB = luminancia(fundo) > 0.4 ? [0, 0, 0] : [255, 255, 255];
  for (let t = 0.1; t <= 1; t += 0.1) {
    const tentativa = cor.map((v, i) => v + (alvo[i] - v) * t) as RGB;
    if (contraste(tentativa, fundo) >= minimo) return tentativa;
  }
  return alvo;
}

export async function temaDaImagem(imagem: Buffer): Promise<Tema> {
  const { data } = await sharp(imagem).resize(48, 48, { fit: 'cover' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });

  // Agrupa os pixels em faixas de cor e guarda a média de cada faixa.
  const grupos = new Map<number, { soma: RGB; n: number }>();
  for (let i = 0; i < data.length; i += 3) {
    const chave = ((data[i] >> 5) << 6) | ((data[i + 1] >> 5) << 3) | (data[i + 2] >> 5);
    const g = grupos.get(chave) ?? { soma: [0, 0, 0] as RGB, n: 0 };
    g.soma[0] += data[i];
    g.soma[1] += data[i + 1];
    g.soma[2] += data[i + 2];
    g.n++;
    grupos.set(chave, g);
  }
  const cores = [...grupos.values()]
    .map((g) => ({ cor: g.soma.map((v) => v / g.n) as RGB, peso: g.n }))
    .sort((a, b) => b.peso - a.peso);

  // Fundo: a cor que mais aparece, dando preferência a cores com alguma saturação
  // para o site não ficar cinza quando a arte tem muito preto ou branco.
  const total = cores.reduce((s, c) => s + c.peso, 0);
  const candidatosFundo = cores.filter((c) => c.peso / total > 0.04);
  const fundo = (candidatosFundo.sort((a, b) => b.peso * (0.35 + saturacao(b.cor)) - a.peso * (0.35 + saturacao(a.cor)))[0] ?? cores[0]).cor;

  // Texto: entre as cores presentes, a de maior contraste com o fundo.
  const presentes = cores.filter((c) => c.peso / total > 0.01);
  const melhor = presentes.sort((a, b) => contraste(b.cor, fundo) - contraste(a.cor, fundo))[0]?.cor ?? fundo;
  const texto = garantirLeitura(melhor, fundo, 4.5);

  // Destaque: a cor mais viva que não se confunde com as outras duas.
  const vivas = cores
    .filter((c) => c.peso / total > 0.005 && distancia(c.cor, fundo) > 70 && distancia(c.cor, texto) > 70)
    .sort((a, b) => vivacidade(b.cor) * Math.sqrt(b.peso) - vivacidade(a.cor) * Math.sqrt(a.peso));
  const destaque = garantirLeitura(vivas[0]?.cor ?? texto, fundo, 3);

  return { fundo: hex(fundo), texto: hex(texto), destaque: hex(destaque) };
}
