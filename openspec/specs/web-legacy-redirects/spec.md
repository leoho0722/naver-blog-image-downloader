# web-legacy-redirects Specification

## Purpose

舊 URL 相容規則 —— Web SPA 從 `/web/app/` 遷移至 `/app/web` 後，對使用者可能書籤或外部引用的舊路徑以 React Router `<Navigate replace>` 做相容；依「冷啟是否可獨立運作」分類：可冷啟入口（`/web` → `/intro/web`、`/web/app` → `/app/web`）直接對應新路徑；依賴 SPA in-memory state 的舊深連結（`/web/app/gallery/:blogId`）redirect 到最近可冷啟父層 `/app/web`，不接 blogId。並定義 GitHub Pages 所需的 `404.html` SPA fallback。

## Requirements

### Requirement: Legacy URL redirects via React Router Navigate

The app SHALL define legacy URL redirects in `routes.tsx` using React Router's `<Navigate replace>` element to preserve compatibility for URLs that users may have bookmarked or shared while the app was deployed under the `/web/app/` sub-path.

The following redirects SHALL be in effect:

- `/web` → `/intro/web` (the web intro page)
- `/web/app` → `/app/web` (the Web SPA entry)
- `/web/app/gallery/:blogId` → `/app/web` (NOT `/app/web/gallery/:blogId`; the `blogId` SHALL be dropped)

All redirects SHALL use `replace` so the legacy URL does not stay in browser history.

#### Scenario: /web redirects to /intro/web

- **WHEN** user navigates to `/web`
- **THEN** the browser immediately navigates to `/intro/web` via `replace` (the back button does not return to `/web`)

#### Scenario: /web/app redirects to /app/web

- **WHEN** user navigates to `/web/app`
- **THEN** the browser immediately navigates to `/app/web` via `replace`

#### Scenario: /web/app/gallery/:blogId redirects to /app/web without blogId

- **WHEN** user navigates to `/web/app/gallery/abc123def456`
- **THEN** the browser immediately navigates to `/app/web` via `replace`, NOT `/app/web/gallery/abc123def456`


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
### Requirement: No redirect for deep links that require SPA state

The app SHALL NOT add a redirect for any URL pattern whose new equivalent requires in-memory SPA state to render correctly. Specifically, `/web/app/gallery/:blogId` SHALL redirect to the SPA entry `/app/web` (not to `/app/web/gallery/:blogId`), because a cold-loaded `GalleryPage` has no photos state and would immediately fallback to `/app/web` anyway.

#### Scenario: Redirecting to a deep path with required state is forbidden

- **WHEN** a legacy URL pattern's new path would require state not present at cold load (e.g., `photos` array for `GalleryPage`)
- **THEN** the redirect target SHALL be the nearest parent path that can cold-start (e.g., `/app/web`), not the deep path


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
### Requirement: SPA fallback for direct URL entry on GitHub Pages

The `deploy-pages.yml` workflow SHALL copy `apps/web/dist/index.html` to `404.html` in the Pages artifact. When GitHub Pages receives a request for any path not matching a static file, it SHALL respond with `404.html` (which is the SPA entry), allowing React Router to take over client-side and render the matching route (including legacy redirects). Users SHALL NOT see GitHub Pages' default 404 page for any path handled by the SPA.

#### Scenario: Direct URL for /intro/mobile loads correctly

- **WHEN** a user opens `https://leoho0722.github.io/naver-blog-image-downloader/intro/mobile` directly (not via in-app navigation)
- **THEN** GitHub Pages serves `404.html` (the SPA entry), React Router matches `/intro/mobile`, and `IntroMobilePage` renders; the user does NOT see GitHub's default 404 page

#### Scenario: Direct URL for legacy /web/app triggers redirect

- **WHEN** a user opens `https://leoho0722.github.io/naver-blog-image-downloader/web/app` directly
- **THEN** GitHub Pages serves `404.html`, the SPA loads, React Router matches the `/web/app` route and `<Navigate replace to="/app/web" />` redirects the URL to `/app/web`, and `HomePage` renders

#### Scenario: Unknown path renders custom NotFoundPage

- **WHEN** a user opens `https://leoho0722.github.io/naver-blog-image-downloader/nonexistent` directly
- **THEN** GitHub Pages serves `404.html`, the SPA loads, React Router matches the `*` catch-all, and the custom `NotFoundPage` renders within `PublicLayout`; the user does NOT see GitHub's default 404 page

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