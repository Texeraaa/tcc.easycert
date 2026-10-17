# Design — Documentação do TCC no vault `docs/`

**Data:** 2026-10-17
**Autor:** Claude Code (brainstormed com Pedro)
**Estado:** proposto

---

## Objetivo

Transportar o conteúdo do documento `TCC_Plataforma_Web_Para_Gestão_De_Atividades_Complementares - PEDRO.txt` (orientação de TCC do Pedro) para o vault Obsidian em `docs/`, preenchendo os `_(pendente)_` existentes e criando a seção acadêmica nova.

A documentação é a **fonte de verdade do projeto**. Depois dela, qualquer decisão de implementação (framework, modelagem, etc.) parte do que ficou escrito.

---

## Escopo

### Dentro
- Preencher as notas já existentes em `docs/` e `docs/dominio/` com o que o TCC já define (atores, requisitos funcionais, não-objetivos, fluxo de aprovação, categorias de horas).
- Criar nova pasta `docs/tcc/` com o artefato acadêmico: título refinado, justificativa, objetivos, estrutura do artigo, metodologia (SUS, As-Is/To-Be), cronograma de 5 meses, esqueleto de trabalhos correlatos.
- Atualizar `INDEX.md` com a nova categoria **TCC**.
- Registrar em `dominio/pendencias.md` o que o TCC **não** decide (framework backend/frontend/ORM, matriz curricular concreta, storage de PDFs, multi-IES vs. single-IES, autenticação).

### Fora
- Decidir framework/ORM/autenticação — fica como pendência.
- Reescrever o setup atual do monorepo (decisão já tomada: documentar a stack real).
- Escrever o artigo acadêmico final — só o esqueleto e metodologia ficam no vault.
- Implementar qualquer código do produto.

---

## Fontes

- **Primária:** `~/Downloads/TCC_Plataforma_Web_Para_Gestão_De_Atividades_Complementares - PEDRO.txt`
- **Repositório atual:** `apps/`, `packages/`, `docker-compose.yml`, `package.json`, `pnpm-workspace.yaml` (confirmar stack real).
- **Regras do vault:** `docs/CLAUDE.md` (wikilinks, frontmatter mínimo, PT-BR, callouts).

---

## Camadas da documentação

### Camada 1 — produto/domínio (atualiza arquivos existentes)

| Arquivo | O que preencher |
|---|---|
| `dominio/visao-geral.md` | *Fase atual* = TCC/MVP acadêmico. *Requisito central* = automação do fluxo de submissão→validação→consolidação→emissão, não CRUD de certificados. *Não-objetivos v1* = OCR, integração ERP, assinatura digital externa, multi-IES. |
| `dominio/atores-e-papeis.md` | Aluno, Coordenador/Avaliador, Administrador — responsabilidades do TCC seção 2. |
| `dominio/horas-complementares.md` | Categorias, carga horária **informada** vs. **aceita** pelo avaliador, matriz curricular por regra (regra concreta fica como pendência). |
| `dominio/fluxo-aprovacao.md` | Ciclo `Pendente → Aprovado/Indeferido com justificativa`; emissão de relatório consolidado; QRCode para eventos internos. |
| `ARCHITECTURE.md` | Fluxo fim-a-fim (aluno submete → avaliador analisa → horas lançadas → relatório/declaração emitida). Componentes de alto nível: portal-aluno, painel-coordenador, módulo-documentos, dashboard-gerencial. |
| `MODULES.md` | Esboço dos 4 módulos funcionais acima + pacotes compartilhados em `packages/`. |
| `DATABASE.md` | Postgres confirmado. ORM = pendência. Entidades iniciais: Aluno, Submissão, Categoria, RegraMatriz, Avaliação, Documento. |
| `STACK.md` | Confirmar pnpm+Turborepo+TypeScript+Postgres. Framework backend/frontend/ORM/validação = pendência. |
| `dominio/pendencias.md` | Lista das decisões ainda não tomadas (ver abaixo). |

