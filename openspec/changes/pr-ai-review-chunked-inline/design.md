## Context

`.github/workflows/pr-ai-review.yml` 目前在一個 step 內完成所有事情：

- 以本地 `git diff` 產生 patch，超過 `MAX_DIFF_LINES`（6000 行）時先排除純刪除的檔案，仍超過就直接截斷
- 用 `.github/scripts/lkai-helpers.sh` 的 `ask_lkai` 呼叫一次 `lkai`
- 用 `gh pr comment` 發一則一般留言，lkai 失敗或回答不完整時 workflow 判定為失敗

job 在 `xcode-27` macOS runner 上執行（`lkai` 只能在 macOS 執行）。這台 runner 的 bash 是 3.2，另外有 Node 24、jq 與 gh。模型設定在 `.github/lkai.json`：PR 審查使用其中的 `review` 設定（目前為 `anthropic` / `claude-opus-5-5`，effort 為 API 預設值，因為 lkai 尚不支援設定 effort），其他服務使用 `default`（`claude-sonnet-5-5`）。`setup-lkai` 以 `profile` 輸入選擇設定。

限制與背景：

- **截斷吃掉了程式碼**：patch 依檔名排序，PR #31 的前 6000 行全是 `.agents/`、`.archify/` 等自動產生的檔案，`apps/web` 完全沒被審到。
- **對話必須 resolve**：main 的 branch protection 開啟「合併前所有對話都要 resolve」（`required_conversation_resolution`），沒有 required status check。inline comment 會形成要 resolve 的討論串。
- **bot 帳號名稱**：GitHub Actions 發的留言在 GraphQL 中，作者是 `github-actions`（類型 Bot）。

## Goals / Non-Goals

**Goals:**

- 自動產生的檔案不再佔用送審額度
- 排除後仍過大的 PR 依相關性分段審查，所有段落彙整成一次審查結果
- 意見以 inline comment 標在程式碼行上，新一輪審查發布後自動收掉上一輪 AI 的討論串
- 失敗時清楚標註缺漏，不讓不完整的審查看起來像成功

**Non-Goals:**

- 不改動 Release Notes 流程（`.github/actions/generate-release-notes`）
- 不讓意見的嚴重程度影響 workflow 結果：🔴 意見照常發布，check 仍然綠燈，只有審查流程本身失敗才紅燈（維持現狀）
- 不使用 `APPROVE` 或 `REQUEST_CHANGES` 的 review 事件：bot 的核准不應代表審查通過，要求修改則會在 dismiss 前一直擋住合併
- 不支援 fork 發出的 PR：拿不到 secret，維持現狀
- 不在單一檔案內依 hunk 再切分：單一檔案超過每段上限時截斷並標註
- 不隱藏或刪除上一輪的 review 本文，只 resolve 討論串
- 不快取 `lkai` 的建置結果

## Decisions

### 以 .gitattributes 的 linguist-generated 標記自動產生的檔案

在 repo 根目錄新增 `.gitattributes`，把以下路徑標記為 `linguist-generated`：

- `.agents/skills/**`、`.claude/skills/**`：Spectra CLI 產生的 skill
- `.archify/**`：archify 的輸出
- `**/pnpm-lock.yaml`、`**/package-lock.json`、`**/uv.lock`：lockfile

審查 script 以 `git check-attr linguist-generated` 判斷檔案是否為自動產生，標記為 `set` 或 `true` 的檔案不送內容，只在檔案總覽中列為「已略過（自動產生）」。

純刪除的檔案一律不送內容，只在總覽列為「已刪除」。這和現行做法不同：現行做法只在超過上限時才排除。被刪掉的程式碼不會有 bug，總覽會告訴模型哪些檔案被移除。二進位檔案同樣只列在總覽。

替代方案：在 workflow 或另一個 JSON 設定檔寫死排除清單。不採用，因為 GitHub 本身就依 `linguist-generated` 在 PR 頁面摺疊檔案；用同一個標記，兩邊只需維護一份清單。

### 依元件區域分組、原始碼與測試相鄰的分段裝箱規則

每段的上限 `MAX_CHUNK_LINES` 預設 6000，以「標註行號後的 patch 行數」計算，包含每個檔案的標題行。段數上限 `MAX_CHUNKS` 預設 6。這兩個值都是估計值，沒有量測過，預期只有超大 PR 會用到第 2 段以上。可以從實際 PR 的 run log 印出的「各段行數」驗證，必要時再調整。

