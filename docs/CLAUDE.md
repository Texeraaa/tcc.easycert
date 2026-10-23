# CLAUDE.md — regras para operar em `docs/`

Regras que agentes (Claude Code e similares) devem seguir ao editar este vault.

## Regras invioláveis

- **[[INDEX]] só referencia outros `.md`.** Não escreva conteúdo real nele. Apenas uma linha por link, no formato `- [[ARQUIVO]] — frase curta descritiva.`
- **Todo link entre notas `.md` é wikilink** `[[Nome]]` ou `[[Nome#Seção]]`. Nunca use link markdown relativo para `.md`.
- **Assets não-`.md`** (HTML, imagens, PDFs) usam link markdown relativo: `[arquivo](./arquivo.html)`.
- **Frontmatter mínimo** nas notas de `dominio/`: apenas `tipo` e `status`. Arquivos estruturais na raiz (`ARCHITECTURE`, `MODULES`, etc.) **não** usam frontmatter — começam direto com `# Título`.
- **Idioma:** PT-BR em todo conteúdo, callouts e descrições.

## Convenções de escrita

- Prosa clara e direta, imperativa quando aplicável.
- Negrito para termos-chave e decisões.
- Hierarquia de headings consistente: `# Título` único, `## Seção`, `### Subseção` (raro `####`).
- Separador `---` entre seções lógicas quando ajudar a leitura.
- Placeholder explícito para o que falta: `_(pendente)_` — não invente conteúdo.
- Callouts para avisos:
  - `> [!warning] Em aberto` — bloqueadores e decisões não tomadas.
  - `> [!info] A confirmar` — itens não bloqueadores que precisam ratificação.
- Toda nota de conteúdo termina com `## Notas relacionadas` listando wikilinks relevantes.

## Fluxo de edição

1. Antes de criar nota nova, verifique se já existe conteúdo equivalente — prefira estender a duplicar.
2. Ao resolver uma pendência listada em [[dominio/pendencias]], atualize **a nota de origem** (removendo o callout) e remova o item da lista de pendências.
3. Ao adicionar nota nova, inclua um link para ela em [[INDEX]] na categoria apropriada.
4. Novos tipos (`tipo:` do frontmatter) devem seguir o padrão existente: `visão`, `arquitetura`, `regra-de-negócio`, `pendência`, `rascunho`. Se precisar de um novo tipo, documente aqui.
   - `rascunho` — texto em elaboração, tipicamente em `tcc/rascunhos/`, destinado a virar seção do artigo final ou prosa consolidada em outra nota.

## Nomenclatura

- Arquivos estruturais na raiz: `UPPERCASE.md` (ex.: `ARCHITECTURE.md`).
- Notas de domínio: `kebab-case.md` (ex.: `horas-complementares.md`).
- Specs/plans datadas (quando aplicável): `YYYY-MM-DD-descricao.md`.
