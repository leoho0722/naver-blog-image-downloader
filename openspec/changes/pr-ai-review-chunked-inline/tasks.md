## 1. 排除自動產生的檔案與分段

- [x] 1.1 新增 repo 根目錄的 `.gitattributes`（design：以 .gitattributes 的 linguist-generated 標記自動產生的檔案）。以 `linguist-generated` 標記 `.agents/skills/**`、`.claude/skills/**`、`.archify/**`、`**/pnpm-lock.yaml`、`**/package-lock.json`、`**/uv.lock`。verification：執行 `git check-attr linguist-generated -- .agents/skills/spectra-apply/SKILL.md .claude/skills/spectra-apply/SKILL.md .archify/architecture-naver-system-20261024-120117/naver-system.html apps/web/pnpm-lock.yaml apps/web/src/main.tsx`，前四個是 `set`，`apps/web/src/main.tsx` 是 `unspecified`。
- [x] 1.2 新增 `.github/scripts/ai-review/diff.mjs`（design：用 Node script 處理 diff 解析、分段與彙整；送審 patch 標上新檔案的行號），滿足 spec「Patches are annotated with new-file line numbers and findings are structured」中的 diff 解析與行號標註規則。
  - 把 `git -c core.quotePath=false diff` 的 unified diff 解析成檔案清單：路徑（還原 C 語言式的引號路徑）、舊路徑、狀態（added／modified／renamed／deleted）、是否為二進位、hunk
  - 為每個檔案產生標註後的 patch 與可留言行區間：行號靠右對齊到該檔案最大行號的寬度；`\ No newline at end of file` 行號欄留空且不推進行號
  - 截斷到指定行數時，只保留實際送出部分的可留言行

  verification：`diff.test.mjs` 以 `node --test .github/scripts/ai-review/` 執行並通過，涵蓋 spec 的「one hunk」與「missing newline at end of file」兩個 Example、`docs/說明.md` 這類非 ASCII 路徑、含空白的引號路徑、新增檔案、更名、二進位、多個 hunk，以及截斷後的可留言行。
- [x] 1.3 [after: 1.2] 新增 `.github/scripts/ai-review/chunk.mjs`（design：依元件區域分組、原始碼與測試相鄰的分段裝箱規則；所有段落都送審，不設段數上限），滿足 spec「Reviewable files are packed into relevance-grouped chunks」。
  - 實作元件區域（根目錄的區域名稱為空字串、排在最前）
  - 實作功能鍵：移除 `src`、`__tests__`、`tests`、`test` 目錄段，檔名去掉副檔名後再去掉 `.test`／`.spec`、`test_`、`_test`；所有排序以 Unicode code point 比較
  - 實作裝箱：區域、功能群組、群組超過上限時改以檔案為單位、單一檔案截斷；不限制段數

  verification：`chunk.test.mjs` 通過，涵蓋：
  - spec 的「packing with a budget of 100 lines」「feature group larger than the budget」「feature keys」三個 Example 的確切結果
  - 單一檔案超過上限時自成一段並標記截斷
  - 產生 10 段時全部保留、沒有檔案被丟掉
- [x] 1.4 [after: 1.1, 1.3] 新增 `.github/scripts/ai-review/ai-review.mjs` 的 `plan` 子命令，介面依 design 的 Implementation Contract，滿足 spec「Generated, deleted, and binary files are excluded from review content」。
  - 以 `<base>...<head>` 產生 diff，取不到 merge base 時退回兩點 diff，與現行 workflow 相同
  - 先以 `git cat-file -e <base>^{commit}` 確認 base commit 存在，不存在時以非 0 退出碼結束、不寫出任何檔案
  - 以 `git check-attr --source=<base> linguist-generated` 判斷自動產生檔，再依刪除狀態與二進位分類；沒有 hunk 的檔案（純更名、純權限變更）歸為可審查、只送標題行
  - `plan.json` 記錄 `baseSha`、`headSha` 與 `gitattributesChanged`
  - 寫出每段的 `chunk-<n>.md`：審查指示（沿用現行的審查面向與嚴重程度標示，並要求最後輸出一個 ```json 區塊）、所有檔案的總覽（分類與段落編號）、該段標註後的 patch

  verification：測試以 `git init` 建立暫存 repo，驗證兩件事並通過 `node --test`：spec「file classification」Example 的分類結果；「Pull request cannot exclude its own files through .gitattributes」情境中 `apps/web/src/main.tsx` 仍為 reviewed、`gitattributesChanged` 為 true；base commit 不存在時以非 0 結束。另在本 repo 對 `1589fa1` 到 `ae99a9b` 執行 `plan`，檢查 `plan.json` 與 `chunk-1.md` 的內容。

## 2. 意見彙整、文字清理與 review 組裝

- [x] 2.1 [after: 1.2] 新增 `.github/scripts/ai-review/findings.mjs`（design：模型輸出 JSON，由 script 決定性地彙整意見），滿足 spec「Multi-chunk results are consolidated into one summary」中的意見合併與整體結論，以及「The review is published as one pull request review with inline comments」中的意見分流，提供三項功能：
  - 擷取回答中最後一個 ```json 區塊並驗證格式
  - 合併並排序各段意見，依 `blocker` → `incomplete` → `changes_suggested` → `no_concerns` 的順序計算整體結論
  - 依可留言行把意見分流到 inline comment 或本文

  verification：`findings.test.mjs` 通過，涵蓋 spec 的「overall verdict」（六列）與「finding routing」兩個 Example，以及沒有 JSON 區塊、缺欄位、`line` 不是整數或 null 時判定為失敗。
