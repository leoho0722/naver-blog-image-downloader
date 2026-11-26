# web-settings Specification

## Purpose

Web 版設定功能——主題切換（系統/亮色/暗色）、語言切換（zh-TW/en/ja/ko）、localStorage 持久化。

## Requirements

### Requirement: Theme switching with three modes

The settings panel SHALL provide a segmented control for switching between system, light, and dark themes. Selecting light or dark SHALL persist the literal value under the `theme` key in `localStorage`; selecting system SHALL remove the `theme` key. A stored value other than `light` or `dark`, including the legacy value `system`, SHALL be treated as system. The active theme SHALL be applied by setting the content of `<meta name="color-scheme">` to `light dark` for system, `light` for light, or `dark` for dark. A classic inline script placed directly after that meta in `apps/web/index.html` SHALL apply the stored value before first paint, and it SHALL NOT throw when `localStorage` is unavailable. System mode SHALL follow the OS `prefers-color-scheme` through CSS without a JavaScript media-query listener. Theme changes SHALL apply immediately without page reload, and a theme change made in another tab SHALL be applied in the current tab through the `storage` event. When `localStorage` cannot be written, the selected theme SHALL still apply to the current page.

#### Scenario: Switch to dark theme

- **WHEN** user selects "Dark" in the theme switcher
- **THEN** the color-scheme meta content becomes `dark`, dark tokens activate, and `localStorage.theme` is `"dark"`

#### Scenario: Switch back to system removes the stored value

- **WHEN** user selects "System" after having selected "Dark"
- **THEN** the color-scheme meta content becomes `light dark` and the `theme` key no longer exists in `localStorage`

#### Scenario: System theme follows OS

- **WHEN** user selects "System" and the OS is in dark mode
- **THEN** dark theme is applied; when the OS switches to light mode, light theme is applied automatically

#### Scenario: Theme persists across page reload

- **WHEN** user selects "Light", the OS is in dark mode, and the page reloads
- **THEN** the first paint already uses the light theme because the inline script set the meta content to `light` before the body rendered

##### Example: stored value to meta content on load

| `localStorage.theme` | Meta content after the inline script |
| -------------------- | ------------------------------------ |
| absent               | `light dark`                         |
| `"system"` (legacy)  | `light dark`                         |
| `"light"`            | `light`                              |
| `"dark"`             | `dark`                               |
| `"blue"` (unknown)   | `light dark`                         |

#### Scenario: Theme change in another tab

- **WHEN** the app is open in two tabs and the user selects "Dark" in the first tab
- **THEN** the second tab's color-scheme meta content becomes `dark` and its settings store theme becomes `dark` without a reload


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
### Requirement: Language switching with four locales

The settings panel SHALL provide a language selector with four options: Traditional Chinese (zh-TW), English (en), Japanese (ja), and Korean (ko). The selection SHALL be persisted to `localStorage`. Language changes SHALL update all UI text immediately via react-i18next.

#### Scenario: Switch language to Japanese

- **WHEN** user selects "日本語" in the language selector
- **THEN** all UI text updates to Japanese and the preference is saved to `localStorage`

#### Scenario: Language persists across page reload

- **WHEN** user selects English and reloads the page
- **THEN** English is applied immediately


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
### Requirement: Onboarding seen flag persistence

The settings store SHALL include a `hasSeenOnboarding` boolean state initialized from `localStorage.getItem("hasSeenOnboarding")`. If the key does not exist in `localStorage`, the value SHALL default to `false`. The store SHALL provide a `dismissOnboarding()` action that sets `hasSeenOnboarding` to `true` and writes `"true"` to `localStorage` under the key `hasSeenOnboarding`.

#### Scenario: Load onboarding flag from localStorage

- **WHEN** the settings store initializes and `localStorage` contains `hasSeenOnboarding` set to `"true"`
- **THEN** `hasSeenOnboarding` in the store is `true`

#### Scenario: Load onboarding flag when not set

