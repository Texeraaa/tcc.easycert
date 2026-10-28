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
from copy import deepcopy
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
    bullets_raw: list[str] = field(default_factory=list)  # com **/*/_
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
            if not 1 <= num <= 19:
                raise ValueError(f"Slide fora da faixa 1-19: {num}")
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
                current.bullets_raw.append(without_img)
        else:
            current.paragraphs.append(stripped)

    return slides


def _resolve_image_path(path: str) -> str:
    p = Path(path)
    if not p.is_absolute():
        p = (IMG_BASE_DIR / path).resolve()
    return str(p)


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

    ns = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
    tf_elem = text_frame._txBody
    for p in list(tf_elem.findall(f".//{ns}p"))[1:]:
        tf_elem.remove(p)
    for r in list(first_para._p.findall(f"{ns}r")):
        first_para._p.remove(r)

    # Preserve o pPr (bullet char, indent, etc) do primeiro parágrafo para clonar
    # nos parágrafos adicionais — sem isso, bullets extras perdem o marcador.
    first_pPr = first_para._p.find(f"{ns}pPr")

    lines = new_text.split("\n")
    first_run = first_para.add_run()
    first_run.text = lines[0]
    _apply_font(first_run, font_name, font_size, font_bold, font_italic, font_color_rgb)
    for extra in lines[1:]:
        p = text_frame.add_paragraph()
        if first_pPr is not None:
            new_pPr = deepcopy(first_pPr)
            p._p.insert(0, new_pPr)
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


def duplicate_slide_at(prs, source_idx: int, target_idx: int) -> None:
    """Duplica o slide em `source_idx` (0-based) e insere o duplicado em `target_idx`.

    Técnica: cria um novo slide a partir do mesmo layout, LIMPA os shapes do layout
    para evitar duplicação, e deep-copia os shapes do slide fonte. python-pptx
    não oferece API nativa.
    """
    source_slide = prs.slides[source_idx]
    layout = source_slide.slide_layout
    new_slide = prs.slides.add_slide(layout)

    spTree = new_slide.shapes._spTree
    _SHAPE_TAGS = {"sp", "pic", "graphicFrame", "grpSp", "cxnSp"}
    for sp in list(spTree):
        tag = sp.tag.split("}", 1)[-1]
        if tag in _SHAPE_TAGS:
            spTree.remove(sp)

    for shape in source_slide.shapes:
        new_el = deepcopy(shape.element)
        spTree.insert_element_before(new_el, "p:extLst")

    sldIdLst = prs.slides._sldIdLst
    slides_list = list(sldIdLst)
    new_sld = slides_list[-1]
    sldIdLst.remove(new_sld)
    sldIdLst.insert(target_idx, new_sld)


def insert_blank_slide_at(prs, source_idx: int, target_idx: int) -> None:
    """Insere um slide EM BRANCO em `target_idx`, usando o mesmo layout de `source_idx`
    para preservar o visual de fundo mas removendo todos os shapes (título, bullets, etc).

    Uso: criar slots para o usuário posicionar imagens manualmente após o build.
    """
    source_slide = prs.slides[source_idx]
    layout = source_slide.slide_layout
    new_slide = prs.slides.add_slide(layout)

    spTree = new_slide.shapes._spTree
    _SHAPE_TAGS = {"sp", "pic", "graphicFrame", "grpSp", "cxnSp"}
    for sp in list(spTree):
        tag = sp.tag.split("}", 1)[-1]
        if tag in _SHAPE_TAGS:
            spTree.remove(sp)

    sldIdLst = prs.slides._sldIdLst
    slides_list = list(sldIdLst)
    new_sld = slides_list[-1]
    sldIdLst.remove(new_sld)
    sldIdLst.insert(target_idx, new_sld)


# --- slide handlers ---


