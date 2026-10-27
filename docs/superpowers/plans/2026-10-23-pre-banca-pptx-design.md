# Plano de Implementação — Geração automatizada do PPTX da pré-banca

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gerar `~/Downloads/pre-banca.pptx` a partir do template `Muller_PreBanca_v2.pptx` e do rascunho [[tcc/rascunhos/pre-banca]], preservando 100% do visual do template e substituindo apenas texto/imagens/tabela do cronograma.

**Architecture:** Script Python stand-alone em `scripts/build-pre-banca.py`. Único arquivo: parser do rascunho (puro), handlers por slide (manipulam `python-pptx`), verificação por diff. Testes unitários inline executados via flag `--self-test` (sem `pytest`, sem novas deps além de `python-pptx`). Nada toca o monorepo TypeScript — isolado do runtime do produto.

**Tech Stack:** Python 3 (stdlib: `re`, `pathlib`, `dataclasses`, `argparse`, `sys`), `python-pptx` (`pip install --user python-pptx`). Nada de pytest, nada de pacote.

**Spec de origem:** [[superpowers/specs/2026-10-23-pre-banca-pptx-design]].

---

## Estrutura de arquivos

| Arquivo | Papel |
|---|---|
| `scripts/build-pre-banca.py` (novo) | Script único: pre-flight, parser, handlers de slide, diff, self-tests. |
| `scripts/.gitkeep` (não criar) | Diretório já versionado com o script. |

Nenhum outro arquivo. Testes vivem **dentro** do próprio script, atrás do flag `--self-test`.

**Fora do repo (apenas lidos/escritos):**
- `/home/texera/Downloads/Muller_PreBanca_v2.pptx` (template, só leitura)
- `~/Downloads/pre-banca.pptx` (saída, só escrita — ignorado pelo git por estar fora)
- `docs/tcc/rascunhos/pre-banca.md` (só leitura, fonte do conteúdo)
- `docs/tcc/rascunhos/img/aluno-home.png` e `aluno-submissoes.png` (só leitura)

---

## Task 1: Bootstrap do script + pre-flight + CLI

**Files:**
- Create: `scripts/build-pre-banca.py`

- [ ] **Step 1: Criar o script com estrutura esqueleto, pre-flight e CLI**

```python
#!/usr/bin/env python3
"""Gera ~/Downloads/pre-banca.pptx a partir do template Muller e de docs/tcc/rascunhos/pre-banca.md.

Uso:
    python scripts/build-pre-banca.py              # gera o pptx
    python scripts/build-pre-banca.py --self-test  # roda testes unitários
    python scripts/build-pre-banca.py --inspect    # imprime estrutura do template
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
TEMPLATE_PATH = Path.home() / "Downloads" / "Muller_PreBanca_v2.pptx"
RASCUNHO_PATH = REPO_ROOT / "docs" / "tcc" / "rascunhos" / "pre-banca.md"
OUTPUT_PATH = Path.home() / "Downloads" / "pre-banca.pptx"
IMG_BASE_DIR = RASCUNHO_PATH.parent


def check_dependencies() -> None:
    try:
        import pptx  # noqa: F401
    except ImportError:
        sys.exit(
            "Erro: biblioteca 'python-pptx' não encontrada.\n"
            "Instale com: pip install --user python-pptx"
        )


def check_files_exist() -> None:
    if not TEMPLATE_PATH.is_file():
        sys.exit(f"Erro: template não encontrado em {TEMPLATE_PATH}.\n"
                 f"Coloque o arquivo Muller_PreBanca_v2.pptx em ~/Downloads/.")
    if not RASCUNHO_PATH.is_file():
        sys.exit(f"Erro: rascunho não encontrado em {RASCUNHO_PATH}.")


def inspect_template() -> int:
    raise NotImplementedError("Task 2")


def run_self_tests() -> int:
    print("Nenhum self-test registrado ainda.")
    return 0


def main() -> int:
    check_dependencies()
    check_files_exist()
    print(f"Pre-flight OK. Template: {TEMPLATE_PATH}")
    print(f"Rascunho: {RASCUNHO_PATH}")
    print("(pipeline ainda não implementado)")
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--self-test", action="store_true", help="Roda testes unitários inline.")
    parser.add_argument("--inspect", action="store_true", help="Imprime estrutura do template.")
    args = parser.parse_args()
    if args.self_test:
        sys.exit(run_self_tests())
    if args.inspect:
        sys.exit(inspect_template())
    sys.exit(main())
```

- [ ] **Step 2: Instalar a dependência e rodar o script**

```bash
pip install --user python-pptx
chmod +x scripts/build-pre-banca.py
python scripts/build-pre-banca.py
```

Expected output:
```
Pre-flight OK. Template: /home/texera/Downloads/Muller_PreBanca_v2.pptx
Rascunho: /home/texera/Documents/dev/tcc.easycert/docs/tcc/rascunhos/pre-banca.md
(pipeline ainda não implementado)
```

- [ ] **Step 3: Rodar `--self-test` para validar harness vazia**

```bash
python scripts/build-pre-banca.py --self-test
```

Expected output:
```
Nenhum self-test registrado ainda.
```
Exit code: 0.

- [ ] **Step 4: Commit**

```bash
git add scripts/build-pre-banca.py
git commit -m "feat(pre-banca): bootstrap script com pre-flight e CLI"
```

---

## Task 2: `--inspect` — enumerar estrutura do template

Objetivo: ter saída estável que lista, para cada slide (1–14), as `shapes`, texto corrente de cada `text_frame` e, no slide 11, as colunas da tabela. Isso é o insumo para os handlers.

**Files:**
- Modify: `scripts/build-pre-banca.py` (função `inspect_template`)

- [ ] **Step 1: Implementar `inspect_template`**

Substituir o corpo da função (que hoje levanta `NotImplementedError`) por:

```python
def inspect_template() -> int:
    from pptx import Presentation

    prs = Presentation(str(TEMPLATE_PATH))
    for idx, slide in enumerate(prs.slides, start=1):
        print(f"\n=== Slide {idx} ===")
        for shape_idx, shape in enumerate(slide.shapes):
            kind = type(shape).__name__
            name = getattr(shape, "name", "?")
            print(f"  [{shape_idx}] {kind} name={name!r}")
            if shape.has_text_frame:
                for p_idx, para in enumerate(shape.text_frame.paragraphs):
                    text = "".join(r.text for r in para.runs)
                    print(f"      para[{p_idx}]: {text!r}")
            if shape.has_table:
                table = shape.table
                print(f"      table rows={len(table.rows)} cols={len(table.columns)}")
                for r_idx, row in enumerate(table.rows):
                    cells = [cell.text_frame.text for cell in row.cells]
                    print(f"      row[{r_idx}]: {cells!r}")
    return 0
```

