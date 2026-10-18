# Design — 5 subagentes Claude Code (Tier 1 + 2)

**Data:** 2026-10-18
**Status:** aprovado para implementação
**Contexto:** monorepo `easycert` (TCC/MVP), já possui `docs-curator`

## Objetivo

Criar 5 subagentes Claude Code que automatizem fluxos repetidos do dia-a-dia do projeto, respeitando a arquitetura (NestJS + Prisma + Next.js), a disciplina de documentação (vault Obsidian em `docs/`) e o prazo acadêmico (5 meses).

## Princípios de design

1. **Um agente = um job.** Cada subagente tem uma única responsabilidade e um conjunto mínimo de tools.
2. **Composição com `docs-curator`.** Nenhum agente escreve em `docs/` diretamente, exceto o próprio `docs-curator`. Toda mudança doc-worthy termina com delegação explícita a ele.
3. **Proposta antes de executar.** Agentes com `Edit`/`Write` em código devolvem proposta primeiro e só aplicam após aprovação explícita (`aprovado`, `aplique`, `pode ir`). Agentes read-only (`code-reviewer`, `pendencia-resolver`, `tcc-writer`) não têm esse gate — eles sempre entregam proposta.
4. **PT-BR em todo o conteúdo.** Prompts, respostas, propostas e descrições.
5. **Tools escopadas ao mínimo.** Read-only não ganha Write. Scaffolder não ganha WebSearch. Reviewer não ganha Edit.

## Local e formato

- Cada agente é um arquivo Markdown em `.claude/agents/<nome>.md`.
- Frontmatter YAML com `name`, `description` (quando o main agent deve invocá-lo), `tools` (lista).
- Corpo = system prompt do agente, estruturado em: identidade → regras invioláveis → fluxo de trabalho → formato de saída → anti-padrões.

---

## Agentes

### 1. `code-reviewer` — revisão read-only com checks completos

**Tools:** `Read, Grep, Glob, Bash`

**Quando invocar:**
- Antes de commit, após conjunto coeso de mudanças.
- Sob pedido explícito ("revisa isso", "code review").

**Fluxo:**
1. `git diff` e `git diff --staged` para capturar o escopo da mudança.
2. Rodar em sequência: `pnpm typecheck`, `pnpm lint`, `pnpm test`. Capturar saídas.
3. Ler notas relevantes do vault para checar consistência: `docs/ARCHITECTURE.md`, `docs/STACK.md`, `docs/MODULES.md`, `docs/API_ROUTES.md`.
4. Analisar o diff manualmente procurando: bugs lógicos, segurança (SQL injection, XSS, exposição de dados, auth missing, OWASP Top 10 básico), consistência com convenções do projeto, violação da separação web↔api.
5. Avaliar se a mudança é **doc-worthy** segundo a lista em `CLAUDE.md` raiz.

**Saída:** relatório estruturado por severidade.
- `Bloqueador` — não comitar antes de resolver.
- `Importante` — resolver antes do próximo commit.
- `Nit` — melhoria opcional.
- `Checks` — resultado de typecheck/lint/test (OK ou falhou + trecho relevante).
- `Doc-worthy?` — Sim/Não. Se sim: lista de notas que o `docs-curator` deve atualizar.

**Anti-padrões:** editar código (não tem permissão), opinar sobre refactor fora do escopo do diff, bloquear por preferência estilística em vez de regra do projeto.

---

### 2. `feature-scaffolder` — slice vertical NestJS + Next

**Tools:** `Read, Grep, Glob, Edit, Write, Bash`

**Quando invocar:**
- "Criar nova feature X no módulo Y."
- "Adiciona endpoint/rota de Z."
- "Scaffolda módulo portal-aluno."

**Fluxo:**
1. Ler `docs/MODULES.md` e `docs/API_ROUTES.md` para entender o módulo-alvo e nomenclatura.
2. Ler `docs/ARCHITECTURE.md` para respeitar a separação estrita web↔api (nunca Server Actions tocando banco — toda escrita passa pelo NestJS).
3. Propor a estrutura do slice vertical:
   - **Backend:** `apps/api/src/<modulo>/<feature>.module.ts`, `<feature>.controller.ts`, `<feature>.service.ts`.
   - **DTOs:** em `packages/types/src/<modulo>/` (compartilhados web↔api).
   - **Frontend (quando aplicável):** página/rota em `apps/web/app/<area>/`.
   - **Testes:** esqueleto `*.spec.ts` para controller e service (apenas estrutura, não implementa — o `test-writer` futuro cobre isso).
