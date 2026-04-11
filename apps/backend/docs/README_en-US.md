# Naver Blog Image Downloader Lambda

[繁體中文](README_zh-TW.md)

A utility API deployed on AWS Lambda with a modular routing architecture supporting multiple endpoints. Currently includes extracting high-quality image URLs from Naver Blog articles and a What's New feature. Uses **API Gateway v2 (HTTP API)** + **async polling** architecture.

## Project Structure

```text
.
├── src/                        # Source code
│   ├── app.py                  #   Lambda entry point, route dispatching
│   ├── router.py               #   Lightweight router (@route decorator)
│   ├── routes/                 #   Route module package
│   │   ├── __init__.py         #     Import all route modules
│   │   ├── photos.py           #     /api/photos — image extraction
│   │   └── whats_new.py        #     /api/whatsNew — What's New
│   ├── data_models.py          #   JobStatus enum, DownloadResult dataclass
│   ├── job_store/              #   S3 storage package (OOP architecture)
│   │   ├── base.py             #     BaseStore (ABC)
│   │   ├── job.py              #     JobStore — job CRUD
│   │   ├── log.py              #     LogStore — debug logs
│   │   └── whats_new.py        #     WhatsNewStore — What's New data
│   ├── helper.py               #   Helper functions (time, debug output)
│   └── response_builder.py     #   HTTP Response Builder
├── tests/                      # Tests
│   └── api.http                #   REST Client API test file
├── mock/                       # Mock data for testing
├── scripts/                    # Deployment scripts
│   ├── deploy-image.sh         #   Build and upload Docker image to ECR
│   ├── update-function.sh      #   Update Lambda function code and config
│   └── setup-aws-resources.sh  #   First-time AWS resource init (S3, IAM, Lambda)
├── Dockerfile                  # Container image definition
├── Makefile                    # Deployment commands
├── requirements.txt            # Python dependencies
└── pyproject.toml              # Ruff linter configuration
```

## Environment Variables

Rename `.envExample` to `.env` and configure the following:

```bash
# AWS Credentials
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key

# AWS ECR Configuration
AWS_ECR_REPOSITORY_URI=your_account_id.dkr.ecr.your_aws_region.amazonaws.com

# Lambda Function Configuration
AWS_LAMBDA_FUNCTION_NAME=your_lambda_function_name

# S3 Configuration (async job storage)
S3_BUCKET_NAME=your_s3_bucket_name

# Docker Image Configuration
IMAGE_NAME=your_lambda_container_image_name
IMAGE_TAG=latest
IMAGE_ARCH=linux/amd64
DOCKERFILE_PATH=Dockerfile

# Debug Mode (Optional)
DEBUG_MODE=true
```

## Deployment

### Prerequisites

- Docker
- AWS CLI
- AWS ECR Repository (create manually)
- AWS Lambda Function (must use container image type)
- AWS S3 Bucket (stores async job state, can be created via `scripts/setup-aws-resources.sh`)

### 1. Build and Upload Docker Image

```bash
make deploy-image
```

### 2. Update Lambda Function

```bash
make update-function
```

### 3. Complete Deployment in One Step

```bash
make deploy
```

## API Usage

### `POST /api/photos` — Image Extraction

#### Submit a Download Request

```json
{
  "action": "download",
  "blog_url": "https://blog.naver.com/username/post_id"
}
```

Response (HTTP 202):

```json
{
  "job_id": "uuid-string",
  "status": "processing"
}
```

#### Query Job Status

```json
{
  "action": "status",
  "job_id": "uuid-string"
}
```

Response (completed, HTTP 200):

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

### `POST /api/whatsNew` — What's New

Retrieves What's New data from S3 based on app version and locale.

S3 path format: `whatsnew/<version>/whats_new_<locale>.json`

```json
{
  "version": "1.4.0",
  "locale": "zh-TW"
}
```

Response (HTTP 200):

```json
{
  "version": "1.4.0",
  "onboarding": [...],
  "whatsNew": [...]
}
```

### Response Fields (photos)

| Field                         | Description                                      |
| ----------------------------- | ------------------------------------------------ |
| `job_id`                      | Job ID (used for polling)                        |
| `status`                      | Job status (`processing` / `completed` / `failed`) |
| `result.total_images`         | Total number of images found in the article      |
| `result.successful_downloads` | Number of images with URLs successfully retrieved |
| `result.failure_downloads`    | Number of images that failed to process          |
| `result.image_urls`           | List of image URLs                               |
| `result.errors`               | List of error messages                           |
| `result.elapsed_time`         | Processing time (in seconds)                     |

## CI/CD (GitHub Actions)

- **CI** (`.github/workflows/ci.yml`): Triggered on push to any branch and PRs to main. Runs Ruff lint + format checks.
- **CD** (`.github/workflows/cd.yml`): Triggered on push to main. Executes in order:
  1. Build Docker image and push to ECR
  2. Update AWS Lambda function code and configuration
  3. Update IAM Policy (S3 + Lambda self-invoke permissions)
  4. Create git tag (`vYYMMDD.RUN_NUMBER`)
  5. Generate release notes via Ollama Cloud API
  6. Publish GitHub Release

**GitHub Secrets** (manual setup required): `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_ECR_REPOSITORY_URI`, `AWS_LAMBDA_FUNCTION_NAME`, `S3_BUCKET_NAME`, `OLLAMA_API_KEY`

## Lambda Function Configuration

- **Memory**: 2048 MB
- **Timeout**: 120 seconds
- **Ephemeral storage**: 512 MB or higher recommended
- **Runtime**: Container Image

## Notes

1. This service only extracts image URLs and does not download image files
2. Uses a Chromium browser for web operations, which consumes more memory
3. Processing time depends on the number of images in the article
4. Job records in S3 are automatically expired and cleaned up after 1 day
