# Spec — Upload de PDF (fluxo direto ao storage)

- **Data:** 2026-10-22
- **Autor:** Pedro Henrique (brainstorming conduzido via Claude Code, modelo Opus 4.7)
- **Status:** proposto — aguarda revisão do `tech-architect` antes de execução.
- **Resolve pendência:** "Fluxo de upload de PDF (RF-06, RNF-03)" de [[pendencias]].
- **Skills aplicadas:** `superpowers:brainstorming`.

---

## 1. Contexto

O easycert precisa receber comprovantes em PDF (até 10 MB) enviados pelo aluno, armazená-los em storage S3-compat (MinIO em dev, Cloudflare R2 em prod — ver [[INFRASTRUCTURE]]) e disponibilizá-los para o coordenador avaliar. A pendência de arquitetura era **como** o PDF chega até o bucket: via API NestJS como intermediária, ou direto do browser para o bucket via credencial efêmera assinada.

Esta spec fecha a decisão em favor de **upload direto do browser para o bucket**, com o servidor de aplicação atuando apenas como emissor de credenciais e validador pós-upload. A escolha é justificada tanto por escalabilidade (API não precisa manipular 10 MB por request) quanto por valor acadêmico (padrão de arquitetura desacoplada demonstrável no artigo do TCC).

## 2. Decisões tomadas

| # | Decisão | Alternativa descartada | Motivação |
|---|---|---|---|
| D1 | **Upload direto do browser ao bucket** (presigned/policy). API orquestra, não transporta bytes. | Multipart via API. | Narrativa de arquitetura escalável no TCC; API stateless; sem gargalo de banda. |
| D2 | **`Submission` nasce no banco antes do PUT** (estado `AWAITING_UPLOAD`). | Nascer depois do PUT (sem estado intermediário). | Durabilidade (registro canônico sobrevive a falha de upload), observabilidade (uploads em andamento rastreáveis), ponto de engate para fila/scan futuro. |
| D3 | **POST policy** (`createPresignedPost`) com `Conditions`. | PUT presigned simples. | Bucket impõe `content-length-range`, `Content-Type` e `starts-with $key` — defesa em profundidade real, não só confiança na URL. |
| D4 | **Validação de magic bytes `%PDF-`** no `confirm` (lê bytes 0-7 via `Range`). | Zero validação; parse completo com `pdf-parse`. | Nível 1 é fraco demais pro TCC; Nível 3 exige fila já no MVP (YAGNI). Nível 2 pega 99% do lixo com ~15 linhas. |
| D5 | **Entidade `Documento` nova por versão** (`v{n}.pdf`). | Sobrescrever; S3 Object Versioning nativo; array JSON. | Vault já modela `Submissão 1-N Documento` ([[DATABASE]]); histórico imutável por entidade preserva FK com `Avaliacao`; portável entre MinIO/R2. |
| D6 | **Rascunho persistente** (`AWAITING_UPLOAD` nunca expira). | TTL curto; descartar após policy expirar. | Casa com D2 e com a filosofia "não perder documento"; UX resumível (aluno retoma rascunho). |
| D7 | **Lifecycle rule por prefixo `_tmp/`** limpa órfãos no bucket após 7 dias. | Lifecycle por tag; cron job na API; filtro por prefixo+tag. | Portabilidade garantida (R2 ainda tem suporte limitado a tag em lifecycle); zero cron na API; limpeza declarativa. |

## 3. Modelo de dados

### 3.1 `Submission`
Campos novos/alterados:
- `storageKey: string` — base canônica, sem versão (ex.: `submissions/{studentId}/{submissionId}`).
- `currentDocumentId: string | null` — FK pro `Documento` ativo.
- `status: enum` — ciclo expandido para incluir `AWAITING_UPLOAD`, `UPLOAD_INVALID`.

Estados possíveis:

| Estado | Significado |
|---|---|
| `AWAITING_UPLOAD` | Submission criada, aguardando upload confirmado. Rascunho persistente. |
| `PENDING` | Documento válido no bucket; fila do coordenador. |
| `UPLOAD_INVALID` | Confirmação falhou (não é PDF); aluno pode reenviar. |
| `UNDER_REVIEW` | Coordenador abriu para análise. |
| `APPROVED` | Aprovada. Horas contabilizadas. |
| `REJECTED` | Indeferida com justificativa. |
| `CORRECTION_REQUESTED` | Pedido de correção; aluno pode reenviar nova versão. |

### 3.2 `Documento`
Relação 1-N com `Submission` (vault já previa — ver [[DATABASE]]).

