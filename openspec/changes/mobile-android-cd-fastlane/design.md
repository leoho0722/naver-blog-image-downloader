## Context

Mobile 目前的 CD 只做 tag + GitHub Release（`.github/workflows/mobile-cd.yml`），以 `workflow_run` 方式接在 `Mobile CI` 之後，當 `apps/mobile/pubspec.yaml` 的 semver 變動且對應 tag 不存在時才建 tag。

此 change 要在這條既有管線上**疊加** Android 的「build → sign → 上傳 Play Store Internal + Closed」流程，並另外提供一條手動觸發的 promote-to-production workflow。主要約束與前提：

- 現況 `apps/mobile/android/app/build.gradle.kts` L44-46 的 release signingConfig 仍指向 debug key（TODO 狀態）。必須先把 release signing 接通，才能產 Play Store 接受的 AAB。
- 現況 `versionCode = flutter.versionCode`，其來源是 `pubspec.yaml` 的 `+buildNumber`（目前為 `1.6.1+1`）。Play Store 要求 versionCode 單調遞增；此 change 決定由 CD 負責遞增並 commit 回 `main`。
- 現況 GitHub Actions 已有 `stefanzweifel/git-auto-commit-action@v7` 的使用先例（`mobile-ci.yml` 的 Dart format auto-commit），commit-back 模式有前例可循。
- iOS fastlane CD 尚未存在，本 change 不處理 iOS；但 lane 命名與 workflow 結構要為「日後 iOS 也加入」留空間（例如 `.github/workflows/mobile-cd.yml` 採用子 job 區分 Android / iOS）。
- Monorepo root `CLAUDE.md` 規定所有 commit、註解、log 為正體中文 Conventional Commits + 列點 body；fastlane Ruby 與 GitHub workflow 的 log/echo 訊息亦遵循。

Stakeholders：mobile 開發者（我自己）、Play Console 測試群組成員（Internal + Closed）、正式使用者（Production）。

## Goals / Non-Goals

**Goals:**

- 每次 mobile semver bump 推到 `main`，在 CI 綠燈後自動：產 signed AAB → 同時上傳到 Play Store Internal + Closed → 成功後 bump `+buildNumber` commit 回 main → 建 `mobile-v<version>` tag 與 GitHub Release。
- Production 上架僅由人工觸發 `workflow_dispatch`，預設 staged rollout 10%，可覆寫。
- 所有 signing 與 Play Developer API 金鑰僅存在 GitHub Actions Secrets，repo 內絕對不出現任何密鑰文字。
- `versionCode` 單調遞增的保證完全由 pubspec `+buildNumber` + CD 自動遞增 + commit-back 維持，不依賴 runtime 查詢 Play Store。
- Android CD 失敗時不留下 tag／GitHub Release，避免「tag 存在但 Play Store 沒對應 release」的漂移。
- fastlane 版本以 Gemfile + Gemfile.lock 鎖定，CI 與本機以 `bundle exec fastlane …` 執行，不依賴機器全域 Ruby。

**Non-Goals:**

- iOS fastlane / TestFlight 建置。
- Production 任何形式的自動推送（包含「小 rollout 自動化」）。
- Play Store listing metadata（description、screenshots、feature graphic、多語 whatsnew）同步自動化。
- 多 flavor（staging / prod 分開 applicationId）。
- 從 Play Developer API 查詢實際 versionCode 做 max reconciliation（只信 pubspec + CD 遞增）。
- 已發布 tag 的 re-run：一個 semver 只上一次 Play Store，失敗需 bump 後重試。

## Decisions

### Decision: 擴充現有 mobile-cd.yml，而不是新開 tag-push 觸發的 workflow

**選擇**：沿用現有 `.github/workflows/mobile-cd.yml` 的 `workflow_run` 觸發模式，在既有 tag/release 邏輯之前插入 Android release job（命名 `android-release`），tag/release job 改為 `needs: [android-release]` 並在其成功時才執行。未來要加入 iOS release job（例如 `ios-release`）時，tag/release job 可擴充為 `needs: [android-release, ios-release]`。

**替代方案**：

1. 新增 `.github/workflows/mobile-release.yml`，由 tag push（`on: push: tags: mobile-v*`）觸發。
    - **拒絕理由**：現有 CD 是「CD 自己建立 tag」，若改成「tag push 觸發 release」會變成「需要有人手動推 tag → 觸發 workflow」，破壞「push pubspec bump 到 main 即全自動」的 UX，違反使用者原意。
