// Prova de um tema e comparação de um uso. As cores vêm do build (data-cores em cada tema) e as
// medidas são lidas das células da tabela de contraste, que o confere:camarim confere contra o
// confere:temas. Nada é calculado aqui.

type Cores = Record<string, string>;

const celula = (tema: string, par: string) =>
  document.querySelector<HTMLTableCellElement>(`tr[data-camarim-tema="${tema}"] td[data-par="${par}"]`);

// Amostra de um par: "Aa" para leitura, barra para enfeite (o desenho vem do CSS de .par).
function amostra(cores: Cores, par: string, enfeite: boolean) {
  const [cor, superficie] = par.split('/');
  const i = document.createElement('i');
  i.className = enfeite ? 'par par-enfeite' : 'par';
  i.setAttribute('aria-hidden', 'true');
  i.style.background = cores[superficie];
  i.style.color = cores[cor];
  return i;
}

const temasDa = (raiz: HTMLElement, paleta: string) =>
  [...raiz.querySelectorAll<HTMLInputElement>(`[data-fita="${paleta}"] input`)];

export function iniciarProva(raiz: HTMLElement) {
  const paleta = raiz.querySelector<HTMLSelectElement>('[data-paleta]')!;
  const palco = raiz.querySelector<HTMLElement>('[data-palco]')!;
  const lista = raiz.querySelector<HTMLUListElement>('[data-pares]')!;
  const ir = raiz.querySelector<HTMLAnchorElement>('[data-ir-tema]')!;
  const usos = [...document.querySelectorAll<HTMLTableCellElement>('thead th[data-par]')].slice(0, 10);

  function mostrar() {
    for (const fita of raiz.querySelectorAll<HTMLFieldSetElement>('[data-fita]')) fita.hidden = fita.dataset.fita !== paleta.value;
    const temas = temasDa(raiz, paleta.value);
    const tema = temas.find(t => t.checked) ?? temas[0];
    tema.checked = true;
    const cores: Cores = JSON.parse(tema.dataset.cores!);
    for (const [nome, valor] of Object.entries(cores)) palco.style.setProperty('--' + nome, valor);
    for (const alvo of raiz.querySelectorAll('[data-nome-tema], [data-nome-lista]')) alvo.textContent = tema.dataset.nome!;
    raiz.querySelector('[data-numero]')!.textContent = `${paleta.selectedOptions[0].textContent!.split(' · ')[0]} · ${temas.indexOf(tema) + 1} de ${temas.length}`;
    ir.href = '#' + tema.value;
    lista.replaceChildren(...usos.map(th => {
      const par = th.dataset.par!;
      const medida = celula(tema.value, par)!;
      const enfeite = medida.querySelectorAll('.nivel').length > 1;
      const li = document.createElement('li');
      const nome = document.createElement('span');
      nome.textContent = th.querySelector('.uso')!.textContent;
      const razao = document.createElement('strong');
      razao.textContent = medida.querySelector('strong')!.textContent;
      const nivel = document.createElement('small');
      const niveis = [...medida.querySelectorAll<HTMLElement>(':scope > .nivel')].map(n => n.textContent!.trim());
      nivel.textContent = niveis.join(' · ') + (medida.dataset.cumpre === 'sim' ? '. Dentro da regra.' : '. Abaixo da regra do site.');
      li.append(amostra(cores, par, enfeite), nome, razao, nivel);
      return li;
    }));
  }

  raiz.addEventListener('change', mostrar);
  mostrar();
  raiz.hidden = false;
}

export function iniciarComparacao(raiz: HTMLElement, prova: HTMLElement) {
  const paleta = raiz.querySelector<HTMLSelectElement>('[data-paleta]')!;
  const uso = raiz.querySelector<HTMLSelectElement>('[data-uso]')!;
  const dentro = raiz.querySelector<HTMLElement>('[data-dentro]')!;
  const abaixo = raiz.querySelector<HTMLElement>('[data-abaixo]')!;

  function mostrar() {
    const par = uso.value;
    const enfeite = uso.selectedOptions[0].hasAttribute('data-enfeite');
    raiz.querySelector('[data-regra]')!.textContent = enfeite
      ? 'Enfeite: a regra do site pede 3:1.'
      : 'Leitura: a regra do site pede 4,5:1.';
    const grupos = { sim: [] as HTMLLIElement[], nao: [] as HTMLLIElement[] };
    for (const tema of temasDa(prova, paleta.value)) {
      const medida = celula(tema.value, par)!;
      const li = document.createElement('li');
      const nome = document.createElement('a');
      nome.href = '#' + tema.value;
      nome.textContent = tema.dataset.nome!;
      const razao = document.createElement('span');
      razao.textContent = `${medida.querySelector('strong')!.textContent} · ${medida.querySelector('.nivel')!.textContent!.trim()}`;
      li.append(amostra(JSON.parse(tema.dataset.cores!), par, enfeite), nome, razao);
      grupos[medida.dataset.cumpre === 'sim' ? 'sim' : 'nao'].push(li);
    }
    for (const [bloco, itens, rotulo] of [[dentro, grupos.sim, 'Dentro da regra'], [abaixo, grupos.nao, 'Abaixo da regra']] as const) {
      bloco.hidden = itens.length === 0;
      bloco.querySelector('[data-conta]')!.textContent = `${rotulo} · ${itens.length}`;
      bloco.querySelector('ul')!.replaceChildren(...itens);
    }
  }

  raiz.addEventListener('change', mostrar);
  mostrar();
  raiz.hidden = false;
}