- [x] 2.2 新增 `.github/scripts/ai-review/text.mjs`（design：清理模型文字後才發布），滿足 spec「Published text is sanitized and kept within GitHub limits」。
  - 清理模型文字：`@` 前面不是英文字母或數字時，在 `@` 後插入 U+200B；`<!--`／`-->` 改為 `&lt;!--`／`--&gt;`
  - 原始回答放進 fence 長度大於內文最長連續反引號的 code fence，並跳脫 `</details`
  - 本文超過 60,000 字元時，依序移除原始回答區塊、縮短「無法標在程式碼行上的意見」清單的尾端，並加上截斷說明
  - 單則 inline comment 超過 60,000 字元時截斷；job summary 用的完整本文超過 1,000,000 bytes 時截斷

  verification：`text.test.mjs` 通過，涵蓋 spec 的「sanitizing」Example 五列，以及本文超過 60,000 字元時的截斷順序與說明文字。
- [x] 2.3 [after: 1.4, 2.1, 2.2] 在 `ai-review.mjs` 新增 `synthesis-prompt` 與 `build-review` 子命令，介面依 Implementation Contract。
  - 彙整提示詞只附各段的總評、結論與意見清單，不附程式碼，並附上 script 計算的整體結論、要求一致。
  - `build-review` 的 `--head-sha` 與 `plan.json` 的 `headSha` 不同時，以非 0 退出碼結束，不寫出任何 review；`--run-id` 寫成本文第二行的 `<!-- lkai-review-run: <run id> -->`。
  - `build-review` 寫出四個檔案：
    - `review.json`：event `COMMENT`、`commit_id`、以 `<!-- lkai-review -->` 開頭的本文、結尾帶 `<!-- lkai-review-comment -->` 的 inline comment
    - `review-body-only.json`
    - 未截斷的 `summary.md`
    - `outcome.json`：`verdict`、`failedChunks`、`warnings`、`keepThreadPaths`（這次 diff 內、但沒有完整審查的檔案）
  - 本文列出：由 script 計算的整體結論、總評、彙整請求的結論（有彙整結果時）、已略過／已截斷的檔案、警告與失敗段落；本次改用 base 規則判斷、段數超過 `WARN_CHUNKS` 時，在本文開頭提示。
  - 所有段落都失敗時，總評寫明沒有任何段落取得有效結果並列出各段的失敗原因，`verdict` 為 `incomplete`。
  - 沒有可審查檔案時，產出說明沒有可審查內容的本文，`verdict` 為 `no_concerns`。

  verification：測試以暫存的 results 資料夾驗證六種情況，並通過 `node --test`：
  - 只有一段時不需要彙整
  - 缺少彙整結果時改列各段總評，`warnings` 記錄這件事
  - 一段失敗時 `failedChunks` 含該段、`verdict` 為 `incomplete`、`keepThreadPaths` 含該段的檔案；所有段落都失敗時的總評
  - head SHA 不一致時以非 0 結束
  - 段數超過 `WARN_CHUNKS` 時本文開頭有警告
  - 沒有可審查內容

## 3. Workflow 整合

- [x] 3.1 在 `.github/scripts/lkai-helpers.sh` 新增 `run_lkai`（design：多段並行送審並延後印出 lkai 訊息）。`run_lkai` 只執行 lkai，stdout、stderr 寫到檔案，不印出任何內容並回傳退出碼；`ask_lkai` 改為呼叫 `run_lkai` 後再以 `print_untrusted_text` 印出 stderr，對外行為與現在相同。verification：`shellcheck -s bash` 沒有問題；以 `/bin/bash` 3.2 搭配假的 lkai 執行，確認兩件事：退出碼 0／1／2 時 `ask_lkai` 的輸出與回傳值和修改前相同；`run_lkai` 不印出任何內容。
- [x] 3.2 [after: 2.3, 3.1] 修改 `.github/workflows/pr-ai-review.yml`，改用分段審查流程（design：所有段落都送審，不設段數上限；多段並行送審並延後印出 lkai 訊息；審查結果的判定規則），滿足 spec「Every chunk is reviewed with bounded concurrency」：
  - 先 `git fetch` base SHA 再執行 `plan`；`plan` 失敗時以 `::error::` 結束，不送審、不發布、不 resolve；沒有可審查檔案時跳過所有 lkai 請求
  - 依段落順序每批最多 `MAX_PARALLEL_CHUNKS` 段，以背景工作執行 `run_lkai`；每批 `wait` 後依段落順序以 `print_untrusted_text` 印出各段 lkai 的訊息，再送下一批
  - 有兩段以上取得有效結果時，送一次彙整請求；最後執行 `build-review`
  - 設定 `permissions` 為 `contents: read`、`pull-requests: write`，`concurrency` 為 `group: pr-ai-review-<PR 編號>`、`cancel-in-progress: true`，`timeout-minutes: 60`

  verification：`actionlint` 沒有新增問題；檢查 workflow 內容含上述 permissions、concurrency 與 timeout；分批送審的行為由 3.4 確認。
