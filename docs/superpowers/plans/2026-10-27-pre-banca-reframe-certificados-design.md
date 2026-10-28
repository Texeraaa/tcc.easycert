# Reescrita e extensão da pré-banca para 16 slides — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescrever `docs/tcc/rascunhos/pre-banca.md` para 16 slides sob o reframe de certificados aprovado em 2026-10-27 E estender `scripts/build-pre-banca.py` para suportar os dois slides novos (Arquitetura e Fluxo de emissão) com placeholder de imagem, mantendo o visual do template Muller inalterado nos 14 slots originais.

**Architecture:** Mantém o padrão existente (parser markdown → `SlideContent` → handlers por slide → write pptx). Introduz: (a) função utilitária `duplicate_slide_at(prs, source_idx, target_idx)` que deep-copia um slide do template para criar os dois slots novos; (b) handler genérico `process_slide_with_image(slide, content, slide_width, slide_height)` que insere 1 imagem grande centralizada, logando aviso se o arquivo não existir; (c) renomeação cosmetica dos handlers 10/11/13 → 12/13/15. Contrato de imagem no markdown não muda — segue a sintaxe `![alt](path)` já suportada.

**Tech Stack:** Python 3.12, python-pptx 1.x. Markdown + wikilinks (vault Obsidian). Template fixo `~/Downloads/Muller_PreBanca_v2.pptx`.

**Fontes de referência:**
- Spec: [[superpowers/specs/2026-10-27-pre-banca-reframe-certificados-design]]
- Spec anterior (contrato de parsing + handlers atuais): [[superpowers/specs/2026-10-23-pre-banca-pptx-design]]
- Backup do rascunho pré-reframe: `docs/tcc/rascunhos/pre-banca.backup-2026-10-27.md`
- Backup do pptx atual: `~/Downloads/pre-banca.backup-2026-10-27.pptx`

---

## File Structure

**Modificado:**
- `scripts/build-pre-banca.py` — ampliar range do parser; renomear handlers 10/11/13 → 12/13/15; novo `process_slide_with_image`; nova util `duplicate_slide_at`; atualizar `_HEADING_IS_ORGANIZATIONAL`; atualizar testes self-test.
- `docs/tcc/rascunhos/pre-banca.md` — reescrita integral para 16 slides sob o reframe.

**Preservado:**
- `docs/tcc/rascunhos/pre-banca.backup-2026-10-27.md` — rede de segurança; não tocar.
- `~/Downloads/Muller_PreBanca_v2.pptx` — template fonte; não editar. Manipulação é apenas em memória.

---

## Task 1: Baseline — rodar script atual e confirmar que passa

**Files:**
- (nenhum arquivo tocado)

- [ ] **Step 1: Rodar self-test atual**

Comando:
```bash
python scripts/build-pre-banca.py --self-test
```
Expected: `Todos os 10 teste(s) passaram.`

- [ ] **Step 2: Rodar geração completa**

Comando:
```bash
python scripts/build-pre-banca.py
```
Expected: termina com `OK — N aviso(s), 0 erro(s). Exit code 0.` e gera `~/Downloads/pre-banca.pptx` (14 slides).

Se qualquer passo falhar aqui, **parar e investigar**. Base estável é pré-requisito.

---

## Task 2: Ampliar range do parser 14 → 16

**Files:**
- Modificar: `scripts/build-pre-banca.py:57-58`

- [ ] **Step 1: Localizar o guard do range**

Em `parse_rascunho` (linha 44), achar:
```python
if not 1 <= num <= 14:
    raise ValueError(f"Slide fora da faixa 1-14: {num}")
```

- [ ] **Step 2: Atualizar o guard para 1-16**

Substituir por:
```python
if not 1 <= num <= 16:
    raise ValueError(f"Slide fora da faixa 1-16: {num}")
```

- [ ] **Step 3: Rodar self-test**

Comando:
```bash
python scripts/build-pre-banca.py --self-test
```
Expected: `Todos os 10 teste(s) passaram.` O rascunho atual ainda tem 14 slides; o range só foi ampliado, nenhum teste quebra.

- [ ] **Step 4: Commit**

```bash
git add scripts/build-pre-banca.py
git commit -m "feat(pre-banca): parser aceita faixa 1-16 (prep. para reframe)"
```

---

## Task 3: Renomear handlers 10/11/13 → 12/13/15 e atualizar dispatch no `main`

Após o reframe, os slides atuais 10 (Resultados), 11 (Cronograma) e 13 (Referências) passam a ocupar as posições 12, 13 e 15. Renomear os handlers antes das tasks seguintes evita confusão. **Esta task deixa o self-test parcialmente quebrado** — será restaurado na Task 6. Por isso Tasks 2-6 vão num commit único no final da Task 6.

**Files:**
- Modificar: `scripts/build-pre-banca.py` (múltiplos pontos: linhas ~287, ~325, ~385 aproximadamente para handlers; ~502 para `_HEADING_IS_ORGANIZATIONAL`; ~725-747 para dispatch no `main`).

- [ ] **Step 1: Renomear `process_slide_10` → `process_slide_12`**

Localizar `def process_slide_10(slide, content, slide_width, slide_height)` (linha ~287) e trocar a assinatura para:
```python
def process_slide_12(slide, content: SlideContent, slide_width: int, slide_height: int) -> list[str]:
    """Slide 12 (ex-10 no template, agora pós-reframe): título + bullets + 2 imagens lado a lado.

    Imagens vão abaixo do body_frame, largura ≈ 11 cm cada, centradas no slide.
    slide_width/slide_height vêm do prs (int EMU).
    Fallback: se imagem não existe no filesystem, só avisa (não falha).
    """
```
O corpo da função fica igual.

