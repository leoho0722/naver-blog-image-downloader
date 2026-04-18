## ADDED Requirements

### Requirement: Privacy policy ListTile opens external browser

The `SettingsView` SHALL display a privacy-policy `ListTile` within a `Card.filled`. The `title` SHALL be sourced from the localized string `settingsPrivacyPolicyTitle` (e.g., "隱私政策"). The `trailing` area SHALL display an `Icon` using `Icons.open_in_new` to indicate the link opens outside the app.

Tapping the `ListTile` SHALL invoke `url_launcher`'s `launchUrl` with the URL constant exported from `apps/mobile/lib/config/privacy_policy_url.dart` and `mode: LaunchMode.externalApplication`, so the device's default browser opens the web privacy policy page.

If `launchUrl` returns `false` or throws, the view SHALL display a `SnackBar` with the localized message `settingsPrivacyPolicyLaunchFailed`. The failure SHALL NOT crash the view.

#### Scenario: Privacy policy ListTile rendered in settings

- **GIVEN** `SettingsView` is rendered
- **WHEN** the settings content is displayed
- **THEN** a `ListTile` inside `Card.filled` SHALL show the localized privacy-policy title as `title` and an `Icons.open_in_new` widget in the `trailing` area

#### Scenario: Tap opens external browser

- **GIVEN** `SettingsView` is rendered with the privacy-policy `ListTile` visible
- **WHEN** the user taps the privacy-policy `ListTile`
- **THEN** `url_launcher.launchUrl` SHALL be invoked with the `privacyPolicyUrl` constant and `LaunchMode.externalApplication`

#### Scenario: Launch failure surfaces localized SnackBar

- **GIVEN** the privacy-policy `ListTile` is tapped
- **WHEN** `launchUrl` returns `false` or throws
- **THEN** a `SnackBar` SHALL be shown containing the localized `settingsPrivacyPolicyLaunchFailed` message, and the view SHALL remain mounted without a crash

---

### Requirement: Privacy-policy URL constant module

A new module `apps/mobile/lib/config/privacy_policy_url.dart` SHALL export a `const String privacyPolicyUrl` equal to `"https://leoho0722.github.io/naver-blog-image-downloader/privacy"`. This module SHALL be the single source of truth for the privacy-policy URL throughout the mobile app, so that future domain or path changes require edits in exactly one file.

#### Scenario: Constant value matches canonical Web URL

- **WHEN** the `privacyPolicyUrl` constant is read
- **THEN** its value equals `"https://leoho0722.github.io/naver-blog-image-downloader/privacy"`

#### Scenario: SettingsView imports from the config module

- **WHEN** `SettingsView` constructs the privacy-policy `ListTile` tap handler
- **THEN** it SHALL reference `privacyPolicyUrl` imported from `apps/mobile/lib/config/privacy_policy_url.dart`, and no string literal of the URL SHALL appear inline in `settings_view.dart`
