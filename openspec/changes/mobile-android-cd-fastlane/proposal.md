## Why

目前 Mobile CD（`.github/workflows/mobile-cd.yml`）只負責從 `pubspec.yaml` 抽版號、建立 git tag 與 GitHub Release，**完全沒有**產出 signed build、也沒有上傳到商店。Android release buildType 目前仍掛在 `signingConfigs.getByName("debug")`（`android/app/build.gradle.kts` L44-46 有標註 TODO），代表就算手動下載 artifact 也無法上架。

我們需要把 Android release pipeline 一路打通到 Google Play Console 的 Internal / Closed testing 軌道，讓每次 mobile 版號 bump 都能自動產出可分發給測試者的 signed AAB，同時保留「正式上架 Production 必須由人決定」的手動 gate。iOS fastlane CD 目前尚未建置，此 change 專注處理 Android；iOS 走同一套模式的導入留待後續 change。

## What Changes

- 新增 capability `mobile-android-cd`，涵蓋 Android signed AAB 建置、Google Play Console 上傳（Internal + Closed 同時上）、以及手動觸發 promote 到 Production 的流程。
- 新增 `apps/mobile/android/fastlane/`（`Fastfile`、`Appfile`、`Pluginfile`），以 `fastlane-plugin-supply` 作為上傳實作，提供三條 lane：
    - `build_release_aab`：建置 signed AAB（從 Flutter 產生）
    - `upload_beta`：將 signed AAB 同時上傳到 Internal + Closed track（CD 自動呼叫）
    - `promote_to_production`：將 Closed 的 release promote 到 Production（手動觸發）
- 修改 `apps/mobile/android/app/build.gradle.kts`：新增 release signing config，金鑰資訊改從 `key.properties` 讀取（本地檔案與 `keystore.jks` 皆納入 `.gitignore`，由 CD 在執行時從 GitHub Secrets 還原）。
- 擴充 `.github/workflows/mobile-cd.yml`：在既有 tag/release job 之前，插入 `android-release` job，負責讀 `pubspec.yaml` 的 `+buildNumber` → 自動遞增 → 以新 buildNumber 建置並上傳 → 成功後把 bumped pubspec 以 `chore(mobile): bump build number 至 +N [skip ci]` commit 回 `main`（避免 CI 無限迴圈）。tag / GitHub Release 的建立移到 `android-release` 成功之後，確保「有 tag 就等於有實際上傳到 Play Store」。
- 新增 `.github/workflows/mobile-android-promote.yml`：`workflow_dispatch` 觸發，輸入要 promote 的 `mobile-v<version>` tag，呼叫 `fastlane promote_to_production`，預設 `rollout: 0.1`（10% staged rollout），rollout 百分比可由 workflow 輸入覆寫。
- 新增 GitHub Secrets 使用契約：`ANDROID_KEYSTORE_BASE64`、`ANDROID_KEYSTORE_PASSWORD`、`ANDROID_KEY_ALIAS`、`ANDROID_KEY_PASSWORD`、`GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`。對應的設定步驟與金鑰輪替流程寫進 `apps/mobile/docs/android-release.md`。
- 版號管理：此 change 本身屬 minor bump（使用者可見的交付是「從現在開始每次 bump 會推到 Play Store beta」），`apps/mobile/pubspec.yaml` 由 `1.6.1+1` bump 到 `1.7.0+1`。

## Non-Goals

