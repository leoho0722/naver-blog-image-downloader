# web-image-viewer Specification

## Purpose

Web 版全螢幕圖片檢視器——CSS transform 縮放平移、鍵盤導航、觸控手勢。

## Requirements

### Requirement: Full-screen image overlay

The ImageViewer SHALL render as a full-viewport overlay on top of the gallery. It SHALL display the current image using an `<img>` tag with the Naver CDN URL and `referrerPolicy="no-referrer"` to prevent Naver CDN from rejecting the request due to a non-Naver `Referer` header. A close button and photo counter (e.g., "3 / 15") SHALL be visible.

#### Scenario: Open image viewer from gallery

- **WHEN** user clicks a photo in the gallery (outside selection mode)
- **THEN** a full-viewport overlay appears showing the photo at full size with a close button and counter

#### Scenario: Close image viewer

- **WHEN** user clicks the close button
- **THEN** the overlay closes and the gallery is visible again

#### Scenario: Image loads with no referrer policy

- **WHEN** the image viewer displays a photo from Naver CDN on a non-Naver domain
- **THEN** the `<img>` tag includes `referrerPolicy="no-referrer"` and the image loads successfully


<!-- @trace
source: web-fix-state-reset-image-display
updated: 2026-04-16
code:
  - apps/web/src/components/gallery/PhotoCard.tsx
  - apps/web/src/lib/stores/use-blog-input-store.ts
  - apps/web/tsconfig.tsbuildinfo
  - apps/web/package.json
  - apps/web/src/pages/HomePage.tsx
  - apps/web/src/components/gallery/ImageViewer.tsx
tests:
  - apps/web/src/__tests__/pages/HomePage.test.tsx
-->

---
### Requirement: Zoom via CSS transforms

The ImageViewer SHALL support zoom using CSS `transform: scale()` and `translate()`. Mouse scroll wheel SHALL zoom in/out. Plus (+) and minus (-) keys SHALL zoom in/out. Double-click SHALL toggle between 1x and 2x zoom. Pinch-to-zoom SHALL be supported on touch devices.

#### Scenario: Zoom in with mouse wheel

- **WHEN** user scrolls the mouse wheel up on the image
- **THEN** the image scale increases (zoom in)

#### Scenario: Zoom with keyboard shortcuts

- **WHEN** user presses the `+` key
- **THEN** the image scale increases by one step

#### Scenario: Double-click toggle zoom

- **WHEN** user double-clicks the image at 1x zoom
- **THEN** the image zooms to 2x centered on the click point

#### Scenario: Pinch-to-zoom on touch device

- **WHEN** user performs a pinch-out gesture on the image
- **THEN** the image scale increases proportionally to the gesture


