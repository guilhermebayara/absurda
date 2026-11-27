// A medida exibida na interação vem da célula estática que confere:camarim verificou.
export function iniciarProvasDeCor(raiz: HTMLElement) {
  const paleta = raiz.querySelector<HTMLSelectElement>('[data-paleta-escolhida]')!;
  const usos = [...raiz.querySelectorAll<HTMLSelectElement>('[data-uso]')];
  const grupos = [...raiz.querySelectorAll<HTMLFieldSetElement>('[data-tons]')];
  const prova = raiz.querySelector<HTMLElement>('[data-prova]')!;
  const parecer = raiz.querySelector<HTMLElement>('[data-parecer]')!;
  const modos = [...raiz.querySelectorAll<HTMLAnchorElement>('.leituras a')];
  const campos = (seletor: string, texto: string) => { raiz.querySelector(seletor)!.textContent = texto; };
  const textos: Record<string, [string, string]> = {
    'texto/fundo': ['Na pista', 't-apoio'], 'suave/fundo': ['Portas às 22h', 't-pequeno'],
    'destaque-texto/fundo': ['Próxima edição', 'etiqueta'], 'fundo/texto': ['Agenda', 'etiqueta'],
    'sobre-vivo/vivo': ['Luma', 't-medio'],
  };
  let par = usos[0].value;
  let ultimaOrganizacao = '';

  function mostrar() {
    const comparar = raiz.dataset.modo === 'uso';
    const grupo = grupos.find(g => g.dataset.tons === paleta.value)!;
    grupos.forEach(g => { g.hidden = g !== grupo; });
    const temas = [...grupo.querySelectorAll<HTMLInputElement>('input')]
      .sort((a, b) => Number(a.closest('label')!.dataset.ordem) - Number(b.closest('label')!.dataset.ordem));
    const tema = temas.find(t => t.checked) ?? temas[0];
    tema.checked = true;
    const [cor, fundo] = par.split('/');
    const rotulo = tema.closest('label')!;
    const nome = rotulo.title;
    const tinta = (chave: string) => rotulo.style.getPropertyValue('--tom-' + chave);
    for (const chave of rotulo.style) {
      if (chave.startsWith('--tom-')) prova.style.setProperty('--' + chave.slice(6), rotulo.style.getPropertyValue(chave));
    }
    const aprovados: HTMLLabelElement[] = [];
    const abaixo: HTMLLabelElement[] = [];
    const organizacao = [paleta.value, par, raiz.dataset.modo].join('/');
    for (const item of temas) {
      const etiqueta = item.closest('label')!;
      etiqueta.style.setProperty('--tinta-par', etiqueta.style.getPropertyValue('--tom-' + cor));
      etiqueta.style.setProperty('--papel-par', etiqueta.style.getPropertyValue('--tom-' + fundo));
      const reprovado = document.querySelector<HTMLElement>(`tr[data-camarim-tema="${item.value}"] td[data-par="${par}"]`)?.dataset.cumpre === 'nao';
      (comparar && reprovado ? abaixo : aprovados).push(etiqueta);
      if (textos[par]) {
        const palavra = etiqueta.querySelector<HTMLElement>('.palavra')!;
        const [amostra, classe] = textos[par];
        palavra.textContent = amostra;
        palavra.className = 'palavra ' + classe;
      }
    }
    // Não mova o rádio que a pessoa está percorrendo com as setas.
    if (organizacao !== ultimaOrganizacao) {
      grupo.querySelector('[data-aprovados] .opcoes')!.replaceChildren(...aprovados);
      grupo.querySelector('[data-abaixo] .opcoes')!.replaceChildren(...abaixo);
      grupo.querySelector<HTMLElement>('[data-aprovados]')!.hidden = aprovados.length === 0;
      grupo.querySelector<HTMLElement>('[data-abaixo]')!.hidden = abaixo.length === 0;
      const titulo = grupo.querySelector<HTMLElement>('[data-conta-aprovados]')!;
      titulo.hidden = !comparar;
      titulo.textContent = 'Dentro da regra · ' + aprovados.length;
      grupo.querySelector('[data-conta-abaixo]')!.textContent = 'Abaixo do mínimo · ' + abaixo.length;
      ultimaOrganizacao = organizacao;
    }
    for (const uso of usos) uso.value = par;
    raiz.dataset.figura = usos[0].selectedOptions[0].dataset.figura;
    prova.hidden = comparar;
    parecer.hidden = !comparar;
    raiz.querySelector<HTMLElement>('[data-so-prova]')!.hidden = comparar;
    raiz.querySelector<HTMLElement>('[data-so-comparacao]')!.hidden = !comparar;
    modos.forEach(a => {
      if (a.hash === (comparar ? '#comparar-uso' : '#provar-tema')) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    campos('[data-instrucao]', comparar
      ? 'Veja o mesmo uso em toda a paleta. Escolha um tema para consultar a medida.'
      : 'Escolha uma combinação para ver o que muda no letreiro, no crachá e na faixa.');
    campos('[data-edicao]', paleta.selectedOptions[0].textContent!.split(' (')[0] + ' · ' + (temas.indexOf(tema) + 1) + ' de ' + temas.length);
    campos('[data-nome-tema]', nome);
    campos('[data-nome-ficha]', ' · ' + nome);
    const celula = document.querySelector<HTMLTableCellElement>(`tr[data-camarim-tema="${tema.value}"] td[data-par="${par}"]`)!;
    const uso = usos[0].selectedOptions[0].textContent;
    parecer.textContent = nome + ' · ' + uso + ' · ' + celula.querySelector('strong')!.textContent + '. ' + (celula.dataset.cumpre === 'sim' ? 'Atende à regra do site.' : 'Fica abaixo do mínimo do site.');
    campos('[data-valor-cor]', tinta(cor));
    campos('[data-valor-fundo]', tinta(fundo));
    const razao = celula.querySelector('strong')!.textContent!;
    campos('[data-razao]', razao);
    rotulo.querySelector('.medida-tom')!.textContent = razao + ' · ' + celula.querySelector(':scope > span:last-child')!.textContent!.trim();
    campos('[data-nivel]', [...celula.querySelectorAll<HTMLElement>(':scope > span')].map(s => s.textContent!.trim()).join(' / '));
    raiz.querySelector<HTMLElement>('[data-tinta]')!.style.backgroundColor = tinta(cor);
    raiz.querySelector<HTMLElement>('[data-papel]')!.style.backgroundColor = tinta(fundo);
  }

  function navegar() {
    if (location.hash === '#comparar-uso') raiz.dataset.modo = 'uso';
    if (location.hash === '#provar-tema' || location.hash === '#temas') raiz.dataset.modo = 'tema';
    mostrar();
  }
  raiz.addEventListener('change', e => {
    if (e.target instanceof HTMLSelectElement && e.target.matches('[data-uso]')) par = e.target.value;
    mostrar();
  });
  window.addEventListener('hashchange', navegar);
  navegar();
  raiz.hidden = false;
  if (modos.some(a => a.hash === location.hash)) document.getElementById(location.hash.slice(1))?.scrollIntoView();
}
