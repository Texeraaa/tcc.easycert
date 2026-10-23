# MODULES

Módulos do backend e frontend do **easycert**, com responsabilidades e dependências.

Referências de alto nível: [[ARCHITECTURE]]. Rotas expostas: [[API_ROUTES]]. Persistência: [[DATABASE]].

---

## Backend

**9 módulos NestJS organizados por entidade.** Modelo canônico NestJS: um módulo por domínio.

| Módulo | Responsabilidade | Rotas principais | Dependências | Papéis que consomem |
|--------|------------------|------------------|--------------|---------------------|
| **AuthModule** | Autenticação (Passport local + JWT), guards, estratégias | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `GET /auth/csrf-token` | `@easycert/types`, argon2id, `csrf-csrf`, Passport | Aluno, Coordenador, Admin (todos) |
| **UserModule** | CRUD de usuários (admin cria; aluno edita perfil). `User.role: Role` enum único por usuário (`ALUNO \| COORDENADOR \| ADMIN`). | `POST /users`, `PATCH /users/:id`, `GET /users`, `DELETE /users/:id` | `@easycert/db`, `@easycert/types`, `AuditModule` | Admin (CRUD), Aluno (próprio perfil) |
| **SubmissionModule** | Ciclo de estados: `AWAITING_UPLOAD → PENDING → UNDER_REVIEW → APPROVED \| REJECTED \| CORRECTION_REQUESTED` | `POST /submissions`, `POST /submissions/:id/confirm`, `GET /submissions/me`, `GET /submissions/:id`, `PATCH /submissions/:id` | `@easycert/db`, `@easycert/types`, `DocumentoModule`, `AvaliacaoModule`, `AuditModule`, `NotificationModule` | Aluno (própria), Coordenador (lista pendentes), Admin (todas) |
| **DocumentoModule** | Versionamento de PDFs; emissão de certificados internos; verificação pública de QRCode | `GET /v/:codigo` (público, rate-limited), `POST /documentos`, `GET /documentos/:id` | `@easycert/db`, `@easycert/types`, S3-client (`@aws-sdk/client-s3`), `AuditModule` | Aluno (leitura próprios), Coordenador (leitura), Admin (CRUD), Público (GET /v/:codigo apenas) |
| **AvaliacaoModule** | Decisão coordenador sobre uma submissão (aprovação, indeferimento, solicitação de correção) | `POST /avaliacoes`, `PATCH /avaliacoes/:id`, `GET /avaliacoes/:submissionId` | `@easycert/db`, `@easycert/types`, `AuditModule`, `NotificationModule` | Coordenador (criar/editar), Aluno (leitura próprias), Admin (leitura todas) |
| **MatrizModule** | CRUD de matriz curricular: `Categoria` + `RegraMatriz` com tetos e versionamento | `POST /categorias`, `GET /categorias`, `POST /regras-matriz`, `GET /regras-matriz`, `PATCH /regras-matriz/:id` | `@easycert/db`, `@easycert/types`, `AuditModule` | Admin (CRUD), Aluno (leitura categorias), Coordenador (leitura categorias) |
| **EventoModule** | CRUD de eventos internos; geração de certificados com UUIDv4 + QRCode | `POST /eventos`, `GET /eventos`, `GET /eventos/:id`, `PATCH /eventos/:id`, `POST /eventos/:id/certificados` | `@easycert/db`, `@easycert/types`, `DocumentoModule`, `AuditModule`, QR library | Admin (CRUD eventos), Coordenador (criar certs), Aluno (consulta eventos) |
| **AuditModule** | Service injetável (sem controller público) que registra eventos em `AuditLog`; append-only via SQL REVOKE. Decorado com `@Global()`; `AuditService.log({ actorId, action, entity, entityId, metadata? })` recebe **primitivos** (nunca entidade Prisma) para evitar circular deps. | Nenhuma rota pública (service injetável via DI) | `@easycert/db`, `@easycert/types`, Pino logger | Todos os outros módulos (injeção em services) |
| **NotificationModule** | Interface `MailProvider` + `MailtrapProvider` (prod) + `FakeMailProvider` (testes); chamado em transições | Nenhuma rota pública (serviço disparado por eventos) | `@easycert/types`, Mailtrap/Resend SDK (futuro), `AuditModule` | Todos que precisam disparar notificações (injeção em services) |

