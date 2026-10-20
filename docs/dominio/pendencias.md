---
tipo: pendência
status: v1
---

# Pendências

Decisões ainda em aberto na v1. Cada item aponta a nota que originou a pendência. Resolver aqui deve implicar atualizar a nota de origem (removendo o callout `[!warning]` e registrando a decisão).

---

## Em aberto (bloqueiam implementação da respectiva área)

- **Matriz curricular concreta** — aguarda coleta do regulamento oficial da FMPFM. Durante o Mês 1 a matriz foi assumida como premissa (categorias típicas CNE/MEC); substituir pelos valores reais quando o regulamento chegar. **Data-limite: antes do Mês 2 fechar.** Origem: [[horas-complementares]], [[superpowers/specs/2026-10-19-requisitos-mes-1#8. Decisões técnicas resolvidas]].
- **Regulamento oficial de horas complementares da FMPFM** — necessário para preencher categorias, limites, teto por atividade. **Data-limite: antes do Mês 2 fechar.** Origem: [[horas-complementares]].

## A confirmar (não bloqueiam, mas precisam ratificação antes de virarem dependência)

- **Retenção do histórico de auditoria** — decisão provisória: **indefinida** na v1. Autor levará ao orientador antes do Mês 4; alternativa comum é 5 anos. Impacta política de LGPD descrita no artigo. Origem: [[fluxo-aprovacao#Auditoria]].
- **Provedor de e-mail transacional em deploy** — Resend vs. Brevo não decidido na entrevista do Mês 1 (apenas Mailtrap em dev está confirmado). Bloqueia configuração do serviço de notificação por e-mail. Origem: [[INFRASTRUCTURE#Integrações externas]].
- **Imutabilidade do log de auditoria (RF-26)** — RF-26 especifica log "imutável" mas o mecanismo não está definido. Opções: (a) tabela append-only com `GRANT INSERT, SELECT` no role Prisma, sem `UPDATE/DELETE` — recomendada para TCC; (b) hash-chain por linha — over-engineered. Resolver antes de modelar `AuditLog` no Mês 2. Impacta: [[DATABASE]], [[MODULES]]. Origem: revisão do `tech-architect` em 2026-10-20 sobre [[superpowers/specs/2026-10-19-requisitos-mes-1]].
- **Fluxo de upload de PDF (RF-06, RNF-03)** — não definido se o upload é (a) presigned PUT direto do browser para MinIO/R2 (recomendado — tira o PDF da API, respeita limite de body-parser do NestJS, escala melhor) ou (b) via API que repassa ao bucket (mais simples, API vira gargalo). Resolver antes de modelar o `portal-aluno` no Mês 2. Impacta: [[MODULES]], [[INFRASTRUCTURE]]. Origem: revisão do `tech-architect` em 2026-10-20.
- **Esquema de verificação do QRCode (RF-22, RF-23)** — formato do código: opaco em DB (simples, requer DB online) vs. código + HMAC assinado (resistente a enumeração) vs. JWS embutido no QR (verificação offline, QR grande). Afeta tipo/tamanho da coluna `codigo` em `Documento`. Para TCC, opção (a) com rate-limit e id longo é suficiente. Resolver antes de modelar `Documento` no Mês 2. Origem: revisão do `tech-architect` em 2026-10-20.
- **Escopo da auditoria (RF-26)** — RF-26 cobre apenas transição de estado de submissão. Faltam eventos admin: criação de usuário (RF-03), atribuição de papel (RF-04), gestão de matriz curricular (RF-24), emissão de certificado interno (RF-22). Decidir se v1 audita só submissão (declarando o resto como futuro, enfraquece o argumento de "histórico imutável" no artigo) ou amplia para "toda operação administrativa sensível". Origem: revisão do `tech-architect` em 2026-10-20.

## Resolvidas pela spec de requisitos do Mês 1

Decisões fechadas em [[superpowers/specs/2026-10-19-requisitos-mes-1]]:

- Storage de PDFs → S3-compat (`@aws-sdk/client-s3`), MinIO em dev + Cloudflare R2 em deploy.
- Biblioteca de validação de DTO → Zod + `nestjs-zod`, schemas em `@easycert/types`.
- Biblioteca de UI → shadcn/ui + Tailwind + Radix.
- Escopo QRCode → apenas certificados emitidos pela própria plataforma (eventos internos).
- Canal de notificação → e-mail transacional + central in-app, disparados em cada transição.
- Tamanho máximo do PDF → 10 MB.
- Validade temporal da atividade → entre `dataIngresso` do aluno e a data atual.

## Resolvidas após ratificação (2026-10-20)

- **Autenticação** — login próprio local + JWT via NestJS Passport (strategy local). Ratificada pelo autor em 2026-10-20. Origem: [[atores-e-papeis#Autenticação]], [[superpowers/specs/2026-10-19-requisitos-mes-1#8. Decisões técnicas resolvidas]].

---

## Notas relacionadas

- [[visao-geral]] — contexto de produto.
- [[STACK]] — decisões técnicas.
- [[AGENTS]] — agentes consultam pendências antes de executar.
