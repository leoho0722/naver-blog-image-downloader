## Why

`CacheRepository.blogId()` 以 SHA-256 雜湊原始 URL 產生 blogId，但手機版（`https://m.blog.naver.com/...`）與電腦版（`https://blog.naver.com/...`）URL 字串不同，導致同一篇文章產生不同的 cache key。使用者若先以電腦版 URL 下載過，之後以手機版 URL 存取同一篇文章時會發生 cache miss，造成重複下載與重複佔用磁碟空間。

## What Changes

- 在 `NaverUrlValidator` 新增 `normalize()` 靜態方法，將手機版 URL（`https://m.blog.naver.com/`）轉換為電腦版格式（`https://blog.naver.com/`），電腦版 URL 則不做任何變更
- `CacheRepository.blogId()` 在進行 SHA-256 hash 之前，先呼叫 `NaverUrlValidator.normalize()` 對 URL 進行正規化，確保同一篇文章不論 URL 格式都產生相同的 cache key

## Non-Goals

- 不修改 API 呼叫鏈：後端 Lambda 已修正手機版 URL 支援，前端不需在送出 API 前轉換 URL
- 不處理已存在的重複 cache entry：既有的重複快取會在快取淘汰機制（cache eviction）自然清理時移除

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `naver-url-validator`：新增 URL 正規化（normalize）需求，將手機版 URL 轉換為電腦版格式
- `cache-repository`：`blogId()` 方法新增正規化步驟，hash 前先正規化 URL

## Impact

- 受影響程式碼：
  - `naver_blog_image_downloader/lib/ui/core/naver_url_validator.dart`
  - `naver_blog_image_downloader/lib/data/repositories/cache_repository.dart`
  - `naver_blog_image_downloader/test/ui/core/naver_url_validator_test.dart`