- [ ] **Step 2: Renomear `process_slide_11` → `process_slide_13`**

Localizar `def process_slide_11(slide, content)` (linha ~325) e trocar a assinatura para:
```python
def process_slide_13(slide, content: SlideContent) -> list[str]:
    """Slide 13 (ex-11 no template, agora pós-reframe): adapta a tabela — remove colunas Abr/Mai/Jun/Jul/Dez,
    redistribui largura, preenche X conforme content.table_rows (header + atividades) do rascunho.
    """
```
Corpo igual.

- [ ] **Step 3: Renomear `process_slide_13` → `process_slide_15`**

Localizar `def process_slide_13(slide, content)` (handler de referências ABNT, linha ~385-aproximada; abrir arquivo e localizar) e trocar a assinatura para:
```python
def process_slide_15(slide, content: SlideContent) -> list[str]:
    """Slide 15 (ex-13 no template, agora pós-reframe): referências ABNT com itálico/negrito preservados."""
```
Corpo igual.

- [ ] **Step 4: Atualizar `_HEADING_IS_ORGANIZATIONAL`**

Em `scripts/build-pre-banca.py:502`:
```python
_HEADING_IS_ORGANIZATIONAL = {1, 2, 7, 14}
```
Substituir por:
```python
_HEADING_IS_ORGANIZATIONAL = {1, 2, 7, 16}
```
(o slide "Obrigado" migrou de 14 para 16).

- [ ] **Step 5: Atualizar sets e dispatch no `main`**

Localizar o bloco (linhas ~725-747):
```python
GENERIC_SLIDES = {3, 4, 6, 8, 9, 12}
BLOCKQUOTE_SLIDES = {1, 2, 5, 7, 14}

slide_width = prs.slide_width
slide_height = prs.slide_height

for idx, slide in enumerate(prs.slides, start=1):
    content = slides_content.get(idx)
    if content is None:
        print(f"Slide {idx}: SEM conteúdo no rascunho — mantido como no template.")
        continue
    if idx in GENERIC_SLIDES:
        logs = process_generic_slide(slide, content)
    elif idx in BLOCKQUOTE_SLIDES:
        logs = process_blockquote_slide(slide, content)
    elif idx == 10:
        logs = process_slide_10(slide, content, slide_width, slide_height)
    elif idx == 11:
        logs = process_slide_11(slide, content)
    elif idx == 13:
        logs = process_slide_13(slide, content)
    else:
        logs = [f"ERRO: slide {idx} sem handler mapeado"]
    print(f"Slide {idx}: {'; '.join(logs) if logs else '(nada)'}")
```

Substituir por:
```python
GENERIC_SLIDES = {3, 6, 8, 9, 14}
BLOCKQUOTE_SLIDES = {1, 2, 5, 7, 16}
SLIDES_WITH_IMAGE = {4, 10, 11}

slide_width = prs.slide_width
slide_height = prs.slide_height

for idx, slide in enumerate(prs.slides, start=1):
    content = slides_content.get(idx)
    if content is None:
        print(f"Slide {idx}: SEM conteúdo no rascunho — mantido como no template.")
        continue
    if idx in GENERIC_SLIDES:
        logs = process_generic_slide(slide, content)
    elif idx in BLOCKQUOTE_SLIDES:
        logs = process_blockquote_slide(slide, content)
    elif idx in SLIDES_WITH_IMAGE:
        logs = process_slide_with_image(slide, content, slide_width, slide_height)
    elif idx == 12:
        logs = process_slide_12(slide, content, slide_width, slide_height)
    elif idx == 13:
        logs = process_slide_13(slide, content)
    elif idx == 15:
        logs = process_slide_15(slide, content)
    else:
        logs = [f"ERRO: slide {idx} sem handler mapeado"]
    print(f"Slide {idx}: {'; '.join(logs) if logs else '(nada)'}")
```

Observações:
- Slide 4 saiu de `GENERIC_SLIDES` porque passa a ter imagem embutida (V1 as-is × to-be).
- Slide 12 (ex-10 Resultados) ganha handler próprio (`process_slide_12`), fora de GENERIC.
- `SLIDES_WITH_IMAGE` é um set novo que vai ser servido pelo handler criado na Task 5.

- [ ] **Step 6: Verificação sintática**

Comando:
```bash
python -c "import ast; ast.parse(open('scripts/build-pre-banca.py').read()); print('ok')"
```
Expected: `ok`

- [ ] **Step 7: Não commitar ainda**

Tasks 2-6 ficam num commit único no fim da Task 6, pra evitar baseline com testes quebrados entre commits intermediários.

---

## Task 4: Nova util `duplicate_slide_at`

Para gerar 16 slides a partir de um template de 14, precisamos clonar dois slides do template como slots-base para Arquitetura e Fluxo de emissão. python-pptx não tem API nativa de duplicação; a técnica é deep-copy do elemento XML `sld` + reinserção em `sldIdLst`.

**Files:**
- Modificar: `scripts/build-pre-banca.py` — adicionar função **antes** do comentário `# --- slide handlers ---` (linha ~169); adicionar `from copy import deepcopy` nos imports do topo se ainda não estiver.

- [ ] **Step 1: Garantir import `deepcopy`**

No topo do arquivo (perto da linha 14, onde ficam os imports), verificar se existe `from copy import deepcopy`. Se não, adicionar logo após `from dataclasses import dataclass, field`:
```python
from copy import deepcopy
```

- [ ] **Step 2: Escrever a função**

Adicionar antes de `# --- slide handlers ---`:

