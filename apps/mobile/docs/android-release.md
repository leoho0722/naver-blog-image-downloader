# Android Release 流程說明

本文件說明 Mobile App 的 Android 版本從 pubspec 版號 bump 一路到 Google Play Store 上架的完整流程、每個 GitHub Secret 的用途、首次上線前必須完成的人工準備、金鑰輪替 SOP，以及 CD 失敗情境下的行為準則。

> 相關檔案：`.github/workflows/mobile-cd.yml`（自動 Internal + Closed 上傳）、`.github/workflows/mobile-android-promote.yml`（手動 promote 到 Production）、`apps/mobile/android/fastlane/`（fastlane 設定）、`apps/mobile/android/key.properties.template`（本機 signing 範本）。

## 流程總覽

1. 開發者在 PR 上把 `apps/mobile/pubspec.yaml` 的 semver（`X.Y.Z`）往上 bump（例：`1.6.1+1` → `1.7.0+1`），merge 入 `main`。
2. `Mobile CI` workflow 跑完綠燈後，`Mobile CD` 自動接手：
    - `android-release` job 用 GitHub Secrets 還原 signing 材料，把 pubspec 的 `+buildNumber` 自動遞增，建 signed AAB，先上 Play Store Internal track、再上 Closed track。
    - 兩個 track 都上成功後，把 bumped pubspec commit 回 `main`（commit message 含 `[skip ci]`，避免 `Mobile CI` 被再次觸發）。
    - `release` job 在 `android-release` 成功之後才執行，建立 `mobile-v<X.Y.Z>` tag 與 GitHub Release。
3. Production 上架**永遠不自動**。需要正式放量時，人工到 GitHub Actions 觸發 `mobile-android-promote` workflow，輸入要 promote 的 tag（例：`mobile-v1.7.0`）與 rollout 百分比（預設 `0.1`，即 10% staged rollout）。

## 必備 GitHub Secrets

以下 Secrets 必須在 repo 的 Settings → Secrets and variables → Actions 設好才能讓 CD 正常運作。所有 Secret 都必須經由 GitHub Actions Secrets 於 runtime 還原，**Play Store 相關金鑰一律不得以任何形式落入版本控制（原則對應 spec：All Play Store credentials SHALL come from GitHub Actions Secrets at runtime only）**。

| Secret 名稱 | 用途 | 格式 |
|-------------|------|------|
| `ANDROID_KEYSTORE_BASE64` | Upload keystore（`.jks`）的 base64 內容，CD runtime 還原成 `apps/mobile/android/app/keystore.jks` | base64 字串 |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore 密碼 | 字串 |
| `ANDROID_KEY_ALIAS` | Keystore 內所使用的 key alias | 字串 |
| `ANDROID_KEY_PASSWORD` | 該 alias 的密碼 | 字串 |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Play Developer API service account 的 JSON 憑證（完整檔案內容），CD runtime 寫到 `apps/mobile/android/fastlane/play-service-account.json` | JSON 字串 |

### Signing 實作方式（CD runtime 還原 keystore + 產生 `key.properties`，Gradle 從 `key.properties` 讀）

- `apps/mobile/android/app/build.gradle.kts` 的 release signingConfig 會讀 `apps/mobile/android/key.properties` 四個欄位：`storeFile` / `storePassword` / `keyAlias` / `keyPassword`。
- 本機：從 `key.properties.template` 複製出 `key.properties` 手動填值即可（本機 debug/profile 一般用不到 release signing，只有在本機想產 release AAB 測試時才需要）。
- CI/CD：`android-release` job 前置步驟會把 `ANDROID_KEYSTORE_BASE64` base64 decode 寫到 `app/keystore.jks`，再以 `printf` 寫出 `key.properties`；Job 結束時以 `if: always()` 把 `keystore.jks`、`key.properties`、`play-service-account.json` 三個落地檔案一併清掉。
- 檔案絕對不得進版控：`apps/mobile/android/.gitignore` 已排除 `key.properties`、`app/keystore.jks`、`fastlane/report.xml`、`fastlane/README.md`。