<!-- @trace
source: web-app-with-backend-packaging
updated: 2026-04-12
code:
  - apps/web/src/pages/GalleryPage.tsx
  - apps/web/tsconfig.tsbuildinfo
  - apps/web/src/lib/i18n/messages/ja.json
  - CLAUDE.md
  - apps/web/src/lib/services/url-validator.ts
  - apps/web/src/lib/services/blog-id.ts
  - apps/web/CLAUDE.md
  - apps/web/src/lib/stores/use-blog-input-store.ts
  - apps/web/index.html
  - apps/backend/src/data_models.py
  - apps/web/src/components/blog-input/BlogInputForm.tsx
  - apps/web/src/lib/i18n/messages/zh-TW.json
  - apps/backend/src/routes/photos.py
  - apps/web/package.json
  - apps/web/src/components/settings/LanguageSwitcher.tsx
  - apps/web/src/lib/api/photos.ts
  - apps/web/src/pages/NotFoundPage.tsx
  - apps/web/public/icons.svg
  - apps/web/src/components/gallery/ImageViewer.tsx
  - apps/web/src/components/gallery/SelectionToolbar.tsx
  - apps/backend/pyproject.toml
  - apps/backend/src/response_builder.py
  - apps/web/src/components/blog-input/FetchProgress.tsx
  - apps/web/src/lib/api/types.ts
  - apps/web/vite.config.ts
  - apps/web/src/components/layout/RootLayout.tsx
  - .github/workflows/web-ci.yml
  - apps/web/src/lib/hooks/use-clipboard.ts
  - apps/web/src/lib/api/client.ts
  - apps/web/src/App.tsx
  - apps/backend/README.md
  - apps/web/src/components/settings/SettingsDrawer.tsx
  - apps/backend/CLAUDE.md
  - apps/web/src/index.css
  - apps/web/src/components/settings/ThemeSwitcher.tsx
  - apps/web/src/routes.tsx
  - apps/web/src/lib/config/api.ts
  - apps/web/src/lib/stores/use-settings-store.ts
  - apps/web/tsconfig.json
  - apps/backend/requirements.txt
  - apps/web/.gitkeep
  - apps/web/public/icons/icon_new.png
  - README.md
  - apps/web/src/lib/i18n/messages/en.json
  - apps/backend/src/job_store/package.py
  - apps/web/.env.example
  - apps/web/public/icons/icon_default.png
  - apps/web/src/main.tsx
  - apps/web/src/lib/i18n/messages/ko.json
  - apps/web/src/pages/HomePage.tsx
  - apps/backend/.envExample
  - apps/web/public/favicon.svg
  - apps/web/src/lib/stores/use-gallery-store.ts
  - apps/web/src/components/gallery/PhotoGrid.tsx
  - apps/web/src/lib/i18n/config.ts
  - apps/backend/src/app.py
  - apps/web/src/lib/stores/use-download-store.ts
  - apps/web/src/lib/hooks/use-polling.ts
  - apps/backend/.env.example
  - apps/backend/src/job_store/__init__.py
  - apps/web/src/components/download/DownloadProgress.tsx
  - apps/web/src/components/gallery/PhotoCard.tsx
tests:
  - apps/web/src/__tests__/components/gallery/PhotoCard.test.tsx
  - apps/web/src/__tests__/lib/services/blog-id.test.ts
  - apps/backend/tests/api.http
  - apps/web/src/__tests__/lib/hooks/use-polling.test.ts
  - apps/web/src/__tests__/lib/services/url-validator.test.ts
  - apps/web/src/__tests__/lib/stores/use-gallery-store.test.ts
  - apps/web/src/__tests__/lib/api/client.test.ts
  - apps/web/src/__tests__/setup.ts
-->

---
### Requirement: Pan zoomed images

The ImageViewer SHALL allow panning (dragging) when the image is zoomed beyond 1x. Panning SHALL use CSS `transform: translate()` and respond to mouse drag and touch drag events.

#### Scenario: Pan zoomed image with mouse

- **WHEN** user clicks and drags on a zoomed image
- **THEN** the visible portion of the image moves with the drag direction