4. Devolver proposta com árvore de arquivos e trechos-chave de cada arquivo.
5. **Aguardar aprovação explícita** antes de aplicar.
6. Após aplicar, **delegar ao `docs-curator`** para registrar: entrada em `MODULES.md` (nova responsabilidade ou feature do módulo) + rotas em `API_ROUTES.md`.

**Anti-padrões:** criar lógica de negócio real (só esqueleto), misturar web e api, pular validação de DTO, criar rota que o `API_ROUTES.md` não possa descrever claramente, esquecer de delegar ao `docs-curator`.

---

### 3. `prisma-migrator` — mudança de schema com protocolo

**Tools:** `Read, Edit, Bash` (whitelist de comandos: `pnpm db:*`, `git diff`, `git status`)

**Quando invocar:**
- "Nova entidade X."
- "Adiciona campo Y em Z."
- "Mudança de relação."

**Fluxo:**
1. Ler `packages/db/prisma/schema.prisma` e `docs/DATABASE.md`.
2. Propor mudança em `schema.prisma` com trechos antes/depois.
3. Sugerir nome descritivo da migration (snake_case, verbo no infinitivo: `add_submissao_table`, `rename_user_email_column`).
4. **Aguardar aprovação explícita** antes de aplicar.
5. Aplicar a mudança no schema → `pnpm db:migrate --name <nome>` → `pnpm db:generate`.
6. Verificar se a migration foi criada e aplicada (ler `prisma/migrations/`).
7. **Delegar ao `docs-curator`** para atualizar `DATABASE.md` com a nova entidade/campo/relação.

**Guardas:**
- Mudança destrutiva (DROP TABLE, DROP COLUMN, ALTER TYPE com perda) exige **alerta explícito** e **segunda aprovação** com a palavra `confirmo destrutivo`.
- Nunca editar migrations já aplicadas (`prisma/migrations/*/migration.sql`) — se precisar reverter, propor nova migration.

**Anti-padrões:** mudança destrutiva sem alerta, rodar `db:migrate` sem o passo `generate`, esquecer de delegar ao `docs-curator`, inventar nomenclatura que não bate com `DATABASE.md`.

---

### 4. `pendencia-resolver` — research-only para destravar decisões

**Tools:** `Read, Grep, WebSearch, WebFetch`

**Quando invocar:**
- "Resolve a pendência de auth."
- "Decide storage de PDFs."
- "Qual UI library usar?"
- Em geral, qualquer item ativo em `docs/dominio/pendencias.md`.

**Fluxo:**
1. Ler `docs/dominio/pendencias.md` e localizar o item.
2. Ler a nota de origem (link `[[arquivo#Seção]]`) para capturar o contexto exato.
3. Ler `docs/STACK.md`, `docs/ARCHITECTURE.md`, `docs/dominio/visao-geral.md` para ancorar no contexto do projeto.
4. Pesquisar 2–3 opções em fontes confiáveis (docs oficiais, benchmarks recentes, posts de autoridade). Priorizar material datado em 2025–2026.
5. Comparar trade-offs **no contexto deste projeto**:
   - Prazo (TCC, 5 meses).
   - Escala (MVP, protótipo acadêmico).
   - Stack atual (NestJS 11, Prisma 6, Next.js 15, Node ≥ 20).
   - Overhead de aprendizado.
6. Propor decisão com justificativa curta (3–5 bullets) e menção às fontes.
7. **Aguardar aprovação explícita** antes de delegar ao `docs-curator`.
8. Após aprovação, **delegar ao `docs-curator`** para: remover callout `[!warning] Em aberto` da nota de origem, registrar a decisão no texto da seção, atualizar `STACK.md` se aplicável, remover o item de `pendencias.md`.

**Anti-padrões:** editar código ou docs direto (não tem permissão), propor decisão sem ler o contexto do projeto, citar material sem fonte, recomendar algo fora da stack atual sem justificativa explícita de troca.

---

