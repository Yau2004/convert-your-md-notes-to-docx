# 課堂筆記轉 Word

將有限 Markdown 課堂筆記轉成 Word（`.docx`）。專案提供免安裝的線上網頁版，以及 Python／Streamlit 本機版。兩者都只依行首標記轉換，不會翻譯、摘要或改寫筆記。

## 🌐 線上使用

👉 **[立即使用：課堂筆記轉 Word](https://yau2004.github.io/convert-your-md-notes-to-docx/)**

網站網址：https://yau2004.github.io/convert-your-md-notes-to-docx/

不需要下載此專案、安裝程式或啟動伺服器：

1. 開啟上方網站。
2. 貼上 Markdown 課堂筆記。
3. 按下「轉換並下載 Word」。
4. 取得 `lesson-notes.docx`。

### 隱私說明

DOCX 在你的瀏覽器內產生，筆記不會上傳、記錄到 console 或儲存至瀏覽器。網站沒有追蹤工具或外部執行期服務。

## 網頁版開發與部署

一般使用者直接開啟上方網站即可。以下內容僅供開發或自行部署使用。

### 專案結構

- `web/`：前端原始碼，使用 npm／esbuild 打包。
- `docs/`：GitHub Pages 使用的靜態網站與打包產物。

網頁使用固定版本的 `docx` 套件。訪客只需載入 `docs/` 中的靜態檔案。

### 建置網頁

需要 Node.js 和 npm：

```powershell
npm ci
npm run build
npm test
```

建置會把程式打包到 `docs/app.js`。HTML 使用相對路徑載入資源，適用於 GitHub Pages 的 repository 子路徑。提交前可用本機靜態伺服器預覽 `docs/`。

### 自行部署至 GitHub Pages

若你 fork 此專案並希望建立自己的網站：

1. 執行 `npm ci`、`npm run build`、`npm test`，以及 `python -m pytest -q`。
2. 將原始碼與完整的 `docs/` 建置產物提交並推送至你的 GitHub repository。
3. 開啟 repository 的 **Settings → Pages**。
4. 在 **Build and deployment** 選擇 **Deploy from a branch**。
5. 選擇包含最新建置產物的分支，資料夾選 **`/docs`**，按 **Save**。
6. 等待部署完成，使用 GitHub Pages 顯示的網址開啟網站，確認轉換與下載正常。

GitHub Pages 只提供此專案的靜態網頁，不執行 Python／Streamlit。
