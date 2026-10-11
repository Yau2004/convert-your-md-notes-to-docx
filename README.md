# 課堂筆記轉 Word

把簡單的課堂 Markdown 筆記轉成 Word（`.docx`）。這是面試用的小型 MVP，只支援有限的 Markdown 子集，不是完整 Markdown 轉換器。

## 它解決什麼問題

寫課堂筆記時常用 `#`、`##`、`-` 和普通段落。這個工具把這些行轉成對應的 Word 標題、項目符號與段落，方便下載後在 Word 裡閱讀或列印。

它不會翻譯、摘要或改寫內容，也不會還原完整 Markdown 或各系統的像素級版面。

## 環境安裝

需要本機已安裝 Python 3.10 或更新版本。雲端部署請使用 Python 3.12（見下方「線上部署」）。

不要把 Conda 環境資料夾或 `.venv` 上傳到 GitHub。

在專案資料夾執行：

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

若使用本機 Conda 環境 `md2docx`：

```powershell
conda activate md2docx
python -m pip install -r requirements.txt
```

macOS / Linux：

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

## 啟動介面

```powershell
python -m streamlit run app.py
```

瀏覽器開啟終端機顯示的本機網址（通常是 `http://localhost:8501`）。

## 測試

```powershell
python -m pytest -q
```

測試會用 python-docx 把產生的 bytes 重新開啟，檢查段落文字、順序與樣式。沒有用 mock 取代真正的 DOCX 產生。

## 支援與未支援的語法

逐行處理輸入：

| 輸入 | 結果 |
| --- | --- |
| 以 `# ` 開頭 | 去掉前綴，Word Heading 1 |
| 以 `## ` 開頭 | 去掉前綴，Word Heading 2 |
| 以 `- ` 開頭（行首無縮排） | 去掉前綴，Word List Bullet |
| 其他非空白行 | 普通段落，文字原樣保留 |
| 空白行 | 忽略，不產生空白段落 |

未支援語法（例如 `### 標題`、`**bold**`、`<b>text</b>`、有縮排的 `- 項目`）會當成普通文字保留，不會刪除。

空字串或全空白輸入會失敗，介面顯示提示，不會提供空文件下載。含有 DOCX/XML 不接受的控制字元時也會回報錯誤，不會默默刪改內容。

## 範例輸入

見 `examples/sample.md`：

```markdown
# 資料結構複習
## Lists
今天複習 linked list 的基本操作。

- 節點含 data 與 next
- 已知位置時，插入與刪除是 O(1)

Next class: 樹與圖。

### 這個標題不會變成 Heading 3
**bold** 與 <b>text</b> 會原樣保留
  - 這行有縮排，不是列表
```

## 架構

- `converter.py`：核心函數 `convert_markdown_to_docx(text) -> bytes`，在記憶體產生 DOCX，不依賴 Streamlit。
- `app.py`：繁體中文 Streamlit 介面（貼上文字、轉換、下載）。
- `tests/test_converter.py`：轉換規則測試。
- `tests/test_app.py`：確認 app 可載入且沒有 exception（不驗證瀏覽器下載）。
- `examples/sample.md`：中英文示範。
- `requirements.txt`：`python-docx`、`streamlit`、`pytest`。
- `pytest.ini`：把專案根目錄加入測試的 Python 路徑。

## 線上部署

狀態：**待部署**。目前沒有公開網址，也還沒有連到 GitHub 的 Streamlit Community Cloud 應用。