- [ ] **Step 2: Rodar `--inspect` e salvar a saída para referência**

```bash
python scripts/build-pre-banca.py --inspect > /tmp/muller-inspect.txt
head -80 /tmp/muller-inspect.txt
```

Expected: 14 blocos "=== Slide N ===", cada um listando shapes com nome e texto. **Anote mentalmente ou copie:**
- Nomes de shape que carregam título vs. corpo em cada slide (ex.: `"Title 1"`, `"Content Placeholder 2"`).
- Texto atual do slide 5 (deve conter "Hipótese").
- Estrutura da tabela do slide 11: número de linhas, número de colunas, header atual (deve ter Abr, Mai, Jun, Jul, Ago, Set, Out, Nov, Dez).

Se qualquer um desses não bater com a spec, **parar e reportar antes de prosseguir**.

- [ ] **Step 3: Commit**

```bash
git add scripts/build-pre-banca.py
git commit -m "feat(pre-banca): --inspect dump da estrutura do template"
```

---

## Task 3: Parser do rascunho + harness de self-tests

**Files:**
- Modify: `scripts/build-pre-banca.py`

- [ ] **Step 1: Escrever teste falhando para `parse_rascunho`**

Adicionar no final do arquivo (antes do `if __name__`), numa seção `# --- parser ---` nova, mais tarde — primeiro, atualizar `run_self_tests()`:

```python
def run_self_tests() -> int:
    tests = [
        _test_parse_rascunho_detecta_14_slides,
        _test_parse_rascunho_slide_3_tem_4_bullets,
        _test_parse_rascunho_slide_1_tem_blockquote,
        _test_parse_rascunho_slide_11_tem_tabela,
        _test_parse_rascunho_slide_10_tem_duas_imagens,
        _test_parse_rascunho_detecta_falta,
    ]
    failures: list[str] = []
    for test in tests:
        try:
            test()
            print(f"  OK  {test.__name__}")
        except AssertionError as exc:
            failures.append(f"FAIL {test.__name__}: {exc}")
            print(f"  FAIL {test.__name__}: {exc}")
    if failures:
        print(f"\n{len(failures)} teste(s) falharam.")
        return 1
    print(f"\nTodos os {len(tests)} teste(s) passaram.")
    return 0


def _test_parse_rascunho_detecta_14_slides() -> None:
    slides = parse_rascunho(RASCUNHO_PATH.read_text(encoding="utf-8"))
    assert len(slides) == 14, f"esperado 14 slides, obtido {len(slides)}"
    assert set(slides.keys()) == set(range(1, 15)), f"keys: {sorted(slides.keys())}"


def _test_parse_rascunho_slide_3_tem_4_bullets() -> None:
    slides = parse_rascunho(RASCUNHO_PATH.read_text(encoding="utf-8"))
    s3 = slides[3]
    assert len(s3.bullets) == 4, f"esperado 4 bullets no slide 3, obtido {len(s3.bullets)}"
    assert "atividades complementares" in s3.bullets[0]


def _test_parse_rascunho_slide_1_tem_blockquote() -> None:
    slides = parse_rascunho(RASCUNHO_PATH.read_text(encoding="utf-8"))
    s1 = slides[1]
    assert len(s1.blockquote) >= 3, f"blockquote do slide 1 deveria ter >=3 linhas: {s1.blockquote}"
    assert "Pedro Henrique Teixeira" in "\n".join(s1.blockquote)


def _test_parse_rascunho_slide_11_tem_tabela() -> None:
    slides = parse_rascunho(RASCUNHO_PATH.read_text(encoding="utf-8"))
    s11 = slides[11]
    assert len(s11.table_rows) >= 2, "tabela do slide 11 deveria ter header + linhas"
    header = s11.table_rows[0]
    assert header == ["Atividades", "Ago", "Set", "Out", "Nov"], f"header: {header}"
    # Linha "Testes de usabilidade (SUS)" tem X em Out e Nov
    sus_row = next((r for r in s11.table_rows if "SUS" in r[0]), None)
    assert sus_row is not None, "linha SUS não encontrada"
    assert sus_row[1] == "" and sus_row[2] == "" and sus_row[3] == "X" and sus_row[4] == "X"


def _test_parse_rascunho_slide_10_tem_duas_imagens() -> None:
    slides = parse_rascunho(RASCUNHO_PATH.read_text(encoding="utf-8"))
    s10 = slides[10]
    assert len(s10.images) == 2, f"esperado 2 imagens no slide 10: {s10.images}"
    paths = [p for _, p in s10.images]
    assert all("aluno-" in p for p in paths), f"paths inesperados: {paths}"
    # paths devem apontar para docs/tcc/rascunhos/img/*.png (absolutos ou relativos ao repo)
    assert all(p.endswith(".png") for p in paths)


def _test_parse_rascunho_detecta_falta() -> None:
    slides = parse_rascunho(RASCUNHO_PATH.read_text(encoding="utf-8"))
    s13 = slides[13]
    assert s13.has_falta, "slide 13 deveria ter has_falta=True (regulamento FMPFM)"
```

- [ ] **Step 2: Rodar e verificar que falham**

```bash
python scripts/build-pre-banca.py --self-test
```

Expected: `NameError: parse_rascunho is not defined` (ou similar — função ainda não existe), exit code 1.

- [ ] **Step 3: Implementar `SlideContent` e `parse_rascunho`**

Adicionar no topo (depois dos imports), uma nova seção `# --- parser ---`:

