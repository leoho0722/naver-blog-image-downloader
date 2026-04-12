# web-unit-tests Specification

## Purpose

Web 前端單元測試與程式碼品質——Vitest + RTL + MSW 單元測試，涵蓋 services、API client、stores、hooks、components；Prettier 程式碼格式化。

## Requirements

### Requirement: Vitest test environment configuration

The project SHALL configure Vitest in `vite.config.ts` with jsdom environment, React Testing Library, and `@testing-library/jest-dom` matchers. Test files SHALL be located at `src/__tests__/` mirroring the `src/` directory structure.

#### Scenario: Run all tests

- **WHEN** `pnpm test` is executed
- **THEN** Vitest runs all `*.test.ts` and `*.test.tsx` files and reports results


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
### Requirement: Service layer unit tests

Unit tests SHALL cover `url-validator.ts` (validation and normalization) and `blog-id.ts` (SHA-256 blogId generation). Tests SHALL verify pure function input/output without external dependencies.

#### Scenario: URL validator tests

- **WHEN** url-validator tests execute
- **THEN** tests verify valid URL acceptance, invalid URL rejection, and mobile-to-desktop URL normalization

#### Scenario: BlogId generation tests

- **WHEN** blog-id tests execute
- **THEN** tests verify SHA-256 hex output matches expected first 16 characters for known input strings


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
### Requirement: API client unit tests with MSW

Unit tests SHALL cover `client.ts` (timeout, retry, dual-layer JSON parsing) and `photos.ts` (submitJob, checkJobStatus, requestPackage, checkPackageStatus) using MSW to mock HTTP responses.

#### Scenario: API client retry test

- **WHEN** MSW returns HTTP 503 twice then HTTP 200
- **THEN** the test verifies the client retries and returns the successful response

#### Scenario: Dual-layer JSON parsing test

- **WHEN** MSW returns `{ "statusCode": 200, "body": "{\"job_id\": \"abc\"}" }`
- **THEN** the test verifies the client returns `{ "job_id": "abc" }`


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
### Requirement: Store unit tests

Unit tests SHALL cover `use-blog-input-store`, `use-gallery-store`, and `use-download-store`. Tests SHALL verify state transitions: initial state, action invocations, and resulting state changes.

#### Scenario: Gallery store selection test

- **WHEN** the gallery store loads 10 photos and `toggleSelection("photo-3")` is called
- **THEN** `selectedIds` contains `"photo-3"` and `isSelectMode` is `true`


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
### Requirement: Hook unit tests

Unit tests SHALL cover `use-polling` (polling interval, max attempts, cleanup on unmount) and `use-clipboard` (focus event detection). Tests SHALL use `@testing-library/react`'s `renderHook`.

#### Scenario: Polling cleanup on unmount

- **WHEN** a component using `usePolling` unmounts during active polling
- **THEN** the polling interval is cleared and no further API calls are made


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
### Requirement: Component unit tests

Unit tests SHALL cover `BlogInputForm`, `PhotoGrid`, `PhotoCard`, `SelectionToolbar`, and `DownloadProgress`. Tests SHALL use React Testing Library to simulate user interactions and verify rendered output.

#### Scenario: BlogInputForm submission test

- **WHEN** user types a valid URL and clicks the fetch button
- **THEN** the test verifies the store's `fetchPhotos` action is triggered

#### Scenario: PhotoCard selection test

- **WHEN** selection mode is active and user clicks a PhotoCard
- **THEN** the test verifies the card displays a selected state

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