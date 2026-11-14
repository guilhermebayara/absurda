// Quem faz a festa fora da cabine: aparece como pulseira na página Equipe. Não entra na lista
// da cena no Sobre (regra do Gui); lá só consta quem tem crachá.
// Fora da cabine. "url" é opcional: perfil, site, o que fizer sentido para cada um.
// Com "url", informe também "destino", o nome curto que aparece na ponta da pulseira
// ("Instagram", "Site").
// "grupo" decide a cor da pulseira: quem trabalha com a mesma coisa usa a mesma cor, ainda que a
// área escrita na estampa seja diferente (foto, foto e vídeo).
export const foraDaCabine: { area: string; grupo: string; nome: string; url?: string; destino?: string }[] = [
  { area: 'Foto e vídeo', grupo: 'imagem', nome: 'Estilingue', url: 'https://www.instagram.com/estilingue/', destino: 'Instagram' },
  { area: 'Foto', grupo: 'imagem', nome: 'Felipe Cesar', url: 'https://www.instagram.com/felipecesard_/', destino: 'Instagram' },
  { area: 'Foto', grupo: 'imagem', nome: 'Yury Oliveira', url: 'https://www.instagram.com/hey.yury/', destino: 'Instagram' },
  { area: 'Bar', grupo: 'bar', nome: 'Jaci', url: 'https://linktr.ee/jacigestaodebares', destino: 'Linktree' },
  { area: 'Som e luz', grupo: 'som', nome: 'Léo' },
  { area: 'Cenografia', grupo: 'cenografia', nome: 'Ayumi', url: 'https://www.instagram.com/_ayuready/', destino: 'Instagram' },
];
