# Spec — Geração automatizada do PowerPoint da pré-banca

- **Data:** 2026-10-23
- **Autor:** Pedro Henrique Teixeira
- **Status:** Aprovado com ajustes incorporados (análise `tech-architect` 2026-10-23) — pronto para execução via writing-plans.
- **Resolve pendência:** "Pré-banca (URGENTE)" em [[dominio/pendencias]].
- **Artefato gerado:** `~/Downloads/pre-banca.pptx` (14 slides, fidelidade total ao template `Muller_PreBanca_v2.pptx`).

---

## 1. Objetivo

Gerar `~/Downloads/pre-banca.pptx` a partir do template Muller (`/home/texera/Downloads/Muller_PreBanca_v2.pptx`) preservando 100% do visual — fontes, cores, badges, layout, imagem de fundo, formatação ABNT — substituindo apenas o texto dos placeholders e inserindo 2 imagens do protótipo no slide 10.

Conteúdo-fonte dos 14 slides: [[tcc/rascunhos/pre-banca]]. Esta spec descreve **como** gerar o arquivo, não **o que** cada slide diz — isso vive no rascunho.

---

## 2. Abordagem técnica

Script Python em `scripts/build-pre-banca.py` usando a biblioteca `python-pptx` (instalada via `pip install --user python-pptx`).

O script:

1. **Carrega** o template Muller como ponto de partida — nunca cria slide novo, nunca mexe em layout, nunca altera o `slideMaster`.
2. **Substitui o texto** de cada um dos 14 slides pelos textos do rascunho [[tcc/rascunhos/pre-banca]], operando sobre `runs` existentes para preservar `font.name`, `font.size`, `font.color`, bold/italic do template.
3. **Troca o título do slide 5** de "Hipótese" para "Pergunta de pesquisa" — decisão consciente do autor (pesquisa aplicada, não hipotético-dedutiva).
4. **Adapta a tabela do slide 11 (cronograma)**: remove 5 colunas (Abr, Mai, Jun, Jul, Dez), renomeia as 4 restantes para Ago/Set/Out/Nov, redistribui largura proporcionalmente, preenche X conforme [[tcc/rascunhos/pre-banca#Slide 11 — Cronograma]].
5. **Insere 2 imagens no slide 10**: `aluno-home.png` e `aluno-submissoes.png` lado a lado, largura ~11 cm cada, abaixo dos bullets existentes.
6. **Atualiza o slide 12** com texto que usa datas reais (outubro/novembro) em vez de "Mês 3"/"Mês 4".
7. **Deixa em branco** qualquer item marcado `[FALTA: ...]` no rascunho — as pendências correspondentes estão em [[dominio/pendencias]].
8. **Verifica o resultado**: reabre o `.pptx` gerado, extrai texto por slide, roda diff contra o rascunho e reporta divergências ou avisos (imagem não inserida, texto não encontrado, etc.).

---

## 2.9 Contrato de parsing rascunho → slide

Para que a substituição de texto seja determinística e o diff da seção 2.8 só acuse divergências reais, o parser do rascunho [[tcc/rascunhos/pre-banca]] segue estas regras:

**Delimitação de slide.**
- Cada slide começa com cabeçalho `## Slide N — Título` (regex: `^## Slide (\d{1,2})\b.*$`). O conteúdo do slide vai até o próximo `## Slide` ou o fim do arquivo.
- Slides fora da faixa 1–14 são erro: o script aborta com mensagem clara.

**Mapeamento de elementos.**
- Primeira linha após o cabeçalho que seja `# `, `### `, ou negrito isolado em linha própria (`**Texto**`) → **título do slide**.
- Linhas iniciadas por `- ` (hífen + espaço) → **bullets** (uma linha = um bullet).
- Linhas iniciadas por `> ` → **subtexto / blockquote** (vai para o placeholder de nota do slide, quando existir).
- Parágrafos corridos (sem prefixo) → **corpo** (slide 1, 2, 5, 12 — texto único).
- Linhas `[FALTA: ...]` são copiadas literalmente para o slide (D6).

**Marcação inline → `run.font`.**
- `**texto**` → `run.font.bold = True`.
- `*texto*` ou `_texto_` → `run.font.italic = True`.
- Combinações (`***texto***`) → ambos.
- Nenhuma outra marcação é interpretada (sem links, sem código, sem riscado).

**Normalização para o diff (seção 2.8).**
- Case-sensitive.
- Whitespace: colapsa espaços múltiplos em um só; remove espaços nas pontas de cada linha.
- Ignora marcação inline (`**`, `*`, `_`) — compara só o texto resultante, não a formatação.
- **Critério de sucesso:** se houver qualquer divergência em slide 1–12 ou 14, o script sai com `exit code 1` e lista as divergências. Slide 13 (referências) e qualquer bullet contendo `[FALTA:` só gera **aviso** (stdout), não falha o script.

---

## 2.10 Resolução de caminhos de imagem

Caminhos relativos nas marcações `![](./caminho)` do rascunho são resolvidos relativos ao diretório do rascunho (`docs/tcc/rascunhos/`), **não** ao `cwd` do script. Ou seja, `./img/aluno-home.png` → `docs/tcc/rascunhos/img/aluno-home.png` a partir da raiz do repo.

Se a imagem não existir no filesystem, o script registra aviso (não falha) e segue.

---

## 2.11 Tabela do slide 11 — critério de largura

Ao remover as 5 colunas (Abr, Mai, Jun, Jul, Dez), o script:

1. Soma a largura total das 9 colunas originais (EMU).
2. Redistribui essa soma proporcionalmente entre as 4 colunas restantes (Ago/Set/Out/Nov) — cada uma recebe `total / 4`.
3. Preserva a largura da coluna de descrição (primeira coluna, se existir no template).

O resultado tem a mesma largura total da tabela original; apenas as 4 colunas de mês ficam maiores que antes. Ajuste visual fino fica para a revisão humana (D8).

---

## 2.12 Pré-flight e logging

Antes de abrir o template, o script valida:

1. **`python-pptx` instalado** → `try/except ImportError` com mensagem: `instale com: pip install --user python-pptx`.
2. **Template existe** em `/home/texera/Downloads/Muller_PreBanca_v2.pptx` → se não, mensagem clara apontando onde colocá-lo.
3. **Rascunho existe** em `docs/tcc/rascunhos/pre-banca.md` → se não, aborta.

Durante a execução, o script loga uma linha por slide no stdout:

```
Slide 7: título "Trabalhos relacionados" OK, 4 bullets substituídos, 0 avisos.
Slide 10: título OK, 3 bullets OK, 2 imagens inseridas (aluno-home.png, aluno-submissoes.png).
```

No final: bloco único com o diff (seção 2.8) e exit code 0 (sucesso) ou 1 (divergência).

---

## 2.13 Critério de aceitação humano

Após `exit code 0`, o autor abre `~/Downloads/pre-banca.pptx` no LibreOffice ou PowerPoint e valida visualmente:

- Slide 1 — título + nome do orientador legíveis, fundo íntegro.
- Slide 5 — título trocado para "Pergunta de pesquisa".
- Slide 10 — 2 imagens inseridas lado a lado, não estouram layout.
- Slide 11 — tabela com 4 colunas Ago/Set/Out/Nov, X nos lugares certos, não quebrou visualmente.
- Slide 13 — referências com itálico em título de obra.

Só com esse OK humano a tarefa é considerada completa.

---

## 2.14 Pré-condição de vault

Antes de executar o script, o item "Nome do orientador (slide 1)" em [[dominio/pendencias]] deve ser fechado — o nome já consta no vault ([[tcc/visao-geral]] e no próprio rascunho). Essa limpeza é delegada ao `docs-curator` (ver seção 8).

---

## 3. Decisões consolidadas

| # | Decisão | Escolha |
|---|---|---|
| D1 | Formato de saída | `.pptx` sobre o template Muller (não gera do zero) |
| D2 | Ferramenta | `python-pptx` via `pip install --user` |
| D3 | Localização do script | `scripts/build-pre-banca.py` (versionado) |
| D4 | Localização do artefato | `~/Downloads/pre-banca.pptx` (fora do repo) |
| D5 | Cronograma | 4 colunas Ago/Set/Out/Nov (TCC: Ago/2026→Nov/2026) |
| D6 | Lacunas `[FALTA]` | Deixar em branco no slide + registrar em [[dominio/pendencias]] |
| D7 | Verificação | Diff automático texto rascunho ↔ texto no `.pptx` |
| D8 | Imagens slide 10 | Script posiciona base; ajustes finais na revisão humana |

---

## 4. Calendário

Com início do TCC em Ago/2026, pré-banca em Out/2026 (Mês 3) e defesa em Nov/2026 (Mês 4), o cronograma do slide 11 segue o mapeamento documentado em [[tcc/rascunhos/pre-banca#Slide 11 — Cronograma]].

---

## 5. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Tabela do cronograma descompensar após remover 5 colunas | Script redistribui largura proporcionalmente; usuário ajusta na revisão visual se necessário |
| Imagens do slide 10 estourarem o layout | Script insere com largura ≈ 11 cm cada; usuário reposiciona se precisar |
| Formatação ABNT (itálico em títulos de obra) nas referências | Script aplica `run.font.italic` nos segmentos marcados no rascunho |
| Texto longo quebrar bullet para 3 linhas | Rascunho já está enxuto; se acontecer, encurta-se na revisão |

---

## 6. Fora de escopo

- Executar SUS ou medir As-Is × To-Be — ficam para novembro, antes da defesa.
- Preencher as lacunas `[FALTA: ...]` — rastreamento separado em [[dominio/pendencias]].
- Alterar visual, layout, fontes ou cores do template Muller.
- Gerar versões múltiplas do deck.

---

## 7. Doc-worthy pós-execução

Ao término da execução bem-sucedida (exit code 0 + OK visual), delegar ao `docs-curator`:

1. Fechar em [[dominio/pendencias]] o item **"Montar o PPTX final"**.
2. Fechar em [[dominio/pendencias]] o item **"Nome do orientador (slide 1)"** (já no vault, era limpeza).
3. (Opcional) Confirmar que a seção `## Como gerar` no rascunho [[tcc/rascunhos/pre-banca]] descreve o comando `python scripts/build-pre-banca.py` corretamente.

Nenhuma mudança em `ARCHITECTURE.md`/`STACK.md`/`MODULES.md` — script utilitário fora do runtime do produto não altera stack.

---

## 8. Notas relacionadas

- [[tcc/visao-geral]] — identificação e objetivos do TCC.
- [[tcc/rascunhos/pre-banca]] — rascunho de conteúdo dos 14 slides (origem dos textos).
- [[tcc/cronograma]] — plano temporal.
- [[tcc/metodologia]] — metodologia (SUS, As-Is × To-Be).
- [[dominio/pendencias]] — rastreamento das lacunas que ficam em branco no `.pptx`.
- [[dominio/as-is-fmpfm]] — processo atual (contexto do slide 4).