```python
def duplicate_slide_at(prs, source_idx: int, target_idx: int) -> None:
    """Duplica o slide em `source_idx` (0-based) e insere o duplicado em `target_idx`.

    Técnica: deep-copy do elemento XML `sld` do slide-fonte, criação de slide novo
    via add_slide(layout) e reorganização em `sldIdLst` para posicionar o duplicado
    em `target_idx`. python-pptx não oferece API nativa para isso.

    Após a chamada:
      - prs.slides[target_idx] é a cópia (shapes e layout do source).
      - Os slides que estavam em [target_idx..] movem-se um para a direita.
      - O slide original em source_idx permanece (deslocado se target_idx <= source_idx).
    """
    source_slide = prs.slides[source_idx]
    layout = source_slide.slide_layout
    new_slide = prs.slides.add_slide(layout)

    for shape in source_slide.shapes:
        new_el = deepcopy(shape.element)
        new_slide.shapes._spTree.insert_element_before(new_el, "p:extLst")

    sldIdLst = prs.slides._sldIdLst
    slides_list = list(sldIdLst)
    new_sld = slides_list[-1]
    sldIdLst.remove(new_sld)
    sldIdLst.insert(target_idx, new_sld)
```

- [ ] **Step 3: Teste manual rápido**

Criar `/tmp/_test_dup.py`:
```python
import sys
from pathlib import Path
sys.path.insert(0, str(Path.home() / "Documents/dev/tcc.easycert/scripts"))
from importlib.util import spec_from_file_location, module_from_spec
sp = spec_from_file_location("buildprebanca", Path.home() / "Documents/dev/tcc.easycert/scripts/build-pre-banca.py")
m = module_from_spec(sp)
sp.loader.exec_module(m)
from pptx import Presentation
prs = Presentation(str(m.TEMPLATE_PATH))
assert len(prs.slides) == 14, f"template deveria ter 14 slides, tem {len(prs.slides)}"
m.duplicate_slide_at(prs, source_idx=8, target_idx=9)
assert len(prs.slides) == 15
prs.save("/tmp/_test_dup.pptx")
print("OK — gerado /tmp/_test_dup.pptx com 15 slides")
```

Comando:
```bash
python /tmp/_test_dup.py
```
Expected: `OK — gerado /tmp/_test_dup.pptx com 15 slides`.

Abrir `/tmp/_test_dup.pptx` em LibreOffice Impress ou PowerPoint online e confirmar visualmente que a nova posição 10 é uma CÓPIA do slide 9 (Metodologia).

- [ ] **Step 4: Limpar o teste manual**

```bash
rm /tmp/_test_dup.py /tmp/_test_dup.pptx
```

---

## Task 5: Handler `process_slide_with_image`

Handler genérico para slides com título + bullets + 1 imagem grande centralizada. Usado nos slides 4 (V1 As-Is×To-Be), 10 (V2 Arquitetura) e 11 (V3 Fluxo). Se o arquivo da imagem não existe, loga aviso e segue sem falhar — o slide fica só com título+bullets, pronto para receber o diagrama quando desenhado.

**Files:**
- Modificar: `scripts/build-pre-banca.py` — adicionar função após `process_blockquote_slide` (linha ~269) e antes de `process_slide_12` (ex-`process_slide_10`).

- [ ] **Step 1: Escrever a função**

Adicionar logo após o `return process_generic_slide(slide, content)` que fecha `process_blockquote_slide`:

```python
def process_slide_with_image(
    slide, content: SlideContent, slide_width: int, slide_height: int
) -> list[str]:
    """Slide com título + bullets + 1 imagem grande centralizada abaixo dos bullets.

    Usado nos slides 4 (V1 As-Is × To-Be), 10 (V2 Arquitetura) e 11 (V3 Fluxo).
    Se a imagem referenciada no rascunho não existir no filesystem, loga aviso
    e deixa o slide sem imagem (placeholder visual implícito).
    """
    from pptx.util import Cm

    logs = process_generic_slide(slide, content)

    if not content.images:
        logs.append("sem imagem referenciada no rascunho")
        return logs

    _alt, path = content.images[0]
    if not Path(path).is_file():
        logs.append(
            f"AVISO: imagem placeholder não encontrada ({Path(path).name}) — "
            f"slide fica sem imagem"
        )
        return logs

    img_width = Cm(18)
    left = (slide_width - img_width) // 2
    top = int(slide_height * 0.45)
    slide.shapes.add_picture(path, left, top, width=img_width)
    logs.append(f"imagem inserida: {Path(path).name}")
    return logs
```

- [ ] **Step 2: Verificação sintática**

```bash
python -c "import ast; ast.parse(open('scripts/build-pre-banca.py').read()); print('ok')"
```
Expected: `ok`

---

## Task 6: Atualizar testes self-test para a nova numeração

**Files:**
- Modificar: `scripts/build-pre-banca.py` — bloco `_test_*` (linhas ~650-713) e lista `tests` dentro de `run_self_tests` (linha ~623-634).

- [ ] **Step 1: Substituir `_test_parse_rascunho_detecta_14_slides` por `_detecta_16_slides`**

Localizar (linha ~650):
```python
def _test_parse_rascunho_detecta_14_slides() -> None:
    slides = parse_rascunho(RASCUNHO_PATH.read_text(encoding="utf-8"))
    assert len(slides) == 14, f"esperado 14 slides, obtido {len(slides)}"
    assert set(slides.keys()) == set(range(1, 15)), f"keys: {sorted(slides.keys())}"
```
Substituir por:
```python
def _test_parse_rascunho_detecta_16_slides() -> None:
    slides = parse_rascunho(RASCUNHO_PATH.read_text(encoding="utf-8"))
    assert len(slides) == 16, f"esperado 16 slides, obtido {len(slides)}"
    assert set(slides.keys()) == set(range(1, 17)), f"keys: {sorted(slides.keys())}"
```