2. 全部改寫成 tag 觸發並把 tag 建立責任交還給開發者。
    - **拒絕理由**：同上，且會跟既有 `backend-cd.yml` / `web-cd.yml` 的行為不一致。

### Decision: Signed AAB 成功上傳後才建 tag 與 GitHub Release

**選擇**：`android-release` job 完成全部上傳（Internal + Closed 都成功）後，才由 `release` job 建 git tag 與 GitHub Release。

**理由**：

- 保證不變式「`mobile-v<version>` tag 存在 ⇔ Play Store 上已存在對應 release」。
- 失敗時開發者只需修正問題重推（或等下次 bump），不用手動清掉半建立的 tag／release。
- GitHub Release 的 notes 可在 release job 內呼叫既有 `./.github/actions/generate-release-notes`，流程不變。

**替代**：先建 tag 再 upload。拒絕：失敗會漂移，得人工清理。

### Decision: versionCode 以 pubspec `+buildNumber` 為唯一來源，CD 遞增後 commit 回 main 並加 `[skip ci]`

**選擇**：

1. `android-release` job checkout 後執行遞增腳本：讀 `pubspec.yaml` 取 `+N`，算出 `N+1`，改寫 `pubspec.yaml`。
2. 以新的 `N+1` 作為 `flutter build appbundle --build-number=<N+1>` 的參數（覆寫 Flutter Gradle Plugin 讀到的值）。
3. Play Store 上傳（Internal + Closed 都成功）後，以 `stefanzweifel/git-auto-commit-action@v7`（既有 CI workflow 已使用）把 pubspec 變更 commit 回 `main`，commit message：

        ```
        style(mobile): bump build number 至 +<N+1>

        - CD 自動遞增 versionCode，保持 Play Store 單調遞增不變式
        - [skip ci]
        ```

    `[skip ci]` 尾綴阻斷 `mobile-ci.yml` 的 push trigger，避免迴圈。

**替代方案**：

1. 用 `github.run_number` 或 timestamp 當 versionCode。
    - **拒絕**：本機 build 與 CD build 的 versionCode 會完全無關、難追蹤；而且 `run_number` 不是嚴格遞增（不同 workflow 各自一個計數器），風險高。
2. 呼叫 Play Developer API 查當前 versionCode 取 `max(pubspec, playStore) + 1`。
    - **拒絕**：增加外部依賴與失敗面向，MVP 不必要；此路徑保留為未來 enhancement（若發生「本機手動上傳導致 pubspec 落後」的情境再補）。
3. 不 commit 回 main，每次 CD 都用 `+N`（讀到什麼用什麼）。
    - **拒絕**：pubspec 只有 `+1` 的話永遠都用 `+1` build，Play Store 第二次上傳就會因 versionCode 未遞增被拒。

### Decision: Internal + Closed 平行上傳以兩次 `supply` sequential call 實作

**選擇**：`fastlane upload_beta` lane 先 `upload_to_play_store(track: "internal", …)`，再 `upload_to_play_store(track: "alpha", …, skip_upload_aab: false)`，兩次都上同一個 AAB。兩次都成功才視為 lane 成功。

**理由**：

- Play Developer API 每個 track 是獨立 release，沒有「一次上多 track」的 API。
- 先 `internal`（受眾小、快速驗證 binary 可安裝）再 `alpha`（closed），失敗點比較容易判讀：internal 失敗 = 檔案或帳號問題；alpha 失敗 = track 設定問題。
- 兩者共用同一個 AAB 檔案，fastlane `supply` 會 reuse（第二次 call 設 `skip_upload_aab` 視情況；實作上兩 track 傳同 AAB 是 fastlane 支援的 idempotent 操作）。

**替代**：`upload_to_play_store` 的 `tracks:` array。拒絕：fastlane `supply` 目前 `track` 欄位是單一值，array 寫法並非 stable API。

**Track 名稱對應表**（Play Console UI vs Play Developer API / fastlane）：

| Play Console UI    | fastlane `track` 值 |
| ------------------ | ------------------- |
| Internal testing   | `internal`          |
| Closed testing     | `alpha`             |
| Open testing       | `beta`              |
| Production         | `production`        |

### Decision: Production promote 以獨立 workflow + workflow_dispatch 實作

**選擇**：新增 `.github/workflows/mobile-android-promote.yml`，`on: workflow_dispatch` 輸入：

