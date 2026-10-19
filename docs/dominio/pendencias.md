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
- **Provedor de e-mail transacional em deploy** — Resend vs. Brevo não decidido na entrevista do Mês 1 (apenas Mailtrap em dev está confirmado). Bloqueia configuração do serviço de notificação por e-mail. Origem: [[INFRASTRUCTURE#Integrações externas]].

## A confirmar (não bloqueiam, mas precisam ratificação antes de virarem dependência)

- **Autenticação (confirmação final)** — decisão preliminar: login próprio local + JWT via NestJS Passport. Autor ratifica antes de iniciar modelagem de usuário no Mês 2. Origem: [[atores-e-papeis#Autenticação]].
- **Retenção do histórico de auditoria** — decisão provisória: **indefinida** na v1. Autor levará ao orientador antes do Mês 4; alternativa comum é 5 anos. Impacta política de LGPD descrita no artigo. Origem: [[fluxo-aprovacao#Auditoria]].

## Resolvidas pela spec de requisitos do Mês 1

Decisões fechadas em [[superpowers/specs/2026-10-19-requisitos-mes-1]]:

- Storage de PDFs → S3-compat (`@aws-sdk/client-s3`), MinIO em dev + Cloudflare R2 em deploy.
- Biblioteca de validação de DTO → Zod + `nestjs-zod`, schemas em `@easycert/types`.
- Biblioteca de UI → shadcn/ui + Tailwind + Radix.
- Escopo QRCode → apenas certificados emitidos pela própria plataforma (eventos internos).
- Canal de notificação → e-mail transacional + central in-app, disparados em cada transição.
- Tamanho máximo do PDF → 10 MB.
- Validade temporal da atividade → entre `dataIngresso` do aluno e a data atual.

---

## Notas relacionadas

- [[visao-geral]] — contexto de produto.
- [[STACK]] — decisões técnicas.
- [[AGENTS]] — agentes consultam pendências antes de executar.
