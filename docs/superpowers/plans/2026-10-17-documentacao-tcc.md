# Documentação do TCC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transportar o conteúdo do documento `~/Downloads/TCC_Plataforma_Web_Para_Gestão_De_Atividades_Complementares - PEDRO.txt` para o vault Obsidian em `docs/`, preenchendo pendentes do domínio técnico e criando a nova pasta `docs/tcc/` com o artefato acadêmico.

**Architecture:** Toda edição em `docs/` é delegada ao subagente `docs-curator` (regra inviolável do `CLAUDE.md` do projeto). O docs-curator opera em duas fases: (1) propõe mudanças, (2) executa apenas se receber aprovação explícita. Cada tarefa deste plano corresponde a um ciclo de uma edição: invocar o docs-curator com o conteúdo da fonte TCC, apresentar a proposta ao usuário, re-invocar com aprovação, verificar, comitar.

**Tech Stack:** Vault Obsidian (markdown + wikilinks + frontmatter YAML mínimo). Convenções descritas em `docs/CLAUDE.md`. Fonte primária: `~/Downloads/TCC_Plataforma_Web_Para_Gestão_De_Atividades_Complementares - PEDRO.txt`. Spec: `docs/superpowers/specs/2026-10-17-documentacao-tcc-design.md`.

---

## Pré-requisitos (uma vez, antes da Tarefa 1)

- [ ] **Pré-1: Confirmar árvore de trabalho limpa**

Run: `git status -s`
Expected: saída vazia (ou só arquivos não-rastreados fora de `docs/`).
Se houver mudanças pendentes em `docs/`, pare e peça orientação.

- [ ] **Pré-2: Confirmar que a fonte TCC está acessível**

Run: `ls -la "$HOME/Downloads/TCC_Plataforma_Web_Para_Gestão_De_Atividades_Complementares - PEDRO.txt"`
Expected: arquivo listado com tamanho ~7.5K.

- [ ] **Pré-3: Confirmar que o subagente docs-curator existe**

Run: `test -f /home/texera/Documents/dev/tcc.easycert/.claude/agents/docs-curator.md && echo OK`
Expected: `OK`.

---

## Padrão de execução de cada tarefa

Toda tarefa de edição em `docs/` segue este ciclo exato:

1. **Chamar o docs-curator (fase proposta).** Usar `Agent` com `subagent_type: general-purpose` e invocação explícita: `"Invoque o subagente docs-curator para propor a seguinte mudança: ..."`. Repassar o conteúdo-fonte do TCC literal, não resumido.
2. **Mostrar a proposta ao usuário** e esperar aprovação explícita (`aprovado`, `aplique`, `pode ir`).
3. **Chamar o docs-curator (fase executa).** Nova invocação do subagente com a mensagem contendo a aprovação literal do usuário.
4. **Verificar.** Rodar `cat` no arquivo editado e confirmar que não restaram `_(pendente)_` nas seções endereçadas.
5. **Commit** no final de cada tarefa com mensagem convencional (`docs: ...`).

---

## Camada 1 — produto/domínio

### Task 1: Preencher `dominio/visao-geral.md`

**Files:**
- Modify: `docs/dominio/visao-geral.md`

**Content source (seções 1 e 2 do TCC):**
- Fase atual = TCC/MVP acadêmico (contexto de pesquisa aplicada, protótipo com usuários-piloto).
- Requisito central = **automação de fluxos acadêmicos** (submissão → validação → consolidação → emissão de comprovantes), não um CRUD de certificados.
- Não-objetivos v1 = OCR de PDFs, integração via API com ERPs acadêmicos, assinatura digital externa (ICP-Brasil, etc.), multi-IES.

- [ ] **Step 1: Invocar docs-curator para propor edição**

Prompt para o docs-curator:
```
Preencha os três placeholders `_(pendente)_` em docs/dominio/visao-geral.md a partir do TCC do Pedro:

1. "## Fase atual" → TCC/MVP acadêmico: protótipo de pesquisa aplicada,
   avaliado com usuários-piloto (alunos e coordenadores) via SUS e
   comparação de tempo As-Is vs To-Be. Objetivo imediato: entregar MVP
   funcional em 5 meses, conforme cronograma em [[tcc/cronograma]].

2. "## Requisito central" → Automação dos fluxos acadêmicos de horas
   complementares (submissão de comprovante, validação pela coordenação,
   consolidação de carga horária, emissão de declaração/relatório). Não
   é um CRUD de certificados; o valor está em reduzir retrabalho,
   padronizar análise e dar transparência ao estudante.

3. "## Não-objetivos da v1" → lista:
   - OCR dos PDFs de comprovante (trabalho futuro).
   - Integração via API com ERPs acadêmicos existentes (trabalho futuro).
   - Assinatura digital externa (ICP-Brasil ou similar).
   - Suporte multi-IES; v1 assume instituição única.

Mantenha o resto do arquivo (headings, "Notas relacionadas", frontmatter) intocado.
Adicione wikilink para [[tcc/cronograma]] se ele ainda não existir no corpo.
```

- [ ] **Step 2: Mostrar a proposta e aguardar aprovação**

Expected: usuário responde `aprovado`/`aplique`/equivalente.

- [ ] **Step 3: Invocar docs-curator com aprovação para executar**

- [ ] **Step 4: Verificar**

Run: `grep -n "_(pendente)_" docs/dominio/visao-geral.md`
Expected: nenhuma correspondência nas seções "Fase atual", "Requisito central", "Não-objetivos da v1".

- [ ] **Step 5: Commit**

```bash
git add docs/dominio/visao-geral.md
git commit -m "docs(dominio): preenche visao-geral com dados do TCC"
```

---

### Task 2: Preencher `dominio/atores-e-papeis.md`

**Files:**
- Modify: `docs/dominio/atores-e-papeis.md`

**Content source (seção 2 do TCC — "Delimitação do entregável"):**
- **Aluno:** upload de comprovantes com metadados (categoria, carga horária informada, instituição emissora); acompanhamento do status (Pendente, Aprovado, Indeferido com justificativa) e do progresso de carga horária por categoria; download de relatório consolidado e certificado/declaração.
- **Coordenador/Avaliador:** fila de trabalho para análise rápida (visualização do PDF ao lado das regras da matriz); aprovar/rejeitar; atribuir a carga horária final aceita (pode diferir da informada pelo aluno); justificativa obrigatória em indeferimento.
- **Administrador da instituição:** acesso ao dashboard gerencial (percentual de alunos com horas concluídas, categorias mais usadas, tempo médio de análise); gestão de usuários e da matriz curricular de regras por categoria.
- **Autenticação:** pendência (ver spec) — manter o `_(pendente)_` existente, apenas tornar explícito que é login próprio OU SSO institucional e linkar a [[pendencias]].