def find_title_and_body_frames(slide):
    """Localiza (title_tf, body_tf) de um slide.

    Title: shape placeholder cujo placeholder_format.idx == 0 (ou cujo nome contém 'title').
    Body (nesta ordem de preferência):
        1. Shape (placeholder OU text_box) cujo nome contenha 'conteúdo'/'conteudo'/'content'
           — identifica o 'Espaço Reservado para Conteúdo' do template mesmo quando foi
           convertido em TextBox.
        2. SlidePlaceholder não-título (idx != 0).
        3. Primeiro text_frame restante (fallback).

    Essa preferência existe porque alguns slides do template (ex.: 7, 8) têm uma TextBox de
    sub-título ('Objetivo Geral', 'Objetivos Específicos') ANTES do shape de corpo na ordem
    XML, e tanto o subtítulo quanto o corpo já não são placeholders.
    """
    title_tf = None
    body_content_tf = None       # shape nomeado como "Conteúdo"
    body_placeholder_tf = None   # placeholder não-título
    body_fallback_tf = None      # qualquer outro text_frame
    for shape in slide.shapes:
        if not shape.has_text_frame:
            continue
        name = (shape.name or "").lower()
        is_placeholder = shape.is_placeholder
        is_title = (
            "title" in name
            or (is_placeholder and shape.placeholder_format.idx == 0)
        )
        if is_title and title_tf is None:
            title_tf = shape.text_frame
            continue
        is_content_named = (
            "conteúdo" in name or "conteudo" in name or "content" in name
        )
        if is_content_named and body_content_tf is None:
            body_content_tf = shape.text_frame
        elif is_placeholder and body_placeholder_tf is None:
            body_placeholder_tf = shape.text_frame
        elif body_fallback_tf is None:
            body_fallback_tf = shape.text_frame
    body_tf = body_content_tf or body_placeholder_tf or body_fallback_tf
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