- [x] 3.3 [after: 3.2] 在 workflow 實作發布、收掉討論串與結果判定（design：以單一 PR review 發布 inline comment；發布成功後才收掉上一輪的討論串；審查結果的判定規則），滿足 spec「Previous AI review threads are resolved after a new review is published」與「Review run outcome reflects missing review content」：
  - **發布前收集**：以 GraphQL 分頁查詢 `reviewThreads`，收集符合四個條件的討論串：未 resolve、第一則留言作者是 `github-actions`、含 `<!-- lkai-review-comment -->`、路徑不在 `outcome.json` 的 `keepThreadPaths` 內
  - **發布**：以 `gh api` 送出 `review.json`；失敗時先列出 PR 的 review，沒有帶著這次 run 標記的 review 才改送 `review-body-only.json`，並發出 `::warning::`
  - **發布成功後**：對收集到的討論串呼叫 `resolveReviewThread`，失敗時只發出 `::warning::`；兩個版本都發布失敗時不 resolve
  - **job summary**：把 `summary.md` 寫進 `$GITHUB_STEP_SUMMARY`，並把 `outcome.json` 的 `warnings` 以 `::warning::` 發出
  - **結果判定**：`failedChunks` 不是空的、review 完全發布不了，或 `build-review` 以非 0 結束時，以 `::error::` 結束並回傳失敗；意見的嚴重程度不影響結果

  verification：`actionlint` 沒有新增問題，並由 3.4 的假 gh 呼叫紀錄確認。
- [x] 3.4 [after: 3.3] 從 workflow 抽出審查 script，在本機以 `/bin/bash` 3.2、假的 `lkai` 與假的 `gh` 執行六種情況：
  - 單段成功：送出 1 次審查請求、0 次彙整請求，發布含 inline comment 的 review
  - 8 段、`MAX_PARALLEL_CHUNKS` 為 3：依 3、3、2 分批送出，同時執行的請求數不超過 3，本文開頭有段數警告
  - 三段中一段失敗：review 列出失敗段落與檔案，該段檔案上的舊討論串不被 resolve，已不在 diff 內的檔案上的舊討論串被 resolve，script 回傳失敗
  - base commit 取不到：不呼叫 lkai 與發布、不 resolve，script 回傳失敗
  - 含 inline comment 的 review 被拒：改發只有本文的版本，發出警告，script 成功；若已存在帶著這次 run 標記的 review，則不改發
  - 兩個版本都發布失敗：不呼叫 `resolveReviewThread`，script 回傳失敗
  - 沒有可審查內容：不呼叫 lkai，script 成功

  verification：每種情況的假 `lkai`／`gh` 呼叫紀錄與退出碼符合上述預期。
- [x] 3.5 [after: 1.2, 1.3, 2.1, 2.2] 新增 `.github/workflows/github-scripts-test.yml`：`pull_request` 與 push 到 main 時，若 `.github/scripts/**` 或這個 workflow 有變動，在 `ubuntu-latest` 執行 `node --test .github/scripts/ai-review/`。verification：`actionlint` 沒有問題，這個 change 的 PR 上該 workflow 執行並通過。

## 4. 文件

- [x] 4.1 [after: 3.3] 更新 `README.md` CI/CD 表格中 PR AI Review 的說明，涵蓋四點：
  - 依 base commit 的 `.gitattributes` 排除自動產生的檔案
  - 依相關性分段並全部審查
  - 以一次 PR review 發布 inline comment
  - 新一輪審查會收掉上一輪的 AI 討論串，但送審失敗或被截斷的檔案上的會留著；一直被截斷的檔案上的討論串需要手動 resolve

  verification：檢查文件內容，確認說明與 spec 一致。

## 5. 實測與驗收