- [ ] **Step 2: Substituir teste do slide 10 (2 imagens) por slide 12**

Localizar (linha ~681):
```python
def _test_parse_rascunho_slide_10_tem_duas_imagens() -> None:
    slides = parse_rascunho(RASCUNHO_PATH.read_text(encoding="utf-8"))
    s10 = slides[10]
    assert len(s10.images) == 2, f"esperado 2 imagens no slide 10: {s10.images}"
    paths = [p for _, p in s10.images]
    assert all("aluno-" in p for p in paths), f"paths inesperados: {paths}"
    assert all(p.endswith(".png") for p in paths)
```
Substituir por:
```python
def _test_parse_rascunho_slide_12_tem_duas_imagens() -> None:
    slides = parse_rascunho(RASCUNHO_PATH.read_text(encoding="utf-8"))
    s12 = slides[12]
    assert len(s12.images) == 2, f"esperado 2 imagens no slide 12: {s12.images}"
    paths = [p for _, p in s12.images]
    assert all("aluno-" in p for p in paths), f"paths inesperados: {paths}"
    assert all(p.endswith(".png") for p in paths)
```

- [ ] **Step 3: Substituir teste do slide 11 (tabela) por slide 13**

Localizar (linha ~670):
```python
def _test_parse_rascunho_slide_11_tem_tabela() -> None:
    slides = parse_rascunho(RASCUNHO_PATH.read_text(encoding="utf-8"))
    s11 = slides[11]
    assert len(s11.table_rows) >= 2, "tabela do slide 11 deveria ter header + linhas"
    header = s11.table_rows[0]
    assert header == ["Atividades", "Ago", "Set", "Out", "Nov"], f"header: {header}"
    sus_row = next((r for r in s11.table_rows if "SUS" in r[0]), None)
    assert sus_row is not None, "linha SUS não encontrada"
    assert sus_row[1] == "" and sus_row[2] == "" and sus_row[3] == "X" and sus_row[4] == "X"
```
Substituir por:
```python
def _test_parse_rascunho_slide_13_tem_tabela() -> None:
    slides = parse_rascunho(RASCUNHO_PATH.read_text(encoding="utf-8"))
    s13 = slides[13]
    assert len(s13.table_rows) >= 2, "tabela do slide 13 deveria ter header + linhas"
    header = s13.table_rows[0]
    assert header == ["Atividades", "Ago", "Set", "Out", "Nov"], f"header: {header}"
    sus_row = next((r for r in s13.table_rows if "SUS" in r[0]), None)
    assert sus_row is not None, "linha SUS não encontrada"
    assert sus_row[4] == "X", "SUS deve ter X em Nov"
```

(A asserção foi relaxada para só verificar X em Nov, porque o cronograma reformado concentra SUS só em Nov — ver Task 8, slide 13.)

- [ ] **Step 4: Atualizar `_test_parse_rascunho_detecta_falta` para slide 15**

Localizar (linha ~690):
```python
def _test_parse_rascunho_detecta_falta() -> None:
    slides = parse_rascunho(RASCUNHO_PATH.read_text(encoding="utf-8"))
    s13 = slides[13]
    assert s13.has_falta, "slide 13 deveria ter has_falta=True (regulamento FMPFM)"
```
Substituir por:
```python
def _test_parse_rascunho_detecta_falta() -> None:
    slides = parse_rascunho(RASCUNHO_PATH.read_text(encoding="utf-8"))
    s15 = slides[15]
    assert s15.has_falta, "slide 15 deveria ter has_falta=True (regulamento FMPFM)"
```

- [ ] **Step 5: Adicionar 3 testes novos de slides com imagem placeholder**

Adicionar logo após `_test_parse_rascunho_slide_12_tem_duas_imagens` (ou em qualquer posição antes de `_test_parse_rascunho_detecta_falta`):

```python
def _test_parse_rascunho_slide_4_tem_uma_imagem_placeholder() -> None:
    slides = parse_rascunho(RASCUNHO_PATH.read_text(encoding="utf-8"))
    s4 = slides[4]
    assert len(s4.images) == 1, f"esperado 1 imagem no slide 4 (V1 as-is×to-be): {s4.images}"
    path = s4.images[0][1].lower()
    assert "as-is" in path or "to-be" in path, f"path inesperado para V1: {path}"


def _test_parse_rascunho_slide_10_tem_imagem_arquitetura() -> None:
    slides = parse_rascunho(RASCUNHO_PATH.read_text(encoding="utf-8"))
    s10 = slides[10]
    assert len(s10.images) == 1, f"esperado 1 imagem no slide 10 (V2 arquitetura): {s10.images}"
    assert "arquitetura" in s10.images[0][1].lower()


def _test_parse_rascunho_slide_11_tem_imagem_fluxo() -> None:
    slides = parse_rascunho(RASCUNHO_PATH.read_text(encoding="utf-8"))
    s11 = slides[11]
    assert len(s11.images) == 1, f"esperado 1 imagem no slide 11 (V3 fluxo): {s11.images}"
    path = s11.images[0][1].lower()
    assert "fluxo" in path or "emissao" in path, f"path inesperado para V3: {path}"
```

- [ ] **Step 6: Atualizar a lista `tests` dentro de `run_self_tests`**

Localizar (linha ~623-634):
```python
tests = [
    _test_parse_rascunho_detecta_14_slides,
    _test_parse_rascunho_slide_3_tem_4_bullets,
    _test_parse_rascunho_slide_1_tem_blockquote,
    _test_parse_rascunho_slide_11_tem_tabela,
    _test_parse_rascunho_slide_10_tem_duas_imagens,
    _test_parse_rascunho_detecta_falta,
    _test_strip_inline_marks_bold,
    _test_strip_inline_marks_italic,
    _test_strip_inline_marks_combined,
    _test_normalize_for_diff_whitespace,
]
```

