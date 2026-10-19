# Agentes

O projeto easycert conta com 6 agentes automatizados que orquestram análise, construção, revisão e documentação. Cada agente tem responsabilidade única, protocolo rígido de interação e escopo isolado. Os agentes vivem em `.claude/agents/`.

O fluxo canônico com o superpowers é: **spec/plano** → `tech-architect` (crítica arquitetural) → **aprovação do usuário** → `backend-builder` e/ou `frontend-builder` (construção) → `code-reviewer` (com Opus se crítico) → `docs-curator` (registrar) → **usuário comita**.

---

## tech-architect

**Modelo:** Opus | **Modo:** read-only (análise)

Analisa criticamente specs do superpowers (`docs/superpowers/specs/`) e planos (`docs/superpowers/plans/`) antes da construção. Confronta a proposta com o vault ([[INDEX]], [[ARCHITECTURE]], [[STACK]], [[MODULES]], [[DATABASE]], notas de `dominio/`) e com o estado real do repositório. Devolve bloqueadores, importantes e sugestões, aderência à stack, impacto em pendências, veredito e delegações.

- Entrada: caminho de spec/plano + contexto do pedido.
- Saída: relatório estruturado (Bloqueador 🚫 / Importante ⚠️ / Sugestão 💡) + veredito + próxima ação sugerida.
- Escopo: leitura em `docs/` e código; nunca escreve código ou docs direto; nunca commita.

---

## backend-builder

**Modelo:** Sonnet | **Modo:** execução de plano aprovado

Constrói a parcela backend de um plano já aprovado: módulos NestJS 11 em `apps/api/src/`, schema e migrations Prisma 6 em `packages/db/prisma/`, DTOs em `packages/types/src/`. Respeita separação estrita web↔api (`@easycert/db` só em `apps/api/`). Roda `pnpm typecheck` e `pnpm test` ao final. Migrations destrutivas exigem segunda aprovação explícita.

- Entrada: plano aprovado tocando backend.
- Saída: código aplicado + checks executados + delegações (`code-reviewer`, `docs-curator`, eventualmente `frontend-builder`).
- Escopo: escreve em `apps/api/`, `packages/db/`, `packages/types/`; nunca toca `apps/web/`; nunca commita; nunca escreve em `docs/`.

---

## frontend-builder

**Modelo:** Sonnet | **Modo:** execução de plano aprovado

Constrói a parcela frontend de um plano já aprovado: páginas e layouts Next.js 15 (App Router + Turbopack) + React 19 em `apps/web/src/app/`, consumindo DTOs de `@easycert/types`. Server Actions nunca tocam banco direto — toda escrita vai pela API NestJS. Roda `pnpm --filter @easycert/web typecheck` e `lint` ao final.

- Entrada: plano aprovado tocando frontend.
- Saída: código aplicado + checks executados + delegações.
- Escopo: escreve em `apps/web/`; nunca importa `@easycert/db`; nunca toca backend/schema; nunca commita; nunca escreve em `docs/`.

---

## code-reviewer

**Modelo default:** Sonnet | **Modo:** read-only

Revisa diffs antes de commit buscando bugs, brechas de segurança e inconsistências com as convenções do projeto ([[ARCHITECTURE]], [[STACK]], [[MODULES]]). Roda `pnpm typecheck`, `pnpm lint`, `pnpm test` e sinaliza mudanças doc-worthy para escalar ao `docs-curator`.

**Escalonamento para Opus** (reinvocar com override `model: opus`) é obrigatório em conteúdo crítico: autenticação/autorização, criptografia e QRCode, migrations destrutivas, upload de arquivo, geração de documento oficial, PII, travessia web↔api, decisão que ratifica pendência de [[dominio/pendencias]].

- Entrada: diff staged/unstaged + checks.
- Saída: relatório por severidade (Bloqueador / Importante / Nit) + flag doc-worthy + veredito.
- Escopo: read-only; nunca edita código; nunca commita.

