// Gera src/data/atracoes.json a partir da planilha "Atrações do site" (Drive, 10_site/4_Sobre),
// aba "Para o site" publicada como CSV. É a base das listas "Quem a gente trouxe" e "E a cena de
// BH", do Sobre. O site nunca lê a planilha ao vivo: este script copia, o Gui confere na prévia da
// `design` e só então vai para a `main`. Ver notas/briefs/atracoes.md.
//
// Uso:
//   npm run atracoes                          lê o endereço de ATRACOES_CSV_URL
//   npm run atracoes -- --arquivo caminho.csv lê um CSV exportado (para testar sem rede)
//
// Se alguma validação falhar, nada é escrito e a mensagem diz o nome e a linha.
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const SAIDA = 'src/data/atracoes.json';

// Bandeira de quem veio de fora do Brasil. País sem bandeira aqui é erro: acrescente na lista.
const BANDEIRAS = { 'EUA': '🇺🇸', 'Porto Rico': '🇵🇷' };

// Regras firmes do Gui. The Ladies fica fora por ora. Sharon Needles entra, mas sempre com o nome
// riscado (já foi atração; hoje está cancelada como artista).
const FORA_DAS_LISTAS = ['The Ladies'];
const SEMPRE_RISCADO = ['Sharon Needles'];

const GRUPOS = { 'Quem a gente trouxe': 'quemTrouxemos', 'Cena de BH': 'cena' };
const MARCACOES = { 'em memória': 'memoria', 'riscado': 'riscado' };

const chave = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR').trim();

// CSV simples: aspas, vírgulas e quebras de linha dentro de aspas.
function lerCsv(texto) {
  const linhas = [];
  let campo = '', linha = [], aspas = false;
  const t = texto.replace(/^﻿/, '');
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (aspas) {
      if (c === '"' && t[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') aspas = false;
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === ',') { linha.push(campo); campo = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++;
      linha.push(campo); linhas.push(linha); campo = ''; linha = [];
    } else campo += c;
  }
  if (campo !== '' || linha.length) { linha.push(campo); linhas.push(linha); }
  return linhas;
}

async function fonte() {
  const i = process.argv.indexOf('--arquivo');
  if (i > -1) {
    const caminho = process.argv[i + 1];
    if (!caminho || !existsSync(caminho)) throw new Error(`Arquivo não encontrado: ${caminho}`);
    return readFile(caminho, 'utf8');
  }
  const url = process.env.ATRACOES_CSV_URL;
  if (!url) {
    throw new Error('Falta o endereço da aba "Para o site" publicada como CSV (variável ATRACOES_CSV_URL) ou um arquivo (--arquivo caminho.csv).');
  }
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error(`A planilha respondeu ${resposta.status}`);
  return resposta.text();
}

const linhas = lerCsv(await fonte()).filter((l) => l.some((c) => c.trim() !== ''));
const [cabecalho, ...dados] = linhas;
if (!cabecalho) throw new Error('A planilha veio vazia.');
const col = (inicio) => {
  const i = cabecalho.findIndex((c) => chave(c).startsWith(chave(inicio)));
  if (i < 0) throw new Error(`Falta a coluna "${inicio}" na aba "Para o site".`);
  return i;
};
const C = { nome: col('Nome'), grupo: col('Grupo'), ordem: col('Ordem'), marca: col('Marca'), marcacao: col('Marcação') };

const erros = [];
const vistos = new Map();
const quemTrouxemos = [];
const cena = [];

dados.forEach((l, i) => {
  const n = i + 2; // linha na aba (o cabeçalho é a 1)
  const nome = (l[C.nome] ?? '').trim();
  const grupo = (l[C.grupo] ?? '').trim();
  const ordem = (l[C.ordem] ?? '').trim();
  const marca = (l[C.marca] ?? '').trim();
  const marcacao = (l[C.marcacao] ?? '').trim();
  const onde = `linha ${n}${nome ? ` (${nome})` : ''}`;

  if (!nome) return erros.push(`${onde}: sem nome.`);
  if (vistos.has(chave(nome))) return erros.push(`${onde}: nome repetido (já aparece na linha ${vistos.get(chave(nome))}).`);
  vistos.set(chave(nome), n);
  if (!GRUPOS[grupo]) return erros.push(`${onde}: grupo desconhecido "${grupo}".`);
  if (marcacao && !MARCACOES[marcacao]) erros.push(`${onde}: marcação desconhecida "${marcacao}" (use "em memória" ou "riscado").`);
  if (FORA_DAS_LISTAS.some((f) => chave(f) === chave(nome))) erros.push(`${onde}: ${nome} fica fora de todas as listas (decisão do Gui).`);
  if (SEMPRE_RISCADO.some((f) => chave(f) === chave(nome)) && marcacao !== 'riscado') erros.push(`${onde}: ${nome} só entra com a marcação "riscado" (decisão do Gui).`);

  const item = { nome };
  if (MARCACOES[marcacao]) item[MARCACOES[marcacao]] = true;

  if (GRUPOS[grupo] === 'quemTrouxemos') {
    if (!/^\d+$/.test(ordem)) return erros.push(`${onde}: "Quem a gente trouxe" precisa de Ordem (número).`);
    if (marca) {
      if (!BANDEIRAS[marca]) return erros.push(`${onde}: país "${marca}" sem bandeira. Acrescente em BANDEIRAS, no script.`);
      item.de = marca;
      item.bandeira = BANDEIRAS[marca];
    }
    quemTrouxemos.push({ ...item, ordem: Number(ordem) });
  } else {
    if (marca) item.marca = marca;
    cena.push(item);
  }
});

const repetidas = quemTrouxemos.map((x) => x.ordem).filter((o, i, a) => a.indexOf(o) !== i);
if (repetidas.length) erros.push(`Ordem repetida em "Quem a gente trouxe": ${[...new Set(repetidas)].join(', ')}.`);

if (erros.length) {
  console.error(`A planilha não passou nas conferências. Nada foi escrito:\n- ${erros.join('\n- ')}`);
  process.exit(1);
}

quemTrouxemos.sort((a, b) => a.ordem - b.ordem);
cena.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
const novo = { quemTrouxemos: quemTrouxemos.map(({ ordem, ...resto }) => resto), cena };

// Resumo: quem entrou e quem saiu em relação ao arquivo anterior.
let antes = { quemTrouxemos: [], cena: [] };
if (existsSync(SAIDA)) antes = JSON.parse(await readFile(SAIDA, 'utf8'));
const nomes = (d) => new Set([...d.quemTrouxemos, ...d.cena].map((x) => x.nome));
const a = nomes(antes), d = nomes(novo);
const entraram = [...d].filter((x) => !a.has(x));
const sairam = [...a].filter((x) => !d.has(x));

await writeFile(SAIDA, JSON.stringify(novo, null, 2) + '\n');
console.log(`${SAIDA}: ${novo.quemTrouxemos.length} em "Quem a gente trouxe" e ${novo.cena.length} na cena de BH.`);
if (entraram.length) console.log(`Entraram (${entraram.length}): ${entraram.join(', ')}`);
if (sairam.length) console.log(`ATENÇÃO, saíram (${sairam.length}): ${sairam.join(', ')}`);
if (!entraram.length && !sairam.length) console.log('Nenhum nome entrou nem saiu.');