Substituir por:
```python
tests = [
    _test_parse_rascunho_detecta_16_slides,
    _test_parse_rascunho_slide_3_tem_4_bullets,
    _test_parse_rascunho_slide_1_tem_blockquote,
    _test_parse_rascunho_slide_13_tem_tabela,
    _test_parse_rascunho_slide_12_tem_duas_imagens,
    _test_parse_rascunho_slide_4_tem_uma_imagem_placeholder,
    _test_parse_rascunho_slide_10_tem_imagem_arquitetura,
    _test_parse_rascunho_slide_11_tem_imagem_fluxo,
    _test_parse_rascunho_detecta_falta,
    _test_strip_inline_marks_bold,
    _test_strip_inline_marks_italic,
    _test_strip_inline_marks_combined,
    _test_normalize_for_diff_whitespace,
]
```

- [ ] **Step 7: Rodar self-test**

Comando:
```bash
python scripts/build-pre-banca.py --self-test
```
Expected: **os 7 testes de parsing dependentes do rascunho falham** com `AssertionError` (`detecta_16_slides`, `slide_12_tem_duas_imagens`, `slide_13_tem_tabela`, `slide_4_tem_uma_imagem_placeholder`, `slide_10_tem_imagem_arquitetura`, `slide_11_tem_imagem_fluxo`, `detecta_falta`), porque o rascunho ainda é a versão de 14 slides. Os outros 6 testes passam (`slide_3_tem_4_bullets`, `slide_1_tem_blockquote`, 3× `strip_inline_marks`, `normalize_for_diff_whitespace`).

Isso é **esperado** — vai ser corrigido na Task 8.

Confirmar que:
- O self-test executa sem `NameError` nem `ImportError`.
- As falhas são todas `AssertionError`, não erros estruturais.

- [ ] **Step 8: Commit das Tasks 2-6 juntas**

```bash
git add scripts/build-pre-banca.py
git commit -m "feat(pre-banca): script suporta 16 slides (handlers 12/13/15 + duplicate_slide_at + process_slide_with_image + testes atualizados)"
```

---

## Task 7: Chamar `duplicate_slide_at` no boot do `main`

**Files:**
- Modificar: `scripts/build-pre-banca.py:722-724` (área onde `prs = Presentation(...)` é inicializado dentro do `main`).

- [ ] **Step 1: Localizar o boot do main**

Em `def main()` (linha ~716), localizar:
```python
slides_content = parse_rascunho(RASCUNHO_PATH.read_text(encoding="utf-8"))
prs = Presentation(str(TEMPLATE_PATH))
```

- [ ] **Step 2: Inserir duplicação logo após a criação do `prs`**

Após `prs = Presentation(str(TEMPLATE_PATH))` e antes da linha `GENERIC_SLIDES = ...`, inserir:
```python
# Expansão para 16 slides: o template Muller tem 14. Duplicamos duas vezes o layout
# do slide 9 (Metodologia — título + bullets) para criar os slots 10 (Arquitetura)
# e 11 (Fluxo de emissão). O conteúdo é substituído pelos handlers abaixo.
# source_idx=8 (0-based) = slide 9. target_idx=9 insere no slot 10 (1-based).
# A segunda chamada repete para o slot 11.
# Após as duplicações: slides originais 10..14 ficam deslocados para 12..16.
duplicate_slide_at(prs, source_idx=8, target_idx=9)
duplicate_slide_at(prs, source_idx=8, target_idx=10)
assert len(prs.slides) == 16, f"após duplicação esperávamos 16 slides, temos {len(prs.slides)}"
```

- [ ] **Step 3: Verificação com `--inspect`**

Comando:
```bash
python scripts/build-pre-banca.py --inspect | grep -c '=== Slide'
```
Expected: `16`

- [ ] **Step 4: Não commitar ainda** — depende da Task 8 (rascunho) para o main rodar fim-a-fim sem erro.

---

## Task 8: Reescrita integral de `docs/tcc/rascunhos/pre-banca.md`

**Files:**
- Modificar: `docs/tcc/rascunhos/pre-banca.md` (substituição completa).

- [ ] **Step 1: Confirmar backup**

Comando:
```bash
ls -la docs/tcc/rascunhos/pre-banca.backup-2026-10-27.md
```
Expected: arquivo existe, ~9.8K.

Rede de segurança: se algo der muito errado, restaure com:
```bash
cp docs/tcc/rascunhos/pre-banca.backup-2026-10-27.md docs/tcc/rascunhos/pre-banca.md
```

- [ ] **Step 2: Substituir o conteúdo integralmente**

Escrever `docs/tcc/rascunhos/pre-banca.md` com o conteúdo abaixo (literal, incluindo frontmatter):

````markdown
---
tipo: rascunho
status: v2-reframe
---

# TCC — Pré-banca (rascunho — reframe 2026-10-27)

Esqueleto dos 16 slides da pré-banca sob o reframe para emissão + validação de certificados. Formato compatível com o script `scripts/build-pre-banca.py` (dispatch por `## Slide N — ...`). Imagens dos slides 4, 10 e 11 são placeholders — arquivos a desenhar depois; se ausentes, o build loga aviso e segue.

Spec: [[superpowers/specs/2026-10-27-pre-banca-reframe-certificados-design]].

---

## Slide 1 — Capa

> **Desenvolvimento de uma Plataforma Web para Emissão e Validação de Certificados Acadêmicos, Baseada em Desenvolvimento Acelerado**
>
> Discente: Pedro Henrique Teixeira
> Orientador: Prof. Robson Leandro Carvalho Canato

