---
tipo: pendência
status: v1
---

# Pendências

Decisões ainda em aberto na v1. Cada item aponta a nota que originou a pendência. Resolver aqui deve implicar atualizar a nota de origem (removendo o callout `[!warning]` e registrando a decisão).

---

## Pré-banca (URGENTE)

> [!warning] Em aberto
> Pendências para montar os slides de pré-banca a partir do modelo enviado pelo orientador (14 slides, estrutura Muller Catellan).

### Lacunas críticas do template (bloqueiam consolidação dos slides)

- **Obter regulamento oficial de horas complementares da FMPFM** — impacta slide 13 (referências). Regulamento necessário para fundamentar categorias e limites de horas na apresentação. Origem: [[superpowers/specs/2026-10-23-pre-banca-pptx-design]], [[horas-complementares]].
- **Confirmar com o orientador o formato da apresentação** — qualificação (resultados preliminares) vs. defesa fechada (resultados consolidados). Impacta slides 10 e 12 (apresentação de resultados e considerações finais). Origem: [[superpowers/specs/2026-10-23-pre-banca-pptx-design]], [[tcc/rascunhos/pre-banca]].
- **Opcional: screenshot do painel do coordenador** — se o módulo estiver implementado a tempo, incluir como evidência visual no slide 10. Não bloqueia, recomendado. Origem: [[superpowers/specs/2026-10-23-pre-banca-pptx-design]].

---