- **WHEN** the settings store initializes and `localStorage` does not contain `hasSeenOnboarding`
- **THEN** `hasSeenOnboarding` in the store is `false`

#### Scenario: Dismiss onboarding persists to localStorage

- **WHEN** `dismissOnboarding()` is called
- **THEN** `hasSeenOnboarding` becomes `true` in the store and `localStorage.getItem("hasSeenOnboarding")` returns `"true"`

<!-- @trace
source: web-onboarding-version-display
updated: 2026-04-16
code:
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
### Requirement: Two-state header theme toggle

The always-visible theme buttons in the AppLayout header (`AppHeaderControls`) and in the PublicLayout navigation (`ThemeLocaleControls`) SHALL act as two-state toggles. The button's icon SHALL show the currently rendered scheme, resolving system to the OS preference. The button's accessible name SHALL describe the action, using the localized keys `settingsSwitchToDark` when the rendered scheme is light and `settingsSwitchToLight` when it is dark. Activating the button SHALL target the opposite of the rendered scheme: when the target equals the current OS preference the theme SHALL become system and the stored value SHALL be removed; otherwise the target SHALL be stored literally. A stored value SHALL NOT be cleared when the OS preference later changes to match it. The OS preference SHALL be read with `matchMedia("(prefers-color-scheme: dark)")` and SHALL be kept current through that media query list's `change` event.

#### Scenario: Toggle picks the opposite of what the user sees

- **WHEN** the user activates the header theme button
- **THEN** the page switches to the opposite of the scheme it was rendering

##### Example: theme after one activation

| Theme before | OS preference | Rendered before | Theme after |
| ------------ | ------------- | --------------- | ----------- |
| system       | light         | light           | dark        |
| system       | dark          | dark            | light       |
| dark         | light         | dark            | system      |
| light        | dark          | light           | system      |
| dark         | dark          | dark            | light       |
| light        | light         | light           | dark        |

#### Scenario: Accessible name describes the action

- **WHEN** the rendered scheme is light
- **THEN** the button's accessible name is the localized `settingsSwitchToDark` text and its icon is the light-scheme icon

#### Scenario: OS change keeps a stored override

- **WHEN** the theme is stored as `dark` while the OS prefers light, and the OS then switches to dark
- **THEN** `localStorage.theme` remains `"dark"`, and when the OS switches back to light the page stays dark


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
### Requirement: Settings panel popover

The settings panel SHALL open from a settings button in the AppLayout header and SHALL render as a native popover (`popover="auto"`) invoked through `popovertarget`, positioned below the button and aligned to the button's inline end. Clicking outside the panel or pressing Escape SHALL close it, and focus SHALL return to the settings button when focus was inside the panel. The settings button SHALL expose `aria-expanded` matching whether the panel is open. The panel SHALL NOT use `role="menu"` and the button SHALL NOT use `aria-haspopup="menu"`, because the panel contains ordinary toggle buttons reached with Tab. Selecting a language SHALL close the panel; changing the theme inside the panel SHALL keep it open. In browsers without native Popover support the app SHALL load `@oddbird/popover-polyfill` on demand after feature detection, and SHALL NOT load it when native support exists. In browsers without CSS anchor positioning the panel SHALL be positioned by script when it opens.

#### Scenario: Open and light-dismiss

- **WHEN** the user clicks the settings button and then clicks anywhere outside the panel
- **THEN** the panel opens on the first click, closes on the outside click, and the button's `aria-expanded` follows both changes

#### Scenario: Escape returns focus

- **WHEN** focus is on a theme option inside the open panel and the user presses Escape
- **THEN** the panel closes and focus moves to the settings button

#### Scenario: Language selection closes the panel

- **WHEN** the user selects English in the open panel
- **THEN** the locale changes to `en` and the panel closes

#### Scenario: Polyfill only where needed

- **WHEN** the app starts in a browser whose `HTMLElement.prototype` has its own `popover` property
- **THEN** the popover polyfill module is not requested

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