- [ ] **Step 1: Invocar docs-curator para propor edição**

Prompt para o docs-curator:
```
Preencha as capacidades e objetivos em docs/dominio/atores-e-papeis.md a partir do TCC do Pedro.

Aluno — objetivo mantém como está. Capacidades:
- Fazer upload de comprovantes/certificados em PDF, preenchendo metadados: categoria da atividade, carga horária informada e instituição emissora.
- Acompanhar o status de cada submissão: Pendente, Aprovado, Indeferido (com justificativa).
- Visualizar o progresso de cumprimento da carga horária exigida por categoria.
- Baixar relatório consolidado de horas e declarações/certificados emitidos pela plataforma.

Coordenador — objetivo mantém como está. Capacidades:
- Acessar fila de trabalho de submissões a avaliar.
- Visualizar o PDF do comprovante lado a lado com as regras da matriz curricular aplicáveis à categoria.
- Aprovar, rejeitar ou solicitar correção. Em rejeição, justificativa é obrigatória.
- Atribuir a carga horária final aceita, que pode diferir da carga informada pelo aluno.

Administrador da instituição — substitui os dois pendentes.
- Objetivo: operar o sistema no nível institucional — matriz curricular, usuários, visão agregada.
- Capacidades:
  - Dashboard gerencial com percentual de alunos com horas concluídas por período, categorias mais utilizadas e tempo médio de análise da coordenação.
  - Gestão de usuários (criação, desativação, atribuição de papel).
  - Gestão da matriz curricular: categorias, limites e regras de validação por categoria.

Autenticação — mantém `_(pendente)_` MAS reformule assim:
"_(pendente)_ — a definir entre login próprio (NestJS Passport) e SSO institucional. Ver [[pendencias]] e [[INFRASTRUCTURE#Integrações externas]]."

Mantenha "Notas relacionadas" como está. Não mexa em frontmatter.
```

- [ ] **Step 2: Mostrar a proposta e aguardar aprovação**

- [ ] **Step 3: Invocar docs-curator com aprovação para executar**

- [ ] **Step 4: Verificar**

Run: `grep -c "_(pendente)_" docs/dominio/atores-e-papeis.md`
Expected: `1` (só o de Autenticação, que fica como pendência explícita).

- [ ] **Step 5: Commit**

```bash
git add docs/dominio/atores-e-papeis.md
git commit -m "docs(dominio): preenche atores e papeis a partir do TCC"
```

---

### Task 3: Preencher `dominio/horas-complementares.md`

**Files:**
- Modify: `docs/dominio/horas-complementares.md`

**Content source (seção 2 do TCC):**
O TCC não define categorias concretas nem limites — isso depende do regulamento da IES. O que o TCC afirma é:
- Existem **categorias de atividade** com **limites por categoria** definidos em "matriz curricular".
- Comprovação é feita por **upload de PDF do certificado** com metadados (categoria, carga informada, instituição emissora).
- A **carga horária aceita** (atribuída pelo avaliador) pode diferir da **carga informada** pelo aluno.
- Validade temporal: TCC não define.

A maior parte do conteúdo concreto fica como pendência vinculada ao regulamento. A tarefa aqui é tornar essas pendências explícitas e úteis.

- [ ] **Step 1: Invocar docs-curator para propor edição**

Prompt para o docs-curator:
```
Reescreva docs/dominio/horas-complementares.md mantendo frontmatter, título, parágrafo introdutório e "Notas relacionadas". Preencha as seções assim:

"## Categorias"
A matriz curricular define grupos de atividade (tipicamente: ensino, pesquisa, extensão, cultural/artístico, representação estudantil) e um limite máximo de carga horária por categoria. Os valores concretos dependem do regulamento oficial da instituição-alvo.

> [!warning] Em aberto
> Enumeração concreta das categorias e seus limites depende do regulamento da IES. Ver [[pendencias]].

"## Limites"
Três eixos de limite se aplicam a toda submissão:
- **Carga horária mínima total** exigida para integralização.
- **Máximo por categoria** (teto do grupo).
- **Teto por atividade individual** dentro de uma categoria (ex.: no máximo X horas por certificado único).

Valores concretos dependem do regulamento. Ver [[pendencias]].

"## Carga informada vs. aceita"
Toda submissão carrega dois números distintos:
- **Carga horária informada** — declarada pelo aluno no momento do upload.
- **Carga horária aceita** — atribuída pelo avaliador na análise. Pode ser menor que a informada (ex.: certificado comprova 60h, mas regulamento limita a 20h aquela atividade).

A carga aceita é o valor que entra no cômputo da integralização. Ver [[fluxo-aprovacao]].

"## Comprovação"
- Formato: PDF (prioritário).
- Metadados obrigatórios no upload: categoria da atividade, carga horária informada, instituição emissora.
- Tamanho máximo: _(pendente)_ — a definir conforme storage escolhido.

"## Validade temporal"
_(pendente)_ — o TCC não especifica regra sobre quando a atividade foi realizada vs. quando pode ser submetida (ex.: só atividades do próprio curso, janela de X anos, etc.). Confirmar com regulamento.

Mantenha o callout `[!warning] Em aberto` existente ao final da seção de Validade apontando para [[pendencias]].
```

- [ ] **Step 2: Mostrar a proposta e aguardar aprovação**

- [ ] **Step 3: Invocar docs-curator com aprovação para executar**

- [ ] **Step 4: Verificar**

Run: `grep -c "Carga informada vs. aceita" docs/dominio/horas-complementares.md`
Expected: `1`.

- [ ] **Step 5: Commit**

```bash
git add docs/dominio/horas-complementares.md
git commit -m "docs(dominio): detalha horas complementares conforme TCC"
```

---

### Task 4: Preencher `dominio/fluxo-aprovacao.md`

**Files:**
- Modify: `docs/dominio/fluxo-aprovacao.md`

