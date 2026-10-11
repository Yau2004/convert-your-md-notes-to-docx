# 課堂筆記轉 Word

將有限 Markdown 課堂筆記轉成 Word（`.docx`）。專案提供純前端網頁版與原有 Python／Streamlit 本機版。兩者都只依行首標記轉換，不會翻譯、摘要或改寫筆記。

## 網頁版

`docs/` 是 GitHub Pages 可直接發布的靜態網站。使用者打開網址後，在瀏覽器貼上 Markdown，按「轉換並下載 Word」即可下載 `lesson-notes.docx`，不需安裝程式或啟動伺服器。DOCX 在瀏覽器內產生，筆記不會上傳、記錄到 console 或儲存至瀏覽器。網站沒有追蹤工具或外部執行期服務。

網頁使用固定版本的 `docx` 套件。`web/` 是前端原始碼，使用 npm/esbuild 打包；訪客只需載入 `docs/` 中的靜態檔案。

### 建置網頁

需要 Node.js 和 npm（只供開發與建置）：

```powershell
npm ci
npm run build
npm test
```

建置會把程式打包到 `docs/app.js`。HTML 使用相對路徑載入資源，因此適用於 GitHub Pages 的 repository 子路徑。提交前可用本機靜態伺服器預覽 `docs/`。

### GitHub Pages 設定

目前本機 git branch 為 `main`，remote `origin` 指向 `https://github.com/Yau2004/convert-your-md-notes-to-docx.git`。以下是設定步驟，尚未推送或部署：

1. 在專案根目錄執行 `npm ci`、`npm run build`、`npm test`，再執行 `python -m pytest -q`。
2. 檢查並提交網頁原始碼、`package-lock.json` 和完整 `docs/` 產物，以及 README 更新。
3. 將變更推送到 GitHub 上實際使用的 branch（目前本機 branch 是 `main`；以 GitHub 上存在的 branch 為準）。
4. 在 GitHub repository 開啟 **Settings → Pages**。
5. 在 **Build and deployment** 選 **Deploy from a branch**。
6. 選擇包含最新變更的 branch，資料夾選 **`/docs`**，按 **Save**。
7. 等待 Pages 顯示部署完成，再開啟 GitHub Pages 提供的網址驗證轉換與下載。

尚未部署或從公開網址驗證前，本專案沒有已上線的網站網址。

## 本機 Streamlit 版

需要 Python 3.10 或更新版本：

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m streamlit run app.py
```

然後開啟終端機顯示的本機網址（通常為 `http://localhost:8501`）。此版保留既有 Python 轉換器及 Streamlit 介面。若需要部署 Python 版，請使用支援 Streamlit 的服務；GitHub Pages 只提供此專案的靜態網頁，不執行 Streamlit。

## 轉換規則

逐行處理輸入：

| 輸入 | DOCX 結果 |
| --- | --- |
| 以 `# ` 開頭 | Word Heading 1，移除前綴 |
| 以 `## ` 開頭 | Word Heading 2，移除前綴 |
| 行首無縮排的 `- ` | Word 項目符號列表，移除前綴 |
| 其他非空白行 | 普通段落，文字原樣保留 |
| 空白行 | 忽略 |

例如 `###`、`**粗體**`、HTML、縮排列項及其他未支援 Markdown 會保留為普通文字。空白輸入或 DOCX/XML 不接受的控制字元會顯示錯誤，不會產生文件。HTML 輸入以純文字處理，不會執行。

## 測試

```powershell
# Python／Streamlit 版
python -m pytest -q

# 前端轉換與 DOCX 結構
npm ci
npm test
```

Python 測試使用 python-docx 重新讀取 DOCX；前端測試檢查有效 ZIP/DOCX、文字順序、標題樣式與 Word 項目符號編號結構。

## 專案檔案

- `converter.py`、`app.py`：原有 Python 轉換器與 Streamlit 介面。
- `tests/`：Python 轉換器及 Streamlit app 測試。
- `web/`：純前端轉換器、介面和 Node.js 測試。
- `docs/`：GitHub Pages 靜態網站及打包後的可部署程式。
- `examples/sample.md`：中英文範例筆記。
- `package.json`、`package-lock.json`：固定前端依賴及建置／測試指令。
