# Agentes

O projeto easycert conta com 6 agentes automatizados que orquestram a arquitetura, documentação e qualidade do código. Cada agente tem responsabilidade única e protocolo rígido de interação. Os agentes vivem em `.claude/agents/`.

---

## code-reviewer

**Modelo:** Sonnet | **Modo:** read-only

Revisa diffs antes de commit buscando bugs, brechas de segurança e inconsistências com convenções do projeto ([[ARCHITECTURE]], [[STACK]], [[MODULES]]). Roda `pnpm typecheck`, `pnpm lint`, `pnpm test` e sinaliza mudanças doc-worthy para escalar ao `docs-curator`.

- Entrada: diff staged/unstaged + checks.
- Saída: relatório estruturado por severidade (Bloqueador / Importante / Nit) + flag doc-worthy.
- Escopo: read-only, nunca edita código.

---

## feature-scaffolder

**Modelo:** Sonnet | **Modo:** escrita com proposta

Scaffolda nova feature em slice vertical (API NestJS + DTOs em `@easycert/types` + página Next.js quando aplicável), respeitando a separação estrita web↔api de [[ARCHITECTURE]]. Propõe estrutura antes de aplicar e delega ao `docs-curator` para registrar em [[API_ROUTES]] e [[MODULES]].

- Entrada: nome da feature, módulo destino.
- Saída: arquivos esqueleto + delegação para `docs-curator`.
- Escopo: escreve código em `apps/api/`, `packages/types/` e `apps/web/`.

---

## prisma-migrator

**Modelo:** Sonnet | **Modo:** escrita com proposta e protocolo

Gerencia mudanças no schema Prisma (`packages/db/prisma/schema.prisma`): edição do schema → migration nomeada → `pnpm db:generate` → delegação ao `docs-curator` para atualizar [[DATABASE]]. Mudanças destrutivas exigem segunda aprovação explícita.

- Entrada: especificação de mudança (entidade, campos, relações).
- Saída: schema editado + migration criada + client regenerado + delegação para `docs-curator`.
- Escopo: só `packages/db/prisma/schema.prisma` e `pnpm db:*`.

---

## pendencia-resolver

**Modelo:** Sonnet | **Modo:** read-only (pesquisa + proposição)

Pesquisa 2–3 opções em fontes confiáveis para itens de [[dominio/pendencias]], compara trade-offs no contexto do projeto (TCC/MVP, stack atual, prazo de 5 meses) e propõe decisão fundamentada. Delega ao `docs-curator` para aplicar. Para decisões estruturais (auth, storage), escalar para Opus via override.

- Entrada: item de pendência + contexto do projeto.
- Saída: análise comparativa + recomendação + instruções pro `docs-curator`.
- Escopo: pesquisa e proposição, nunca edita.

---

## tcc-writer

**Modelo:** Sonnet | **Modo:** read-only (produção de conteúdo)

Produz rascunhos de conteúdo acadêmico PT-BR para `docs/tcc/`: seções do artigo, metodologia, trabalhos correlatos, cronograma. Respeita páginas-alvo e formato de citação do vault. Delega 100% ao `docs-curator` para aplicar.

- Entrada: seção/correlato a redigir.
- Saída: rascunho acadêmico PT-BR + instrução pro `docs-curator`.
- Escopo: produção de conteúdo, não edita o vault.

---

## docs-curator

**Modelo:** Haiku | **Modo:** escrita com proposta

Mantém o vault Obsidian em `docs/` coerente, atualizado e fiel às convenções de [[CLAUDE.md]]. Única interface de escrita autorizada no vault: propõe mudanças antes de aplicar, valida convenções (INDEX, wikilinks, frontmatter), e resolve referências cruzadas.

- Entrada: proposta de mudança (nota nova, edição, decisão resolvida).
- Saída: mudanças aplicadas com backlinks atualizados.
- Escopo: escrita exclusiva em `docs/`, nunca toca código.

---

## Protocolo de interação

Cada agente segue três fases:

1. **Fase 1 — Entender:** lê contexto (INDEX, convenções, notas relevantes), valida se a tarefa cabe em seu escopo.
2. **Fase 2 — Propor:** devolve plano estruturado (resumo, arquivos afetados, colaterais, dúvidas), aguarda aprovação.
3. **Fase 3 — Executar:** só executa quando recebe aprovação explícita; se descobrir desvio meio-caminho, para e reaplica proposta.

Agentes **read-only** (`code-reviewer`, `pendencia-resolver`, `tcc-writer`) nunca editam código ou docs — sempre propõem e delegam.

Padrão transversal: nenhum dos 6 agentes escreve em `docs/` direto exceto o próprio `docs-curator`. Mudança doc-worthy sempre termina com delegação a ele.

## Notas relacionadas

- [[ARCHITECTURE]] — visão técnica do sistema onde os agentes atuam.
- [[MODULES]] — módulos do backend/frontend que `feature-scaffolder` cria.
- [[DATABASE]] — alvo das mudanças do `prisma-migrator`.
- [[dominio/pendencias]] — alvo do `pendencia-resolver`.
