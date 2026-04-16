# web-app-foundation Specification

## Purpose

Web 前端基礎建設——Vite + React 19 + React Router v7 專案架構、API client（timeout/retry/雙層 JSON 解析）、M3 色彩主題系統、BlogId 產生、URL 驗證。

## Requirements

### Requirement: Vite project initialization with React 19 and TypeScript

The web app SHALL be a Vite project at `apps/web/` using React 19, TypeScript, and SWC for compilation. The project SHALL include `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, and `index.html` as the entry point.

#### Scenario: Development server starts successfully

- **WHEN** `pnpm dev` is run in `apps/web/`
- **THEN** Vite dev server starts and serves the application at `http://localhost:5173`

#### Scenario: Production build produces static files

- **WHEN** `pnpm build` is run in `apps/web/`
- **THEN** static files are generated in `apps/web/dist/`


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
### Requirement: React Router v7 routing with two routes

The app SHALL use React Router v7 with `createBrowserRouter`. Routes SHALL be defined in `routes.tsx` with a shared `RootLayout` component. The routes SHALL be: `/` for the home page (URL input) and `/gallery/:blogId` for the photo gallery. Unmatched routes SHALL render a not-found page.

#### Scenario: Navigate to home page

- **WHEN** user navigates to `/`
- **THEN** the `HomePage` component is rendered within `RootLayout`

#### Scenario: Navigate to gallery with blogId

- **WHEN** user navigates to `/gallery/abc123def456`
- **THEN** the `GalleryPage` component is rendered with `blogId` param value `abc123def456`

#### Scenario: Navigate to unknown route

- **WHEN** user navigates to `/unknown`
- **THEN** the `NotFoundPage` component is rendered


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
### Requirement: API client with timeout, retry, and dual-layer JSON parsing

The API client at `lib/api/client.ts` SHALL wrap `fetch()` with: a 30-second timeout via `AbortController`, automatic retry for HTTP 502/503/504 (max 3 attempts, exponential backoff 1s/2s/4s), and dual-layer JSON parsing for API Gateway Lambda proxy responses where the `body` field is a JSON string.

#### Scenario: Successful API call with dual-layer JSON

- **WHEN** the API returns `{ "statusCode": 200, "body": "{\"job_id\": \"abc\"}" }`
- **THEN** the client parses the outer JSON, detects the string `body` field, and returns `{ "job_id": "abc" }`

#### Scenario: Request timeout after 30 seconds

- **WHEN** the API does not respond within 30 seconds
- **THEN** the client aborts the request and throws a timeout error

#### Scenario: Retry on 503 with exponential backoff

- **WHEN** the API returns HTTP 503 on the first two attempts and HTTP 200 on the third
- **THEN** the client retries after 1s and 2s delays, then returns the successful response

#### Scenario: Exhaust retries on persistent 502

- **WHEN** the API returns HTTP 502 on all 3 attempts
- **THEN** the client throws an error after the third failed attempt


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
### Requirement: Environment variable configuration

The API base URL and stage SHALL be configured via Vite environment variables `VITE_API_BASE_URL` and `VITE_API_STAGE`, accessed via `import.meta.env`. An `.env.example` file SHALL document the required variables.

#### Scenario: API client uses environment variables

- **WHEN** `VITE_API_BASE_URL` is set to `https://example.com` and `VITE_API_STAGE` is set to `prod`
- **THEN** the API client sends requests to `https://example.com/prod/api/photos`


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
### Requirement: M3 color theme with dark mode support

The app SHALL define CSS custom properties derived from Material 3 seed color `#1565C0`. Both light and dark theme tokens SHALL be defined. Dark mode SHALL be toggled via the `dark` class on `<html>`, managed by Tailwind CSS 4's `class` strategy.

#### Scenario: Light theme applied by default

- **WHEN** no theme preference is set
- **THEN** light theme CSS custom properties are active

#### Scenario: Dark theme applied via class

- **WHEN** `<html>` element has the `dark` class
- **THEN** dark theme CSS custom properties override light theme values


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
### Requirement: BlogId generation using Web Crypto API

The `blog-id.ts` service SHALL generate a blogId by computing SHA-256 of the blog URL and returning the first 16 hexadecimal characters. This SHALL match the mobile app's `CacheRepository.blogId()` output.

#### Scenario: Generate blogId from URL

- **WHEN** `blogId("https://blog.naver.com/user/12345")` is called
- **THEN** the function returns the first 16 characters of the SHA-256 hex digest of the input string


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
### Requirement: Naver URL validator ported from mobile

The `url-validator.ts` service SHALL validate URLs matching the regex `^https://(m\.)?blog\.naver\.com/` and normalize mobile URLs (`m.blog.naver.com`) to desktop URLs (`blog.naver.com`).

#### Scenario: Valid desktop URL

- **WHEN** `isValid("https://blog.naver.com/user/12345")` is called
- **THEN** the function returns `true`

#### Scenario: Valid mobile URL normalized

- **WHEN** `normalize("https://m.blog.naver.com/user/12345")` is called
- **THEN** the function returns `"https://blog.naver.com/user/12345"`

#### Scenario: Invalid URL rejected

- **WHEN** `isValid("https://example.com/page")` is called
- **THEN** the function returns `false`

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
### Requirement: Build-time app version injection

The Vite build configuration SHALL define a global constant `__APP_VERSION__` injected at build time from the `version` field of `apps/web/package.json`. A TypeScript declaration SHALL exist so that `__APP_VERSION__` is typed as `string`. The RootLayout header SHALL display the version as `v<semver>` next to the app title, using subdued styling (`text-xs`, `color-on-surface-variant`) that is visible on all pages.

#### Scenario: Version displayed in header

- **WHEN** the user opens any page of the Web app
- **THEN** the header displays the current version string in the format `v<semver>` (e.g., `v1.1.0`)

#### Scenario: Version matches package.json

- **WHEN** `apps/web/package.json` has `"version": "1.1.0"`
- **THEN** the header displays `v1.1.0`

<!-- @trace
source: web-onboarding-version-display
updated: 2026-04-16
code:
  - apps/web/vite.config.ts
  - apps/web/src/vite-env.d.ts
  - apps/web/src/components/layout/RootLayout.tsx
  - apps/web/package.json
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