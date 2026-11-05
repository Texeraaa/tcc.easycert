# Plano — Esquema ADR (Architecture Decision Records)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Materializar o padrão ADR definido em [[superpowers/specs/2026-11-04-esquema-adr-design]] — criar `docs/decisions/` com `_template.md`, escrever os 7 ADRs retroativos essenciais, ligar `STACK.md`/`ARCHITECTURE.md`/`pendencias.md` aos ADRs e atualizar as convenções do vault (`CLAUDE.md` raiz e `docs/CLAUDE.md`).

**Architecture:** Mudanças inteiramente em `docs/` (vault Obsidian). Nenhum código de aplicação é tocado. Arquivos novos em `docs/decisions/` (1 template + 7 ADRs); edições inline em 5 arquivos existentes (`STACK.md`, `ARCHITECTURE.md`, `pendencias.md`, `INDEX.md`, `docs/CLAUDE.md`) e 1 na raiz (`CLAUDE.md`). Todas as mudanças respeitam `docs/CLAUDE.md`: wikilinks `[[...]]`, PT-BR, headings consistentes, `## Notas relacionadas` ao final.

**Tech Stack:** Markdown + frontmatter YAML. Nenhum build, nenhum teste de código — a "verificação" é `ls`, `grep -rn` para wikilinks quebrados e leitura humana do diff.

**Execução — regras do projeto:** Este plano edita apenas `docs/`. Pela regra do `CLAUDE.md` raiz, **somente o agente `docs-curator` escreve em `docs/`**. Executar cada task via `docs-curator`, que propõe o diff antes de aplicar. Nenhum agente commita; o commit ao final (se houver) é do usuário.

---

## Mapa de arquivos

**Criar (8):**
- `docs/decisions/_template.md`
- `docs/decisions/ADR-0001-zod-contrato-unico.md`
- `docs/decisions/ADR-0002-argon2id-senha.md`
- `docs/decisions/ADR-0003-jwt-cookie-httponly.md`
- `docs/decisions/ADR-0004-csrf-double-submit.md`
- `docs/decisions/ADR-0005-separacao-web-api.md`
- `docs/decisions/ADR-0006-auditlog-append-only.md`
- `docs/decisions/ADR-0007-shadcn-tailwind-radix.md`

**Modificar (6):**
- `docs/STACK.md` — 3 linhas inline (argon2id, cookie, CSRF) + linha de ratificação
- `docs/ARCHITECTURE.md` — bullet "Separação estrita web/api" linka para ADR-0005
- `docs/dominio/pendencias.md` — bullets resolvidos ganham link para o ADR correspondente
- `docs/INDEX.md` — adicionar seção `## Decisões` com 7 entradas
- `docs/CLAUDE.md` — adicionar `decisao` à lista de tipos permitidos
- `CLAUDE.md` (raiz do repo) — adicionar ADR à lista de mudanças doc-worthy

---

## Task 1: Criar pasta `docs/decisions/` e `_template.md`

**Files:**
- Create: `docs/decisions/_template.md`

- [ ] **Step 1: Verificar que a pasta ainda não existe**

Run: `ls docs/decisions/ 2>&1 || echo "NAO EXISTE"`
Expected: `NAO EXISTE` (ou `ls: cannot access`)

- [ ] **Step 2: Criar `docs/decisions/_template.md`**

Conteúdo exato:

```markdown
---
tipo: decisao
status: aceito  # proposto | aceito | superado-por-ADR-NNNN | descartado
data: YYYY-MM-DD
data-retroativo: YYYY-MM-DD  # omitir se ADR não é retroativo
---

# ADR-NNNN — Título curto imperativo

## Contexto
Uma a três frases: qual problema/força levou à decisão.

## Decisão
Uma a três frases: o que ficou decidido. Imperativo.

## Alternativas consideradas
- **X** — rejeitada porque Y.
- **Z** — rejeitada porque W.

## Consequências
- **Positivas:** ganhos.
- **Negativas / trade-offs:** perdas ou custos.
- **Invariantes criadas:** regras que o código agora precisa respeitar.

## Notas relacionadas
- [[STACK#...]]
- [[superpowers/specs/...]]
```

- [ ] **Step 3: Verificar criação**

Run: `ls docs/decisions/`
Expected: `_template.md`

Run: `head -5 docs/decisions/_template.md`
Expected: frontmatter começando com `---` e `tipo: decisao`.

---

## Task 2: Criar ADR-0001 — Zod + nestjs-zod

**Files:**
- Create: `docs/decisions/ADR-0001-zod-contrato-unico.md`

- [ ] **Step 1: Verificar que o arquivo ainda não existe**

Run: `ls docs/decisions/ADR-0001-*.md 2>&1 || echo "NAO EXISTE"`
Expected: `NAO EXISTE`

- [ ] **Step 2: Criar o arquivo com o conteúdo abaixo**

Conteúdo exato de `docs/decisions/ADR-0001-zod-contrato-unico.md`:

```markdown
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
```

- [ ] **Step 3: Verificar criação e formato**

Run: `head -6 docs/decisions/ADR-0001-zod-contrato-unico.md`
Expected: frontmatter com `tipo: decisao`, `status: aceito`, `data: 2026-10-19`, `data-retroativo: 2026-11-04`.

Run: `grep -c '^## ' docs/decisions/ADR-0001-zod-contrato-unico.md`
Expected: `5` (Contexto, Decisão, Alternativas consideradas, Consequências, Notas relacionadas)

---

## Task 3: Criar ADR-0002 — argon2id via `@node-rs/argon2`

**Files:**
- Create: `docs/decisions/ADR-0002-argon2id-senha.md`

- [ ] **Step 1: Verificar que o arquivo ainda não existe**

Run: `ls docs/decisions/ADR-0002-*.md 2>&1 || echo "NAO EXISTE"`
Expected: `NAO EXISTE`

- [ ] **Step 2: Criar o arquivo com o conteúdo abaixo**

