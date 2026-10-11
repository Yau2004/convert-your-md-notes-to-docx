import { Packer } from "docx";
import { Buffer } from "buffer";
import { createDocument } from "./converter.js";
import sample from "../examples/sample.md";

globalThis.Buffer ??= Buffer;

const form = document.querySelector("#notes-form");
const input = document.querySelector("#notes");
const status = document.querySelector("#status");
const convertButton = document.querySelector("#convert");
const clearButton = document.querySelector("#clear");
const exampleButton = document.querySelector("#example");
let generatedBlob = null;
let generatedSource = null;

function invalidateDownload() {
  generatedBlob = null;
  generatedSource = null;
}

function showStatus(message, kind = "info") {
  status.textContent = message;
  status.dataset.kind = kind;
  status.hidden = message === "";
}

input.addEventListener("input", () => {
  if (generatedBlob && input.value !== generatedSource) {
    invalidateDownload();
    showStatus("筆記已修改，請重新轉換後再下載。", "info");
  } else if (!generatedBlob) {
    showStatus("", "info");
  }
});

exampleButton.addEventListener("click", () => {
  input.value = sample.trimEnd();
  invalidateDownload();
  showStatus("已載入範例。", "info");
  input.focus();
});

clearButton.addEventListener("click", () => {
  input.value = "";
  invalidateDownload();
  showStatus("已清空筆記。", "info");
  input.focus();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (convertButton.disabled) return;

  invalidateDownload();
  convertButton.disabled = true;
  showStatus("正在產生 Word 文件…", "info");
  try {
    const source = input.value;
    const doc = createDocument(source);
    const blob = await Packer.toBlob(doc);
    if (input.value !== source) {
      showStatus("轉換期間筆記有變更，請重新轉換。", "error");
      return;
    }
    generatedBlob = blob;
    generatedSource = source;
    showStatus("轉換成功，可以下載 Word 檔。", "success");
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lesson-notes.docx";
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    showStatus(error instanceof Error ? error.message : "轉換失敗，請稍後再試。", "error");
  } finally {
    convertButton.disabled = false;
  }
});
