## ADDED Requirements

### Requirement: Appearance mode section

The `SettingsView` SHALL display an "Appearance" section above the cache section, containing a `Card.filled` with a `SegmentedButton<ThemeMode>` control.

The `SegmentedButton` SHALL have three segments:
- `ThemeMode.system` — labeled with the localized "System" text
- `ThemeMode.light` — labeled with the localized "Light" text
- `ThemeMode.dark` — labeled with the localized "Dark" text

The selected segment SHALL reflect `AppSettingsViewModel.themeMode`. When the user selects a segment, the view SHALL call `AppSettingsViewModel.setThemeMode` with the selected value.

#### Scenario: Appearance section renders with current theme mode

- **GIVEN** the `AppSettingsViewModel.themeMode` is `ThemeMode.system`
- **WHEN** the settings view is displayed
- **THEN** the appearance section SHALL show a `SegmentedButton` with "System" segment selected

#### Scenario: User switches to dark mode

- **GIVEN** the appearance section is displayed
- **WHEN** the user taps the "Dark" segment
- **THEN** `AppSettingsViewModel.setThemeMode(ThemeMode.dark)` SHALL be called

### Requirement: Language section

The `SettingsView` SHALL display a "Language" section between the appearance section and the cache section, containing a `Card.filled` with a `DropdownMenu<SupportedLocale>` control.

The `DropdownMenu` SHALL list all `SupportedLocale` values (繁體中文, English, 한국어), displaying each value's `label` property (native language name). The initial value SHALL reflect `AppSettingsViewModel.locale` (defaulting to `SupportedLocale.zhTW` when null).

When the user selects a locale, the view SHALL call `AppSettingsViewModel.setLocale` with the selected value.

Language labels SHALL NOT be localized — each language SHALL always display its native name regardless of the current app locale.

#### Scenario: Language section renders with current locale

- **GIVEN** the `AppSettingsViewModel.locale` is `SupportedLocale.zhTW`
- **WHEN** the settings view is displayed
- **THEN** the language section SHALL show a `DropdownMenu` with "繁體中文" selected

#### Scenario: User switches to English

- **GIVEN** the language section is displayed
- **WHEN** the user selects "English" from the dropdown
- **THEN** `AppSettingsViewModel.setLocale(SupportedLocale.en)` SHALL be called

### Requirement: Localized UI text

All user-facing text in `SettingsView` SHALL be sourced from `AppLocalizations.of(context)` instead of hardcoded string literals.

#### Scenario: Settings title is localized

- **WHEN** the settings view is displayed in English locale
- **THEN** the AppBar title SHALL display the English translation
- **AND** all section headers and labels SHALL display English text

#### Scenario: Settings title is localized in Chinese

- **WHEN** the settings view is displayed in zh_TW locale
- **THEN** the AppBar title SHALL display "設定"
- **AND** section headers SHALL display their Chinese equivalents

## MODIFIED Requirements

### Requirement: Version number display

The `SettingsView` SHALL display the application version number in a dedicated `Card.filled` section with a localized "About" header (sourced from `AppLocalizations`). The version SHALL be shown as a `ListTile` with a localized "Version" title (sourced from `AppLocalizations`) and the version string as `trailing` text styled with `textTheme.bodyLarge` and `colorScheme.onSurfaceVariant`. The version SHALL be retrieved via `PackageInfo.fromPlatform()` from `package_info_plus` and managed as local widget state.

#### Scenario: Version number shown in About section

- **GIVEN** the SettingsView is rendered
- **WHEN** `PackageInfo.fromPlatform()` returns successfully
- **THEN** a `Card.filled` section with a localized "About" header SHALL contain a `ListTile` showing a localized "Version" title and the version string as `trailing` text

### Requirement: Inset grouped list layout

The `SettingsView` body SHALL use a `ListView` containing Material 3 `Card.filled` widgets to present settings items in card-style grouped sections. The section order SHALL be: Appearance, Language, Cache, About. Each section SHALL have a header `Text` widget placed above the `Card.filled`, styled with `Theme.of(context).textTheme.titleSmall` and `colorScheme.onSurfaceVariant`. All section header text SHALL be sourced from `AppLocalizations`. The `Card.filled` SHALL contain `ListTile` widgets for individual items. The `Card.filled` widgets SHALL have horizontal padding of 16. The section headers SHALL have left padding of 28. The `Scaffold` SHALL NOT set an explicit `backgroundColor`; it SHALL use the default theme surface color.

#### Scenario: Settings displayed in Material 3 card style

- **GIVEN** the SettingsView is rendered
- **WHEN** the body content is displayed
- **THEN** settings items SHALL be wrapped in `Card.filled` widgets with section header labels above each card
- **AND** the section order SHALL be: Appearance, Language, Cache, About

#### Scenario: Section header styling

- **GIVEN** the SettingsView is rendered
- **WHEN** a section header is displayed
- **THEN** the header text SHALL use `textTheme.titleSmall` with `colorScheme.onSurfaceVariant` color
- **AND** the text SHALL be sourced from `AppLocalizations`

#### Scenario: Card horizontal padding

- **GIVEN** the SettingsView is rendered
- **WHEN** any `Card.filled` is displayed
- **THEN** the card SHALL have 16 horizontal padding on both sides
