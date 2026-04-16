## Why

Web v1.0.1 已上線但缺乏新手引導。使用者首次開啟頁面時不清楚如何操作（貼上網址、擷取圖片、下載），需要一個簡單的操作教學。同時頁面上沒有顯示版本號，不利於除錯和使用者回報問題。

## What Changes

- **首次操作教學卡**：使用者首次在該瀏覽器開啟 Web 版首頁時，顯示一張 modal overlay 教學卡，說明完整操作流程（貼上網址 → 擷取圖片 → 瀏覽下載）。點擊「開始使用」後關閉並寫入 localStorage，之後不再顯示。不提供手動重新開啟入口。
- **版本號顯示**：在 RootLayout header 以小字顯示 `v<semver>`，版號透過 Vite build-time define 從 `package.json` 注入，所有頁面一致可見。

## Non-Goals

- 不做多步驟導覽 wizard（單卡已足夠涵蓋 App 的操作流程）
- 不提供手動重新開啟教學的入口（App UI 本身已足夠直覺）
- 不做 version-based 再次顯示 onboarding 邏輯
- 不新增後端 API（純前端實作）

## Capabilities

### New Capabilities

- `web-onboarding`: Web 版首次操作教學卡——localStorage 偵測首次造訪、modal overlay 教學卡、i18n 支援、dismiss 持久化

### Modified Capabilities

- `web-app-foundation`: 新增 Vite build-time define 注入 `__APP_VERSION__` 常數，RootLayout header 顯示版本號
- `web-settings`: 新增 `hasSeenOnboarding` 旗標與 `dismissOnboarding()` action 到 settings store

## Impact

- 受影響程式碼：
  - `apps/web/vite.config.ts`（define 注入版號）
  - `apps/web/src/vite-env.d.ts`（型別宣告）
  - `apps/web/src/lib/stores/use-settings-store.ts`（onboarding 狀態）
  - `apps/web/src/components/onboarding/OnboardingCard.tsx`（新增）
  - `apps/web/src/pages/HomePage.tsx`（render 教學卡）
  - `apps/web/src/components/layout/RootLayout.tsx`（顯示版號）
  - `apps/web/src/lib/i18n/messages/{zh-TW,en,ja,ko}.json`（新增 i18n key）
  - `apps/web/package.json`（版號 `1.0.1` → `1.1.0`）
