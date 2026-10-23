# STACK

Decisões de tecnologia do **easycert** e por quê. Esta nota registra escolhas feitas; para contexto de produto, ver [[dominio/visao-geral|visao-geral]].

---

## Monorepo

- **pnpm workspaces + Turborepo** — gerenciamento do monorepo (`pnpm-workspace.yaml`, `turbo.json`).

## Linguagem

- TypeScript 5.7 em todo o monorepo. Presets em `@easycert/tsconfig`.
- Node.js ≥ 20 (`engines.node` no `package.json`).

## Backend

- **Framework HTTP:** NestJS 11 (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`).
- **ORM:** Prisma 6 — ver [[DATABASE]].
- **Validação:** **Zod + `nestjs-zod`** — schemas vivem em `@easycert/types` como contrato único consumido pelo backend (via `ValidationPipe` do `nestjs-zod`) e pelo frontend (via `@hookform/resolvers/zod` ou inferência de tipo com `z.infer`). Decisão em [[superpowers/specs/2026-10-19-requisitos-mes-1#8. Decisões técnicas resolvidas]].
- **Testes:** Jest + Supertest (configurado em `apps/api`).

## Frontend

- **Framework:** Next.js 15 com Turbopack.
- **React:** 19.
- **Roteamento:** App Router do Next.js.
- **Estilização / UI:** **shadcn/ui + Tailwind CSS + Radix UI** — shadcn é um gerador: `npx shadcn add <componente>` injeta o código em `apps/web/src/components/ui/`. Baseado em Radix (primitivos acessíveis, atende WCAG A/AA). `@easycert/ui` fica reservado para wrappers compartilhados entre múltiplos frontends futuros. Decisão em [[superpowers/specs/2026-10-19-requisitos-mes-1#8. Decisões técnicas resolvidas]]. Sistema de design detalhado em [[design/DESIGN]].

## Autenticação

- **Login próprio local + JWT** via NestJS Passport (`@nestjs/passport`) com strategy local (`passport-local`) para login e JWT para sessão. Admin cria o aluno; aluno define senha no primeiro acesso.
- **Hash de senha:** argon2id via `@node-rs/argon2` (binding Rust via napi-rs, zero node-gyp). Parâmetros default: m=19456, t=2, p=1. Ratificado em 2026-10-22.
- **Transporte do JWT:** Cookie HttpOnly SameSite=Lax com nome `easycert_session`. `Secure` em prod, `Secure=false` em dev. Browser anexa automaticamente — JavaScript cliente não acessa o token (resistência a XSS).
- **Mitigação CSRF:** `csrf-csrf` (fork mantido do `csurf` deprecado) com padrão double-submit cookie. Middleware NestJS valida header `X-CSRF-Token` contra cookie `csrf-token` em todas as mutations. Rota `GET /auth/csrf-token` emite o token.
- Decisão ratificada pelo autor em 2026-10-22. Ver [[dominio/pendencias#Resolvidas após ratificação (2026-10-20+)]] e [[superpowers/specs/2026-10-22-plano-mes-2]].
- SSO institucional e OAuth externo ficam como trabalho futuro ([[dominio/visao-geral#Não-objetivos da v1]]).

## Banco de dados

Postgres via `docker-compose.yml`. ORM: Prisma 6. Detalhes em [[DATABASE]].

## Bootstrap & Porta

- **Porta:** NestJS ouve `process.env.PORT ?? 3333`. Expressão em `apps/api/src/main.ts:13` — deve ser `const port = Number(process.env.PORT ?? 3333)`.
- **CORS origin:** `process.env.WEB_ORIGIN ?? "http://localhost:3000"` (Next.js default).
- **Node.js:** ≥ 20 LTS (`engines.node` em `package.json`).
- **TypeScript:** 5.7 em todo o monorepo.

---

## Observabilidade

- **Logs estruturados:** `nestjs-pino` como logger default. Redaction configurada para campos sensíveis (`password`, `token`, `cookie`, `authorization` → `[REDACTED]`).
- **Request-id de correlação:** middleware gera UUID por request, propaga via `AsyncLocalStorage`, aparece em todos os logs daquela request. Header `X-Request-Id` incluído no response.
- **Health checks:** rotas `/health/live` (processo vivo, sem checar deps) e `/health/ready` (checa Postgres + storage reachable).
- **Rate-limit:** `@nestjs/throttler` global com default 60 req/min + decorator `@Throttle({default: {limit: 30, ttl: 60_000}})` em `GET /v/:codigo` (verificação pública de QRCode). Memory store em dev; Redis store quando houver deploy multi-instância.
- **Auditoria:** `AuditLog` imutável (append-only via `REVOKE UPDATE, DELETE` no role `easycert_app`). Chamada explícita via `auditService.log(...)` em cada service — ver 6 famílias de eventos em [[dominio/pendencias#Resolvidas após ratificação (2026-10-20+)]].
- **Testes:** Jest + Supertest no backend (suíte mínima no Mês 2, expande no Mês 3). Playwright/Vitest no frontend diferido para Mês 3.
- Telemetria avançada (APM, traces distribuídos) como trabalho futuro.

---

## CSRF & Segurança

- **Mitigação CSRF:** `csrf-csrf` (fork mantido do `csurf` deprecado) com padrão **double-submit cookie**. Middleware NestJS valida header `X-CSRF-Token` contra cookie `csrf-token` em todas as mutations (POST, PATCH, DELETE).
- **Rotas exempt:** `POST /auth/login` (primeiro turno, usuário sem cookie CSRF ainda), `POST /auth/logout` (cookie pode estar expirado), `GET /auth/csrf-token` (GET é isento por natureza; listado para clareza). Fluxo primeiro-login: POST `/auth/login` sem CSRF → sessão criada → GET `/auth/csrf-token` seta cookie `csrf-token` → próximas mutations incluem header `X-CSRF-Token`. Ratificado em 2026-10-22.
- **Postgres role em runtime:** aplicação roda com `easycert_app` (sem permissão UPDATE/DELETE em `audit_log`). Migrations rodam com `easycert_owner`; duas `DATABASE_URL` distintas em `.env.local` (`DATABASE_URL` para runtime, `DATABASE_URL_MIGRATE` para Prisma Migrate).
- **`User.role` único por usuário:** campo `role: Role` enum (`ALUNO | COORDENADOR | ADMIN`) em `User` — um usuário tem exatamente um papel. Eventos de auditoria `role.assigned` / `role.revoked` representam mudança desse valor único (não acúmulo de papéis). Ratificado em 2026-10-22.

## Em aberto

> [!warning] Em aberto
> Lista de decisões ainda não tomadas vive em [[dominio/pendencias|pendencias]].

---

## Notas relacionadas

- [[ARCHITECTURE]] — como as peças se encaixam.
- [[dominio/visao-geral|visao-geral]] — requisitos de produto que orientaram a stack.
- [[dominio/pendencias|pendencias]] — decisões em aberto.
- [[AGENTS]] — agentes que respeitam as decisões de stack.
