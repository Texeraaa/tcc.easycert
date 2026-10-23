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
