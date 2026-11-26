## Context

`.github/workflows/pr-ai-review.yml` 目前在一個 step 內完成所有事情：

- 以本地 `git diff` 產生 patch，超過 `MAX_DIFF_LINES`（6000 行）時先排除純刪除的檔案，仍超過就直接截斷
- 用 `.github/scripts/lkai-helpers.sh` 的 `ask_lkai` 呼叫一次 `lkai`
- 用 `gh pr comment` 發一則一般留言，lkai 失敗或回答不完整時 workflow 判定為失敗

job 在 `xcode-27` macOS runner 上執行（`lkai` 只能在 macOS 執行）。這台 runner 的 bash 是 3.2，另外有 Node 24、jq、gh 與 git 2.56。模型設定在 `.github/lkai.json`：PR 審查使用其中的 `review` 設定（目前為 `anthropic` / `claude-opus-5-5`，effort 為 API 預設值，因為 lkai 尚不支援設定 effort），其他服務使用 `default`（`claude-sonnet-5-5`）。`setup-lkai` 以 `profile` 輸入選擇設定。

限制與背景：

- **截斷吃掉了程式碼**：patch 依檔名排序，PR #31 的前 6000 行全是 `.agents/`、`.archify/` 等自動產生的檔案，`apps/web` 完全沒被審到。
- **對話必須 resolve**：main 的 branch protection 開啟「合併前所有對話都要 resolve」（`required_conversation_resolution`），沒有 required status check。inline comment 會形成要 resolve 的討論串。
- **bot 帳號名稱**：GitHub Actions 發的留言在 GraphQL 中，作者是 `github-actions`（類型 Bot）。
- **實際的 PR 大小**：套用本 change 的排除規則（自動產生檔與純刪除檔不送審）後，最近 150 個 commit 中最大的是 12,690 行，PR #31 是 4,094 行，PR #28 是 7,461 行（皆為實測）。

## Goals / Non-Goals

**Goals:**

- 自動產生的檔案不再佔用送審額度，而且 PR 無法藉此讓自己的程式碼跳過審查
- 所有可審查的檔案都會被審查；過大的 PR 依相關性分段，所有段落彙整成一次審查結果
- 意見以 inline comment 標在程式碼行上，新一輪審查發布後自動收掉上一輪 AI 的討論串
- 失敗時清楚標註缺漏，不讓不完整的審查看起來像成功

**Non-Goals:**

- 不改動 Release Notes 流程（`.github/actions/generate-release-notes`）
- 不讓意見的嚴重程度影響 workflow 結果：🔴 意見照常發布，check 仍然綠燈，只有審查流程本身失敗才紅燈（維持現狀）
- 不使用 `APPROVE` 或 `REQUEST_CHANGES` 的 review 事件：bot 的核准不應代表審查通過，要求修改則會在 dismiss 前一直擋住合併
- 不支援 fork 發出的 PR：拿不到 secret，維持現狀
- 不在單一檔案內依 hunk 再切分：單一檔案超過每段上限時截斷並標註
- 不限制段數、不設費用上限：費用隨 PR 大小增加，以警告提醒拆小 PR
- 不保證 JavaScript／TypeScript 與 Python 以外的測試命名慣例能和原始碼配成同一群組
- 不隱藏或刪除上一輪的 review 本文，只 resolve 討論串
- 不快取 `lkai` 的建置結果

## Decisions

### 以 .gitattributes 的 linguist-generated 標記自動產生的檔案

在 repo 根目錄新增 `.gitattributes`，把以下路徑標記為 `linguist-generated`：

- `.agents/skills/**`、`.claude/skills/**`：Spectra CLI 產生的 skill
- `.archify/**`：archify 的輸出
- `**/pnpm-lock.yaml`、`**/package-lock.json`、`**/uv.lock`：lockfile