## 一次性前置準備

下列操作需要人工走過一次，缺任何一步 CD 都會失敗。

### 0. Play Console 開發者帳號身份驗證（最容易忽略的 blocker）

- Play Console 會要求開發者帳號通過**身份驗證**才能建立任何 release（含 Internal / Closed testing）。若畫面顯示「帳戶發生問題，因此無法發布應用程式變更」這類錯誤，點「查看詳細資訊」會跳轉到身份驗證流程。
- 個人帳號通常需：政府發行 ID（正反面）、電話驗證（OTP）、一組要公開在 Play 商店上的聯絡 email。
- 送出後由 Google **人工審核 2–3 個工作天**（偶爾拖到一週）。審核通過後才能回來建第一個 release。
- 經驗觀察：Closed testing 有時能先建出 release，但 Internal testing 會擋住；CD 會先上 Internal 再上 Closed，**兩條 track 都必須能上傳**，所以這關沒過 CD 一定 fail。
- 另外提醒：個人帳號將來要 promote 到 **Production**，Google 還要求「**12 位 closed testing tester 持續 14 天以上**」才會開放 production 上架；這不影響 Internal / Closed 本身的 CD 上傳，只影響 `mobile-android-promote` workflow 的實際放量時機。

### 1. 產 upload keystore、備份、存入 Secret

```bash
# 於本機執行（找一台可信賴的 Mac / Linux）
keytool -genkey -v -storetype JKS \
  -keystore upload-keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias upload
```

- 產出的 `upload-keystore.jks`、keystore 密碼、key alias、alias 密碼，**立刻備份到 1Password（或等效密碼管理工具）**。
- 這把 keystore 是 app 上 Play Store 的身份證明；**不可遺失**，不可放進版本控制。
- 如啟用 Play App Signing，Google 會幫你另外管理 signing key（也就是裝到終端使用者手上那把）；但 upload key 仍由我們自己保管，本篇流程不變。
- 把 keystore 轉 base64 存進 `ANDROID_KEYSTORE_BASE64`：

```bash
base64 -i upload-keystore.jks | pbcopy     # macOS
# 或：
base64 upload-keystore.jks                  # Linux (輸出後複製)
```

- 貼到 GitHub repo → Settings → Secrets and variables → Actions → `New repository secret`，名稱 `ANDROID_KEYSTORE_BASE64`。
- 同場加映：再建三個 secret：`ANDROID_KEYSTORE_PASSWORD`、`ANDROID_KEY_ALIAS`、`ANDROID_KEY_PASSWORD`，對應剛才設定的值。

### 2. Play Console：建立 app listing、Internal + Closed track、邀請測試者、手動上傳種子 AAB

