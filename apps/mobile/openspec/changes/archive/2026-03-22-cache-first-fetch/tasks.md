## 1. 實作快取優先檢查

- [x] 1.1 `photo_repository.dart` 在 `fetchPhotos` 開頭加入快取優先檢查邏輯（cache-first check before API call），在 fetchPhotos 開頭加入快取優先檢查：查 metadata → isBlogFullyCached → 從 filenames 建構 PhotoEntity 回傳

## 2. 測試與驗證

- [x] 2.1 更新 `photo_repository_test.dart`：新增快取命中測試（metadata 存在且完整快取時不呼叫 API）、快取未命中測試（metadata 不存在或不完整時走 API）
- [x] 2.2 執行 `flutter analyze` + `dart format .` + `flutter test` 確認無問題
