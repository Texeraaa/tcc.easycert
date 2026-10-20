---
tipo: visão
status: v1
---

# Visão geral

**easycert** é uma plataforma de **gestão de horas complementares** acadêmicas. Permite que alunos registrem atividades, que coordenadores validem e que a instituição acompanhe o cumprimento da carga horária exigida.

Esta nota é o ponto de entrada do domínio. Cobre o objetivo do produto, quem são os atores e o requisito central. Também marca o que está **fora do escopo da v1**. Implementação técnica fica nas notas linkadas em [[ARCHITECTURE]].

---

## Fase atual

TCC/MVP acadêmico: protótipo de pesquisa aplicada, avaliado com usuários-piloto (alunos e coordenadores) via SUS e comparação de tempo As-Is vs To-Be. Objetivo imediato: entregar MVP funcional em 5 meses, conforme cronograma em [[tcc/cronograma]].

## Atores iniciais

Ver [[atores-e-papeis]].

## Requisito central

Automação dos fluxos acadêmicos de horas complementares (submissão de comprovante, validação pela coordenação, consolidação de carga horária, emissão de declaração/relatório). Não é um CRUD de certificados; o valor está em reduzir retrabalho, padronizar análise e dar transparência ao estudante.

---

## Não-objetivos da v1

Explicitamente fora de escopo. Cada item aqui foi decidido; propor implementação na v1 deve ser tratado como mudança de escopo.

- OCR dos PDFs de comprovante (trabalho futuro).
- Integração via API com ERPs acadêmicos existentes (trabalho futuro).
- Assinatura digital externa (ICP-Brasil ou similar).
- Suporte multi-IES; v1 assume instituição única.
- **Antivírus/scan de malware em PDFs** — hoje a plataforma aceita PDF arbitrário até 10 MB sem validação de conteúdo. Mitigação (ClamAV / AWS Lambda scan / S3 Object Lambda) fica para versão futura pós-MVP.

---

## Notas relacionadas

- [[horas-complementares]] — modelo de horas e categorias.
- [[fluxo-aprovacao]] — ciclo de submissão e aprovação.
- [[atores-e-papeis]] — quem usa o sistema e o que pode fazer.
- [[as-is-fmpfm]] — processo atual manual que o easycert substitui.
- [[pendencias]] — decisões em aberto.
- [[STACK]] — decisões de tecnologia e por quê.
