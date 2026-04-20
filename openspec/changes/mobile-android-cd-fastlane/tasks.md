## 1. Play Console 與 keystore 一次性準備（人工執行，以文件落地）

- [x] 1.1 撰寫 `apps/mobile/docs/android-release.md`，把整條 Android release 流程、GitHub Secrets 清單、keystore 建立步驟、Play Console service account 授權步驟、輪替金鑰 SOP、首次上線驗證清單全部寫清楚；文件須同時涵蓋 Decision: Signing 以「CD runtime 還原 keystore + 產生 key.properties」實作，Gradle 從 key.properties 讀 以及 Decision: 失敗情境下 CD 的行為準則
- [x] 1.2 在 `android-release.md` 的前置步驟章節列出：以 `keytool` 產 upload keystore、備份金鑰至 1Password（或等效保管處）、base64 encode 存入 GitHub Secret `ANDROID_KEYSTORE_BASE64`
- [x] 1.3 在 `android-release.md` 列出 Play Console 操作：建立 app listing（若尚未存在）、建立 Internal testing + Closed testing track、上傳首個「種子 AAB」手動建立首次 release、邀請測試者群組
- [x] 1.4 在 `android-release.md` 列出 Google Cloud 操作：建立 service account、產生 JSON key、於 Play Console 授予 Release manager 權限、JSON 存入 GitHub Secret `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`，並明確標註「All Play Store credentials SHALL come from GitHub Actions Secrets at runtime only」

## 2. Android 專案 signing 設定

- [x] 2.1 修改 `apps/mobile/android/app/build.gradle.kts`：移除 release buildType 中「signingConfig = signingConfigs.getByName("debug")」TODO，新增 release signingConfig 從 `../key.properties` 讀 `storeFile` / `storePassword` / `keyAlias` / `keyPassword`；此步驟落實 Requirement「Pipeline SHALL produce a signed Android App Bundle from release signing configuration」
- [x] 2.2 新增 `apps/mobile/android/key.properties.template`，列出四個欄位與註解說明（不含任何密鑰）；內容以正體中文註解說明本機使用方式
- [x] 2.3 擴充 `apps/mobile/android/.gitignore`，新增 `key.properties`、`app/keystore.jks`、`fastlane/report.xml`、`fastlane/README.md` 四行，避免任何 signing / fastlane 產出物意外進版控
- [x] 2.4 於 repo 進行一次全檔案掃描確認無 keystore、金鑰密碼或 service account JSON 殘留，對應 Requirement「All Play Store credentials SHALL come from GitHub Actions Secrets at runtime only」的 Repository scan for credentials scenario

## 3. fastlane 設定

- [x] 3.1 於 `apps/mobile/android/` 新增 `Gemfile`，pin fastlane 到最新 stable minor；決策依據為 Decision: fastlane 版本以 Gemfile + Gemfile.lock 鎖定，CI/本機一致
- [x] 3.2 執行 `bundle install` 產出 `Gemfile.lock` 並 commit；落實 Requirement「Pipeline SHALL use fastlane with version locked via Gemfile」
- [x] 3.3 新增 `apps/mobile/android/fastlane/Appfile`，設定 `package_name "com.leoho.naverBlogImageDownloader.android"`，`json_key_file` 指向 runtime 產出的 JSON 路徑
- [x] 3.4 新增 `apps/mobile/android/fastlane/Fastfile`，實作三條 lane：`build_release_aab`（呼叫 `flutter build appbundle --release --build-number=<N>`，`N` 由環境變數傳入）、`upload_beta`（`supply` 先 `track: "internal"` 再 `track: "alpha"`，兩次都帶同一 AAB 路徑）、`promote_to_production`（`supply` 帶 `track: "alpha"`、`track_promote_to: "production"`、`rollout` 由環境變數傳入，`skip_upload_aab: true`）；這條 lane 集合實作 Decision: Internal + Closed 平行上傳以兩次 `supply` sequential call 實作
- [x] 3.5 Fastfile 所有註解、log（`UI.message`）以正體中文撰寫；lane 開頭 echo 關鍵輸入（track、versionCode、rollout）便於 CI 排錯

## 4. mobile-cd.yml 擴充：Android release job

