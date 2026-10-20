# Spec — Levantamento de Requisitos (Mês 1 do TCC)

**Data:** 2026-10-19
**Autor:** Pedro H. Teixeira
**Status:** v1 — revisado pelo `tech-architect` em 2026-10-20; aprovado.
**Versão:** 1.0

---

## 1. Contexto

Esta spec encerra o **Mês 1 do cronograma do TCC easycert**, cujo escopo é o levantamento de requisitos (ver [[tcc/cronograma#Mês 1]]) e a escrita das seções de Introdução e Fundamentação teórica. O produto em desenvolvimento é descrito em [[dominio/visao-geral]] e seus objetivos acadêmicos em [[tcc/visao-geral]].

A spec consolida:
- resposta a decisões em aberto registradas em [[dominio/pendencias]];
- requisitos funcionais e não-funcionais numerados, antes implícitos nas notas de domínio;
- mapeamento do processo atual (**As-Is**) da IES-alvo, insumo da Fase 4 da metodologia ([[tcc/metodologia]]);
- premissas assumidas e riscos metodológicos associados;
- próximos passos de documentação e revisão arquitetural.

As fontes da spec são: as notas do vault em `docs/`, a entrevista de levantamento de requisitos realizada em **2026-10-19** entre o autor e o main agent operando sob mentalidade de `tech-architect`, e as memórias persistidas pelo autor sobre o estudo de caso.

## 2. Objetivo

Entregar, ao final do Mês 1, um documento único de requisitos consolidados que:

1. **Resolva** as pendências bloqueantes de v1 ([[dominio/pendencias#Em aberto]]) ou declare-as explicitamente diferidas com data-limite para fechamento.
2. **Explicite** requisitos funcionais e não-funcionais em formato numerado e rastreável, suficientes para iniciar a modelagem no Mês 2.
3. **Documente** o processo As-Is da IES-alvo como baseline da comparação de tempo da Fase 4.
4. **Registre** premissas, riscos metodológicos e perguntas em aberto para orientação.

## 3. Escopo e não-objetivos

### 3.1 Dentro do escopo da v1

- Submissão de comprovantes em PDF por alunos.
- Avaliação por coordenadores com atribuição de carga aceita.
- Consolidação do acumulado de horas por aluno, com visibilidade contínua.
- Emissão de relatório consolidado e de certificados próprios da plataforma (eventos internos) com código de verificação + QRCode.
- Notificação ativa ao aluno a cada transição de estado da submissão.
- Dashboard gerencial para administrador da instituição.

### 3.2 Fora do escopo da v1

Mantidos de [[dominio/visao-geral#Não-objetivos da v1]] e estendidos pela entrevista:

- OCR dos PDFs de comprovante.
- Integração via API com ERPs acadêmicos (SIGA, Lyceum, Jacad etc.).
- Assinatura digital externa (ICP-Brasil ou equivalente).
- Suporte multi-IES — v1 assume instituição única.
- Adesão plena à LGPD (apenas boas práticas mínimas na v1; adesão completa é trabalho futuro).
- QRCode em comprovantes externos aprovados — apenas registro, não re-emissão.
- Push web, notificação em WhatsApp ou qualquer canal fora de e-mail + in-app.
- Internacionalização (i18n) — apenas PT-BR na v1.
- Expurgo automático do histórico de auditoria — política documentada, implementação diferida.

## 4. Atores

Resumo. Detalhamento em [[dominio/atores-e-papeis]].

| Ator | Objetivo primário |
|---|---|
| **Aluno** | Submeter comprovantes, acompanhar status e progresso, baixar relatório e certificados. |
| **Coordenador** | Avaliar submissões, atribuir carga aceita, emitir decisão com justificativa. |
| **Administrador da instituição** | Gerir matriz curricular, usuários e visão agregada; emitir relatórios gerenciais. |

## 5. As-Is — processo atual na FMPFM

Mapeamento do processo manual atual de gestão de horas complementares no curso de Ciência da Computação da **Faculdade Municipal Professor Franco Montoro (FMPFM)**. Fonte: declaração do autor em entrevista. Serve como baseline da comparação **tempo As-Is vs To-Be** da Fase 4 ([[tcc/metodologia#Desempenho operacional — As-Is vs. To-Be]]).

| Etapa | Como ocorre hoje |
|---|---|
| Submissão | Presencial — aluno leva comprovantes impressos ou PDF em pendrive à coordenação. |
| Análise | Fila em lote; agendamento com coordenador quando um caso exige discussão. |
| Latência típica | **~1 mês ou mais** entre entrega e decisão. |
| Comunicação da decisão | Nenhum aviso ativo. Aluno precisa retornar presencialmente para saber o resultado. |
| Justificativa de indeferimento | Provavelmente verbal/informal (a confirmar com coordenação em coleta futura). |
| Consolidação | Planilha Excel/Google Sheets mantida à mão pela coordenação, atualizada a cada aprovação. |
| Perda de registros | Comum. Falhas na planilha, pastas físicas extraviadas, troca de coordenador. Ônus de reconstituir cai sobre o aluno. |
| Fechamento final (colação) | Momento de aperto; aluno descobre lacunas no último instante. Fluxo exato não é claro ao aluno. |

### 5.1 Dor crítica (origem da justificativa do TCC)

> O aluno frequentemente "perde horas" no processo e precisa se virar para reconstituir o próprio acúmulo.

Essa dor é o gancho da seção de Introdução do artigo. É também o principal elemento da seção de Resultados qualitativos — o To-Be elimina esta dor por construção (histórico imutável, visibilidade contínua, notificação ativa).

### 5.2 Riscos metodológicos do As-Is

- **Latência de 1 mês é declaração do autor, não medição formal.** Risco mitigável com coleta rápida com 3–5 alunos no Mês 4, ou reportada como "ordem de grandeza estimada" no artigo.
- **A justificativa verbal/informal do indeferimento** é inferência, não fato confirmado. A confirmar com a coordenação da FMPFM.

## 6. Requisitos Funcionais (RF)

Formato: **ID — descrição — ator — prioridade — origem.** Prioridade usa MoSCoW: **MUST** (obrigatório na v1), **SHOULD** (importante, aceita trade-off). SHOULD-NOT e WON'T estão em `3.2 Fora do escopo`.

### 6.1 Cadastro e autenticação

| ID | Descrição | Ator | Prio | Origem |
|---|---|---|---|---|
| RF-01 | Autenticar com e-mail institucional e senha, usando hash forte (bcrypt/argon2). | Todos | MUST | §9 (decisão de auth) |
| RF-02 | Recuperar senha via e-mail. | Todos | MUST | §9 |
| RF-03 | Administrador cria aluno com e-mail, nome completo, matrícula, curso e **data de ingresso no curso**. Aluno define senha no primeiro acesso. | Admin / Aluno | MUST | §9 + RF-21 |
| RF-04 | Administrador atribui papel ao usuário (Aluno, Coordenador, Admin). | Admin | MUST | [[atores-e-papeis]] |
| RF-05 | Rotas protegidas por papel (RBAC). Aluno não vê fila do coordenador; coordenador não gere matriz curricular. | Backend | MUST | [[atores-e-papeis]] |

### 6.2 Submissão e análise

| ID | Descrição | Ator | Prio | Origem |
|---|---|---|---|---|
| RF-06 | Aluno faz upload de comprovante em PDF até 10 MB, informando: categoria, carga horária informada, instituição emissora, data da atividade. | Aluno | MUST | [[horas-complementares#Comprovação]] + §9 |
| RF-07 | Aluno pode salvar submissão como **Rascunho** antes de enviar à análise. | Aluno | MUST | [[fluxo-aprovacao#Estados]] |
| RF-08 | Aluno envia a submissão (Rascunho → Pendente). Metadata obrigatória validada antes do envio. | Aluno | MUST | [[fluxo-aprovacao#Transições]] |
| RF-09 | Coordenador acessa fila de submissões no estado Pendente. | Coordenador | MUST | [[atores-e-papeis]] |
| RF-10 | Coordenador abre uma submissão para avaliar (Pendente → Em análise). | Coordenador | MUST | [[fluxo-aprovacao#Transições]] |
| RF-11 | Coordenador visualiza o PDF lado a lado com as regras da matriz curricular aplicáveis à categoria selecionada. | Coordenador | SHOULD | [[atores-e-papeis]] |
| RF-12 | Coordenador aprova a submissão, atribuindo **carga horária aceita** que pode ser menor que a informada (nunca maior). | Coordenador | MUST | [[horas-complementares#Carga informada vs. aceita]] |
| RF-13 | Coordenador indefere a submissão fornecendo **justificativa textual obrigatória**. | Coordenador | MUST | [[fluxo-aprovacao#Rejeição e correção]] |
| RF-14 | Aluno pode editar submissão indeferida (trocar PDF, ajustar metadados) e reenviar à análise (Indeferida → Pendente). O histórico anterior é preservado. | Aluno | MUST | [[fluxo-aprovacao#Rejeição e correção]] |
| RF-15 | Validação da data da atividade: deve estar entre a `dataIngresso` do aluno e a data atual. | Backend | MUST | §9 (validade temporal) |
| RF-16 | Validação da carga informada contra o teto por atividade da categoria selecionada (quando configurado). | Backend | SHOULD | [[horas-complementares#Limites]] |

### 6.3 Visibilidade e progresso

| ID | Descrição | Ator | Prio | Origem |
|---|---|---|---|---|
| RF-17 | Aluno visualiza o status de cada submissão em tempo real: Rascunho, Pendente, Em análise, Aprovada, Indeferida. | Aluno | MUST | [[atores-e-papeis]] |
| RF-18 | Aluno visualiza o progresso de cumprimento das **100h** exigidas, com desdobramento por categoria da matriz. | Aluno | MUST | [[horas-complementares]] + §9 (100h FMPFM) |
| RF-19 | Aluno é notificado por e-mail a cada transição de estado da própria submissão. | Aluno | MUST | §9 (canal) |
| RF-20 | Aluno vê uma central de notificações in-app com histórico de eventos. | Aluno | SHOULD | §9 (canal) |

### 6.4 Emissão de documentos

| ID | Descrição | Ator | Prio | Origem |
|---|---|---|---|---|
| RF-21 | Aluno baixa **relatório consolidado** com soma de carga aceita por categoria e progresso vs. 100h exigidas. | Aluno | MUST | [[fluxo-aprovacao#Emissão de documentos]] |
| RF-22 | Plataforma emite **certificado próprio** para eventos internos cadastrados (ex: Semana de Computação FMPFM), contendo código único de verificação e **QRCode** apontando para rota pública de verificação. | Admin / Aluno | SHOULD | [[fluxo-aprovacao#Emissão de documentos]] + §9 (escopo QRCode) |
| RF-23 | Rota pública de verificação exibe, dado um código, se o certificado é válido e os dados do evento (sem expor dados pessoais do aluno além do nome). | Público | SHOULD | §9 (escopo QRCode) |

### 6.5 Administração

| ID | Descrição | Ator | Prio | Origem |
|---|---|---|---|---|
| RF-24 | Administrador gere a matriz curricular: categorias, limites por categoria, teto por atividade. | Admin | MUST | [[atores-e-papeis]] |
| RF-25 | Administrador vê dashboard gerencial: percentual de alunos com horas concluídas, categorias mais utilizadas, tempo médio de análise. | Admin | SHOULD | [[atores-e-papeis]] |
| RF-26 | Toda transição de estado é registrada em log de auditoria imutável, com ator, timestamp, estado anterior, estado novo e justificativa quando aplicável. | Backend | MUST | [[fluxo-aprovacao#Auditoria]] |

## 7. Requisitos Não-Funcionais (RNF)

### 7.1 Segurança e LGPD

| ID | Descrição |
|---|---|
| RNF-01 | HTTPS obrigatório em todo tráfego de produção. |
| RNF-02 | Senhas armazenadas com hash (bcrypt ou argon2id). |
| RNF-03 | PDFs servidos apenas via URL assinada (presigned URL), com expiração curta. Nunca acessíveis diretamente pelo bucket público. |
| RNF-04 | Dados pessoais (nome, matrícula, e-mail) não são escritos em stdout nem em logs estruturados sem mascaramento. |
| RNF-05 | Testes de usabilidade da Fase 4 utilizam **dados fictícios/anonimizados**, sem PII real circulando no protótipo. |
| RNF-06 | Adesão plena à LGPD (política formal, DPO, direito de exclusão auditado) é **trabalho futuro**. V1 adota as boas práticas mínimas acima. |

### 7.2 Performance (metas realistas, verificáveis na Fase 4)

| ID | Descrição |
|---|---|
| RNF-07 | Submissão completa (upload do PDF + persistência de metadata) concluída em **≤ 15s** em conexão 4G típica. |
| RNF-08 | Dashboard do aluno carrega em **≤ 3s** no acesso autenticado. |
| RNF-09 | Notificação ao aluno após decisão do coordenador entregue em **≤ 1 min** (e-mail) e **≤ 10s** (in-app). |

### 7.3 Dispositivos e compatibilidade

| ID | Descrição |
|---|---|
| RNF-10 | Interface **responsiva**, uso misto desktop/mobile (~50/50). Mobile-first não é obrigatório, mas nenhum fluxo pode quebrar em viewport < 400px. |
| RNF-11 | Compatibilidade testada em: Chrome, Firefox e Safari — desktop e mobile (iOS Safari e Chrome Android). |

### 7.4 Acessibilidade

| ID | Descrição |
|---|---|
| RNF-12 | WCAG 2.1 nível **A** como requisito mínimo contratual: navegação por teclado em todos os fluxos, labels associados, estrutura semântica, alt text em imagens. |
| RNF-13 | WCAG 2.1 nível **AA** como esforço onde a biblioteca de componentes já contempla (contraste 4.5:1, foco visível). Auditoria completa AA é trabalho futuro. |

### 7.5 Durabilidade

| ID | Descrição |
|---|---|
| RNF-14 | Em ambiente de deploy, backup automatizado **diário** do Postgres (dump) e do bucket S3-compat (snapshot/mirror). |
| RNF-15 | Em ambiente de dev local, backup não é formalizado; dados são tratados como descartáveis. |
| RNF-16 | Histórico de auditoria tem retenção **indefinida** na v1 — nunca expurga enquanto a plataforma estiver em operação. Política sujeita a revisão com orientação acadêmica (ver §10.2). |

### 7.6 Idioma

| ID | Descrição |
|---|---|
| RNF-17 | Toda a interface em PT-BR. Nenhuma preparação para i18n na v1. |

## 8. Decisões técnicas resolvidas

Pendências de [[dominio/pendencias]] fechadas (ou declaradas preliminares) na entrevista. Justificativa curta aqui; motivação longa fica em `brainstorming_log` futuro ou nas notas de domínio após sincronização pelo `docs-curator`.

| Pendência | Decisão | Justificativa curta | Status |
|---|---|---|---|
| Autenticação | **Login próprio local + JWT** (NestJS Passport local). | Zero dependência externa; SUS da Fase 4 não mede tela de login; SSO institucional vira trabalho futuro. | **Preliminar** — autor confirma antes do Mês 2. |
| Storage de PDFs | **S3-compat**: MinIO em dev + Cloudflare R2 em deploy. SDK `@aws-sdk/client-s3` único. | Portfolio (padrão S3), free tiers sem cartão, argumento acadêmico de arquitetura intercambiável, presigned URL embutido. | Fechada. |
| Lib de validação DTO | **Zod + `nestjs-zod`**, schemas em `@easycert/types`. | Fonte única de verdade entre api e web; `.refine()` resolve "carga aceita ≤ informada" em uma linha; materializa `@easycert/types` como contrato real. | Fechada. |
| Biblioteca de UI | **shadcn/ui** (Radix UI + Tailwind). | Fecha RNF-12/13 sem código ad-hoc; zero vendor lock-in; padrão de mercado atual. | Fechada. |
| Canal de notificação | **E-mail + in-app** (combinado). | E-mail resolve "não precisa estar logado"; in-app dá central de histórico pro demo da banca. | Fechada. |
| Escopo QRCode | **Apenas certificados próprios da plataforma** (eventos internos). | Comprovantes externos têm emissão própria, só são registrados. Simplifica escopo e mantém integridade honesta. | Fechada. |
| Tamanho máx PDF | **10 MB.** | Cobre PDFs escaneados A4 típicos sem permitir abuso. | Fechada. |
| Retenção auditoria | **Indefinida.** | Simples de implementar; política sujeita a revisão com orientador. | **A confirmar com orientador.** |
| Validade temporal da atividade | **Durante o curso** (dataIngresso ≤ dataAtividade ≤ hoje). | Simples e defensável; exige `dataIngresso` no cadastro do aluno (RF-03). | Fechada. |
| **Matriz curricular concreta** | Diferida. Mês 1 fecha com **matriz assumida como premissa** (categorias típicas CNE/MEC). Regulamento oficial FMPFM substitui a premissa quando coletado. | Autor não possui o regulamento oficial. Modelagem via tabela/seed, não hardcoded — refactor zero quando chegar. | **Diferida com data-limite: antes do Mês 2 fechar.** |

## 9. Premissas assumidas

Explicitadas aqui para que apareçam no artigo como premissa e não como fato.

| Premissa | O que seria preciso para virar fato |
|---|---|
| **FMPFM — regulamento de horas complementares** segue o padrão CNE/MEC (ensino, pesquisa, extensão, cultural-artístico, representação estudantil). | Coletar o regulamento oficial via coordenação do curso, site da FMPFM ou PPC. |
| **Carga total exigida = 100h** para Ciência da Computação. | **Confirmada** pelo autor; não é premissa, mas registrada aqui para explicitar que é o único número confirmado hoje. |
| **Latência típica do As-Is = 1 mês ou mais.** | Declaração do autor; validar com 3–5 alunos durante a Fase 4. |
| **Justificativa de indeferimento verbal no As-Is.** | Confirmar com a coordenação da FMPFM. |

## 10. Pendências residuais

### 10.1 Decisões ainda abertas que não bloqueiam o Mês 1

- **Regulamento oficial FMPFM** — coletar antes do Mês 2 fechar.
- **Confirmação final do login próprio + JWT** — ratificar antes de iniciar modelagem de usuário no Mês 2.

### 10.2 Perguntas para o orientador

- **Retenção do histórico de auditoria.** V1 adota retenção indefinida; alternativa comum é 5 anos. Impacta política de LGPD descrita no artigo.
- (Espaço reservado para outras perguntas que surgirem até a próxima orientação.)

## 11. Riscos metodológicos

| Risco | Impacto | Mitigação |
|---|---|---|
| Regulamento FMPFM não coletado até o Mês 2 fechar | Matriz curricular segue como premissa; validade externa dos resultados do artigo cai | Esforço de coleta ativa (coordenação, PPC) ao longo do Mês 2; refactor zero quando chegar |
| Baseline de tempo As-Is sem medição formal | Afirmação "redução de X%" fica frágil | Coleta rápida com 3–5 alunos no Mês 4 OU reportar como "ordem de grandeza estimada" |
| Testes SUS com amostra pequena de voluntários | Baixo poder estatístico | Aceito como limitação declarada; TCC se apoia na comparação qualitativa + quantitativa combinadas |
| Autenticação diferida pré-Mês 2 | Pode destravar tarde a modelagem de usuário | Decisão preliminar (login próprio + JWT) já serve de base; ratificação é formalidade |

## 12. Próximos passos

Após aprovação desta spec pelo autor:

1. **Delegar `docs-curator`** para:
   - Atualizar [[dominio/pendencias]] removendo os `[!warning]` resolvidos nesta spec e registrando a lista residual.
   - Completar [[STACK]] com as decisões: Zod + `nestjs-zod`, shadcn/ui + Tailwind + Radix, SDK `@aws-sdk/client-s3`, MinIO em compose.
   - Completar [[INFRASTRUCTURE]] com: storage via MinIO (dev) + Cloudflare R2 (deploy), backup diário automatizado, SMTP (Resend/Brevo).
   - Criar nota `docs/dominio/as-is-fmpfm.md` com o conteúdo do §5 desta spec.
   - Resolver os `_(pendente)_` em [[horas-complementares]] (tamanho máx 10 MB, validade temporal durante o curso).
   - Resolver os `_(pendente)_` em [[fluxo-aprovacao]] (notificações: e-mail + in-app; retenção: indefinida c/ nota de orientador).
   - Resolver `_(pendente)_` em [[atores-e-papeis#Autenticação]] (login próprio + JWT, preliminar).
2. **Delegar `tech-architect`** para revisão crítica desta spec e apontar bloqueadores/importantes/sugestões antes do Mês 2 começar. Recomendado — captura o que escapou do levantamento.
3. **Autor coleta** regulamento FMPFM e confirma com orientador a política de retenção.
4. **Encerrar o Mês 1** quando (1) estiver concluído e (2) tiver sido executado. O item (3) pode seguir em paralelo ao Mês 2 sem bloquear a modelagem.

---

## Notas relacionadas

- [[tcc/visao-geral]] — contexto acadêmico.
- [[tcc/metodologia]] — fases, SUS, As-Is vs. To-Be.
- [[tcc/cronograma]] — plano temporal.
- [[dominio/visao-geral]] — produto e não-objetivos.
- [[dominio/horas-complementares]] — modelo de horas.
- [[dominio/fluxo-aprovacao]] — ciclo de vida de uma submissão.
- [[dominio/atores-e-papeis]] — capacidades por papel.
- [[dominio/pendencias]] — decisões em aberto antes desta spec.
- [[STACK]] — decisões tecnológicas.
- [[AGENTS]] — roster de agentes que operará sobre esta spec.
