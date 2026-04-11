## 1. URL 正規化方法

- [x] 1.1 在 `NaverUrlValidator` 新增 `normalize()` 靜態方法，將 `https://m.blog.naver.com/` 前綴替換為 `https://blog.naver.com/`，非手機版 URL 原封回傳（對應 spec: Normalize mobile URL to desktop format）
- [x] 1.2 在 `naver_url_validator_test.dart` 新增 normalize 測試群組：手機版轉電腦版、電腦版不變、非 Naver URL 不變、含路徑與 query 參數保留

## 2. Cache Key 正規化

- [x] 2.1 修改 `CacheRepository.blogId()` 方法，在 SHA-256 hash 前先呼叫 `NaverUrlValidator.normalize(blogUrl)` 進行正規化（對應 spec: SHA-256 blogId generation）
- [x] 2.2 驗證手機版與電腦版 URL 產生相同 blogId：在測試中確認 `blogId('https://m.blog.naver.com/edament/224238392216')` 與 `blogId('https://blog.naver.com/edament/224238392216')` 回傳值相同

## 3. 驗證

- [x] 3.1 執行 `flutter analyze` 與 `dart format .` 確認無錯誤
- [x] 3.2 執行 `flutter test` 確認所有測試通過
