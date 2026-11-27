// Lê medidas direto de src/layouts/Base.astro, para o Camarim mostrar o que o site usa de fato.
import base from '../../../layouts/Base.astro?raw';

/** Valor de um token de :root, como --e-3. */
export const token = (nome: string) => {
  const valor = base.match(new RegExp(`^\\s+--${nome}: ([^;]+);`, 'm'))?.[1];
  if (!valor) throw new Error(`Token --${nome} ausente em Base.astro.`);
  return valor;
};

/** Declarações de uma classe global, como .t-grande. */
export const regra = (classe: string) => {
  const corpo = base.match(new RegExp(`^\\s+\\.${classe} \\{([^}]+)\\}`, 'm'))?.[1];
  if (!corpo) throw new Error(`Classe .${classe} ausente em Base.astro.`);
  return Object.fromEntries(corpo.split(';').map(d => d.split(/:(.+)/).map(s => s.trim())).filter(([k, v]) => k && v)) as Record<string, string>;
};