- `id: string`
- `submissionId: string` (FK)
- `version: int` (1, 2, 3…)
- `storageKey: string` — completo (ex.: `submissions/{studentId}/{submissionId}/v1.pdf`).
- `sizeBytes: int`
- `uploadedAt: datetime`
- `confirmedAt: datetime | null` — nulo até `confirm` validar.

### 3.3 `Avaliacao`
FK adicional: `documentId: string` — identifica **qual versão** foi avaliada. Garante rastreabilidade de histórico (RF-26).

## 4. Endpoints da API

| Método + rota | Papel | Entrada | Saída |
|---|---|---|---|
| `POST /submissions` | Cria `Submission(status=AWAITING_UPLOAD)` + `Documento(version=1, confirmedAt=null)`. Gera POST policy em `submissions/_tmp/{studentId}/{submissionId}/v1.pdf`. | `{categoryId, declaredHours, institution, filename, size}` | `{submissionId, documentId, uploadUrl, fields}` |
| `POST /submissions/:id/confirm` | HEAD no bucket, GET `Range: bytes=0-7`, checa `%PDF-`. Se ok: `CopyObject` `_tmp/` → prefixo permanente, `DeleteObject` do `_tmp/`, preenche `Documento.confirmedAt`, muda `Submission.status` para `PENDING`. Se não: `UPLOAD_INVALID`. | — | `{status: 'PENDING' \| 'UPLOAD_INVALID', error?: string}` |
| `POST /submissions/:id/resubmit` | Só se `status ∈ {CORRECTION_REQUESTED, UPLOAD_INVALID}`. Cria `Documento(version=n+1, confirmedAt=null)` + nova POST policy em `_tmp/`. | `{filename, size}` | `{documentId, uploadUrl, fields}` |
| `DELETE /submissions/:id` | Só em `AWAITING_UPLOAD` ou `UPLOAD_INVALID`. Apaga `Submission` + `Documento`s. Bucket é limpo pela lifecycle. | — | 204 |
| `GET /submissions/:id/documents/:docId/download-url` | Gera presigned GET (expiração curta, ex. 5 min) para visualização. Verifica permissão (aluno dono ou coordenador autorizado). | — | `{url, expiresAt}` |

## 5. Infra do bucket

### 5.1 Prefixos
- `submissions/_tmp/{studentId}/{submissionId}/v{n}.pdf` — **efêmero** (lifecycle: delete após 7 dias).
- `submissions/{studentId}/{submissionId}/v{n}.pdf` — **permanente** (sem lifecycle; histórico imutável).

### 5.2 POST policy
`Conditions` aplicadas ao gerar a URL (API via `createPresignedPost` do `@aws-sdk/s3-presigned-post`):
```
['content-length-range', 0, 10 * 1024 * 1024]
['eq', '$Content-Type', 'application/pdf']
['starts-with', '$key', `submissions/_tmp/${studentId}/${submissionId}/`]
```
Expiração da policy: **10 minutos**.

### 5.3 CORS
Bucket aceita `POST` do domínio do web em qualquer `/submissions/_tmp/*`. `GET` restrito ao servidor (presigned apenas).

### 5.4 Compatibilidade
- **MinIO** (dev) — suporta POST policy completa + lifecycle por prefixo nativamente.
- **Cloudflare R2** (prod) — suporta POST policy via `@aws-sdk` + lifecycle por prefixo e idade. Verificação final no spec de deploy.

## 6. Fluxos

### 6.1 Upload inicial (happy path)
```
Aluno (browser)                 API                             Bucket
     │   POST /submissions         │                                 │
     │ ───────────────────────────▶│                                 │
     │                             │ cria Submission(AWAITING_UPLOAD)│
     │                             │ cria Documento(v1, pending)     │
     │                             │ createPresignedPost → URL + fields
     │ ◀───────────────────────────│ {submissionId, uploadUrl, fields}
     │                             │                                 │
     │ POST uploadUrl (FormData)   │                                 │
     │ ──────────────────────────────────────────────────────────────▶
     │                             │                                 │ grava em _tmp/
     │ ◀────────────────────────────────────────────────────────────── 204
     │                             │                                 │
     │ POST /submissions/:id/confirm                                  │
     │ ───────────────────────────▶│                                 │
     │                             │ HEAD + GET bytes=0-7            │
     │                             │ ──────────────────────────────▶ │
     │                             │ ◀────────────────────────────── bytes
     │                             │ checa %PDF-                     │
     │                             │ CopyObject _tmp/ → permanente   │
     │                             │ ──────────────────────────────▶ │
     │                             │ DeleteObject _tmp/              │
     │                             │ ──────────────────────────────▶ │
     │                             │ Documento.confirmedAt = now     │
     │                             │ Submission.status = PENDING     │
     │ ◀───────────────────────────│ {status: 'PENDING'}             │
```

