## Context

本專案使用 MVVM 架構，需要一個型別安全的錯誤處理機制，讓 Repository 層可以將操作結果（成功或失敗）以統一的方式回傳給 ViewModel，避免 try-catch 散落各處。同時需要定義應用程式專屬的錯誤類型，以便 UI 層根據錯誤類型呈現對應的錯誤訊息。

## Goals / Non-Goals

**Goals:**

- 實作泛型 `Result<T>` sealed class，封裝成功（Ok）與失敗（Error）狀態
- 實作 `AppError` 自訂例外類別，提供結構化的錯誤資訊
- 確保型別安全，利用 Dart sealed class 的窮舉匹配特性

**Non-Goals:**

- 不實作任何使用 Result 的業務邏輯
- 不處理 UI 層的錯誤呈現邏輯
- 不實作錯誤日誌或監控機制

## Decisions

### Result sealed class 設計

使用 Dart 3 的 sealed class 語法定義 `Result<T>`，包含兩個 final 子類別：
- `Ok<T>`：持有成功值 `T value`
- `Error<T>`：持有例外 `Exception error`

使用 factory constructor 提供簡潔的建構方式：`Result.ok(value)` 與 `Result.error(error)`。

### AppError 例外定義

定義 `AppError` 類別繼承自 `Exception`，包含：
- `AppErrorType` 列舉：定義應用程式中可能發生的錯誤類型（網路錯誤、解析錯誤、未知錯誤等）
- `message` 屬性：人類可讀的錯誤訊息
- `type` 屬性：錯誤類型列舉值

## Risks / Trade-offs

- [取捨] `Error<T>` 持有 `Exception` 而非 `AppError`，保持彈性但犧牲部分型別限制 → 實務上 Repository 層會優先使用 `AppError`，其他 Exception 作為 fallback
- [風險] sealed class 為 Dart 3 語法，需確認 Flutter SDK 版本支援 → 現代 Flutter 專案預設使用 Dart 3+，無相容性問題
