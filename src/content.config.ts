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
    instagram: z.string().optional(),
    links: z.array(z.object({ rotulo: z.string(), url: z.string() })).default([]),
  }),
});

const projetos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projetos' }),
  schema: z.object({
    nome: z.string(),
    resumo: z.string(),
    situacao: z.enum(['ativo', 'em-elaboracao', 'arquivo']).default('ativo'),
    ordem: z.number().default(99),
    capa: z.string().optional(),
    pessoas: z.array(reference('pessoas')).default([]),
  }),
});

const parceiros = defineCollection({
  loader: file('src/data/parceiros.json'),
  schema: z.object({
    nome: z.string(),
    tipo: z.enum(['apoio', 'captacao', 'fornecedor']),
    logo: z.string().optional(),
    url: z.string().optional(),
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
