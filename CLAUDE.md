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
