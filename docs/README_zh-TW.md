# Naver Blog Image Downloader

[English](README_en-US.md)

一個用於自動下載 Naver Blog 文章中原始高畫質圖片的 Python 工具。

## 專案簡介

此工具使用 Playwright 自動化瀏覽器操作，從 Naver Blog 文章中擷取並下載所有原始圖片。支援自動切換電腦版頁面、處理圖片彈窗、並行下載等功能，能有效率地批次下載圖片並保持正確順序。

## 功能特色

- 自動擷取 Naver Blog 文章中的所有圖片
- 下載原始高畫質圖片（非縮圖）
- 自動處理手機版/電腦版頁面切換
- 支援並行下載，提升下載效率
- 自動按圖片編號排序，確保正確順序
- 提供詳細的擷取和下載結果統計
- Debug 模式支援，方便問題排查

## 專案結構

```text
.
├── data_models.py      # 資料模型定義（FetchResult、DownloadResult）
├── downloader.py       # 主程式（圖片擷取與下載邏輯）
├── helper.py           # 輔助函數（時間計算、Debug 輸出等）
├── pyproject.toml      # 專案配置與依賴管理
├── .env                # 環境變數設定檔
└── README.md           # 專案說明文件
```

## 環境需求

- Python 3.10 或以上版本
- uv（Python 套件與專案管理工具）

## 環境變數設定

將 `.envExample` 檔案重新命名為 `.env`：

```bash
mv .envExample .env
```

編輯 `.env` 檔案設定環境變數：

```env
# Debug 模式開關（設定為任意非空值即啟用 Debug 模式，例如：1 或 true）
DEBUG_MODE=
```

- `DEBUG_MODE`: 啟用後會在終端輸出詳細的執行過程訊息，方便除錯

## 安裝步驟

### 1. 安裝 uv

如果尚未安裝 uv，請參考 [uv 官方文件](https://docs.astral.sh/uv/getting-started/installation/)

### 2. 建立虛擬環境並安裝依賴

```bash
# 同步專案依賴（會自動建立虛擬環境）
uv sync
```

### 3. 安裝 Playwright 所需的瀏覽器執行環境

```bash
# 安裝所有瀏覽器 (包括 chromium, chromium-headless-shell, chromium-tip-of-tree-headless-shell, chrome, chrome-beta, msedge, msedge-beta, msedge-dev, _bidiChromium, firefox, webkit)
uv run playwright install
```

```bash
# 安裝特定的瀏覽器執行環境，例如 chromium-headless-shell
uv run playwright install chromium-headless-shell
```

## 使用方法

### 啟用 Debug 模式

```bash
# 臨時啟用（僅本次執行）
DEBUG_MODE=1 uv run downloader.py --url "https://blog.naver.com/your-blog-url"
```

或在 `.env` 檔案中設定 `DEBUG_MODE=1`。

### 使用 uv 直接執行

```bash
# 使用 uv run 執行（不需手動啟動虛擬環境）
uv run downloader.py --url "https://blog.naver.com/your-blog-url"
```

## 開發說明

### 安裝開發依賴

```bash
uv sync --group dev
```

### 程式碼格式檢查與修正

專案使用 Ruff 作為程式碼檢查與格式化工具：

```bash
# 檢查程式碼
uv run ruff check .

# 自動修正問題
uv run ruff check --fix .

# 格式化程式碼
uv run ruff format .
```

## 注意事項

- 請確保網路連線穩定
- 下載大量圖片時可能需要較長時間
- 某些 Naver Blog 文章可能有存取限制
- 建議搭配 Debug 模式進行問題排查

## 授權

本專案僅供學習與個人使用，請遵守 Naver 的使用條款。
