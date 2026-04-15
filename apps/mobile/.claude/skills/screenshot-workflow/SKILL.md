---
name: screenshot-workflow
description: 管理 screenshot 場景的 SSOT 配置與執行 iOS/Android 真機截圖 matrix（宣傳素材或回歸驗證用途）。
---

# Screenshot Workflow

管理 `apps/mobile` 的 screenshot scenarios：新增場景、同步產生器、跑 iOS / Android 截圖 matrix。

## SSOT 架構

`apps/mobile/scripts/screenshot_matrix.json` 是**唯一**真實來源，下游 4 個消費者：

| 消費者 | 用途 | 更新方式 |
|--------|------|----------|
| `lib/screenshot/screenshot_scenario_definitions.dart` | Flutter runtime / golden test 引用 | `dart run scripts/sync_scenarios.dart` 自動產生 |
| `.maestro/screenshot_matrix.yaml` | Maestro CI 自動拍攝 | `dart run scripts/generate_maestro_matrix.dart` 自動產生（會先 sync） |
| `scripts/run_ios_screenshot_matrix.sh` | 本機 iOS 跑 matrix | 執行時用 jq 直接讀 JSON |
| `scripts/run_android_screenshot_matrix.sh` | 本機 Android 跑 matrix | 執行時用 jq 直接讀 JSON |

**絕對不要手改** `screenshot_scenario_definitions.dart` 或 `.maestro/screenshot_matrix.yaml`，它們由產生器覆寫。

### Maestro 需要的環境變數

`.maestro/take_screenshot.yaml` 第一行是 `appId: ${APP_ID}`。在本機或 CI 執行 Maestro flow 時須先設定：

```bash
# iOS
export APP_ID=com.leoho.naverBlogImageDownloader.ios
# Android
export APP_ID=com.leoho.naverBlogImageDownloader.android

maestro test .maestro/screenshot_matrix.yaml
```

注意本專案的 iOS / Android package name 不同，跨平台批次拍攝時須分別執行。

## 新增 scenario

1. 編輯 `apps/mobile/scripts/screenshot_matrix.json`，加入新條目：
   ```json
   {
     "id": "my_new_scenario",
     "waitForId": "screenshot_ready",
     "supportsGolden": true,
     "waitSecsIos": 3,
     "waitSecsAndroid": 7
   }
   ```
   - `waitForId`：若畫面由 Flutter 渲染用 `screenshot_ready`；原生畫面依情況指定（例如 `photo_viewer_pager`）
   - `supportsGolden`：Flutter widget 可跑 golden test 設 `true`；原生畫面設 `false`
   - `waitSecsAndroid` 通常比 iOS 大 3-4 秒（Android cold start 較慢）

2. 在 `lib/screenshot/screenshot_scenarios.dart` 新增對應 builder function 並註冊到 `screenshotScenarioBuilders`。

3. 若新場景需要 mock 資料，補到 `lib/screenshot/screenshot_mock_data.dart`。

4. 同步產生器：
   ```bash
   cd apps/mobile
   dart run scripts/generate_maestro_matrix.dart
   flutter analyze
   ```

5. 若 `supportsGolden: true`，更新 golden：
   ```bash
   flutter test --update-goldens test/screenshot/golden_test.dart
   ```

## 跑 iOS matrix

前置：iOS 模擬器已 boot，Runner.app 已 build + install。

```bash
# 跑整個 4×2×11 = 88 張
apps/mobile/scripts/run_ios_screenshot_matrix.sh

# 指定目錄
OUT_DIR=/tmp/my_shots apps/mobile/scripts/run_ios_screenshot_matrix.sh

# 只跑特定場景（逗號分隔）
SCENARIOS_FILTER=photo_gallery_grid,photo_gallery_select \
  apps/mobile/scripts/run_ios_screenshot_matrix.sh

# 組合過濾
SCENARIOS_FILTER=settings_default LOCALES_FILTER=zhTW THEMES_FILTER=light,dark \
  apps/mobile/scripts/run_ios_screenshot_matrix.sh

# 不同模擬器
SIM_ID=XXXX-XXXX apps/mobile/scripts/run_ios_screenshot_matrix.sh
```

Build + install 流程（若尚未 install 或改過 Flutter 程式碼）：
```bash
# 透過 xcodebuildmcp（Claude Code 內）
session_set_defaults({ workspacePath: "...Runner.xcworkspace", scheme: "Runner", simulatorId: "...", derivedDataPath: "/tmp/naver_blog_image_downloader_sim_dd" })
build_sim({})
install_app_sim({ appPath: "/tmp/naver_blog_image_downloader_sim_dd/Build/Products/Debug-iphonesimulator/Runner.app" })
```

## 跑 Android matrix

前置：Android emulator 已 boot，**debug 版** APK 已 install（screenshot mode 只在 `kDebugMode` 生效）。

```bash
# Boot emulator
~/Library/Android/sdk/emulator/emulator -avd Medium_Phone_API_36.1 &

# Build + install debug APK
cd apps/mobile
flutter build apk --debug
~/Library/Android/sdk/platform-tools/adb install -r build/app/outputs/flutter-apk/app-debug.apk

# 跑 matrix（預設設定）
scripts/run_android_screenshot_matrix.sh

# 過濾同 iOS：SCENARIOS_FILTER / LOCALES_FILTER / THEMES_FILTER
SCENARIOS_FILTER=photo_detail_native scripts/run_android_screenshot_matrix.sh
```

**常見坑：**
- 「截圖都是 splash screen」→ `waitSecsAndroid` 不夠，Android cold start 比 iOS 慢
- 「INSTALL_FAILED_UPDATE_INCOMPATIBLE」→ 先 `adb uninstall com.leoho.naverBlogImageDownloader.android`
- 「release build 沒反應」→ screenshot mode gate 在 `kDebugMode`，必須 debug

## 輸出結構

```
<OUT_DIR>/
├── run.log                  # 完整執行記錄
├── zhTW/light/<id>.png
├── zhTW/dark/<id>.png
├── en/light/<id>.png
...
```

預設輸出目錄：
- iOS：`/tmp/naver_blog_image_downloader_ios_screenshots_<timestamp>/`
- Android：`/tmp/naver_blog_image_downloader_android_screenshots_<timestamp>/`

## 相關檔案速查

- 場景定義 SSOT：`apps/mobile/scripts/screenshot_matrix.json`
- Scenario builders：`apps/mobile/lib/screenshot/screenshot_scenarios.dart`
- Mock 資料：`apps/mobile/lib/screenshot/screenshot_mock_data.dart`
- 引數解析：`apps/mobile/lib/main.dart`（`_tryParseScreenshotArgs`）
- Golden test：`apps/mobile/test/screenshot/golden_test.dart`
