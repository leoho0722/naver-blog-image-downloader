# web-intro-web Specification

## Purpose

Web 版介紹頁（`/intro/web`）—— 位於 PublicLayout 下，介紹 Web 下載器並取代原 `docs/web/index.html`。含 back link、title、tagline、四張 feature cards（URL 輸入、照片牆、批次下載、多語系）、主 CTA 以 React Router `<Link>` 同站 navigate 到 `/app/web`、技術棧標示，支援四語系。

## Requirements

### Requirement: Web version intro page at /intro/web

The Web app SHALL render `IntroWebPage` at the `/intro/web` route within `PublicLayout`. The page SHALL introduce the Web version of the downloader and replace the content previously served by `docs/web/index.html`.

The page SHALL contain:

- A back link to `/` labeled from `intro.web.back`
- Title from `intro.web.title` and tagline from `intro.web.tagline`
- Four feature cards describing: URL input, photo grid, batch download, and i18n (keys `intro.web.featureUrl`, `intro.web.featureGrid`, `intro.web.featureBatch`, `intro.web.featureI18n`)
- A primary CTA labeled from `intro.web.cta` that navigates to `/app/web` as a same-site React Router `<Link>` (not a full-page `window.open` or external URL)
- A technology stack line from `intro.web.tech`

#### Scenario: Web intro page renders

- **WHEN** user navigates to `/intro/web`
- **THEN** `IntroWebPage` renders the back link, title, tagline, four feature cards, CTA button, and tech stack line

#### Scenario: CTA navigates to Web SPA without page reload

- **WHEN** user clicks the primary CTA on `/intro/web`
- **THEN** the browser navigates to `/app/web` using React Router client-side routing (no full page reload)

#### Scenario: Back link returns to root landing

- **WHEN** user clicks the back link on `/intro/web`
- **THEN** the browser navigates to `/`


<!-- @trace
source: unify-landing-in-apps-web
updated: 2026-04-18
code:
  - apps/web/src/lib/i18n/messages/ko.json
  - apps/web/src/components/layout/RootLayout.tsx
  - apps/web/src/pages/HomePage.tsx
  - apps/web/public/intro/mobile/photo_gallery_view_android_snapshot.png
  - apps/web/src/routes.tsx
  - docs/mobile/images/setting_view_ios_snapshot.png
  - apps/web/src/components/intro/ScreenshotCarousel.tsx
  - docs/web/index.html
  - apps/web/public/intro/mobile/photo_detail_view_ios_snapshot.png
  - apps/web/public/intro/mobile/setting_view_ios_snapshot.png
  - docs/mobile/images/photo_gallery_view_android_snapshot.png
  - docs/mobile/images/photo_gallery_view_ios_snapshot.png
  - apps/web/public/intro/mobile/blog_input_view_ios_snapshot.png
  - docs/mobile/index.html
  - apps/web/src/pages/intro/IntroRootPage.tsx
  - apps/web/public/intro/mobile/blog_input_view_android_snapshot.png
  - apps/web/src/components/layout/AppLayout.tsx
  - docs/mobile/css/style.css
  - docs/mobile/js/main.js
  - docs/mobile/images/photo_detail_view_android_snapshot.png
  - .github/workflows/deploy-pages.yml
  - apps/web/src/lib/i18n/messages/en.json
  - apps/web/src/pages/GalleryPage.tsx
  - apps/web/src/lib/i18n/messages/ja.json
  - apps/web/src/lib/stores/use-settings-store.ts
  - apps/web/src/components/intro/DownloadBadge.tsx
  - apps/web/public/intro/mobile/setting_view_android_snapshot.png
  - apps/web/public/intro/mobile/photo_detail_view_android_snapshot.png
  - apps/web/src/pages/intro/IntroMobilePage.tsx
  - apps/web/src/components/intro/FeatureCard.tsx
  - docs/mobile/images/setting_view_android_snapshot.png
  - docs/mobile/images/blog_input_view_android_snapshot.png
  - docs/mobile/images/blog_input_view_ios_snapshot.png
  - apps/web/src/components/layout/ThemeLocaleControls.tsx
  - README.md
  - apps/web/CLAUDE.md
  - apps/web/src/lib/i18n/messages/zh-TW.json
  - apps/web/src/components/layout/PublicLayout.tsx
  - docs/mobile/images/photo_detail_view_ios_snapshot.png
  - apps/web/src/App.tsx
  - apps/web/package.json
  - docs/index.html
  - docs/mobile/mobile-architecture.md
  - apps/web/src/components/intro/IntroFooter.tsx
  - apps/web/src/pages/NotFoundPage.tsx
  - docs/mobile/js/i18n.js
  - apps/web/src/lib/config/ui-controls.ts
  - apps/web/src/components/intro/IntroNav.tsx
  - apps/web/src/components/intro/StepCard.tsx
  - apps/web/src/pages/intro/IntroWebPage.tsx
  - apps/web/public/intro/mobile/photo_gallery_view_ios_snapshot.png
  - apps/web/src/lib/config/public-navigation.ts