## Slide 2 — Instituição

> GRADUAÇÃO EM CIÊNCIA DA COMPUTAÇÃO
> Faculdade Municipal Professor Franco Montoro — FMPFM

## Slide 3 — Introdução · Contextualização

- As **atividades complementares** são componente curricular obrigatório na educação superior brasileira (Diretrizes Curriculares Nacionais, CNE/CES).
- O **certificado** é o instrumento concreto que comprova essas atividades — tanto o que a **IES emite** (eventos próprios: palestras, oficinas, semanas acadêmicas) quanto o que o **aluno traz de fora** (cursos, voluntariado, representação estudantil).
- A integralização desses certificados em carga horária é **condição para colação de grau**.
- Em IES de pequeno e médio porte, a gestão do ciclo de vida do certificado — **emitir, receber, validar, consolidar** — permanece **manual**.

## Slide 4 — Problema · As-Is × To-Be

- **Duas pontas, uma dor comum:** falta de ciclo digital do certificado.
- Aluno **descobre lacunas no fechamento curricular** às vésperas da colação.

![Diagrama As-Is vs To-Be — duas pontas (emissão/recepção), dois estados (hoje/plataforma)](./img/as-is-vs-to-be.png)

## Slide 5 — Pergunta de pesquisa

> _Substitui "Hipótese" do template de Muller — a pesquisa é aplicada, não hipotético-dedutiva._

- É possível **automatizar o ciclo de vida do certificado acadêmico** na FMPFM — **emissão** para eventos próprios e **validação** de certificados externos — por meio de uma plataforma web construída com **desenvolvimento acelerado em stack moderna**, **reduzindo latência e retrabalho** e mantendo níveis adequados de usabilidade para alunos e coordenadores?

## Slide 6 — Justificativa

- Digitalização de fluxos acadêmicos é vetor reconhecido de **ganho de eficiência e transparência** em secretarias (literatura de BPM/BPA em IES).
- A **ausência de emissão oficial** de certificados em eventos próprios de IES de pequeno/médio porte tira do aluno a prova material da própria formação — vazio documental com consequência direta no fechamento curricular.
- Frameworks modernos (NestJS, Next.js, Prisma, Postgres) permitem **protótipos funcionais em prazo acadêmico** sem abrir mão de qualidade técnica.
- Trabalhos correlatos cobrem **partes isoladas** do problema — faltam soluções **integradas** tratando emissão **e** validação sob o mesmo ciclo, com **avaliação formal de usabilidade**.

## Slide 7 — Objetivos · Geral

> **Objetivo Geral**
> Desenvolver e avaliar um protótipo de plataforma web para **emissão de certificados de eventos próprios** e **validação de certificados externos** no âmbito das atividades complementares, tomando como estudo de caso o curso de Ciência da Computação da FMPFM.

## Slide 8 — Objetivos · Específicos

- **Mapear** o fluxo vigente (As-Is) de **emissão** e de **recepção/validação** de certificados na FMPFM e definir a matriz de regras por categoria.
- **Prototipar** a arquitetura utilizando desenvolvimento acelerado com stack moderna (NestJS, Next.js, Prisma, PostgreSQL).
- **Implementar** os módulos de emissão (eventos, participantes, geração de PDF), recepção (submissão de certificados externos), avaliação (revisão pela coordenação, aplicação da matriz), consolidação (carga horária) e emissão de documentos oficiais.
- **Avaliar** o protótipo quanto à usabilidade (SUS) e ao desempenho operacional — latência As-Is × To-Be, medida separadamente para emissão e para validação.

## Slide 9 — Metodologia

- **Tipo de pesquisa:** aplicada, quanti-qualitativa, experimental, estudo de caso.
- **Fase 1 — Levantamento:** mapeamento As-Is das duas pontas (emissão e recepção), regulamento, requisitos funcionais e não funcionais.
- **Fase 2 — Modelagem:** schema Prisma, arquitetura em módulos, definição de papéis (aluno, coordenação).
- **Fase 3 — Prototipagem acelerada:** interfaces (Next.js) e automações (NestJS) em ciclos curtos.
- **Fase 4 — Avaliação:** usabilidade (SUS, 10 itens Likert; faixa ≥ 68 = acima da média) + medição de latência As-Is × To-Be em dois cenários (emissão de certificado em evento próprio; validação de certificado externo).

## Slide 10 — Arquitetura

- **Separação estrita `web ↔ api`:** interface não acessa banco; API não serve HTML.
- **Dois caminhos para o certificado**: um emitido pela FMPFM, outro trazido pelo aluno — convergem no mesmo ciclo de validação.

![Arquitetura — Next.js (web) ↔ NestJS (api) ↔ PostgreSQL + MinIO/S3; dois caminhos para o certificado](./img/arquitetura.png)

## Slide 11 — Fluxo caminho feliz da emissão

- Ramificações (reemissão, correção) tratadas no sistema mas fora deste slide.

![Fluxo de emissão — 6 passos: evento → participantes → PDF → storage → notificação → horas](./img/fluxo-emissao.png)

## Slide 12 — Resultados preliminares

> _Qualificação — protótipo em andamento, SUS/As-Is ainda não executados._