<!-- @trace
source: web-app-with-backend-packaging
updated: 2026-04-12
code:
  - apps/web/src/pages/GalleryPage.tsx
  - apps/web/tsconfig.tsbuildinfo
  - apps/web/src/lib/i18n/messages/ja.json
  - CLAUDE.md
  - apps/web/src/lib/services/url-validator.ts
  - apps/web/src/lib/services/blog-id.ts
  - apps/web/CLAUDE.md
  - apps/web/src/lib/stores/use-blog-input-store.ts
  - apps/web/index.html
  - apps/backend/src/data_models.py
  - apps/web/src/components/blog-input/BlogInputForm.tsx
  - apps/web/src/lib/i18n/messages/zh-TW.json
  - apps/backend/src/routes/photos.py
  - apps/web/package.json
  - apps/web/src/components/settings/LanguageSwitcher.tsx
  - apps/web/src/lib/api/photos.ts
  - apps/web/src/pages/NotFoundPage.tsx
  - apps/web/public/icons.svg
  - apps/web/src/components/gallery/ImageViewer.tsx
  - apps/web/src/components/gallery/SelectionToolbar.tsx
  - apps/backend/pyproject.toml
  - apps/backend/src/response_builder.py
  - apps/web/src/components/blog-input/FetchProgress.tsx
  - apps/web/src/lib/api/types.ts
  - apps/web/vite.config.ts
  - apps/web/src/components/layout/RootLayout.tsx
  - .github/workflows/web-ci.yml
  - apps/web/src/lib/hooks/use-clipboard.ts
  - apps/web/src/lib/api/client.ts
  - apps/web/src/App.tsx
  - apps/backend/README.md
  - apps/web/src/components/settings/SettingsDrawer.tsx
  - apps/backend/CLAUDE.md
  - apps/web/src/index.css
  - apps/web/src/components/settings/ThemeSwitcher.tsx
  - apps/web/src/routes.tsx
  - apps/web/src/lib/config/api.ts
  - apps/web/src/lib/stores/use-settings-store.ts
  - apps/web/tsconfig.json
  - apps/backend/requirements.txt
  - apps/web/.gitkeep
  - apps/web/public/icons/icon_new.png
  - README.md
  - apps/web/src/lib/i18n/messages/en.json
  - apps/backend/src/job_store/package.py
  - apps/web/.env.example
  - apps/web/public/icons/icon_default.png
  - apps/web/src/main.tsx
  - apps/web/src/lib/i18n/messages/ko.json
  - apps/web/src/pages/HomePage.tsx
  - apps/backend/.envExample
  - apps/web/public/favicon.svg
  - apps/web/src/lib/stores/use-gallery-store.ts
  - apps/web/src/components/gallery/PhotoGrid.tsx
  - apps/web/src/lib/i18n/config.ts
  - apps/backend/src/app.py
  - apps/web/src/lib/stores/use-download-store.ts
  - apps/web/src/lib/hooks/use-polling.ts
  - apps/backend/.env.example
  - apps/backend/src/job_store/__init__.py
  - apps/web/src/components/download/DownloadProgress.tsx
  - apps/web/src/components/gallery/PhotoCard.tsx
tests:
  - apps/web/src/__tests__/components/gallery/PhotoCard.test.tsx
  - apps/web/src/__tests__/lib/services/blog-id.test.ts
  - apps/backend/tests/api.http
  - apps/web/src/__tests__/lib/hooks/use-polling.test.ts
  - apps/web/src/__tests__/lib/services/url-validator.test.ts
  - apps/web/src/__tests__/lib/stores/use-gallery-store.test.ts
  - apps/web/src/__tests__/lib/api/client.test.ts
  - apps/web/src/__tests__/setup.ts
-->

---
### Requirement: Navigate between photos

The ImageViewer SHALL support navigating to the previous/next photo. Left arrow key and left swipe gesture SHALL go to the previous photo. Right arrow key and right swipe gesture SHALL go to the next photo. Navigation SHALL reset zoom to 1x.

#### Scenario: Navigate with arrow keys

- **WHEN** user presses the right arrow key while viewing photo 3 of 15
- **THEN** the viewer displays photo 4 of 15 and the counter updates

#### Scenario: Navigate with swipe gesture

- **WHEN** user swipes left on a touch device
- **THEN** the viewer displays the next photo

#### Scenario: Navigate resets zoom

- **WHEN** user is zoomed to 3x and presses the right arrow key
- **THEN** the next photo is displayed at 1x zoom

#### Scenario: Close with Escape key

- **WHEN** user presses the Escape key
- **THEN** the image viewer closes

