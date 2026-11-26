## 1. 排除自動產生的檔案與分段

- [ ] 1.1 新增 repo 根目錄的 `.gitattributes`（design：以 .gitattributes 的 linguist-generated 標記自動產生的檔案）。以 `linguist-generated` 標記 `.agents/skills/**`、`.claude/skills/**`、`.archify/**`、`**/pnpm-lock.yaml`、`**/package-lock.json`、`**/uv.lock`。verification：執行 `git check-attr linguist-generated -- .agents/skills/spectra-apply/SKILL.md .claude/skills/spectra-apply/SKILL.md .archify/architecture-naver-system-20261024-120117/naver-system.html apps/web/pnpm-lock.yaml apps/web/src/main.tsx`，前四個是 `set`，`apps/web/src/main.tsx` 是 `unspecified`。
- [ ] 1.2 新增 `.github/scripts/ai-review/diff.mjs`（design：用 Node script 處理 diff 解析、分段與彙整；送審 patch 標上新檔案的行號）。把 `git diff` 的 unified diff 解析成檔案清單，每個檔案含路徑、舊路徑、狀態（added／modified／renamed／deleted）、是否為二進位、hunk。並為每個檔案產生標註後的 patch 與可留言行區間，滿足 spec「Patches are annotated with new-file line numbers and findings are structured」中的行號標註規則。verification：`diff.test.mjs` 以 `node --test .github/scripts/ai-review/` 執行並通過，涵蓋 spec 的「one hunk」Example（`10| a`、`  |-b`、`11|+c`、`12| d`，可留言行 10–12）、新增檔案、更名、二進位與多個 hunk。
- [ ] 1.3 [after: 1.2] 新增 `.github/scripts/ai-review/chunk.mjs`（design：依元件區域分組、原始碼與測試相鄰的分段裝箱規則）。實作元件區域、功能鍵、裝箱、單一檔案截斷，滿足 spec「Reviewable files are packed into relevance-grouped chunks」；也實作段數上限，滿足 spec「The number of chunks is capped」。verification：`chunk.test.mjs` 通過，涵蓋三項：spec 中「packing with a budget of 100 lines」與「feature keys」兩個 Example 的確切結果；單一檔案超過上限時自成一段並標記截斷；段數超過上限時多出的檔案歸類為 unreviewed。
- [ ] 1.4 [after: 1.1, 1.3] 新增 `.github/scripts/ai-review/ai-review.mjs` 的 `plan` 子命令，介面依 design 的 Implementation Contract，滿足 spec「Generated, deleted, and binary files are excluded from review content」。
  - 以 `<base>...<head>` 產生 diff，取不到 merge base 時退回兩點 diff，與現行 workflow 相同。
  - 以 `git check-attr linguist-generated`、刪除狀態與二進位判斷檔案分類。
  - 寫出 `plan.json` 與每段的 `chunk-<n>.md`：含審查指示（沿用現行的審查面向與嚴重程度標示，並要求最後輸出一個 ```json 區塊）、所有檔案的總覽（分類與段落編號）、該段標註後的 patch。

  verification：測試以 `git init` 建立暫存 repo，驗證 spec「file classification」Example 的分類結果，並通過 `node --test`；另在本 repo 對 `1589fa1` 到 `ae99a9b` 執行 `plan`，檢查 `plan.json` 與 `chunk-1.md` 的內容。

## 2. 意見彙整與 review 組裝

- [ ] 2.1 [after: 1.2] 新增 `.github/scripts/ai-review/findings.mjs`（design：模型輸出 JSON，由 script 決定性地彙整意見），滿足 spec「Multi-chunk results are consolidated into one summary」中的意見合併與整體結論，以及「The review is published as one pull request review with inline comments」中的意見分流，提供四項功能：
  - 擷取回答中最後一個 ```json 區塊並驗證格式
  - 合併並排序各段意見，計算整體結論
  - 依可留言行把意見分流到 inline comment 或本文

  verification：`findings.test.mjs` 通過，涵蓋 spec 的「overall verdict」與「finding routing」兩個 Example，以及沒有 JSON 區塊、缺欄位、`line` 不是整數或 null 時判定為失敗。
- [ ] 2.2 [after: 1.4, 2.1] 在 `ai-review.mjs` 新增 `synthesis-prompt` 與 `build-review` 子命令，介面依 Implementation Contract。
  - 彙整提示詞只附各段的總評、結論與意見清單，不附程式碼。
  - `build-review` 寫出三個檔案：
    - `review.json`：event `COMMENT`、`commit_id`、以 `<!-- lkai-review -->` 開頭的本文、結尾帶 `<!-- lkai-review-comment -->` 的 inline comment
    - `review-body-only.json`
    - `outcome.json`
  - 本文列出：由 script 計算的整體結論、總評、彙整請求的結論（有彙整結果時）、已略過／已截斷／未審查的檔案、失敗段落；失敗段落的原始回答放在 `<details>` 內。
  - 沒有可審查檔案時，產出說明沒有可審查內容的本文。

  verification：測試以暫存的 results 資料夾驗證四種情況，並通過 `node --test`：
  - 只有一段時不需要彙整
  - 缺少彙整結果時改列各段總評，`outcome.json` 的 `warnings` 記錄這件事
  - 一段失敗時 `failedChunks` 含該段
  - 沒有可審查內容

