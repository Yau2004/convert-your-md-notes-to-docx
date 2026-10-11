import assert from "node:assert/strict";
import test from "node:test";
import JSZip from "jszip";
import { Packer } from "docx";
import { createDocument, parseMarkdown } from "./converter.js";

test("converts headings, bullets, paragraphs and Unicode in source order", () => {
  assert.deepEqual(
    parseMarkdown("# 中文 Review\n一般段落 café 🎉\n## 重點\n- 第一項\n- second"),
    [
      { type: "heading1", text: "中文 Review" },
      { type: "paragraph", text: "一般段落 café 🎉" },
      { type: "heading2", text: "重點" },
      { type: "bullet", text: "第一項" },
      { type: "bullet", text: "second" },
    ],
  );
});

test("keeps unsupported markup, indented list markers and meaningful spaces", () => {
  assert.deepEqual(
    parseMarkdown("### title\n**bold**\n<b>html</b>\n  - indented\n  trailing  "),
    [
      { type: "paragraph", text: "### title" },
      { type: "paragraph", text: "**bold**" },
      { type: "paragraph", text: "<b>html</b>" },
      { type: "paragraph", text: "  - indented" },
      { type: "paragraph", text: "  trailing  " },
    ],
  );
});

test("ignores blank lines and accepts LF, CRLF, CR and Unicode line separators", () => {
  const lf = parseMarkdown("first\n\nsecond\n");
  assert.deepEqual(parseMarkdown("first\r\n\r\nsecond\r"), lf);
  assert.deepEqual(parseMarkdown("first\rsecond"), lf);
  assert.deepEqual(parseMarkdown("first\u2028second"), lf);
});

test("rejects empty input and XML-invalid control characters without altering text", () => {
  for (const value of ["", "  \n\t"]) {
    assert.throws(() => parseMarkdown(value), /輸入不能為空/);
  }
  for (const value of ["hello\u0000world", "bad\uFFFEchar"]) {
    assert.throws(() => parseMarkdown(value), /控制字元/);
  }
});

test("preserves a legal nonbreaking formatting character as text", () => {
  assert.deepEqual(parseMarkdown("\uFEFF"), [{ type: "paragraph", text: "\uFEFF" }]);
});

test("creates a valid DOCX package with text, heading styles and real list numbering", async () => {
  const source = "# 中文 Review\n段落 <b>保留</b>\n## 第二節\n- 第一項\n- second\n  有意義空白  ";
  const buffer = await Packer.toBuffer(createDocument(source));
  assert.equal(buffer.subarray(0, 2).toString(), "PK");

  const zip = await JSZip.loadAsync(buffer);
  const documentXml = await zip.file("word/document.xml").async("string");
  const numberingXml = await zip.file("word/numbering.xml").async("string");
  assert.match(documentXml, /<w:pStyle w:val="Heading1"\/>/);
  assert.match(documentXml, /<w:pStyle w:val="Heading2"\/>/);
  assert.equal((documentXml.match(/<w:numPr>/g) ?? []).length, 2);
  assert.match(numberingXml, /<w:numFmt w:val="bullet"\/>/);

  const visibleText = [...documentXml.matchAll(/<w:t(?: xml:space="preserve")?>(.*?)<\/w:t>/g)]
    .map((match) => match[1]
      .replaceAll("&amp;", "&")
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("&quot;", '"')
      .replaceAll("&apos;", "'"));
  assert.deepEqual(visibleText, ["中文 Review", "段落 <b>保留</b>", "第二節", "第一項", "second", "  有意義空白  "]);
  assert.match(documentXml, /<w:t xml:space="preserve">  有意義空白  <\/w:t>/);
});