### 6.2 Validação falha (não é PDF)
No passo de `confirm`, se os primeiros bytes não forem `%PDF-`:
- `Submission.status = UPLOAD_INVALID`.
- Objeto permanece em `_tmp/` (lifecycle apaga em 7 dias).
- API devolve 400 com mensagem acionável; aluno pode `resubmit`.

### 6.3 Rascunho abandonado
- Aluno fecha browser após `POST /submissions` sem fazer PUT.
- `Submission` fica em `AWAITING_UPLOAD` indefinidamente.
- Aluno vê rascunho em "minhas submissões" com badge "incompleta — continuar".
- Ao retomar, se a POST policy expirou (10 min), API gera nova via `POST /submissions/:id/resubmit`.
- Se o objeto em `_tmp/` existir e for válido, aluno chama direto `/confirm`.

### 6.4 Correção pedida pelo coordenador
- Submissão em `CORRECTION_REQUESTED` com `Documento(v1)` histórico.
- Aluno chama `POST /submissions/:id/resubmit` → `Documento(v2, pending)` + nova policy.
- PUT + `confirm` seguem o fluxo normal.
- `currentDocumentId` passa a apontar para `v2`.
- `Documento v1` + `Avaliacao v1` permanecem para auditoria.

## 7. Narrativa para o TCC

Três ganchos escrevíveis no artigo:

1. **Upload desacoplado do servidor de aplicação.** Browser envia direto ao object storage via credencial efêmera emitida pela API. Padrão referenciado como *direct upload* nas documentações de AWS S3, Cloudflare R2 e Google Cloud Storage. Elimina gargalo de banda no servidor de aplicação.

2. **Defesa em profundidade na validação.** Três camadas: (i) POST policy impõe limites no storage (tamanho máximo, content-type, prefixo de chave); (ii) API valida magic bytes no `confirm`; (iii) estado explícito `UPLOAD_INVALID` para rastreabilidade. Falha de qualquer camada é observável.

3. **Preparação para processamento assíncrono.** Estado `AWAITING_UPLOAD` persistido + método `confirm()` isola a validação. Evolução futura para fila + worker (Nível 3 — ver §9) troca apenas a implementação do `confirm`, mantém a interface pública.

## 8. Fora de escopo (MVP)

- **Nível 3 de validação** (fila + `pdf-parse` + antivírus).
- **Lifecycle por tag** (migrar quando R2 maturar suporte).
- **Compressão/arquivamento** de versões antigas para storage frio.
- **Rate limit por aluno** no `POST /submissions` (fica para spec de hardening).
- **OCR** dos PDFs (já marcado como pós-MVP em [[visao-geral]]).

## 9. Evolução prevista

Quando fila for introduzida (pós-MVP):
- Novo estado intermediário `PENDING_VALIDATION` entre `AWAITING_UPLOAD` e `PENDING`.
- `confirm` muda de validação síncrona para enfileiramento.
- Worker consome job, baixa PDF integral, roda `pdf-parse` + antivírus (ClamAV ou AWS Lambda scan).
- Resultado atualiza `Submission.status`.
- Interface do método `confirm()` permanece.

## 10. Riscos e pendências

| Risco | Mitigação |
|---|---|
| R2 pode ter diferenças sutis em POST policy vs S3 canônico | Spec de deploy valida com POST policy real contra R2 antes de prod. |
| Lifecycle por prefixo pode conflitar se outra feature usar `_tmp/` | Reservar prefixo `_tmp/` exclusivo para uploads de submissão; documentar em [[INFRASTRUCTURE]]. |
| Aluno pode sobrescrever `v{n}.pdf` se `POST /resubmit` for chamado antes de `confirm` da versão anterior | API verifica `Documento` mais recente pendente; recusa `resubmit` se já existe. |
| `CopyObject + DeleteObject` não é atômico | Idempotência: `confirm` pode ser re-executado; se objeto já está no permanente, pula o copy. |

## 11. Notas relacionadas

- [[ARCHITECTURE]] — visão geral do sistema.
- [[DATABASE]] — modelo de dados (entidades `Submissão`, `Documento`, `Avaliacao`).
- [[INFRASTRUCTURE]] — storage, MinIO/R2, lifecycle.
- [[MODULES]] — módulo `portal-aluno` consome esses endpoints.
- [[API_ROUTES]] — rotas HTTP a serem adicionadas após esta spec.
- [[fluxo-aprovacao]] — ciclo de vida de submissão (origem dos estados).
- [[horas-complementares]] — contexto do que um PDF representa.
- [[pendencias]] — pendência de upload resolvida por esta spec.
