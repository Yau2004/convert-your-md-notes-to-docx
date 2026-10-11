"""Convert a limited Markdown subset into an in-memory Word document."""

from io import BytesIO

from docx import Document

HEADING1_PREFIX = "# "
HEADING2_PREFIX = "## "
LIST_PREFIX = "- "


def convert_markdown_to_docx(text: str) -> bytes:
    """Convert supported Markdown lines into DOCX bytes.

    Raises:
        ValueError: if the input is empty/whitespace-only, or contains
            characters that XML/DOCX cannot store.
    """
    if text.strip() == "":
        raise ValueError("輸入不能為空或全是空白。")

    _ensure_xml_safe(text)

    blocks = []
    for line in text.splitlines():
        if line.strip() == "":
            continue
        blocks.append(_classify_line(line))

    document = Document()
    for style_name, paragraph_text in blocks:
        document.add_paragraph(paragraph_text, style=style_name)

    buffer = BytesIO()
    document.save(buffer)
    return buffer.getvalue()


def _classify_line(line: str) -> tuple[str, str]:
    # Exact prefixes only: "### heading" and "  - item" stay as Normal text.
    if line.startswith(HEADING1_PREFIX) and not line.startswith("##"):
        return "Heading 1", line[len(HEADING1_PREFIX) :]
    if line.startswith(HEADING2_PREFIX) and not line.startswith("###"):
        return "Heading 2", line[len(HEADING2_PREFIX) :]
    if line.startswith(LIST_PREFIX):
        return "List Bullet", line[len(LIST_PREFIX) :]
    return "Normal", line


def _ensure_xml_safe(text: str) -> None:
    for character in text:
        if not _is_valid_xml_char(character):
            raise ValueError("輸入含有 Word 文件不接受的控制字元。")


def _is_valid_xml_char(character: str) -> bool:
    code = ord(character)
    if code in (0x9, 0xA, 0xD):
        return True
    if 0x20 <= code <= 0xD7FF:
        return True
    if 0xE000 <= code <= 0xFFFD:
        return True
    if 0x10000 <= code <= 0x10FFFF:
        return True
    return False
