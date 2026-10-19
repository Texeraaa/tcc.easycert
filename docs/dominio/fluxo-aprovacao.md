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

A plataforma dispara notificações a cada transição de estado da submissão (envio para análise, abertura pelo coordenador, aprovação, indeferimento, correção enviada) por **dois canais combinados**:

- **E-mail transacional** — canal ativo que não exige o aluno estar logado. Mensagem contém o novo estado e, em caso de indeferimento, a justificativa.
- **Central in-app** — ícone de sino no header com contador de não-lidas; página de histórico com todas as notificações do usuário.

Meta de latência: ≤ 1 min para e-mail e ≤ 10 s para in-app (ver [[superpowers/specs/2026-10-19-requisitos-mes-1#7.2 Performance]]).

## Auditoria

Todo evento de transição é registrado com: ator, timestamp, estado anterior, estado novo, justificativa (quando aplicável). O histórico é imutável. Prazo de retenção na v1: **indefinida** — nunca expurga enquanto a plataforma estiver em operação. Política sujeita a revisão em consulta com orientação acadêmica (ver [[pendencias#A confirmar]]).

---

## Notas relacionadas

- [[horas-complementares]] — o que é submetido.
- [[atores-e-papeis]] — quem decide.
- [[visao-geral]] — contexto de produto.