Conteúdo exato de `docs/decisions/ADR-0002-argon2id-senha.md`:

```markdown
---
tipo: decisao
status: aceito
data: 2026-10-22
data-retroativo: 2026-11-04
---

# ADR-0002 — Usar argon2id via `@node-rs/argon2` para hash de senha

## Contexto
O easycert usa login próprio local (admin cria o aluno; aluno define senha no primeiro acesso). Precisamos de hash resistente a ataques de GPU, com biblioteca que não dependa de toolchain C/C++ nativo — o deploy alvo é container Alpine e qualquer dependência de `node-gyp` custa minutos no build e quebra quando falta `make`/`g++`.

## Decisão
Hash com **argon2id** via `@node-rs/argon2` (binding Rust via napi-rs). Parâmetros default: `m=19456, t=2, p=1`. Zero `node-gyp`, zero toolchain C — o `.node` já vem compilado por target. O `AuthService` chama `hash()` no set-senha e `verify()` no login.

## Alternativas consideradas
- **bcrypt** — rejeitada porque, apesar de bater argon em microbenchmarks CPU single-thread, é **inferior a argon2id contra ataques em GPU/ASIC** (argon2 foi projetado especificamente contra isso e venceu a Password Hashing Competition de 2015).
- **scrypt** — rejeitada porque tem menos bibliotecas testadas e mantidas no ecossistema Node; Argon2 é o padrão recomendado desde OWASP 2021+.
- **argon2 via `node-gyp`** (pacote `argon2` original) — rejeitada porque quebra build sem toolchain C (`make`, `g++`), exige rebuild no container e adiciona minutos ao Docker build. `@node-rs/argon2` elimina isso.

## Consequências
- **Positivas:** resistência a GPU, build limpo em Alpine sem rebuild nativo, API idiomática em TS.
- **Negativas / trade-offs:** dependência de Rust (abstraída pelo napi-rs), um pouco mais lento que bcrypt em CPU single-thread (intencional — é a feature).
- **Invariantes criadas:**
  - `AuthService` nunca armazena senha em plaintext.
  - Todo hash nasce via `@node-rs/argon2`; nunca misturar algoritmos de hash em `User.senha`.
  - Parâmetros (`m, t, p`) são explícitos na config — mudança de custo é decisão versionada, não default silencioso da lib.

## Notas relacionadas
- [[STACK#Autenticação]]
- [[superpowers/specs/2026-10-22-plano-mes-2]]
- [[dominio/pendencias#Resolvidas após ratificação (2026-10-20+)]]
- [[superpowers/specs/2026-11-04-esquema-adr-design]]
```

- [ ] **Step 3: Verificar**

Run: `grep '^data:' docs/decisions/ADR-0002-argon2id-senha.md`
Expected: `data: 2026-10-22`

---

## Task 4: Criar ADR-0003 — JWT em cookie HttpOnly

**Files:**
- Create: `docs/decisions/ADR-0003-jwt-cookie-httponly.md`

- [ ] **Step 1: Verificar inexistência**

Run: `ls docs/decisions/ADR-0003-*.md 2>&1 || echo "NAO EXISTE"`
Expected: `NAO EXISTE`

- [ ] **Step 2: Criar o arquivo**

Conteúdo exato de `docs/decisions/ADR-0003-jwt-cookie-httponly.md`:

```markdown
---
tipo: decisao
status: aceito
data: 2026-10-22
data-retroativo: 2026-11-04
---

# ADR-0003 — Transportar JWT via cookie HttpOnly SameSite=Lax (`easycert_session`)

## Contexto
O JWT emitido no login precisa trafegar em cada request autenticado. A escolha do transporte impacta diretamente superfície de XSS, complexidade do cliente e integração com o browser. O easycert tem frontend único (Next.js em `apps/web`) chamando a API no mesmo site/host — não há necessidade de autenticação cross-origin.

## Decisão
JWT em cookie `easycert_session`, **HttpOnly**, **SameSite=Lax**, `Secure` em produção e `Secure=false` em dev. O browser anexa o cookie automaticamente; JavaScript cliente **não** acessa o token. Login seta o cookie via response header; logout o limpa.

## Alternativas consideradas
- **`localStorage`** — rejeitada porque é acessível por qualquer script na página: uma única falha de XSS exfiltra o token. `HttpOnly` elimina essa classe inteira de ataque.
- **Header `Authorization: Bearer <token>` manual** — rejeitada porque exige o cliente anexar o header em toda request (código extra no fetch wrapper), não funciona com navegação de página (SSR do Next.js) e não traz nenhum ganho de segurança sobre cookie HttpOnly no mesmo contexto same-site.

## Consequências
- **Positivas:** resistência a XSS (token inacessível a scripts), anexo automático pelo browser, funciona com SSR do Next.js sem código de autenticação no cliente.
- **Negativas / trade-offs:** requer mitigação de CSRF explícita (ver [[decisions/ADR-0004-csrf-double-submit]]); logout verdadeiro depende de clear-cookie server-side.
- **Invariantes criadas:**
  - Cliente JS **nunca** lê nem seta o cookie `easycert_session`.
  - Em produção, cookie com `Secure=true` + `SameSite=Lax` + `HttpOnly=true` — não relaxar nenhuma dessas flags.
  - Toda rota autenticada do backend consome `req.cookies['easycert_session']`, não header `Authorization`.

## Notas relacionadas
- [[STACK#Autenticação]]
- [[decisions/ADR-0004-csrf-double-submit]]
- [[dominio/pendencias#Resolvidas após ratificação (2026-10-20+)]]
- [[superpowers/specs/2026-11-04-esquema-adr-design]]
```

- [ ] **Step 3: Verificar**

Run: `grep -c '^## ' docs/decisions/ADR-0003-jwt-cookie-httponly.md`
Expected: `5`

---

## Task 5: Criar ADR-0004 — CSRF via `csrf-csrf`

**Files:**
- Create: `docs/decisions/ADR-0004-csrf-double-submit.md`