- [x] 5.1 [after: 3.4, 3.5, 4.1] 在 GitHub 上實測，以 `gh api` 確認四件事：
  - 這個 change 的 PR 上，`github-actions` 發布了一個 review：含 inline comment，或只有本文並附警告說明
  - 再 push 一個 commit 後，上一輪 AI 的討論串在 GraphQL 中 `isResolved` 為 true，新一輪的討論串仍未 resolve
  - `github-scripts-test` 通過
  - 自動產生檔的略過，在另開的測試 PR 上驗證：這個 change 的 PR 的 base（main）還沒有 `.gitattributes`，無法在自己的 PR 上驗證，所以從 `features/pr-ai-review-chunked-inline` 開一個測試分支，同時修改 `.agents/skills/` 底下的檔案與一個一般檔案，發 PR 到 `features/pr-ai-review-chunked-inline`。確認前者列在「已略過」、後者被審查，驗證後關閉測試 PR 並刪除分支

  若 `resolveReviewThread` 因權限被拒，記錄實際的錯誤，並依 design 的 Risks 更新 spec 與 design。verification：記錄 review ID、討論串的 resolve 狀態與 workflow 執行結果。
- [ ] 5.2 [after: 5.1, 6.7, 7.6, 7.9, 7.11] Owner 在 PR 頁面檢視 AI review；verification：五項皆符合：
  - inline comment 標在正確的程式碼行上
  - review 本文的總評與結論可以讀懂
  - 在 5.1 的測試 PR 上，自動產生的檔案列在「已略過」清單
  - 6.7 修正過的意見附上確認回覆並收掉，沒修正的維持未 resolve
  - 7.6 的這一輪中，🟢 意見只出現在本文，🔴／🟡 意見以 inline comment 或檔案層級留言呈現

## 6. 由 AI 確認已修正後才收掉上一輪的討論串

- [x] 6.1 [after: 5.1] 在 `plan` 子命令加上 `--threads <threads.json>`（design：由 AI 確認已修正後才收掉上一輪的討論串），滿足 spec「Previous AI review threads are resolved after a new review is published」中的分類與提示詞規則：
  - 依討論串所在檔案在這次 diff 的狀態分類為 `ask`、`no-longer-changed`、`deleted`、`keep`，寫進 `plan.json` 的 `previousThreads`，並給每個討論串 `P1`、`P2`… 的代號
  - `ask` 的討論串放進對應段落提示詞的「上一輪仍未解決的意見」區塊（`prompts.mjs`），要求模型在 `previousThreads` 回報是否已修正，並且不要把仍存在的問題再列為新的 findings

  verification：`plan.test.mjs` 以暫存 repo 驗證四種分類（屬於某段且未截斷、已不在 diff、已刪除、被截斷或自動產生），以及討論串只出現在它所屬段落的提示詞中，並通過 `node --test`。
- [x] 6.2 [after: 5.1] 讓 `findings.mjs` 的 `parseChunkResult` 接受選填的 `previousThreads`，滿足 spec「Patches are annotated with new-file line numbers and findings are structured」中的格式規則：每項必須有字串 `ref`、布林 `fixed`、字串 `note`，不合格時這一段視為失敗；沒有這個欄位時視為全部沒有判斷。verification：`findings.test.mjs` 涵蓋合格、缺少欄位、`fixed` 不是布林、不是陣列等情況並通過。
- [x] 6.3 [after: 6.1, 6.2] 在 `review.mjs` 依 `plan.json` 的 `previousThreads` 與各段結果計算 `outcome.json` 的 `threadActions` 與 `threadSummary`，取代 `keepThreadPaths`：
  - 只有判定已修正且那一段成功的 `ask` 討論串，以及 `no-longer-changed`、`deleted` 的討論串會列入 `threadActions`，並附上已清理的回覆內容（含 head commit 短 SHA 與模型的說明）
  - review 本文加上「上一輪意見的追蹤」，滿足 spec「The review is published as one pull request review with inline comments」中的本文內容規則

  verification：`review.test.mjs` 涵蓋 spec「which threads are resolved」Example 中與模型判斷相關的各列（已修正、未修正、沒有判斷、段落失敗、已不在 diff、已刪除、保留），並通過 `node --test`。
- [x] 6.4 [after: 6.3] 在 `run-review.sh` 新增 `collect` 子命令並改寫 `publish`，取代已完成的 3.3 中「依 `keepThreadPaths` 收掉上一輪全部討論串」的規則：
  - `collect` 以 GraphQL 分頁查詢未 resolve 的 AI 討論串，寫出 `threads.json`；查詢失敗時發出警告、寫出空清單
  - `plan` 傳入 `--threads`
  - `publish` 在 review 發布成功後，依 `threadActions` 對每個討論串先以 `addPullRequestReviewThreadReply` 回覆、再 `resolveReviewThread`；回覆或 resolve 失敗只發出警告
  - workflow 在「規劃審查」前新增「收集上一輪的 AI 討論串」步驟，`GH_TOKEN` 只設定在這一步與「發布審查結果」

  verification：`shellcheck` 與 `actionlint` 沒有新增問題；檢查 workflow 中 `GH_TOKEN` 只出現在這兩步；行為由 6.5 確認。