```python
import re
from dataclasses import dataclass, field


@dataclass
class SlideContent:
    number: int
    heading: str                             # texto após "## Slide N — "
    bullets: list[str] = field(default_factory=list)
    paragraphs: list[str] = field(default_factory=list)
    blockquote: list[str] = field(default_factory=list)
    table_rows: list[list[str]] = field(default_factory=list)
    images: list[tuple[str, str]] = field(default_factory=list)  # (alt, resolved_absolute_path)
    has_falta: bool = False


_SLIDE_HEADER_RE = re.compile(r"^## Slide (\d{1,2})\s*(?:—|-)\s*(.*)$")
_IMAGE_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")


def parse_rascunho(markdown: str) -> dict[int, SlideContent]:
    """Parse docs/tcc/rascunhos/pre-banca.md em dict {slide_num: SlideContent}.

    Regras documentadas na spec seção 2.9.
    """
    slides: dict[int, SlideContent] = {}
    current: SlideContent | None = None

    for raw_line in markdown.splitlines():
        line = raw_line.rstrip()
        header = _SLIDE_HEADER_RE.match(line)
        if header:
            num = int(header.group(1))
            if not 1 <= num <= 14:
                raise ValueError(f"Slide fora da faixa 1-14: {num}")
            current = SlideContent(number=num, heading=header.group(2).strip())
            slides[num] = current
            continue
        if current is None:
            continue
        if line.startswith("## ") or line.startswith("# "):
            # Encerrou os slides (ex.: "## Como regerar..."): seções não-slide são ignoradas.
            current = None
            continue
        if "[FALTA" in line:
            current.has_falta = True
        # Imagens: coletar e NÃO adicionar a bullet/paragraph.
        for alt, path in _IMAGE_RE.findall(line):
            resolved = _resolve_image_path(path)
            current.images.append((alt, resolved))
        stripped = line.strip()
        if not stripped:
            continue
        if stripped.startswith("|"):
            cells = [c.strip() for c in stripped.strip("|").split("|")]
            # Pular linha separadora "|---|---|..."
            if all(set(c) <= set("-: ") for c in cells):
                continue
            current.table_rows.append(cells)
        elif stripped.startswith("> "):
            current.blockquote.append(stripped[2:].strip())
        elif stripped.startswith(">"):
            current.blockquote.append("")  # linha "> " vazia
        elif stripped.startswith("- "):
            # Se a linha é SÓ imagem (ex: "- ![alt](path)"), já foi coletada; não vira bullet.
            without_img = _IMAGE_RE.sub("", stripped[2:]).strip()
            if without_img:
                current.bullets.append(without_img)
        else:
            # Parágrafo corrido
            current.paragraphs.append(stripped)

    return slides


def _resolve_image_path(path: str) -> str:
    p = Path(path)
    if not p.is_absolute():
        p = (IMG_BASE_DIR / path).resolve()
    return str(p)
```

- [ ] **Step 4: Rodar self-test e verificar que passa**

```bash
python scripts/build-pre-banca.py --self-test
```

Expected: todos os 6 testes com `OK`, exit code 0.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-pre-banca.py
git commit -m "feat(pre-banca): parser do rascunho (SlideContent + parse_rascunho) com self-tests"
```

---

## Task 4: Helpers de texto — strip de marcação inline + replace preservando runs

**Files:**
- Modify: `scripts/build-pre-banca.py`

- [ ] **Step 1: Escrever testes falhando**

Adicionar a `run_self_tests()` (dentro da lista `tests`):

```python
        _test_strip_inline_marks_bold,
        _test_strip_inline_marks_italic,
        _test_strip_inline_marks_combined,
        _test_normalize_for_diff_whitespace,
```

E adicionar as funções de teste:

```python
def _test_strip_inline_marks_bold() -> None:
    assert strip_inline_marks("**oi**") == "oi"
    assert strip_inline_marks("palavra **destacada** aqui") == "palavra destacada aqui"


def _test_strip_inline_marks_italic() -> None:
    assert strip_inline_marks("*oi*") == "oi"
    assert strip_inline_marks("_oi_") == "oi"


def _test_strip_inline_marks_combined() -> None:
    assert strip_inline_marks("***oi***") == "oi"
    assert strip_inline_marks("**_oi_**") == "oi"


def _test_normalize_for_diff_whitespace() -> None:
    assert normalize_for_diff("  hello   world  ") == "hello world"
    assert normalize_for_diff("a\tb") == "a b"
```

- [ ] **Step 2: Rodar e verificar que falham**

```bash
python scripts/build-pre-banca.py --self-test
```

Expected: 4 FAIL com `NameError: strip_inline_marks is not defined` (os 6 anteriores continuam OK), exit code 1.

- [ ] **Step 3: Implementar os helpers**

Logo após `_resolve_image_path`, adicionar:

```python
_INLINE_MARK_RE = re.compile(r"(\*\*\*|\*\*|\*|_)")


def strip_inline_marks(text: str) -> str:
    """Remove **, *, _ do texto. Não interpreta — só remove."""
    return _INLINE_MARK_RE.sub("", text)


def normalize_for_diff(text: str) -> str:
    """Normaliza para o diff da seção 2.9: colapsa whitespace, remove bordas, strip inline marks."""
    text = strip_inline_marks(text)
    return re.sub(r"\s+", " ", text).strip()


def replace_text_preserving_runs(text_frame, new_text: str) -> None:
    """Substitui todo o texto de um TextFrame por new_text, preservando a formatação
    do PRIMEIRO run do PRIMEIRO parágrafo (fonte, cor, tamanho, bold, italic).

    Remove parágrafos extras do template. Se new_text tiver '\\n', vira múltiplos parágrafos.
    """
    if not text_frame.paragraphs:
        text_frame.text = new_text
        return
    first_para = text_frame.paragraphs[0]
    # Garante pelo menos um run para herdar formato.
    if not first_para.runs:
        first_para.add_run()
    template_run = first_para.runs[0]
    font_name = template_run.font.name
    font_size = template_run.font.size
    font_bold = template_run.font.bold
    font_italic = template_run.font.italic
    try:
        font_color_rgb = template_run.font.color.rgb
    except (AttributeError, TypeError):
        font_color_rgb = None

    # Zera o text_frame: python-pptx não tem clear direto; apagamos todos os parágrafos exceto o 1º,
    # e no 1º apagamos todos os runs.
    tf_elem = text_frame._txBody
    for p in list(tf_elem.findall(".//{http://schemas.openxmlformats.org/drawingml/2006/main}p"))[1:]:
        tf_elem.remove(p)
    # Limpa runs do primeiro parágrafo
    for r in list(first_para._p.findall("{http://schemas.openxmlformats.org/drawingml/2006/main}r")):
        first_para._p.remove(r)

    lines = new_text.split("\n")
    first_run = first_para.add_run()
    first_run.text = lines[0]
    _apply_font(first_run, font_name, font_size, font_bold, font_italic, font_color_rgb)
    for extra in lines[1:]:
        p = text_frame.add_paragraph()
        run = p.add_run()
        run.text = extra
        _apply_font(run, font_name, font_size, font_bold, font_italic, font_color_rgb)


def _apply_font(run, name, size, bold, italic, color_rgb) -> None:
    if name is not None:
        run.font.name = name
    if size is not None:
        run.font.size = size
    if bold is not None:
        run.font.bold = bold
    if italic is not None:
        run.font.italic = italic
    if color_rgb is not None:
        from pptx.dml.color import RGBColor
        run.font.color.rgb = RGBColor(color_rgb[0], color_rgb[1], color_rgb[2])
