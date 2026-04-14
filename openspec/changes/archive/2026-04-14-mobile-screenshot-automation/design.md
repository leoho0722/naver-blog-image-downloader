## Context

目前 app 的正式啟動流程會初始化 Amplify、Firebase、SharedPreferences，並在主畫面生命週期內觸發剪貼簿檢查與 What’s New 邏輯。這些副作用會讓自動化截圖不穩定，而且現有畫面同時跨 Flutter 與原生 PhotoViewer，單靠 golden test 無法覆蓋全部素材場景。

## Goals / Non-Goals

**Goals:**

- 提供 debug-only screenshot mode，讓 Maestro 可透過 launch arguments 直接進入指定場景。
- 建立單一來源的 screenshot scenario manifest，避免 Flutter 端與 Maestro matrix 重複維護。
- 重用真實 Widget 與既有原生 PhotoViewer，讓截圖素材與正式 UI 保持一致。
- 建立 Flutter-only 場景的 golden test 骨架，補足快速回歸檢查。
- 確保 screenshot 圖與 golden 圖不顯示 Flutter debug banner。

**Non-Goals:**

- 不在此變更中建立完整的雲端 CI 截圖產線。
- 不改寫既有正式路由架構為 screenshot 專用路由。
- 不把 screenshot fake 與場景暴露給 release build 使用。

## Decisions

### 以 screenshot mode 取代測試時動態操控正式啟動流程

使用 `main.dart` 的 debug-only 分支，在啟動早期解析 `flutter_launch_arguments`。這能在初始化 Firebase / Amplify 前切入 screenshot app，避免正式副作用污染截圖流程，也避免在正式 `NaverPhotoApp` 上疊加過多條件判斷。

替代方案是讓 Maestro 啟動正式 app 再逐步導頁，但這會碰到剪貼簿、登入、下載與原生 viewer 時序問題，穩定性較差。

### 以 scenario manifest 作為單一真相來源

Flutter 端的 screenshot app、golden test、Maestro matrix 與本機 matrix 腳本全部共用 `scripts/screenshot_matrix.json` 這份 JSON manifest。每個 scenario 定義 `id`、`waitForId`、`supportsGolden` 與 iOS/Android 等待秒數。下游消費者：

- `lib/screenshot/screenshot_scenario_definitions.dart` — 由 `scripts/sync_scenarios.dart` 產生，Flutter runtime / golden test 使用
- `.maestro/screenshot_matrix.yaml` — 由 `scripts/generate_maestro_matrix.dart` 產生（會先呼叫 sync），Maestro CI 使用
- `scripts/run_{ios,android}_screenshot_matrix.sh` — 執行時以 `jq` 直讀 JSON，本機驗證使用

採用 JSON 而非 YAML，是因 macOS 普遍有 `jq`，且 bash 解析較單純。將等待秒數也放進 JSON 消除 bash 端對 scenario 名稱的特判。

替代方案一：手寫 `.maestro/screenshot_matrix.yaml`，會讓 scenario 名稱、等待識別與 golden 排除名單分散在三處。替代方案二：以 Dart 檔作 SSOT，bash 腳本就無法共享同一份定義，必須自行硬編或再多一支產生器。

### 以真實 Widget + provider overrides 建模截圖場景

所有 Flutter 截圖場景都重用正式 Widget，僅透過 fake repository、固定 state 或 runtime gating 來消除副作用。這比複製一份 screenshot 專用視覺元件更能降低 UI 漂移風險。

其中 `DownloadDialog` 需拆出純顯示內容元件，因為現況會在生命週期內直接啟動真實下載，不適合直接重用。

### 以原生 accessibility identifiers/testTag 支援 PhotoViewer 截圖

原生 PhotoViewer 維持用正式 service 開啟，僅在 iOS/Android 補 pager 與底部按鈕的識別。Maestro 只等待這些穩定標記，不依賴畫面文案或座標。

替代方案是為原生 viewer 建立額外測試入口，但那會新增與正式畫面不一致的維護面。

## Risks / Trade-offs

- [Risk] screenshot mode 與正式 app 共用程式碼，若 gating 範圍拿捏錯誤，可能誤傷正式流程 → Mitigation：只在明確 runtime provider 為 screenshot 時關閉副作用，並保留正式預設路徑不變。
- [Risk] fake overrides 只覆寫部分 provider，若有漏網副作用仍可能在 build/initState 期間觸發 → Mitigation：先集中處理已知高風險點 `BlogInputView`、`DownloadDialog`、What’s New 與 native viewer scenario。
- [Risk] golden 與 Maestro 畫面在字型或裝置環境上仍可能有微差 → Mitigation：將 golden 定位為 Flutter-only 回歸；最終素材截圖仍以 Maestro 輸出為準。
