## Why

目前 mobile app 的多語系截圖仍需人工切換語系、主題與畫面狀態，難以穩定產出商店素材，也無法把截圖畫面納入回歸檢查。既有 App 已同時包含 Flutter 畫面與原生 PhotoViewer，若沒有統一的自動化截圖框架，後續每次 UI 調整都會提高驗證成本。

## What Changes

- 新增 mobile screenshot automation capability，提供 debug-only 的 screenshot mode、scenario manifest、Maestro matrix 與 golden 測試骨架。
- 在 Flutter 端新增 screenshot 專用入口、共用 scaffold、固定假資料與 fake overrides，重用真實 Widget 產生可重複的截圖場景。
- 在既有畫面補 screenshot-safe 注入點，避免 screenshot mode 期間觸發剪貼簿檢查、What’s New 自動彈窗與真實下載流程。
- 在 iOS 與 Android 的原生 PhotoViewer 補 accessibility identifier / testTag，讓 Maestro 能穩定等待原生 viewer 畫面。
- 新增 runtime dependency `flutter_launch_arguments`，供 screenshot mode 在 debug 啟動時解析 launch arguments。
- 將場景 / 語系 / 主題 / 等待秒數集中於 `scripts/screenshot_matrix.json` 作為單一真相來源，Dart 定義檔與 Maestro yaml 由 `scripts/sync_scenarios.dart` 與 `scripts/generate_maestro_matrix.dart` 自動產生。
- 新增 `scripts/run_ios_screenshot_matrix.sh` 與 `scripts/run_android_screenshot_matrix.sh`，在本機以 `xcrun simctl` / `adb` 直接逐一啟動 scenario 並截圖，支援 `SCENARIOS_FILTER` / `LOCALES_FILTER` / `THEMES_FILTER` 白名單。
- 新增 `apps/mobile/.claude/skills/screenshot-workflow/SKILL.md`，記錄 SSOT 架構、新增場景流程、本機跑 matrix 指令與常見坑。

## Capabilities

### New Capabilities

- `screenshot-automation`: 定義 mobile app 的 screenshot mode、scenario registry、Maestro 截圖矩陣與 golden 驗證行為。

### Modified Capabilities

- `project-dependencies`: 新增 screenshot mode 所需的 runtime dependency。
- `native-photo-viewer-ios`: 新增原生 iOS PhotoViewer 的 accessibility identifier 要求。
- `native-photo-viewer-android`: 新增原生 Android PhotoViewer 的 testTag 要求。

## Impact

- Affected specs: `screenshot-automation`, `project-dependencies`, `native-photo-viewer-ios`, `native-photo-viewer-android`
- Affected code:
  - `apps/mobile/pubspec.yaml`
  - `apps/mobile/lib/main.dart`
  - `apps/mobile/lib/ui/blog_input/widgets/blog_input_view.dart`
  - `apps/mobile/lib/ui/download/widgets/download_view.dart`
  - `apps/mobile/lib/screenshot/**`
  - `apps/mobile/.maestro/**`
  - `apps/mobile/scripts/screenshot_matrix.json`
  - `apps/mobile/scripts/sync_scenarios.dart`
  - `apps/mobile/scripts/generate_maestro_matrix.dart`
  - `apps/mobile/scripts/run_ios_screenshot_matrix.sh`
  - `apps/mobile/scripts/run_android_screenshot_matrix.sh`
  - `apps/mobile/.claude/skills/screenshot-workflow/SKILL.md`
  - `apps/mobile/test/screenshot/**`
  - `apps/mobile/ios/Runner/Features/PhotoViewer/View/*.swift`
  - `apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/*.kt`