**Content source (seção 2 do TCC):**
Estados mencionados pelo TCC: **Pendente**, **Aprovado**, **Indeferido com justificativa**. A rejeição deve permitir correção do aluno. Além disso, o TCC fala de emissão de relatório consolidado e declaração/certificado com QRCode (para eventos internos).

- [ ] **Step 1: Invocar docs-curator para propor edição**

Prompt para o docs-curator:
```
Preencha docs/dominio/fluxo-aprovacao.md. Mantenha frontmatter, título, parágrafo introdutório e "Notas relacionadas".

"## Estados"
Estados possíveis de uma submissão:
- **Rascunho** — aluno editando antes de submeter.
- **Pendente** — submetida, aguardando análise.
- **Em análise** — avaliador abriu a submissão.
- **Aprovada** — carga horária aceita lançada.
- **Indeferida** — rejeitada com justificativa obrigatória. Aluno pode corrigir e re-submeter (volta a Pendente).

"## Transições"
| De | Para | Ação | Executor |
|----|------|------|----------|
| — | Rascunho | Criar submissão | Aluno |
| Rascunho | Pendente | Enviar para análise | Aluno |
| Pendente | Em análise | Abrir para avaliar | Coordenador |
| Em análise | Aprovada | Aprovar com carga aceita | Coordenador |
| Em análise | Indeferida | Indeferir com justificativa | Coordenador |
| Indeferida | Pendente | Corrigir e reenviar | Aluno |

"## Rejeição e correção"
Toda rejeição exige justificativa textual do avaliador. O aluno pode editar a submissão (trocar PDF, ajustar metadados) e reenviá-la. O histórico de versões anteriores e das decisões é preservado para auditoria.

"## Emissão de documentos"
Após aprovação, a plataforma gera:
- Relatório consolidado de horas por aluno (soma de carga aceita por categoria, progresso vs. mínimo exigido).
- Declaração/certificado da instituição com código de verificação e QRCode para eventos internos emitidos pela própria plataforma. Para comprovantes externos, não há emissão — apenas registro.

"## Notificações"
_(pendente)_ — definir quais eventos (submissão enviada, análise iniciada, decisão emitida, correção necessária) disparam notificação e por qual canal (email, in-app). Ver [[pendencias]].

"## Auditoria"
Todo evento de transição é registrado com: ator, timestamp, estado anterior, estado novo, justificativa (quando aplicável). O histórico é imutável. Prazo de retenção: _(pendente)_ — definir.
```

- [ ] **Step 2: Mostrar a proposta e aguardar aprovação**

- [ ] **Step 3: Invocar docs-curator com aprovação para executar**

- [ ] **Step 4: Verificar**

Run: `grep -E "Pendente|Aprovada|Indeferida" docs/dominio/fluxo-aprovacao.md | wc -l`
Expected: valor ≥ `3`.

- [ ] **Step 5: Commit**

```bash
git add docs/dominio/fluxo-aprovacao.md
git commit -m "docs(dominio): detalha fluxo de aprovacao conforme TCC"
```

---

### Task 5: Preencher `ARCHITECTURE.md`

**Files:**
- Modify: `docs/ARCHITECTURE.md`

**Content source:** combinação do TCC (quatro módulos funcionais) com a estrutura real do repo (`apps/api`, `apps/web`, `packages/{db,types,ui,tsconfig}`, Postgres em `docker-compose.yml`).

- [ ] **Step 1: Invocar docs-curator para propor edição**

Prompt para o docs-curator:
```
Preencha docs/ARCHITECTURE.md.

"## Fluxos principais"
Fluxo canônico fim-a-fim:
1. Aluno autentica em [[MODULES#portal-aluno]] e faz upload de comprovante com metadados.
2. API `apps/api` persiste a submissão no Postgres via Prisma (`packages/db`) e armazena o PDF no storage configurado.
3. Submissão aparece na fila do coordenador em [[MODULES#painel-coordenador]].
4. Coordenador aprova (atribui carga aceita) ou indefere (com justificativa). Ver [[dominio/fluxo-aprovacao]].
5. Em aprovação, [[MODULES#modulo-documentos]] gera relatório consolidado atualizado para o aluno; declarações internas ganham QRCode.
6. [[MODULES#dashboard-gerencial]] agrega métricas (horas por aluno, tempo médio de análise, categorias mais usadas) para o administrador.

"## Componentes"
- **`apps/web`** — Next.js 15 + React 19 (Turbopack). Entrega todas as UIs (aluno, coordenador, admin).
- **`apps/api`** — NestJS 11. Expõe REST para a web, orquestra Prisma e storage.
- **`packages/db`** — schema Prisma 6 + client gerado; migrations em `prisma/migrations/`.
- **`packages/types`** — DTOs/contratos compartilhados entre api e web.
- **`packages/ui`** — biblioteca de componentes compartilhados (vazia hoje).
- **`packages/tsconfig`** — presets de TypeScript.
- **Postgres** — rodando em contêiner (`docker-compose.yml`, serviço `postgres`).
- **Storage de PDFs** — _(pendente)_, ver [[pendencias]].

"## Nós"
| Nó | Responsabilidade | Observações |
|----|------------------|-------------|
| `apps/web` | SSR/CSR das interfaces | Next.js 15, React 19, Turbopack |
| `apps/api` | Regra de negócio e persistência | NestJS 11 |
| `packages/db` | Schema e client Prisma | Postgres via docker-compose |
| Postgres | Persistência | Dev local via `pnpm db:up` |
| Storage de PDFs | Blobs de comprovante | Decisão em aberto |

"## Decisões arquiteturais"
- Monorepo com pnpm + Turborepo.
- Separação estrita web/api; nada de Server Actions tocando banco direto — toda escrita passa pelo NestJS.
- Prisma como ORM; schema único em `packages/db`.
- Contratos compartilhados em `packages/types` para evitar divergência entre web e api.
- Autenticação, storage e biblioteca de UI = decisões em aberto. Ver [[pendencias]].

Mantenha "Notas relacionadas" como está.
```

- [ ] **Step 2: Mostrar a proposta e aguardar aprovação**

- [ ] **Step 3: Invocar docs-curator com aprovação para executar**

- [ ] **Step 4: Verificar**

Run: `grep -c "_(pendente)_" docs/ARCHITECTURE.md`
Expected: `≤ 1` (só a referência a storage de PDFs).

- [ ] **Step 5: Commit**

