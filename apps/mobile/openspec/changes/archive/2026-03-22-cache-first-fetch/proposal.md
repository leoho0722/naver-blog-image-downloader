## Problem

`PhotoRepository.fetchPhotos` 每次都呼叫 Lambda API（`submitJob` + 輪詢），即使該 Blog 的所有照片已完整快取。一次 Lambda 呼叫需等待 30-60 秒，造成不必要的延遲與 API 成本。

## Root Cause

`fetchPhotos` 在呼叫 API 前沒有檢查本地快取。`isFullyCached` 是在 Lambda 回傳照片列表後才透過 `isBlogFullyCached` 判斷，此時 API 已經被呼叫過了。

## Proposed Solution

在 `fetchPhotos` 呼叫 API 前，先以 `blogId` 查詢 `CacheRepository.metadata(blogId)`。若 metadata 存在，再以 `isBlogFullyCached(blogId, metadata.filenames)` 確認快取完整性。若完整快取，直接從 metadata 的 `filenames` 建構 `PhotoEntity` 清單與 `FetchResult` 回傳，完全跳過 API 呼叫。

## Success Criteria

- 已完整快取的 Blog 重新輸入相同 URL 時，不呼叫 Lambda API
- 回傳的 `FetchResult.isFullyCached` 為 `true`
- 照片瀏覽頁顯示正確的快取照片
- 未快取或部分快取的 Blog 仍走正常 API 流程

## Impact

- 受影響 specs：`photo-repo-fetch`
- 受影響檔案：
  - `lib/data/repositories/photo_repository.dart`
- 受影響測試：`test/data/repositories/photo_repository_test.dart`
