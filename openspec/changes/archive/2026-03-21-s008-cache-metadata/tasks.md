## 1. BlogCacheMetadata class defined（BlogCacheMetadata 欄位設計）

- [x] 1.1 在 `lib/data/models/blog_cache_metadata.dart` 中實作 BlogCacheMetadata class defined：定義 `BlogCacheMetadata` 類別，所有欄位宣告為 `final`
- [x] 1.2 宣告必填欄位：`blogId`（String）、`blogUrl`（String）、`photoCount`（int）、`downloadedAt`（DateTime）、`isSavedToGallery`（bool）、`filenames`（List\<String\>）

## 2. BlogCacheMetadata JSON serialization defined（JSON 序列化設計）

- [x] 2.1 實作 BlogCacheMetadata JSON serialization defined：實作 `toJson()` 方法，回傳 `Map<String, dynamic>`，將 `downloadedAt` 序列化為 ISO 8601 字串
- [x] 2.2 實作 `factory BlogCacheMetadata.fromJson(Map<String, dynamic> json)` 建構子，將 ISO 8601 字串解析為 `DateTime`

## 3. BlogCacheMetadata copyWith defined（copyWith 部分更新設計）

- [x] 3.1 實作 BlogCacheMetadata copyWith defined：實作 `copyWith({bool? isSavedToGallery})` 方法，回傳新的 `BlogCacheMetadata` 實例，僅更新指定欄位
