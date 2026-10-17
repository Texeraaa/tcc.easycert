# EasyCert

Plataforma web para **gestão de horas complementares** em instituições de ensino superior, com foco em **automação de fluxos acadêmicos** — submissão de comprovantes, validação pela coordenação, consolidação de carga horária e emissão de documentos.

Este repositório é também o entregável prático de um Trabalho de Conclusão de Curso. Contexto acadêmico (objetivos, metodologia, cronograma, estrutura do artigo) vive em [`docs/tcc/`](./docs/tcc/).

## Status

Fase atual: **TCC / MVP acadêmico**. Protótipo em desenvolvimento para avaliação de usabilidade (SUS) e comparação de tempo As-Is vs. To-Be com usuários-piloto. Ver [`docs/tcc/cronograma.md`](./docs/tcc/cronograma.md).

## O que o sistema faz

Quatro módulos funcionais, mapeados em [`docs/MODULES.md`](./docs/MODULES.md):

- **Portal do Aluno** — upload de comprovantes em PDF com metadados (categoria, carga informada, instituição emissora); acompanhamento de status (`Pendente`, `Aprovado`, `Indeferido`) e do progresso por categoria.
- **Painel do Coordenador** — fila de análise com PDF ao lado das regras da matriz curricular; aprovar/indeferir com justificativa; atribuir a carga horária **aceita** (pode diferir da informada).
- **Módulo de Documentos** — geração de relatório consolidado de horas e emissão de declaração/certificado interno com QRCode de verificação.
- **Dashboard Gerencial** — métricas agregadas para o administrador: percentual de alunos com horas concluídas, categorias mais usadas, tempo médio de análise.

Atores e capacidades: [`docs/dominio/atores-e-papeis.md`](./docs/dominio/atores-e-papeis.md). Fluxo de aprovação: [`docs/dominio/fluxo-aprovacao.md`](./docs/dominio/fluxo-aprovacao.md).

## Stack

- **Monorepo:** pnpm workspaces + Turborepo
- **Frontend:** Next.js 15 (App Router + Turbopack) + React 19
- **Backend:** NestJS 11 (REST)
- **Banco:** PostgreSQL 16 + Prisma 6
- **Dev:** Docker Compose, TypeScript strict, Node ≥ 20

Decisões em aberto (auth, storage de PDFs, biblioteca de UI, biblioteca de validação de DTO): [`docs/dominio/pendencias.md`](./docs/dominio/pendencias.md).

## Estrutura

```
apps/
  web/              Next.js — portais do aluno/coordenador/admin
  api/              NestJS  — API REST
packages/
  db/               Prisma schema + client   (@easycert/db)
  types/            DTOs compartilhados      (@easycert/types)
  ui/               Componentes React        (@easycert/ui)
  tsconfig/         Presets de tsconfig      (@easycert/tsconfig)
docs/               Vault Obsidian — documentação viva do projeto
  tcc/              Camada acadêmica (TCC)
  dominio/          Regras de negócio e pendências
```

Arquitetura de alto nível: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md). Decisões de stack: [`docs/STACK.md`](./docs/STACK.md). Entidades e persistência: [`docs/DATABASE.md`](./docs/DATABASE.md).

## Setup inicial

```bash
# 1. Instalar dependências
pnpm install

# 2. Subir o Postgres
pnpm db:up

# 3. Copiar os .env
cp packages/db/.env.example packages/db/.env
cp apps/api/.env.example apps/api/.env

# 4. Gerar client Prisma + rodar migration inicial
pnpm db:generate
pnpm db:migrate

# 5. Rodar web + api em paralelo
pnpm dev
```

Após o `pnpm dev`:
- Web: http://localhost:3000
- API: http://localhost:3333/health

## Scripts úteis

| Comando | Descrição |
|---|---|
| `pnpm dev` | Roda `web` + `api` em paralelo via Turbo |
| `pnpm build` | Build de todos os packages |
| `pnpm typecheck` | Type-check em todos os packages |
| `pnpm lint` | Lint em todos os packages |
| `pnpm test` | Testes em todos os packages |
| `pnpm db:up` / `db:down` | Sobe/derruba Postgres via Docker |
| `pnpm db:generate` | Gera o client Prisma |
| `pnpm db:migrate` | Cria/aplica migration Prisma (dev) |
| `pnpm db:studio` | Abre Prisma Studio |
| `pnpm format` | Formata com Prettier |

## Documentação

A documentação viva do projeto é um vault Obsidian em [`docs/`](./docs/). Pontos de entrada:

- [`docs/INDEX.md`](./docs/INDEX.md) — mapa completo do vault.
- [`docs/dominio/visao-geral.md`](./docs/dominio/visao-geral.md) — visão do produto, requisito central, não-objetivos.
- [`docs/tcc/visao-geral.md`](./docs/tcc/visao-geral.md) — camada acadêmica (TCC).
- [`docs/dominio/pendencias.md`](./docs/dominio/pendencias.md) — decisões em aberto.

Qualquer mudança doc-worthy (nova rota, módulo, entidade, dependência, decisão técnica, pendência) deve passar pelo agente `docs-curator` — ver [`CLAUDE.md`](./CLAUDE.md).

## Próximos passos

Modelagem concreta de domínio (Curso, MatrizCurricular, CategoriaAtividade, Submissao, Avaliacao, DocumentoEmitido) acontece após a resolução das pendências bloqueantes de `docs/dominio/pendencias.md`. O schema atual (`packages/db/prisma/schema.prisma`) tem apenas `User` + `Role` para validar o setup end-to-end.
