# ARCHITECTURE

Visão geral do sistema **easycert**: como as partes se encaixam, quais são os fluxos principais e as decisões arquiteturais que orientam a implementação.

Esta nota é a porta de entrada técnica. Regras de negócio detalhadas ficam em [[dominio/visao-geral|visao-geral]]. Detalhes de módulos ficam em [[MODULES]]. Decisões de tecnologia em [[STACK]].

---

## Fluxos principais

Fluxo canônico fim-a-fim:
1. Aluno autentica em [[MODULES#portal-aluno]] e faz upload de comprovante com metadados.
2. API `apps/api` persiste a submissão no Postgres via Prisma (`packages/db`) e armazena o PDF no storage configurado.
3. Submissão aparece na fila do coordenador em [[MODULES#painel-coordenador]].
4. Coordenador aprova (atribui carga aceita) ou indefere (com justificativa). Ver [[dominio/fluxo-aprovacao]].
5. Em aprovação, [[MODULES#modulo-documentos]] gera relatório consolidado atualizado para o aluno; declarações internas ganham QRCode.
6. [[MODULES#dashboard-gerencial]] agrega métricas (horas por aluno, tempo médio de análise, categorias mais usadas) para o administrador.

## Componentes

- **`apps/web`** — Next.js 15 + React 19 (Turbopack). Entrega todas as UIs (aluno, coordenador, admin). Componentes shadcn gerados em `apps/web/src/components/ui/` (owned); ver [[design/DESIGN]] para sistema de design completo.
- **`apps/api`** — NestJS 11. Expõe REST para a web, orquestra Prisma e storage.
- **`packages/db`** — schema Prisma 6 + client gerado; migrations em `prisma/migrations/`.
- **`packages/types`** — DTOs/contratos compartilhados entre api e web.
- **`packages/ui`** — biblioteca de componentes compartilhados (vazia hoje).
- **`packages/tsconfig`** — presets de TypeScript.
- **Postgres** — rodando em contêiner (`docker-compose.yml`, serviço `postgres`).
- **Storage de PDFs** — _(pendente)_, ver [[pendencias]].

## Nós

| Nó | Responsabilidade | Observações |
|----|------------------|-------------|
| `apps/web` | SSR/CSR das interfaces | Next.js 15, React 19, Turbopack |
| `apps/api` | Regra de negócio e persistência | NestJS 11 |
| `packages/db` | Schema e client Prisma | Postgres via docker-compose |
| Postgres | Persistência | Dev local via `pnpm db:up` |
| Storage de PDFs | Blobs de comprovante | Decisão em aberto |

## Decisões arquiteturais

- Monorepo com pnpm + Turborepo.
- Separação estrita web/api; nada de Server Actions tocando banco direto — toda escrita passa pelo NestJS.
- Prisma como ORM; schema único em `packages/db`.
- Contratos compartilhados em `packages/types` para evitar divergência entre web e api.
- Autenticação, storage e biblioteca de UI = decisões em aberto. Ver [[pendencias]].

---

## Notas relacionadas

- [[MODULES]] — detalhamento dos módulos.
- [[DATABASE]] — schema e persistência.
- [[STACK]] — tecnologias escolhidas.
- [[INFRASTRUCTURE]] — hospedagem e deploy.
- [[dominio/visao-geral|visao-geral]] — contexto de produto.
- [[AGENTS]] — roster de agentes que operam sobre a arquitetura.
