# CLAUDE.md — easycert

Instruções para agentes operando no monorepo **easycert**.

## Documentação em `docs/`

O projeto mantém um vault Obsidian em `docs/` com toda a documentação viva (arquitetura, módulos, domínio, decisões, pendências). As regras do vault estão em `docs/CLAUDE.md`.

### Delegue ao agente `docs-curator`

Sempre que você fizer uma mudança **doc-worthy** no projeto, invoque o subagente `docs-curator` (em `.claude/agents/docs-curator.md`) para registrar a mudança. Mudanças doc-worthy incluem:

- Nova rota HTTP, módulo, controller, service.
- Nova entidade de banco, migration, mudança de schema.
- Nova dependência instalada ou removida (`package.json`, `pnpm-lock.yaml`).
- Decisão técnica tomada (escolha de biblioteca, padrão, abordagem).
- Decisão de produto tomada ou mudada.
- Pendência aberta (algo que bloqueia implementação) ou resolvida.
- Integração externa configurada (banco, auth, email, storage).

O agente **propõe** mudanças antes de aplicar; aguarde a aprovação do usuário antes de pedir ao agente para executar. Não escreva em `docs/` diretamente — passe pelo `docs-curator`.

### Invocação explícita

O usuário também pode pedir diretamente: "documenta isso", "registra em docs", "atualiza o Obsidian" ou similar. Nesses casos, delegue ao `docs-curator` imediatamente.

## Outros subagentes

Além do `docs-curator`, o projeto tem subagentes especializados em `.claude/agents/`:

- **`tech-architect`** — análise crítica de arquitetura sobre specs/planos do superpowers (`docs/superpowers/specs/`, `docs/superpowers/plans/`). Sempre lê `docs/INDEX.md` + a spec + notas-âncora (ARCHITECTURE, STACK, MODULES, DATABASE, dominio). Entrega bloqueadores/importantes/sugestões e veredito. Read-only, não escreve código, delega docs ao `docs-curator`. Modelo: **Opus**.
- **`backend-builder`** — executa parcela backend de plano já **aprovado**: NestJS 11 em `apps/api/src/`, Prisma 6 em `packages/db/prisma/`, DTOs em `packages/types/src/`. Roda `pnpm typecheck`/`test`. Nunca mexe em `apps/web/`, nunca commita, delega docs ao `docs-curator`. Modelo: Sonnet.
- **`frontend-builder`** — executa parcela frontend de plano já **aprovado**: Next.js 15 + React 19 em `apps/web/src/app/`, consumindo `@easycert/types`. Roda `pnpm typecheck`/`lint`. Nunca mexe no backend/schema, nunca commita, delega docs ao `docs-curator`. Modelo: Sonnet.
- **`code-reviewer`** — revisa diffs antes de commit (typecheck/lint/test, bugs/segurança, doc-worthy). Read-only, nunca commita. Modelo default: Sonnet. **Reinvocar com override `model: opus`** em conteúdo crítico: auth/autorização, criptografia/QRCode, migrations destrutivas, upload de arquivo, geração de documento oficial, PII, travessia web↔api, decisão que resolve pendência. Lista completa de gatilhos no próprio agente.
- **`tcc-writer`** — produz rascunhos acadêmicos PT-BR para `docs/tcc/`. Read-only, delega ao `docs-curator`. Modelo: Sonnet.

### Padrões transversais

- **Nenhum agente commita.** Proibido `git commit/push/tag/merge/rebase/reset-hard/checkout --`. O commit é sempre do usuário.
- **Nenhum agente escreve em `docs/` direto, exceto o `docs-curator`.** Mudança doc-worthy sempre termina com delegação a ele, que propõe antes de aplicar.
- **Builders operam só sob plano aprovado.** `backend-builder` e `frontend-builder` assumem que a spec/plano foi analisado (idealmente pelo `tech-architect`) e aprovado — não propõem, executam.