<!-- @trace
source: web-app-with-backend-packaging
updated: 2026-04-12
code:
  - apps/web/src/pages/GalleryPage.tsx
  - apps/web/tsconfig.tsbuildinfo
  - apps/web/src/lib/i18n/messages/ja.json
  - CLAUDE.md
  - apps/web/src/lib/services/url-validator.ts
  - apps/web/src/lib/services/blog-id.ts
  - apps/web/CLAUDE.md
  - apps/web/src/lib/stores/use-blog-input-store.ts
  - apps/web/index.html
  - apps/backend/src/data_models.py
  - apps/web/src/components/blog-input/BlogInputForm.tsx
  - apps/web/src/lib/i18n/messages/zh-TW.json
  - apps/backend/src/routes/photos.py
  - apps/web/package.json
  - apps/web/src/components/settings/LanguageSwitcher.tsx
  - apps/web/src/lib/api/photos.ts
  - apps/web/src/pages/NotFoundPage.tsx
  - apps/web/public/icons.svg
  - apps/web/src/components/gallery/ImageViewer.tsx
  - apps/web/src/components/gallery/SelectionToolbar.tsx
  - apps/backend/pyproject.toml
  - apps/backend/src/response_builder.py
  - apps/web/src/components/blog-input/FetchProgress.tsx
  - apps/web/src/lib/api/types.ts
  - apps/web/vite.config.ts
  - apps/web/src/components/layout/RootLayout.tsx
  - .github/workflows/web-ci.yml
  - apps/web/src/lib/hooks/use-clipboard.ts
  - apps/web/src/lib/api/client.ts
  - apps/web/src/App.tsx
  - apps/backend/README.md
  - apps/web/src/components/settings/SettingsDrawer.tsx
  - apps/backend/CLAUDE.md
  - apps/web/src/index.css
  - apps/web/src/components/settings/ThemeSwitcher.tsx
  - apps/web/src/routes.tsx
  - apps/web/src/lib/config/api.ts
  - apps/web/src/lib/stores/use-settings-store.ts
  - apps/web/tsconfig.json
  - apps/backend/requirements.txt
  - apps/web/.gitkeep
  - apps/web/public/icons/icon_new.png
  - README.md
  - apps/web/src/lib/i18n/messages/en.json
  - apps/backend/src/job_store/package.py
  - apps/web/.env.example
  - apps/web/public/icons/icon_default.png
  - apps/web/src/main.tsx
  - apps/web/src/lib/i18n/messages/ko.json
  - apps/web/src/pages/HomePage.tsx
  - apps/backend/.envExample
  - apps/web/public/favicon.svg
  - apps/web/src/lib/stores/use-gallery-store.ts
  - apps/web/src/components/gallery/PhotoGrid.tsx
  - apps/web/src/lib/i18n/config.ts
  - apps/backend/src/app.py
  - apps/web/src/lib/stores/use-download-store.ts
  - apps/web/src/lib/hooks/use-polling.ts
  - apps/backend/.env.example
  - apps/backend/src/job_store/__init__.py
  - apps/web/src/components/download/DownloadProgress.tsx
  - apps/web/src/components/gallery/PhotoCard.tsx
tests:
  - apps/web/src/__tests__/components/gallery/PhotoCard.test.tsx
  - apps/web/src/__tests__/lib/services/blog-id.test.ts
  - apps/backend/tests/api.http
  - apps/web/src/__tests__/lib/hooks/use-polling.test.ts
  - apps/web/src/__tests__/lib/services/url-validator.test.ts
  - apps/web/src/__tests__/lib/stores/use-gallery-store.test.ts
  - apps/web/src/__tests__/lib/api/client.test.ts
  - apps/web/src/__tests__/setup.ts
-->

---
### Requirement: Accessible image viewer controls

The ImageViewer thumbnail strip SHALL render each thumbnail as a `<button type="button">` whose accessible name comes from the localized key `viewerThumbnail` with the 1-based photo number, and the thumbnail of the photo currently shown SHALL carry `aria-current="true"`. Activating a thumbnail button with a pointer, Enter, or Space SHALL show that photo and reset zoom to 1x. Thumbnail images SHALL use `loading="lazy"` and `fetchpriority="low"` so that opening the viewer does not download every photo at once, and the main image SHALL use `fetchpriority="high"`. The dialog's accessible name and the zoom buttons' accessible names SHALL use the localized keys `viewerLabel`, `viewerZoomIn`, and `viewerZoomOut`. While the image is at 1x zoom, the image area SHALL use `touch-action: pan-y` so that horizontal swipes reach the swipe handler; while zoomed beyond 1x it SHALL use `touch-action: none` for drag panning. Arrow keys and the plus and minus keys SHALL keep working while focus is on any control inside the viewer.