- [x] 4.1 在 `.github/workflows/mobile-cd.yml` 既有 `release` job 之前新增 `android-release` job，實作 Decision: 擴充現有 mobile-cd.yml，而不是新開 tag-push 觸發的 workflow；`release` job 改為 `needs: [android-release]`
- [x] 4.2 `android-release` job 複用既有版本抽取與 tag 存在檢查邏輯（或抽到共用 step），落實 Requirement「Android release pipeline SHALL trigger automatically when mobile semver bump lands on main」；tag 已存在時 skip 並輸出 `::notice::`
- [x] 4.3 `android-release` job 新增 runtime 還原 signing 材料步驟：base64 decode `ANDROID_KEYSTORE_BASE64` 到 `apps/mobile/android/app/keystore.jks`，組出 `apps/mobile/android/key.properties`；secret 缺失時以可 actionable 的錯誤訊息失敗（指向 `android-release.md`）
- [x] 4.4 `android-release` job 實作 buildNumber 自動遞增：讀 `apps/mobile/pubspec.yaml` 取目前 `+N`、計算 `N+1`、改寫 pubspec、以 `bundle exec fastlane build_release_aab` 傳入 `N+1`；對應 Requirement「Pipeline SHALL auto-increment versionCode from pubspec.yaml and commit it back to main」
- [x] 4.5 `android-release` job 產出 `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` 到 `apps/mobile/android/fastlane/play-service-account.json`（transient file），呼叫 `bundle exec fastlane upload_beta`；落實 Requirement「Pipeline SHALL upload the same AAB to Play Store Internal and Closed tracks」
- [x] 4.6 `android-release` job 上傳成功後以 `stefanzweifel/git-auto-commit-action@v7` 將 bumped pubspec commit 回 `main`，commit message 使用正體中文 Conventional Commits：`style(mobile): bump build number 至 +<N+1>`，body 列點並含 `[skip ci]`；實作 Decision: versionCode 以 pubspec `+buildNumber` 為唯一來源，CD 遞增後 commit 回 main 並加 `[skip ci]`
- [x] 4.7 `release` job（tag + GitHub Release 建立）保持為 `needs: [android-release]`，確保 Requirement「Git tag and GitHub Release SHALL be created only after both track uploads succeed」以及 Decision: Signed AAB 成功上傳後才建 tag 與 GitHub Release
- [x] 4.8 `android-release` job 結束步驟以 `if: always()` 清除 keystore.jks、key.properties、play-service-account.json 三個落地檔案
- [x] 4.9 補齊 `android-release` job 所有 `echo`、`::error::`、`::notice::` 訊息以正體中文撰寫；明確涵蓋 Decision: 失敗情境下 CD 的行為準則 所列各失敗點之訊息內容

## 5. 新增 Production promote workflow

- [x] 5.1 新增 `.github/workflows/mobile-android-promote.yml`，`on: workflow_dispatch` 並定義輸入 `tag`（必填，`mobile-v<X.Y.Z>` 格式）、`rollout`（選填、預設 `0.1`、型別 string、workflow 內驗證範圍 0.0–1.0）；實作 Requirement「Production promote SHALL be a manually triggered workflow separate from the main CD」與 Decision: Production promote 以獨立 workflow + workflow_dispatch 實作
- [x] 5.2 Promote workflow 以 `actions/checkout@v6` 的 `ref: ${{ inputs.tag }}` 取得該 tag 對應 commit；還原 Play service account JSON；執行 `bundle exec fastlane promote_to_production rollout:${{ inputs.rollout }}`
- [x] 5.3 Promote workflow 於 job 結束以 `if: always()` 清除 service account JSON；所有 `echo`、錯誤訊息以正體中文撰寫
- [x] 5.4 在 `android-release.md` 文件內補上「如何手動 promote 到 Production」章節（GitHub UI Run workflow 流程、rollout 語意、推薦 staged rollout 節奏）

## 6. 版號 bump 與本地驗證

- [x] 6.1 將 `apps/mobile/pubspec.yaml` 的 version 由 `1.6.1+1` bump 至 `1.7.0+1`（minor bump，對應「可上 Play Store beta」使用者可見行為）；不更動 `+buildNumber`（依專案慣例只動 semver 三段）
- [x] 6.2 於本機執行 `cd apps/mobile/android && bundle install` 確認 Gemfile.lock 可重現
- [ ] 6.3 於本機建立本地 `key.properties` + `keystore.jks`（開發者自己的 keystore）後執行 `bundle exec fastlane build_release_aab` 驗證可產 signed AAB；確認 AAB 內的 versionCode / versionName 符合預期
- [ ] 6.4 第一次將此 change 的分支 merge 入 `main` 前，先於 GitHub 介面檢查所有必要 Secrets（`ANDROID_KEYSTORE_BASE64`、`ANDROID_KEYSTORE_PASSWORD`、`ANDROID_KEY_ALIAS`、`ANDROID_KEY_PASSWORD`、`GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`）都已設定
- [ ] 6.5 Merge 後觀察第一次 CD 實際走過完整流程（Internal + Closed 都上成功、pubspec commit 回 main 帶 `[skip ci]`、`mobile-v1.7.0` tag + Release 建立），並確認 `Mobile CI` 未因 commit-back 被再次觸發
- [x] 6.6 於 `apps/mobile/CLAUDE.md` 補充一小節：說明 Android release 相關檔案（`key.properties`、`keystore.jks`、`fastlane/play-service-account.json`）均不得進版控，並指向 `docs/android-release.md`