```

- [ ] **Step 4: Rodar self-test e verificar que passa**

```bash
python scripts/build-pre-banca.py --self-test
```

Expected: todos os 10 testes com `OK`, exit code 0.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-pre-banca.py
git commit -m "feat(pre-banca): helpers strip_inline_marks, normalize_for_diff, replace_text_preserving_runs"
```

---

## Task 5: Handler genérico + wire-up dos slides regulares (1, 2, 3, 4, 6, 7, 8, 9, 12, 14)

Esses slides seguem o padrão: um `TextFrame` de título + um `TextFrame` de corpo com bullets OU com texto único (blockquote/parágrafo). O handler genérico cobre todos; slides 5, 10, 11, 13 têm handlers próprios (próximas tasks).

**Files:**
- Modify: `scripts/build-pre-banca.py`

- [ ] **Step 1: Implementar `find_title_and_body_frames` e `process_generic_slide`**

Adicionar nova seção `# --- slide handlers ---`:

```python
def find_title_and_body_frames(slide):
    """Heurística: title_frame = o shape cujo placeholder_format.idx == 0 OU cujo nome
    começa com 'Title'. body_frame = o próximo text_frame não-título.

    Retorna (title_tf, body_tf). Qualquer um pode ser None.
    """
    title_tf = None
    body_tf = None
    for shape in slide.shapes:
        if not shape.has_text_frame:
            continue
        name = (shape.name or "").lower()
        is_title = (
            "title" in name
            or (shape.is_placeholder and shape.placeholder_format.idx == 0)
        )
        if is_title and title_tf is None:
            title_tf = shape.text_frame
        elif body_tf is None:
            body_tf = shape.text_frame
    return title_tf, body_tf


def process_generic_slide(slide, content: SlideContent) -> list[str]:
    """Preenche título (do heading do rascunho) e corpo (bullets ou blockquote ou paragraphs)."""
    logs: list[str] = []
    title_tf, body_tf = find_title_and_body_frames(slide)

    if title_tf is not None and content.heading:
        replace_text_preserving_runs(title_tf, content.heading)
        logs.append(f"título='{content.heading}'")

    if body_tf is not None:
        body_text = _render_body(content)
        if body_text:
            replace_text_preserving_runs(body_tf, body_text)
            logs.append(f"corpo com {body_text.count(chr(10)) + 1} linha(s)")
        else:
            logs.append("corpo vazio (nenhum conteúdo no rascunho)")
    return logs


def _render_body(content: SlideContent) -> str:
    """Transforma SlideContent em string multiline para o body do slide.

    Prioridade: bullets > blockquote > paragraphs. Nunca mistura — se há bullets, só bullets.
    """
    if content.bullets:
        return "\n".join(strip_inline_marks(b) for b in content.bullets)
    if content.blockquote:
        return "\n".join(strip_inline_marks(b) for b in content.blockquote if b)
    if content.paragraphs:
        return "\n".join(strip_inline_marks(p) for p in content.paragraphs)
    return ""
```

- [ ] **Step 2: Montar `main()` para orquestrar os slides regulares**

Substituir `main()` por:

```python
def main() -> int:
    check_dependencies()
    check_files_exist()

    from pptx import Presentation

    slides_content = parse_rascunho(RASCUNHO_PATH.read_text(encoding="utf-8"))
    prs = Presentation(str(TEMPLATE_PATH))

    GENERIC_SLIDES = {1, 2, 3, 4, 6, 7, 8, 9, 12, 14}

    for idx, slide in enumerate(prs.slides, start=1):
        content = slides_content.get(idx)
        if content is None:
            print(f"Slide {idx}: SEM conteúdo no rascunho — mantido como no template.")
            continue
        if idx in GENERIC_SLIDES:
            logs = process_generic_slide(slide, content)
        else:
            logs = [f"handler específico pendente (Task 6-9)"]
        print(f"Slide {idx}: {'; '.join(logs) if logs else '(nada)'}")

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    prs.save(str(OUTPUT_PATH))
    print(f"\nArquivo gerado: {OUTPUT_PATH}")
    return 0
```

- [ ] **Step 3: Rodar e inspecionar visualmente**

```bash
python scripts/build-pre-banca.py
```

Expected: 14 linhas "Slide N:" e `~/Downloads/pre-banca.pptx` existe. Slides 5, 10, 11, 13 reportam "handler específico pendente".

Abrir o arquivo em LibreOffice:
```bash
libreoffice --impress ~/Downloads/pre-banca.pptx &
```

Validar visualmente (3 min, não precisa estar perfeito):
- Slide 1: título "Capa" OU o do blockquote? **Expectativa:** o heading do rascunho ("Capa") substituiu o título — isso é o esperado nesta etapa; o Slide 1 real vai precisar de handler específico para colocar o título longo e os créditos (Task 6/7-ish). **Se precisar, anotar e seguir.**
- Slide 3: título "Introdução · Contextualização", 4 bullets com o texto esperado.
- Slide 8: título "Objetivos · Específicos", 4 bullets.
- Slide 11, 13: ainda sem alteração ou com "handler específico pendente".

**Decisão:** se o Slide 1 ficou com título errado, segue — o próximo passo (Task 6 ou refinamento) ajusta.

- [ ] **Step 4: Rodar self-tests para garantir que nada quebrou**

```bash
python scripts/build-pre-banca.py --self-test
```