審查 script 以 `git check-attr --source=<base sha> linguist-generated` 判斷，**依據是 base commit 的 `.gitattributes`**，不是 PR 分支的版本。否則 PR 只要把 `apps/web/** linguist-generated` 寫進 `.gitattributes`，自己的程式碼就會被跳過。`--source` 需要 git 2.40 以上，`xcode-27` 的 git 是 2.56。PR 有修改 `.gitattributes` 時，這個檔案本身照常送審，review 本文另外註明「本次以 base 版本的規則判斷自動產生檔」。

base commit 必須存在於本機：workflow 在執行 `plan` 前先 `git fetch` base SHA，`plan` 再以 `git cat-file -e <base>^{commit}` 確認。取不到時 `plan` 以非 0 退出碼結束，整個 run 判定為失敗，不送審、不發布、不 resolve。這樣不會在拿不到規則的情況下，悄悄把所有檔案當成可審查或全部略過。

標記為 `set` 或 `true` 的檔案不送內容，只在檔案總覽中列為「已略過（自動產生）」。

純刪除的檔案也不送內容，只在總覽列為「已刪除」。這和現行做法不同：現行做法只在超過上限時才排除。理由是被刪除的內容已不在新版程式碼中，逐行審查的價值較低；總覽仍會列出被刪除的檔案，讓模型能指出可疑的刪除，例如整個測試檔或安全檢查被移除。修改中的檔案，其刪除的行照樣會出現在 hunk 內。二進位檔案同樣只列在總覽。

替代方案：在 workflow 或另一個 JSON 設定檔寫死排除清單。不採用，因為 GitHub 本身就依 `linguist-generated` 在 PR 頁面摺疊檔案；用同一個標記，兩邊只需維護一份清單。

### 依元件區域分組、原始碼與測試相鄰的分段裝箱規則

每段的上限 `MAX_CHUNK_LINES` 預設 6000，以「標註行號後的 patch 行數」計算，包含每個檔案的標題行。這個值是估計值，沒有量測過；依 Context 的實測，這個 repo 的 PR 排除後最多約 3 段。實作後可從 run log 印出的「各段行數」確認是否需要調整。

送審的檔案依以下規則切段：

1. **元件區域**：`apps/` 底下取前兩段路徑（例如 `apps/web`），其他檔案取第一段（例如 `.github`、`openspec`）。repo 根目錄的檔案歸在同一區，區域名稱是空字串。區域依名稱排序，所以根目錄的區域永遠排第一。
2. **功能鍵**：
   - 去掉路徑中名為 `src`、`__tests__`、`tests`、`test` 的目錄
   - 檔名去掉副檔名，再去掉 `.test`、`.spec` 後綴，以及 `test_` 前綴、`_test` 後綴

   例如 `apps/web/src/__tests__/lib/x.test.tsx` 與 `apps/web/src/lib/x.ts` 的功能鍵都是 `apps/web/lib/x`；`apps/backend/tests/test_app.py` 與 `apps/backend/src/app.py` 的功能鍵都是 `apps/backend/app`。去掉副檔名，讓副檔名不同的原始碼與測試（`.ts` 與 `.test.tsx`），以及同名的樣式檔也能配在一起。功能鍵相同的檔案組成一個功能群組，群組內依原始路徑排序，區域內的群組依功能鍵排序。所有排序都以 Unicode code point 順序比較字串，不受語系影響。
3. **裝箱**：依序處理每個區域。
   - 整個區域放得進目前這段的剩餘空間，就加入目前這段。
   - 放不進、但不超過上限，就開新的一段。
   - 超過上限，就改以功能群組為單位依序裝入：放得進目前這段就加入，否則開新的一段。
   - 功能群組本身超過上限時，再改以檔案為單位，依群組內的順序裝入：放得進目前這段就加入，否則開新的一段。
   - 單一檔案超過上限時自成一段，截斷到上限並標記為「已截斷」。

總行數不超過上限時，只會有一段，送審次數和現在一樣是一次。

沒有 hunk 的檔案（只有更名或只改了檔案權限）仍歸為可審查，只送出標題行（1 行），沒有可留言行；模型可以從標題得知檔案被更名。

替代方案：

