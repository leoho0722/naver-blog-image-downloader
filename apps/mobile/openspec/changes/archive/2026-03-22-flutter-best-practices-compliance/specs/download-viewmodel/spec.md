## MODIFIED Requirements

### Requirement: start download with progress tracking

DownloadViewModel SHALL provide a `startDownload({required List<PhotoEntity> photos, required String blogId, required String blogUrl})` method.

When `startDownload` is called, DownloadViewModel SHALL:
1. Set `_total` to `photos.length` and `_completed` to `0`
2. Set `isDownloading` to `true`
3. Call `PhotoRepository.downloadAllToCache` with the provided photos, blogId, blogUrl, and an `onProgress` callback
4. Update `_completed` via the `onProgress` callback and call `notifyListeners()` on each update
5. Store the returned `DownloadBatchResult` in `result`
6. Set `isDownloading` to `false`

#### Scenario: startDownload passes blogUrl to repository

- **WHEN** `startDownload` is called with `blogUrl` "https://blog.naver.com/user/123"
- **THEN** `PhotoRepository.downloadAllToCache` SHALL receive `blogUrl` as "https://blog.naver.com/user/123"

#### Scenario: startDownload requires blogUrl parameter

- **WHEN** `startDownload` is called
- **THEN** the `blogUrl` parameter SHALL be required at compile time
