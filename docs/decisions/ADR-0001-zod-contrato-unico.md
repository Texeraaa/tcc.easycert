---
tipo: decisao
status: aceito
data: 2026-10-19
data-retroativo: 2026-11-04
---

# ADR-0001 — Adotar Zod + `nestjs-zod` como contrato único web↔api em `@easycert/types`

## Contexto
Backend NestJS e frontend Next.js precisam compartilhar DTOs sem duplicar schemas. Schemas duplicados (um por lado) são a fonte histórica de drift entre validação server-side e tipos TS do cliente. O monorepo já tem `@easycert/types` reservado para contratos compartilhados.

## Decisão
Schemas Zod vivem em `@easycert/types` e são o contrato único. O backend valida com `ValidationPipe` do `nestjs-zod` consumindo o mesmo schema; o frontend usa `z.infer<typeof schema>` para tipos TS e `@hookform/resolvers/zod` em formulários. Quando um DTO muda, o schema muda num só lugar e ambos os lados recompilam contra ele.

## Alternativas consideradas
- **class-validator + class-transformer** — rejeitada porque exige dois universos de API (decorators de classe no backend + schemas separados no frontend), não faz parse (só valida), e perde a vantagem de inferência de tipo que o Zod entrega nativamente.
- **Joi** — rejeitada porque a ergonomia em TypeScript é inferior (tipos derivados menos expressivos) e não tem adaptador first-class para NestJS.
- **Schemas duplicados web/api** — rejeitada porque drift é garantido ao longo do tempo; qualquer mudança exige sincronizar dois arquivos, e nada força isso em CI.

## Consequências
- **Positivas:** contrato único, parse (coerção + validação) ao invés de só validação, inferência de tipo TS sem duplicação, ergonomia alta em React Hook Form.
- **Negativas / trade-offs:** dependência extra no backend (`nestjs-zod`); curva de aprendizado para quem só conhece class-validator.
- **Invariantes criadas:**
  - DTOs expostos no frontend vêm sempre de `@easycert/types`, nunca duplicados em `apps/web/`.
  - Endpoints do backend usam `ZodValidationPipe` do `nestjs-zod` — não misturar com `class-validator` na mesma rota.

## Notas relacionadas
- [[STACK#Backend]]
- [[superpowers/specs/2026-10-19-requisitos-mes-1#8. Decisões técnicas resolvidas]]
- [[ARCHITECTURE#Decisões arquiteturais]]
- [[superpowers/specs/2026-11-04-esquema-adr-design]]
