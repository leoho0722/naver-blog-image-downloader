# CLAUDE.md

## 專案概述

Naver Blog 工具 API，部署於 AWS Lambda（容器映像模式）。透過模組化路由架構支援多個 API 端點。

## 程式結構

所有原始碼位於 `src/`，測試檔案位於 `tests/`。

### 路由層

- `src/app.py` — Lambda 入口點 `lambda_handler`，路由分派（async worker → path-based routing）
- `src/router.py` — 輕量級路由器（`@route` 裝飾器、`dispatch()`、`extract_route_info()`）
- `src/routes/` — 路由模組套件
  - `__init__.py` — 匯入所有路由模組，觸發 `@route` 裝飾器註冊
  - `photos.py` — `/api/photos`（POST）：圖片擷取（Playwright 爬取 + 非同步任務模式）
  - `whats_new.py` — `/api/whatsNew`（POST）：依版號與語系從 S3 取得新功能介紹（同步回應）

### 共用基礎設施

- `src/data_models.py` — `JobStatus` enum（PROCESSING/COMPLETED/FAILED）、`DownloadResult` dataclass
- `src/job_store/` — S3 儲存套件（OOP 架構）
  - `base.py` — `BaseStore`（ABC）：S3 CRUD 抽象介面（`_put_json`、`_get_json`、`_build_key`、`_file_suffix`）
  - `job.py` — `JobStore(BaseStore)`：任務 CRUD（`create_job`、`update_job`、`get_job`）
  - `log.py` — `LogStore(BaseStore)`：debug log 儲存（`save_logs`）
  - `whats_new.py` — `WhatsNewStore(BaseStore)`：新功能介紹資料讀寫（`get_whats_new`、`put_whats_new`、`list_versions`）
  - S3 key 格式：`jobs/{job_id}/{job_id}_results.json`、`jobs/{job_id}/{job_id}_logs.json`、`whatsnew/<version>/whats_new_<locale>.json`
- `src/helper.py` — 工具函式（debug 輸出、log 收集 `get_logs`/`clear_logs`、時間計算）
- `src/response_builder.py` — HTTP 回應格式建構（含 CORS headers）

### 管理腳本

- `scripts/manage_whats_new.py` — whatsNew JSON 管理 CLI（上傳/列出）
  - 用法：`uv run --with boto3 scripts/manage_whats_new.py upload -v 1.5.0 -l zh-TW -f mock/mock_whats_new_zh-TW.json`
  - 支援 `--dry-run`、`--dir` 批次上傳、`list` 子命令

### 測試

- `tests/api.http` — REST Client API 測試檔（變數從 `.env` 讀取）

## 路由架構

### 路由分派流程（`src/app.py:lambda_handler`）

1. **非同步 worker**：event 含 `_async_worker` 標記 → 依 `_worker_type` 分派至對應模組的 worker
2. **Path-based routing**：從 API Gateway v2 event 的 `rawPath`（自動移除 stage 前綴）+ `method` 查找 `@route` 註冊的 handler
3. 無匹配路由 → 回傳 404

### API Routes

| 路徑            | 方法 | 說明                                | 模式            |
| --------------- | ---- | ----------------------------------- | --------------- |
| `/api/photos`   | POST | 圖片擷取（action: download/status） | 非同步 + Polling |
| `/api/whatsNew` | POST | 依版號與語系從 S3 取得新功能介紹    | 同步回應        |

### 新增路由方式

1. 建立 `src/routes/new_feature.py`，以 `@route("/api/path", method="METHOD")` 裝飾 handler
2. 在 `src/routes/__init__.py` 中匯入新模組

### `/api/photos` 核心流程（非同步 + Polling）

1. **提交**（`action: "download"`）：建立 S3 job → Lambda 非同步自呼叫（`_worker_type: "photos"`）→ 回傳 HTTP 202 + `job_id`
2. **背景執行**：Playwright Chromium 擷取圖片 → 結果與 debug log 寫入 S3
   - 訪問 blog URL → 手機版自動切換桌面版
   - 進入 `mainFrame` iframe → 定位 `img.se-image-resource.egjs-visible`
   - 直接從元素的 `data-lazy-src`（優先）或 `src` 屬性提取縮圖 URL
   - 替換 `?type=` 參數為 `w3840` 取得最高解析度原圖
   - 去重 → 按檔名編號遞增排序
   - debug log 儲存至 S3（`jobs/{job_id}/{job_id}_logs.json`）
3. **輪詢**（`action: "status"`）：以 `job_id` 查詢 S3 → 回傳任務狀態與結果

## 開發慣例

- 程式碼註解與日誌使用正體中文
- Linter：Ruff，設定於 `pyproject.toml`（src 路徑已配置為 `src/`）
- 新增功能、重大變更或修正 bug 時，須同步更新 `pyproject.toml` 中的 `version` 欄位

## Commit 風格

使用正體中文撰寫 conventional commits：`<type>: <描述>`

常用 type：`feat`（新功能）、`fix`（修正）、`refactor`（重構）、`docs`（文件）、`chore`（雜項）、`ci`（CI/CD）、`test`（測試）

description（body）使用列點格式，例如：

```text
refactor(settings-view): 設定頁面 Cupertino → Material 3 重構

- 移除所有 Cupertino 元件
- 統一採用 Material 3 Card.filled + ListTile 呈現
```
