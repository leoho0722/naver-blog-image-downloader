## Why

目前 CI/CD 工作流僅服務於 GitHub Pages 部署，分拆為兩個檔案（`ci.yml` 驗證 + `cd.yml` 部署），但專案核心是 Flutter App，卻缺少 Flutter 程式碼品質驗證的自動化流程。將 Pages 相關流程整合為單一 `deploy-pages.yml`，釋出 `ci.yml` 作為 Flutter 專案驗證管線，可同時簡化 Pages 部署流程並補齊 Flutter CI 缺口。

## What Changes

- 新增 `.github/workflows/deploy-pages.yml`：合併現有 Pages 圖片引用驗證與部署步驟為單一工作流，驗證通過後自動部署
- 改寫 `.github/workflows/ci.yml`：從 Pages 驗證轉為 Flutter 專案驗證（`flutter analyze` + `dart format --set-exit-if-changed`）
- 刪除 `.github/workflows/cd.yml`：其部署邏輯已併入 `deploy-pages.yml`

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

（無）

## Impact

- 受影響檔案：`.github/workflows/ci.yml`、`.github/workflows/cd.yml`、`.github/workflows/deploy-pages.yml`（新增）
- CD workflow 原以 `workflow_run` 監聽 CI workflow 名稱，整合後改為同一工作流內的 job 依賴，需確認 Pages environment 設定不受影響
- Flutter CI 新增後，所有 PR 與 push 至 main 的 Flutter 程式碼變更都會自動執行品質檢查