送審的檔案依以下規則切段：

1. **元件區域**：`apps/` 底下取前兩段路徑（例如 `apps/web`），其他檔案取第一段（例如 `.github`、`openspec`），repo 根目錄的檔案歸在同一區。區域依名稱排序。
2. **功能鍵**：去掉 `__tests__`、`tests`、`test` 目錄，以及副檔名前的 `.test`、`.spec`。例如 `apps/web/src/__tests__/lib/x.test.ts` 的功能鍵是 `apps/web/src/lib/x.ts`。功能鍵相同的檔案組成一個功能群組，群組內依原始路徑排序，區域內的群組依功能鍵排序。
3. **裝箱**：依序處理每個區域。
   - 整個區域放得進目前這段的剩餘空間，就加入目前這段。
   - 放不進、但不超過上限，就開新的一段。
   - 超過上限，就改以功能群組為單位依序裝入：放得進目前這段就加入，否則開新的一段。
   - 單一檔案超過上限時自成一段，截斷到上限並標記為「已截斷」。
4. **段數上限**：排到第 `MAX_CHUNKS` 段之後的檔案不送審，在結果中列為「未審查（超過段數上限）」。

總行數不超過上限時，只會有一段，送審次數和現在一樣是一次。

替代方案：

- 請模型先決定分組。不採用：每次結果不一定相同、多一次請求，而且模型仍需要看到完整的檔案清單。
- 只依行數與路徑順序切段。不採用：會把測試和原始碼分開，也會把不同元件混在同一段。

### 送審 patch 標上新檔案的行號

每個檔案的標題行寫出路徑與狀態（新增／修改／更名）。每個 hunk 內：

- 前後文與新增的行，前面加上該行在新檔案的行號
- 刪除的行，行號欄留空

格式為 `<行號靠右對齊>|<原 diff 標記><內容>`，例如 `  11|+const b = 3`、`    |-const b = 2`。

可以留 inline comment 的行（commentable lines），就是有行號的行。每個檔案以區間清單記錄這些行，供之後驗證意見的行號。

替代方案：只附原始的 hunk 標頭（`@@ -10,3 +10,4 @@`），讓模型自己數行。不採用：模型數錯行號時，inline comment 會被 GitHub 拒絕，或標到錯的行。

### 模型輸出 JSON，由 script 決定性地彙整意見

每段的提示詞要求模型在回答的最後輸出恰好一個 ```json 區塊，格式見 Implementation Contract。script 取回答中最後一個 ```json 區塊解析並驗證；解析失敗或欄位不合格式時，這一段視為失敗。

所有段落的意見由 script 合併，依嚴重程度（🔴、🟡、🟢）、路徑、行號排序，不交給模型改寫。整體結論也由 script 計算：任一段的結論是 blocker，或有任何 🔴 意見，就是「阻擋合併」；否則有任何建議時是「可接受但建議調整」，都沒有時是「無疑慮」。

段數大於 1 時，再送一次彙整請求。這次只附各段的總評與意見清單（標題、嚴重程度、位置），不附程式碼，請模型寫出整份 PR 的總評與最終結論，同樣以 JSON 回傳。只有一段時，直接使用那一段的總評，不送彙整請求。

`lkai` 沒有結構化輸出的選項，所以靠提示詞約束格式，並以驗證兜底。

替代方案：由彙整請求重寫所有意見。不採用：可能遺失或改錯行號，也會增加輸出量。

### 以單一 PR review 發布 inline comment

用 REST API `POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews` 一次建立 review：

- `event`：`COMMENT`
- `commit_id`：PR 的 head SHA
- `body`：總評
- `comments`：inline comment 清單，每則為 `{path, line, side: "RIGHT", body}`

一次 API 呼叫會一起成功或一起失敗，使用者也只會收到一次通知。

意見的路徑必須是送審過的檔案，行號必須落在該檔案的可留言行內，才會成為 inline comment。沒有行號、行號不在 diff 內、路徑沒有送審的意見，列在本文的「無法標在程式碼行上的意見」區塊並附上 `path:line`。

識別用的隱藏標記：

- review 本文開頭放 `<!-- lkai-review -->`
- 每則 inline comment 結尾放 `<!-- lkai-review-comment -->`

GitHub 拒絕整個 review（回應不是 2xx）時，改送一個不含 inline comment 的 review，全部意見放進本文，並註明 inline comment 發布失敗。

