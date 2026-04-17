# web-intro-mobile Specification

## Purpose

TBD - created by archiving change 'unify-landing-in-apps-web'. Update Purpose after archive.

## Requirements

### Requirement: Mobile app intro page at /intro/mobile

The Web app SHALL render `IntroMobilePage` at the `/intro/mobile` route within `PublicLayout`. The page SHALL introduce the Flutter mobile App and replicate the content previously served by `docs/mobile/index.html`.

The page SHALL contain these sections in order:

- Hero section with title, tagline, phone mockup image, and two CTAs ("Get it" and "Learn more")
- Features grid with four feature cards: batch download, gallery browsing, caching, async downloads
- How-it-works section with four numbered steps: paste URL, extract photos, browse gallery, download
- Screenshots section with iOS/Android tabs and a 4-image carousel per platform showing input, gallery, detail, and settings views
- Download section with App Store and Google Play download badges (shown as "Coming Soon" placeholders until apps are published)

All 8 screenshot images SHALL be served from `apps/web/public/intro/mobile/` with filenames `{view}_view_{platform}_snapshot.png` where `view` is one of `blog_input`, `photo_gallery`, `photo_detail`, `setting` and `platform` is one of `ios`, `android`.

#### Scenario: Mobile intro page renders all sections

- **WHEN** user navigates to `/intro/mobile`
- **THEN** `IntroMobilePage` renders hero, features grid, how-it-works, screenshots, and download sections in that order

#### Scenario: Screenshot images load from public path

- **WHEN** `IntroMobilePage` renders the screenshots section
- **THEN** each `<img>` element has a `src` that resolves under `{BASE_URL}intro/mobile/{view}_view_{platform}_snapshot.png`


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
### Requirement: iOS/Android platform tab switching

The screenshots section SHALL provide two tabs labeled "iOS" and "Android". Selecting a tab SHALL update all 4 displayed screenshots to the corresponding platform's images without page reload. The iOS tab SHALL be active by default.

#### Scenario: Default tab is iOS

- **WHEN** `IntroMobilePage` first renders on a cold visit
- **THEN** the iOS tab is active and the 4 `_ios_snapshot.png` images are displayed

#### Scenario: Switch to Android tab

- **WHEN** user clicks the "Android" tab
- **THEN** the 4 displayed images update to `_android_snapshot.png` variants without page reload and the Android tab is marked active

#### Scenario: Switch back to iOS tab

- **WHEN** user clicks the "iOS" tab after viewing Android
- **THEN** the 4 displayed images update back to `_ios_snapshot.png` variants and the iOS tab is marked active


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
### Requirement: Mobile intro page i18n for four locales

All text content SHALL be sourced from i18n keys under the `intro.mobile.*` namespace. All four supported locales (`zh-TW`, `en`, `ja`, `ko`) SHALL have full translations for every key referenced by `IntroMobilePage`. The `ja` locale MAY contain machine-translated placeholder content, which SHALL be clearly marked in the PR description as pending native-speaker review.

The namespace SHALL include sub-namespaces: `intro.mobile.nav.*`, `intro.mobile.hero.*`, `intro.mobile.features.*`, `intro.mobile.howItWorks.*`, `intro.mobile.screenshots.*`, `intro.mobile.download.*`.

#### Scenario: Korean locale translations exist

- **WHEN** user switches to `ko` while on `/intro/mobile`
- **THEN** all visible text in all sections updates to Korean translations without showing any raw i18n keys or English fallbacks

#### Scenario: Machine-translated Japanese renders without console warnings

- **WHEN** user switches to `ja` while on `/intro/mobile`
- **THEN** all visible text updates to the placeholder Japanese content (no raw key exposure) and the browser console shows no `react-i18next` missing-key warnings


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
### Requirement: Anchor navigation in IntroNav

When rendered on `/intro/mobile`, `IntroNav` SHALL include in-page anchor links to the four main sections: features, how-it-works, screenshots, download. Clicking an anchor link SHALL smooth-scroll to the corresponding section.

#### Scenario: Anchor link scrolls to section

- **WHEN** user clicks the "Features" anchor link in the IntroNav on `/intro/mobile`
- **THEN** the viewport smooth-scrolls to the features section such that the section heading is visible in the viewport

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