# docs/

Vault Obsidian com a documentação do **easycert** — plataforma de gestão de horas complementares.

## Como usar

- Abra esta pasta como vault no [Obsidian](https://obsidian.md/).
- O ponto de entrada é [[INDEX]].
- Toda navegação entre notas é feita por wikilinks `[[Nome]]`.
- Conteúdo real **nunca** fica em [[INDEX]] — apenas referências.

## Convenções

- **Arquivos estruturais** (visão de código/infra) ficam na raiz em `UPPERCASE.md`.
- **Notas de domínio** (regra de negócio, produto) ficam em `dominio/` em `kebab-case.md`.
- Frontmatter YAML usa apenas `tipo` e `status` (ver notas existentes).
- Placeholder para conteúdo a preencher: `_(pendente)_`.
- Decisões em aberto / avisos usam callouts `[!warning]` e `[!info]`.
- Cada nota de conteúdo termina com uma seção `## Notas relacionadas` com wikilinks.

## Regra inviolável

[[INDEX]] só contém referências para outros `.md`. Nenhum conteúdo real vive lá.
