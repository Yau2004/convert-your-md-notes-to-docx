import { Document, Paragraph } from "docx";

const DOCX_ERROR = "輸入含有 Word 文件不接受的控制字元。";

export function parseMarkdown(text) {
  if (isBlank(text)) {
    throw new Error("輸入不能為空或全是空白。");
  }

  if (!isXml10Safe(text)) {
    throw new Error(DOCX_ERROR);
  }

  return text
    .split(/\r\n|[\n\r\u0085\u2028\u2029]/u)
    .filter((line) => !isBlank(line))
    .map(classifyLine);
}

function isBlank(text) {
  if (text === "") return true;
  for (const character of text) {
    const code = character.codePointAt(0);
    const whitespace =
      (code >= 0x0009 && code <= 0x000d) ||
      (code >= 0x001c && code <= 0x0020) ||
      code === 0x0085 ||
      code === 0x00a0 ||
      code === 0x1680 ||
      (code >= 0x2000 && code <= 0x200a) ||
      code === 0x2028 ||
      code === 0x2029 ||
      code === 0x202f ||
      code === 0x205f ||
      code === 0x3000;
    if (!whitespace) return false;
  }
  return true;
}

function classifyLine(line) {
  if (line.startsWith("# ") && !line.startsWith("##")) {
    return { type: "heading1", text: line.slice(2) };
  }
  if (line.startsWith("## ") && !line.startsWith("###")) {
    return { type: "heading2", text: line.slice(3) };
  }
  if (line.startsWith("- ")) {
    return { type: "bullet", text: line.slice(2) };
  }
  return { type: "paragraph", text: line };
}

function isXml10Safe(text) {
  for (const character of text) {
    const code = character.codePointAt(0);
    const allowed =
      code === 0x09 ||
      code === 0x0a ||
      code === 0x0d ||
      (code >= 0x20 && code <= 0xd7ff) ||
      (code >= 0xe000 && code <= 0xfffd) ||
      (code >= 0x10000 && code <= 0x10ffff);
    if (!allowed) return false;
  }
  return true;
}

export function createDocument(text) {
  const blocks = parseMarkdown(text);
  const children = blocks.map((block) => {
    if (block.type === "heading1") {
      return new Paragraph({ text: block.text, heading: "Heading1" });
    }
    if (block.type === "heading2") {
      return new Paragraph({ text: block.text, heading: "Heading2" });
    }
    if (block.type === "bullet") {
      return new Paragraph({ text: block.text, bullet: { level: 0 } });
    }
    return new Paragraph({ text: block.text });
  });
  return new Document({ sections: [{ children }] });
}
