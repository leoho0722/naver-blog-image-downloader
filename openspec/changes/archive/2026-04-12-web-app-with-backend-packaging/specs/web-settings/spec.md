## ADDED Requirements

### Requirement: Theme switching with three modes

The settings panel SHALL provide a segmented control for switching between system, light, and dark themes. The selection SHALL be persisted to `localStorage`. System mode SHALL follow the OS `prefers-color-scheme` media query. Theme changes SHALL apply immediately without page reload.

#### Scenario: Switch to dark theme

- **WHEN** user selects "Dark" in the theme switcher
- **THEN** the `dark` class is added to `<html>`, dark theme CSS custom properties activate, and the preference is saved to `localStorage`

#### Scenario: System theme follows OS

- **WHEN** user selects "System" and the OS is in dark mode
- **THEN** dark theme is applied; when the OS switches to light mode, light theme is applied automatically

#### Scenario: Theme persists across page reload

- **WHEN** user selects "Light" and reloads the page
- **THEN** light theme is applied immediately (no flash of default theme)

### Requirement: Language switching with four locales

The settings panel SHALL provide a language selector with four options: Traditional Chinese (zh-TW), English (en), Japanese (ja), and Korean (ko). The selection SHALL be persisted to `localStorage`. Language changes SHALL update all UI text immediately via react-i18next.

#### Scenario: Switch language to Japanese

- **WHEN** user selects "日本語" in the language selector
- **THEN** all UI text updates to Japanese and the preference is saved to `localStorage`

#### Scenario: Language persists across page reload

- **WHEN** user selects English and reloads the page
- **THEN** English is applied immediately

### Requirement: Settings panel responsive layout

The settings panel SHALL render as a side drawer on desktop (>1024px) and as a modal dialog on mobile (<1024px). It SHALL be accessible from the root layout header.

#### Scenario: Desktop side drawer

- **WHEN** user clicks the settings icon on a desktop viewport
- **THEN** a side drawer slides in from the right

#### Scenario: Mobile modal

- **WHEN** user clicks the settings icon on a mobile viewport
- **THEN** a modal dialog appears
