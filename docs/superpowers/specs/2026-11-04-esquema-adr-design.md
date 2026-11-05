# Spec — Esquema ADR (Architecture Decision Records)

**Data:** 2026-11-04
**Autor:** Pedro Henrique (brainstorming conduzido via Claude Code)
**Status:** proposto — propõe padrão de documentação de decisões; aguarda ratificação do próprio padrão antes do plano de execução.
**Objetivo:** estabelecer padrão ADR no vault para rastrear decisões técnicas + arquiteturais transversais, diferenciando de specs (design de feature) e de notas de domínio (regra de negócio).

---

## 1. Objetivo e não-objetivos

### O que o esquema resolve

- **Rastreamento de decisões transversais.** Quando uma decisão impõe invariante no código, teve alternativas seriamente consideradas, ou é cara de reverter, ela merece ficar registrada com contexto ("por quê") e com as alternativas descartadas.
- **Higiene futura.** Quem lê o código no futuro entende por que escolhemos X e não Y, sem ressuscitar discussões já fechadas.
- **Versionamento de decisões.** ADRs podem ser superados (`status: superado-por-ADR-NNNN`), criando cadeia histórica clara.
- **Ligação com [[STACK]], [[ARCHITECTURE]] e [[MODULES]].** ADRs linkam de volta pras notas estruturais e vice-versa.

### O que deliberadamente não resolve

- **Não captura toda decisão.** Decisões pontuais sem alternativa discutida (constantes, estilo de código, configuração) continuam em `STACK.md` ou notas de domínio.
- **Não substitui `STACK.md`.** `STACK.md` descreve o stack ativo (denso); ADR captura o contexto histórico e as alternativas (profundo). Coexistem.
- **Não é defesa acadêmica.** Decisões de produto/domínio (categorias de horas, papéis de aluno, fluxo de aprovação) continuam em `dominio/` e `pendencias.md`. ADR é engenharia/arquitetura.

---

## 2. Localização no vault

### Pasta nova: `docs/decisions/`

Criada como **irmã de `dominio/`, `superpowers/`, `tcc/`, `design/`** no topo de `docs/`.

**Estrutura:**

- `docs/decisions/_template.md` — template vazio (prefixo `_` pra ficar no topo do `ls` e pra Obsidian não listar como ADR real).
- `docs/decisions/ADR-NNNN-slug.md` — ADRs sequenciais, 4 dígitos, slug em kebab-case.
- Sem subpastas; todos os ADRs no mesmo nível.

### Entrada no `INDEX.md`

A seção `## Decisões` do `INDEX.md` será criada no plano de execução que materializa os 7 ADRs retroativos — este spec só adiciona o link pra si mesmo em `## Superpowers — Specs e Plans`.

Formato esperado da futura seção:

```markdown
## Decisões
- [[decisions/ADR-0001-zod-contrato-unico]] — `aceito` (2026-10-19)
- [[decisions/ADR-0002-argon2id-senha]] — `aceito` (2026-10-22)
```

---

## 3. Template completo do ADR

Frontmatter YAML mínimo + 4 seções obrigatórias + Notas relacionadas:

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

### Campo por campo

- **`tipo: decisao`** — novo tipo de frontmatter, extensão dos existentes (`visão`, `arquitetura`, `regra-de-negócio`, `pendência`, `rascunho`). Precisa ser registrado em [[CLAUDE]] do vault.
- **`status`** — ciclo de vida (ver Seção 7).
- **`data`** — data original em que a decisão foi tomada.
- **`data-retroativo`** — data em que o ADR foi escrito no vault. Omitir se o ADR é novo (não retroativo).

---

## 4. Integração com arquivos existentes

### 4.1 `STACK.md`

Linhas inline tipo "Ratificado em DATA" serão reescritas pra apontar ao ADR correspondente.

**Antes (exemplo real, `STACK.md`):**

```markdown
- **Hash de senha:** argon2id via `@node-rs/argon2` (binding Rust via napi-rs, zero node-gyp). Parâmetros default: m=19456, t=2, p=1. Ratificado em 2026-10-22.
```

**Depois:**

```markdown
- **Hash de senha:** argon2id via `@node-rs/argon2` (binding Rust via napi-rs, zero node-gyp). Parâmetros default: m=19456, t=2, p=1. Ver [[decisions/ADR-0002-argon2id-senha]].
```

Mesmo padrão pra cookie HttpOnly e CSRF.

### 4.2 `pendencias.md`

Quando uma pendência vira decisão, trocar "resolvida em DATA" por link pro ADR. Modelo:

```markdown
_(antes)_: Resolvida em 2026-10-22
_(depois)_: Resolvida via [[decisions/ADR-NNNN-slug]].
```

### 4.3 Specs antigos em `superpowers/specs/`

Specs antigos **não mudam.** ADRs novos linkam pra eles em "Notas relacionadas".

**Spec ≠ ADR:** spec descreve design de feature; ADR captura decisão transversal. Um único spec pode gerar vários ADRs (ex.: o spec do Mês 2 gerou argon2id + cookie HttpOnly + csrf-csrf = 3 ADRs).

---

## 5. Gatilhos — o que vira ADR

Uma decisão vira ADR quando bate em **pelo menos um** destes critérios:

1. **Impõe invariante no código** — regra que, se violada, quebra o sistema (ex.: "todo service que escreve chama `auditService.log()`").
2. **Teve alternativas seriamente consideradas** — Zod vs Joi vs class-validator, debatido e descartado.
3. **É cara de reverter** — mudar cookie HttpOnly pra localStorage é refactor substancial.

**NÃO vira ADR:**

- Decisão pontual sem alternativa (ex.: `@Throttle(30 req/min)` — constante de segurança, fica em `STACK` ou `eventos-internos.md`).
- Estilo de código (nome de variável, base de espaçamento).
- Configuração (`PORT=3333`, `CORS origin`).

**Casos limítrofes:** `docs-curator` propõe ao usuário; usuário decide.

---

## 6. Fluxo de criação (operacional)

Quando uma decisão é identificada como doc-worthy e ADR-worthy:

1. **Delegação ao `docs-curator`.**
2. **Lê `docs/decisions/`** → `ls decisions/ADR-*.md` → próximo NNNN = max + 1.
3. **Copia `_template.md`** → `ADR-NNNN-slug.md`. Slug em kebab-case, imperativo.
4. **Preenche:**
   - Frontmatter: `tipo: decisao`, `status`, `data`, `data-retroativo` (se aplicável).
   - 4 seções conforme template.
   - Notas relacionadas linkando specs / `STACK` / `MODULES` onde a decisão aparece.
5. **Se supera outro ADR:** edita ADR antigo → `status: superado-por-ADR-NNNN` + linha no corpo linkando o sucessor.
6. **Se resolve pendência:** edita `pendencias.md` trocando status por link pro ADR.
7. **Se muda `STACK.md`:** reescrita inline conforme Seção 4.1.
8. **Atualiza `INDEX.md` seção `## Decisões`** com entrada nova.
9. **Propõe diff completo.** Usuário aprova. Aplica.

---

## 7. Ciclo de vida (`status`)

| Status | Significado |
|---|---|
| `proposto` | Rascunhado, aguardando ratificação (ex.: spec ainda não aprovada). |
| `aceito` | Em vigor no código. |
| `superado-por-ADR-NNNN` | Substituído por sucessor mais recente. Permanece no vault como histórico; corpo linka o sucessor. |
| `descartado` | Avaliado e rejeitado antes de virar `aceito`. Fica como registro de "consideramos X, dissemos não porque Y". |

---

## 8. Migração retroativa — os 7 ADRs essenciais

Serão criados numa rodada posterior (plano de execução). Todos usam `data: <data original>` + `data-retroativo: 2026-11-04` no frontmatter.

