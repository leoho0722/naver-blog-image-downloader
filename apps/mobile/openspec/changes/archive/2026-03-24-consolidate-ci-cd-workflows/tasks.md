## 1. GitHub Pages 工作流整合

- [x] [P] 1.1 建立 `deploy-pages.yml`，將 validate job（圖片引用驗證）與 deploy job（Pages 部署）合併為單一工作流，deploy 透過 `needs: [validate]` 依賴驗證結果（deploy-pages.yml 合併策略、PR 觸發排除 deploy-pages.yml）
- [x] [P] 1.2 刪除 `cd.yml`

## 2. Flutter CI 管線

- [x] [P] 2.1 改寫 `ci.yml` 為 Flutter 專案驗證工作流，設定 Flutter CI 觸發條件（`lib/**`、`test/**`、`pubspec.yaml`、`pubspec.lock`、`analysis_options.yaml`）
- [x] 2.2 加入 Flutter CI 步驟：checkout → flutter-action → pub get → flutter analyze → dart format --set-exit-if-changed

## 3. 驗證

- [x] 3.1 確認兩個 workflow 語法正確（`actionlint` 或 YAML 結構檢查）
