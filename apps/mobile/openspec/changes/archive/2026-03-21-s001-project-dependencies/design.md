## Context

目前 Flutter 專案僅包含預設範本，`pubspec.yaml` 中只有 `flutter`、`cupertino_icons` 和 `flutter_lints`。需要加入架構設計書指定的所有套件，並建立 MVVM 分層架構的目錄骨架。

## Goals / Non-Goals

**Goals:**

- 在 pubspec.yaml 中宣告所有必要的 runtime 與 dev 依賴
- 建立完整的 lib/ 目錄結構，對應 MVVM 分層架構
- 確保 `flutter pub get` 成功執行

**Non-Goals:**

- 不實作任何 Dart 程式碼（僅建立目錄與 .gitkeep）
- 不修改 analysis_options.yaml
- 不設定 CI/CD 或平台特定配置

## Decisions

### 套件版本選擇

依據架構設計書指定的版本範圍，使用相容的最新穩定版：

| 套件 | 版本 | 用途 |
|------|------|------|
| provider | ^6.1.2 | 依賴注入 |
| go_router | ^14.8.0 | 導航 |
| dio | ^5.7.0 | HTTP 串流下載 |
| http | ^1.3.0 | 輕量 HTTP API 呼叫 |
| image_gallery_saver | ^2.0.3 | 相簿存取 |
| crypto | ^3.0.6 | SHA-256 hash |
| path_provider | ^2.1.5 | 臨時/快取目錄 |
| path | ^1.9.1 | 路徑操作 |
| shared_preferences | ^2.3.4 | 簡易 KV 儲存 |
| mocktail | ^1.0.4 | 測試 Mock |

### 目錄結構使用 .gitkeep

空目錄在 Git 中無法追蹤，使用 `.gitkeep` 佔位檔確保目錄結構被版控保留。後續 spec 實作時自然會取代 .gitkeep。

## Risks / Trade-offs

- [風險] 套件版本可能因 Dart SDK 版本限制而不相容 → 以 `flutter pub get` 驗證
- [風險] 目錄結構過早固定 → 此結構直接對應架構設計書，變動可能性極低