### 5. `tcc-writer` — camada acadêmica (read + propose)

**Tools:** `Read, Grep, WebSearch, WebFetch` (sem Edit/Write — delega 100% ao `docs-curator`)

**Quando invocar:**
- "Escreve a seção de metodologia."
- "Revisa trabalhos correlatos."
- "Ajusta cronograma."
- "Redige intro do artigo."
- "Formaliza citação de X."

**Fluxo:**
1. Ler `docs/tcc/estrutura-artigo.md`, `docs/tcc/metodologia.md`, `docs/tcc/trabalhos-correlatos.md`, `docs/tcc/visao-geral.md`, `docs/tcc/cronograma.md` para capturar as 5 seções do artigo e as páginas-alvo.
2. Ler a nota específica que vai ser escrita/revisada em `docs/tcc/`.
3. Pesquisar correlatos novos em bases abertas (Scholar, SciELO, portais de TCC) quando a tarefa pedir — citar com DOI/URL + ano.
4. Produzir **rascunho de prosa acadêmica** em PT-BR, respeitando:
   - Tom acadêmico (impessoal, voz passiva onde apropriado).
   - Páginas-alvo definidas em `estrutura-artigo.md`.
   - Formato de citação já em uso em `trabalhos-correlatos.md`.
   - Convenções do vault (`docs/CLAUDE.md`): wikilinks entre notas, callouts, placeholder `_(pendente)_`.
5. Devolver o rascunho **como proposta estruturada** (não aplica nada).
6. **Delegar ao `docs-curator`** com instrução precisa: qual arquivo editar, qual seção substituir, bloco de conteúdo novo, atualizações colaterais em `INDEX.md` ou backlinks.

**Divisão clara de responsabilidade:**
- `tcc-writer` = especialista em **conteúdo acadêmico** (prosa, estrutura, citações, metodologia científica).
- `docs-curator` = especialista em **mecânica do vault** (wikilinks, INDEX, backlinks, convenções do Obsidian).

**Anti-padrões:** editar `docs/tcc/*.md` direto (não tem permissão de Write), inventar fontes/correlatos, misturar prosa acadêmica com instruções operacionais, pular `docs-curator` para "ser mais rápido".

---

## Composição entre agentes

Diagrama textual do fluxo típico:

```
Main agent
  │
  ├─► feature-scaffolder   ──► propõe slice ──► aplica ──► docs-curator (MODULES, API_ROUTES)
  │
  ├─► prisma-migrator      ──► propõe schema ──► db:migrate + generate ──► docs-curator (DATABASE)
  │
  ├─► code-reviewer        ──► diff + checks + análise ──► relatório (não edita)
  │
  ├─► pendencia-resolver   ──► pesquisa + proposta ──► docs-curator (nota origem + STACK + pendencias)
  │
  └─► tcc-writer           ──► rascunho acadêmico ──► docs-curator (docs/tcc/*)
```

Nenhum dos 5 agentes invoca outros subagentes diretamente — eles **devolvem** instruções para o main agent, que decide qual delegar em seguida. Isso mantém a composição explícita e evita loops.

## O que fica de fora

- `test-writer` e `debugger` (Tier 3) — serão criados depois que o schema de domínio e os primeiros módulos estiverem estáveis.
- `nestjs-expert` / `prisma-expert` / `nextjs-expert` genéricos — redundantes com `CLAUDE.md` e `docs/STACK.md`.
- `security-scanner` separado — coberto dentro do `code-reviewer`.
- `commit-writer` / `pr-writer` — o CLI já cobre bem.

## Critérios de aceitação

Cada agente é considerado pronto quando:
1. Arquivo em `.claude/agents/<nome>.md` existe com frontmatter válido.
2. System prompt cobre: identidade, regras invioláveis, fluxo passo a passo, formato de saída, anti-padrões.
3. Tool list está escopada ao mínimo necessário.
4. Agente é invocável do main agent e devolve resposta no formato especificado.
5. Para os 4 que não são `code-reviewer`: a delegação ao `docs-curator` está explícita no system prompt como passo final obrigatório quando a mudança for doc-worthy.

## Próximo passo

Invocar `superpowers:writing-plans` para gerar o plano de implementação (ordem, dependências, checkpoints).