- [ ] **Step 1: Verificar inexistência**

Run: `ls docs/decisions/ADR-0004-*.md 2>&1 || echo "NAO EXISTE"`
Expected: `NAO EXISTE`

- [ ] **Step 2: Criar o arquivo**

Conteúdo exato de `docs/decisions/ADR-0004-csrf-double-submit.md`:

```markdown
---
tipo: decisao
status: aceito
data: 2026-10-22
data-retroativo: 2026-11-04
---

# ADR-0004 — Mitigar CSRF com `csrf-csrf` em padrão double-submit cookie

## Contexto
Com JWT em cookie HttpOnly (ver [[decisions/ADR-0003-jwt-cookie-httponly]]), o browser anexa o cookie em qualquer request originada do domínio — inclusive requests forjadas por terceiros (CSRF). `SameSite=Lax` mitiga top-level navigation mas não mutações cross-site de AJAX; precisa de defesa em profundidade.

## Decisão
Usar **`csrf-csrf`** (fork mantido do `csurf` deprecado) com padrão **double-submit cookie**: middleware NestJS valida header `X-CSRF-Token` contra cookie `csrf-token` em todas as mutations (POST, PATCH, DELETE). Rota `GET /auth/csrf-token` emite o cookie `csrf-token`. **Exempt:** `POST /auth/login` (primeiro turno, usuário sem cookie CSRF ainda), `POST /auth/logout` (cookie pode estar expirado), `GET /auth/csrf-token` (GET é isento por natureza; listado para clareza).

## Alternativas consideradas
- **`csurf`** — rejeitada porque o pacote original está **deprecated** desde 2022 e sem manutenção; `csrf-csrf` é fork ativo com a mesma API.
- **Synchronizer token** — rejeitada porque exige sessão server-side (store de tokens em memória/Redis); double-submit é stateless e combina melhor com JWT + cookies.
- **`SameSite=Strict` isoladamente** — rejeitada porque quebra fluxos cross-site legítimos (ex.: link externo para a app autenticada) e não cobre AJAX same-site. Serve como defesa complementar, não substituta.

## Consequências
- **Positivas:** stateless, compatível com múltiplas instâncias sem store compartilhado, lib mantida, defesa em profundidade sobre `SameSite=Lax`.
- **Negativas / trade-offs:** cliente precisa fazer `GET /auth/csrf-token` após o login antes da primeira mutation (fluxo de 2 passos explicitado); exempt list precisa ser auditada ao adicionar rotas de auth novas.
- **Invariantes criadas:**
  - Toda rota que muta estado (POST/PATCH/DELETE) valida `X-CSRF-Token`, exceto as 3 exempts.
  - Fluxo primeiro-login: `POST /auth/login` (sem CSRF) → `GET /auth/csrf-token` (seta cookie) → próximas mutations incluem header.
  - Adicionar rota de auth nova sem cookie CSRF ainda disponível **exige** revisitar este ADR.

## Notas relacionadas
- [[STACK#Autenticação]]
- [[STACK#CSRF & Segurança]]
- [[decisions/ADR-0003-jwt-cookie-httponly]]
- [[dominio/pendencias#Resolvidas após ratificação (2026-10-20+)]]
- [[superpowers/specs/2026-11-04-esquema-adr-design]]
```

- [ ] **Step 3: Verificar**

Run: `grep -c '^## ' docs/decisions/ADR-0004-csrf-double-submit.md`
Expected: `5`

---

## Task 6: Criar ADR-0005 — Separação estrita web↔api

**Files:**
- Create: `docs/decisions/ADR-0005-separacao-web-api.md`

- [ ] **Step 1: Verificar inexistência**

Run: `ls docs/decisions/ADR-0005-*.md 2>&1 || echo "NAO EXISTE"`
Expected: `NAO EXISTE`

- [ ] **Step 2: Criar o arquivo**

Conteúdo exato de `docs/decisions/ADR-0005-separacao-web-api.md`:

