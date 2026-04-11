# Naver Blog Image Downloader Lambda

[繁體中文](README_zh-TW.md) | [English](README_en-US.md)

這是一個部署在 AWS Lambda 上的工具 API，透過模組化路由架構支援多個端點。目前包含從 Naver Blog 文章擷取高畫質圖片 URL，以及新功能介紹等功能。採用 **API Gateway v2 (HTTP API)** + **非同步 Polling** 架構。

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
│   ├── data_models.py          #   JobStatus enum、DownloadResult dataclass
│   ├── job_store/              #   S3 儲存套件（OOP 架構）
│   │   ├── base.py             #     BaseStore（ABC）
│   │   ├── job.py              #     JobStore — 任務 CRUD
│   │   ├── log.py              #     LogStore — debug log
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

| 欄位                          | 說明                                        |
| ----------------------------- | ------------------------------------------- |
| `job_id`                      | 任務 ID（用於輪詢查詢）                    |
| `status`                      | 任務狀態（`processing` / `completed` / `failed`） |
| `result.total_images`         | 文章中找到的圖片總數                        |
| `result.successful_downloads` | 成功取得 URL 的圖片數量                     |
| `result.failure_downloads`    | 處理失敗的圖片數量                          |
| `result.image_urls`           | 圖片 URL 清單                               |
| `result.errors`               | 錯誤訊息清單                                |
| `result.elapsed_time`         | 處理時間（秒）                              |

## CI/CD（GitHub Actions）

- **CI**（`.github/workflows/ci.yml`）：所有分支 push 及 PR 到 main 時觸發，執行 Ruff lint + format 檢查
- **CD**（`.github/workflows/cd.yml`）：push 到 main 時觸發，依序執行：
  1. 建構 Docker 映像並推送至 ECR
  2. 更新 AWS Lambda 函數程式碼與設定
  3. 更新 IAM Policy（S3 + Lambda 自我呼叫權限）
  4. 建立 git tag（`vYYMMDD.RUN_NUMBER`）
  5. 透過 Ollama Cloud API 生成正體中文 Release Notes
  6. 發布 GitHub Release

**GitHub Secrets**（需手動設定）：`AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`AWS_REGION`、`AWS_ECR_REPOSITORY_URI`、`AWS_LAMBDA_FUNCTION_NAME`、`S3_BUCKET_NAME`、`OLLAMA_API_KEY`

## Lambda 函數設定建議

- **Memory**: 2048 MB
- **Timeout**: 120 秒
- **Ephemeral storage**: 建議 512 MB 以上
- **Runtime**: Container Image

## 注意事項

1. 此服務僅擷取圖片 URL，不實際下載圖片檔案
2. 使用 Chromium 瀏覽器進行網頁操作，會消耗較多記憶體
3. 處理時間取決於文章中的圖片數量
4. S3 中的任務記錄會在 1 天後自動過期清除