tests:
  - apps/web/src/__tests__/components/intro/DownloadBadge.test.tsx
  - apps/web/src/__tests__/pages/HomePage.test.tsx
  - apps/web/src/__tests__/routes.test.tsx
  - apps/web/src/__tests__/lib/i18n/intro-parity.test.ts
  - apps/web/src/__tests__/components/layout/AppLayout.test.tsx
  - apps/web/src/__tests__/components/layout/PublicLayout.test.tsx
  - apps/web/src/__tests__/components/layout/RootLayout.test.tsx
-->

---
### Requirement: Web intro page i18n for four locales

All text content SHALL be sourced from i18n keys under the `intro.web.*` namespace. All four supported locales (`zh-TW`, `en`, `ja`, `ko`) SHALL have full translations for every key referenced by `IntroWebPage`. The `ja` locale MAY contain machine-translated placeholder content, which SHALL be clearly marked in the PR description as pending native-speaker review.

#### Scenario: Language switch updates all web intro text

- **WHEN** user switches from `zh-TW` to `ko` while on `/intro/web`
- **THEN** all text content (back link, title, tagline, feature cards, CTA, tech stack) updates to Korean immediately without page reload

<!-- @trace
source: unify-landing-in-apps-web
updated: 2026-04-18
code:
  - apps/web/src/lib/i18n/messages/ko.json
  - apps/web/src/components/layout/RootLayout.tsx
  - apps/web/src/pages/HomePage.tsx
  - apps/web/public/intro/mobile/photo_gallery_view_android_snapshot.png
  - apps/web/src/routes.tsx
  - docs/mobile/images/setting_view_ios_snapshot.png
  - apps/web/src/components/intro/ScreenshotCarousel.tsx
  - docs/web/index.html
  - apps/web/public/intro/mobile/photo_detail_view_ios_snapshot.png
  - apps/web/public/intro/mobile/setting_view_ios_snapshot.png
  - docs/mobile/images/photo_gallery_view_android_snapshot.png
  - docs/mobile/images/photo_gallery_view_ios_snapshot.png
  - apps/web/public/intro/mobile/blog_input_view_ios_snapshot.png
  - docs/mobile/index.html
  - apps/web/src/pages/intro/IntroRootPage.tsx
  - apps/web/public/intro/mobile/blog_input_view_android_snapshot.png
  - apps/web/src/components/layout/AppLayout.tsx
  - docs/mobile/css/style.css
  - docs/mobile/js/main.js
  - docs/mobile/images/photo_detail_view_android_snapshot.png
  - .github/workflows/deploy-pages.yml
  - apps/web/src/lib/i18n/messages/en.json
  - apps/web/src/pages/GalleryPage.tsx
  - apps/web/src/lib/i18n/messages/ja.json
  - apps/web/src/lib/stores/use-settings-store.ts
  - apps/web/src/components/intro/DownloadBadge.tsx
  - apps/web/public/intro/mobile/setting_view_android_snapshot.png
  - apps/web/public/intro/mobile/photo_detail_view_android_snapshot.png
  - apps/web/src/pages/intro/IntroMobilePage.tsx
  - apps/web/src/components/intro/FeatureCard.tsx
  - docs/mobile/images/setting_view_android_snapshot.png
  - docs/mobile/images/blog_input_view_android_snapshot.png
  - docs/mobile/images/blog_input_view_ios_snapshot.png
  - apps/web/src/components/layout/ThemeLocaleControls.tsx
  - README.md
  - apps/web/CLAUDE.md
  - apps/web/src/lib/i18n/messages/zh-TW.json
  - apps/web/src/components/layout/PublicLayout.tsx
  - docs/mobile/images/photo_detail_view_ios_snapshot.png
  - apps/web/src/App.tsx
  - apps/web/package.json
  - docs/index.html
  - docs/mobile/mobile-architecture.md
  - apps/web/src/components/intro/IntroFooter.tsx
  - apps/web/src/pages/NotFoundPage.tsx
  - docs/mobile/js/i18n.js
  - apps/web/src/lib/config/ui-controls.ts
  - apps/web/src/components/intro/IntroNav.tsx
  - apps/web/src/components/intro/StepCard.tsx
  - apps/web/src/pages/intro/IntroWebPage.tsx
  - apps/web/public/intro/mobile/photo_gallery_view_ios_snapshot.png
  - apps/web/src/lib/config/public-navigation.ts
tests:
  - apps/web/src/__tests__/components/intro/DownloadBadge.test.tsx
  - apps/web/src/__tests__/pages/HomePage.test.tsx
  - apps/web/src/__tests__/routes.test.tsx
  - apps/web/src/__tests__/lib/i18n/intro-parity.test.ts
  - apps/web/src/__tests__/components/layout/AppLayout.test.tsx
  - apps/web/src/__tests__/components/layout/PublicLayout.test.tsx
  - apps/web/src/__tests__/components/layout/RootLayout.test.tsx
-->