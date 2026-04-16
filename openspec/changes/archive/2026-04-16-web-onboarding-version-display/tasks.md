## 1. Build-time app version injection 版號注入

- [x] 1.1 實作 Build-time app version injection：修改 `apps/web/vite.config.ts`，import `package.json` 並透過 `define` 注入 `__APP_VERSION__` 常數
- [x] 1.2 新增或修改 `apps/web/src/vite-env.d.ts`：宣告 `declare const __APP_VERSION__: string`
- [x] 1.3 修改 `apps/web/src/components/layout/RootLayout.tsx`：在 header app title 旁以 `text-xs` + `color-on-surface-variant` 顯示 `v${__APP_VERSION__}`

## 2. Onboarding seen flag persistence 教學旗標持久化

- [x] 2.1 實作 Onboarding seen flag persistence：修改 `apps/web/src/lib/stores/use-settings-store.ts`，新增 `hasSeenOnboarding` state（從 localStorage 讀取，預設 `false`）與 `dismissOnboarding()` action（寫入 localStorage 並更新 store）

## 3. First-visit onboarding card 首次教學卡

- [x] 3.1 實作 First-visit onboarding card：新增 `apps/web/src/components/onboarding/OnboardingCard.tsx`，modal overlay 教學卡元件，複用 `DownloadProgress.tsx` 的 overlay 模式（`fixed inset-0 z-50` + backdrop blur + centered card + `role="dialog"` + `aria-modal="true"`），包含標題、說明文字、「開始使用」按鈕，支援 Escape 鍵關閉，呼叫 `dismissOnboarding()` 進行關閉
- [x] 3.2 修改 `apps/web/src/pages/HomePage.tsx`：從 `useSettingsStore` 讀取 `hasSeenOnboarding`，為 `false` 時 render `<OnboardingCard />`

## 4. Onboarding card i18n support 教學卡多語系

- [x] 4.1 實作 Onboarding card i18n support：修改 `apps/web/src/lib/i18n/messages/zh-TW.json`，新增 `onboardingTitle`、`onboardingDesc`、`onboardingStart` 三個 key
- [x] 4.2 修改 `apps/web/src/lib/i18n/messages/en.json`：新增對應英文翻譯
- [x] 4.3 修改 `apps/web/src/lib/i18n/messages/ja.json`：新增對應日文翻譯
- [x] 4.4 修改 `apps/web/src/lib/i18n/messages/ko.json`：新增對應韓文翻譯

## 5. 版號與驗證

- [x] 5.1 修改 `apps/web/package.json`：minor bump `1.0.1` → `1.1.0`
- [x] 5.2 執行 `pnpm build` 確認 TypeScript 編譯通過
- [x] 5.3 執行 `pnpm test` 確認全部測試通過