```bash
git add docs/ARCHITECTURE.md
git commit -m "docs: preenche ARCHITECTURE com fluxos e componentes reais"
```

---

### Task 6: Preencher `MODULES.md`

**Files:**
- Modify: `docs/MODULES.md`

- [ ] **Step 1: Invocar docs-curator para propor edição**

Prompt para o docs-curator:
```
Reescreva docs/MODULES.md. Mantenha título, parágrafo introdutório e "Notas relacionadas".

"## Backend" — remova o exemplo pendente e crie um subitem por módulo:

### `portal-aluno` — API do aluno
- Responsabilidade: expor rotas para upload de comprovante, consulta de submissões próprias, acompanhamento de progresso.
- Dependências: `@easycert/db`, `@easycert/types`, storage de PDFs.
- Entidades principais: Aluno, Submissão, Documento.

### `painel-coordenador` — API do avaliador
- Responsabilidade: fila de análise, aprovação/indeferimento, atribuição de carga aceita.
- Dependências: `@easycert/db`, `@easycert/types`.
- Entidades principais: Submissão, Avaliação, Coordenador.

### `modulo-documentos` — geração de relatórios e declarações
- Responsabilidade: montar relatório consolidado por aluno e emitir declaração/certificado interno com QRCode de verificação.
- Dependências: `@easycert/db`, biblioteca de PDF, geração de QRCode.
- Entidades principais: Submissão (origem dos dados), Documento (saída registrada).

### `dashboard-gerencial` — métricas e visão agregada
- Responsabilidade: agregar métricas (horas por período, categorias mais usadas, tempo médio de análise) para o administrador.
- Dependências: `@easycert/db`.
- Entidades principais: Submissão, Avaliação (agregações).

"## Frontend" — remova o exemplo pendente. Único app: `apps/web` (Next.js 15). Organização por área:

### `apps/web/app/aluno` — Portal do Aluno
- Responsabilidade: upload de comprovantes, lista de submissões, progresso.
- Dependências: `@easycert/types`, `@easycert/ui`.
- Páginas principais: `/aluno`, `/aluno/submissoes`, `/aluno/submissoes/nova`, `/aluno/relatorio`.

### `apps/web/app/coordenador` — Painel do Coordenador
- Dependências: `@easycert/types`, `@easycert/ui`.
- Páginas principais: `/coordenador/fila`, `/coordenador/submissao/[id]`.

### `apps/web/app/admin` — Painel Administrativo
- Dependências: `@easycert/types`, `@easycert/ui`.
- Páginas principais: `/admin/dashboard`, `/admin/matriz`, `/admin/usuarios`.

"## Pacotes compartilhados"
- **`@easycert/db`** — schema Prisma e client gerado. Scripts: `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:studio`, `pnpm db:seed`.
- **`@easycert/types`** — DTOs e contratos entre web e api.
- **`@easycert/ui`** — biblioteca de componentes compartilhados (vazia hoje; decisão de framework em [[pendencias]]).
- **`@easycert/tsconfig`** — presets de TypeScript.
```

- [ ] **Step 2: Mostrar a proposta e aguardar aprovação**

- [ ] **Step 3: Invocar docs-curator com aprovação para executar**

- [ ] **Step 4: Verificar**

Run: `grep -c "_(pendente)_" docs/MODULES.md`
Expected: `0`.

- [ ] **Step 5: Commit**

```bash
git add docs/MODULES.md
git commit -m "docs: detalha MODULES com portais, APIs e pacotes compartilhados"
```

---

### Task 7: Preencher `DATABASE.md`

**Files:**
- Modify: `docs/DATABASE.md`

- [ ] **Step 1: Invocar docs-curator para propor edição**

Prompt para o docs-curator:
```
Preencha docs/DATABASE.md.

"## Tecnologia"
- SGBD: PostgreSQL (serviço `postgres` em `docker-compose.yml`, levantado via `pnpm db:up`).
- ORM: Prisma 6 (`packages/db`).
- Schema: `packages/db/prisma/schema.prisma`.
- Client gerado: consumido por `apps/api` via `@easycert/db`.

"## Entidades"
Entidades iniciais do domínio. Campos concretos ficam no `schema.prisma` quando criado.

| Entidade | Descrição | Relacionamentos |
|----------|-----------|-----------------|
| Aluno | Estudante que submete comprovantes | 1-N Submissão |
| Coordenador | Avaliador institucional | 1-N Avaliação |
| Administrador | Gestor institucional | — |
| Categoria | Grupo de atividade da matriz | 1-N RegraMatriz, 1-N Submissão |
| RegraMatriz | Regra de limite por categoria | N-1 Categoria |
| Submissão | Pedido de reconhecimento de horas | N-1 Aluno, N-1 Categoria, 1-N Avaliação, 1-N Documento |
| Avaliação | Decisão sobre uma submissão | N-1 Submissão, N-1 Coordenador |
| Documento | Comprovante (PDF enviado) ou declaração (emitida) | N-1 Submissão |

> [!info] A confirmar
> Modelagem concreta dos campos ainda não existe. Formato da RegraMatriz (JSON embarcado vs. tabela normalizada) está em [[pendencias]].

"## Migrations"
Prisma Migrate. Arquivos em `packages/db/prisma/migrations/`. Dev: `pnpm db:migrate`. Produção: `pnpm --filter @easycert/db migrate:deploy`.

"## Seeds"
`packages/db/prisma/seed.ts`, executado via `pnpm --filter @easycert/db seed`. Conteúdo seed = _(pendente)_, a definir quando o schema estiver estabilizado.
```

- [ ] **Step 2: Mostrar a proposta e aguardar aprovação**

- [ ] **Step 3: Invocar docs-curator com aprovação para executar**

- [ ] **Step 4: Verificar**

Run: `grep -c "Prisma" docs/DATABASE.md`
Expected: valor ≥ `3`.

- [ ] **Step 5: Commit**

```bash
git add docs/DATABASE.md
git commit -m "docs: detalha DATABASE com Prisma e entidades iniciais"
```

---

### Task 8: Preencher `STACK.md`

**Files:**
- Modify: `docs/STACK.md`

- [ ] **Step 1: Invocar docs-curator para propor edição**

