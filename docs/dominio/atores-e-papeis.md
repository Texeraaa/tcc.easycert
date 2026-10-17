---
tipo: regra-de-negócio
status: v1
---

# Atores e papéis

Quem usa o **easycert** e o que cada um pode fazer. Esta nota lista os atores e suas capacidades. Fluxos específicos ficam em [[fluxo-aprovacao]].

---

## Aluno

- **Objetivo:** registrar atividades e acompanhar sua carga horária.
- **Capacidades:**
  - Fazer upload de comprovantes/certificados em PDF, preenchendo metadados: categoria da atividade, carga horária informada e instituição emissora.
  - Acompanhar o status de cada submissão: Pendente, Aprovado, Indeferido (com justificativa).
  - Visualizar o progresso de cumprimento da carga horária exigida por categoria.
  - Baixar relatório consolidado de horas e declarações/certificados emitidos pela plataforma.

## Coordenador

- **Objetivo:** analisar submissões e decidir sobre o lançamento das horas.
- **Capacidades:**
  - Acessar fila de trabalho de submissões a avaliar.
  - Visualizar o PDF do comprovante lado a lado com as regras da matriz curricular aplicáveis à categoria.
  - Aprovar, rejeitar ou solicitar correção. Em rejeição, justificativa é obrigatória.
  - Atribuir a carga horária final aceita, que pode diferir da carga informada pelo aluno.

## Administrador da instituição

- **Objetivo:** operar o sistema no nível institucional — matriz curricular, usuários, visão agregada.
- **Capacidades:**
  - Dashboard gerencial com percentual de alunos com horas concluídas por período, categorias mais utilizadas e tempo médio de análise da coordenação.
  - Gestão de usuários (criação, desativação, atribuição de papel).
  - Gestão da matriz curricular: categorias, limites e regras de validação por categoria.

## Autenticação

_(pendente)_ — a definir entre login próprio (NestJS Passport) e SSO institucional. Ver [[pendencias]] e [[INFRASTRUCTURE#Integrações externas]].

---

## Notas relacionadas

- [[fluxo-aprovacao]] — o que cada papel executa no fluxo.
- [[horas-complementares]] — o objeto que os papéis manipulam.
- [[visao-geral]] — contexto de produto.
