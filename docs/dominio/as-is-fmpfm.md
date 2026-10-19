---
tipo: regra-de-negócio
status: v1
---

# As-Is — processo atual na FMPFM

Mapeamento do processo manual atual de gestão de horas complementares no curso de Ciência da Computação da **Faculdade Municipal Professor Franco Montoro (FMPFM)**. Serve como baseline do TCC para a comparação de tempo As-Is vs. To-Be da Fase 4 ([[tcc/metodologia#Desempenho operacional — As-Is vs. To-Be]]).

Fonte: declaração do autor em entrevista de levantamento de requisitos de 2026-10-19 ([[superpowers/specs/2026-10-19-requisitos-mes-1#5. As-Is — processo atual na FMPFM]]).

---

## Processo atual

| Etapa | Como ocorre hoje |
|---|---|
| Submissão | Presencial — aluno leva comprovantes impressos ou PDF em pendrive à coordenação. |
| Análise | Fila em lote; agendamento com coordenador quando um caso exige discussão. |
| Latência típica | **~1 mês ou mais** entre entrega e decisão. |
| Comunicação da decisão | Nenhum aviso ativo. Aluno retorna presencialmente para saber o resultado. |
| Justificativa de indeferimento | Provavelmente verbal/informal (a confirmar com a coordenação). |
| Consolidação | Planilha Excel/Google Sheets mantida à mão pela coordenação. |
| Perda de registros | Comum. Planilha desatualizada, pastas físicas extraviadas, troca de coordenador. Ônus de reconstituir cai sobre o aluno. |
| Fechamento final (colação) | Momento de aperto; aluno descobre lacunas no último instante. |

## Dor crítica

O aluno frequentemente **perde horas** no processo e precisa se virar para reconstituir o próprio acúmulo. Essa é a dor que o easycert resolve por construção (histórico imutável, visibilidade contínua, notificação ativa).

## Riscos metodológicos

- **Latência de 1 mês é declaração do autor**, não medição formal. Mitigável com coleta rápida junto a 3–5 alunos durante a Fase 4, ou reportada como "ordem de grandeza estimada" no artigo.
- **Justificativa de indeferimento verbal** é inferência, não fato confirmado. A confirmar com a coordenação.

---

## Notas relacionadas

- [[visao-geral]] — produto que resolve as dores aqui mapeadas.
- [[fluxo-aprovacao]] — processo To-Be que substitui este As-Is.
- [[horas-complementares]] — modelo de horas no To-Be.
- [[tcc/metodologia]] — método de comparação As-Is vs. To-Be.