- 請模型先決定分組。不採用：每次結果不一定相同、多一次請求，而且模型仍需要看到完整的檔案清單。
- 只依行數與路徑順序切段。不採用：會把測試和原始碼分開，也會把不同元件混在同一段。

### 所有段落都送審，不設段數上限

所有段落都會送審，不因段數過多而跳過任何檔案。這取代本 change 原本設計中、上一個決策內的段數上限（`MAX_CHUNKS`）：設了上限，超大的 PR 仍會有檔案沒審到，等於把原本「截斷後沒審到」的問題換成另一種形式。

費用與時間改用兩個方式控制：

- **限制同時送出的請求數**：見「多段並行送審並延後印出 lkai 訊息」。
- **超量警告**：段數超過 `WARN_CHUNKS`（預設 6，約 36,000 行）時照樣全部審查，但在 review 本文開頭與 workflow 發出警告，建議拆小 PR。依 Context 的實測，這個 repo 至今沒有 PR 會觸發這個警告。

### 送審 patch 標上新檔案的行號

以 `git -c core.quotePath=false diff --no-color --no-ext-diff -M` 產生 diff，避免中文檔名被轉成八進位跳脫。含空白、引號或控制字元的路徑仍可能以 C 語言式的引號輸出，解析時要還原。

每個檔案的標題行寫出路徑與狀態（新增／修改／更名）。每個 hunk 內：

- 前後文與新增的行，前面加上該行在新檔案的行號
- 刪除的行，行號欄留空
- `\ No newline at end of file` 這一行原樣保留，行號欄留空，不計入新檔案的行號，也不是可留言行

格式為 `<行號靠右對齊>|<原 diff 標記><內容>`，例如 `  11|+const b = 3`、`    |-const b = 2`。

可以留 inline comment 的行（commentable lines），就是有行號的行。每個檔案以區間清單記錄這些行，供之後驗證意見的行號。被截斷的檔案，可留言行只包含實際送出的部分。

替代方案：只附原始的 hunk 標頭（`@@ -10,3 +10,4 @@`），讓模型自己數行。不採用：模型數錯行號時，inline comment 會被 GitHub 拒絕，或標到錯的行。

### 模型輸出 JSON，由 script 決定性地彙整意見

每段的提示詞要求模型在回答的最後輸出恰好一個 ```json 區塊，格式見 Implementation Contract。script 取回答中最後一個 ```json 區塊解析並驗證；解析失敗或欄位不合格式時，這一段視為失敗。

所有段落的意見由 script 合併，依嚴重程度（🔴、🟡、🟢）、路徑、行號排序，不交給模型改寫。整體結論也由 script 依序判斷：

1. 任一段的結論是 `blocker`，或有任何 🔴 意見：`blocker`（阻擋合併）
2. 否則，任一段失敗：`incomplete`（審查不完整），避免只審到一部分卻顯示「無疑慮」
3. 否則，有任何意見，或任一段的結論是 `changes_suggested`：`changes_suggested`（可接受但建議調整）
4. 其他情況：`no_concerns`（無疑慮）

有兩段以上取得有效結果時，再送一次彙整請求：

- 只附各段的總評、結論與意見清單（標題、嚴重程度、位置），不附程式碼
- 同時附上 script 算出的整體結論，要求模型寫出的總評與最終結論必須與它一致
- 模型同樣以 JSON 回傳；review 本文以 script 的結論為準

只有一段取得有效結果時，直接使用那一段的總評，不送彙整請求。所有段落都失敗時，不送彙整請求，總評寫明「沒有任何段落取得有效的審查結果」並列出各段的失敗原因，整體結論為 `incomplete`。沒有可審查內容時不送任何請求，整體結論為 `no_concerns`。

`lkai` 沒有結構化輸出的選項，所以靠提示詞約束格式，並以驗證兜底。

替代方案：由彙整請求重寫所有意見。不採用：可能遺失或改錯行號，也會增加輸出量。

### 清理模型文字後才發布

模型的文字可能受到 diff 內容的間接影響（prompt injection），發布前一律經過清理：

