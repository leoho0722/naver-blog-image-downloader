## 1. Screenshot mode 啟動骨架

- [x] 1.1 實作 Screenshot mode bootstrap requirement：bump `apps/mobile/pubspec.yaml` 版本並加入 `flutter_launch_arguments` 依賴
- [x] 1.2 實作 Screenshot mode bootstrap requirement：在 `lib/main.dart` 加入 launch arguments 解析、runtime mode 與 screenshot app 入口
- [x] 1.3 實作 Screenshot rendering is banner-free and waitable：建立 `lib/screenshot/` 基礎型別、`ScreenshotApp` 與 `ScreenshotScaffold`

## 2. Screenshot 場景與副作用隔離

- [x] 2.1 實作 Screenshot scenario manifest：建立共享 scenario manifest 與 mock data / fake overrides
- [x] 2.2 實作 Screenshot mode suppresses interactive side effects：調整 `BlogInputView` 使 screenshot mode 跳過 clipboard 與 What’s New 自動流程
- [x] 2.3 實作 Screenshot mode suppresses interactive side effects：抽出 `DownloadDialog` 的純顯示內容並建立固定進度 screenshot scenario
- [x] 2.4 實作 Maestro and golden coverage boundaries：補齊 gallery、settings、what’s new 與 native viewer screenshot scenarios

## 3. 原生 viewer 與自動化產物

- [x] 3.1 實作 PhotoViewer accessibility identifiers：在 iOS 原生 PhotoViewer 補 pager 與底部按鈕 identifier
- [x] 3.2 實作 PhotoViewer automation test tags：在 Android 原生 PhotoViewer 補 pager 與底部按鈕 testTag
- [x] 3.3 實作 Screenshot scenario manifest 與 Maestro and golden coverage boundaries：新增 Maestro flow 與 matrix 產生腳本

## 4. Golden 驗證與收尾

- [x] 4.1 實作 Maestro and golden coverage boundaries：新增 Flutter screenshot golden test 骨架並排除 native viewer
- [x] 4.2 驗證 Screenshot rendering is banner-free and waitable 與 Screenshot mode runtime dependency declared：執行格式化、分析與關鍵測試，更新任務狀態

## 5. JSON SSOT 與本機 matrix 執行工具

- [x] 5.1 建立 `scripts/screenshot_matrix.json` 作為場景 / 語系 / 主題 / 等待秒數的單一真相來源
- [x] 5.2 新增 `scripts/sync_scenarios.dart` 讀 JSON 並重新產生 `lib/screenshot/screenshot_scenario_definitions.dart`
- [x] 5.3 擴充 `scripts/generate_maestro_matrix.dart` 先呼叫 sync 再從 JSON 產生 `.maestro/screenshot_matrix.yaml`
- [x] 5.4 新增 `scripts/run_ios_screenshot_matrix.sh` 以 `xcrun simctl` 跑本機 iOS matrix，支援 `SCENARIOS_FILTER` / `LOCALES_FILTER` / `THEMES_FILTER`
- [x] 5.5 新增 `scripts/run_android_screenshot_matrix.sh` 以 `adb` 跑本機 Android matrix，wait 秒數針對 Android cold start 調高
- [x] 5.6 修正 `photo_gallery_view` 在 screenshot mode 下誤讀 `GoRouterState` 造成崩潰（早期 return）
- [x] 5.7 新增 `apps/mobile/.claude/skills/screenshot-workflow/SKILL.md` 記錄 SSOT 架構與操作流程
