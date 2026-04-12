## ADDED Requirements

### Requirement: Package action accepts job_id and optional indices

The `/api/photos` endpoint SHALL accept `action: "package"` requests with a `job_id` (required) and an optional `indices` array of integers. When `indices` is omitted, all images from the original job SHALL be packaged. The endpoint SHALL return HTTP 202 with a `package_id` and `status: "processing"`.

#### Scenario: Package all images from a completed job

- **WHEN** client sends `{ "action": "package", "job_id": "<valid-job-id>" }` and the job status is "completed"
- **THEN** the system returns HTTP 202 with `{ "package_id": "<uuid>", "status": "processing" }`

#### Scenario: Package selected images by indices

- **WHEN** client sends `{ "action": "package", "job_id": "<valid-job-id>", "indices": [0, 2, 4] }`
- **THEN** the system packages only the images at positions 0, 2, and 4 from the job's `image_urls` array

#### Scenario: Package request with invalid job_id

- **WHEN** client sends `{ "action": "package", "job_id": "<non-existent-id>" }`
- **THEN** the system returns HTTP 404 with `{ "error": "任務不存在" }`

#### Scenario: Package request with missing job_id

- **WHEN** client sends `{ "action": "package" }` without `job_id`
- **THEN** the system returns HTTP 400 with `{ "error": "缺少 job_id 參數" }`

### Requirement: Package cache reuses existing ZIP for same job and indices

When a `package` request arrives, the system SHALL compute a cache key from `job_id` and sorted `indices` (using `SHA-256(job_id + ":" + sorted(indices).join(","))`, first 16 characters). The system SHALL query existing packages in S3 for a matching `cache_key` with status "completed". If a matching completed package is found and the ZIP file still exists in S3, the system SHALL return HTTP 200 with the existing `package_id` and a freshly generated pre-signed URL, without triggering a new worker. If no match is found, the system SHALL proceed with creating a new package.

#### Scenario: Reuse existing completed package

- **WHEN** client sends `{ "action": "package", "job_id": "abc", "indices": [0, 1, 2] }` and a completed package with the same cache key exists in S3
- **THEN** the system returns HTTP 200 with the existing `package_id`, a new pre-signed `download_url`, `file_count`, and `file_size`

#### Scenario: No cache match proceeds normally

- **WHEN** client sends `{ "action": "package", "job_id": "abc", "indices": [0, 1, 2] }` and no completed package with matching cache key exists
- **THEN** the system creates a new package job and returns HTTP 202 with a new `package_id`

#### Scenario: Cache key with all images (no indices)

- **WHEN** client sends `{ "action": "package", "job_id": "abc" }` without indices and a cached package for all images exists
- **THEN** the system returns the cached result (cache key uses `"all"` as the indices component)

#### Scenario: Expired cache (ZIP deleted by lifecycle)

- **WHEN** a completed package exists in metadata but the ZIP file has been deleted by S3 lifecycle policy
- **THEN** the system treats it as a cache miss and creates a new package

### Requirement: Package worker downloads images and creates ZIP

The package worker SHALL use `httpx.AsyncClient` to concurrently download images from Naver CDN to Lambda `/tmp`. The worker SHALL package all downloaded images into a ZIP file using Python `zipfile` module, upload the ZIP to S3 at `packages/{package_id}/images.zip`, and update the package status to "completed" with a pre-signed S3 download URL valid for 1 hour.

#### Scenario: Successful packaging of all images

- **WHEN** the package worker processes a request with 10 valid image URLs
- **THEN** the worker downloads all 10 images, creates a ZIP file, uploads to S3 at `packages/{package_id}/images.zip`, and updates status to "completed" with `download_url`, `file_count: 10`, and `file_size` in bytes

#### Scenario: Partial download failure during packaging

- **WHEN** the worker fails to download 2 out of 10 images
- **THEN** the worker packages the 8 successfully downloaded images into the ZIP file and updates status to "completed" with `file_count: 8`

#### Scenario: Complete failure during packaging

- **WHEN** the worker fails to download any images or encounters a critical error
- **THEN** the worker updates the package status to "failed" with an error message

### Requirement: Package status query returns current state

The `/api/photos` endpoint SHALL accept `action: "package_status"` requests with a `package_id`. The system SHALL return the current packaging state from S3.

#### Scenario: Query processing package

- **WHEN** client sends `{ "action": "package_status", "package_id": "<uuid>" }` and packaging is in progress
- **THEN** the system returns HTTP 200 with `{ "package_id": "<uuid>", "status": "processing" }`

#### Scenario: Query completed package

- **WHEN** client sends `{ "action": "package_status", "package_id": "<uuid>" }` and packaging is completed
- **THEN** the system returns HTTP 200 with `{ "package_id": "<uuid>", "status": "completed", "download_url": "<s3-presigned-url>", "file_count": <N>, "file_size": <bytes> }`

#### Scenario: Query failed package

- **WHEN** client sends `{ "action": "package_status", "package_id": "<uuid>" }` and packaging failed
- **THEN** the system returns HTTP 500 with `{ "package_id": "<uuid>", "status": "failed", "error": "<message>" }`

#### Scenario: Query non-existent package

- **WHEN** client sends `{ "action": "package_status", "package_id": "<non-existent>" }`
- **THEN** the system returns HTTP 404 with `{ "error": "打包任務不存在" }`

### Requirement: PackageStore manages S3 state

`PackageStore(BaseStore)` SHALL provide `create_package`, `update_package`, `get_package`, `generate_download_url`, and `find_by_cache_key` methods. The S3 key format SHALL be `packages/{package_id}/{package_id}_results.json` for state and `packages/{package_id}/images.zip` for the ZIP file. Each package metadata SHALL include a `cache_key` field. `generate_download_url` SHALL return an S3 pre-signed URL valid for 1 hour. `find_by_cache_key` SHALL search existing packages for a matching cache key with status "completed".

#### Scenario: Create a new package job

- **WHEN** `create_package(job_id, indices)` is called
- **THEN** a new UUID is generated, state is written to S3 with status "processing", and the UUID is returned

#### Scenario: Generate pre-signed download URL

- **WHEN** `generate_download_url(package_id)` is called for a completed package
- **THEN** an S3 pre-signed URL for `packages/{package_id}/images.zip` valid for 3600 seconds is returned

#### Scenario: Find package by cache key

- **WHEN** `find_by_cache_key(cache_key)` is called and a completed package with that cache key exists
- **THEN** the package metadata dict is returned

#### Scenario: No package found by cache key

- **WHEN** `find_by_cache_key(cache_key)` is called and no matching completed package exists
- **THEN** `None` is returned

### Requirement: Async worker dispatch supports package type

`app.py`'s `handle_async_worker` SHALL dispatch events with `_worker_type: "package"` to the package worker function in `routes/photos.py`.

#### Scenario: Package worker triggered by async invoke

- **WHEN** Lambda receives an event with `{ "_async_worker": true, "_worker_type": "package", "package_id": "...", "job_id": "...", "indices": [...] }`
- **THEN** the system calls the package worker function with the event data
