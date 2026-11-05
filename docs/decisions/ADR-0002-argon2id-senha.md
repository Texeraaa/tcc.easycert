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
