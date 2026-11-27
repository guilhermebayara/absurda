import base from '../../layouts/Base.astro?raw';

export const valor = (nome: string) => {
  const token = base.match(new RegExp(`^    --${nome}: ([^;]+);`, 'm'))?.[1];
  if (!token) throw new Error(`Token --${nome} ausente em Base.astro.`);
  return token;
};