1. 登入 [Google Play Console](https://play.google.com/console)。
2. 建立新 App（如果尚未存在）：applicationId 使用 `com.leoho.naverBlogImageDownloader.android`（需與 `apps/mobile/android/app/build.gradle.kts` 的 `defaultConfig.applicationId` 完全一致）。
3. 在左側 Testing → Internal testing → **Create new release**；在 Testing → Closed testing → **建一個 track**（fastlane 對應 `track: "alpha"`）→ 同樣按 Create new release。
    - Play Console UI 與 fastlane `track` 值對應關係：
        - Internal testing → `internal`
        - Closed testing → `alpha`
        - Open testing → `beta`（本專案不使用）
        - Production → `production`（本專案只透過 `mobile-android-promote.yml` 手動 promote）
4. 第一次 release 必須透過 Play Console UI 人工上傳一份「種子 AAB」（Google 要求以這個動作初始化 app）。可以用本機 `bundle exec fastlane build_release_aab` 產出的 AAB 直接拖曳上傳。
5. 在 Internal / Closed track 的 **Testers** 頁面邀請測試者（可建 Google Groups 或直接加 email）。
6. 發佈首個 release（Review → Start rollout to Internal testing / Closed testing）。

### 3. Google Cloud：建立 service account、Play Console 授權、JSON 存入 Secret

> 2026 年起 Google 已簡化流程：**不再需要**把 Play Console 開發者帳號 link 到特定 GCP project，任何啟用 Google Play Android Developer API 的 GCP project 皆可；Play Console 端舊路徑「Setup → API access → Grant access」也已下架，service account 的授權改走 **Users and permissions** 頁面，把 service account email 當成一般使用者邀請進來。

1. 登入 [Google Cloud Console](https://console.cloud.google.com/)，選一個既有 GCP project 或新建一個（命名可如 `naver-blog-play-release`）。
2. APIs & Services → Library → 搜尋 **Google Play Android Developer API** → Enable。
3. IAM & Admin → Service Accounts → Create Service Account，取一個便於辨識的名稱（例：`naver-blog-play-release`）；這一步**不需要**在 GCP 端指派任何 IAM role，權限全部由 Play Console 端管理。
4. 建立完成後點該 service account → Keys → Add Key → Create new key → JSON → 下載，並記下該 service account 的 email（形如 `naver-blog-play-release@<project>.iam.gserviceaccount.com`）。
5. 回到 Play Console → 左側 **Users and permissions** → **Invite new users** → Email address 填入上一步的 service account email → **App permissions** 頁籤加入目標 app → 勾選「Release manager」等效權限（至少 `View app information and download bulk reports`、`Manage production releases`、`Manage testing track releases`；不要給 Admin / Account permissions 類的帳號層權限）→ Invite user。
    - 邀請送出後，Google 端最多約 24 小時才會讓 service account 完整生效；若 CD 第一次跑出現 `The caller does not have permission` 類錯誤可稍後重試。
6. 打開剛下載的 JSON 檔（完整內容）貼到 GitHub repo → Settings → Secrets → `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`（整個 JSON 字串，含大括號）。**此 JSON 絕不得進版本控**。

## 如何手動 promote 到 Production

當 Closed track 的 build 測過沒問題，要正式放量時：

1. 打開 GitHub 的 Actions → 左側選 `mobile-android-promote`。
2. 按右上 **Run workflow**。
3. 輸入：
    - `tag`：要 promote 的 `mobile-v<X.Y.Z>`（例：`mobile-v1.7.0`）。
    - `rollout`：0.0 ～ 1.0 之間的小數；預設 `0.1`（10% staged rollout）。
        - 推薦節奏：`0.1` → `0.25` → `0.5` → `1.0`，每個階段至少觀察 24–48 小時，看 Crashlytics / Play Console vitals 有沒有異常。
        - 如果只有極少量使用者（個位數），10% 可能意義不大，可直接 `1.0` 全量放出；此判斷由人工決定。
4. Workflow 會 checkout 該 tag 對應 commit，還原 service account JSON，呼叫 `fastlane promote_to_production` lane。
    - 這條 lane **不會重新上傳 AAB**，只把 Closed（`alpha`）track 上已存在的 release promote 到 Production 並設定指定 rollout。
5. Workflow 結束會以 `if: always()` 清掉 service account JSON。

## 金鑰輪替 SOP

### 輪替 upload keystore（極少發生；遺失、懷疑外洩時才做）

> 如果啟用了 Play App Signing，Play Console 支援「重置 upload key」：新產一把 keystore 後透過 Play Console → Setup → App integrity 要求重新綁定 upload key，Google 會收到新 upload key 後重新綁。舊 keystore 仍可作為緊急備用。

1. 以前述 `keytool` 流程產新 keystore，備份到 1Password。
2. 啟用 Play App Signing 的情況：Play Console → Setup → App integrity → Upload key certificate → Request upload key reset，按指示上傳新 upload key；生效前 Play Store 仍接受舊 upload key。
3. 生效後，把 `ANDROID_KEYSTORE_BASE64`、`ANDROID_KEYSTORE_PASSWORD`、`ANDROID_KEY_ALIAS`、`ANDROID_KEY_PASSWORD` 四個 secret 以新值覆寫。
4. 觸發一次 CD 或推一個 patch bump 走完 Internal + Closed 確認正常。

### 輪替 service account JSON（建議每 6 個月一次或懷疑外洩時）

1. Google Cloud Console → 找到既有 service account → Keys → Add Key → Create new key → JSON。
2. 更新 GitHub secret `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` 為新內容。
3. 舊 key 保留 24 小時觀察是否還有正在執行中的 workflow；沒異常後回 Google Cloud Console 刪除舊 key。

## CD 失敗行為準則

| 失敗點 | CD 行為 | 人工後續 |
|--------|---------|----------|
| 讀 `pubspec.yaml` 失敗或沒有 `+buildNumber` | Job fail，`::error::Failed to read version` | 修 pubspec 格式後重推 |
| `ANDROID_KEYSTORE_BASE64` 等 signing secret 缺失 | Job fail，錯誤訊息指名缺哪個 secret、並指向此文件 | 依本文件設好 secret 後重推 |
| AAB build 失敗 | Job fail，**不 commit pubspec**，下次推送會重試 | 看 log 修 build issue |
| Internal upload 失敗 | Job fail；Closed 不嘗試；**不 commit pubspec** | 看 fastlane log 排查 |
| Internal 成功、Closed 失敗 | Job fail；**不 commit pubspec**；Internal track 會留一筆孤兒 release，下次 CD 用更大的 versionCode 再上一次（無大礙，若要清理由人工到 Play Console 操作） | 看 log 排查 Closed track 設定 |
| Internal + Closed 成功、commit-back 失敗 | Job fail；但 Play Store 已上 release。極罕見情境（通常是 CD 執行期間 main 被他人 push） | **手動 bump `apps/mobile/pubspec.yaml` 的 `+buildNumber` 至下次仍大於 Play Store 的值**，否則下次 CD 會用重複 versionCode 被 Play Store 拒 |
| Promote workflow 失敗 | 無副作用（沒上傳新 AAB） | 重新 dispatch 即可 |

## 首次上線驗證清單

首次把 `mobile-android-cd-fastlane` change merge 入 `main` 之前，逐項打勾：

- [ ] Play Console 開發者帳號身份驗證已通過（Settings → Developer identity / Account details 顯示 Verified；未通過會擋住 Internal track release 建立）。
- [ ] GitHub Secrets 皆已設定（`ANDROID_KEYSTORE_BASE64`、`ANDROID_KEYSTORE_PASSWORD`、`ANDROID_KEY_ALIAS`、`ANDROID_KEY_PASSWORD`、`GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`）。
- [ ] Play Console 上該 app 已有 Internal + Closed track 的首個 release（透過 UI 手動上傳種子 AAB 完成初始化）。
- [ ] Service account 在 Play Console 已授予目標 app 的 Release manager 權限。
- [ ] 本機跑過 `cd apps/mobile/android && bundle install && bundle exec fastlane build_release_aab`（配合本地 `key.properties` + `keystore.jks`）確認可產 signed AAB。
- [ ] 確認 `.gitignore` 已擋住 `key.properties` / `keystore.jks` / `fastlane/play-service-account.json` / `fastlane/report.xml` / `fastlane/README.md`。

首次 merge 之後觀察：

- [ ] `Mobile CI` 綠燈後 `Mobile CD` 接上，`android-release` job 成功走完 Internal + Closed 上傳。
- [ ] pubspec commit 回 main，commit message 類似 `chore(mobile): bump build number 至 +2` 且含 `[skip ci]`。
- [ ] `Mobile CI` **沒有**被 commit-back 再次觸發（重點驗證 `[skip ci]` 機制）。
- [ ] `mobile-v<X.Y.Z>` git tag 與 GitHub Release 已建立。
- [ ] Play Console Internal / Closed track 都可看到新 release，versionCode 與 pubspec 新 `+N` 一致。