## 3. Workflow 整合

- [ ] 3.1 在 `.github/scripts/lkai-helpers.sh` 新增 `run_lkai`（design：多段並行送審並延後印出 lkai 訊息）。`run_lkai` 只執行 lkai，stdout、stderr 寫到檔案，不印出任何內容並回傳退出碼；`ask_lkai` 改為呼叫 `run_lkai` 後再以 `print_untrusted_text` 印出 stderr，對外行為與現在相同。verification：`shellcheck -s bash` 沒有問題；以 `/bin/bash` 3.2 搭配假的 lkai 執行，確認兩件事：退出碼 0／1／2 時 `ask_lkai` 的輸出與回傳值和修改前相同；`run_lkai` 不印出任何內容。
- [ ] 3.2 [after: 2.2, 3.1] 修改 `.github/workflows/pr-ai-review.yml`，改用分段審查流程：
  - 先執行 `plan`；沒有可審查檔案時跳過所有 lkai 請求
  - 每段以背景工作同時執行 `run_lkai`，`wait` 後依段落順序以 `print_untrusted_text` 印出各段 lkai 的訊息
  - 成功的段落超過一段時，再送一次彙整請求
  - 最後執行 `build-review`

  verification：`actionlint` 沒有新增問題，並由 3.5 的本機執行確認。
- [ ] 3.3 [after: 3.2] 在 workflow 實作發布與收掉討論串（design：以單一 PR review 發布 inline comment；發布成功後才收掉上一輪的討論串），滿足 spec「Previous AI review threads are resolved after a new review is published」：
  - 發布前以 GraphQL 分頁查詢 `reviewThreads`，收集未 resolve、第一則留言作者是 `github-actions` 且含 `<!-- lkai-review-comment -->` 的討論串
  - 以 `gh api` 送出 `review.json`；被拒時改送 `review-body-only.json` 並發出 `::warning::`
  - 任一版本發布成功後，對收集到的討論串呼叫 `resolveReviewThread`，失敗時只發出 `::warning::`
  - 兩個版本都發布失敗時不 resolve

  verification：`actionlint` 沒有新增問題，並由 3.5 的假 gh 呼叫紀錄確認。
- [ ] 3.4 [after: 3.3] 在 workflow 實作審查結果的判定規則，滿足 spec「Review run outcome reflects missing review content」：
  - `outcome.json` 有失敗段落，或 review 完全發布不了時，以 `::error::` 結束並回傳失敗
  - 意見的嚴重程度不影響結果
  - 加上 `concurrency`（`group: pr-ai-review-<PR 編號>`、`cancel-in-progress: true`）與 `timeout-minutes: 30`

  verification：`actionlint` 沒有新增問題；檢查 workflow 內容含 concurrency 與 timeout 設定；3.5 確認各情況的退出碼。
- [ ] 3.5 [after: 3.4] 從 workflow 抽出審查 script，在本機以 `/bin/bash` 3.2、假的 `lkai` 與假的 `gh` 執行五種情況：
  - 單段成功：送出 1 次審查請求、0 次彙整請求，發布含 inline comment 的 review
  - 三段中一段失敗：review 列出失敗段落，script 回傳失敗
  - 含 inline comment 的 review 被拒：改發只有本文的版本，發出警告，script 成功
  - 收集到的舊討論串只在發布成功後才被 resolve
  - 沒有可審查內容：不呼叫 lkai，script 成功

  verification：每種情況的假 `lkai`／`gh` 呼叫紀錄與退出碼符合上述預期。
- [ ] 3.6 [after: 1.2, 1.3, 2.1] 新增 `.github/workflows/github-scripts-test.yml`：`pull_request` 與 push 到 main 時，若 `.github/scripts/**` 或這個 workflow 有變動，在 `ubuntu-latest` 執行 `node --test .github/scripts/ai-review/`。verification：`actionlint` 沒有問題，這個 change 的 PR 上該 workflow 執行並通過。

## 4. 文件

- [ ] 4.1 [after: 3.4] 更新 `README.md` CI/CD 表格中 PR AI Review 的說明，涵蓋四點：排除自動產生的檔案、依相關性分段、以一次 PR review 發布 inline comment、新一輪審查會收掉上一輪的 AI 討論串。verification：檢查文件內容，確認說明與 spec 一致。

## 5. 實測與驗收

- [ ] 5.1 [after: 3.5, 3.6, 4.1] 在這個 change 的 PR 上實測，以 `gh api` 確認三件事：
  - `github-actions` 發布了一個 review：含 inline comment，或只有本文並附警告說明
  - 再 push 一個 commit 後，上一輪 AI 的討論串在 GraphQL 中 `isResolved` 為 true，新一輪的討論串仍未 resolve
  - `github-scripts-test` 通過

  若 `resolveReviewThread` 因權限被拒，記錄實際的錯誤，並依 design 的 Risks 更新 spec 與 design。verification：記錄 review ID、討論串的 resolve 狀態與 workflow 執行結果。
- [ ] 5.2 [after: 5.1] Owner 在 PR 頁面檢視 AI review；verification：三項皆符合：
  - inline comment 標在正確的程式碼行上
  - review 本文的總評與結論可以讀懂
  - 自動產生的檔案列在「已略過」清單