Prompt para o docs-curator:
```
Preencha docs/STACK.md substituindo os pendentes.

"## Linguagem"
- TypeScript 5.7 em todo o monorepo. Presets em `@easycert/tsconfig`.
- Node.js ≥ 20 (`engines.node` no `package.json`).

"## Backend"
- **Framework HTTP:** NestJS 11 (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`).
- **ORM:** Prisma 6 — ver [[DATABASE]].
- **Validação:** _(pendente)_ — a decidir entre `class-validator`+`class-transformer` (padrão NestJS) e `zod`. Ver [[pendencias]].
- **Testes:** Jest + Supertest (configurado em `apps/api`).

"## Frontend"
- **Framework:** Next.js 15 com Turbopack.
- **React:** 19.
- **Roteamento:** App Router do Next.js.
- **Estilização / UI:** _(pendente)_ — biblioteca a decidir; `@easycert/ui` existe mas está vazio. Ver [[pendencias]].

"## Banco de dados"
Postgres via `docker-compose.yml`. ORM: Prisma 6. Detalhes em [[DATABASE]].

"## Monorepo" — já está preenchido, mantenha.

Mantenha os callouts `[!warning] Em aberto` e `[!info] A confirmar`. O "A confirmar" pode citar: biblioteca de UI, biblioteca de validação de DTO, estratégia de autenticação. Linkar para [[pendencias]].
```

- [ ] **Step 2: Mostrar a proposta e aguardar aprovação**

- [ ] **Step 3: Invocar docs-curator com aprovação para executar**

- [ ] **Step 4: Verificar**

Run: `grep -E "NestJS|Next.js|Prisma" docs/STACK.md | wc -l`
Expected: valor ≥ `3`.

- [ ] **Step 5: Commit**

```bash
git add docs/STACK.md
git commit -m "docs: registra stack real (NestJS 11, Next 15, Prisma 6)"
```

---

### Task 9: Atualizar `dominio/pendencias.md`

**Files:**
- Modify: `docs/dominio/pendencias.md`

- [ ] **Step 1: Invocar docs-curator para propor edição**

Prompt para o docs-curator:
```
Reescreva as seções "## Em aberto" e "## A confirmar" de docs/dominio/pendencias.md.

"## Em aberto (bloqueiam implementação da respectiva área)"
- Autenticação — login próprio (NestJS Passport local/JWT), SSO institucional ou provedor externo. Bloqueia modelagem de usuário e proteção de rotas. Origem: [[atores-e-papeis]].
- Storage dos PDFs de comprovante — filesystem local, S3, MinIO ou Supabase Storage. Bloqueia implementação de upload e exibição. Origem: [[horas-complementares]].
- Matriz curricular concreta — categorias, limites e formato da regra (JSON embarcado em RegraMatriz vs. tabela totalmente normalizada). Bloqueia validação automatizada e seeds. Origem: [[horas-complementares]].
- Biblioteca de validação de DTO no NestJS — `class-validator`+`class-transformer` vs. `zod`. Bloqueia contrato de API. Origem: [[STACK]].
- Regulamento oficial de horas complementares da IES-alvo — necessário para preencher categorias, limites e janela de validade temporal. Origem: [[horas-complementares]].

"## A confirmar (não bloqueiam, mas precisam ratificação antes de virarem dependência)"
- Biblioteca de UI no frontend — shadcn/ui, Mantine, Chakra, ou componentes próprios em `@easycert/ui`. Origem: [[STACK]], [[MODULES]].
- Escopo de emissão de QRCode — só eventos internos emitidos pela plataforma, ou também declarações para comprovantes externos aprovados? Origem: [[fluxo-aprovacao]].
- Canal de notificação (email, in-app, push). Origem: [[fluxo-aprovacao]].
- Prazo de retenção do histórico de auditoria. Origem: [[fluxo-aprovacao]].
- Tamanho máximo do PDF aceito no upload. Origem: [[horas-complementares]].

Mantenha "## Notas relacionadas".
```

- [ ] **Step 2: Mostrar a proposta e aguardar aprovação**

- [ ] **Step 3: Invocar docs-curator com aprovação para executar**

- [ ] **Step 4: Verificar**

Run: `grep -c "^- " docs/dominio/pendencias.md`
Expected: valor ≥ `9` (soma de "Em aberto" e "A confirmar" + "Notas relacionadas").

- [ ] **Step 5: Commit**

```bash
git add docs/dominio/pendencias.md
git commit -m "docs(dominio): consolida pendencias reais da v1"
```

---

## Camada 2 — artefato acadêmico (nova pasta `docs/tcc/`)

### Task 10: Criar `docs/tcc/visao-geral.md`

**Files:**
- Create: `docs/tcc/visao-geral.md`

**Content source:** seção 1 do TCC — "Análise do tema e polimento da proposta" + "Objetivos".

- [ ] **Step 1: Invocar docs-curator para propor criação**

Prompt para o docs-curator:
```
Crie docs/tcc/visao-geral.md como a nota raiz da camada acadêmica. Use frontmatter mínimo e as convenções do vault.

Frontmatter:
---
tipo: visão
status: v1
---

Conteúdo:

# TCC — Visão geral

Esta é a porta de entrada da camada acadêmica do easycert: título, justificativa, objetivos. A camada técnica/produto fica em [[visao-geral]].

---

## Título

**Inicial:** Desenvolvimento de uma Plataforma Web para Gestão de Atividades Complementares e Emissão Automatizada de Certificados.

**Refinado:** Desenvolvimento de uma Plataforma Web para Gestão de Horas Complementares e Automação de Fluxos Acadêmicos Baseada em Desenvolvimento Acelerado.

**Justificativa do ajuste:** explicita que a contribuição central é a automação e otimização dos fluxos operacionais acadêmicos (submissão, validação, contabilização de carga horária, emissão de documentos) via ciclo ágil de prototipagem — não um CRUD de certificados.

## Foco acadêmico

- Automação de Processos de Negócio (BPA).
- Design de Sistemas de Informação Acadêmica.
- Validação de Usabilidade e Produtividade do fluxo de submissão e deferimento.

## Objetivo geral

Desenvolver e avaliar um protótipo de plataforma web para a gestão centralizada de atividades complementares e automação de fluxos acadêmicos.

## Objetivos específicos

- Mapear o fluxo de validação de horas complementares e definir a matriz de regras por categoria.
- Prototipar a arquitetura da solução usando abordagens de desenvolvimento acelerado.
- Implementar os módulos de submissão, avaliação, consolidação e emissão de comprovantes.
- Avaliar o protótipo quanto a usabilidade (SUS), redução de tempo de processo e satisfação dos usuários (alunos e gestores).

