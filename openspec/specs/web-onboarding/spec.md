# web-onboarding Specification

## Purpose

Web 版首次操作教學卡——首次造訪時的 modal overlay 教學卡、localStorage 偵測首次造訪、Escape 鍵關閉、i18n 多語系支援。

## Requirements

### Requirement: First-visit onboarding card

The HomePage SHALL display a modal overlay onboarding card when the user opens the Web app for the first time in the current browser. The onboarding card SHALL explain the complete usage flow: pasting a Naver Blog URL, the system extracting photos and navigating to the gallery page, and browsing/selecting/downloading photos. The card SHALL include a dismiss button labeled with a localized "Start" text. Pressing Escape SHALL also dismiss the card.

#### Scenario: First visit shows onboarding card

- **WHEN** a user opens the Web app homepage and `localStorage` does not contain `hasSeenOnboarding`
- **THEN** a modal overlay onboarding card is displayed with usage instructions

#### Scenario: Dismiss onboarding card

- **WHEN** the user clicks the "Start" button on the onboarding card
- **THEN** the card closes, `hasSeenOnboarding` is set to `"true"` in `localStorage`, and the homepage input form is visible

#### Scenario: Escape key dismisses onboarding card

- **WHEN** the user presses Escape while the onboarding card is visible
- **THEN** the card closes and `hasSeenOnboarding` is persisted to `localStorage`

#### Scenario: Returning visit does not show onboarding card

- **WHEN** a user opens the Web app homepage and `localStorage` contains `hasSeenOnboarding` set to `"true"`
- **THEN** the onboarding card is not displayed


<!-- @trace
source: web-onboarding-version-display
updated: 2026-04-16
code:
  - apps/web/src/components/onboarding/OnboardingCard.tsx
  - apps/web/src/pages/HomePage.tsx
  - apps/web/src/lib/stores/use-settings-store.ts
-->


<!-- @trace
source: web-onboarding-version-display
updated: 2026-04-16
code:
  - apps/web/src/lib/i18n/messages/zh-TW.json
  - apps/web/src/lib/i18n/messages/en.json
  - apps/web/src/vite-env.d.ts
  - apps/web/src/lib/i18n/messages/ko.json
  - apps/web/src/lib/i18n/messages/ja.json
  - apps/web/src/pages/HomePage.tsx
  - apps/web/vite.config.ts
  - apps/web/src/components/layout/RootLayout.tsx
  - apps/web/package.json
  - apps/web/src/lib/stores/use-settings-store.ts
  - apps/web/src/components/onboarding/OnboardingCard.tsx
tests:
  - apps/web/src/__tests__/components/onboarding/OnboardingCard.test.tsx
  - apps/web/src/__tests__/components/layout/RootLayout.test.tsx
  - apps/web/src/__tests__/pages/HomePage.test.tsx
-->

---
### Requirement: Onboarding card i18n support

The onboarding card content SHALL be fully localized using react-i18next. Translation keys SHALL be provided for all four supported locales: zh-TW, en, ja, ko. Keys SHALL include `onboardingTitle`, `onboardingDesc`, and `onboardingStart`.

#### Scenario: Language switch updates onboarding text

- **WHEN** the user switches locale to English while the onboarding card is visible
- **THEN** the card title, description, and button text update to English

<!-- @trace
source: web-onboarding-version-display
updated: 2026-04-16
code:
  - apps/web/src/components/onboarding/OnboardingCard.tsx
  - apps/web/src/lib/i18n/messages/zh-TW.json
  - apps/web/src/lib/i18n/messages/en.json
  - apps/web/src/lib/i18n/messages/ja.json
  - apps/web/src/lib/i18n/messages/ko.json
-->

<!-- @trace
source: web-onboarding-version-display
updated: 2026-04-16
code:
  - apps/web/src/lib/i18n/messages/zh-TW.json
  - apps/web/src/lib/i18n/messages/en.json
  - apps/web/src/vite-env.d.ts
  - apps/web/src/lib/i18n/messages/ko.json
  - apps/web/src/lib/i18n/messages/ja.json
  - apps/web/src/pages/HomePage.tsx
  - apps/web/vite.config.ts
  - apps/web/src/components/layout/RootLayout.tsx
  - apps/web/package.json
  - apps/web/src/lib/stores/use-settings-store.ts
  - apps/web/src/components/onboarding/OnboardingCard.tsx
tests:
  - apps/web/src/__tests__/components/onboarding/OnboardingCard.test.tsx
  - apps/web/src/__tests__/components/layout/RootLayout.test.tsx
  - apps/web/src/__tests__/pages/HomePage.test.tsx
-->