**Mapa papel → módulos:**

- **Aluno:** AuthModule → UserModule (leitura próprio) → SubmissionModule (criar/listar/detalhe) → DocumentoModule (upload, download) → MatrizModule (leitura categorias).
- **Coordenador:** AuthModule → SubmissionModule (listar pendentes, detalhe) → AvaliacaoModule (criar decisão) → DocumentoModule (visualizar PDFs) → EventoModule (consultar, criar certs).
- **Admin:** acesso total a todos os módulos (CRUD completo exceto AuditLog, que é read-only append-only).

**Configuração infra transversal em `AppModule`:**

- `AuditModule` decorado com `@Global()` — injetável em qualquer service sem import explícito.
- `PrismaModule` global com `onModuleInit` chamando `$connect()`.
- `ConfigModule` com Zod validando `.env` (DATABASE_URL, JWT_SECRET, CSRF_SECRET, MINIO_*, MAILTRAP_*).
- `ValidationPipe` global via `nestjs-zod` — valida request bodies contra Zod schemas em `@easycert/types`.
- `helmet()` middleware para security headers.
- `@nestjs/throttler` global com default 60 req/min; rotas específicas fazem override via `@Throttle({...})`.
- Exception filter customizado que anexa `X-Request-Id` em erros.
- Middleware `csrf-csrf` (double-submit cookie) aplicado globalmente a mutations. Exempt: `POST /auth/login`, `POST /auth/logout`, `GET /auth/csrf-token`. Ver [[STACK#CSRF & Segurança]] para fluxo primeiro-login.
- `nestjs-pino` com redaction para `password`, `token`, `cookie`, `authorization`.

## Frontend

Único app: `apps/web` (Next.js 15). Organização por área. Todos os módulos respeitam [[design/DESIGN]] (sistema de design do easycert).

### `apps/web/app/aluno` — Portal do Aluno

- **Responsabilidade:** upload de comprovantes, lista de submissões, progresso.
- **Dependências:** `@easycert/types`, `@easycert/ui`.
- **Páginas principais:** `/aluno`, `/aluno/submissoes`, `/aluno/submissoes/nova`, `/aluno/relatorio`.

### `apps/web/app/coordenador` — Painel do Coordenador

- **Dependências:** `@easycert/types`, `@easycert/ui`.
- **Páginas principais:** `/coordenador/fila`, `/coordenador/submissao/[id]`.

### `apps/web/app/admin` — Painel Administrativo

- **Dependências:** `@easycert/types`, `@easycert/ui`.
- **Páginas principais:** `/admin/dashboard`, `/admin/matriz`, `/admin/usuarios`.

## Pacotes compartilhados

- **`@easycert/db`** — schema Prisma e client gerado. Scripts: `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:studio`, `pnpm db:seed`.
- **`@easycert/types`** — DTOs e contratos entre web e api.
- **`@easycert/ui`** — biblioteca de componentes compartilhados (vazia hoje; decisão de framework em [[pendencias]]).
- **`@easycert/tsconfig`** — presets de TypeScript.

---

## Notas relacionadas

- [[ARCHITECTURE]] — como os módulos se encaixam.
- [[API_ROUTES]] — rotas HTTP por módulo.
- [[DATABASE]] — entidades e schema.
- [[AGENTS]] — builders (`backend-builder`, `frontend-builder`) criam módulos; `docs-curator` registra.
- [[superpowers/specs/2026-10-22-plano-mes-2]] — plano de implementação dos módulos NestJS no Mês 2 (T5e com quebra em 4 subtarefas).
