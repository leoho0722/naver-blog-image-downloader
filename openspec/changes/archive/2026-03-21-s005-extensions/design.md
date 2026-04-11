## Context

專案中多處需要對字串進行處理（如 Naver Blog URL 驗證、圖片檔名清理等）與格式化操作。Dart 的擴充方法可以在不修改原始類別的情況下為既有型別新增方法，是組織共用工具邏輯的最佳方式。

## Goals / Non-Goals

**Goals:**

- 實作 String 擴充方法，涵蓋 URL 驗證與處理
- 實作格式化相關擴充方法
- 確保擴充方法具有良好的命名與文件

**Non-Goals:**

- 不實作與特定業務邏輯強耦合的擴充方法
- 不實作第三方套件的擴充方法
- 不為每個擴充方法撰寫獨立檔案

## Decisions

### 字串擴充方法

定義 `StringExtension` on `String`，提供：
- `isValidUrl`：驗證字串是否為有效的 URL
- `isNaverBlogUrl`：驗證字串是否為有效的 Naver Blog URL
- `sanitizeFileName`：清理字串使其適合作為檔名（移除不合法字元）

### 格式化擴充方法

定義格式化相關的擴充方法：
- `toFileSizeString`：將整數（位元組數）格式化為人類可讀的檔案大小字串（如 "1.5 MB"）

### 單一檔案組織

所有擴充方法集中於 `lib/utils/extensions.dart` 單一檔案中，以 part/library 的方式在需要時引入。隨著擴充方法數量增長，未來可考慮拆分為多個檔案。

## Risks / Trade-offs

- [取捨] 集中於單一檔案而非依型別拆分，降低複雜度但可能在擴充方法增多時難以維護 → 初期規模小，單一檔案足夠
- [風險] 擴充方法命名可能與其他套件衝突 → 使用明確的 extension 名稱避免命名衝突