- [x] 6.5 [after: 6.4] 以本機 `/bin/bash` 3.2、假的 `lkai` 與假的 `gh` 執行 e2e 情境，確認五件事：
  - 模型判定已修正的討論串先回覆再 resolve
  - 判定未修正或沒有判斷的討論串不回覆也不 resolve
  - 已不在 diff 內的討論串附上回覆並 resolve
  - 段落失敗時該段的討論串不動
  - 查詢討論串失敗或 review 發布失敗時不回覆、不 resolve

  verification：每種情境的假 `gh` 呼叫紀錄與退出碼符合預期。
- [x] 6.6 [after: 6.4] 更新 `README.md`「PR AI Review 的運作方式」中收掉討論串的說明：改為 AI 確認已修正才收掉並附回覆，未修正的維持未 resolve。verification：檢查文件內容，確認說明與 spec 一致。
- [x] 6.7 [after: 6.5, 6.6] 在 PR #36 實測：修正一則 AI 意見對應的問題後 push，以 `gh api` 確認三件事：那則討論串有確認回覆並變成 resolved；其他未修正的討論串維持未 resolve；新一輪沒有重複提出那些未修正的問題。verification：記錄 run ID、該討論串的回覆內容與各討論串的 resolve 狀態。

## 7. 依嚴重程度決定意見是否擋合併

- [x] 7.1 調整 `findings.mjs` 與 `prompts.mjs`（design：依嚴重程度決定意見是否擋合併），取代已完成的 2.1 中整體結論的計算方式，滿足 spec「Multi-chunk results are consolidated into one summary」與「The review is published as one pull request review with inline comments」：
  - `computeVerdict` 只依意見與這一輪沒有收掉的上一輪討論串的嚴重程度計算，各段的 verdict 不再影響結果
  - `routeFindings` 分成三類：inline comment、檔案層級留言（🔴／🟡，路徑在 diff 內但不能標在本段的可留言行上）、只列在本文（🟢，以及路徑不在 diff 內的 🔴／🟡）
  - 審查提示詞說明 blocker 與 warning 會擋合併、nit 不會，blocker 與 warning 的 path 必須填本段的檔案；`VERDICT_LABELS` 的文字改為與擋合併一致

  verification：`findings.test.mjs` 涵蓋 spec「overall verdict」與「finding routing」Example 的每一列，並通過 `node --test`。
- [x] 7.2 在 `plan.mjs` 讀出上一輪討論串的嚴重程度，滿足 spec「Previous AI review threads are resolved after a new review is published」：從第一則留言開頭的標籤讀出 `severity` 寫進 `previousThreads`，讀不出來時視為 `warning`；🟢 的討論串分類為 `nit`，不放進任何提示詞。verification：`plan.test.mjs` 涵蓋 🟢、🔴、讀不出標籤三種討論串，並確認 🟢 不出現在提示詞中，通過 `node --test`。
- [x] 7.3 [after: 7.1, 7.2] 在 `review.mjs` 與 `ai-review.mjs` 組出新的發布內容，取代已完成的 2.3 中「落在可留言行的意見都發成 inline comment」的分流：
  - `build-review` 另外寫出 `file-comments.json`（inline 版發布後要送的檔案層級留言）與 `file-comments-fallback.json`（改發本文版時要送的，含全部路徑在 diff 內的 🔴／🟡），格式為 `[{ "path", "body" }]`
  - 本文的「無法標在程式碼行上的意見」開頭說明 🔴／🟡 另以檔案層級留言發布、🟢 不擋合併；路徑不在 diff 內的 🔴／🟡 標示不會擋合併
  - `nit` 的上一輪討論串列入 `threadActions`（`reason: "nit"`），回覆說明可選優化不擋合併；`threadSummary` 加上 `nit`，「上一輪意見的追蹤」列出這一項
  - 整體結論計入這一輪沒有收掉的上一輪 🔴／🟡 討論串

  verification：`review.test.mjs` 涵蓋上述四項與 spec「which threads are resolved」中的 `nit` 一列，並通過 `node --test`。
- [x] 7.4 [after: 7.3] 改寫 `run-review.sh` 的 `publish`：review 發布成功後，依發布的版本逐則以 `POST /repos/{owner}/{repo}/pulls/{pull_number}/comments` 送出 `subject_type: file` 的檔案層級留言（inline 版，或請求回報失敗但 review 其實已發布時，用 `file-comments.json`；改發本文版時用 `file-comments-fallback.json`）；單則失敗只發出警告；沒有任何版本發布時不送。verification：`shellcheck` 沒有新增問題；本機 e2e 情境確認 inline 版、改發本文版、單則留言失敗、兩個版本都發布失敗四種情況的假 `gh` 呼叫紀錄與退出碼符合預期。
- [x] 7.5 [after: 7.3] 更新 `README.md`「PR AI Review 的運作方式」：說明 🔴／🟡 以 inline comment 或檔案層級留言擋合併、🟢 只列在本文不擋合併，以及整體結論的意義。verification：檢查文件內容，確認說明與 spec 一致。
- [x] 7.6 [after: 7.4, 7.5] 在 PR #36 實測，以 `gh api` 確認四件事：新一輪沒有 🟢 的討論串；上一輪仍未 resolve 的 🟢 討論串附上回覆並 resolve；🔴／🟡 意見以 inline comment 或檔案層級留言呈現且維持未 resolve；整體結論與未 resolve 的 🔴／🟡 一致。若這一輪沒有需要發成檔案層級留言的意見，另以 `gh api` 對 PR #36 送出一則 `subject_type: file` 的測試留言，確認 API 參數可用後刪除。verification：記錄 run ID、各討論串的嚴重程度與 resolve 狀態，以及檔案層級留言的數量。