目標是讓使用者打開公開網址就能用，不必安裝 Python。DOCX 仍用下載按鈕取得。平台是 [Streamlit Community Cloud](https://docs.streamlit.io/deploy/streamlit-community-cloud/deploy-your-app/deploy)，不是 GitHub Pages。

GitHub repository 必須以**本專案資料夾**為根目錄（根目錄要看得到 `app.py`、`converter.py`、`requirements.txt`）。不要把上層「Cursor Project」整包推上去，也不要上傳 `.venv`、Conda 環境或個人 `.docx`。

### 資料如何處理

線上版的筆記會送到執行 Streamlit 的雲端伺服器運算，**不是**完全在使用者瀏覽器裡轉換。

本專案的實作：輸入與產生的 DOCX bytes 存在該次連線的 Streamlit `session_state`；不會寫到固定檔案、資料庫，也不會把筆記全文寫進程式裡的 `print`。Session 結束後，本程式沒有自己的持久儲存。

這不代表平台或主機完全不保存任何資料。Streamlit Community Cloud 可能有部署日誌、連線紀錄或其他平台層行為；本 README 不宣稱「完全不留存」。本專案也沒有登入，公開網址上的人都可以使用。

### 放到 GitHub

請在 GitHub 建立**你自己的** repository，然後把本專案檔案推上去。以下是步驟，**尚未執行**：

1. 在 GitHub 網站建立新 repository（建議公開，Community Cloud 連公開 repo 較單純；私有 repo 需額外授權）。
2. 在本機於 `lesson-notes-to-docx` 目錄初始化 git（若還沒有以這個資料夾為根的 repo）。
3. 確認 `.gitignore` 已排除虛擬環境、快取、`.env`、`.streamlit/secrets.toml` 與個人 `.docx`。
4. `git add` 程式、測試、`examples/`、`requirements.txt`、`README.md` 等部署所需檔案。
5. commit，再 `git remote add` 你的 GitHub URL 並 `git push`。

不要使用虛構的 repository URL。推上去之後，記下實際的 GitHub 網址與 branch 名稱（可能是 `main` 或 `master`，以你推送的為準）。

### 連接 Streamlit Community Cloud

以下依撰寫時的[官方部署說明](https://docs.streamlit.io/deploy/streamlit-community-cloud/deploy-your-app/deploy)。若網站按鈕文字改版，以當時畫面為準。

1. 開啟 [share.streamlit.io](https://share.streamlit.io)，用 GitHub 登入。
2. 依提示授權 Streamlit 讀取 GitHub（公開 repo 與私有 repo 的權限不同）。
3. 點 **Create app**。若問是否已有 app，選表示已有既有程式的選項（文件中的文字為 “Yup, I have an app.”）。
4. 填入：
   - **Repository**：你剛推上去的 GitHub repo
   - **Branch**：你實際推送的 branch
   - **Main file path / file path**：`app.py`
5. 點 **Advanced settings**：
   - **Python version** 選 **3.12**（文件寫撰寫時預設也是 3.12，仍請明確選擇）
   - 本專案不需要 Secrets
6. 儲存後部署。

部署完成後，平台會給一個 `*.streamlit.app` 子網域。未部署前沒有可用的公開網址。若部署時沒填自訂子網域，網址由 GitHub 使用者、repo 名稱等組成，以平台實際顯示為準。

### 查看日誌與啟動錯誤

有 repository **寫入權限**的人，可在應用畫面右側看到 Community Cloud 日誌（文件說明無權限的訪客看不到）。

常見啟動問題：

- `ModuleNotFoundError: converter`：repo 根目錄沒有 `converter.py`，或 Main file path 指錯子資料夾。
- `ModuleNotFoundError: docx` / `streamlit`：`requirements.txt` 沒進 repo，或不在 Cloud 會搜尋的位置（入口檔同一層或 repo 根目錄）。
- 依賴安裝失敗：看日誌裡 pip 錯誤；本專案依賴已釘選 `python-docx==1.1.2`、`streamlit==1.40.2`，並在本機 Python 3.12 驗證過。
- App 能開但轉換失敗：多半是輸入規則（空白、控制字元），與部署無關。

Python 版本在部署後不能直接改；文件說明需刪除應用再重新部署才能換版本。

## 已知限制

- 只支援上述行首標記，不是完整 Markdown。
- 不解讀行內格式、表格、圖片、程式碼區塊或巢狀列表。
- 不保證不同作業系統或 Word 版本的字體、間距完全一致。
- 第一版沒有檔案上傳。
- 瀏覽器下載與 Word 開啟外觀需人工檢查；自動化測試沒有操作真實瀏覽器。
- 線上版尚未部署；公開網址與雲端行為需部署後再驗。

## 人工驗證步驟

1. 安裝依賴並執行 `python -m pytest -q`，確認測試通過。
2. 執行 `python -m streamlit run app.py`。
3. 將 `examples/sample.md` 貼進文字框，按「轉換成 Word」，下載 `lesson-notes.docx`，用 Word 開啟。
4. 確認標題 1、標題 2、項目符號、普通段落與未支援語法的原文都在，且順序正確。
5. 修改文字後，確認不會繼續下載「看起來對應新內容、實際是舊檔」的結果；需再按一次轉換。
6. 清空輸入再轉換，應看到錯誤提示，且沒有下載按鈕。
7. 部署到 Community Cloud 後，用公開網址重複步驟 3–6（目前待部署）。
