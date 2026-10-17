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
> Enumeração concreta das categorias e seus limites depende do regulamento da IES. Ver [[pendencias]].

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
- Tamanho máximo: _(pendente)_ — a definir conforme storage escolhido.

## Validade temporal

_(pendente)_ — o TCC não especifica regra sobre quando a atividade foi realizada vs. quando pode ser submetida (ex.: só atividades do próprio curso, janela de X anos, etc.). Confirmar com regulamento.

> [!warning] Em aberto
> Confirmar regulamento oficial da instituição-alvo e consolidar aqui. Ver [[pendencias]].

---

## Notas relacionadas

- [[visao-geral]] — contexto de produto.
- [[fluxo-aprovacao]] — como a hora chega a ser lançada.
- [[atores-e-papeis]] — quem submete e quem valida.
- [[DATABASE]] — como as horas são persistidas.
