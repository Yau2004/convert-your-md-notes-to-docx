import streamlit as st

from converter import convert_markdown_to_docx

DOCX_MIME = (
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
)
DOWNLOAD_NAME = "lesson-notes.docx"

st.set_page_config(page_title="課堂筆記轉 Word", layout="centered")
st.title("課堂筆記轉 Word")
st.write(
    "把簡單的課堂筆記（有限 Markdown 子集）轉成 Word（.docx）。"
    "程式只依行首標記轉換，不會改寫或翻譯內容。"
)

st.subheader("支援的格式")
st.markdown(
    """
- `# 標題` → Word 標題 1
- `## 標題` → Word 標題 2
- `- 項目` → Word 項目符號列表（List Bullet）
- 其他非空白行 → 普通段落（行內 Markdown 原樣保留）
- 空白行會被忽略
"""
)
st.caption(
    "不支援巢狀列表、表格、圖片、程式碼區塊、粗體等。"
    "例如 `### 標題`、`**粗體**` 會當成普通文字。"
)

if "docx_bytes" not in st.session_state:
    st.session_state.docx_bytes = None
    st.session_state.source_text = None

notes = st.text_area(
    "課堂筆記",
    height=280,
    placeholder="# 資料結構複習\n## 重點\n- 先寫定義\n再寫自己的例子。",
)

if st.button("轉換成 Word"):
    try:
        st.session_state.docx_bytes = convert_markdown_to_docx(notes)
        st.session_state.source_text = notes
        st.success("轉換成功，可以下載 Word 檔。")
    except ValueError as error:
        st.session_state.docx_bytes = None
        st.session_state.source_text = None
        st.error(str(error))

can_download = (
    st.session_state.docx_bytes is not None
    and st.session_state.source_text == notes
)
if can_download:
    st.download_button(
        label="下載 lesson-notes.docx",
        data=st.session_state.docx_bytes,
        file_name=DOWNLOAD_NAME,
        mime=DOCX_MIME,
    )
elif notes != (st.session_state.source_text or "") and st.session_state.docx_bytes:
    st.info("筆記已修改，請重新轉換後再下載，以免下載到舊內容。")
