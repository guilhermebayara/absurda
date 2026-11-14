// Copia para notas/escalacoes/ o texto de descrição de cada evento da @bsurda no Sympla e no
// Shotgun, lido pela API das próprias contas. As descrições guardam crew, convidados e
// créditos de cada festa: é o material para montar a tabela de quem tocou em que ano
// (ver notas/equipe-insumos.md). Não entra no site: é só nota de trabalho.
//
// Roda no GitHub (.github/workflows/escalacoes.yml), onde ficam as chaves. Nunca escreve
// chave nem endereço com chave nos arquivos nem no registro.
import { writeFile, mkdir } from 'node:fs/promises';

const PASTA = 'notas/escalacoes';
await mkdir(PASTA, { recursive: true });

// HTML da descrição vira texto com uma informação por linha.
function texto(html) {
  return String(html ?? '')
    .replace(/<br[^>]*>/gi, '\n')
    .replace(/<\/(p|div|li|h\d|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n');
}

async function sympla(token) {
  const eventos = [];
  for (let pagina = 1; pagina <= 30; pagina++) {
    const endereco = new URL('https://api.sympla.com.br/public/v3/events');
    endereco.searchParams.set('published', 'all');
    endereco.searchParams.set('page_size', '200');
    endereco.searchParams.set('page', String(pagina));
    const resposta = await fetch(endereco, { headers: { s_token: token } });
    if (!resposta.ok) throw new Error(`Sympla respondeu ${resposta.status}`);
    const corpo = await resposta.json();
    const lote = corpo.data ?? [];
    eventos.push(...lote);
    if (!corpo.pagination?.has_next || lote.length === 0) break;
  }
  const saida = [];
  for (const e of eventos) {
    if (e.cancelled || e.private_event || e.published === 0) continue;
    let detalhe = e.detail;
    // Se a lista não trouxer a descrição, busca o evento sozinho.
    if (detalhe === undefined) {
      try {
        const r = await fetch(`https://api.sympla.com.br/public/v3/events/${e.id}`, { headers: { s_token: token } });
        if (r.ok) detalhe = (await r.json()).data?.detail;
      } catch { /* fica sem descrição */ }
    }
    saida.push({ id: `sympla-${e.reference_id ?? e.id}`, nome: e.name, data: e.start_date, imagem: e.image || undefined, texto: texto(detalhe) });
  }
  return saida;
}

async function shotgun(organizador, token) {
  const pagina = async (parametros) => {
    const endereco = new URL(`https://smartboard-api.shotgun.live/api/shotgun/organizers/${encodeURIComponent(organizador)}/events`);
    endereco.searchParams.set('key', token);
    for (const [c, v] of Object.entries(parametros)) endereco.searchParams.set(c, v);
    const resposta = await fetch(endereco);
    if (!resposta.ok) throw new Error(`Shotgun respondeu ${resposta.status}`);
    return (await resposta.json()).data ?? [];
  };
  const eventos = [...(await pagina({}))];
  for (let p = 0; p < 60; p++) {
    const lote = await pagina({ past_events: 'true', page: String(p), limit: '50' });
    eventos.push(...lote);
    if (lote.length < 50) break;
  }
  const vistos = new Set();
  const unicos = eventos.filter((e) => !vistos.has(e.id) && vistos.add(e.id));
  // Não se sabe de antemão em que campo a descrição vem: guarda os nomes dos campos e todo
  // campo de texto comprido que não seja endereço de página ou de imagem.
  const campos = [...new Set(unicos.flatMap((e) => Object.keys(e)))].sort();
  const saida = unicos.map((e) => {
    const textos = {};
    for (const [c, v] of Object.entries(e)) {
      if (typeof v === 'string' && v.length > 120 && !/^https?:\/\//.test(v)) textos[c] = texto(v);
    }
    return { id: `shotgun-${e.id}`, nome: e.name, data: e.startTime, artistas: e.artists ?? e.lineup ?? undefined, textos };
  });
  return { campos, eventos: saida };
}

const resumo = {};
const contas = [process.env.SYMPLA_TOKEN, process.env.SYMPLA_TOKEN_3].map((t) => t?.trim()).filter(Boolean);
if (contas.length) {
  try {
    const listas = [];
    for (const token of contas) listas.push(...(await sympla(token)));
    const vistos = new Set();
    const unicos = listas.filter((e) => !vistos.has(e.id) && vistos.add(e.id)).sort((a, b) => String(a.data).localeCompare(String(b.data)));
    await writeFile(`${PASTA}/sympla.json`, `${JSON.stringify(unicos, null, 1)}\n`);
    // Capas das festas de 2012 e do começo de 2013: no site elas aparecem pelo álbum do Flickr,
    // que não tem a arte. A arte está no Sympla; fica guardada aqui para ser ligada ao álbum.
    await mkdir(`${PASTA}/capas`, { recursive: true });
    let capas = 0;
    for (const e of unicos.filter((x) => x.imagem && String(x.data) < '2013-07')) {
      try {
        const r = await fetch(e.imagem);
        // Evento sem arte devolve uma página no lugar da imagem: só guarda o que for imagem.
        if (!r.ok || !(r.headers.get('content-type') ?? '').startsWith('image/')) continue;
        const tipo = (r.headers.get('content-type') ?? '').includes('png') ? 'png' : 'jpg';
        await writeFile(`${PASTA}/capas/${e.id}.${tipo}`, Buffer.from(await r.arrayBuffer()));
        capas++;
      } catch { /* sem capa */ }
    }
    resumo.capasAntigas = capas;
    resumo.sympla = { eventos: unicos.length, comTexto: unicos.filter((e) => e.texto).length };
  } catch (erro) { resumo.sympla = { erro: erro.message }; }
} else resumo.sympla = { erro: 'sem chave' };

const organizador = process.env.SHOTGUN_ORGANIZER_ID?.trim();
const chave = process.env.SHOTGUN_TOKEN?.trim();
if (organizador && chave) {
  try {
    const dados = await shotgun(organizador, chave);
    await writeFile(`${PASTA}/shotgun.json`, `${JSON.stringify(dados, null, 1)}\n`);
    resumo.shotgun = { eventos: dados.eventos.length, campos: dados.campos.length };
  } catch (erro) { resumo.shotgun = { erro: erro.message.replace(/key=[^&\s]+/g, 'key=***') }; }
} else resumo.shotgun = { erro: 'sem chave' };

// Artes das festas antigas: candidatas escolhidas nos álbuns do Flickr (as fotos do começo e do
// fim de cada álbum, onde o flyer costuma estar). A lista fica em flickr-candidatas.json, por
// álbum; aqui só se baixa o que ainda não foi baixado, para alguém olhar e escolher a capa.
try {
  const { readFile, access } = await import('node:fs/promises');
  const candidatas = JSON.parse(await readFile(`${PASTA}/flickr-candidatas.json`, 'utf8'));
  await mkdir(`${PASTA}/flickr-candidatas`, { recursive: true });
  let baixadas = 0;
  for (const [album, fotos] of Object.entries(candidatas)) {
    for (const [i, caminho] of fotos.entries()) {
      const destino = `${PASTA}/flickr-candidatas/${album}-${i + 1}.jpg`;
      try { await access(destino); continue; } catch { /* ainda não baixada */ }
      const r = await fetch(`https://live.staticflickr.com/${caminho}`);
      if (!r.ok || !(r.headers.get('content-type') ?? '').startsWith('image/')) continue;
      await writeFile(destino, Buffer.from(await r.arrayBuffer()));
      baixadas++;
    }
  }
  resumo.flickrCandidatas = baixadas;
} catch (erro) { resumo.flickrCandidatas = { erro: erro.message }; }

await writeFile(`${PASTA}/resumo.json`, `${JSON.stringify({ geradoEm: new Date().toISOString(), ...resumo }, null, 1)}\n`);
console.log(JSON.stringify(resumo));
