# Mobile 開發指引

> 詳細專案說明、技術棧與開發者指南請參閱 [README.md](README.md)。
> 共用規範（正體中文註解、Conventional Commits、版號管理、Spectra SDD）請參閱 monorepo root [CLAUDE.md](../../CLAUDE.md)。

## 架構分層

```text
View（ConsumerWidget / ConsumerStatefulWidget）
  ↓ ref.watch
ViewModel（Notifier<State> / AsyncNotifier<State>，@riverpod 註解）
  ↓ ref.read
Repository（PhotoRepository / CacheRepository / LogRepository）— SSOT
  ↓
Service（ApiService / FileDownloadService / PhotoService / PhotoViewerService / AppIconService / AuthService / LogService / CrashlyticsService）— 無狀態
  ↓
Native（Swift / Kotlin via MethodChannel）— PhotoService 橋接原生相簿 API、PhotoViewerService 橋接原生圖片檢視器、AppIconService 橋接原生 App 圖示切換
Firebase（Auth + Firestore + Crashlytics）— AuthService / LogService / CrashlyticsService 橋接
```

- ViewModel 不得直接存取 Service，必須透過 Repository
- Repository 方法失敗時直接 throw Exception，ViewModel 以 `AsyncValue` 處理 loading / error / data 狀態
- PhotoService 透過 MethodChannel 呼叫原生 API（iOS: PhotoKit / Android: MediaStore）
- PhotoViewerService 透過 MethodChannel 啟動原生全螢幕圖片檢視器（iOS: SwiftUI / Android: Jetpack Compose）
- ViewModel 使用不可變 State class + `copyWith`，非同步操作以 `AsyncValue<T>` 欄位表達
- Service / Repository 使用 `@Riverpod(keepAlive: true)`（App 級單例）
- `AppSettingsViewModel` 使用 `@Riverpod(keepAlive: true)`（提供 theme/locale 給 MaterialApp）
- 其餘 ViewModel 使用 `@riverpod`（auto-dispose，畫面離開時自動清理）
- ViewModel 中多個互斥狀態須以 `AsyncValue<T>` 欄位表達（如儲存操作使用 `AsyncValue<void>?`：`null` = 閒置、`AsyncLoading` = 執行中、`AsyncData` = 完成、`AsyncError` = 失敗），避免自訂 enum 或多個 boolean flags
- ViewModel 操作完成後以 fire-and-forget 方式呼叫 `LogRepository` 記錄操作 log（不阻塞 UI、不影響操作結果）
- GoRouter 以 `@Riverpod(keepAlive: true)` provider 定義，內建 `NavigatorObserver` 記錄頁面導航

## 開發規範

1. **遵循 Flutter 官方規範**：所有 Flutter 相關檔案皆需符合 `flutter/skills` 官方規範（包括 Widget 建構、狀態管理、導航、測試等）。
2. **Analyze + Format**：執行 `flutter analyze` 後，須自動接續執行 `dart format .`，確保所有 Flutter 相關檔案排版格式一致。
3. **程式碼註解規範（Dart）**：
   - 所有註解須以**正體中文**撰寫（通則見 root CLAUDE.md）
   - 註解須具備**高可讀性**、**直覺易懂**、**高可維護性**，使用連 PM 或 Flutter 初學者都能理解的白話說明，避免過度技術術語
   - 所有 class、constructor、method、property、getter、enum、enum value、top-level function/variable 皆須撰寫 `///` 文件註解
   - 有參數的項目須以 `[paramName]` 格式標記每個參數並附說明
   - 非 void 回傳值須描述回傳內容（如 `/// 回傳...`）
   - 會拋出例外的方法須標明例外類型（如 `/// 失敗時拋出 [AppError]`）
   - Private 項目（含 `_` 開頭的 class、method、field）亦須撰寫註解
   - `copyWith` 方法須列出所有參數說明與回傳描述
   - `operator ==` 須標記 `[other]` 參數，`hashCode` 須標記回傳描述
4. **截圖自動化**：新增 / 修改 screenshot 場景、語系、主題時，**唯一** SSOT 為 `scripts/screenshot_matrix.json`。切勿直接改 `lib/screenshot/screenshot_scenario_definitions.dart` 或 `.maestro/screenshot_matrix.yaml`（由 `scripts/generate_maestro_matrix.dart` 產生覆寫）。完整流程與 matrix 執行指令見 `.claude/skills/screenshot-workflow/SKILL.md`。Matrix 拍出的原始截圖進一步合成 App Store / Play Store 上架素材（加上設備框與多語系文案）由 `.claude/skills/store-assets/SKILL.md` 負責。
5. **原生程式碼規範（Swift / Kotlin）**：
   - 縮排使用 4 格空格（Dart 用 2 格，原生用 4 格）
   - 所有註解須以**正體中文**撰寫，具備**高可讀性**、**直覺易懂**、**高可維護性**，使用連 PM 或 Flutter 初學者都能理解的白話說明
   - 註解須包含傳入參數、回傳值、錯誤拋出說明（Swift: `- Parameter`/`- Returns`/`- Throws`，Kotlin: `@param`/`@return`/`@throws`）
   - Swift 當有多個傳入參數時，須使用 `- Parameters:` 並將各參數各自一行（單一參數使用 `- Parameter paramName:`）
   - 不得直接在生命週期方法（`didFinishLaunchingWithOptions`/`configureFlutterEngine`）內撰寫邏輯，應抽成獨立方法
   - Private 方法透過 Extension 方式管理（Swift: `private extension`，Kotlin: file-level `private fun ClassName.xxx()`）