- [x] 7.7 在 `prompts.mjs` 與 `plan.mjs` 改為每段只附精簡的檔案總覽（design：精簡每段的檔案總覽），滿足 spec「Patches are annotated with new-file line numbers and findings are structured」的總覽規則：本段檔案全部列出；刪除、二進位、其他段的檔案依序最多 100 筆，超過時加一行依段落與分類列出沒有列出的數量；自動產生的檔案只寫數量；審查指示中對總覽的說明同步更新。同時讓 `plan` 印出的討論串統計加上 🟢 直接收掉的數量，並修正第七輪的兩項 🟢（`bodyItem` 的 JSDoc 缺少 `unattached`、`review.mjs` 重複的註解行）。verification：`plan.test.mjs` 涵蓋 spec「overview of chunk 1」Example 的兩列，並通過 `node --test`。
- [x] 7.8 在 `run-review.sh` 的 `collect` 查詢討論串的 `subjectType`，檔案層級的討論串寫成 `line: null`，滿足 spec「Previous AI review threads are resolved after a new review is published」的收集規則。verification：`shellcheck` 沒有新增問題；e2e 情境的假資料加上 `subjectType: FILE`、`line: 1` 的討論串，確認提示詞中沒有行號。
- [x] 7.9 [after: 7.7, 7.8] 在 PR #36 實測：push 後確認 `plan.mjs:216`「檔案總覽沒有計入每段行數上限」的討論串由 AI 確認已修正、附上回覆並 resolve，並記錄各段提示詞的實際行數。verification：記錄 run ID、該討論串的回覆內容、各段提示詞行數，以及 PR #36 是否還有未 resolve 的 🔴／🟡 討論串。
- [x] 7.10 檔案層級留言發布失敗時不再只發警告（design：依嚴重程度決定意見是否擋合併、審查結果的判定規則），滿足 spec「The review is published as one pull request review with inline comments」與「Review run outcome reflects missing review content」：
  - `review.mjs` 在檔案層級留言的內文、識別標記之前加上這次 run 的標記
  - `run-review.sh` 的 `post_file_comments` 在請求失敗時，先列出 PR 的留言確認有沒有路徑與內文完全相同的留言，有就算已發布，沒有才重試一次；仍失敗時發出 error，其他留言與收掉討論串照常處理，`publish` 最後以 1 結束

  verification：`review.test.mjs` 確認檔案層級留言含 run 標記；`shellcheck` 沒有新增問題；本機 e2e 確認三種情況：重試後成功時退出碼 0；回應遺失但留言已存在時不重試；兩次都失敗時其他留言與收掉討論串照常、退出碼 1。
- [x] 7.11 [after: 7.10] 在 PR #36 實測：push 後確認 `run-review.sh`「檔案層級留言發布失敗時只發警告」的討論串由 AI 確認已修正並收掉。verification：記錄 run ID、該討論串的回覆內容，以及 PR #36 是否還有未 resolve 的 🔴／🟡 討論串。

## 變更紀錄

以下調整發生在任何 task 開始之前，沒有已完成的工作受影響：

- 原 1.3 的段數上限（超過 `MAX_CHUNKS` 的檔案列為未審查）已取消，改依 design「所有段落都送審，不設段數上限」全部送審，分批送出的行為由 3.2 實作。
- 原 3.4「結果判定與執行設定」併入 3.2（permissions、concurrency、timeout）與 3.3（結果判定）；原 3.5、3.6 依序改為 3.4、3.5。
- 新增 2.2「清理模型文字與長度上限」，原 2.2 改為 2.3。

第三輪調整（依 PR #36 第二輪審查），同樣沒有已完成的工作受影響：

- `outcome.json` 的 `resolvablePaths` 改為 `keepThreadPaths`：已不在 diff 內或已刪除的檔案上的舊討論串也會被收掉，2.3、3.3 依此調整。
- 5.1 新增以測試 PR 驗證自動產生檔的略過；5.2 的「已略過」檢查改在該測試 PR 上進行。

實作期間的調整：

- 各 task 中的 `node --test .github/scripts/ai-review/` 在 CI 改為 `node --test '.github/scripts/ai-review/*.test.mjs'`：Node 24 的 `--test` 不接受資料夾參數（本機的 Node 26 可以），第一次在 PR 上執行時因此失敗。

