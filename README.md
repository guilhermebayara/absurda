# Site da @bsurda

Site estático feito em [Astro](https://astro.build), hospedado na Cloudflare.

## Onde fica cada coisa

| O quê | Onde |
|---|---|
| Dados gerais (links, e-mail, menu) | `src/config.ts` |
| Pessoas (equipe atual e quem fez parte) | `src/content/pessoas/` (um arquivo por pessoa) |
| Projetos | `src/content/projetos/` (um arquivo por projeto) |
| Parceiros | `src/data/parceiros.json` |
| Marcos da história | `src/data/marcos.json` |
| Eventos fora do Shotgun e da Sympla | `src/data/eventos-manual.json` |
| Junção das fontes da agenda | `src/lib/eventos.ts` |
| Páginas | `src/pages/` |

Para mover alguém da equipe atual para "quem fez parte", troque `situacao: atual` por `situacao: anterior` no arquivo da pessoa.

## Rodar no computador

```
npm install
npm run dev
```

## Publicação

A Cloudflare publica sozinha a cada alteração na branch `main`.
Comando de build: `npx astro build`. Comando de deploy: `npx wrangler@latest deploy`.

## Situação

Esqueleto com texto e imagem de marcação. O visual atual é provisório.