### 發布成功後才收掉上一輪的討論串

收掉舊討論串分成三步，順序固定：

1. **發布前先收集**：以 GraphQL 分頁查詢這個 PR 的 `reviewThreads`，找出符合三個條件的討論串 ID：還沒 resolve、第一則留言的作者是 `github-actions`、第一則留言含有 `<!-- lkai-review-comment -->`。
2. **發布新一輪 review**（inline 版本或只有本文的版本）。
3. **發布成功後才 resolve**：對收集到的每個討論串呼叫 `resolveReviewThread`。

這個順序保證新 review 發布失敗時，上一輪的意見仍然留著。由人開啟的討論串一律不動。

已經有人回覆的 AI 討論串，仍會被收掉：新一輪審查會重新提出仍然存在的問題。resolve 失敗只發出警告，因為新的 review 已經發布了。

### 多段並行送審並延後印出 lkai 訊息

在 `lkai-helpers.sh` 新增 `run_lkai`：只執行 `lkai`，stderr 寫到檔案，不印出。`ask_lkai` 改為呼叫 `run_lkai` 後再印出 stderr，對外行為不變。

workflow 以 bash 背景工作同時送出所有段落，`wait` 全部結束後，依段落順序逐段用 `print_untrusted_text` 印出 lkai 的訊息。

為什麼不在各段一結束就印：並行印出時，不同段落的 `::stop-commands::` 區塊會交錯，前一段的結束標記可能提早恢復 workflow command，後一段的文字就會被執行。

為什麼要並行：依序執行時，最壞要等 `MAX_CHUNKS` 次請求。這次遷移後的實測顯示，單次審查的 job 約 2.5 分鐘，其中含約 70 秒的 `lkai` 建置；6 段依序執行估計要 6 到 9 分鐘。

### 用 Node script 處理 diff 解析、分段與彙整

diff 解析、行號標註、裝箱與 JSON 驗證，都放在 `.github/scripts/ai-review/` 的 Node ESM script（`.mjs`）：

- 不依賴任何 npm 套件，不需要安裝步驟
- 以 `node:child_process` 呼叫 git
- 以 `node:test` 撰寫單元測試

`xcode-27` 的映像內建 Node 24，ubuntu runner 也內建 Node。bash 只負責呼叫 lkai、gh 與流程控制。

替代方案：全部用 bash 3.2 與 jq 處理。不採用：在 bash 3.2 解析 unified diff 與裝箱容易出錯，也難以寫單元測試。

### 審查結果的判定規則

原則是「審查內容有缺漏才算失敗，只是呈現方式降級只發出警告」：

- **workflow 失敗**：任一段送審失敗、回答不完整、JSON 無法解讀，或 review 完全發布不了。即使失敗，仍要發布已經取得的部分，並列出失敗的段落。
- **只發出警告**：彙整請求失敗（改為依段落順序列出各段總評）、inline 版本被拒而改發只有本文的版本、resolve 舊討論串失敗。
- **不送審**：沒有任何可審查的檔案（全部是自動產生、已刪除或二進位）時，不送出模型請求，發布一則說明沒有可審查內容的 review，workflow 成功。

workflow 另外加上兩項設定：

- `concurrency`：`group: pr-ai-review-<PR 編號>`、`cancel-in-progress: true`，同一個 PR 有新的 push 時，取消還在執行的舊審查
- `timeout-minutes: 30`

## Implementation Contract

**行為（使用者看到的結果）：**

- PR 開啟或更新後，PR 上出現一則由 `github-actions` 發布的 review：本文是總評，問題標在程式碼行上。
- 自動產生的檔案出現在總覽的「已略過」清單，不會被審查。
- 再 push 一次後，上一輪 AI 的討論串變成 resolved，並出現新的一輪 review。

**介面與資料格式：**

- `node .github/scripts/ai-review/ai-review.mjs plan --base <sha> --head <sha> --out <dir> [--max-chunk-lines <n>] [--max-chunks <n>]`
  - 在 `<dir>` 寫出 `plan.json`，以及各段的提示詞 `chunk-<n>.md`（含審查指示、完整檔案總覽、該段標註後的 patch）
  - `plan.json` 的格式：`{ "files": [{ "path", "status": "added|modified|renamed|deleted", "category": "reviewed|generated|deleted|binary|unreviewed", "lines", "chunk": <n|null>, "truncated": <bool> }], "chunks": [{ "index", "files": [<path>], "lines" }], "commentable": { "<path>": [[<起始行>, <結束行>], ...] } }`