- **Hipótese formal (slide 5)** — nenhuma nota do vault tem hipótese explícita. Precisa ser escrita derivando da dor do As-Is + proposta To-Be. Owner: autor + `tcc-writer`. Origem: modelo de pré-banca.
- **Referências bibliográficas (slide 13)** — [[tcc/trabalhos-correlatos]] está 100% com `_(pendente)_`; era entregável do Mês 1. Preencher eixos teóricos (BPM/sistemas acadêmicos, prototipagem acelerada/Low-Code, assinatura digital/QRCode), sistemas correlatos (2–4 plataformas em uso em IES brasileiras) e lacunas identificadas. Owner: autor + `tcc-writer`. Origem: [[tcc/cronograma#Mês 1]], [[tcc/estrutura-artigo#2. Fundamentação teórica e trabalhos correlatos (4–5 páginas)]].
- **Resultados preliminares reinterpretados (slide 10)** — SUS e comparação As-Is×To-Be acontecem no Mês 4; estamos no Mês 1. Para a pré-banca o slide precisa reportar "andamento de desenvolvimento até o momento" (As-Is mapeado, requisitos definidos, arquitetura ratificada, design system entregue, specs aprovadas, prototipagem iniciada). Decisão editorial. Owner: autor. Origem: [[tcc/metodologia]], [[tcc/cronograma#Mês 4]].
- **Considerações finais parciais (slide 12)** — sem resultados reais ainda, o slide vira "considerações até o momento / expectativas". Decisão editorial. Owner: autor. Origem: [[tcc/estrutura-artigo#5. Considerações finais (1–2 páginas)]].
- **Nome do orientador (slide 1)** — não está registrado no vault nem na memória. Autor precisa informar e registrar em [[tcc/visao-geral]]. Owner: autor.
- **Título a usar no slide 1** — decidir entre o inicial e o refinado em [[tcc/visao-geral#Título]]. Owner: autor + orientador.
- **Adaptar cronograma ao formato do modelo (slide 11)** — o modelo usa grid Atividades × Meses (Abr…Dez). [[tcc/cronograma]] é Mês 1 a Mês 5. Mapear para meses do calendário real. Owner: autor.
- **Montar o PPTX final** — gerar `.pptx` / `.pdf` após preencher os gaps acima. Fora do vault; execução. Owner: autor.

## Em aberto (bloqueiam implementação da respectiva área)

_(nenhuma — Mês 2 sem bloqueadores conforme [[superpowers/specs/2026-10-22-plano-mes-2#3.4 Variáveis de ambiente]])_

## A confirmar (não bloqueiam, mas precisam ratificação antes de virarem dependência)

- **Matriz curricular concreta** — aguarda coleta do regulamento oficial da FMPFM. Durante o Mês 1 a matriz foi assumida como premissa (categorias típicas CNE/MEC); substituir pelos valores reais quando o regulamento chegar. **Data-limite (ajustada): antes do Mês 4 fechar.** Origem: [[horas-complementares]], [[superpowers/specs/2026-10-19-requisitos-mes-1#8. Decisões técnicas resolvidas]].
- **Regulamento oficial de horas complementares da FMPFM** — necessário para preencher categorias, limites, teto por atividade. **Data-limite (ajustada): antes do Mês 4 fechar.** Origem: [[horas-complementares]].
- **Retenção do histórico de auditoria** — decisão provisória: **indefinida** na v1. Autor levará ao orientador antes do Mês 4; alternativa comum é 5 anos. Impacta política de LGPD descrita no artigo. Origem: [[fluxo-aprovacao#Auditoria]].
- **Provedor de e-mail transacional em deploy** — Resend vs. Brevo não decidido na entrevista do Mês 1 (apenas Mailtrap em dev está confirmado). Bloqueia configuração do serviço de notificação por e-mail. Origem: [[INFRASTRUCTURE#Integrações externas]].
- **Presença em eventos internos (RF-22)** — RF-22 permite emissão de certificado; falta decisão se admin registra presença manual (aluno checado pelo coordenador) ou se há fluxo de auto-declaração + aprovação. Impacta entidade `Presenca` (ou campo equivalente em `EventoInterno`) e workflow do evento. Data-limite: antes do Mês 3. Origem: análise de [[eventos-internos]].
- **Satoshi 900 em Fontshare** — confirmar disponibilidade do peso black; se ausente, substituir por 700 bold em todos os usos. Técnica, baixo risco. Owner: implementador do primeiro PR de design. Origem: [[design/DESIGN#Tipografia]].
- **Licença Fontshare para contexto educacional/institucional FMPFM** — validar se termo da Fontshare permite self-hosting em sistema institucional operado pela faculdade. Jurídico/licenciamento. Owner: autor (consultar orientador se necessário). Origem: [[design/DESIGN#Tipografia]].
- **Logo/wordmark do easycert** — decisão de produto, não design. Opção 1: wordmark em Satoshi 700 `tracking-tight`. Opção 2: criar mark gráfico (fora de escopo da spec). Owner: autor. Origem: [[design/DESIGN#Dials & Personalidade]].
- **Shortcut `R` (rejeitar) — conflito com atalhos nativos** — validado em Chrome/Safari/Firefox em 2026-10-20: `R` solo (sem `Ctrl` / `Cmd`) não conflita com atalhos nativos do browser. Pode implementar em painel coord v1. Técnica. Owner: implementador do primeiro PR coord mode. Origem: [[design/DESIGN#Coord mode]].
- **Sync cross-device das preferências `easycert.theme` / `easycert.density`** — hoje é cookie local. Se virar requisito, modela `UserPreferences` na API. Arquitetura. Owner: tech lead / autor em discussão com orientador se a FMPFM demandar. Origem: [[design/DESIGN#Persistência de preferências (cookie)]].
- **CI pipeline diferida para Mês 3** — pipeline GitHub Actions (`pnpm typecheck && pnpm test` em PR) adiada. Justificativa: committer único, baixo risco de regressão, Mês 2 foca em stubs + typecheck local. Risco aceito. Reavaliar no fechamento do Mês 3 quando half-circle coordenador entrar. Owner: autor. Origem: [[superpowers/specs/2026-10-22-plano-mes-2#7. Fora de escopo]].

## Resolvidas pela spec de requisitos do Mês 1

Decisões fechadas em [[superpowers/specs/2026-10-19-requisitos-mes-1]]:

- Storage de PDFs → S3-compat (`@aws-sdk/client-s3`), MinIO em dev + Cloudflare R2 em deploy.
- Biblioteca de validação de DTO → Zod + `nestjs-zod`, schemas em `@easycert/types`.
- Biblioteca de UI → shadcn/ui + Tailwind + Radix.
- Escopo QRCode → apenas certificados emitidos pela própria plataforma (eventos internos).
- Canal de notificação → e-mail transacional + central in-app, disparados em cada transição.
- Tamanho máximo do PDF → 10 MB.
- Validade temporal da atividade → entre `dataIngresso` do aluno e a data atual.

## Resolvidas após ratificação (2026-10-20+)

- **Autenticação** — login próprio local + JWT via NestJS Passport (strategy local). Ratificada pelo autor em 2026-10-20. Origem: [[atores-e-papeis#Autenticação]], [[superpowers/specs/2026-10-19-requisitos-mes-1#8. Decisões técnicas resolvidas]].
- **Fluxo de upload de PDF (RF-06, RNF-03)** — upload direto do browser para MinIO/R2 via **POST policy** (`createPresignedPost`) com `content-length-range` imposto pelo bucket. `Submission` nasce em `AWAITING_UPLOAD`, API valida magic bytes `%PDF-` no `confirm`, versionamento por entidade `Documento` (`v{n}.pdf`), limpeza de órfãos via lifecycle rule no prefixo `_tmp/` após 7 dias. Ratificada pelo autor em 2026-10-22. Origem: [[superpowers/specs/2026-10-22-upload-de-pdf-design]].
- **Esquema de verificação do QRCode (RF-22, RF-23)** — **Opção A aprovada:** código opaco UUIDv4 armazenado em `Documento.codigo` (`VARCHAR(36) UNIQUE`), campo `revogadoEm: DateTime?`. Rate-limit **30 req/min por IP** na rota pública `/v/[codigo]` via `@nestjs/throttler`. Implementa [[dominio/eventos-internos]]. Ratificada pelo autor em 2026-10-22.
- **Imutabilidade do log de auditoria (RF-26)** (Q2) — **Append-only via REVOKE SQL.** Dois Postgres roles: `easycert_owner` (migrations, dono do schema) e `easycert_app` (runtime). Migration SQL manual aplica `REVOKE UPDATE, DELETE ON audit_log FROM easycert_app`. Prisma mantém `INSERT` e `SELECT` normais pela app role. Ratificada pelo autor em 2026-10-22. Origem: [[superpowers/specs/2026-10-22-plano-mes-2#2.1 Técnicas e de domínio]].
- **Escopo da auditoria (RF-26)** (Q3) — **6 famílias de eventos auditáveis na v1:** `submission.state_changed`, `user.*` (created, updated, deactivated), `role.*` (assigned, revoked — mudança de valor único em `User.role`), `matriz.*` (rule_created, updated, deleted), `certificate.*` (issued, revoked), `event.*` (created, updated, cancelled). Chamada explícita via `auditService.log({ actorId, action, entity, entityId, metadata? })` em cada service (assinatura com primitivos — ver "AuditModule @Global()" abaixo). Login/logout ficam apenas nos logs Pino, não no `AuditLog`. Ratificada pelo autor em 2026-10-22. Origem: [[superpowers/specs/2026-10-22-plano-mes-2#2.1 Técnicas e de domínio]].
- **RegraMatriz formato** (Q4) — **Tabela normalizada** `RegraMatriz` com N-1 para `Categoria`. Campos: `tetoTotalHoras`, `tetoAtividadeHoras`, `cursoId: UUID?` (null = regra global), `dataIngressoDesde: Date`, `dataIngressoAte: Date?` (versionamento). Resolve `[!info] A confirmar` em [[DATABASE]]. Ratificada pelo autor em 2026-10-22. Origem: [[superpowers/specs/2026-10-22-plano-mes-2#2.1 Técnicas e de domínio]].
- **Hash de senha** (Q5) — **argon2id via `@node-rs/argon2`** (binding Rust via napi-rs, zero node-gyp). Parâmetros default: m=19456, t=2, p=1. Ratificada pelo autor em 2026-10-22.
- **Transporte JWT** (Q6) — **Cookie HttpOnly SameSite=Lax**, nome `easycert_session`. `Secure` em prod, `Secure=false` em dev. Mitigação CSRF via `csrf-csrf` (double-submit cookie). Ratificada pelo autor em 2026-10-22.
- **Suporte a Node.js ≥ 20 + TypeScript 5.7** (Q6.5) — engine `node` fixado em `package.json`, Node.js ≥ 20 LTS. TypeScript 5.7 compila tipos TypeScript, acesso a `reflect-metadata` compatível com NestJS. Ratificada pelo autor em 2026-10-22.
- **Porta 3333 para backend** (Q6.7) — NestJS ouve `process.env.PORT ?? 3333`. Expressão em `apps/api/src/main.ts:13`. CORS origin=`http://localhost:3000` (Next.js default). Ratificada pelo autor em 2026-10-22.
- **CSRF exempt list** (Q6.8) — **3 rotas exempt:** `POST /auth/login` (primeiro turno, usuário sem cookie CSRF ainda), `POST /auth/logout` (cookie pode estar expirado), `GET /auth/csrf-token` (GET é isento por natureza; listado para clareza). Fluxo primeiro-login: POST `/auth/login` sem CSRF → sessão criada → GET `/auth/csrf-token` seta cookie `csrf-token` → próximas mutations incluem header `X-CSRF-Token`. Ratificada pelo autor em 2026-10-22 (revisada após análise do `tech-architect` que apontou gap entre login e primeira mutation).
- **Rate-limit de verificação de QRCode** (Q7.1) — Rota pública `GET /v/:codigo` com throttle `@Throttle({default: {limit: 30, ttl: 60_000}})` (30 req/min por IP). Alinha com Q1 (QRCode). Ratificada pelo autor em 2026-10-22.
- **Organização dos módulos NestJS** (Q7) — **Por entidade** (padrão canônico): `auth`, `user`, `submission`, `documento`, `avaliacao`, `matriz`, `evento`, `audit`, `notification`. [[MODULES]] será reescrito em T8 do plano Mês 2. Ratificada pelo autor em 2026-10-22.
- **Observabilidade mínima** (Q8) — `nestjs-pino` + `request-id` via `AsyncLocalStorage` + `/health/live` e `/health/ready` + Pino redaction (`password`, `token`, `cookie`, `authorization`) + header `X-Request-Id` no response. Ratificada pelo autor em 2026-10-22.
- **Escopo frontend do Mês 2** (Q9) — **Half-circle aluno:** `/login`, `/aluno`, `/aluno/submissoes/nova`, `/aluno/submissoes`, `/aluno/submissoes/[id]`. Coordenador e admin ficam para Mês 3. Ratificada pelo autor em 2026-10-22.
- **Bootstrap MinIO** (Q10) — Serviço `minio-init` em `docker-compose.yml` roda `mc` após healthcheck do MinIO: cria bucket, aplica CORS (POST do `localhost:3000` em `_tmp/`), aplica lifecycle rule (expira `_tmp/*` após 7 dias). Script em `infra/minio-init.sh`. Ratificada pelo autor em 2026-10-22.
- **Arquitetura de e-mail transacional** (Q11) — Interface `MailProvider` em `@easycert/types` + `MailtrapProvider` concreto + `FakeMailProvider` para testes. Token DI `MAIL_PROVIDER`. Decisão **Resend vs Brevo** adiada para antes do primeiro deploy (Mês 4-5), fica como pendência "A confirmar". Ratificada pelo autor em 2026-10-22.
- **Regulamento FMPFM** (Q12) — **Não-bloqueador** para o Mês 2. Schema aceita qualquer matriz; seed inicial aplica categorias CNE/MEC típicas (Ensino 60h, Pesquisa 80h, Extensão 60h, Cultural 40h, Representação 20h; mínimo 200h). Autor coleta regulamento oficial em paralelo. Pendências "Matriz curricular concreta" e "Regulamento oficial FMPFM" permanecem em aberto, mas não travam T4/T5. Ratificada pelo autor em 2026-10-22.
- **Rate-limit** (B1) — **`@nestjs/throttler`** global com default 60 req/min + override `@Throttle({default: {limit: 30, ttl: 60_000}})` em `GET /v/:codigo`. Memory store em dev; Redis store quando houver deploy. Lib única (não convive com `express-rate-limit`). Ratificada pelo autor em 2026-10-22.
- **Mitigação CSRF** (B2) — **`csrf-csrf`** (fork mantido do `csurf` deprecado). Double-submit cookie: middleware NestJS valida header `X-CSRF-Token` contra cookie `csrf-token` em todas as mutations, exceto `POST /auth/login` no primeiro turno. Rota `GET /auth/csrf-token` emite o token. Ratificada pelo autor em 2026-10-22.
- **Lib argon2** (B3) — **`@node-rs/argon2`** (binding Rust via napi-rs). Zero node-gyp, zero toolchain C nativo — funciona em alpine docker sem rebuild. Ratificada pelo autor em 2026-10-22.
- **Role model: um papel por usuário** — `User.role: Role` enum único (`ALUNO | COORDENADOR | ADMIN`), não tabela N-N. Eventos `role.assigned` / `role.revoked` no `AuditLog` representam mudança desse valor único. Ratificada pelo autor em 2026-10-22 após análise do `tech-architect` apontar ambiguidade entre enum single-value e semântica de eventos de auditoria. Origem: [[superpowers/specs/2026-10-22-plano-mes-2#T4a]].
- **AuditModule `@Global()` + assinatura com primitivos** — `AuditModule` decorado com `@Global()`; `AuditService.log({ actorId, action, entity, entityId, metadata? })` recebe primitivos, nunca entidade Prisma. Elimina circular deps entre `AuditModule` e `UserService`/outros. Módulos consumidores não precisam importar `AuditModule`. Ratificada pelo autor em 2026-10-22 após análise do `tech-architect`. Origem: [[superpowers/specs/2026-10-22-plano-mes-2#T5e]].
- **Débito técnico: Prisma shutdown hooks** — `PrismaService` implementa `OnModuleInit` + `OnModuleDestroy` com `$connect()`/`$disconnect()`; `main.ts` chama `app.enableShutdownHooks()`. Fecha conexões no SIGTERM, relevante para `/health/ready` responder correto durante shutdown. Mitigação registrada na tabela de riscos da spec. Ratificada em 2026-10-22.
- **Débito técnico: Migration REVOKE versionada** — `REVOKE UPDATE, DELETE ON audit_log FROM easycert_app` aplicado em migration Prisma versionada (`YYYYMMDDHHMMSS_make_audit_log_immutable`), não via `psql -c` solto. Garante idempotência, rastreabilidade e que `prisma migrate reset` reaplica a invariante RF-26. Ratificada em 2026-10-22.

---

## Notas relacionadas

- [[visao-geral]] — contexto de produto.
- [[STACK]] — decisões técnicas.
- [[AGENTS]] — agentes consultam pendências antes de executar.