- **iOS fastlane / TestFlight CD**：iOS 尚未規劃對等流程，留待後續獨立 change。
- **Production 自動化 promote**：Production 上架永遠需要人工觸發 workflow_dispatch；不在任何情境下自動 promote。
- **Play Store Listing metadata 同步**（description、screenshots、whatsnew 多語系）：MVP 只上傳 AAB，release notes 先用預設或跟著 GitHub Release 的 notes。
- **多 flavor / 多 applicationId**（例如 staging/prod 分開）：現況只有單一 `com.leoho.naverBlogImageDownloader.android`，不新增 flavor 切分。
- **從 Play Store 讀回實際 versionCode 做 reconciliation**：MVP 信任 pubspec 的 `+buildNumber` 是單調遞增來源，不接 Play Developer API 查詢做 max 比較。如果未來出現「本機手動上傳 → pubspec 落後」的情況再補。
- **Screenshot 自動上傳 Play Console**：現有 `screenshot-workflow` / `store-assets` 產出的素材仍由人工上傳。
- **Ruby / fastlane 版本由 `apps/mobile/android/Gemfile` + `Gemfile.lock` 鎖定**，不使用 `rbenv` / `asdf` 等全機器工具切換。

## Capabilities

### New Capabilities

- `mobile-android-cd`：Android release pipeline 對外承諾的行為集合，涵蓋 signed AAB 建置規則、Play Console Internal + Closed 平行上傳、Production promote 的觸發條件與 gate、`versionCode` 單調遞增的保證、以及 secrets 缺失時的失敗行為。

### Modified Capabilities

（無）

## Impact

- **Affected specs**：新增 `openspec/specs/mobile-android-cd/spec.md`（透過本 change 的 `specs/mobile-android-cd/spec.md` delta）。
- **Affected code**：
    - `.github/workflows/mobile-cd.yml`（擴充，加入 Android release job，調整 tag/release 順序）
    - `.github/workflows/mobile-android-promote.yml`（新增，手動 promote 到 Production）
    - `apps/mobile/android/app/build.gradle.kts`（新增 release signing config）
    - `apps/mobile/android/fastlane/Fastfile`（新增）
    - `apps/mobile/android/fastlane/Appfile`（新增）
    - `apps/mobile/android/fastlane/Pluginfile`（新增）
    - `apps/mobile/android/Gemfile`（新增，鎖定 fastlane 版本）
    - `apps/mobile/android/Gemfile.lock`（新增）
    - `apps/mobile/android/key.properties.template`（新增，本地 signing 組態範本）
    - `apps/mobile/android/.gitignore`（新增 `key.properties`、`keystore.jks`、`fastlane/report.xml`）
    - `apps/mobile/docs/android-release.md`（新增，GitHub Secrets 設定、keystore 建立、Play Console service account 授權流程、輪替步驟）
    - `apps/mobile/pubspec.yaml`（minor bump `1.6.1+1` → `1.7.0+1`）
    - `apps/mobile/CLAUDE.md`（補充 Android release 相關約定，如 `key.properties` 不得進版控）
- **GitHub Secrets（Repository settings 需建立）**：
    - `ANDROID_KEYSTORE_BASE64`：upload keystore 的 base64 內容
    - `ANDROID_KEYSTORE_PASSWORD`
    - `ANDROID_KEY_ALIAS`
    - `ANDROID_KEY_PASSWORD`
    - `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`：Play Developer API service account JSON（對應帳號須在 Play Console 被授予 Release manager 權限）
- **外部依賴**：
    - GitHub Actions runner：需安裝 Ruby 3.x、bundler、`fastlane` + `fastlane-plugin-supply`（透過 `bundle install` 管理）
    - Google Play Console：需一次性建立 app listing 與 Internal / Closed track，並完成 service account 授權（人工）
    - Android upload keystore：需人工建立一次，並以 base64 存進 Secrets
- **CD 行為變更**：
    - 原先 `mobile-cd.yml` 只要 `Mobile CI` on `main` 成功且 pubspec semver 變過就 tag+release；新版會多一層「先建置並上傳 AAB，成功才 tag+release」，失敗時不會產生 tag（避免「有 tag 卻沒實際 Play Store release」的漂移）。
    - pubspec `+buildNumber` 會被 CD 自動 commit 回 main，開發者拉下來後會看到 buildNumber 已被推進，不需手動維護。