- **`@mention`**：`@` 前面不是英文字母或數字時，在 `@` 與接著的帳號或團隊名稱之間插入零寬空白（U+200B），避免對大量帳號發出通知；`user@example.com` 這類 email 不受影響
- **HTML 註解**：把 `<!--` 與 `-->` 改為不會被當成註解的寫法，避免文字混入識別用的標記或藏起內容
- **原始回答**：無法解讀的回答放在 `<details>` 內的 code fence。fence 的反引號數比內文中最長的連續反引號多一個，內文的 `</details>` 也會被跳脫，摺疊區塊不會被提早關閉

GitHub 對 review 本文與每則留言的上限都是 65,536 字元。本文超過 60,000 字元時，依序截掉兩個部分，並在結尾註明已截斷、完整內容見 job summary：

1. 原始回答的摺疊區塊
2. 「無法標在程式碼行上的意見」清單的尾端

完整本文另外寫進 workflow 的 job summary（`$GITHUB_STEP_SUMMARY`）；job summary 每個 step 上限 1 MiB，超過 1,000,000 bytes 時同樣截斷並註明。單則 inline comment 超過 60,000 字元時同樣截斷。

### 以單一 PR review 發布 inline comment

用 REST API `POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews` 一次建立 review：

- `event`：`COMMENT`
- `commit_id`：PR 的 head commit，也就是 `github.event.pull_request.head.sha`。workflow checkout 這個 commit，diff 一律以 `<base>...<head>` 產生，不使用 GitHub 為 PR 建立的 merge commit（`refs/pull/<n>/merge`）：merge commit 不屬於 PR 的 commit，以它為 `commit_id` 會被拒絕，行號也會和 PR 頁面的 diff 對不上。`plan` 把 head SHA 記錄在 `plan.json` 的 `headSha`，`build-review` 收到的 `--head-sha` 與它不同時直接失敗、不產出 review
- `body`：總評
- `comments`：inline comment 清單，每則為 `{path, line, side: "RIGHT", body}`

一次 API 呼叫會一起成功或一起失敗，使用者也只會收到一次通知。

意見的路徑必須是送審過的檔案，行號必須落在該檔案的可留言行內，才會成為 inline comment。沒有行號、行號不在 diff 內、路徑沒有送審的意見，列在本文的「無法標在程式碼行上的意見」區塊並附上 `path:line`。

識別用的隱藏標記：

- review 本文開頭放 `<!-- lkai-review -->`，下一行放 `<!-- lkai-review-run: <run id> -->`（`<run id>` 是 `GITHUB_RUN_ID` 加上 `GITHUB_RUN_ATTEMPT`）
- 每則 inline comment 結尾放 `<!-- lkai-review-comment -->`

GitHub 拒絕整個 review（回應不是 2xx）時，改送一個不含 inline comment 的 review，全部意見放進本文，並註明 inline comment 發布失敗。改送之前，先列出這個 PR 的 review，確認沒有帶著這次 run 標記的 review：第一次請求可能其實成功了、只是回應沒收到，這時不再改送，避免重複發布。

### 發布成功後才收掉上一輪的討論串

收掉舊討論串分成三步，順序固定：

1. **發布前先收集**：以 GraphQL 分頁查詢這個 PR 的 `reviewThreads`，找出同時符合四個條件的討論串 ID：
   - 還沒 resolve
   - 第一則留言的作者是 `github-actions`
   - 第一則留言含有 `<!-- lkai-review-comment -->`
   - 所在的檔案不在 `outcome.json` 的 `keepThreadPaths` 內。`keepThreadPaths` 是這次 diff 內、但這一輪沒有完整審查的檔案：屬於失敗的段落、被截斷、自動產生或二進位。因此可以收掉的，是這一輪完整審查過的檔案，以及已經沒有變更可審的檔案（已不在這次 diff 內，例如改動被還原；或在這次 diff 中被刪除）
2. **發布新一輪 review**（inline 版本或只有本文的版本）。
3. **發布成功後才 resolve**：對收集到的每個討論串呼叫 `resolveReviewThread`。

這個順序保證三件事：

