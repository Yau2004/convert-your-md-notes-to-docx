from io import BytesIO

import pytest
from docx import Document

from converter import convert_markdown_to_docx


def _paragraphs(docx_bytes: bytes) -> list[tuple[str, str]]:
    document = Document(BytesIO(docx_bytes))
    return [(paragraph.text, paragraph.style.name) for paragraph in document.paragraphs]


def test_heading1_and_heading2_text_and_style() -> None:
    result = convert_markdown_to_docx("# Title One\n## Title Two")
    assert _paragraphs(result) == [
        ("Title One", "Heading 1"),
        ("Title Two", "Heading 2"),
    ]


def test_normal_paragraph() -> None:
    result = convert_markdown_to_docx("This is a normal sentence.")
    assert _paragraphs(result) == [("This is a normal sentence.", "Normal")]


def test_consecutive_list_items_use_list_bullet_style() -> None:
    result = convert_markdown_to_docx("- first\n- second\n- third")
    assert _paragraphs(result) == [
        ("first", "List Bullet"),
        ("second", "List Bullet"),
        ("third", "List Bullet"),
    ]
    for text, style_name in _paragraphs(result):
        assert not text.startswith("•")
        assert style_name == "List Bullet"


def test_blank_lines_are_ignored() -> None:
    result = convert_markdown_to_docx("first\n\n\nsecond\n")
    assert _paragraphs(result) == [
        ("first", "Normal"),
        ("second", "Normal"),
    ]


@pytest.mark.parametrize("empty_input", ["", "   ", "\n\t\n  "])
def test_empty_or_whitespace_input_raises(empty_input: str) -> None:
    with pytest.raises(ValueError, match="空白"):
        convert_markdown_to_docx(empty_input)


def test_chinese_english_and_unicode_are_preserved() -> None:
    source = "# 複習 Review\ncafé 與 π 約等於 3.14 🎉"
    result = convert_markdown_to_docx(source)
    assert _paragraphs(result) == [
        ("複習 Review", "Heading 1"),
        ("café 與 π 約等於 3.14 🎉", "Normal"),
    ]


def test_lf_and_crlf_produce_the_same_document() -> None:
    lf_text = "# Title\n- item\nparagraph"
    crlf_text = "# Title\r\n- item\r\nparagraph"
    assert _paragraphs(convert_markdown_to_docx(lf_text)) == _paragraphs(
        convert_markdown_to_docx(crlf_text)
    )


def test_unsupported_syntax_is_kept_as_normal_text() -> None:
    source = "### Heading\n**bold**\n<b>text</b>"
    result = convert_markdown_to_docx(source)
    assert _paragraphs(result) == [
        ("### Heading", "Normal"),
        ("**bold**", "Normal"),
        ("<b>text</b>", "Normal"),
    ]


def test_indented_dash_is_not_a_list() -> None:
    result = convert_markdown_to_docx("  - item")
    assert _paragraphs(result) == [("  - item", "Normal")]


def test_mixed_blocks_keep_source_order() -> None:
    source = "# 課堂筆記\n前言段落\n## 重點\n- 第一項\n- 第二項\n結尾段落"
    result = convert_markdown_to_docx(source)
    assert _paragraphs(result) == [
        ("課堂筆記", "Heading 1"),
        ("前言段落", "Normal"),
        ("重點", "Heading 2"),
        ("第一項", "List Bullet"),
        ("第二項", "List Bullet"),
        ("結尾段落", "Normal"),
    ]


def test_invalid_xml_control_characters_raise() -> None:
    with pytest.raises(ValueError, match="控制字元"):
        convert_markdown_to_docx("hello\x00world")