Expected: 10/10 OK.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-pre-banca.py
git commit -m "feat(pre-banca): handler genérico + wire-up dos 10 slides regulares"
```

---

## Task 6: Handlers específicos — slides 1, 2, 5, 7, 14 (capa, instituição, pergunta, objetivo geral, obrigado)

Esses 5 slides têm padrão "título + bloco de blockquote multilinhas" em que **cada linha do blockquote vai em um parágrafo próprio** — e o título do slide **é a primeira linha do blockquote**, não o heading do rascunho.

Exemplo (slide 1): o heading do rascunho é "Capa" (puramente organizacional); o título visível no slide é o título longo do TCC que está no blockquote.

**Files:**
- Modify: `scripts/build-pre-banca.py`

- [ ] **Step 1: Implementar handler blockquote-based**

Adicionar após `process_generic_slide`:

```python
def process_blockquote_slide(slide, content: SlideContent) -> list[str]:
    """Para slides onde o blockquote carrega título (1ª linha) + corpo (demais linhas).

    Aplica-se a slides 1, 2, 5, 7, 14. O heading do rascunho é organizacional e descartado
    quando há blockquote; o título visível vem da 1ª linha do blockquote.

    Slide 5 é especial: título fixo "Pergunta de pesquisa" (D-spec seção 2.3).
    """
    logs: list[str] = []
    title_tf, body_tf = find_title_and_body_frames(slide)

    quote = [strip_inline_marks(b) for b in content.blockquote if b]
    if not quote:
        logs.append("sem blockquote — fallback para handler genérico")
        return process_generic_slide(slide, content)

    if content.number == 5:
        title_text = "Pergunta de pesquisa"
    else:
        title_text = quote[0]
    body_text = "\n".join(quote[1:]) if len(quote) > 1 else ""

    if title_tf is not None:
        replace_text_preserving_runs(title_tf, title_text)
        logs.append(f"título='{title_text[:50]}{'…' if len(title_text) > 50 else ''}'")
    if body_tf is not None:
        if body_text or content.bullets:
            # Slide 5 tem bullets no corpo além do blockquote.
            if content.bullets:
                body_bullets = "\n".join(strip_inline_marks(b) for b in content.bullets)
                body_text = f"{body_text}\n{body_bullets}" if body_text else body_bullets
            replace_text_preserving_runs(body_tf, body_text)
            logs.append(f"corpo com {body_text.count(chr(10)) + 1} linha(s)")
        else:
            logs.append("corpo vazio")
    return logs
```

- [ ] **Step 2: Atualizar `main()` para rotear slides 1, 2, 5, 7, 14 pelo handler blockquote**

Substituir o loop em `main()`:

```python
    GENERIC_SLIDES = {3, 4, 6, 8, 9, 12}
    BLOCKQUOTE_SLIDES = {1, 2, 5, 7, 14}

    for idx, slide in enumerate(prs.slides, start=1):
        content = slides_content.get(idx)
        if content is None:
            print(f"Slide {idx}: SEM conteúdo no rascunho — mantido como no template.")
            continue
        if idx in GENERIC_SLIDES:
            logs = process_generic_slide(slide, content)
        elif idx in BLOCKQUOTE_SLIDES:
            logs = process_blockquote_slide(slide, content)
        else:
            logs = ["handler específico pendente (slide 10, 11, 13)"]
        print(f"Slide {idx}: {'; '.join(logs) if logs else '(nada)'}")
```

- [ ] **Step 3: Rodar e validar visualmente**

```bash
python scripts/build-pre-banca.py
libreoffice --impress ~/Downloads/pre-banca.pptx &
```

Validar:
- Slide 1: título longo do TCC + "Discente:" / "Orientador:" nas linhas seguintes.
- Slide 2: título "GRADUAÇÃO EM CIÊNCIA DA COMPUTAÇÃO" + linha "Faculdade Municipal..."
- Slide 5: título "Pergunta de pesquisa" (NÃO "Hipótese") + bullet com a pergunta real.
- Slide 7: título "Objetivo Geral" + parágrafo do objetivo.
- Slide 14: título "Obrigado!" + linha com nome e email.

Se qualquer título ou corpo estiver trocado, anotar e seguir — ajustes finos entram no Task 11.

- [ ] **Step 4: Commit**

```bash
git add scripts/build-pre-banca.py
git commit -m "feat(pre-banca): handler blockquote para slides 1, 2, 5, 7, 14 (slide 5 troca Hipótese→Pergunta de pesquisa)"
```

---

## Task 7: Slide 10 — handler com inserção de imagens

Slide 10 é o único com imagens: 2 PNGs lado a lado, abaixo dos bullets.

**Files:**
- Modify: `scripts/build-pre-banca.py`

- [ ] **Step 1: Implementar `process_slide_10`**

Adicionar após `process_blockquote_slide`:

```python
def process_slide_10(slide, content: SlideContent, slide_width: int, slide_height: int) -> list[str]:
    """Slide 10: título + bullets (gerenciado como genérico) + inserção de 2 imagens lado a lado.

    Imagens vão abaixo do body_frame, largura ≈ 11 cm cada, centradas no slide.
    slide_width/slide_height vêm do prs (int EMU).
    Fallback: se imagem não existe no filesystem, só avisa (não falha).
    """
    from pptx.util import Cm

    logs = process_generic_slide(slide, content)

    if not content.images:
        logs.append("nenhuma imagem no rascunho — nada a inserir")
        return logs

    img_width = Cm(11)
    gap = Cm(0.5)
    total = img_width + img_width + gap
    left_start = (slide_width - total) // 2
    top = int(slide_height * 0.55)

    inserted = []
    for i, (alt, path) in enumerate(content.images[:2]):
        if not Path(path).is_file():
            logs.append(f"AVISO: imagem não encontrada: {path}")
            continue
        left = left_start + i * (img_width + gap)
        slide.shapes.add_picture(path, left, top, width=img_width)
        inserted.append(Path(path).name)
    if inserted:
        logs.append(f"{len(inserted)} imagem(s) inserida(s): {', '.join(inserted)}")
    return logs
```

- [ ] **Step 2: Rotear slide 10 no `main()` com dimensões do slide**

Atualizar o loop em `main()` para capturar `slide_width/slide_height` do `prs` e passar ao handler do slide 10 (que precisa de dimensões; os outros não precisam):

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
        else:
            logs = ["handler específico pendente (slide 11, 13)"]
        print(f"Slide {idx}: {'; '.join(logs) if logs else '(nada)'}")
```

- [ ] **Step 3: Rodar e validar visualmente**

```bash
python scripts/build-pre-banca.py
libreoffice --impress ~/Downloads/pre-banca.pptx &
```

Validar slide 10: título "Resultados preliminares", bullets com conteúdo do rascunho, **2 imagens lado a lado** na metade de baixo do slide. Se as imagens estourarem o layout ou cobrirem bullets, anotar — ajuste de posição vai no Task 11.

Expected logs:
```
Slide 10: título='Resultados preliminares'; corpo com X linha(s); 2 imagem(s) inserida(s): aluno-home.png, aluno-submissoes.png
```

- [ ] **Step 4: Commit**

```bash
git add scripts/build-pre-banca.py
git commit -m "feat(pre-banca): handler slide 10 com inserção de 2 imagens lado a lado"
```

---

## Task 8: Slide 11 — cirurgia na tabela do cronograma

Remove 5 colunas (Abr, Mai, Jun, Jul, Dez), redistribui largura, preenche X.

**Files:**
- Modify: `scripts/build-pre-banca.py`

- [ ] **Step 1: Implementar `process_slide_11`**

Adicionar após `process_slide_10`:

```python
_COLS_TO_REMOVE = {"Abr", "Mai", "Jun", "Jul", "Dez"}
_COLS_TO_KEEP = ["Ago", "Set", "Out", "Nov"]


def process_slide_11(slide, content: SlideContent) -> list[str]:
    """Slide 11: adapta a tabela — remove colunas Abr/Mai/Jun/Jul/Dez, redistribui largura,
    preenche X conforme content.table_rows (header + atividades) do rascunho.
    """
    from copy import deepcopy

    logs: list[str] = []

    # Localizar a tabela
    table_shape = None
    for shape in slide.shapes:
        if shape.has_table:
            table_shape = shape
            break
    if table_shape is None:
        logs.append("ERRO: nenhuma tabela encontrada no slide 11")
        return logs
    table = table_shape.table

    # Mapear colunas atuais pelo texto do header (row 0)
    header_cells = [cell.text_frame.text.strip() for cell in table.rows[0].cells]
    cols_to_drop_idx = [i for i, h in enumerate(header_cells) if h in _COLS_TO_REMOVE]
    if not cols_to_drop_idx:
        logs.append(f"AVISO: nenhuma coluna a remover encontrada. Header atual: {header_cells}")
    cols_to_drop_idx.sort(reverse=True)  # remover de trás para frente

    # Soma larguras ANTES de remover
    tbl = table._tbl
    grid = tbl.find("{http://schemas.openxmlformats.org/drawingml/2006/main}tblGrid")
    gridCols = grid.findall("{http://schemas.openxmlformats.org/drawingml/2006/main}gridCol")
    total_width = sum(int(gc.get("w")) for gc in gridCols)

    # Remover colunas (gridCol + cada <tc> correspondente em cada <tr>)
    ns = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
    for col_idx in cols_to_drop_idx:
        grid.remove(gridCols[col_idx])
        for tr in tbl.findall(f"{ns}tr"):
            tcs = tr.findall(f"{ns}tc")
            tr.remove(tcs[col_idx])
    logs.append(f"{len(cols_to_drop_idx)} coluna(s) removida(s)")

    # Redistribuir largura das 4 colunas de mês (as 4 últimas) — a 1ª (descrição) preserva.
    remaining_gridCols = grid.findall(f"{ns}gridCol")
    if len(remaining_gridCols) < 2:
        logs.append(f"AVISO: tabela tem só {len(remaining_gridCols)} coluna(s) após remoção")
    else:
        desc_width = int(remaining_gridCols[0].get("w"))
        month_total = total_width - desc_width
        month_each = month_total // 4
        for gc in remaining_gridCols[1:]:
            gc.set("w", str(month_each))
        logs.append(f"larguras redistribuídas: desc={desc_width}, cada mês={month_each}")

    # Preencher X a partir do content.table_rows (header + N atividades)
    if not content.table_rows:
        logs.append("AVISO: content.table_rows vazio — tabela mantida sem X")
        return logs
    rascunho_rows = content.table_rows
    # table.rows[0] é header; demais são atividades. Garantir que template tem rows suficientes.
    if len(table.rows) - 1 < len(rascunho_rows) - 1:
        logs.append(
            f"AVISO: template tem {len(table.rows) - 1} linhas de atividade, "
            f"rascunho pede {len(rascunho_rows) - 1} — truncando."
        )
    for row_idx, rascunho_row in enumerate(rascunho_rows[1:], start=1):
        if row_idx >= len(table.rows):
            break
        template_row = table.rows[row_idx]
        for col_idx, cell_text in enumerate(rascunho_row):
            if col_idx >= len(template_row.cells):
                break
            replace_text_preserving_runs(template_row.cells[col_idx].text_frame, cell_text)
    logs.append(f"{len(rascunho_rows) - 1} linha(s) de atividade preenchida(s)")
    return logs
```

- [ ] **Step 2: Rotear slide 11 no `main()`**

Adicionar o ramo `elif idx == 11:` no loop:

```python
        if idx in GENERIC_SLIDES:
            logs = process_generic_slide(slide, content)
        elif idx in BLOCKQUOTE_SLIDES:
            logs = process_blockquote_slide(slide, content)
        elif idx == 10:
            logs = process_slide_10(slide, content, slide_width, slide_height)
        elif idx == 11:
            logs = process_slide_11(slide, content)
        else:
            logs = ["handler específico pendente (slide 13)"]
```

- [ ] **Step 3: Rodar e validar visualmente**

```bash
python scripts/build-pre-banca.py
libreoffice --impress ~/Downloads/pre-banca.pptx &
```

Validar slide 11:
- Tabela tem **5 colunas totais** (Atividades + Ago + Set + Out + Nov).
- Header: "Atividades", "Ago", "Set", "Out", "Nov".
- Linha "Testes de usabilidade (SUS)" tem **X em Out e Nov**, vazio em Ago e Set.
- Linha "Prototipagem e desenvolvimento" tem X em Ago, Set, Out.
- Tabela ocupa a mesma largura total que ocupava antes (não encolheu).

Se alguma linha estiver fora de ordem, isso é esperado se o template tem rows em ordem diferente do rascunho — ajuste no Task 11.

- [ ] **Step 4: Commit**

```bash
git add scripts/build-pre-banca.py
git commit -m "feat(pre-banca): handler slide 11 — remoção de 5 colunas + redistribuição + fill X"
```

---

## Task 9: Slide 13 — referências com itálico ABNT

Slide 13 tem bullets com formatação ABNT: **negrito** em nome do periódico, *itálico* em título de obra. O parser já guardou os bullets, mas eles passaram pelo `strip_inline_marks`. Para slide 13, preservamos a marcação original.

**Files:**
- Modify: `scripts/build-pre-banca.py`

- [ ] **Step 1: Expor bullets "raw" no `SlideContent` + implementar `process_slide_13`**

Modificar `SlideContent` para guardar bullets raw (com marcação) além dos limpos:

```python
@dataclass
class SlideContent:
    number: int
    heading: str
    bullets: list[str] = field(default_factory=list)
    bullets_raw: list[str] = field(default_factory=list)  # NOVO — com **/*/_
    paragraphs: list[str] = field(default_factory=list)
    blockquote: list[str] = field(default_factory=list)
    table_rows: list[list[str]] = field(default_factory=list)
    images: list[tuple[str, str]] = field(default_factory=list)
    has_falta: bool = False
```

E, no `parse_rascunho`, no ramo `elif stripped.startswith("- "):`:

```python
        elif stripped.startswith("- "):
            without_img = _IMAGE_RE.sub("", stripped[2:]).strip()
            if without_img:
                current.bullets.append(without_img)
                current.bullets_raw.append(without_img)
```