- **Mapeamento As-Is da FMPFM concluído** — baseline documentado para a Fase 4.
- **Schema de dados modelado** em Prisma 6 (usuários, submissões, documentos, categorias, matriz, eventos, auditoria).
- **Backend NestJS 11** — 9 módulos; fluxo de **recepção e validação** ponta a ponta, com máquina de estados da submissão formalmente definida (`AWAITING_UPLOAD → PENDING → UNDER_REVIEW → APPROVED | REJECTED | CORRECTION_REQUESTED`).
- **Upload direto ao storage** via POST policy (RF-06).
- **Portal do aluno** (Next.js 15 + React 19): autenticação real, half-circle de progresso, consumo de `GET /categorias`.
- **Em desenvolvimento até a defesa:** módulo de **emissão** (eventos → geração de PDF → portal do aluno).
- ![Home do aluno — cards de nova submissão e minhas submissões](./img/aluno-home.png)
- ![Histórico de submissões do aluno — status "Aguardando revisão" e "Aguardando upload"](./img/aluno-submissoes.png)

## Slide 13 — Cronograma

| Atividades | Ago | Set | Out | Nov |
|---|:-:|:-:|:-:|:-:|
| Levantamento de requisitos / regulamento | X | | | |
| Modelagem de dados e arquitetura | X | X | | |
| Prototipagem — recepção e validação | X | X | X | |
| Prototipagem — emissão de certificados | | | X | X |
| Testes de usabilidade (SUS) | | | | X |
| Medição As-Is × To-Be (emissão e validação) | | | | X |
| Escrita — Introdução e Fundamentação | X | | | |
| Escrita — Metodologia | | X | | |
| Escrita — Resultados e discussão | | | X | X |
| Considerações finais / revisão ABNT | | | | X |
| Preparação da banca | | | X | X |

## Slide 14 — Considerações parciais

- O mapeamento do As-Is confirmou **duas dores no ciclo de vida do certificado**: emissão ausente em eventos próprios da FMPFM e validação lenta de certificados externos.
- A opção por **stack moderna como "desenvolvimento acelerado"** se mostrou viável em prazo acadêmico — fluxo de recepção/validação entregue em 2 meses (9 módulos backend + portal do aluno).
- Decisões estruturantes consolidadas: separação estrita `web ↔ api`, `AuditLog` append-only, upload direto ao storage via POST policy.
- **Próximos passos até a defesa:** implementar o módulo de **emissão** (eventos → PDF → portal), executar SUS e medir As-Is × To-Be **nos dois cenários**.

## Slide 15 — Referências

Referências levantadas em 2026-10-23 para a pré-banca (Portaria 554/2019 destacada no reframe pela relevância à emissão oficial):

- BRASIL. Ministério da Educação. **Portaria nº 554, de 11 de março de 2019**. Dispõe sobre a emissão e o registro de diploma de graduação por meio digital pelas IES pertencentes ao Sistema Federal de Ensino. Diário Oficial da União: seção 1, Brasília, DF, 12 mar. 2019. Disponível em: https://www.in.gov.br/materia/-/asset_publisher/Kujrw0TZC2Mb/content/id/66544171/do1-2019-03-12-portaria-n-554-de-11-de-marco-de-2019-66543842. Acesso em: 23 out. 2026.
- BALDOW, Samuel Rodrigues et al. Low-Code e No-Code: democratizando o desenvolvimento de software. **REMUNOM: Revista Multidisciplinar do Nordeste Mineiro**, v. 11, n. 1, 2024. DOI: https://doi.org/10.61164/rmnm.v11i1.3032. Acesso em: 23 out. 2026.
- BRASIL. Ministério da Educação. Conselho Nacional de Educação. Câmara de Educação Superior. **Resolução CNE/CES nº 5, de 16 de novembro de 2016**. Institui as Diretrizes Curriculares Nacionais para os cursos de graduação na área da Computação. Diário Oficial da União: seção 1, Brasília, DF, 17 nov. 2016. Disponível em: https://abmes.org.br/arquivos/legislacoes/Res-CES-CNE-005-2016-11-16.pdf. Acesso em: 23 out. 2026.
- BROOKE, John. SUS: a "quick and dirty" usability scale. In: JORDAN, P. W. et al. (Ed.). **Usability Evaluation in Industry**. London: Taylor & Francis, 1996. p. 189-194.
- CARVALHO, Mariana Freitas Canielo de; AGANETTE, Elisângela Cristina; MACULAN, Benildes Coura Moreira dos Santos. BPM Acadêmico: uma metodologia para modelagem de processos em IES. **RDBCI: Revista Digital de Biblioteconomia e Ciência da Informação**, Campinas, v. 24, 2026. DOI: https://doi.org/10.20396/rdbci.v24i00.8680182. Disponível em: https://www.scielo.br/j/rdbci/a/K8JdxBsTTx6RdgsZgthSgCF/. Acesso em: 23 out. 2026.
- TOLEDO, Paulo Donizete Alves de; SIRQUEIRA, Tassio Ferenzini Martins. Horas complementares: um aplicativo de gestão de atividades acadêmicas. **Caderno de Estudos em Sistemas de Informação**, v. 8, n. 1, p. 1-12, 2021. DOI: https://doi.org/10.5281/zenodo.15042181. Disponível em: https://zenodo.org/records/15042181. Acesso em: 23 out. 2026.
- `[FALTA]` Regulamento oficial de horas complementares da FMPFM (quando obtido).

## Slide 16 — Obrigado

> **Obrigado!**
> Pedro Henrique Teixeira — ph.teixeira.ph2020@gmail.com

---

## Como regerar o arquivo .pptx

Pré-requisito único: `pip install --user python-pptx`.

Para gerar (ou regerar após editar este rascunho) a apresentação:

```bash
python scripts/build-pre-banca.py
```

O arquivo gerado é `~/Downloads/pre-banca.pptx`. O script preserva o visual do template `Muller_PreBanca_v2.pptx`, duplica dois slots a partir do layout do slide 9 (Metodologia) para acomodar Arquitetura e Fluxo, e roda uma verificação por diff rascunho × pptx no final.