---

## tcc-writer

**Modelo:** Sonnet | **Modo:** read-only (produção de conteúdo)

Produz rascunhos acadêmicos PT-BR para `docs/tcc/`: seções do artigo, metodologia, trabalhos correlatos, cronograma. Respeita páginas-alvo e formato de citação em uso no vault. Delega 100% ao `docs-curator` para aplicar.

- Entrada: seção/correlato a redigir.
- Saída: rascunho acadêmico PT-BR + instrução precisa pro `docs-curator`.
- Escopo: produção de conteúdo; não edita o vault; nunca commita.

---

## docs-curator

**Modelo:** Haiku | **Modo:** escrita com proposta

Mantém o vault Obsidian em `docs/` coerente, atualizado e fiel às convenções de [[CLAUDE]]. Única interface de escrita autorizada no vault: propõe mudanças antes de aplicar, valida convenções (INDEX, wikilinks, frontmatter) e resolve referências cruzadas.

- Entrada: proposta de mudança (nota nova, edição, decisão resolvida).
- Saída: mudanças aplicadas com backlinks atualizados.
- Escopo: escrita exclusiva em `docs/`; nunca toca código; nunca commita.

---

## Protocolo de interação

### Fases por agente

Cada agente segue três fases:

1. **Fase 1 — Entender:** lê contexto ([[INDEX]], convenções, notas relevantes, estado do repositório), valida se a tarefa cabe no seu escopo.
2. **Fase 2 — Propor/Confirmar:** devolve plano estruturado (resumo, arquivos afetados, colaterais, dúvidas) e aguarda aprovação. Os **builders** (`backend-builder`, `frontend-builder`) operam só sob plano aprovado — não propõem, confirmam escopo e executam.
3. **Fase 3 — Executar:** só executa quando recebe aprovação explícita; se descobrir desvio meio-caminho, para e reaplica proposta.

Agentes **read-only** (`tech-architect`, `code-reviewer`, `tcc-writer`) nunca editam código ou docs — sempre propõem e delegam.

### Padrões transversais invioláveis

- **Nenhum agente commita.** Proibido `git commit`, `git push`, `git tag`, `git merge`, `git rebase`, `git reset --hard`, `git checkout --`. O commit é sempre do usuário.
- **Nenhum agente escreve em `docs/` direto** exceto o `docs-curator`. Mudança doc-worthy termina sempre com delegação a ele.
- **Separação estrita web↔api** é regra arquitetural de todos os builders: `@easycert/db` só em `apps/api/`; Server Actions nunca tocam banco; DTOs em `@easycert/types`.
- **Pendências de [[dominio/pendencias]] não são assumidas como resolvidas** por nenhum agente — qualquer plano que dependa de pendência não ratificada deve parar e sinalizar.

### Fluxo canônico (spec → merge)

1. Spec ou plano criado em `docs/superpowers/specs/` ou `docs/superpowers/plans/`.
2. `tech-architect` analisa e devolve veredito arquitetural.
3. Usuário aprova (ou pede ajuste e reinvoca o `tech-architect`).
4. `backend-builder` e/ou `frontend-builder` executam a parcela correspondente.
5. `code-reviewer` revisa o diff (reinvocar com `model: opus` em conteúdo crítico).
6. `docs-curator` registra as mudanças doc-worthy no vault.
7. Usuário comita.

## Notas relacionadas

- [[ARCHITECTURE]] — visão técnica do sistema onde os agentes atuam.
- [[STACK]] — tecnologias ratificadas que os builders respeitam.
- [[MODULES]] — módulos do backend e frontend que os builders tocam.
- [[DATABASE]] — alvo das mudanças backend com schema Prisma.
- [[API_ROUTES]] — rotas HTTP que `backend-builder` cria e `frontend-builder` consome.
- [[dominio/pendencias]] — decisões em aberto consultadas por todos os agentes.