- 每段模型輸出的 JSON：`{ "summary": <字串>, "verdict": "blocker|changes_suggested|no_concerns", "findings": [{ "path": <字串>, "line": <整數|null>, "severity": "blocker|warning|nit", "title": <字串>, "body": <字串> }] }`
- `node .github/scripts/ai-review/ai-review.mjs synthesis-prompt --plan <plan.json> --results <dir> --out <檔案>`：產出彙整用的提示詞；彙整的模型輸出為 `{ "summary": <字串>, "conclusion": <字串> }`
- `node .github/scripts/ai-review/ai-review.mjs build-review --plan <plan.json> --results <dir> [--synthesis <檔案>] --head-sha <sha> --out <dir>`
  - 寫出 `review.json`（含 inline comment 的 REST request body）、`review-body-only.json`（不含 inline comment 的版本）、`outcome.json`
  - `outcome.json` 的格式：`{ "failedChunks": [<n>], "warnings": [<字串>], "inlineCount", "bodyOnlyCount" }`
  - `--results <dir>` 內每段有 `chunk-<n>.out`（lkai 的 stdout）與 `chunk-<n>.status`（lkai 的退出碼）
- `lkai-helpers.sh` 新增 `run_lkai <提示詞檔案> <輸出檔案> [lkai 選項...]`：回傳 lkai 的退出碼，stderr 寫到 `<輸出檔案>.err`，不印出任何內容
- `.gitattributes` 中以 `linguist-generated` 標記的路徑，即為排除清單

**失敗模式：** 見「審查結果的判定規則」。另外，lkai 的 stderr 與無法解讀的模型回答一律經 `print_untrusted_text` 印出；無法解讀的回答在 review 本文中放進摺疊區塊（`<details>`）。

**驗收條件：**

- `node --test .github/scripts/ai-review/` 全部通過，涵蓋：
  - spec 中裝箱、行號標註、意見分流的 Example
  - JSON 擷取與驗證失敗的情況
- 新增的 `github-scripts-test.yml` 在 PR 上執行這些測試並通過
- `actionlint` 對修改過的 workflow 沒有新增問題
- 在本機 `/bin/bash` 3.2 以假的 `lkai`／`gh` 執行 workflow 的審查 script，可以產出 inline 版與只有本文版的 review payload，失敗段落的處理符合判定規則
- 這個 change 自己的 PR 上，出現含 inline comment 的 review；再 push 一次後，上一輪的 AI 討論串變成 resolved

**範圍：**

- **包含**：`.gitattributes`、`.github/scripts/ai-review/`、`.github/scripts/lkai-helpers.sh` 的 `run_lkai`、`.github/workflows/pr-ai-review.yml`、新的 `.github/workflows/github-scripts-test.yml`、`README.md` 的 CI/CD 說明
- **不包含**：Release Notes 流程、`.github/lkai.json` 的模型設定、元件程式碼與版號、分支保護設定

## Risks / Trade-offs

- **GITHUB_TOKEN 可能沒有 `resolveReviewThread` 的權限**
  - 緩解：resolve 失敗只發出警告；在這個 change 的 PR 上實測。若確實不可行，再改由人手動 resolve，並更新 spec。
- **模型沒有照格式輸出 JSON**
  - 緩解：提示詞明確要求，取最後一個 ```json 區塊解析；解析失敗時該段視為失敗，原始回答放進摺疊區塊，不會悄悄遺失。
- **模型給的行號不在 diff 內**
  - 緩解：發布前以可留言行驗證，不合格的意見改列在本文，不會讓整個 review 被拒。
- **段數變多讓費用與時間增加**
  - 緩解：只有超過每段上限才會分段；`MAX_CHUNKS` 限制最多請求數（6 段加 1 次彙整）。
- **同時送出多段可能撞到 API 的速率限制**
  - 緩解：失敗的段落會被標註，workflow 判定為失敗，可以重跑；段數上限也限制了同時的請求數。
- **有人回覆過的 AI 討論串也會被收掉**
  - 取捨：避免舊意見累積而卡住合併；新一輪審查會重新提出仍然存在的問題。
- **`linguist-generated` 讓 GitHub PR 頁面預設摺疊這些檔案**
  - 取捨：這些檔案本來就不需要人逐行審查，摺疊也是預期中的效果。