- `tag`（必填）：要 promote 的 `mobile-v<version>` tag；workflow checkout 該 tag 對應 commit（取得當時的 fastlane 設定、Gemfile.lock 等）。
- `rollout`（選填，預設 `0.1`）：production staged rollout 百分比（0.0–1.0）。

執行 `fastlane promote_to_production`，該 lane 呼叫 `upload_to_play_store(track: "alpha", track_promote_to: "production", rollout: <input>, skip_upload_aab: true, skip_upload_metadata: true, skip_upload_images: true, skip_upload_screenshots: true)`，只做 track 間 promote，不重新上 AAB。

**理由**：獨立 workflow 避免跟主 CD 的自動觸發混在一起；`workflow_dispatch` 在 GitHub UI 有明確「Run workflow」按鈕，人工 gate 自然。

**替代**：

1. 在 mobile-cd.yml 內加 `workflow_dispatch` input。拒絕：讓同一 workflow 同時處理「自動 CD」與「手動 promote」會把條件分支寫得很複雜。
2. 用 GitHub Environment approval（`environment: production`）。拒絕：MVP 不必要，未來可追加。

### Decision: Signing 以「CD runtime 還原 keystore + 產生 key.properties」實作，Gradle 從 key.properties 讀

**選擇**：

1. `apps/mobile/android/app/build.gradle.kts` 新增 release signingConfig，讀 `../key.properties`（位置 `apps/mobile/android/key.properties`）。
2. `key.properties` 與 `keystore.jks` 都在 `.gitignore`。
3. 本機：開發者從 `key.properties.template` 複製出 `key.properties` 填值（本機 debug/profile 用不到 release signing，只有本機要產 release AAB 測才需要）。
4. CD runtime：`android-release` job 執行前置步驟：
    - `echo "$ANDROID_KEYSTORE_BASE64" | base64 --decode > apps/mobile/android/app/keystore.jks`
    - 以 `printf` 寫出 `apps/mobile/android/key.properties`，四個欄位 `storeFile=app/keystore.jks` / `storePassword=…` / `keyAlias=…` / `keyPassword=…`。
    - job 結束前 `rm -f` 兩個檔案（GitHub runner 雖 ephemeral 仍好習慣）。

**理由**：這是 Android + Flutter 社群最主流 pattern（Flutter 官方發行文件採同一做法），可讀、可在本機重現、工具鏈相容性最好。

**替代**：

1. 將整個 keystore.jks 以 env 變數傳入 Gradle（無檔案落地）。拒絕：Android Gradle Plugin 需要 keystore 以檔案形式提供，繞法複雜。
2. Android App Bundle Play Integrity / Play App Signing（Play Store 代管簽章）。**保留可能性**：開發者若已 opt-in Play App Signing，upload keystore 仍由我們管；簽出 production 的 key 由 Google 代管。此 change 的 pipeline 對兩種情境都可用（我們產 upload key 簽 AAB，Google 收到後看自己有沒有代管 signing key）。

### Decision: fastlane 版本以 Gemfile + Gemfile.lock 鎖定，CI/本機一致

**選擇**：`apps/mobile/android/Gemfile` 明列 `fastlane`（pin minor）、`fastlane-plugin-supply` 也是 fastlane 內建（不用額外 plugin）。CI 使用 `ruby/setup-ruby@v1` + `bundler-cache: true`，本機用 `bundle install` + `bundle exec fastlane …`。

**理由**：避免 fastlane major 更新打破 lane；`bundler-cache` 會 cache Ruby deps 加速後續 CI。

### Decision: 失敗情境下 CD 的行為準則

| 失敗點                                          | 行為                                                                                                                                                                                                                                                  |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pubspec 讀取失敗 / 沒有 `+N`                    | job fail，不動任何東西，保留既有 `::error::Failed to read version` 風格錯誤訊息                                                                                                                                                                       |
| `ANDROID_KEYSTORE_BASE64` 等 secret 缺失        | job fail，明確錯誤訊息指向 `apps/mobile/docs/android-release.md` 的 secrets 清單                                                                                                                                                                      |
| AAB build 失敗                                  | job fail，pubspec 不 commit 回；下次推觸發會重來                                                                                                                                                                                                      |
| Internal upload 失敗                            | job fail；Closed 不嘗試；pubspec 不 commit 回                                                                                                                                                                                                         |
| Internal 成功、Closed upload 失敗               | job fail；pubspec 不 commit 回。Internal 已收到一個新 versionCode 的 AAB，但下次 CD 會用更大的 versionCode 再上一次（Internal track 的 release list 上會留一筆無後續 promote 的 release，可接受；未來若要清理由人工操作）                            |
| Internal + Closed 都成功、commit-back 失敗      | job fail；但 Play Store 已經有 release。此時警告：下次推送前必須手動 bump pubspec `+buildNumber`，否則下次 CD 會用相同 versionCode 被 Play Store 拒絕。這條失敗情境**極罕見**（僅發生於 main 在 CD 執行期間被他人 push），接受人工介入              |
| Production promote workflow 失敗                 | 無副作用（沒上傳新 AAB）；重新 dispatch 即可                                                                                                                                                                                                          |