### Camada 2 — artefato acadêmico (nova pasta `docs/tcc/`)

| Arquivo | Conteúdo |
|---|---|
| `tcc/visao-geral.md` | Título refinado, justificativa da mudança, objetivo geral, objetivos específicos (seção 1 do TCC). |
| `tcc/estrutura-artigo.md` | 5 seções do artigo (16–20 pág.) com páginas-alvo e tópicos de cada (seção 3 do TCC). |
| `tcc/metodologia.md` | Tipo de pesquisa, 4 fases metodológicas, SUS, comparação As-Is vs. To-Be (seção 3 do TCC). |
| `tcc/cronograma.md` | 5 meses com entregáveis mês a mês (seção 4 do TCC). |
| `tcc/trabalhos-correlatos.md` | Esqueleto para preencher depois: BPM/BPA, Low-Code/No-Code, assinatura digital, sistemas acadêmicos existentes. |

---

## Pendências a registrar

Serão listadas em `dominio/pendencias.md` como "em aberto" (bloqueiam) ou "a confirmar" (ratificar):

**Em aberto:**
- Framework backend (Fastify, NestJS, Hono?) — bloqueia estrutura de `apps/api`.
- Framework frontend (Next.js, Remix, Vite+React?) — bloqueia estrutura de `apps/web`.
- ORM/query builder (Drizzle, Prisma, Kysely?) — bloqueia `packages/db`.
- Autenticação (próprio, Supabase Auth, Clerk?) — bloqueia modelagem de usuário.
- Storage dos PDFs de comprovantes (filesystem, S3, Supabase Storage?) — bloqueia submissão.
- Matriz curricular concreta: formato de regra por categoria (JSON? tabela?) — bloqueia validação.

**A confirmar:**
- Multi-IES vs. instituição única na v1.
- QRCode de validação: só eventos internos ou todos os certificados emitidos pela plataforma?

---

## Delegação

Pelo `CLAUDE.md` do projeto, **nenhuma edição em `docs/` é feita direto**. Todas as mudanças passam pelo subagente `docs-curator`. O plano de implementação (próxima etapa) organizará as entregas em passos pequenos, cada um invocando o `docs-curator` com instruções específicas e esperando aprovação do usuário antes do próximo.

---

## Convenções respeitadas

- `INDEX.md` só referencia outros `.md`, uma linha por link.
- Wikilinks `[[Nome]]` para links entre `.md`.
- Frontmatter mínimo em `dominio/` e `tcc/`: `tipo` + `status`.
- Arquivos estruturais da raiz sem frontmatter.
- PT-BR em todo conteúdo.
- Callouts `[!warning]` / `[!info]` para pendências.
- Cada nota de conteúdo termina com `## Notas relacionadas`.

---

## Critério de pronto

- Todos os `_(pendente)_` listados acima foram substituídos por conteúdo real ou movidos para `pendencias.md` com justificativa.
- Pasta `docs/tcc/` existe com os 5 arquivos preenchidos a partir do `.txt` original.
- `INDEX.md` lista a categoria **TCC** e todos os novos arquivos.
- `pendencias.md` reflete as decisões em aberto reais.
- Commit único (ou poucos commits lógicos) com a mudança documentada.

---

## Riscos / observações

- O TCC sugere **Low-Code/No-Code/BaaS**; o repo é **tradicional**. Decidido: documentar a stack real. O artefato acadêmico em `docs/tcc/metodologia.md` descreverá a abordagem como **desenvolvimento acelerado com stack moderna + BaaS-like** (ex.: Postgres gerenciado, auth-as-a-service) para não contradizer o orientador — ajuste de narrativa, não de implementação.
- A matriz curricular concreta (regras por categoria) **não** está no TCC. Fica como pendência bloqueante — precisa ser levantada com o regulamento da IES antes de modelar o banco.
