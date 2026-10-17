---
tipo: regra-de-negócio
status: v1
---

# Fluxo de aprovação

Ciclo de vida de uma solicitação de hora complementar: submissão, análise, decisão e lançamento. Modelo das horas em si fica em [[horas-complementares]]. Papéis em [[atores-e-papeis]].

---

## Estados

Estados possíveis de uma submissão:
- **Rascunho** — aluno editando antes de submeter.
- **Pendente** — submetida, aguardando análise.
- **Em análise** — avaliador abriu a submissão.
- **Aprovada** — carga horária aceita lançada.
- **Indeferida** — rejeitada com justificativa obrigatória. Aluno pode corrigir e re-submeter (volta a Pendente).

## Transições

| De | Para | Ação | Executor |
|----|------|------|----------|
| — | Rascunho | Criar submissão | Aluno |
| Rascunho | Pendente | Enviar para análise | Aluno |
| Pendente | Em análise | Abrir para avaliar | Coordenador |
| Em análise | Aprovada | Aprovar com carga aceita | Coordenador |
| Em análise | Indeferida | Indeferir com justificativa | Coordenador |
| Indeferida | Pendente | Corrigir e reenviar | Aluno |

## Rejeição e correção

Toda rejeição exige justificativa textual do avaliador. O aluno pode editar a submissão (trocar PDF, ajustar metadados) e reenviá-la. O histórico de versões anteriores e das decisões é preservado para auditoria.

## Emissão de documentos

Após aprovação, a plataforma gera:
- Relatório consolidado de horas por aluno (soma de carga aceita por categoria, progresso vs. mínimo exigido).
- Declaração/certificado da instituição com código de verificação e QRCode para eventos internos emitidos pela própria plataforma. Para comprovantes externos, não há emissão — apenas registro.

## Notificações

_(pendente)_ — definir quais eventos (submissão enviada, análise iniciada, decisão emitida, correção necessária) disparam notificação e por qual canal (email, in-app). Ver [[pendencias]].

## Auditoria

Todo evento de transição é registrado com: ator, timestamp, estado anterior, estado novo, justificativa (quando aplicável). O histórico é imutável. Prazo de retenção: _(pendente)_ — definir.

---

## Notas relacionadas

- [[horas-complementares]] — o que é submetido.
- [[atores-e-papeis]] — quem decide.
- [[visao-geral]] — contexto de produto.
