# Plano — Fechamento do Mês 1 e transição para o Mês 2

**Data:** 2026-10-19
**Status:** aberto
**Spec de origem:** [[superpowers/specs/2026-10-19-requisitos-mes-1]]

Checklist das ações pendentes para encerrar formalmente o Mês 1 do TCC easycert (levantamento de requisitos) e destravar o início do Mês 2 (modelagem de dados e arquitetura). Marcar com `[x]` quando concluído e, se possível, registrar data de conclusão.

---

## 1. Revisão crítica do `tech-architect`

- [ ] **Invocar `tech-architect`** sobre a spec `2026-10-19-requisitos-mes-1.md` e as notas de domínio sincronizadas.
  - **Objetivo:** capturar bloqueadores, importantes e sugestões que escaparam ao levantamento.
  - **Prompt sugerido:** "Revise criticamente a spec do Mês 1 e as notas de domínio após a sincronização. Procure: inconsistências entre RF/RNF e domínio, premissas frágeis, riscos metodológicos adicionais, pontos de ambiguidade na matriz assumida, lacunas que podem travar o Mês 2."
  - **Entregável:** veredito do agente (bloqueadores / importantes / sugestões) revisado pelo autor.
  - **Prazo:** antes do Mês 2 começar.

## 2. Coleta do regulamento oficial da FMPFM

- [ ] **Obter o documento oficial** de regulamento de horas complementares do curso de Ciência da Computação da FMPFM.
  - **Fontes a tentar, na ordem:** coordenação do curso → site institucional da FMPFM → PPC (Projeto Pedagógico do Curso) → secretaria acadêmica.
  - **Entregável:** PDF/link do regulamento anexado no projeto; matriz curricular concreta substituindo a premissa assumida (ver [[dominio/horas-complementares#Categorias]]).
  - **Impacto se não vier a tempo:** validade externa dos resultados do TCC cai; artigo precisa declarar explicitamente que trabalhou com matriz assumida.
  - **Prazo:** antes do Mês 2 fechar.

## 3. Ratificação da autenticação

- [ ] **Confirmar formalmente** a decisão preliminar de autenticação: login próprio local + JWT via NestJS Passport.
  - **Alternativas descartadas (reconsiderar se mudar de ideia):** SSO institucional, OAuth externo, magic link.
  - **Entregável:** nota ou mensagem registrando a confirmação; remoção do callout `[!info] A confirmar` em [[dominio/atores-e-papeis#Autenticação]] e migração do item para "Resolvidas" em [[dominio/pendencias]].
  - **Prazo:** antes de iniciar a modelagem de usuário no Mês 2.

## 4. Pergunta ao orientador — retenção de auditoria

- [ ] **Levar ao orientador** a decisão provisória: retenção indefinida do histórico de auditoria.
  - **Pergunta:** "A política de retenção indefinida está adequada para um protótipo acadêmico? A alternativa comum é 5 anos. Qual impacto no enquadramento LGPD do artigo?"
  - **Entregável:** decisão final registrada em [[dominio/fluxo-aprovacao#Auditoria]] e [[dominio/pendencias#A confirmar]].
  - **Prazo:** antes do Mês 4 (quando a seção de Resultados discutir aspectos de proteção de dados).

## 5. Decisão sobre provedor de e-mail transacional

- [ ] **Escolher** entre Resend e Brevo para e-mail transacional em deploy.
  - **Critérios:** free tier generoso, SDK Node bem documentado, templates com HTML, SPF/DKIM configurável.
  - **Entregável:** decisão registrada em [[INFRASTRUCTURE#Integrações externas]] e item removido de [[dominio/pendencias#Em aberto]].
  - **Prazo:** antes do Mês 3 fechar (quando o módulo de notificações entrar em implementação).

## 6. Retenção dos backups

- [ ] **Definir** por quanto tempo os backups diários do Postgres e do bucket serão mantidos em deploy.
  - **Opções típicas:** 7 dias / 30 dias / 90 dias / indefinido.
  - **Entregável:** valor concreto em [[INFRASTRUCTURE#Backup]] substituindo `_(pendente)_`.
  - **Prazo:** antes do primeiro deploy (data a definir).

## 7. Commit da sincronização do vault

- [ ] **Revisar `git diff`** e **commitar** as mudanças aplicadas ao vault em 2026-10-19 (spec do Mês 1 + sincronização de notas de domínio).
  - **Escopo esperado do commit:** `docs/superpowers/specs/2026-10-19-requisitos-mes-1.md` (novo), `docs/dominio/as-is-fmpfm.md` (novo), `docs/dominio/pendencias.md`, `docs/STACK.md`, `docs/INFRASTRUCTURE.md`, `docs/dominio/horas-complementares.md`, `docs/dominio/fluxo-aprovacao.md`, `docs/dominio/atores-e-papeis.md`, `docs/INDEX.md`, `docs/dominio/visao-geral.md`, `docs/tcc/metodologia.md`, `docs/superpowers/plans/2026-10-19-fechamento-mes-1.md` (este arquivo).
  - **Observação:** nenhum agente comita; o commit é sempre do autor.
  - **Prazo:** antes de iniciar o Mês 2.

---

## Critério de encerramento do Mês 1

O Mês 1 está formalmente encerrado quando:

- itens **1** e **7** estão concluídos (revisão arquitetural + commit); e
- itens **3** (ratificação da auth) está concluído.

Os itens **2** (regulamento), **4** (orientador), **5** (e-mail transacional) e **6** (retenção de backup) podem seguir em paralelo ao Mês 2 sem bloquear a modelagem — mas cada um tem seu próprio prazo acima.

---

## Notas relacionadas

- [[superpowers/specs/2026-10-19-requisitos-mes-1]] — spec que gerou este plano.
- [[dominio/pendencias]] — estado atualizado das pendências.
- [[dominio/as-is-fmpfm]] — As-Is da FMPFM.
- [[tcc/cronograma]] — plano temporal dos 5 meses.