#### Scenario: Jump to a photo with the keyboard

- **WHEN** the viewer shows photo 1 of 5, the user moves focus to the third thumbnail with Tab, and presses Enter
- **THEN** the viewer shows photo 3 of 5 at 1x zoom and the third thumbnail has `aria-current="true"`

#### Scenario: Thumbnails do not compete with the main image

- **WHEN** the viewer opens on a gallery with 120 photos
- **THEN** every thumbnail `<img>` has `loading="lazy"` and `fetchpriority="low"`, and the main `<img>` has `fetchpriority="high"`

#### Scenario: Localized accessible names

- **WHEN** the locale is `en` and the viewer is open
- **THEN** the dialog is named by the English `viewerLabel` text and the zoom buttons by the English `viewerZoomIn` and `viewerZoomOut` texts

#### Scenario: Arrow keys work from a focused control

- **WHEN** focus is on the viewer's close button and the user presses the right arrow key
- **THEN** the viewer shows the next photo

<!-- @trace
source: web-modern-platform-refresh
updated: 2026-11-26
code:
  - apps/web/CLAUDE.md
  - apps/web/index.html
  - apps/web/package.json
  - apps/web/src/components/blog-input/BlogInputForm.tsx
  - apps/web/src/components/blog-input/FetchProgress.tsx
  - apps/web/src/components/download/DownloadProgress.tsx
  - apps/web/src/components/gallery/ImageViewer.tsx
  - apps/web/src/components/gallery/PhotoCard.tsx
  - apps/web/src/components/gallery/PhotoGrid.tsx
  - apps/web/src/components/layout/AppHeaderControls.tsx
  - apps/web/src/components/layout/ThemeLocaleControls.tsx
  - apps/web/src/components/onboarding/OnboardingCard.tsx
  - apps/web/src/index.css
  - apps/web/src/lib/config/ui-controls.ts
  - apps/web/src/lib/hooks/use-color-scheme.ts
  - apps/web/src/lib/hooks/use-modal-dialog.ts
  - apps/web/src/lib/i18n/messages/en.json
  - apps/web/src/lib/i18n/messages/ja.json
  - apps/web/src/lib/i18n/messages/ko.json
  - apps/web/src/lib/i18n/messages/zh-TW.json
  - apps/web/src/lib/polyfills/popover.ts
  - apps/web/src/lib/stores/use-settings-store.ts
  - apps/web/src/main.tsx
tests:
  - apps/web/src/__tests__/components/blog-input/BlogInputForm.test.tsx
  - apps/web/src/__tests__/components/download/DownloadProgress.test.tsx
  - apps/web/src/__tests__/components/gallery/ImageViewer.test.tsx
  - apps/web/src/__tests__/components/gallery/PhotoCard.test.tsx
  - apps/web/src/__tests__/components/layout/AppHeaderControls.test.tsx
  - apps/web/src/__tests__/components/layout/AppLayout.test.tsx
  - apps/web/src/__tests__/components/layout/PublicLayout.test.tsx
  - apps/web/src/__tests__/components/onboarding/OnboardingCard.test.tsx
  - apps/web/src/__tests__/lib/config/ui-controls.test.ts
  - apps/web/src/__tests__/lib/hooks/use-color-scheme.test.tsx
  - apps/web/src/__tests__/lib/hooks/use-modal-dialog.test.tsx
  - apps/web/src/__tests__/lib/polyfills/popover.test.ts
  - apps/web/src/__tests__/lib/stores/use-settings-store.test.ts
  - apps/web/src/__tests__/routes.test.tsx
  - apps/web/src/__tests__/setup.ts
  - apps/web/src/__tests__/test-utils/dialog.ts
-->