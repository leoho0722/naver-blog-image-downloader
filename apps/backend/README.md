# Backend (AWS Lambda)

[繁體中文](docs/README_zh-TW.md) | [English](docs/README_en-US.md)

部署於 AWS Lambda（容器映像模式）的工具 API，透過模組化路由架構支援多個端點：`/api/photos`（Naver Blog 圖片擷取 + 圖片打包下載，採非同步 Polling）與 `/api/whatsNew`（依 App 版號與語系回傳新功能介紹）。

> 產品定位、系統架構、非同步 Polling 設計脈絡請參閱 monorepo root [README.md](../../README.md)。
> 共用規範（正體中文註解、Conventional Commits、版號管理）請參閱 monorepo root [CLAUDE.md](../../CLAUDE.md)。

## 專案架構

```text
.
├── src/                        # 原始碼
│   ├── app.py                  #   Lambda 入口點，路由分派
│   ├── router.py               #   輕量級路由器（@route 裝飾器）
│   ├── routes/                 #   路由模組套件
│   │   ├── __init__.py         #     匯入所有路由模組
│   │   ├── photos.py           #     /api/photos — 圖片擷取
│   │   └── whats_new.py        #     /api/whatsNew — 新功能介紹
│   ├── data_models.py          #   JobStatus / PackageStatus / PhotoAction enum、DownloadResult dataclass
│   ├── job_store/              #   S3 儲存套件（OOP 架構）
│   │   ├── base.py             #     BaseStore（ABC）
│   │   ├── job.py              #     JobStore — 任務 CRUD
│   │   ├── log.py              #     LogStore — debug log
│   │   ├── package.py          #     PackageStore — 打包任務 CRUD + ZIP 上傳 + 快取索引
│   │   └── whats_new.py        #     WhatsNewStore — 新功能介紹資料
│   ├── helper.py               #   輔助函數（時間計算、除錯輸出）
│   └── response_builder.py     #   HTTP Response Builder
├── tests/                      # 測試
│   └── api.http                #   REST Client API 測試檔
├── mock/                       # 測試用 mock 資料
├── scripts/                    # 部署腳本
│   ├── deploy-image.sh         #   建構並上傳 Docker 映像至 ECR
│   ├── update-function.sh      #   更新 Lambda 函數程式碼與設定
│   └── setup-aws-resources.sh  #   首次 AWS 資源初始化（S3、IAM、Lambda）
├── Dockerfile                  # 容器映像定義
├── Makefile                    # 部署相關指令
├── requirements.txt            # Python 依賴套件
└── pyproject.toml              # Ruff linter 設定
```

## 環境變數設定

將 `.envExample` 改名為 `.env`，並設定以下環境變數：

```bash
# AWS 認證資訊
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key

# AWS ECR 設定
AWS_ECR_REPOSITORY_URI=your_account_id.dkr.ecr.your_aws_region.amazonaws.com

# Lambda 函數設定
AWS_LAMBDA_FUNCTION_NAME=your_lambda_function_name

# S3 設定（非同步任務儲存）
S3_BUCKET_NAME=your_s3_bucket_name

# Docker 映像設定
IMAGE_NAME=your_lambda_container_image_name
IMAGE_TAG=latest
IMAGE_ARCH=linux/amd64
DOCKERFILE_PATH=Dockerfile

# 除錯模式（選填）
DEBUG_MODE=true
```

## 部署步驟

### 前置需求

- Docker
- AWS CLI
- AWS ECR Repository（需自行建立）
- AWS Lambda Function（需使用容器映像類型）
- AWS S3 Bucket（儲存非同步任務狀態，可透過 `scripts/setup-aws-resources.sh` 自動建立）

### 1. 建構並上傳 Docker 映像

```bash
make deploy-image
```

### 2. 更新 Lambda 函數

```bash
make update-function
```

### 3. 一次完成部署

```bash
make deploy
```

## API 使用方式

### `POST /api/photos` — 圖片擷取

#### 提交下載請求

```json
{
  "action": "download",
  "blog_url": "https://blog.naver.com/username/post_id"
}
```

回應（HTTP 202）：

```json
{
  "job_id": "uuid-string",
  "status": "processing"
}
```

#### 查詢任務狀態

```json
{
  "action": "status",
  "job_id": "uuid-string"
}
```

回應（完成，HTTP 200）：

```json
{
  "job_id": "uuid-string",
  "status": "completed",
  "result": {
    "total_images": 10,
    "successful_downloads": 10,
    "failure_downloads": 0,
    "image_urls": [
      "https://postfiles.pstatic.net/...",
      "https://postfiles.pstatic.net/..."
    ],
    "errors": [],
    "elapsed_time": 15.23
  }
}
```