(ambos recebem a mesma string pré-strip; `bullets` será strippado quando necessário, e `bullets_raw` fica como está.)

Depois adicionar o handler:

```python
_INLINE_MARK_PAIR_RE = re.compile(r"(\*\*\*|\*\*|_|\*)([^*_]+)\1")


def process_slide_13(slide, content: SlideContent) -> list[str]:
    """Slide 13: referências. Preserva itálico/negrito ABNT dentro de cada bullet.

    Cada bullet vira UM parágrafo no body_frame, com runs separados para segmentos marcados.
    """
    logs: list[str] = []
    title_tf, body_tf = find_title_and_body_frames(slide)
    if title_tf is not None:
        replace_text_preserving_runs(title_tf, content.heading)
        logs.append(f"título='{content.heading}'")
    if body_tf is None:
        logs.append("AVISO: nenhum body_frame no slide 13")
        return logs
    if not content.bullets_raw:
        logs.append("AVISO: sem bullets no rascunho")
        return logs

    # Capturar formatação-base do primeiro run
    first_para = body_tf.paragraphs[0]
    if not first_para.runs:
        first_para.add_run()
    base_run = first_para.runs[0]
    base_name = base_run.font.name
    base_size = base_run.font.size
    try:
        base_color_rgb = base_run.font.color.rgb
    except (AttributeError, TypeError):
        base_color_rgb = None

    # Limpa o body
    tf_elem = body_tf._txBody
    ns = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
    for p in list(tf_elem.findall(f"{ns}p"))[1:]:
        tf_elem.remove(p)
    for r in list(first_para._p.findall(f"{ns}r")):
        first_para._p.remove(r)

    for i, bullet in enumerate(content.bullets_raw):
        p = first_para if i == 0 else body_tf.add_paragraph()
        _render_marked_runs(p, bullet, base_name, base_size, base_color_rgb)
    logs.append(f"{len(content.bullets_raw)} referência(s) renderizada(s) com itálico/negrito")
    return logs


def _render_marked_runs(paragraph, text: str, font_name, font_size, color_rgb) -> None:
    """Varre `text` quebrando em runs: segmentos ***X*** → bold+italic; **X** → bold;
    *X* ou _X_ → italic; resto → plain."""
    pos = 0
    for match in _INLINE_MARK_PAIR_RE.finditer(text):
        if match.start() > pos:
            _add_run(paragraph, text[pos:match.start()], False, False, font_name, font_size, color_rgb)
        mark, inner = match.group(1), match.group(2)
        bold = mark in ("**", "***")
        italic = mark in ("*", "_", "***")
        _add_run(paragraph, inner, bold, italic, font_name, font_size, color_rgb)
        pos = match.end()
    if pos < len(text):
        _add_run(paragraph, text[pos:], False, False, font_name, font_size, color_rgb)


def _add_run(paragraph, text: str, bold: bool, italic: bool, name, size, color_rgb) -> None:
    run = paragraph.add_run()
    run.text = text
    _apply_font(run, name, size, bold if bold else None, italic if italic else None, color_rgb)
```

- [ ] **Step 2: Rotear slide 13 no `main()`**

Adicionar o ramo `elif idx == 13:` e remover o fallback (todos os slides agora têm handler):

```python
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
```

- [ ] **Step 3: Rodar self-tests**

```bash
python scripts/build-pre-banca.py --self-test
```

Expected: 10/10 OK (`bullets_raw` não quebra nada; os testes do slide 11 continuam passando).

- [ ] **Step 4: Rodar e validar visualmente**

```bash
python scripts/build-pre-banca.py
libreoffice --impress ~/Downloads/pre-banca.pptx &
```

Validar slide 13:
- Pelo menos 6 referências visíveis.
- "REMUNOM: Revista Multidisciplinar do Nordeste Mineiro" aparece **em negrito**.
- "Usability Evaluation in Industry" aparece **em negrito**.
- Linha `[FALTA] Regulamento oficial...` aparece como texto comum (sem crash).

- [ ] **Step 5: Commit**

```bash
git add scripts/build-pre-banca.py
git commit -m "feat(pre-banca): handler slide 13 — referências ABNT com itálico/negrito preservados"
```

---

## Task 10: Verificação por diff + exit code

Reabre o `.pptx` gerado, extrai texto por slide, compara ao rascunho, lista divergências.

**Files:**
- Modify: `scripts/build-pre-banca.py`

- [ ] **Step 1: Implementar `extract_text_per_slide` e `diff_rascunho_vs_output`**

Adicionar nova seção `# --- verification ---`:

```python
def extract_text_per_slide(pptx_path: Path) -> dict[int, list[str]]:
    """Retorna {slide_num: [linhas de texto do slide, normalizadas]}."""
    from pptx import Presentation
    prs = Presentation(str(pptx_path))
    result: dict[int, list[str]] = {}
    for idx, slide in enumerate(prs.slides, start=1):
        texts: list[str] = []
        for shape in slide.shapes:
            if shape.has_text_frame:
                for para in shape.text_frame.paragraphs:
                    line = "".join(r.text for r in para.runs)
                    norm = normalize_for_diff(line)
                    if norm:
                        texts.append(norm)
            if shape.has_table:
                for row in shape.table.rows:
                    for cell in row.cells:
                        line = cell.text_frame.text
                        norm = normalize_for_diff(line)
                        if norm:
                            texts.append(norm)
        result[idx] = texts
    return result


def expected_text_per_slide(slides_content: dict[int, SlideContent]) -> dict[int, list[str]]:
    """Monta a representação esperada a partir do rascunho, para diff."""
    expected: dict[int, list[str]] = {}
    for num, content in slides_content.items():
        texts: list[str] = []
        # Heading (slide 5: trocado para "Pergunta de pesquisa")
        if num == 5:
            texts.append(normalize_for_diff("Pergunta de pesquisa"))
        else:
            texts.append(normalize_for_diff(content.heading))
        for b in content.blockquote:
            n = normalize_for_diff(b)
            if n:
                texts.append(n)
        for b in content.bullets_raw or content.bullets:
            n = normalize_for_diff(b)
            if n:
                texts.append(n)
        for p in content.paragraphs:
            n = normalize_for_diff(p)
            if n:
                texts.append(n)
        for row in content.table_rows:
            for cell in row:
                n = normalize_for_diff(cell)
                if n:
                    texts.append(n)
        expected[num] = texts
    return expected


def diff_rascunho_vs_output(
    expected: dict[int, list[str]], actual: dict[int, list[str]]
) -> tuple[list[str], list[str]]:
    """Retorna (errors, warnings).

    Para cada slide, verifica se CADA string esperada aparece como substring de ALGUMA linha
    do actual (comparação relaxada: template pode agrupar bullets em um parágrafo só, etc).

    Slide 13 e qualquer linha contendo "[FALTA" só gera warning.
    """
    errors: list[str] = []
    warnings: list[str] = []
    for num, exp_lines in expected.items():
        act_lines = actual.get(num, [])
        act_joined = " \n ".join(act_lines)
        for exp in exp_lines:
            if exp in act_joined:
                continue
            msg = f"Slide {num}: texto esperado NÃO encontrado: {exp!r}"
            if num == 13 or "[FALTA" in exp:
                warnings.append(msg)
            else:
                errors.append(msg)
    return errors, warnings
```

