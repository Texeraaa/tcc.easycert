#!/usr/bin/env python3
"""Gera ~/Downloads/pre-banca.pptx a partir do template Muller e de docs/tcc/rascunhos/pre-banca.md.

Uso:
    python scripts/build-pre-banca.py              # gera o pptx
    python scripts/build-pre-banca.py --self-test  # roda testes unitários
    python scripts/build-pre-banca.py --inspect    # imprime estrutura do template
"""
from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
TEMPLATE_PATH = Path.home() / "Downloads" / "Muller_PreBanca_v2.pptx"
RASCUNHO_PATH = REPO_ROOT / "docs" / "tcc" / "rascunhos" / "pre-banca.md"
OUTPUT_PATH = Path.home() / "Downloads" / "pre-banca.pptx"
IMG_BASE_DIR = RASCUNHO_PATH.parent


# --- parser ---


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
            current = None
            continue
        if "[FALTA" in line:
            current.has_falta = True
        for alt, path in _IMAGE_RE.findall(line):
            resolved = _resolve_image_path(path)
            current.images.append((alt, resolved))
        stripped = line.strip()
        if not stripped:
            continue
        if stripped.startswith("|"):
            cells = [c.strip() for c in stripped.strip("|").split("|")]
            if all(set(c) <= set("-: ") for c in cells):
                continue
            current.table_rows.append(cells)
        elif stripped.startswith("> "):
            current.blockquote.append(stripped[2:].strip())
        elif stripped.startswith(">"):
            current.blockquote.append("")
        elif stripped.startswith("- "):
            without_img = _IMAGE_RE.sub("", stripped[2:]).strip()
            if without_img:
                current.bullets.append(without_img)
        else:
            current.paragraphs.append(stripped)

    return slides


def _resolve_image_path(path: str) -> str:
    p = Path(path)
    if not p.is_absolute():
        p = (IMG_BASE_DIR / path).resolve()
    return str(p)


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
    sus_row = next((r for r in s11.table_rows if "SUS" in r[0]), None)
    assert sus_row is not None, "linha SUS não encontrada"
    assert sus_row[1] == "" and sus_row[2] == "" and sus_row[3] == "X" and sus_row[4] == "X"


def _test_parse_rascunho_slide_10_tem_duas_imagens() -> None:
    slides = parse_rascunho(RASCUNHO_PATH.read_text(encoding="utf-8"))
    s10 = slides[10]
    assert len(s10.images) == 2, f"esperado 2 imagens no slide 10: {s10.images}"
    paths = [p for _, p in s10.images]
    assert all("aluno-" in p for p in paths), f"paths inesperados: {paths}"
    assert all(p.endswith(".png") for p in paths)


def _test_parse_rascunho_detecta_falta() -> None:
    slides = parse_rascunho(RASCUNHO_PATH.read_text(encoding="utf-8"))
    s13 = slides[13]
    assert s13.has_falta, "slide 13 deveria ter has_falta=True (regulamento FMPFM)"


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
