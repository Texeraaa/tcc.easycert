---
tipo: regra-de-negócio
status: v1
---

# Horas complementares

Modelo de horas complementares no **easycert**: categorias, limites, comprovação. Não cobre fluxo de aprovação (ver [[fluxo-aprovacao]]) nem papéis (ver [[atores-e-papeis]]).

---

## Categorias

A matriz curricular define grupos de atividade (tipicamente: ensino, pesquisa, extensão, cultural/artístico, representação estudantil) e um limite máximo de carga horária por categoria. Os valores concretos dependem do regulamento oficial da instituição-alvo.

> [!warning] Em aberto
> Enumeração concreta das categorias e seus limites depende do regulamento oficial da FMPFM, ainda não coletado. Durante o Mês 1 a matriz é tratada como **premissa assumida** (categorias típicas CNE/MEC); substituir pelos valores reais quando o regulamento chegar. **Data-limite: antes do Mês 2 fechar.** Ver [[pendencias]] e [[superpowers/specs/2026-10-19-requisitos-mes-1#9. Premissas assumidas]].

## Limites

Três eixos de limite se aplicam a toda submissão:
- **Carga horária mínima total** exigida para integralização.
- **Máximo por categoria** (teto do grupo).
- **Teto por atividade individual** dentro de uma categoria (ex.: no máximo X horas por certificado único).

Valores concretos dependem do regulamento. Ver [[pendencias]].

## Carga informada vs. aceita

Toda submissão carrega dois números distintos:
- **Carga horária informada** — declarada pelo aluno no momento do upload.
- **Carga horária aceita** — atribuída pelo avaliador na análise. Pode ser menor que a informada (ex.: certificado comprova 60h, mas regulamento limita a 20h aquela atividade).

A carga aceita é o valor que entra no cômputo da integralização. Ver [[fluxo-aprovacao]].

## Comprovação

- Formato: PDF (prioritário).
- Metadados obrigatórios no upload: categoria da atividade, carga horária informada, instituição emissora.
- Tamanho máximo: **10 MB**. Validação feita no frontend (feedback instantâneo) e revalidada no backend. Dimensionado para cobrir certificados escaneados A4 típicos sem permitir abuso.

## Validade temporal

A plataforma aceita apenas atividades realizadas **entre a `dataIngresso` do aluno no curso e a data atual**. Isso exige que o cadastro do aluno carregue `dataIngresso` como campo obrigatório. Alinhado à prática usual de aceitar apenas atividades realizadas durante o período em que o aluno esteve regularmente matriculado.

---

## Notas relacionadas

- [[visao-geral]] — contexto de produto.
- [[fluxo-aprovacao]] — como a hora chega a ser lançada.
- [[atores-e-papeis]] — quem submete e quem valida.
- [[DATABASE]] — como as horas são persistidas.