```markdown
---
tipo: decisao
status: aceito
data: 2026-10-19
data-retroativo: 2026-11-04
---

# ADR-0005 — Manter separação estrita web↔api; frontend nunca importa `@easycert/db`

## Contexto
Next.js 15 oferece Server Actions e Route Handlers que permitem acessar o banco diretamente a partir do frontend. Essa facilidade acopla a UI ao schema Prisma e dilui a fronteira entre regra de negócio (api) e apresentação (web). Como o easycert tem hipótese de ter clientes futuros (mobile, integrações), a separação clara agora economiza refactor depois.

## Decisão
`apps/web` **nunca** importa `@easycert/db` nem toca Postgres. Toda leitura/escrita passa pela API NestJS em `apps/api`. Server Actions do Next, se usados, chamam a API via HTTP — não executam SQL/Prisma. Contratos web↔api vivem em `@easycert/types` (ver [[decisions/ADR-0001-zod-contrato-unico]]).

## Alternativas consideradas
- **Server Actions com acesso direto a Prisma** — rejeitada porque acopla o frontend ao schema do banco; qualquer mudança de modelo cascateia em `apps/web`; perde boundary entre BFF e domínio.
- **tRPC entre web e api** — rejeitada porque adiciona uma camada de RPC e type-sharing sem ganho claro sobre REST + Zod em `@easycert/types` (que já resolve o type-safety); mais código a manter, menos previsível para terceiros futuros.
- **Monolito único** (web e api no mesmo app Next) — rejeitada porque perde o isolamento de deploy, dificulta escalar backend independente, e amarra a API a um stack Next.

## Consequências
- **Positivas:** fronteira clara de domínio; backend pode evoluir independente; API pronta para clientes futuros (mobile, integrações externas); auditabilidade centralizada no backend ([[decisions/ADR-0006-auditlog-append-only]]).
- **Negativas / trade-offs:** mais latência que acesso direto (chamada HTTP extra); duplicação ocasional de tipos de domínio em DTOs (mitigado por `@easycert/types`).
- **Invariantes criadas:**
  - `apps/web/**` **não** contém `import ... from "@easycert/db"`.
  - `apps/web/**` **não** contém `new PrismaClient()` nem queries SQL.
  - Toda mutação vinda do browser passa por `apps/api` (controller NestJS → service → Prisma).
  - CI/lint deveria falhar se um import proibido aparecer em `apps/web` (futuro).

## Notas relacionadas
- [[ARCHITECTURE#Decisões arquiteturais]]
- [[MODULES]]
- [[decisions/ADR-0001-zod-contrato-unico]]
- [[decisions/ADR-0006-auditlog-append-only]]
- [[superpowers/specs/2026-11-04-esquema-adr-design]]
```

- [ ] **Step 3: Verificar**

Run: `grep '^data:' docs/decisions/ADR-0005-separacao-web-api.md`
Expected: `data: 2026-10-19`

---

## Task 7: Criar ADR-0006 — AuditLog append-only

**Files:**
- Create: `docs/decisions/ADR-0006-auditlog-append-only.md`

- [ ] **Step 1: Verificar inexistência**

Run: `ls docs/decisions/ADR-0006-*.md 2>&1 || echo "NAO EXISTE"`
Expected: `NAO EXISTE`

- [ ] **Step 2: Criar o arquivo**

Conteúdo exato de `docs/decisions/ADR-0006-auditlog-append-only.md`:

```markdown
---
tipo: decisao
status: aceito
data: 2026-10-22
data-retroativo: 2026-11-04
---

# ADR-0006 — Tornar `AuditLog` append-only via `REVOKE UPDATE, DELETE` no role `easycert_app`

## Contexto
RF-26 do easycert exige **log de auditoria imutável**: uma vez gravado um evento (aprovação, revogação, criação de usuário etc.), ele não pode ser alterado nem apagado pela aplicação, mesmo se um atacante obtiver privilégio na app. Confiar apenas em disciplina de código ("ninguém escreve `UPDATE audit_log`") é frágil — um `PATCH` acidental por via de um ORM genérico quebra a invariante.

## Decisão
Dois roles Postgres: **`easycert_owner`** (dono do schema; roda migrations) e **`easycert_app`** (runtime). Migration Prisma versionada aplica `REVOKE UPDATE, DELETE ON audit_log FROM easycert_app`. A app só consegue `INSERT` e `SELECT`; qualquer tentativa de `UPDATE/DELETE` resulta em erro no Postgres, não em escrita silenciosa. Duas `DATABASE_URL` distintas em `.env.local`: `DATABASE_URL` (runtime, `easycert_app`) e `DATABASE_URL_MIGRATE` (migrations, `easycert_owner`).

## Alternativas consideradas
- **Imutabilidade só na aplicação** (ex.: não expor `AuditService.update()`) — rejeitada porque é reversível por qualquer bug, por qualquer dev novo, por qualquer migration que mude o service. Invariante no banco é irreversível por código.
- **Triggers Postgres** (`BEFORE UPDATE RAISE EXCEPTION`) — rejeitada porque distribui lógica entre schema e aplicação, é mais difícil auditar/revisar, e tem overhead de execução em cada escrita.
- **Log externo** (arquivo, SIEM, sink) — rejeitada porque perde FK para entidades do domínio, dificulta consultas ad-hoc por `entityId`, e exige infra adicional fora do escopo v1.

## Consequências
- **Positivas:** invariante garantida pelo Postgres (impossível violar por bug na app); consultas via Prisma como qualquer entidade; fácil auditar que a invariante existe (uma linha de SQL).
- **Negativas / trade-offs:** operação exige disciplina de rodar migrations com `easycert_owner` (duas URLs); `prisma migrate reset` em dev precisa reaplicar o `REVOKE` (ver débito técnico em [[dominio/pendencias#Resolvidas após ratificação (2026-10-20+)]]).
- **Invariantes criadas:**
  - Role runtime da aplicação é `easycert_app` — **nunca** apontar `DATABASE_URL` para `easycert_owner` em produção.
  - Migration `REVOKE UPDATE, DELETE ON audit_log FROM easycert_app` existe versionada; `prisma migrate reset` reaplica.
  - `AuditService.log(...)` só faz `INSERT`; não há API de update/delete.

## Notas relacionadas
- [[STACK#Observabilidade]]
- [[STACK#CSRF & Segurança]]
- [[dominio/pendencias#Resolvidas após ratificação (2026-10-20+)]]
- [[superpowers/specs/2026-10-22-plano-mes-2]]
- [[superpowers/specs/2026-11-04-esquema-adr-design]]
```

- [ ] **Step 3: Verificar**

Run: `grep -c '^## ' docs/decisions/ADR-0006-auditlog-append-only.md`
Expected: `5`

---

## Task 8: Criar ADR-0007 — shadcn/ui + Tailwind + Radix

**Files:**
- Create: `docs/decisions/ADR-0007-shadcn-tailwind-radix.md`

- [ ] **Step 1: Verificar inexistência**

Run: `ls docs/decisions/ADR-0007-*.md 2>&1 || echo "NAO EXISTE"`
Expected: `NAO EXISTE`

- [ ] **Step 2: Criar o arquivo**

Conteúdo exato de `docs/decisions/ADR-0007-shadcn-tailwind-radix.md`:

```markdown
---
tipo: decisao
status: aceito
data: 2026-10-19
data-retroativo: 2026-11-04
---

# ADR-0007 — Usar shadcn/ui + Tailwind CSS + Radix UI no frontend

## Contexto
O frontend precisa de uma base de componentes acessíveis (WCAG A/AA) sem comprar um sistema de design opinado que seja difícil de customizar. O design system do easycert (ver [[design/DESIGN]]) tem personalidade visual própria — precisa de componentes que sejam pontos de partida, não produtos acabados.

## Decisão
**shadcn/ui** como gerador de componentes (`npx shadcn add <componente>` injeta o código fonte em `apps/web/src/components/ui/`), apoiado em **Radix UI** (primitivos acessíveis — menus, dialogs, dropdowns, tooltips) e **Tailwind CSS** para estilização. `@easycert/ui` fica reservado para wrappers compartilhados entre múltiplos frontends futuros.

## Alternativas consideradas
- **MUI (Material-UI)** — rejeitada porque traz opinião forte de Material Design difícil de customizar fora dos temas padrão; runtime CSS-in-JS adiciona overhead.
- **Chakra UI** — rejeitada por overhead runtime (styled-system + emotion) e API menos alinhada ao estilo utility-first do time.
- **Mantine** — rejeitada por menor tração no ecossistema (comparada a Radix + shadcn) e por acoplar estilização ao próprio sistema.
- **CSS custom do zero** — rejeitada porque implementar acessibilidade (focus trap, aria-*, teclado) para menus/dialogs/dropdowns manualmente é lento e historicamente fonte de regressões WCAG.

## Consequências
- **Positivas:** componentes são código fonte owned em `apps/web/src/components/ui/` — editáveis sem fork; Radix cobre acessibilidade; Tailwind combina com utilitários do design system; zero runtime CSS-in-JS.
- **Negativas / trade-offs:** atualização de shadcn é manual (re-executar comando por componente); tailwind exige disciplina para não virar "classes aleatórias" (resolvido por tokens em [[design/DESIGN]]).
- **Invariantes criadas:**
  - Componentes base ficam em `apps/web/src/components/ui/`, gerados por `npx shadcn add`.
  - `@easycert/ui` **não** recebe componentes shadcn diretos; só wrappers compartilhados entre múltiplos frontends (hoje só existe `apps/web`).
  - Novo componente acessível prefere Radix como primitivo; CSS custom apenas para casos não cobertos por Radix.

## Notas relacionadas
- [[STACK#Frontend]]
- [[design/DESIGN]]
- [[superpowers/specs/2026-10-19-requisitos-mes-1#8. Decisões técnicas resolvidas]]
- [[superpowers/specs/2026-11-04-esquema-adr-design]]
```

- [ ] **Step 3: Verificar criação dos 7 ADRs + template**

Run: `ls docs/decisions/`
Expected (saída exata, em ordem alfabética):
```
ADR-0001-zod-contrato-unico.md
ADR-0002-argon2id-senha.md
ADR-0003-jwt-cookie-httponly.md
ADR-0004-csrf-double-submit.md
ADR-0005-separacao-web-api.md
ADR-0006-auditlog-append-only.md
ADR-0007-shadcn-tailwind-radix.md
_template.md
```

Run: `grep -L '^## Notas relacionadas' docs/decisions/ADR-*.md`
Expected: (vazio — todos os ADRs têm a seção Notas relacionadas)

Run: `grep -L '^## Alternativas consideradas' docs/decisions/ADR-*.md`
Expected: (vazio)

---

## Task 9: Atualizar `STACK.md` — linkar linhas inline aos ADRs

**Files:**
- Modify: `docs/STACK.md` (linhas 33–36, seção `## Autenticação`)

- [ ] **Step 1: Ler o trecho atual**

Run: `sed -n '30,38p' docs/STACK.md`
Expected: o bloco `## Autenticação` contendo as 4 linhas de argon2id, cookie, CSRF, "Decisão ratificada...".

- [ ] **Step 2: Reescrever a linha do argon2id**

Trocar (fim da linha ~33):

```
- **Hash de senha:** argon2id via `@node-rs/argon2` (binding Rust via napi-rs, zero node-gyp). Parâmetros default: m=19456, t=2, p=1. Ratificado em 2026-10-22.
```

por:

```
- **Hash de senha:** argon2id via `@node-rs/argon2` (binding Rust via napi-rs, zero node-gyp). Parâmetros default: m=19456, t=2, p=1. Ver [[decisions/ADR-0002-argon2id-senha]].
```

- [ ] **Step 3: Reescrever a linha do cookie HttpOnly**

Trocar (linha ~34):

```
- **Transporte do JWT:** Cookie HttpOnly SameSite=Lax com nome `easycert_session`. `Secure` em prod, `Secure=false` em dev. Browser anexa automaticamente — JavaScript cliente não acessa o token (resistência a XSS).
```

por:

```
- **Transporte do JWT:** Cookie HttpOnly SameSite=Lax com nome `easycert_session`. `Secure` em prod, `Secure=false` em dev. Browser anexa automaticamente — JavaScript cliente não acessa o token (resistência a XSS). Ver [[decisions/ADR-0003-jwt-cookie-httponly]].
```

- [ ] **Step 4: Reescrever a linha do CSRF**

Trocar (linha ~35):

```
- **Mitigação CSRF:** `csrf-csrf` (fork mantido do `csurf` deprecado) com padrão double-submit cookie. Middleware NestJS valida header `X-CSRF-Token` contra cookie `csrf-token` em todas as mutations. Rota `GET /auth/csrf-token` emite o token.
```

por:

```
- **Mitigação CSRF:** `csrf-csrf` (fork mantido do `csurf` deprecado) com padrão double-submit cookie. Middleware NestJS valida header `X-CSRF-Token` contra cookie `csrf-token` em todas as mutations. Rota `GET /auth/csrf-token` emite o token. Ver [[decisions/ADR-0004-csrf-double-submit]].
```

- [ ] **Step 5: Reescrever a linha resumo de ratificação**

Trocar (linha ~36):

```
- Decisão ratificada pelo autor em 2026-10-22. Ver [[dominio/pendencias#Resolvidas após ratificação (2026-10-20+)]] e [[superpowers/specs/2026-10-22-plano-mes-2]].
```

por:

```
- Decisões ratificadas em 2026-10-22; capturadas em [[decisions/ADR-0002-argon2id-senha]], [[decisions/ADR-0003-jwt-cookie-httponly]] e [[decisions/ADR-0004-csrf-double-submit]]. Contexto adicional em [[superpowers/specs/2026-10-22-plano-mes-2]].
```

- [ ] **Step 6: Atualizar também a seção `## CSRF & Segurança` se necessário**

Run: `grep -n 'Ratificado em\|ratificada em\|ratificado em' docs/STACK.md`
Expected: linhas restantes do tipo `Ratificado em 2026-10-22` em `## CSRF & Segurança` (linhas ~67, ~69).

Para cada ocorrência remanescente, apagar o fragmento ". Ratificado em 2026-10-22" e, se a linha for sobre CSRF/cookie/argon2id, apagar o ratificado sem substituir (o link já vive na seção `## Autenticação`). Linhas sobre outras decisões (ex.: `User.role` único) **ficam como estão** — não há ADR correspondente nesta migração.

- [ ] **Step 7: Verificar**

Run: `grep -n 'decisions/ADR' docs/STACK.md`
Expected: pelo menos 4 ocorrências (argon2, cookie, csrf, linha resumo).

Run: `grep -n 'Ratificado em 2026-10-22' docs/STACK.md`
Expected: zero ocorrências na seção `## Autenticação`; qualquer remanescente só em contextos sem ADR equivalente.

---

## Task 10: Atualizar `ARCHITECTURE.md` — linkar separação web/api a ADR-0005

**Files:**
- Modify: `docs/ARCHITECTURE.md` (linha ~43, seção `## Decisões arquiteturais`)

- [ ] **Step 1: Ler o trecho atual**

Run: `sed -n '40,48p' docs/ARCHITECTURE.md`
Expected: a lista de "Decisões arquiteturais" incluindo a linha "Separação estrita web/api".

- [ ] **Step 2: Reescrever a linha da separação**

Trocar:

```
- Separação estrita web/api; nada de Server Actions tocando banco direto — toda escrita passa pelo NestJS.
```

por:

```
- Separação estrita web/api; nada de Server Actions tocando banco direto — toda escrita passa pelo NestJS. Ver [[decisions/ADR-0005-separacao-web-api]].
```

- [ ] **Step 3: Verificar**

Run: `grep -n 'ADR-0005' docs/ARCHITECTURE.md`
Expected: uma linha com a referência.

---

## Task 11: Atualizar `pendencias.md` — linkar bullets resolvidos aos ADRs

**Files:**
- Modify: `docs/dominio/pendencias.md` (seção `## Resolvidas pela spec de requisitos do Mês 1` e `## Resolvidas após ratificação (2026-10-20+)`)

**Estratégia:** adicionar sufixo ` Ver [[decisions/ADR-NNNN-slug]].` ao fim de cada bullet que corresponde a um ADR. Não remove texto existente — enriquece.

- [ ] **Step 1: Mapear ocorrências**

Run: `grep -n 'Hash de senha\|Lib argon2\|Transporte JWT\|Mitigação CSRF\|CSRF exempt list\|Imutabilidade do log de auditoria\|Biblioteca de validação de DTO\|Biblioteca de UI' docs/dominio/pendencias.md`

Expected: linhas em `## Resolvidas pela spec de requisitos do Mês 1` (Zod, shadcn) e `## Resolvidas após ratificação` (argon2, Lib argon2, Transporte JWT, Mitigação CSRF, CSRF exempt list, Imutabilidade do log).

- [ ] **Step 2: Enriquecer o bullet "Biblioteca de validação de DTO"**

Trocar:

```
- Biblioteca de validação de DTO → Zod + `nestjs-zod`, schemas em `@easycert/types`.
```

por:

```
- Biblioteca de validação de DTO → Zod + `nestjs-zod`, schemas em `@easycert/types`. Ver [[decisions/ADR-0001-zod-contrato-unico]].
```

- [ ] **Step 3: Enriquecer o bullet "Biblioteca de UI"**

Trocar:

```
- Biblioteca de UI → shadcn/ui + Tailwind + Radix.
```

por:

```
- Biblioteca de UI → shadcn/ui + Tailwind + Radix. Ver [[decisions/ADR-0007-shadcn-tailwind-radix]].
```

- [ ] **Step 4: Enriquecer o bullet "Imutabilidade do log de auditoria (RF-26) (Q2)"**

No bullet que termina com `Ratificada pelo autor em 2026-10-22. Origem: [[superpowers/specs/2026-10-22-plano-mes-2#2.1 Técnicas e de domínio]].`, acrescentar ao fim:

```
Ver [[decisions/ADR-0006-auditlog-append-only]].
```

Resultado esperado (fim do bullet): `... Origem: [[superpowers/specs/2026-10-22-plano-mes-2#2.1 Técnicas e de domínio]]. Ver [[decisions/ADR-0006-auditlog-append-only]].`

- [ ] **Step 5: Enriquecer o bullet "Hash de senha (Q5)"**

No bullet que termina com `Ratificada pelo autor em 2026-10-22.`, acrescentar ao fim:

```
Ver [[decisions/ADR-0002-argon2id-senha]].
```

- [ ] **Step 6: Enriquecer o bullet "Transporte JWT (Q6)"**

No bullet que termina com `Ratificada pelo autor em 2026-10-22.`, acrescentar ao fim:

```
Ver [[decisions/ADR-0003-jwt-cookie-httponly]] e [[decisions/ADR-0004-csrf-double-submit]].
```

- [ ] **Step 7: Enriquecer o bullet "CSRF exempt list (Q6.8)"**

No bullet que termina com `...revisada após análise do `tech-architect` que apontou gap entre login e primeira mutation).`, acrescentar ao fim:

```
Ver [[decisions/ADR-0004-csrf-double-submit]].
```

- [ ] **Step 8: Enriquecer o bullet "Mitigação CSRF (B2)"**

Ao fim do bullet `- **Mitigação CSRF** (B2) — ...`, acrescentar:

```
Ver [[decisions/ADR-0004-csrf-double-submit]].
```

- [ ] **Step 9: Enriquecer o bullet "Lib argon2 (B3)"**

Ao fim do bullet `- **Lib argon2** (B3) — ...`, acrescentar:

```
Ver [[decisions/ADR-0002-argon2id-senha]].
```

- [ ] **Step 10: Verificar**

Run: `grep -c 'decisions/ADR-' docs/dominio/pendencias.md`
Expected: pelo menos `8` ocorrências (2 em "Mês 1" + 6 em "Resolvidas após ratificação").

---

## Task 12: Atualizar `INDEX.md` — adicionar seção `## Decisões`

**Files:**
- Modify: `docs/INDEX.md`

- [ ] **Step 1: Escolher a posição**

A seção `## Decisões` deve ir **após `## API` e antes de `## Superpowers — Specs e Plans`** (ordem lógica: Arquitetura → API → Decisões → Specs → Domínio → TCC).

- [ ] **Step 2: Inserir o bloco**

Após a linha `- [[API_ROUTES]] — rotas HTTP agrupadas por módulo.` (fim da seção `## API`), inserir uma linha em branco e o seguinte bloco:

```markdown
## Decisões
- [[decisions/ADR-0001-zod-contrato-unico]] — `aceito` (2026-10-19) · Zod + `nestjs-zod` como contrato único web↔api.
- [[decisions/ADR-0002-argon2id-senha]] — `aceito` (2026-10-22) · Hash de senha com argon2id via `@node-rs/argon2`.
- [[decisions/ADR-0003-jwt-cookie-httponly]] — `aceito` (2026-10-22) · JWT em cookie HttpOnly SameSite=Lax.
- [[decisions/ADR-0004-csrf-double-submit]] — `aceito` (2026-10-22) · Mitigação CSRF via `csrf-csrf` com double-submit cookie.
- [[decisions/ADR-0005-separacao-web-api]] — `aceito` (2026-10-19) · Separação estrita web↔api; frontend nunca importa `@easycert/db`.
- [[decisions/ADR-0006-auditlog-append-only]] — `aceito` (2026-10-22) · `AuditLog` append-only via `REVOKE UPDATE, DELETE` no role `easycert_app`.
- [[decisions/ADR-0007-shadcn-tailwind-radix]] — `aceito` (2026-10-19) · shadcn/ui + Tailwind CSS + Radix UI no frontend.
```

- [ ] **Step 3: Verificar**

Run: `grep -c '^## Decisões' docs/INDEX.md`
Expected: `1`

Run: `grep -c '^- \[\[decisions/ADR-' docs/INDEX.md`
Expected: `7`

Run: `grep '^## ' docs/INDEX.md`
Expected (ordem):
```
## Arquitetura
## API
## Decisões
## Superpowers — Specs e Plans
## Domínio
## TCC
```

---

## Task 13: Atualizar `docs/CLAUDE.md` — registrar `tipo: decisao`

**Files:**
- Modify: `docs/CLAUDE.md`

- [ ] **Step 1: Localizar o item a estender**

Run: `grep -n 'Novos tipos' docs/CLAUDE.md`
Expected: linha ~22 com `4. Novos tipos (`tipo:` do frontmatter) devem seguir o padrão existente...`.

- [ ] **Step 2: Adicionar o tipo `decisao` à lista**

Trocar (linhas ~22–24):

```markdown
4. Novos tipos (`tipo:` do frontmatter) devem seguir o padrão existente: `visão`, `arquitetura`, `regra-de-negócio`, `pendência`, `rascunho`. Se precisar de um novo tipo, documente aqui.
   - `rascunho` — texto em elaboração, tipicamente em `tcc/rascunhos/`, destinado a virar seção do artigo final ou prosa consolidada em outra nota.
```

por:

```markdown
4. Novos tipos (`tipo:` do frontmatter) devem seguir o padrão existente: `visão`, `arquitetura`, `regra-de-negócio`, `pendência`, `rascunho`, `decisao`. Se precisar de um novo tipo, documente aqui.
   - `rascunho` — texto em elaboração, tipicamente em `tcc/rascunhos/`, destinado a virar seção do artigo final ou prosa consolidada em outra nota.
   - `decisao` — Architecture Decision Record (ADR). Decisões técnicas transversais que impõem invariante no código, tiveram alternativas seriamente consideradas ou são caras de reverter. Ciclo de vida: `proposto | aceito | superado-por-ADR-NNNN | descartado`. Localização: `docs/decisions/ADR-NNNN-slug.md`. Template em `docs/decisions/_template.md`. Padrão definido em [[superpowers/specs/2026-11-04-esquema-adr-design]].
```

- [ ] **Step 3: Verificar**

Run: `grep -c '`decisao`' docs/CLAUDE.md`
Expected: pelo menos `2` (um na lista de tipos, outro no bullet explicativo).

---

## Task 14: Atualizar `CLAUDE.md` da raiz — adicionar ADR à lista doc-worthy

**Files:**
- Modify: `CLAUDE.md` (raiz do repo, não `docs/CLAUDE.md`)

- [ ] **Step 1: Localizar o bloco**

Run: `grep -n 'doc-worthy incluem' CLAUDE.md`
Expected: linha ~11 começando com `Sempre que você fizer uma mudança...`.

- [ ] **Step 2: Adicionar o bullet de ADR ao final da lista**

A lista termina em:

```markdown
- Integração externa configurada (banco, auth, email, storage).
```

Acrescentar imediatamente depois (como novo bullet):

```markdown
- Decisão arquitetural que (a) impõe invariante no código, (b) teve alternativas seriamente consideradas ou (c) é cara de reverter — vira ADR em `docs/decisions/`. Delegar ao `docs-curator` com o contexto da decisão (o "por quê"). Padrão definido em `docs/superpowers/specs/2026-11-04-esquema-adr-design.md`.
```

- [ ] **Step 3: Verificar**

Run: `grep -c 'vira ADR em' CLAUDE.md`
Expected: `1`

---

## Task 15: Verificação final — wikilinks, frontmatter e consistência

- [ ] **Step 1: Confirmar que todos os 8 arquivos novos existem**

Run: `ls -1 docs/decisions/`
Expected (8 linhas, em ordem alfabética):
```
ADR-0001-zod-contrato-unico.md
ADR-0002-argon2id-senha.md
ADR-0003-jwt-cookie-httponly.md
ADR-0004-csrf-double-submit.md
ADR-0005-separacao-web-api.md
ADR-0006-auditlog-append-only.md
ADR-0007-shadcn-tailwind-radix.md
_template.md
```

- [ ] **Step 2: Confirmar frontmatter dos 7 ADRs**

Run: `for f in docs/decisions/ADR-*.md; do echo "== $f =="; head -6 "$f"; done`
Expected: cada bloco tem `tipo: decisao`, `status: aceito`, `data: YYYY-MM-DD`, `data-retroativo: 2026-11-04`.

- [ ] **Step 3: Confirmar seções obrigatórias em cada ADR**

Run: `for f in docs/decisions/ADR-*.md; do echo "== $f =="; grep '^## ' "$f"; done`
Expected: cada ADR tem exatamente 5 headings `##`: Contexto, Decisão, Alternativas consideradas, Consequências, Notas relacionadas.

- [ ] **Step 4: Buscar wikilinks quebrados aos ADRs**

Run: `grep -rn 'decisions/ADR-' docs/ --include='*.md' | grep -v '^docs/decisions/' | grep -v '^docs/superpowers/' | sort`
Expected: conjunto de linhas em `STACK.md`, `ARCHITECTURE.md`, `INDEX.md`, `dominio/pendencias.md`. Não deve aparecer `decisions/ADR-0008` ou qualquer slug não listado em `docs/decisions/`.

- [ ] **Step 5: Confirmar atualizações nos arquivos existentes**

Run: `grep -n 'decisions/ADR' docs/STACK.md docs/ARCHITECTURE.md docs/dominio/pendencias.md docs/INDEX.md`
Expected: ao menos 4 em `STACK.md`, 1 em `ARCHITECTURE.md`, 8 em `pendencias.md`, 7 em `INDEX.md`.

- [ ] **Step 6: Confirmar atualizações nas convenções**

Run: `grep -c '`decisao`' docs/CLAUDE.md`
Expected: pelo menos `2`.

Run: `grep -c 'vira ADR em' CLAUDE.md`
Expected: `1`.

- [ ] **Step 7: Leitura humana do diff final**

Run: `git status`
Expected:
- `modified: CLAUDE.md`
- `modified: docs/ARCHITECTURE.md`
- `modified: docs/CLAUDE.md`
- `modified: docs/INDEX.md`
- `modified: docs/STACK.md`
- `modified: docs/dominio/pendencias.md`
- 8 arquivos novos em `docs/decisions/` (aparecem como untracked se ainda não adicionados)

Run: `git diff --stat`
Expected: total aproximado de 200–300 linhas adicionadas (ADRs são o grosso), poucas removidas (apenas o substituído em `STACK.md`).

- [ ] **Step 8: Entregar para review do usuário**

Mostrar ao usuário o diff consolidado e aguardar aprovação antes de qualquer commit. **Nenhum agente commita** — o commit é sempre do usuário.

Sugestão de mensagem de commit (para o usuário, não executar):

```
docs: introduz esquema ADR + 7 ADRs retroativos essenciais

Materializa o padrão definido em docs/superpowers/specs/2026-11-04-esquema-adr-design.md:

- docs/decisions/_template.md: template vazio
- ADR-0001 a ADR-0007: 7 decisões retroativas (Zod, argon2id, cookie HttpOnly, CSRF,
  separação web↔api, AuditLog append-only, shadcn)
- STACK.md, ARCHITECTURE.md, pendencias.md: linkam para os ADRs novos
- INDEX.md: seção ## Decisões
- docs/CLAUDE.md: registra tipo `decisao`
- CLAUDE.md (raiz): adiciona ADR à lista doc-worthy
```

---

## Self-review (feito pelo autor do plano, não é task de execução)

- **Cobertura da spec:** tasks 1–8 cobrem as seções 2 e 3 (localização + template + 7 ADRs). Task 9 cobre seção 4.1 (`STACK.md`). Task 10 cobre a bidirecionalidade implícita em seção 2 (`ARCHITECTURE.md` ↔ ADR-0005). Task 11 cobre seção 4.2 (`pendencias.md`). Task 12 cobre seção 2 (`INDEX.md` com `## Decisões`). Tasks 13–14 cobrem seção 10 (`docs/CLAUDE.md` + raiz). Tasks 15 cobre validação. Seção 11 (fora de escopo) respeitada: nenhuma automação, nenhum lint.
- **Specs antigos:** seção 4.3 diz "não mudam" — este plano não toca nenhum arquivo em `superpowers/specs/`. ADRs referenciam specs antigos via `## Notas relacionadas`.
- **Sem placeholder:** todos os ADRs têm conteúdo final; nenhum `TODO`, `TBD` ou `_(pendente)_`.
- **Consistência:** cada ADR usa slug `ADR-NNNN-slug.md`; frontmatter tem exatamente os 4 campos (`tipo`, `status`, `data`, `data-retroativo`); todos os wikilinks a ADRs usam `[[decisions/ADR-NNNN-slug]]` sem `.md`.

---

## Execução — próximo passo

**Plano completo e salvo em `docs/superpowers/plans/2026-11-04-esquema-adr-design.md`.** Duas opções de execução:

1. **Subagent-Driven (recomendado)** — despacha o agente `docs-curator` por task. Entre tasks, usuário revisa o diff proposto antes de aplicar. Boa fit aqui porque:
   - A regra do projeto diz que **só o `docs-curator` escreve em `docs/`**.
   - `docs-curator` já tem o protocolo "propor antes de aplicar".
   - Permite parar a qualquer task se o usuário quiser ajustar algo.

2. **Inline Execution** — executar tasks nesta sessão em batch com checkpoints. Pior ergonomia aqui porque violaria a regra de que agentes genéricos não escrevem em `docs/`.

Qual abordagem?
