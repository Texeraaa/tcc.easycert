# INFRASTRUCTURE

Hospedagem, CI/CD e integrações externas do **easycert**.

---

## Hospedagem

_(pendente)_ — onde o app roda em produção (VPS, Vercel, outro).

## Ambientes

- **dev** — docker-compose local: Postgres, MinIO (storage S3-compat), API NestJS, web Next.js. Dados tratados como descartáveis; sem backup formal.
- **staging** — _(pendente)_ a definir quando houver hospedagem.
- **produção/demo** — _(pendente)_ a definir quando houver hospedagem.

## CI/CD

_(pendente)_ — pipeline de build, testes, deploy.

## Integrações externas

- **Storage de PDFs** — padrão S3-compat via `@aws-sdk/client-s3`.
  - Dev: MinIO em `docker-compose.yml`.
  - Deploy: Cloudflare R2 (free tier, egress gratuito).
  - PDFs servidos via **presigned URL** com expiração curta.
- **E-mail transacional** — Mailtrap em dev. Em deploy: Resend ou Brevo — _(pendente)_, autor decide ao fechar deploy. Ver [[dominio/pendencias#Em aberto]].
- **Autenticação** — login próprio local + JWT (preliminar). Ver [[STACK#Autenticação]].
- **SSO institucional** — fora de escopo da v1 ([[dominio/visao-geral#Não-objetivos da v1]]).

## Backup

- Em deploy: backup **diário automatizado** — `pg_dump` do Postgres + mirror do bucket S3-compat (`mc mirror` ou snapshot do R2).
- Em dev local: sem backup formal; dados são descartáveis.
- Retenção dos backups: _(pendente)_ — a definir.

## Observabilidade

_(pendente)_ — logs, métricas, erros em produção.

---

## Notas relacionadas

- [[ARCHITECTURE]] — visão geral.
- [[STACK]] — tecnologias.
- [[DATABASE]] — persistência.