## Nota sobre a stack

O TCC original sugere Low-Code/No-Code/BaaS como caminho preferencial. A implementação adota uma stack moderna tradicional (NestJS + Next.js + Prisma + Postgres), tratada no artigo como "desenvolvimento acelerado com stack moderna" — ver [[tcc/metodologia]].

---

## Notas relacionadas

- [[tcc/estrutura-artigo]] — como o artigo está dividido.
- [[tcc/metodologia]] — método de pesquisa e avaliação.
- [[tcc/cronograma]] — plano temporal de 5 meses.
- [[tcc/trabalhos-correlatos]] — base teórica e sistemas correlatos.
- [[visao-geral]] — visão do produto.
```

- [ ] **Step 2: Mostrar a proposta e aguardar aprovação**

- [ ] **Step 3: Invocar docs-curator com aprovação para executar**

- [ ] **Step 4: Verificar**

Run: `test -f docs/tcc/visao-geral.md && head -3 docs/tcc/visao-geral.md`
Expected: arquivo existe, começa com frontmatter `---\ntipo: visão\n`.

- [ ] **Step 5: Commit**

```bash
git add docs/tcc/visao-geral.md
git commit -m "docs(tcc): cria visao-geral do artefato academico"
```

---

### Task 11: Criar `docs/tcc/estrutura-artigo.md`

**Files:**
- Create: `docs/tcc/estrutura-artigo.md`

**Content source:** seção 3 do TCC — "Esqueleto e recheio do artigo".

- [ ] **Step 1: Invocar docs-curator para propor criação**

Prompt para o docs-curator:
```
Crie docs/tcc/estrutura-artigo.md.

Frontmatter:
---
tipo: visão
status: v1
---

Conteúdo:

# TCC — Estrutura do artigo

Artigo de 16 a 20 páginas, dividido em 5 seções canônicas. Esta nota detalha o "recheio" de cada seção. Objetivos e justificativa ficam em [[tcc/visao-geral]].

---

## 1. Introdução (2–3 páginas)