## Risks / Trade-offs

- **Risk**：CD commit-back 與人為 push 到 `main` 發生衝突 → Mitigation：`git-auto-commit-action` 會 `pull --rebase` 再 push；極端情境下 job fail，手動處理。
- **Risk**：`[skip ci]` 機制在未來 GitHub Actions 版本或 branch protection 設定下可能失效 → Mitigation：tasks 要求新增一筆 verification step：push 後 30 秒觀察 Mobile CI 是否被觸發（自動化不做，納入 android-release.md 文件提醒首次上線後驗證一次）。
- **Risk**：pubspec 的 `+buildNumber` 在 release 分支 / cherry-pick / revert 情境下可能落後 Play Store 實際值 → Mitigation：Non-Goal 已聲明只信 pubspec；若真發生，人工在 pubspec 一次跳到大於 Play Store 的值即可。
- **Risk**：GitHub Actions runner 對 Ruby / fastlane 版本有隱性相容問題 → Mitigation：Gemfile 鎖 fastlane minor，`bundler-cache: true` 確保 reproducible。
- **Risk**：upload keystore 遺失（只存於 Secrets，未備份）→ Mitigation：tasks 要求產生 keystore 時產出 keystore + 密碼的加密備份（開發者自己保管，例如 1Password），流程寫進 `android-release.md`；若 opt-in Play App Signing，重新產 upload key 也可由 Play Console 重新綁定。
- **Trade-off**：選擇「每次 CD 都 commit 回 pubspec」會讓 git log 多出一筆 `style(mobile): bump build number …` commit，略顯吵。可接受，因為保留 buildNumber 的可追蹤性；若未來嫌吵可改為 rebase-squash 工作流程（Non-Goal）。
- **Trade-off**：staged rollout 預設 10% 可能對極少使用者的 app 沒意義（10% 可能只有個位數使用者）。但保留 workflow 輸入可覆寫成 `1.0`，彈性留給操作者。

## Migration Plan

此 change 為「全新 Android CD」，不存在舊流程遷移，但有幾個一次性前置操作（寫進 `apps/mobile/docs/android-release.md`，並以 tasks 管理）：

1. 開發者在本機用 `keytool` 產 upload keystore（一次性），base64 encode 後存入 `ANDROID_KEYSTORE_BASE64` secret。
2. 在 Google Play Console：建立 app listing（若尚未存在）、Internal + Closed testing track、邀請測試者。
3. 在 Google Cloud Console 建立 service account、下載 JSON、到 Play Console 授權 Release manager 權限、JSON 存進 `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` secret。
4. 首次 CD 執行前，手動以 Play Console 上傳一個「種子」AAB（Play Store 要求第一個 release 透過 UI 上傳以初始化 app）；此動作不由 fastlane 自動化（Non-Goal）。
5. 開發者以一次本機 `bundle exec fastlane upload_beta` dry run（實際 CI 上跑）驗證管線可走通，再正式把 tag 推上去。

Rollback：此 change 不影響既有 `Mobile CI`；若 Android CD 管線壞掉，只需 revert `.github/workflows/mobile-cd.yml` 的擴充部分即可回復「只 tag+release，不上 Play Store」的舊行為。keystore 與 Play Console 設定保留不變，不需 rollback。

## Open Questions

- 首次觸發 CD 的 app listing 是否已經在 Play Console 準備好？若尚未，tasks 會包含一條「人工：建立 Play Console app listing + Internal/Closed track」check。
- 是否要在 `android-release` job 加上 SHA-256 fingerprint echo（方便比對 Firebase Crashlytics 的 SHA 設定）？MVP 先不做，若 Firebase Crashlytics 報符號化失敗再補。
- 未來加入 iOS CD 時，`mobile-cd.yml` 的 job 結構是否要重構成 matrix？留待 iOS change 決定。