### `POST /api/photos` — 圖片打包（Web 端下載用）

瀏覽器因 CORS 限制無法直接下載 Naver CDN 圖片，透過此功能在伺服器端打包為 ZIP 並產生 pre-signed 下載連結。支援快取：相同 job_id + indices 的重複請求會直接回傳現有 ZIP 的下載連結。

#### 提交打包請求

```json
{
  "action": "package",
  "job_id": "uuid-string",
  "indices": [0, 2, 4]
}
```

`indices` 為選填，省略時打包全部圖片。

回應（新任務，HTTP 202）：

```json
{
  "package_id": "uuid-string",
  "status": "processing"
}
```

回應（快取命中，HTTP 200）：

```json
{
  "package_id": "uuid-string",
  "status": "completed",
  "download_url": "https://s3...presigned-url",
  "file_count": 10,
  "file_size": 52428800
}
```

#### 查詢打包狀態

```json
{
  "action": "package_status",
  "package_id": "uuid-string"
}
```

回應（完成，HTTP 200）：

```json
{
  "package_id": "uuid-string",
  "status": "completed",
  "download_url": "https://s3...presigned-url",
  "file_count": 10,
  "file_size": 52428800
}
```

### `POST /api/whatsNew` — 新功能介紹

依 App 版號與語系從 S3 取得對應的新功能介紹資料。

S3 路徑格式：`whatsnew/<version>/whats_new_<locale>.json`

```json
{
  "version": "1.4.0",
  "locale": "zh-TW"
}
```

回應（HTTP 200）：

```json
{
  "version": "1.4.0",
  "onboarding": [...],
  "whatsNew": [...]
}
```

### 回應欄位說明（photos）

| 欄位 | 說明 |
|------|------|
| `job_id` | 任務 ID（用於輪詢查詢） |
| `status` | 任務狀態（`processing` / `completed` / `failed`） |
| `result.total_images` | 文章中找到的圖片總數 |
| `result.successful_downloads` | 成功取得 URL 的圖片數量 |
| `result.failure_downloads` | 處理失敗的圖片數量 |
| `result.image_urls` | 圖片 URL 清單 |
| `result.errors` | 錯誤訊息清單 |
| `result.elapsed_time` | 處理時間（秒） |

## CI/CD（GitHub Actions）

- **Backend CI**（`.github/workflows/backend-ci.yml`）：當 `apps/backend/**` 有變動時觸發，執行 Ruff lint + format 檢查。PR 事件下若檢查失敗會自動 `ruff --fix` 並 commit 回 PR branch；`push` 事件下若偵測到未 format 程式則直接 fail（防繞過）。
- **Backend CD**（`.github/workflows/backend-cd.yml`）：Backend CI 成功後透過 `workflow_run` 觸發，依序執行：
  1. 從 `apps/backend/pyproject.toml` 讀取 `project.version`，組成 `backend-v<semver>` tag
  2. 若該 tag 已存在即 fail（強制發版前先 bump version）
  3. 建構 Docker 映像（context = `apps/backend`，image tag = 純 semver）並推送至 ECR
  4. 更新 AWS Lambda 函數程式碼與設定（memory=2048MB、timeout=120s）
  5. 更新 IAM Policy（S3 jobs/whatsNew/packages 權限 + Lambda 自我呼叫權限）
  6. 取得自上次 tag 以來的 commit 記錄
  7. 透過 Ollama Cloud API（gemma4:31b-cloud）生成正體中文 Release Notes（fallback: 原始 commit log）
  8. 建立 git tag `backend-v<semver>` 並 push
  9. 發布 GitHub Release（title = `Backend v<semver>`）

**GitHub Secrets**（需手動設定於 monorepo）：`AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`AWS_REGION`、`AWS_ECR_REPOSITORY_URI`、`AWS_LAMBDA_FUNCTION_NAME`、`S3_BUCKET_NAME`、`OLLAMA_API_KEY`

**發版流程**：修改 `apps/backend/pyproject.toml` 的 `project.version` → 經 PR merge 到 main → Backend CI 綠 → Backend CD 自動觸發並建立 `backend-v<version>` release。

## Lambda 函數設定建議

- **Memory**: 2048 MB
- **Timeout**: 120 秒
- **Ephemeral storage**: 建議 512 MB 以上
- **Runtime**: Container Image

## 注意事項

1. 圖片擷取（download/status）僅回傳圖片 URL，不下載圖片；打包服務（package/package_status）會實際下載圖片並打包為 ZIP
2. 使用 Chromium 瀏覽器進行網頁操作，會消耗較多記憶體
3. 處理時間取決於文章中的圖片數量
4. S3 中的任務記錄會在 1 天後自動過期清除
