# MODULES

Módulos do backend e frontend do **easycert**, com responsabilidades e dependências.

Referências de alto nível: [[ARCHITECTURE]]. Rotas expostas: [[API_ROUTES]]. Persistência: [[DATABASE]].

---

## Backend

### `portal-aluno` — API do aluno

- **Responsabilidade:** expor rotas para upload de comprovante, consulta de submissões próprias, acompanhamento de progresso.
- **Dependências:** `@easycert/db`, `@easycert/types`, storage de PDFs.
- **Entidades principais:** Aluno, Submissão, Documento.

### `painel-coordenador` — API do avaliador

- **Responsabilidade:** fila de análise, aprovação/indeferimento, atribuição de carga aceita.
- **Dependências:** `@easycert/db`, `@easycert/types`.
- **Entidades principais:** Submissão, Avaliação, Coordenador.

### `modulo-documentos` — geração de relatórios e declarações

- **Responsabilidade:** montar relatório consolidado por aluno e emitir declaração/certificado interno com QRCode de verificação.
- **Dependências:** `@easycert/db`, biblioteca de PDF, geração de QRCode.
- **Entidades principais:** Submissão (origem dos dados), Documento (saída registrada).

### `dashboard-gerencial` — métricas e visão agregada

- **Responsabilidade:** agregar métricas (horas por período, categorias mais usadas, tempo médio de análise) para o administrador.
- **Dependências:** `@easycert/db`.
- **Entidades principais:** Submissão, Avaliação (agregações).

## Frontend

Único app: `apps/web` (Next.js 15). Organização por área:

### `apps/web/app/aluno` — Portal do Aluno

- **Responsabilidade:** upload de comprovantes, lista de submissões, progresso.
- **Dependências:** `@easycert/types`, `@easycert/ui`.
- **Páginas principais:** `/aluno`, `/aluno/submissoes`, `/aluno/submissoes/nova`, `/aluno/relatorio`.

### `apps/web/app/coordenador` — Painel do Coordenador

- **Dependências:** `@easycert/types`, `@easycert/ui`.
- **Páginas principais:** `/coordenador/fila`, `/coordenador/submissao/[id]`.

### `apps/web/app/admin` — Painel Administrativo

- **Dependências:** `@easycert/types`, `@easycert/ui`.
- **Páginas principais:** `/admin/dashboard`, `/admin/matriz`, `/admin/usuarios`.

## Pacotes compartilhados

- **`@easycert/db`** — schema Prisma e client gerado. Scripts: `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:studio`, `pnpm db:seed`.
- **`@easycert/types`** — DTOs e contratos entre web e api.
- **`@easycert/ui`** — biblioteca de componentes compartilhados (vazia hoje; decisão de framework em [[pendencias]]).
- **`@easycert/tsconfig`** — presets de TypeScript.

---

## Notas relacionadas

- [[ARCHITECTURE]] — como os módulos se encaixam.
- [[API_ROUTES]] — rotas HTTP por módulo.
- [[DATABASE]] — entidades e schema.