- 新 review 發布失敗時，上一輪的意見仍然留著。
- 這一輪送審失敗或被截斷的檔案，其上的舊意見不會在沒有重新審查的情況下被收掉。
- 已經沒有變更可審的檔案，其上的舊意見會被收掉，不會因為意見失去對象而永遠卡住合併。
- 由人開啟的討論串一律不動。

已經有人回覆的 AI 討論串，仍會被收掉：新一輪審查會重新提出仍然存在的問題。resolve 失敗只發出警告，因為新的 review 已經發布了。

一直被截斷的檔案（單一檔案超過 `MAX_CHUNK_LINES`），其上的 AI 討論串不會被自動收掉，需要由人 resolve；README 會說明這一點。

concurrency 可能在「發布之後、resolve 之前」取消舊的執行，留下沒收掉的討論串。下一輪執行會收集所有仍未 resolve 的 AI 討論串，包含更早幾輪的，所以會自動補上。

### 多段並行送審並延後印出 lkai 訊息

在 `lkai-helpers.sh` 新增 `run_lkai`：只執行 `lkai`，stderr 寫到檔案，不印出。`ask_lkai` 改為呼叫 `run_lkai` 後再印出 stderr，對外行為不變。

workflow 以 bash 背景工作分批送出段落，每批最多 `MAX_PARALLEL_CHUNKS` 段（預設 3）。這個值是估計值：目前沒有 API 速率限制的實測資料，實作後若 run log 出現速率限制的錯誤，再調低。bash 3.2 沒有 `wait -n`，所以以整批為單位：

1. 送出一批
2. `wait` 這一批全部結束
3. 依段落順序逐段以 `print_untrusted_text` 印出 lkai 的訊息
4. 再送下一批

為什麼不在各段一結束就印：並行印出時，不同段落的 `::stop-commands::` 區塊會交錯，前一段的結束標記可能提早恢復 workflow command，後一段的文字就會被執行。印出時沒有任何背景工作在跑，就不會交錯。

為什麼要並行：依序執行時，等待時間和段數成正比。PR #36 的審查 job 共 3 分 15 秒（實測），其中約 70 秒是 `lkai` 的建置；以每段 2 到 4 分鐘估計，`timeout-minutes: 60` 大約容納 40 段以上（估計值，約 24 萬行）。

### 用 Node script 處理 diff 解析、分段與彙整

diff 解析、行號標註、裝箱、文字清理與 JSON 驗證，都放在 `.github/scripts/ai-review/` 的 Node ESM script（`.mjs`）：

- 不依賴任何 npm 套件，不需要安裝步驟
- 以 `node:child_process` 呼叫 git
- 以 `node:test` 撰寫單元測試

`xcode-27` 的映像內建 Node 24，ubuntu runner 也內建 Node。bash 只負責呼叫 lkai、gh 與流程控制。

替代方案：全部用 bash 3.2 與 jq 處理。不採用：在 bash 3.2 解析 unified diff 與裝箱容易出錯，也難以寫單元測試。

### 審查結果的判定規則

原則是「審查內容有缺漏才算失敗，只是呈現方式降級只發出警告」：

- **workflow 失敗**：任一段送審失敗、回答不完整、JSON 無法解讀；review 完全發布不了；base commit 取不到；`build-review` 的 head SHA 與 `plan.json` 不一致。第一種情況仍要發布已經取得的部分，並列出失敗的段落。
- **只發出警告**：彙整請求失敗（改為依段落順序列出各段總評）、inline 版本被拒而改發只有本文的版本、resolve 舊討論串失敗、段數超過 `WARN_CHUNKS`、本文超過長度而被截斷。
- **不送審**：沒有任何可審查的檔案（全部是自動產生、已刪除或二進位）時，不送出模型請求，發布一則說明沒有可審查內容的 review，workflow 成功。

workflow 另外加上三項設定：

- `concurrency`：`group: pr-ai-review-<PR 編號>`、`cancel-in-progress: true`，同一個 PR 有新的 push 時，取消還在執行的舊審查
- `timeout-minutes: 60`
- `permissions`：只有 `contents: read` 與 `pull-requests: write`。不再發一般留言，所以移除 `issues: write`；建立 review 與 resolve 討論串都只需要 `pull-requests: write`