| ADR | Título | Fonte histórica | Data original | Alternativas-chave rejeitadas |
|---|---|---|---|---|
| ADR-0001 | Zod + nestjs-zod como contrato único web↔api em `@easycert/types` | [[superpowers/specs/2026-10-19-requisitos-mes-1#8. Decisões técnicas resolvidas]] | 2026-10-19 | class-validator (menos parse, duas APIs); Joi (ergonomia menor em TS); schemas duplicados web/api (rot garantido) |
| ADR-0002 | Hash de senha com argon2id via `@node-rs/argon2` | [[STACK#Autenticação]], [[superpowers/specs/2026-10-22-plano-mes-2]] | 2026-10-22 | bcrypt (vence benchmark mas inferior a argon em GPU); scrypt (menos testado no ecossistema Node); argon2 via node-gyp (quebra build sem toolchain) |
| ADR-0003 | JWT em cookie HttpOnly SameSite=Lax (`easycert_session`) | [[STACK#Autenticação]] | 2026-10-22 | `localStorage` (vulnerável a XSS); header `Authorization` manual (sem anexo automático pelo browser, mais código no cliente) |
| ADR-0004 | Mitigação CSRF via `csrf-csrf` com double-submit cookie | [[STACK#Autenticação]] | 2026-10-22 | `csurf` (deprecado); synchronizer token (requer sessão server-side); SameSite=Strict só (quebra fluxos cross-site legítimos) |
| ADR-0005 | Separação estrita web↔api — frontend nunca importa `@easycert/db` nem toca Postgres direto | [[ARCHITECTURE]], [[MODULES]] | 2026-10-19 | Server Actions com acesso direto a DB (acopla frontend ao schema); tRPC (adiciona camada sem ganho claro); monolito único (perde isolamento) |
| ADR-0006 | AuditLog append-only via `REVOKE UPDATE, DELETE` no role `easycert_app` | [[STACK#Observabilidade]], [[dominio/pendencias#Resolvidas após ratificação (2026-10-20+)]] | 2026-10-22 | Imutabilidade só na aplicação (reversível por bug ou dev); triggers (lógica distribuída, mais difícil auditar); arquivo de log externo (menos consultável, perde FK) |
| ADR-0007 | shadcn/ui + Tailwind CSS + Radix UI no frontend | [[STACK#Frontend]], [[superpowers/specs/2026-10-19-requisitos-mes-1#8. Decisões técnicas resolvidas]] | 2026-10-19 | MUI (opinião forte de design, difícil customizar); Chakra (overhead runtime); Mantine (menos tração no ecossistema); CSS custom do zero (lento, acessibilidade manual) |

---

## 9. O que fica fora deliberadamente

Decisões que NÃO viram ADR nesta migração retroativa (motivo: baixo valor retroativo ou fora de escopo):

- **Foundational do stack:** NestJS, Prisma, Next.js, TypeScript, pnpm, Turborepo. Alternativas genéricas demais ("Express", "TypeORM", "Remix") e decisão já consolidada no mercado JS moderno. Se virar ADR, será num contexto futuro de migração.
- **Rate-limit 30 req/min em `GET /v/:codigo`** — constante de segurança (RNF-03), não decisão arquitetural. Cabe em `STACK` + `eventos-internos.md`.
- **Libs sem atrito:** `nestjs-pino`, `@nestjs/throttler`, `@phosphor-icons/react`. Escolhas sem alternativas discutidas no histórico.

---

## 10. Atualizações em `CLAUDE.md` (raiz) e `docs/CLAUDE.md`

### 10.1 Raiz do projeto (`CLAUDE.md`)

Adicionar à lista de mudanças doc-worthy:

> Nova decisão arquitetural que (a) impõe invariante no código, (b) teve alternativas seriamente consideradas ou (c) é cara de reverter — vira ADR em `docs/decisions/`. Delegar ao `docs-curator` com o contexto da decisão (o "por quê").

### 10.2 Vault (`docs/CLAUDE.md`)

Adicionar à seção "Novos tipos (`tipo:` do frontmatter)":

> `decisao` — Architecture Decision Record (ADR). Decisões técnicas transversais que impõem invariante, tiveram alternativas consideradas ou são caras de reverter. Ciclo de vida: `proposto | aceito | superado-por-ADR-NNNN | descartado`. Localização: `docs/decisions/ADR-NNNN-slug.md`. Template em `docs/decisions/_template.md`.

Ambas as mudanças serão aplicadas pelo plano de execução, não por este spec.

---

## 11. Fora de escopo deste spec

- **Escrever o conteúdo dos 7 ADRs retroativos** — fica pro plano de execução subsequente.
- **Criar a pasta `docs/decisions/` e o `_template.md`** — idem.
- **Automação (lint, script pra numeração, hook pre-commit)** — podem virar tasks futuras; não fazem parte do MVP do esquema.

---

## Notas relacionadas

- [[STACK]] — descrição do stack ativo; ADRs complementam com histórico e alternativas.
- [[ARCHITECTURE]] — visão de sistema; ADRs rastreiam decisões estruturantes.
- [[MODULES]] — módulos; ADRs justificam padrões que atravessam módulos.
- [[dominio/pendencias]] — decisões em aberto; ADRs são decisões fechadas com contexto.
- [[superpowers/specs/2026-10-19-requisitos-mes-1]] — spec do Mês 1, fonte de ADR-0001 e ADR-0007.
- [[superpowers/specs/2026-10-22-plano-mes-2]] — plano do Mês 2, fonte de ADR-0002, ADR-0003, ADR-0004, ADR-0006.
- [[CLAUDE]] — convenções do vault; ADRs adicionam novo `tipo: decisao`.
