## Context

`fetchPhotos` 目前的流程：blogId → submitJob → 輪詢 → toEntities → isBlogFullyCached → FetchResult。快取檢查發生在 API 呼叫之後。`BlogCacheMetadata` 已有 `filenames` 清單，可用於在 API 前重建 `PhotoEntity`。

## Goals / Non-Goals

**Goals:**

- 已完整快取的 Blog 跳過 Lambda API，直接從 metadata + 快取檔案建構 FetchResult

**Non-Goals:**

- 不處理部分快取的情境（部分快取仍走 API 流程）
- 不改變 BlogCacheMetadata 結構

## Decisions

### 在 fetchPhotos 開頭加入快取優先檢查

在呼叫 `submitJob` 前插入快取檢查邏輯：

1. `_cacheRepository.metadata(blogId)` 查 metadata
2. 若 metadata 存在，呼叫 `_cacheRepository.isBlogFullyCached(blogId, metadata.filenames)` 確認檔案完整
3. 若完整 → 從 `metadata.filenames` 建構 `PhotoEntity` 清單（id 用 `photo_$index`，filename 直接用快取的 filename，url 留空字串因為不需要下載）
4. 回傳 `Result.ok(FetchResult(photos, blogId, blogUrl, isFullyCached: true))`
5. 若 metadata 不存在或不完整 → 落入原有 API 流程

**替代方案**：在 ViewModel 層做快取檢查 → 不採用，快取邏輯屬於 Repository 職責。

## Risks / Trade-offs

- [Risk] 從快取重建的 `PhotoEntity.url` 為空字串，若上層意外使用 URL 下載會失敗 → 因為 `isFullyCached=true` 會跳過下載流程，URL 不會被使用
- [Risk] Metadata 存在但快取檔案被手動刪除 → `isBlogFullyCached` 會回傳 false，自動落回 API 流程