- [ ] **Step 2: Chamar o diff no fim de `main()`**

Alterar o final de `main()`:

```python
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    prs.save(str(OUTPUT_PATH))
    print(f"\nArquivo gerado: {OUTPUT_PATH}")

    print("\n=== Verificação (diff rascunho × .pptx gerado) ===")
    expected = expected_text_per_slide(slides_content)
    actual = extract_text_per_slide(OUTPUT_PATH)
    errors, warnings = diff_rascunho_vs_output(expected, actual)
    for w in warnings:
        print(f"AVISO: {w}")
    for e in errors:
        print(f"ERRO: {e}")
    if errors:
        print(f"\n{len(errors)} divergência(s) crítica(s). Exit code 1.")
        return 1
    print(f"\nOK — {len(warnings)} aviso(s), 0 erro(s). Exit code 0.")
    return 0
```

- [ ] **Step 3: Rodar e verificar comportamento**

```bash
python scripts/build-pre-banca.py
echo "exit=$?"
```

Expected:
- Logs dos 14 slides com conteúdo substituído.
- "Arquivo gerado: /home/texera/Downloads/pre-banca.pptx".
- Bloco "=== Verificação ===" com, idealmente, 0 ERRO e alguns AVISOs (slide 13 referências, `[FALTA]`).
- Exit code 0.

Se **houver ERROs**, investigar: quais textos esperados não aparecem? Isso aponta para bugs nos handlers (ex.: um bullet que foi perdido). **Corrigir o handler** antes de prosseguir, não ajustar o diff para esconder a divergência.

- [ ] **Step 4: Rodar self-tests**

```bash
python scripts/build-pre-banca.py --self-test
```

Expected: 10/10 OK.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-pre-banca.py
git commit -m "feat(pre-banca): verificação por diff rascunho × pptx + exit code 1 em divergência"
```

---

## Task 11: Smoke test visual + ajustes finos + commit final

Essa task consolida: abre o `.pptx`, valida visualmente os 5 critérios da seção 2.13 da spec, corrige o que não ficou bom, encerra.

**Files:**
- Modify: `scripts/build-pre-banca.py` (se precisar ajuste fino)

- [ ] **Step 1: Rodar o pipeline completo com exit code limpo**

```bash
python scripts/build-pre-banca.py
echo "exit=$?"
```

Expected: `exit=0` e 0 ERRO no diff. Se houver ERRO, voltar à task correspondente e corrigir antes de seguir.

- [ ] **Step 2: Abrir o .pptx e validar os 5 critérios de aceitação visual (spec seção 2.13)**

```bash
libreoffice --impress ~/Downloads/pre-banca.pptx &
```

Checklist:
- [ ] Slide 1 — título longo do TCC visível, "Discente: Pedro..." e "Orientador: Prof. Robson..." legíveis, fundo íntegro.
- [ ] Slide 5 — título "Pergunta de pesquisa" (NÃO "Hipótese"), bullet com a pergunta.
- [ ] Slide 10 — 2 imagens lado a lado, visíveis, não estouram o layout dos bullets.
- [ ] Slide 11 — tabela com 5 colunas (Atividades + Ago/Set/Out/Nov), X no lugar certo, visualmente íntegra.
- [ ] Slide 13 — pelo menos 1 referência com itálico em título de obra; linha `[FALTA]` presente mas sem crash.

Para cada item que **falhar**, anotar e seguir ao próximo step com um fix.

- [ ] **Step 3: Aplicar ajustes finos (se necessário)**

Casos comuns e seus pontos de ajuste no script:
- **Imagens do slide 10 cobrindo bullets:** reduzir `img_width = Cm(11)` para `Cm(9)` ou ajustar `top = int(slide_height * 0.55)` para 0.60/0.65 em `process_slide_10`.
- **Colunas Ago/Set/Out/Nov muito estreitas no slide 11:** o `month_each = month_total // 4` já reutiliza a largura total original — se precisar mais larguras, ajustar manualmente no `.pptx` antes da banca (D8).
- **Título do slide 1 cortado:** o template tem limite — se o título longo não cabe, considerar quebrar em 2 linhas via `\n` dentro do blockquote do rascunho.

Após qualquer ajuste, rodar o pipeline de novo:

```bash
python scripts/build-pre-banca.py
```

E reabrir no LibreOffice para re-validar.

- [ ] **Step 4: Rodar self-tests uma última vez**

```bash
python scripts/build-pre-banca.py --self-test
```

Expected: 10/10 OK, exit code 0.

- [ ] **Step 5: Commit final (se houve ajustes)**

```bash
# Se houve ajustes:
git add scripts/build-pre-banca.py
git commit -m "fix(pre-banca): ajustes finos de layout após smoke test visual"
# Se não houve ajuste: pular.
```

- [ ] **Step 6: Delegar doc-worthy ao docs-curator**

Após `exit code 0` + OK visual, o usuário invoca o `docs-curator` para:
1. Fechar em [[dominio/pendencias]] o item "Montar o PPTX final".
2. Fechar em [[dominio/pendencias]] o item "Nome do orientador (slide 1)".
3. (Opcional) Verificar a seção `## Como regerar o arquivo .pptx` no rascunho.

**Isso é passo manual do agente principal — não entra no plano como código.** Apenas registrar aqui a dívida.

---

## Resumo da arquitetura final

- **1 arquivo:** `scripts/build-pre-banca.py` (~500 linhas)
- **1 dep nova:** `python-pptx` (`pip install --user`)
- **0 modificações em `apps/`, `packages/`, `prisma/`, `docker-compose.*`, `package.json`**
- **Verificação:** `--self-test` (10 testes unitários) + diff automático no pipeline + checklist visual humano
- **Commits:** 10 (1 por task), descritivos, seguindo convenção `feat(pre-banca): ...` / `fix(pre-banca): ...`