5.1 實測紀錄（2026-11-26，已完成）：

- PR #36 第一輪（run 45764746864）：發布含 5 則 inline comment 的 review，行號皆對應到正確的程式碼行。
- PR #36 第二輪（run 45765429797）：收集到上一輪的 5 個 AI 討論串，新的 review（9 則 inline comment）發布成功，但 5 次 `resolveReviewThread` 全部失敗，錯誤為 `gh: Resource not accessible by integration`。workflow 權限為 `contents: read`、`pull-requests: write`，PR 不是 fork 發出。依 design 的 Risks，需要決定改用其他 token 或改為手動 resolve，再更新 spec 與 design。
- `github-scripts-test`：第一次因 Node 24 不接受資料夾參數而失敗，改為 glob 後通過（run 45765429799）。
- 自動產生檔的略過：測試 PR #37（base 為 `features/pr-ai-review-chunked-inline`）中，`.agents/skills/spectra-apply/SKILL.md` 列在「已略過」，一般檔案正常送審（run 45765867496）；驗證後已關閉 PR 並刪除分支。
- PR #36 第三輪（run 45779972357）：workflow 權限加上 `contents: write` 後，收集到的 14 個上一輪 AI 討論串全部 resolve，新一輪的 7 個維持未 resolve。依此更新 spec 與 design：權限改為 `contents: write`、`pull-requests: write`，`GH_TOKEN` 只設定在發布步驟，checkout 不保留憑證（3.2 描述中的 `contents: read` 以此為準）。
- PR #36 第四輪（run 45781016672）：`GH_TOKEN` 只設定在發布步驟、checkout 不保留憑證後，第三輪的 7 個 AI 討論串全部 resolve，新一輪的 9 個維持未 resolve；`github-scripts-test` 通過（run 45781016566）。
- 同一輪審查的意見也一併處理：inline 分流改以產生意見的那一段為準（模型對其他段的檔案只看過總覽）；git diff 固定 `a/`、`b/` 前綴；模型的標題轉成單行、內文補上未閉合的 code fence；錯誤訊息不再使用成對的反引號。

需求變更（2026-11-26，依使用者指示「當修正對應的 inline comment 後，經 AI 審查確認已修正後，就要自動 resolve」）：

- 收掉上一輪 AI 討論串的條件，由「新一輪發布後一律收掉」改為「新一輪的 AI 確認已修正才收掉」，見 design「由 AI 確認已修正後才收掉上一輪的討論串」（取代「發布成功後才收掉上一輪的討論串」）。
- 已完成的 3.3 保留原文作為歷史；其中「依 `keepThreadPaths` 收掉上一輪全部討論串」的規則由 6.4 取代，`keepThreadPaths` 由 6.3 的 `threadActions` 取代。
- 5.2 的驗收新增一項，並改為等 6.7 完成後進行。

6.7 實測紀錄（2026-11-26，已完成）：

- PR #36 第六輪（run 45805490677，head `efe47f3`）：收集到上一輪仍未 resolve 的 AI 討論串 7 個，7 個都交給模型判斷；模型判定 2 個已修正，兩者都先附上確認回覆再 resolve：
  - `.github/scripts/ai-review/diff.mjs`「內部狀態的 typedef 漏了 _raw」：這次刻意修正的問題，回覆「✅ 新一輪 AI 審查（efe47f3）確認這個問題已修正：第 163 行的 JSDoc 型別已加上 `_raw: string`。」
  - `.github/scripts/ai-review/review.mjs`「keepThreadPaths 沒有涵蓋更名檔案的舊路徑」：`keepThreadPaths` 在 6.3 已移除，更名改由 `classifyThreads` 比對舊路徑，判定正確。
- 其餘 5 個（`plan.mjs` 2 個、`review.mjs`、`text.mjs`、`pr-ai-review.yml` 各 1 個）沒有修正，維持未 resolve，也沒有回覆。
- 新一輪的 9 則意見沒有與這 5 個未修正的問題重複。

需求變更（2026-11-26，依使用者指示「擋合併的條件 = 有 🔴 阻擋合併 或是 🟡 建議修正；不擋合併的條件 = 只剩下 🟢 可選優化」）：

- 🟢 意見只列在 review 本文；🔴／🟡 意見對應不到可留言行時，改發檔案層級留言（兩者皆為使用者的選擇）。見 design「依嚴重程度決定意見是否擋合併」。
- 已完成的 2.1（整體結論的計算方式）與 2.3（意見分流）保留原文作為歷史，由 7.1、7.3 取代；已完成的 6.1 的分類規則由 7.2 補上 `nit` 一類。
- 依 PR #36 第六輪審查一併修正文件不一致：design 的 Risks 與 proposal 中 token 的範圍漏掉收集步驟、spec 沒有定義更名檔案上的討論串如何分類、design 補上 fetch base commit 依賴匿名存取的風險。
- 5.2 改為等 7.6 完成後進行，並新增一項驗收。