- **Contextualização:** importância das atividades complementares na formação superior e complexidade da gestão manual/burocrática nas IES.
- **Problema:** ineficiência, perda de prazos, falta de padronização nas análises e retrabalho operacional (processos baseados em e-mail e planilhas).
- **Justificativa:** plataformas digitais focadas em automação acadêmica, desenvolvidas via prototipagem acelerada, otimizam o tempo docente/administrativo e aumentam a transparência para o estudante.
- **Objetivo geral:** ver [[tcc/visao-geral#Objetivo geral]].
- **Objetivos específicos:** ver [[tcc/visao-geral#Objetivos específicos]].

## 2. Fundamentação teórica e trabalhos correlatos (4–5 páginas)

- Sistemas de Informação Acadêmica e Gestão de Processos (BPM): otimização de fluxos de trabalho no ensino superior.
- Prototipagem acelerada e abordagens Low-Code/No-Code: fundamentos do desenvolvimento orientado à produtividade.
- Autenticidade e assinatura digital de documentos: verificação de veracidade de certificados digitais.
- Trabalhos correlatos: análise comparativa de sistemas existentes e lacunas identificadas. Ver [[tcc/trabalhos-correlatos]].

## 3. Materiais e métodos (4–5 páginas)

Detalhes do método em [[tcc/metodologia]]. Resumo da seção:
- Tipo de pesquisa: aplicada, quanti-qualitativa, experimental, estudo de caso.
- Procedimentos metodológicos em 4 fases.
- Critérios de avaliação: SUS + comparação de tempo As-Is vs. To-Be.

## 4. Resultados e discussão (4–5 páginas)

- Mapeamento e modelagem do processo: fluxogramas As-Is e To-Be.
- Demonstração do protótipo: telas de submissão, painel do avaliador e relatórios consolidados.
- Análise de desempenho e usabilidade: resultados do SUS + métricas de tempo.
- Discussão sobre a metodologia de desenvolvimento acelerado: impactos na velocidade de entrega, manutenção e adaptabilidade a regulamentos.

## 5. Considerações finais (1–2 páginas)

- Síntese dos resultados e confirmação do alcance dos objetivos.
- Impactos práticos: redução da carga de trabalho administrativo.
- Trabalhos futuros: OCR para extração automática de dados dos PDFs e integração via API com ERPs acadêmicos.

---

## Notas relacionadas

- [[tcc/visao-geral]] — objetivos e título.
- [[tcc/metodologia]] — detalhamento da seção 3 do artigo.
- [[tcc/cronograma]] — ritmo de escrita.
- [[tcc/trabalhos-correlatos]] — material da seção 2.
```

- [ ] **Step 2: Mostrar a proposta e aguardar aprovação**

- [ ] **Step 3: Invocar docs-curator com aprovação para executar**

- [ ] **Step 4: Verificar**

Run: `grep -c "^## " docs/tcc/estrutura-artigo.md`
Expected: valor ≥ `6` (5 seções do artigo + "Notas relacionadas").

- [ ] **Step 5: Commit**

```bash
git add docs/tcc/estrutura-artigo.md
git commit -m "docs(tcc): cria estrutura do artigo (5 secoes, 16-20 paginas)"
```

---

### Task 12: Criar `docs/tcc/metodologia.md`

**Files:**
- Create: `docs/tcc/metodologia.md`

**Content source:** seção 3 do TCC — "Materiais e métodos".

- [ ] **Step 1: Invocar docs-curator para propor criação**

Prompt para o docs-curator:
```
Crie docs/tcc/metodologia.md.

Frontmatter:
---
tipo: visão
status: v1
---

Conteúdo:

# TCC — Metodologia

Método de pesquisa adotado no desenvolvimento e na avaliação do protótipo easycert. Esta nota corresponde à seção 3 do artigo (ver [[tcc/estrutura-artigo#3. Materiais e métodos (4–5 páginas)]]).

---

## Tipo de pesquisa

Pesquisa **aplicada**, **quanti-qualitativa**, **experimental**, baseada em **estudo de caso**.

## Procedimentos metodológicos

### Fase 1 — Levantamento de requisitos
- Mapeamento do processo atual de gestão de horas complementares (As-Is).
- Entrevistas/revisão de regulamentos para extrair regras por categoria.
- Saída: documento de requisitos funcionais e não funcionais; matriz de regras preliminar.

### Fase 2 — Modelagem
- Modelagem de banco de dados (schema Prisma).
- Arquitetura da aplicação: definição de módulos, fluxos e papéis.
- Saída: schema inicial, diagramas de componentes, especificação dos papéis.

### Fase 3 — Prototipagem e desenvolvimento acelerado
- Construção das interfaces (Next.js) e automações (NestJS) com ciclos curtos de iteração.
- Uso de ferramentas e padrões maduros (Prisma, NestJS, Next.js) como forma de **desenvolvimento acelerado com stack moderna** — alternativa pragmática ao Low-Code/No-Code sugerido na proposta original, preservando o espírito de produtividade e prototipagem ágil.
- Saída: protótipo funcional dos 4 módulos (portal-aluno, painel-coordenador, módulo-documentos, dashboard-gerencial).

### Fase 4 — Avaliação do protótipo
- Testes de usabilidade com amostra de alunos e avaliadores.
- Simulação de cenários de submissão e validação.
- Coleta de métricas de tempo e satisfação.

## Critérios de avaliação

### Usabilidade — SUS (System Usability Scale)
- Aplicação do questionário SUS a amostra de alunos e avaliadores (reais ou simulados).
- 10 afirmações em escala Likert de 5 pontos; cálculo do SUS score (0–100).
- Interpretação por faixas (ex.: ≥ 68 = acima da média).

### Desempenho operacional — As-Is vs. To-Be
- Medição do tempo de ciclo manual (processo baseado em e-mail/planilha).
- Medição do tempo via plataforma.
- Comparação direta: redução percentual média de tempo por submissão analisada.

---

## Notas relacionadas

- [[tcc/visao-geral]] — contexto acadêmico.
- [[tcc/estrutura-artigo]] — onde esta metodologia aparece no artigo.
- [[tcc/cronograma]] — quando cada fase acontece.
- [[dominio/fluxo-aprovacao]] — processo To-Be medido.
```

- [ ] **Step 2: Mostrar a proposta e aguardar aprovação**

- [ ] **Step 3: Invocar docs-curator com aprovação para executar**

- [ ] **Step 4: Verificar**

Run: `grep -E "Fase [1-4]|SUS|As-Is" docs/tcc/metodologia.md | wc -l`
Expected: valor ≥ `6`.

- [ ] **Step 5: Commit**

```bash
git add docs/tcc/metodologia.md
git commit -m "docs(tcc): metodologia (4 fases, SUS, As-Is vs To-Be)"
```

---

### Task 13: Criar `docs/tcc/cronograma.md`

**Files:**
- Create: `docs/tcc/cronograma.md`

**Content source:** seção 4 do TCC — "Cronograma de trabalho para os 5 meses".

- [ ] **Step 1: Invocar docs-curator para propor criação**

Prompt para o docs-curator:
```
Crie docs/tcc/cronograma.md.

Frontmatter:
---
tipo: visão
status: v1
---

Conteúdo:

# TCC — Cronograma

Plano temporal do TCC em 5 meses. Entregáveis mês a mês. Metodologia detalhada em [[tcc/metodologia]].

---

## Visão em tabela

| Mês | Foco de desenvolvimento | Foco de escrita |
|-----|-------------------------|-----------------|
| 1 | Levantamento de requisitos e regulamento de horas | Introdução + Fundamentação teórica |
| 2 | Modelagem de dados e arquitetura; primeiros fluxos na plataforma | — |
| 3 | Finalização das interfaces, automações e relatórios | Metodologia |
| 4 | Aplicação dos testes de usabilidade (SUS); análise de métricas | Resultados e discussão |
| 5 | — | Considerações finais; revisão ABNT; preparação da banca |

## Detalhamento por mês

### Mês 1
- Mapeamento de requisitos.
- Levantamento do regulamento de horas complementares da IES-alvo.
- Escrita das seções de Introdução e Fundamentação teórica do artigo.

### Mês 2
- Modelagem de dados (schema Prisma).
- Definição da arquitetura (módulos, fluxos, papéis).
- Criação dos primeiros fluxos na plataforma (prototipagem inicial).

### Mês 3
- Finalização da implementação: interfaces, automações, relatórios.
- Escrita da seção de Metodologia.

### Mês 4
- Aplicação dos testes de usabilidade (SUS).
- Análise das métricas de tempo (As-Is vs. To-Be).
- Escrita da seção de Resultados e discussão.

### Mês 5
- Escrita das Considerações finais.
- Revisão de normas ABNT.
- Preparação do material para a banca.

---

## Notas relacionadas

- [[tcc/visao-geral]] — objetivos.
- [[tcc/metodologia]] — fases que o cronograma executa.
- [[tcc/estrutura-artigo]] — seções escritas em cada mês.
```

- [ ] **Step 2: Mostrar a proposta e aguardar aprovação**

- [ ] **Step 3: Invocar docs-curator com aprovação para executar**

- [ ] **Step 4: Verificar**

Run: `grep -E "^### Mês [1-5]" docs/tcc/cronograma.md | wc -l`
Expected: `5`.

- [ ] **Step 5: Commit**

```bash
git add docs/tcc/cronograma.md
git commit -m "docs(tcc): cronograma de 5 meses"
```

---

### Task 14: Criar `docs/tcc/trabalhos-correlatos.md`

**Files:**
- Create: `docs/tcc/trabalhos-correlatos.md`

**Content source:** seção 2 do TCC — "Fundamentação teórica e trabalhos correlatos" (apenas esqueleto; preenchimento acontece ao longo do Mês 1 do cronograma).

- [ ] **Step 1: Invocar docs-curator para propor criação**

Prompt para o docs-curator:
```
Crie docs/tcc/trabalhos-correlatos.md como esqueleto — o conteúdo real será levantado durante o Mês 1 do cronograma.

Frontmatter:
---
tipo: visão
status: v1
---

Conteúdo:

# TCC — Trabalhos correlatos e fundamentação teórica

Base teórica e análise comparativa de sistemas correlatos. Esta nota é um **esqueleto**; o preenchimento acontece durante o Mês 1 do [[tcc/cronograma]].

---

## Eixos teóricos

### Sistemas de informação acadêmica e BPM
- _(pendente)_ — referências sobre otimização de fluxos de trabalho no ensino superior.
- _(pendente)_ — referências sobre BPM/BPA aplicado a secretarias acadêmicas.

### Prototipagem acelerada e Low-Code/No-Code
- _(pendente)_ — referências sobre desenvolvimento orientado à produtividade.
- _(pendente)_ — plataformas BaaS (Supabase, Firebase) como abordagem de prototipagem.
- _(pendente)_ — justificativa da escolha de stack moderna como alternativa pragmática.

### Autenticidade e assinatura digital de documentos
- _(pendente)_ — verificação de veracidade de certificados digitais.
- _(pendente)_ — QRCode e códigos de verificação em contexto acadêmico.

## Sistemas correlatos

### Plataformas comerciais / institucionais
- _(pendente)_ — levantar 2–4 sistemas em uso em IES brasileiras.
- _(pendente)_ — matriz comparativa: cadastro CRUD vs. automação de fluxo, suporte a matriz curricular, emissão de documentos, dashboard gerencial.

### Lacunas identificadas
- _(pendente)_ — a preencher após o levantamento comparativo.

> [!warning] Em aberto
> Preenchimento desta nota é um entregável do Mês 1. Ver [[tcc/cronograma#Mês 1]].

---

## Notas relacionadas

- [[tcc/visao-geral]] — contexto.
- [[tcc/estrutura-artigo]] — onde isso aparece no artigo (seção 2).
- [[tcc/metodologia]] — como o conhecimento aqui orienta o método.
```

- [ ] **Step 2: Mostrar a proposta e aguardar aprovação**

- [ ] **Step 3: Invocar docs-curator com aprovação para executar**

- [ ] **Step 4: Verificar**

Run: `test -f docs/tcc/trabalhos-correlatos.md && grep -c "_(pendente)_" docs/tcc/trabalhos-correlatos.md`
Expected: valor ≥ `8` (muitos pendentes propositais).

- [ ] **Step 5: Commit**

```bash
git add docs/tcc/trabalhos-correlatos.md
git commit -m "docs(tcc): esqueleto de trabalhos correlatos (Mes 1)"
```

---

### Task 15: Atualizar `INDEX.md` com a categoria TCC

**Files:**
- Modify: `docs/INDEX.md`

- [ ] **Step 1: Invocar docs-curator para propor edição**

Prompt para o docs-curator:
```
Adicione uma nova categoria "## TCC" ao final do docs/INDEX.md, antes de qualquer nova linha em branco de rodapé, com entradas na ordem lógica do fluxo acadêmico:

## TCC
- [[tcc/visao-geral|visao-geral]] — objetivos, título refinado, foco acadêmico.
- [[tcc/estrutura-artigo|estrutura-artigo]] — 5 seções do artigo com páginas-alvo.
- [[tcc/metodologia|metodologia]] — tipo de pesquisa, 4 fases, SUS, As-Is vs. To-Be.
- [[tcc/cronograma|cronograma]] — 5 meses com entregáveis.
- [[tcc/trabalhos-correlatos|trabalhos-correlatos]] — esqueleto da fundamentação teórica (Mês 1).

Mantenha as categorias existentes (Arquitetura, API, Domínio) intactas, na mesma ordem.
Nenhum conteúdo real deve ser escrito — só referências. Uma linha por link.
```

- [ ] **Step 2: Mostrar a proposta e aguardar aprovação**

- [ ] **Step 3: Invocar docs-curator com aprovação para executar**

- [ ] **Step 4: Verificar**

Run: `grep -c "^- \[\[tcc/" docs/INDEX.md`
Expected: `5`.

- [ ] **Step 5: Commit**

```bash
git add docs/INDEX.md
git commit -m "docs: registra categoria TCC no INDEX"
```

---

## Pós-execução (uma vez, depois da Tarefa 15)

- [ ] **Pós-1: Varredura final de pendentes residuais**

Run: `grep -rn "_(pendente)_" docs/ | grep -v "^docs/dominio/pendencias.md" | grep -v "^docs/tcc/trabalhos-correlatos.md"`
Expected: resultado curto — apenas pendências explicitamente deixadas (ex.: Autenticação, Validade temporal, tamanho máx. de PDF). Nenhuma delas deve estar sem callout ou link para [[pendencias]].

- [ ] **Pós-2: Verificar integridade do INDEX**

Run: `grep -E "^- \[\[" docs/INDEX.md | wc -l`
Expected: valor ≥ `15` (6 arquitetura + 1 API + 5 domínio + 5 TCC + eventuais).

- [ ] **Pós-3: Rodar status**

Run: `git status && git log --oneline -20`
Expected: árvore limpa; log mostra 15 commits de documentação encadeados.

- [ ] **Pós-4: Oferecer PR / merge**

Nenhum passo automático. Perguntar ao usuário se quer abrir PR, dar push, ou manter os commits locais.

---

## Self-review (feito antes de entregar o plano)

**Cobertura da spec:**
- Camada 1 (produto/domínio): tasks 1–9 cobrem `visao-geral`, `atores-e-papeis`, `horas-complementares`, `fluxo-aprovacao`, `ARCHITECTURE`, `MODULES`, `DATABASE`, `STACK`, `pendencias`. ✓
- Camada 2 (acadêmica): tasks 10–14 cobrem `visao-geral`, `estrutura-artigo`, `metodologia`, `cronograma`, `trabalhos-correlatos`. ✓
- `INDEX.md`: task 15. ✓
- Pendências: consolidadas na task 9 conforme spec. ✓
- Delegação ao `docs-curator`: todas as tarefas seguem o padrão proposta → aprovação → execução descrito no início do plano. ✓

**Varredura de placeholders no próprio plano:** nenhum "TBD/TODO/similar". Pendências dentro do conteúdo-fonte são deliberadas (regulamento da IES, retenção de auditoria, tamanho máx. de PDF, biblioteca de UI, trabalhos correlatos a preencher no Mês 1) e cada uma está rastreada em `pendencias.md` ou é entregável posterior do cronograma.

**Consistência de tipos/nomes:** nomes de módulos (`portal-aluno`, `painel-coordenador`, `modulo-documentos`, `dashboard-gerencial`) são idênticos entre tasks 5, 6 e qualquer wikilink futuro. Nomes de entidades (Aluno, Submissão, Avaliação, Documento, Categoria, RegraMatriz, Coordenador, Administrador) são consistentes entre tasks 6 e 7.
