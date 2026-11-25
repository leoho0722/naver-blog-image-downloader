## MODIFIED Requirements

### Requirement: M3 color theme with dark mode support

The app SHALL define light and dark color tokens as CSS custom properties on `:root` in `apps/web/src/index.css`, keeping the Material 3 token names (`--color-primary`, `--color-surface`, `--color-scrim`, and the rest). Each color token SHALL resolve through the CSS `light-dark()` function so that one declaration carries both the light and the dark value. `apps/web/index.html` SHALL declare `<meta name="color-scheme" content="light dark">`. The `:root` `color-scheme` property SHALL default to `light dark` and SHALL switch to `dark` or `light` when the meta content is `dark` or `light`, so that color tokens, scrollbars, and native form controls follow the meta. The `<html>` element SHALL NOT carry a `dark` class. Styles that branch on non-color values SHALL key off a `--color-scheme` custom property on `:root` that is derived from the same meta and from the `prefers-color-scheme` media query.

#### Scenario: Default follows the OS preference

- **WHEN** the meta content is `light dark` and the OS prefers dark
- **THEN** every `--color-*` token resolves to its dark value and the root computed `color-scheme` renders native UI in dark

#### Scenario: Meta override pins the scheme

- **WHEN** the meta content is set to `light` while the OS prefers dark
- **THEN** every `--color-*` token resolves to its light value

##### Example: resolved scheme by meta content and OS preference

| Meta content | OS preference | Resolved scheme |
| ------------ | ------------- | --------------- |
| `light dark` | light         | light           |
| `light dark` | dark          | dark            |
| `light`      | dark          | light           |
| `dark`       | light         | dark            |

#### Scenario: No dark class on the root element

- **WHEN** the user switches between system, light, and dark themes
- **THEN** the `<html>` element's class list never contains `dark`

#### Scenario: Page follows the OS when scripts fail

- **WHEN** JavaScript fails to load and the OS prefers dark
- **THEN** the page still renders with the dark tokens because the meta keeps its default `light dark` content

## ADDED Requirements

### Requirement: Native modal dialogs for blocking overlays

Blocking overlays — the image viewer (`ImageViewer`), the first-visit onboarding card (`OnboardingCard`), and the packaging progress dialog (`DownloadProgress`) — SHALL render as native `<dialog>` elements opened with `HTMLDialogElement.showModal()` through a shared hook. They SHALL NOT set `role="dialog"` or `aria-modal`, SHALL NOT be rendered through `createPortal`, and SHALL NOT register window-level Escape key listeners. Each dialog SHALL have an accessible name through `aria-labelledby` or `aria-label`. When a user action dismisses an overlay, the component SHALL call `HTMLDialogElement.close()` and SHALL update React state from the dialog's `close` event, so that the browser returns focus to the element that opened the dialog. Scrolling over the backdrop or inside an open modal dialog SHALL NOT scroll the page underneath; this SHALL be achieved with `overscroll-behavior: contain` on `dialog:modal` and on `dialog::backdrop` (with `overflow: hidden`), and SHALL NOT be achieved by setting `overflow: hidden` or `position: fixed` on `<html>` or `<body>`.

#### Scenario: Focus stays inside an open dialog

- **WHEN** the image viewer is open and the user presses Tab repeatedly
- **THEN** focus cycles only through controls inside the viewer and the gallery behind it is inert

#### Scenario: Escape closes through the native close request

- **WHEN** the image viewer or the onboarding card is open and the user presses Escape
- **THEN** the dialog closes and the component's close or dismiss callback runs exactly once

#### Scenario: Focus returns to the opener

- **WHEN** the user opens the image viewer from a photo card button and then activates the viewer's close button
- **THEN** the viewer closes and focus returns to that photo card button

#### Scenario: Onboarding card focus and heading

- **WHEN** the onboarding card opens
- **THEN** focus is placed on the card itself rather than on its Start button, and the card is named by its title, which is a level-1 heading

#### Scenario: Background page does not scroll behind a dialog

- **WHEN** a modal dialog is open and the user scrolls with the pointer over the backdrop
- **THEN** the page underneath keeps its scroll position and the root element keeps its scrollbar

### Requirement: Web fonts loaded from the HTML shell

`apps/web/src/index.css` SHALL NOT use CSS `@import` to load remote font stylesheets. `apps/web/index.html` SHALL load the Gowun Dodum stylesheet from Google Fonts and the Pretendard variable stylesheet from jsDelivr with `<link rel="stylesheet">`, and SHALL declare `<link rel="preconnect">` for `https://fonts.googleapis.com`, for `https://fonts.gstatic.com` with `crossorigin`, and for `https://cdn.jsdelivr.net` with `crossorigin`.

#### Scenario: No CSS import chain for fonts

- **WHEN** the production build's CSS bundle is inspected
- **THEN** it contains no `@import` rule pointing at `fonts.googleapis.com` or `cdn.jsdelivr.net`

#### Scenario: Font stylesheets start loading from the HTML

- **WHEN** the built `index.html` head is inspected
- **THEN** it contains the three preconnect links and the two font stylesheet links before the app's own stylesheet
