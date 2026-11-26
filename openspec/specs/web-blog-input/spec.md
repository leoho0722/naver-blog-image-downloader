# web-blog-input Specification

## Purpose

Web 版 URL 輸入功能——文字輸入框、剪貼簿貼上、拖放 URL、Naver URL 驗證與正規化、提交任務與輪詢進度。

## Requirements

### Requirement: URL text input with paste button

The BlogInputForm SHALL provide a text input field for entering Naver Blog URLs and a paste button that reads from `navigator.clipboard.readText()`. The input field SHALL display a placeholder hint showing the expected URL format.

#### Scenario: User types a URL

- **WHEN** user types `https://blog.naver.com/user/12345` into the input field
- **THEN** the input value updates to the typed URL

#### Scenario: User clicks paste button

- **WHEN** user clicks the paste button and clipboard contains `https://blog.naver.com/user/12345`
- **THEN** the input field is populated with the clipboard content

#### Scenario: Clipboard is empty

- **WHEN** user clicks the paste button and clipboard is empty
- **THEN** a toast notification informs the user that the clipboard is empty


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
### Requirement: Drag-and-drop URL support

The BlogInputForm SHALL accept URLs dragged and dropped onto the input area. The component SHALL extract text from the `DataTransfer` object and validate it as a Naver Blog URL.

#### Scenario: Valid URL dropped

- **WHEN** user drops text `https://blog.naver.com/user/12345` onto the input area
- **THEN** the input field is populated with the dropped URL

#### Scenario: Invalid text dropped

- **WHEN** user drops non-URL text onto the input area
- **THEN** the input is rejected and the field remains unchanged


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
### Requirement: URL validation before submission

The BlogInputForm SHALL validate the URL using the Naver URL validator before submission. Invalid URLs SHALL prevent submission and display an error message. Empty URLs SHALL show an empty URL error.

#### Scenario: Submit valid URL

- **WHEN** user enters a valid Naver Blog URL and clicks the fetch button
- **THEN** the fetch process begins

#### Scenario: Submit invalid URL

- **WHEN** user enters `https://example.com` and clicks the fetch button
- **THEN** an error message is displayed and no API call is made

#### Scenario: Submit empty URL

- **WHEN** user clicks the fetch button with an empty input
- **THEN** an empty URL error message is displayed


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
### Requirement: Clipboard detection on window focus

The BlogInputForm SHALL listen for `window focus` events and check the clipboard for Naver Blog URLs. When a valid URL is detected, the user SHALL be prompted to paste it.

#### Scenario: Valid URL detected in clipboard on focus

- **WHEN** user switches back to the browser tab and clipboard contains a valid Naver Blog URL
- **THEN** a prompt appears asking if the user wants to paste the URL


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
### Requirement: Fetch photos with three-phase progress

The BlogInputForm SHALL call `submitJob(blogUrl)` to initiate photo extraction and then poll `checkJobStatus(jobId)` every 3 seconds (max 200 attempts). The UI SHALL display three progress phases: submitting, processing, and completed. On success, the HomePage effect SHALL first call `navigate()` to `/gallery/:blogId` with `fetchResult` and `jobId` as router state, then call `reset()` to clear the blog input store. The store reset MUST NOT occur before navigation is queued. Photo filenames extracted from image URLs SHALL be decoded via `decodeURIComponent()` before storage in the `PhotoEntity.filename` field.

#### Scenario: Successful fetch with navigation

- **WHEN** user submits a valid URL and the job completes with 10 images
- **THEN** the progress indicator shows submitting → processing → completed, then navigates to `/gallery/<blogId>` with `fetchResult` and `jobId` in router state

#### Scenario: Store reset after navigation

- **WHEN** the HomePage effect detects `fetchPhase === "completed"` with a non-null `fetchResult`
- **THEN** `navigate()` is called first, then `reset()` clears `blogUrl`, `fetchPhase`, `fetchResult`, and `jobId`

#### Scenario: Encoded filename decoding

- **WHEN** an image URL path segment contains URL-encoded characters (e.g., `%EC%82%AC%EC%A7%84.jpg`)
- **THEN** the `PhotoEntity.filename` stores the decoded string (e.g., `1_사진.jpg`)

#### Scenario: Fetch timeout after max attempts

- **WHEN** polling reaches 200 attempts without completion
- **THEN** a timeout error is displayed to the user

#### Scenario: Fetch failure from server

- **WHEN** the server returns job status "failed"
- **THEN** an error dialog displays the server error message

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
### Requirement: Accessible URL input field

The BlogInputForm URL input SHALL be associated with a visually hidden `<label>` whose text comes from the localized key `blogInputUrlLabel`; the placeholder SHALL remain a format hint only. The input SHALL set `name="blogUrl"`, `required`, `autocapitalize="none"`, `autocorrect="off"`, `spellcheck="false"`, and `enterkeyhint="go"`, and its computed font size SHALL be at least 16px so that iOS Safari does not zoom the page when the input gains focus. The form SHALL set `noValidate` so that validation errors are always reported by the app's localized messages instead of the browser's native validation bubble. When an error message is shown, it SHALL be rendered with `role="alert"` and referenced by the input's `aria-describedby`; for the empty-URL and invalid-URL errors the input SHALL also set `aria-invalid="true"`. The paste button SHALL NOT carry an `aria-label` that duplicates its visible text.

#### Scenario: Input has a programmatic label

- **WHEN** the home page renders the blog input form
- **THEN** the URL input's accessible name is the localized `blogInputUrlLabel` text

#### Scenario: App validation replaces the native bubble

- **WHEN** the user submits `blog.naver.com/user/1` without a scheme
- **THEN** no native validation bubble appears, the localized invalid-URL message is shown with `role="alert"`, and the input has `aria-invalid="true"` and `aria-describedby` pointing at that message

##### Example: error type to input state

| Error type          | `aria-invalid` on input | Message referenced by `aria-describedby` |
| ------------------- | ----------------------- | ---------------------------------------- |
| `emptyUrl`          | `true`                  | yes                                      |
| `invalidUrl`        | `true`                  | yes                                      |
| `networkError`      | absent                  | yes                                      |
| no error            | absent                  | no                                       |


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

---
### Requirement: Fetch progress step semantics

FetchProgress SHALL render its three steps (submitting, processing, completed) as an ordered list with `role="list"`, one list item per step, and SHALL mark the list item of the current phase with `aria-current="step"`. Decorative connector lines between steps SHALL be hidden from assistive technologies with `aria-hidden="true"`.

#### Scenario: Current step is announced

- **WHEN** the fetch phase is `processing`
- **THEN** the second list item has `aria-current="step"` and the other two list items have no `aria-current`

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