## Context

目前專案有兩個 GitHub Actions workflow 檔案：

- `ci.yml`（"CI — Validate GitHub Pages"）：僅在 `docs/**` 變更時觸發，驗證 HTML 圖片引用是否存在
- `cd.yml`（"CD — Deploy GitHub Pages"）：透過 `workflow_run` 監聽 CI 完成後觸發部署

兩者皆服務於 GitHub Pages，Flutter 程式碼變更缺少自動化品質檢查。

## Goals / Non-Goals

**Goals:**

- 將 Pages 驗證與部署整合為單一 `deploy-pages.yml`，以 job 依賴取代 `workflow_run` 跨 workflow 觸發
- 將 `ci.yml` 改為 Flutter 專案驗證管線，涵蓋 `flutter analyze` 與 `dart format` 檢查
- 刪除不再需要的 `cd.yml`

**Non-Goals:**

- 不涵蓋 Flutter 單元測試 / Widget 測試（後續可擴充）
- 不涵蓋 Flutter build / release 流程
- 不調整 GitHub Pages 的 source 設定或 docs 目錄結構

## Decisions

### deploy-pages.yml 合併策略

將原 CI 的圖片引用驗證作為 `validate` job，部署作為 `deploy` job 並設定 `needs: [validate]`。觸發條件維持 `push` 至 main 的 `docs/**` 路徑與 `workflow_dispatch`。

不再需要 `workflow_run` 機制，減少跨 workflow 觸發的複雜度與除錯成本。`deploy` job 的 `if` 條件簡化為僅需檢查是否為 `push` 事件或 `workflow_dispatch`。

### Flutter CI 觸發條件

`ci.yml` 於 `push`（main）與 `pull_request`（main）時觸發，僅在 Flutter 相關路徑變更時執行：

- `lib/**`
- `test/**`
- `pubspec.yaml`
- `pubspec.lock`
- `analysis_options.yaml`

排除 `docs/**` 避免與 `deploy-pages.yml` 重疊。

### Flutter CI 步驟

1. Checkout
2. 使用 `subosito/flutter-action` 設定 Flutter SDK（`stable` channel）
3. `flutter pub get`
4. `flutter analyze`
5. `dart format --set-exit-if-changed .`

依照專案開發規範，analyze 與 format 須同時通過。

### PR 觸發排除 deploy-pages.yml

`deploy-pages.yml` 不在 `pull_request` 事件觸發部署，僅保留 `push` 至 main 與 `workflow_dispatch`。PR 階段的 docs 驗證非必要——合併後再驗證部署即可。

## Risks / Trade-offs

- **[PR 缺少 docs 預覽驗證]** → 可接受，docs 變更頻率低且驗證邏輯簡單。未來有需要可在 `deploy-pages.yml` 加入 `pull_request` 觸發
- **[workflow 名稱變更影響 branch protection]** → 若 repo 有設定 required status checks 綁定舊 workflow 名稱，需同步更新。需確認後執行
- **[Flutter SDK 版本釘選]** → 使用 `stable` channel 而非固定版本號，避免維護成本但可能因 SDK 升級導致非預期失敗。短期可接受，長期可考慮釘版