## Implementation Contract

**行為（使用者看到的結果）：**

- PR 開啟或更新後，PR 上出現一則由 `github-actions` 發布的 review：本文是總評，問題標在程式碼行上。
- 自動產生的檔案出現在總覽的「已略過」清單，不會被審查；PR 改了 `.gitattributes` 也無法讓自己的程式碼被略過。
- 再 push 一次後，上一輪 AI 在已重新審查過的檔案上的討論串變成 resolved，並出現新的一輪 review。

**介面與資料格式：**

- `node .github/scripts/ai-review/ai-review.mjs plan --base <sha> --head <sha> --out <dir> [--max-chunk-lines <n>]`
  - 在 `<dir>` 寫出 `plan.json`，以及各段的提示詞 `chunk-<n>.md`（含審查指示、完整檔案總覽、該段標註後的 patch）
  - base commit 不存在於本機時，以非 0 退出碼結束，不寫出任何檔案
  - `plan.json` 的格式：`{ "baseSha", "headSha", "gitattributesChanged": <bool>, "files": [{ "path", "status": "added|modified|renamed|deleted", "category": "reviewed|generated|deleted|binary", "lines", "chunk": <n|null>, "truncated": <bool> }], "chunks": [{ "index", "files": [<path>], "lines" }], "commentable": { "<path>": [[<起始行>, <結束行>], ...] } }`
- 每段模型輸出的 JSON：`{ "summary": <字串>, "verdict": "blocker|changes_suggested|no_concerns", "findings": [{ "path": <字串>, "line": <整數|null>, "severity": "blocker|warning|nit", "title": <字串>, "body": <字串> }] }`
- `node .github/scripts/ai-review/ai-review.mjs synthesis-prompt --plan <plan.json> --results <dir> --out <檔案>`：產出彙整用的提示詞，內含 script 計算的整體結論；彙整的模型輸出為 `{ "summary": <字串>, "conclusion": <字串> }`
- `node .github/scripts/ai-review/ai-review.mjs build-review --plan <plan.json> --results <dir> [--synthesis <檔案>] --head-sha <sha> --run-id <id> --warn-chunks <n> --out <dir>`
  - `--head-sha` 與 `plan.json` 的 `headSha` 不同時，以非 0 退出碼結束，不寫出任何 review
  - 寫出四個檔案：
    - `review.json`：含 inline comment 的 REST request body
    - `review-body-only.json`：不含 inline comment 的版本
    - `summary.md`：完整、未截斷的本文，供寫入 job summary
    - `outcome.json`
  - `outcome.json` 的格式：`{ "verdict": "blocker|incomplete|changes_suggested|no_concerns", "failedChunks": [<n>], "warnings": [<字串>], "inlineCount", "bodyOnlyCount", "keepThreadPaths": [<path>] }`；`keepThreadPaths` 是這次 diff 內、但這一輪沒有完整審查的檔案（失敗的段落、被截斷、自動產生、二進位），這些檔案上的舊討論串不會被收掉
  - `--results <dir>` 內每段有 `chunk-<n>.out`（lkai 的 stdout）與 `chunk-<n>.status`（lkai 的退出碼）
- `lkai-helpers.sh` 新增 `run_lkai <提示詞檔案> <輸出檔案> [lkai 選項...]`：回傳 lkai 的退出碼，stderr 寫到 `<輸出檔案>.err`，不印出任何內容
- workflow 的設定值：`MAX_CHUNK_LINES`（6000）、`MAX_PARALLEL_CHUNKS`（3）、`WARN_CHUNKS`（6）
- `.gitattributes` 中以 `linguist-generated` 標記的路徑，即為排除清單；判斷時以 base commit 的版本為準

**失敗模式：** 見「審查結果的判定規則」。另外，lkai 的 stderr 與無法解讀的模型回答一律經 `print_untrusted_text` 印出；無法解讀的回答在 review 本文中放進摺疊區塊（`<details>`）。

