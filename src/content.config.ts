import { defineCollection, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

// Pessoas: equipe atual e quem já fez parte ficam na mesma lista.
// O campo "situacao" decide em qual bloco da página Equipe a pessoa aparece.
const pessoas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pessoas' }),
  schema: z.object({
    nome: z.string(),
    funcao: z.string(),
    grupo: z.enum(['socios', 'residentes', 'equipe']).default('equipe'),
    situacao: z.enum(['atual', 'anterior']).default('atual'),
    ordem: z.number().default(99),
    foto: z.string().optional(),
    // Ano em que entrou na @bsurda. Aparece no verso do crachá; sem ele, fica a marcação XXXX.
    desde: z.number().optional(),
    // Para quem já saiu: o ano de saída. O crachá mostra o intervalo (desde–ate); sem os anos, XXXX–XXXX.
    ate: z.number().optional(),
    // Número do crachá, na ordem de entrada na festa (Gui e Ed definem). Sem ele, fica a marcação XXX.
    numero: z.number().optional(),
    // Final do código do crachá, quando as iniciais da função não servem (o Gui é PD, e não DP).
    sigla: z.string().optional(),
    instagram: z.string().optional(),
    links: z.array(z.object({ rotulo: z.string(), url: z.string() })).default([]),
  }),
});

const projetos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projetos' }),
  schema: z.object({
    nome: z.string(),
    resumo: z.string(),
    // "arquivo" é projeto adormecido; "independente" nasceu na @bsurda e hoje segue por conta própria.
    situacao: z.enum(['ativo', 'em-elaboracao', 'arquivo', 'independente']).default('ativo'),
    ordem: z.number().default(99),
    capa: z.string().optional(),
    pessoas: z.array(reference('pessoas')).default([]),
    // Ano em que começou, quando a Agenda não alcança (a @bsurda é de 2009).
    desde: z.string().optional(),
    // Edições especiais que não viraram projeto. "filtro" é a expressão que acha as edições na Agenda.
    especiais: z.array(z.object({ nome: z.string(), filtro: z.string(), texto: z.string().optional() })).default([]),
    // Edições históricas: o id do evento na Agenda e uma linha dizendo por quê.
    historicas: z.array(z.object({ evento: z.string(), porque: z.string() })).default([]),
    // Para onde o projeto foi, quando segue fora da @bsurda.
    fora: z.object({ rotulo: z.string(), url: z.string() }).optional(),
  }),
});

// Parceiros: marcas que apoiam hoje ("atual") e o registro de todas as parcerias.
// Cada registro é uma marca num evento: é o que alimenta o histórico da página Parcerias.
// Fornecedores e parceiros recorrentes de produção ficam na página Equipe (Fora da cabine).
const parceiros = defineCollection({
  loader: file('src/data/parceiros.json'),
  schema: z.object({
    nome: z.string(),
    atual: z.boolean().default(false),
    // Só para os atuais: o que a marca faz na festa, uma linha de texto e o link.
    papel: z.string().optional(),
    texto: z.string().optional(),
    url: z.string().optional(),
    destino: z.string().optional(),
    logo: z.string().optional(),
    registros: z.array(z.object({ ano: z.string(), onde: z.string() })).default([]),
  }),
});

const marcos = defineCollection({
  loader: file('src/data/marcos.json'),
  schema: z.object({
    ano: z.string(),
    titulo: z.string(),
    texto: z.string().optional(),
  }),
});

export const collections = { pessoas, projetos, parceiros, marcos };
