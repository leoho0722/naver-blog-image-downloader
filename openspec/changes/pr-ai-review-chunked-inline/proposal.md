## Why

PR AI 審查目前把整份 diff 依檔名排序後，截斷在前 6000 行送審。PR #31 的前 6000 行全被 `.agents/`、`.archify/` 這類自動產生的檔案佔滿，真正要審的 `apps/web` 程式碼一行都沒送進去。審查意見也只能寫成一則留言裡的 `file:line` 文字，沒辦法直接標在程式碼行上。

## What Changes

- 新增 repo 根目錄的 `.gitattributes`，以 `linguist-generated` 標記自動產生的檔案（Spectra 產生的 skill、archify 輸出、lockfile）。
  - 審查時排除這些檔案的內容，只在檔案總覽中列為「已略過」；GitHub 的 PR 頁面也會因此預設摺疊它們。
  - 判斷依據是 base commit 的 `.gitattributes`，PR 無法藉由修改這個檔案讓自己的程式碼跳過審查；PR 有修改它時，review 本文會提示。取不到 base commit 時整個審查判定為失敗，不會猜測。
- 排除後的 patch 若超過每段的行數上限，依元件區域與功能相關性切成多段送審。
  - 同一元件、同一功能的檔案放在同一段，原始碼與對應的測試排在一起。
  - **所有段落都會送審，不會跳過任何檔案**。同時送出的請求數有上限，分批執行。
  - 段數很多時照樣全部審查，但在 review 本文與 workflow 中提醒可以考慮拆小 PR。
- 送審的 patch 標上新檔案的行號，模型改為輸出結構化結果：總評、結論，以及每項意見的檔案、行號、嚴重程度與說明。
- 分成多段時，最後再請模型把各段的總評彙整成一份總評；整體結論由 script 依各段結果計算，彙整的文字必須與它一致。
- **審查結果改以一次 PR review 發布**，不再是一則一般留言。
  - 總評放在 review 本文；能對應到 diff 行的意見以 inline comment 標在該行，對應不到的意見放進本文。
  - 發布前先清理模型寫的文字，避免誤發 `@mention` 通知或破壞版面；本文超過 GitHub 的長度上限時截斷，完整內容另外寫進 workflow 的 job summary。
- 新一輪 review 發布成功後，把上一輪 AI 留下、還沒 resolve 的討論串標為 resolved，避免舊意見卡住 main 的「所有對話都要 resolve 才能合併」規則。這一輪沒有完整審查到的檔案（送審失敗、被截斷）上的舊意見會留著；已經沒有變更的檔案（改動被還原或檔案被刪除）上的舊意見會一併收掉。
- 同一個 PR 有新的 push 時，取消還在執行的舊審查；workflow 權限為 `contents: write`（收掉討論串需要）與 `pull-requests: write`，不再需要 `issues: write`，有寫入權限的 token 只交給發布審查結果的那一步。
- 定義失敗時的行為，原則是「審查內容有缺漏才算失敗，只是呈現方式降級則發出警告」：
  - 任何一段送審失敗、回答不完整或結構化結果無法解讀，或 review 完全發布不了時，發布已取得的內容並標註缺漏，整體結論標為「審查不完整」，workflow 判定為失敗。
  - inline comment 被 GitHub 拒絕時，改為把全部意見放進 review 本文；彙整總評失敗時，改列各段的總評；收掉舊討論串失敗時，只留下警告。這三種情況審查內容完整，workflow 不判定為失敗。
- 新增審查 script 的單元測試，以及在相關檔案變動時執行測試的 workflow。

## Capabilities

### New Capabilities

- `pr-ai-review`: PR 開啟或更新時由 AI 審查 diff，涵蓋自動產生檔的排除、依相關性分段並全部送審、結構化意見、彙整成一次 PR review 並以 inline comment 發布，以及收掉上一輪 AI 的討論串。

### Modified Capabilities

(none)

## Impact

- Affected specs: 新增 `pr-ai-review`
- Affected code:
  - `.github/workflows/pr-ai-review.yml`：改為呼叫分段審查流程、發布 PR review、收掉舊討論串，加上 concurrency 與 timeout，權限改為 `contents: write`、`pull-requests: write`
  - `.github/scripts/lkai-helpers.sh`：新增只執行 lkai、不立即印出訊息的函式，讓多段可以並行送審
  - 新增 `.github/scripts/ai-review/`：分段規劃、文字清理、結果彙整與驗證的 Node script 及其單元測試
  - 新增 `.gitattributes`：標記自動產生的檔案
  - 新增 `.github/workflows/github-scripts-test.yml`：`.github/scripts/**` 變動時執行單元測試
  - `README.md`：CI/CD 表格中 PR AI Review 的說明
- 外部系統：GitHub REST API（建立 pull request review）與 GraphQL API（查詢與 resolve review thread）
- 費用：所有段落都送審，請求數隨 PR 大小增加；最近 150 個 commit 中，排除自動產生檔與純刪除檔後最大的是 12,690 行（實測），約 3 段
- 版號：只改動 `.github/` 與根目錄的 `.gitattributes`，不涉及任何元件的 version 檔案，不 bump 版號