Lacunas `[FALTA: ...]` ficam em branco no slide — rastreio em [[dominio/pendencias]]. Imagens placeholder dos slides 4/10/11 (V1/V2/V3) ficam ausentes até serem desenhadas — build loga aviso e segue, sem falhar.

**Spec:** [[superpowers/specs/2026-10-27-pre-banca-reframe-certificados-design]].

---

## Notas relacionadas

- [[tcc/visao-geral]] — identificação, objetivos e título do TCC.
- [[tcc/estrutura-artigo]] — estrutura canônica das 5 seções do artigo.
- [[tcc/metodologia]] — detalhamento do método (fases, SUS, As-Is × To-Be nos dois cenários).
- [[tcc/cronograma]] — plano temporal de 5 meses.
- [[tcc/rascunhos/01-introducao]] — rascunho da introdução.
- [[tcc/trabalhos-correlatos]] — material da seção 2 (impacta slide 15 Referências).
- [[tcc/rascunhos/pre-banca.backup-2026-10-27]] — backup pré-reframe.
````

- [ ] **Step 3: Rodar self-test com o rascunho novo**

Comando:
```bash
python scripts/build-pre-banca.py --self-test
```
Expected: `Todos os 13 teste(s) passaram.`

Se algum teste falhar: a mensagem aponta o slide; comparar com o conteúdo literal acima e ajustar.

---

## Task 9: Build end-to-end e verificação visual

**Files:**
- (nenhum arquivo tocado — só execução)

- [ ] **Step 1: Gerar o `.pptx` completo**

Comando:
```bash
python scripts/build-pre-banca.py
```
Expected:
- 16 linhas `Slide N: ...` no stdout, N de 1 a 16.
- Slides 4, 10 e 11 reportam `AVISO: imagem placeholder não encontrada` (as 3 imagens V1/V2/V3 ainda não foram desenhadas).
- Linha final: `OK — N aviso(s), 0 erro(s). Exit code 0.`
- Arquivo `~/Downloads/pre-banca.pptx` gerado.

- [ ] **Step 2: Confirmar número de slides**

Comando:
```bash
python scripts/build-pre-banca.py --inspect | grep -c '=== Slide'
```
Expected: `16`

- [ ] **Step 3: Abertura visual**

Abrir `~/Downloads/pre-banca.pptx` em LibreOffice Impress ou PowerPoint online. Confirmar:
- Slide 1: título novo "Emissão e Validação de Certificados Acadêmicos".
- Slide 4: 2 bullets de dor; sem imagem (placeholder vazio é esperado).
- Slides 10 e 11: título + bullets curtos; sem imagem.
- Slide 12: screenshots do portal (`aluno-home.png` + `aluno-submissoes.png`) presentes.
- Slide 13: tabela de cronograma com linhas "Prototipagem — recepção e validação" e "Prototipagem — emissão de certificados" visíveis; SUS e Medição apenas em Nov.
- Slide 15: lista de referências ABNT.
- Slide 16: "Obrigado! Pedro…".

Se qualquer slide estiver visualmente quebrado (shapes sobrepostos, texto cortado), investigar: possivelmente a duplicação do slide 9 trouxe elementos indesejados — ajustar `duplicate_slide_at` ou escolher outro slide-fonte (ex.: slide 6 Justificativa).

- [ ] **Step 4: Commit das Tasks 7-9**

```bash
git add scripts/build-pre-banca.py docs/tcc/rascunhos/pre-banca.md
git commit -m "feat(pre-banca): reframe para 16 slides (certificados — emissão + validação)"
```

---

## Task 10: Documentar execução no vault

**Files:**
- (via docs-curator)

- [ ] **Step 1: Delegar ao docs-curator**

Pedir que atualize no vault:
1. **Status da spec** `docs/superpowers/specs/2026-10-27-pre-banca-reframe-certificados-design.md`: trocar `Status: Aprovada pelo autor em 2026-10-27 — pronta para execução via writing-plans.` por `Status: Executada em <data-de-hoje>. Rascunho e script atualizados; três placeholders de imagem (V1/V2/V3) permanecem pendentes.`
2. **Pendências em `docs/dominio/pendencias.md`**:
   - Marcar como **resolvidas** (riscar ou mover para seção "Resolvidas") os itens: *"Reescrita de `docs/tcc/rascunhos/pre-banca.md`"* e *"Extensão de `scripts/build-pre-banca.py`"*.
   - Manter abertas: *"Confirmação formal do novo título com o orientador Prof. Robson"*, *"Diagrama de arquitetura (V2)"*, *"Diagrama de fluxo de emissão (V3)"*, *"Literatura: emissão/assinatura digital de certificados em IES"*. **Adicionar nova pendência** se ainda não existir: *"Diagrama As-Is × To-Be (V1, slide 4)"* — foi criada implicitamente pelo plano mas não estava na seção 5 da spec original.

- [ ] **Step 2: Aguardar proposta do curator, levar ao autor, aprovar e aplicar**

Fluxo normal: curator propõe → autor revisa → curator aplica.

- [ ] **Step 3: Commit da documentação**

```bash
git add docs/
git commit -m "docs: registra execução do reframe da pré-banca (16 slides)"
```

---

## Resumo de commits previstos

1. `feat(pre-banca): parser aceita faixa 1-16 (prep. para reframe)` — Task 2.
2. `feat(pre-banca): script suporta 16 slides (handlers 12/13/15 + duplicate_slide_at + process_slide_with_image + testes atualizados)` — Tasks 3-6.
3. `feat(pre-banca): reframe para 16 slides (certificados — emissão + validação)` — Tasks 7-9.
4. `docs: registra execução do reframe da pré-banca (16 slides)` — Task 10.
