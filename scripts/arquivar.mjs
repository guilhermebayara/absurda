// Copia para dentro do site os eventos que já passaram e ainda dependem de uma
// plataforma. Roda depois de "astro build", que gera dist/arquivo-pendente.json.
//
// Para cada evento novo:
//   1. baixa a capa e guarda duas versões em public/arquivo (grande e miniatura);
//   2. acrescenta o evento em src/data/arquivo.json.
// O que já está no arquivo nunca é alterado nem removido por este script.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const PENDENTES = 'dist/arquivo-pendente.json';
const ARQUIVO = 'src/data/arquivo.json';
const PASTA = 'public/arquivo';

const pendentes = JSON.parse(await readFile(PENDENTES, 'utf8'));
const arquivo = JSON.parse(await readFile(ARQUIVO, 'utf8'));
const guardados = new Set(arquivo.map((e) => e.id));
await mkdir(PASTA, { recursive: true });

let novos = 0;
let semCapa = 0;
for (const e of pendentes) {
  if (guardados.has(e.id)) continue;
  const registro = { id: e.id, nome: e.nome, data: e.data, url: e.url, origem: e.origem };
  if (e.local) registro.local = e.local;
  if (e.capa) {
    try {
      const resposta = await fetch(e.capa);
      // Capa que não existe mais na plataforma: o evento entra sem ela.
      if (resposta.status === 404 || resposta.status === 410) throw Object.assign(new Error('capa removida'), { definitivo: true });
      if (!resposta.ok) throw new Error(`resposta ${resposta.status}`);
      const imagem = Buffer.from(await resposta.arrayBuffer());
      // A plataforma respondeu, mas o que veio não é uma imagem que dê para ler (acontece
      // com a capa padrão de eventos antigos): o evento entra sem capa.
      try { await sharp(imagem).metadata(); } catch { throw Object.assign(new Error('capa ilegível'), { definitivo: true }); }
      await sharp(imagem).resize({ width: 800, withoutEnlargement: true }).jpeg({ quality: 80 }).toFile(`${PASTA}/${e.id}.jpg`);
      await sharp(imagem).resize({ width: 240 }).jpeg({ quality: 72 }).toFile(`${PASTA}/${e.id}-p.jpg`);
      registro.capa = `/arquivo/${e.id}.jpg`;
      registro.capaPequena = `/arquivo/${e.id}-p.jpg`;
    } catch (erro) {
      if (erro.definitivo) {
        console.log(`Sem capa aproveitável (${erro.message}), entra sem capa: ${e.nome}`);
        arquivo.push(registro);
        guardados.add(e.id);
        novos++;
        continue;
      }
      // Falha passageira: o evento fica para a próxima rodada, para não guardar
      // para sempre um registro incompleto.
      console.log(`Capa não baixada, fica para a próxima: ${e.nome} (${erro.message})`);
      semCapa++;
      continue;
    }
  }
  arquivo.push(registro);
  guardados.add(e.id);
  novos++;
}

arquivo.sort((a, b) => new Date(b.data) - new Date(a.data));
await writeFile(ARQUIVO, `${JSON.stringify(arquivo, null, 1)}\n`);
console.log(`Arquivo: ${novos} evento(s) novo(s), ${semCapa} adiado(s) por falta de capa, ${arquivo.length} no total.`);