7.6 實測紀錄（2026-11-26，已完成）：

- PR #36 第七輪（run 45808818730，head `ced803d`）：收集到上一輪仍未 resolve 的 AI 討論串 14 個，其中 🟢 9 個、🟡 5 個。
  - 9 個 🟢 都附上「✅ 🟢 可選優化不擋合併，收掉這則討論串（ced803d）」並 resolve，沒有交給模型判斷。
  - 5 個 🟡 交給模型判斷：4 個確認已修正，附上回覆並 resolve；`plan.mjs:216`「檔案總覽沒有計入每段行數上限」判定未修正，維持未 resolve。
- 新一輪的 6 項意見都是 🟢，只列在本文，沒有建立任何討論串（inline comment 0 則、檔案層級留言 0 則）。
- 整體結論為「🟡 有建議修正的問題」，來自那 1 則仍未 resolve 的 🟡，與擋合併的狀態一致；`github-scripts-test` 通過。
- 這一輪沒有需要發成檔案層級留言的意見，所以依 7.6 另以 owner 的 `gh` 身分，用與 `post_file_comments` 相同的參數（`body`、`commit_id`、`path`、`subject_type=file`）對 PR #36 的 `README.md` 送出測試留言：回應的 `subject_type` 為 `file`，GraphQL 的討論串 `subjectType` 為 `FILE`、未 resolve（會擋合併）；刪除留言後，GitHub 自動建立的那筆 review 也一併消失（查詢回 404）。
- 發現：檔案層級的討論串在 GraphQL 中的 `line` 回傳 1，不是 null；收集步驟直接使用時，下一輪提示詞會把它寫成「第 1 行」。由 7.8 修正。

依 PR #36 第七輪審查（2026-11-26，使用者選擇「精簡總覽」）：

- 新增 7.7：每段只附精簡的檔案總覽，見 design「精簡每段的檔案總覽」；spec 中「每段提示詞含所有檔案的總覽」與「略過的檔案列在總覽」的規則同步改寫。已完成的 1.4 中「所有檔案的總覽」的描述保留原文作為歷史，由 7.7 取代。
- 新增 7.8：7.6 實測發現檔案層級討論串的 `line` 回傳 1，收集時改寫成 null。
- 新增 7.9 實測；5.2 改為等 7.9 完成後進行。

7.9 實測紀錄（2026-11-26，已完成）：

- PR #36 第八輪（run 45814714658，head `8e93554`）：收集到上一輪仍未 resolve 的 AI 討論串 1 個，交給模型判斷；`plan.mjs`「檔案總覽沒有計入每段行數上限」判定已修正，回覆「✅ 新一輪 AI 審查（8e93554）確認這個問題已修正：renderOverview 改成只完整列出本段的檔案；其他檔案依序列出刪除、二進位與其他段的檔案，最多 OVERVIEW_OTHER_LIMIT…」並 resolve。
- 各段的 patch 行數為 5829、1041，提示詞實際行數為 5949、1122（含審查指示、精簡總覽與上一輪的討論串）。
- 新一輪有 1 則 🟡 inline comment（`spec.md` 的清理規則沒有涵蓋檔案層級留言與討論串回覆），維持未 resolve；其餘 6 項為 🟢，只列在本文。`github-scripts-test` 通過。

依 PR #36 第八輪審查：spec「Published text is sanitized and kept within GitHub limits」與 design「清理模型文字後才發布」補上清理範圍：檔案層級留言與討論串回覆。程式本來就會清理這兩者（檔案層級留言與 inline comment 共用 `commentBody`，回覆中模型的說明經 `sanitizeModelText` 並限制 1000 字元），只修改文件。

依 PR #36 第九輪審查（2026-11-26，使用者選擇「改為 workflow 失敗」）：

- 檔案層級留言重試後仍發布不了時，由「只發出警告」改為 workflow 失敗：這則 🔴／🟡 沒能擋住合併，屬於審查內容的缺漏。已完成的 7.4 中「單則失敗只發出警告」的規則由 7.10 取代。
- 5.2 改為等 7.11 完成後進行。

7.11 實測紀錄（2026-11-26，已完成）：

- PR #36 第十輪（run 45816901602，head `89fc39e`）：`run-review.sh`「檔案層級留言發布失敗時只發警告」的討論串判定已修正，回覆「✅ 新一輪 AI 審查（89fc39e）確認這個問題已修正：post_file_comments 在發布失敗時，會先確認留言是否其實已存在，沒有才重試一次；仍然失敗就累加 file_comment_f…」並 resolve；`github-scripts-test` 通過。
- 各段提示詞實際行數為 5977、1146。
- 新一輪有 1 則 🟡 inline comment：design「模型輸出 JSON，由 script 決定性地彙整意見」仍寫著舊的整體結論規則（7.1 改規則時漏改），維持未 resolve。已在本機修正該段 design，尚未 push。