**驗收條件：**

- `node --test .github/scripts/ai-review/` 全部通過，涵蓋：
  - spec 中裝箱、功能鍵、行號標註、意見分流、整體結論、可 resolve 的討論串的 Example
  - JSON 擷取與驗證失敗的情況、文字清理、本文截斷
- 新增的 `github-scripts-test.yml` 在 PR 上執行這些測試並通過
- `actionlint` 對修改過的 workflow 沒有新增問題
- 在本機 `/bin/bash` 3.2 以假的 `lkai`／`gh` 執行 workflow 的審查 script，可以產出 inline 版與只有本文版的 review payload，分批送審、失敗段落與 resolve 篩選都符合判定規則
- 這個 change 自己的 PR 上，出現含 inline comment 的 review；再 push 一次後，上一輪的 AI 討論串變成 resolved

**範圍：**

- **包含**：`.gitattributes`、`.github/scripts/ai-review/`、`.github/scripts/lkai-helpers.sh` 的 `run_lkai`、`.github/workflows/pr-ai-review.yml`（含 permissions、concurrency、timeout）、新的 `.github/workflows/github-scripts-test.yml`、`README.md` 的 CI/CD 說明
- **不包含**：Release Notes 流程、`.github/lkai.json` 的模型設定、LKAIKit 本身、元件程式碼與版號、分支保護設定

## Risks / Trade-offs

- **GITHUB_TOKEN 可能沒有 `resolveReviewThread` 的權限**
  - 緩解：resolve 失敗只發出警告；在這個 change 的 PR 上實測。若確實不可行，再改由人手動 resolve，並更新 spec。
- **模型沒有照格式輸出 JSON**
  - 緩解：提示詞明確要求，取最後一個 ```json 區塊解析；解析失敗時該段視為失敗，原始回答放進摺疊區塊，不會悄悄遺失。
- **模型給的行號不在 diff 內**
  - 緩解：發布前以可留言行驗證，不合格的意見改列在本文，不會讓整個 review 被拒。
- **diff 中的內容誘導模型寫出有害的文字（prompt injection）**
  - 緩解：發布前清理 `@mention`、HTML 註解與摺疊區塊的標記；整體結論由 script 計算，模型無法改寫。
- **超大 PR 的費用與時間**
  - 取捨：為了不漏審，不設段數上限；以分批送審避免一次送出過多請求，以 `WARN_CHUNKS` 的警告提醒拆小 PR。
  - 依 Context 的實測，這個 repo 的 PR 排除後最多約 3 段，極端情況才會明顯增加費用。
- **同時送出多段可能撞到 API 的速率限制**
  - 緩解：`MAX_PARALLEL_CHUNKS` 限制同時的請求數；失敗的段落會被標註、workflow 判定為失敗，可以重跑。
- **有人回覆過的 AI 討論串也會被收掉**
  - 取捨：避免舊意見累積而卡住合併；新一輪審查會重新提出仍然存在的問題。沒有重新審查到的檔案則不收掉。
- **這個機制防的是誤標，不防惡意修改審查流程**
  - workflow 執行的是 PR head 的 script 與 action，同 repo 的 PR 可以直接修改審查 script 讓自己跳過審查；放進自動產生路徑（例如 `.archify/`）或取名為 lockfile 的檔案也會被略過。
  - 取捨：同 repo 的 PR 只有具寫入權限的協作者能開，fork 的 PR 拿不到 secret；要防止惡意修改，需要改從 base commit 取出 script 執行，這也會讓修改審查流程的 PR 無法用自己的新 script 自測，不在這次範圍內。
- **整個 job 逾時時沒有任何部分結果**
  - 緩解：`timeout-minutes: 60` 依估計可容納 40 段以上；逾時時重跑即可，舊討論串不會被收掉。
- **`linguist-generated` 讓 GitHub PR 頁面預設摺疊這些檔案**
  - 取捨：這些檔案本來就不需要人逐行審查，摺疊也是預期中的效果。
