## Why

PR AI 審查目前把整份 diff 依檔名排序後，截斷在前 6000 行送審。PR #31 的前 6000 行全被 `.agents/`、`.archify/` 這類自動產生的檔案佔滿，真正要審的 `apps/web` 程式碼一行都沒送進去。審查意見也只能寫成一則留言裡的 `file:line` 文字，沒辦法直接標在程式碼行上。

## What Changes

- 新增 repo 根目錄的 `.gitattributes`，以 `linguist-generated` 標記自動產生的檔案（Spectra 產生的 skill、archify 輸出、lockfile）。審查時排除這些檔案的內容，只在檔案總覽中列為「已略過」；GitHub 的 PR 頁面也會因此預設摺疊它們。
- 排除後的 patch 若超過每段的行數上限，依元件區域與功能相關性切成多段分別送審：同一元件、同一功能的檔案放在同一段，原始碼與對應的測試排在一起。段數有上限，超出上限而沒審到的檔案，會在結果中明確列出。
- 送審的 patch 標上新檔案的行號，模型改為輸出結構化結果：總評、結論，以及每項意見的檔案、行號、嚴重程度與說明。
- 分成多段時，最後再請模型把各段的總評彙整成一份總評。
- **審查結果改以一次 PR review 發布**，不再是一則一般留言：總評放在 review 本文；能對應到 diff 行的意見以 inline comment 標在該行，對應不到的意見放進本文。
- 新一輪 review 發布成功後，把上一輪 AI 留下、還沒 resolve 的討論串標為 resolved，避免舊意見卡住 main 的「所有對話都要 resolve 才能合併」規則。
- 同一個 PR 有新的 push 時，取消還在執行的舊審查。
- 定義失敗時的行為，原則是「審查內容有缺漏才算失敗，只是呈現方式降級則發出警告」：
  - 任何一段送審失敗、回答不完整或結構化結果無法解讀，或 review 完全發布不了時，發布已取得的內容並標註缺漏，workflow 判定為失敗。
  - inline comment 被 GitHub 拒絕時，改為把全部意見放進 review 本文；彙整總評失敗時，改列各段的總評；收掉舊討論串失敗時，只留下警告。這三種情況審查內容完整，workflow 不判定為失敗。
- 新增審查 script 的單元測試，以及在相關檔案變動時執行測試的 workflow。

## Capabilities

### New Capabilities

- `pr-ai-review`: PR 開啟或更新時由 AI 審查 diff，涵蓋自動產生檔的排除、依相關性分段送審、結構化意見、彙整成一次 PR review 並以 inline comment 發布，以及收掉上一輪 AI 的討論串。

### Modified Capabilities

(none)

## Impact

- Affected specs: 新增 `pr-ai-review`
- Affected code:
  - `.github/workflows/pr-ai-review.yml`：改為呼叫分段審查流程、發布 PR review、收掉舊討論串，加上 concurrency 與 timeout
  - `.github/scripts/lkai-helpers.sh`：新增只執行 lkai、不立即印出訊息的函式，讓多段可以並行送審
  - 新增 `.github/scripts/ai-review/`：分段規劃、結果彙整與驗證的 Node script 及其單元測試
  - 新增 `.gitattributes`：標記自動產生的檔案
  - 新增 `.github/workflows/github-scripts-test.yml`：`.github/scripts/**` 變動時執行單元測試
  - `README.md`：CI/CD 表格中 PR AI Review 的說明
- 外部系統：GitHub REST API（建立 pull request review）與 GraphQL API（查詢與 resolve review thread）
- 版號：只改動 `.github/` 與根目錄的 `.gitattributes`，不涉及任何元件的 version 檔案，不 bump 版號