def process_blockquote_slide(slide, content: SlideContent) -> list[str]:
    """Para slides onde o blockquote carrega título (1ª linha) + corpo (demais linhas).

    Aplica-se a slides 1, 2, 5, 7, 14. O heading do rascunho é organizacional e descartado
    quando há blockquote; o título visível vem da 1ª linha do blockquote.

    Slide 5 é especial: título fixo "Pergunta de pesquisa" (spec seção 2.3).

    Fallback: se o template não tem body_frame (slides 2 e 14), concatena o blockquote
    inteiro no title_frame como múltiplos parágrafos.
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

    # Slide 5 tem bullets adicionais no corpo além do blockquote.
    if content.bullets:
        body_bullets = "\n".join(strip_inline_marks(b) for b in content.bullets)
        body_text = f"{body_text}\n{body_bullets}" if body_text else body_bullets

    if body_tf is None and body_text:
        # Fallback: template sem body frame (slides 2, 14) — concatena no título.
        full_title = f"{title_text}\n{body_text}"
        if title_tf is not None:
            replace_text_preserving_runs(title_tf, full_title)
            logs.append(f"título multi-linha (sem body frame): {full_title!r}")
        else:
            logs.append("AVISO: nem title_tf nem body_tf — nada substituído")
        return logs

    if title_tf is not None:
        replace_text_preserving_runs(title_tf, title_text)
        logs.append(f"título='{title_text[:50]}{'…' if len(title_text) > 50 else ''}'")
    if body_tf is not None:
        if body_text:
            replace_text_preserving_runs(body_tf, body_text)
            logs.append(f"corpo com {body_text.count(chr(10)) + 1} linha(s)")
        else:
            logs.append("corpo vazio")
    return logs


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


_COLS_TO_REMOVE = {"Abr", "Mai", "Jun", "Jul", "Dez"}
_COLS_TO_KEEP = ["Ago", "Set", "Out", "Nov"]


def process_slide_16(slide, content: SlideContent) -> list[str]:
    """Slide 16 (ex-13 pós-reframe): cronograma — adapta a tabela, remove colunas Abr/Mai/Jun/Jul/Dez,
    redistribui largura, preenche X conforme content.table_rows do rascunho.
    """
    logs: list[str] = []

    table_shape = None
    for shape in slide.shapes:
        if shape.has_table:
            table_shape = shape
            break
    if table_shape is None:
        logs.append("ERRO: nenhuma tabela encontrada no slide 11")
        return logs
    table = table_shape.table

    header_cells = [cell.text_frame.text.strip() for cell in table.rows[0].cells]
    cols_to_drop_idx = [i for i, h in enumerate(header_cells) if h in _COLS_TO_REMOVE]
    if not cols_to_drop_idx:
        logs.append(f"AVISO: nenhuma coluna a remover encontrada. Header atual: {header_cells}")
    cols_to_drop_idx.sort(reverse=True)

    tbl = table._tbl
    ns = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
    grid = tbl.find(f"{ns}tblGrid")
    gridCols = grid.findall(f"{ns}gridCol")
    total_width = sum(int(gc.get("w")) for gc in gridCols)

    for col_idx in cols_to_drop_idx:
        grid.remove(gridCols[col_idx])
        for tr in tbl.findall(f"{ns}tr"):
            tcs = tr.findall(f"{ns}tc")
            tr.remove(tcs[col_idx])
    logs.append(f"{len(cols_to_drop_idx)} coluna(s) removida(s)")

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

    if not content.table_rows:
        logs.append("AVISO: content.table_rows vazio — tabela mantida sem X")
        return logs
    rascunho_rows = content.table_rows
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


_INLINE_MARK_PAIR_RE = re.compile(r"(\*\*\*|\*\*|_|\*)([^*_]+)\1")


def process_slide_18(slide, content: SlideContent) -> list[str]:
    """Slide 18 (ex-15 pós-reframe): referências ABNT com itálico/negrito preservados."""
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


# --- verification ---


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


# Slides onde o `heading` do rascunho é organizacional (não é o título visível no deck).
_HEADING_IS_ORGANIZATIONAL = {1, 2, 7, 19}
# Slide 5 usa heading substituído ("Pergunta de pesquisa") — tratado abaixo separadamente.


def _is_editorial_note(line: str) -> bool:
    """Linha é anotação do autor dentro de blockquote (começa com _ ou vem como itálico isolado),
    não vai para o slide."""
    stripped = line.strip()
    if not stripped:
        return True
    if stripped == "---":
        return True
    # Blockquote em italic (ex.: _Substitui 'Hipótese'..._, _Qualificação — protótipo..._)
    if stripped.startswith("_") and stripped.endswith("_") and len(stripped) > 2:
        return True
    return False


def expected_text_per_slide(slides_content: dict[int, SlideContent]) -> dict[int, list[str]]:
    """Monta a representação esperada a partir do rascunho, para diff."""
    expected: dict[int, list[str]] = {}
    for num, content in slides_content.items():
        texts: list[str] = []
        if num == 5:
            texts.append(normalize_for_diff("Pergunta de pesquisa"))
        elif num not in _HEADING_IS_ORGANIZATIONAL:
            texts.append(normalize_for_diff(content.heading))
        for b in content.blockquote:
            if _is_editorial_note(b):
                continue
            n = normalize_for_diff(b)
            if n:
                texts.append(n)
        source_bullets = content.bullets_raw or content.bullets
        for b in source_bullets:
            n = normalize_for_diff(b)
            if n:
                texts.append(n)
        for p in content.paragraphs:
            if _is_editorial_note(p):
                continue
            # Paragraphs that are only an image markdown reference (![alt](path)) are not
            # expected to appear as text in the pptx — the image was inserted as a shape
            # (or logged as missing placeholder). Skip them.
            if _IMAGE_RE.fullmatch(p.strip()):
                continue
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

    Slides 16 (cronograma — truncamento aceitável) e 18 (referências — parágrafo
    editorial não renderizado) e qualquer linha contendo "[FALTA" só geram warning.
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
            if num in (16, 18) or "[FALTA" in exp:
                warnings.append(msg)
            else:
                errors.append(msg)
    return errors, warnings


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
        _test_parse_rascunho_detecta_16_slides,
        _test_parse_rascunho_slide_3_tem_4_bullets,
        _test_parse_rascunho_slide_1_tem_blockquote,
        _test_parse_rascunho_slide_16_tem_tabela,
        _test_parse_rascunho_slide_4_tem_uma_imagem_placeholder,
        _test_parse_rascunho_detecta_falta,
        _test_strip_inline_marks_bold,
        _test_strip_inline_marks_italic,
        _test_strip_inline_marks_combined,
        _test_normalize_for_diff_whitespace,
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


def _test_parse_rascunho_detecta_16_slides() -> None:
    slides = parse_rascunho(RASCUNHO_PATH.read_text(encoding="utf-8"))
    assert len(slides) == 16, f"esperado 16 slides, obtido {len(slides)}"
    expected_indices = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 17, 18, 19}
    assert set(slides.keys()) == expected_indices, f"keys: {sorted(slides.keys())}"


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


def _test_parse_rascunho_slide_16_tem_tabela() -> None:
    slides = parse_rascunho(RASCUNHO_PATH.read_text(encoding="utf-8"))
    s16 = slides[16]
    assert len(s16.table_rows) >= 2, "tabela do slide 16 deveria ter header + linhas"
    header = s16.table_rows[0]
    assert header == ["Atividades", "Ago", "Set", "Out", "Nov"], f"header: {header}"
    sus_row = next((r for r in s16.table_rows if "SUS" in r[0]), None)
    assert sus_row is not None, "linha SUS não encontrada"
    assert sus_row[4] == "X", "SUS deve ter X em Nov"


def _test_parse_rascunho_slide_4_tem_uma_imagem_placeholder() -> None:
    slides = parse_rascunho(RASCUNHO_PATH.read_text(encoding="utf-8"))
    s4 = slides[4]
    assert len(s4.images) == 1, f"esperado 1 imagem no slide 4 (V1 as-is×to-be): {s4.images}"
    path = s4.images[0][1].lower()
    assert "as-is" in path or "to-be" in path, f"path inesperado para V1: {path}"


def _test_parse_rascunho_detecta_falta() -> None:
    slides = parse_rascunho(RASCUNHO_PATH.read_text(encoding="utf-8"))
    s18 = slides[18]
    assert s18.has_falta, "slide 18 deveria ter has_falta=True (regulamento FMPFM)"


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


def main() -> int:
    check_dependencies()
    check_files_exist()

    from pptx import Presentation

    slides_content = parse_rascunho(RASCUNHO_PATH.read_text(encoding="utf-8"))
    prs = Presentation(str(TEMPLATE_PATH))

    # Expansão para 19 slides: o template Muller tem 14. Duplicamos o layout do slide 9
    # (Metodologia — título + bullets) para criar os slots 10 (Arquitetura) e 12 (Fluxo).
    # Inserimos slots EM BRANCO em 11 (p/ V2), 13 (p/ V3) e 15 (p/ screenshots do portal)
    # para o usuário posicionar as imagens manualmente após o build.
    # source_idx=8 (0-based) = slide 9 Metodologia — fica estável durante todas as inserções
    # porque todas acontecem em target_idx >= 9.
    # Após as duplicações: slides originais 10..14 ficam deslocados para 14..19 (índices 1-based).
    duplicate_slide_at(prs, source_idx=8, target_idx=9)       # cria slot 10 (Arquitetura)
    insert_blank_slide_at(prs, source_idx=8, target_idx=10)   # cria slot 11 (vazio p/ V2)
    duplicate_slide_at(prs, source_idx=8, target_idx=11)      # cria slot 12 (Fluxo)
    insert_blank_slide_at(prs, source_idx=8, target_idx=12)   # cria slot 13 (vazio p/ V3)
    insert_blank_slide_at(prs, source_idx=8, target_idx=14)   # cria slot 15 (vazio p/ screenshots)
    assert len(prs.slides) == 19, f"após duplicação esperávamos 19 slides, temos {len(prs.slides)}"

    GENERIC_SLIDES = {3, 6, 8, 9, 10, 12, 14, 17}
    BLOCKQUOTE_SLIDES = {1, 2, 5, 7, 19}
    SLIDES_WITH_IMAGE = {4}
    EMPTY_SLOTS = {11, 13, 15}

    slide_width = prs.slide_width
    slide_height = prs.slide_height

    for idx, slide in enumerate(prs.slides, start=1):
        if idx in EMPTY_SLOTS:
            print(f"Slide {idx}: slot vazio reservado para posicionamento manual.")
            continue
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
        elif idx == 16:
            logs = process_slide_16(slide, content)
        elif idx == 18:
            logs = process_slide_18(slide, content)
        else:
            logs = [f"ERRO: slide {idx} sem handler mapeado"]
        print(f"Slide {idx}: {'; '.join(logs) if logs else '(nada)'}")

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
