## 1. String URL validation extensions（字串擴充方法）

- [x] 1.1 在 `lib/utils/extensions.dart` 中實作 String URL validation extensions：定義 `StringExtension` extension on `String`
- [x] 1.2 實作 `isValidUrl` getter，驗證字串是否為有效的 http/https URL
- [x] 1.3 實作 `isNaverBlogUrl` getter，驗證字串是否為有效的 Naver Blog URL（`blog.naver.com` 網域）

## 2. String file name sanitization extension（字串擴充方法）

- [x] 2.1 實作 String file name sanitization extension：在 `StringExtension` 中新增 `sanitizeFileName` 方法
- [x] 2.2 移除或替換檔案系統不允許的字元（`/`、`\`、`:`、`*`、`?`、`"`、`<`、`>`、`|`）

## 3. Integer file size formatting extension（格式化擴充方法）

- [x] 3.1 實作 Integer file size formatting extension：定義 `IntExtension` extension on `int`
- [x] 3.2 實作 `toFileSizeString` 方法，將位元組數轉換為人類可讀的檔案大小字串（B、KB、MB、GB）

## 4. 單一檔案組織

- [x] 4.1 確認所有擴充方法皆集中於 `lib/utils/extensions.dart` 單一檔案組織中，統一匯出
