## ADDED Requirements

### Requirement: l10n configuration file

The project SHALL have a `l10n.yaml` file at the Flutter project root with the following configuration:

- `arb-dir`: `lib/l10n`
- `template-arb-file`: `app_zh_TW.arb`
- `output-localization-file`: `app_localizations.dart`
- `output-class`: `AppLocalizations`
- `nullable-getter`: `false`

#### Scenario: l10n.yaml exists with correct config

- **WHEN** the `l10n.yaml` file is inspected
- **THEN** the `template-arb-file` SHALL be `app_zh_TW.arb`
- **AND** the `output-class` SHALL be `AppLocalizations`

### Requirement: ARB template file (Traditional Chinese)

The file `lib/l10n/app_zh_TW.arb` SHALL serve as the template ARB file containing all localization keys with Traditional Chinese values. It SHALL include the `@@locale` key set to `"zh_TW"`.

Every user-facing string in the application SHALL have a corresponding key in this file.

#### Scenario: Template ARB contains locale metadata

- **WHEN** `app_zh_TW.arb` is parsed
- **THEN** the `@@locale` field SHALL be `"zh_TW"`

#### Scenario: All UI strings have ARB keys

- **WHEN** the application source code is inspected
- **THEN** every user-facing string SHALL reference an `AppLocalizations` key instead of a hardcoded literal

### Requirement: English ARB file

The file `lib/l10n/app_en.arb` SHALL contain English translations for all keys defined in the template ARB file. It SHALL include the `@@locale` key set to `"en"`.

#### Scenario: English ARB has matching keys

- **WHEN** `app_en.arb` is compared to `app_zh_TW.arb`
- **THEN** every non-metadata key in `app_zh_TW.arb` SHALL have a corresponding entry in `app_en.arb`

### Requirement: Korean ARB file

The file `lib/l10n/app_ko.arb` SHALL contain Korean translations for all keys defined in the template ARB file. It SHALL include the `@@locale` key set to `"ko"`.

#### Scenario: Korean ARB has matching keys

- **WHEN** `app_ko.arb` is compared to `app_zh_TW.arb`
- **THEN** every non-metadata key in `app_zh_TW.arb` SHALL have a corresponding entry in `app_ko.arb`

### Requirement: MaterialApp localization integration

The `MaterialApp.router` in `lib/app.dart` SHALL configure the following localization properties:

- `localizationsDelegates` SHALL be set to `AppLocalizations.localizationsDelegates`
- `supportedLocales` SHALL be set to `AppLocalizations.supportedLocales`
- `locale` SHALL be set to the locale from `AppSettingsViewModel` (null means follow system)

#### Scenario: Localization delegates configured

- **WHEN** `MaterialApp.router` is inspected
- **THEN** its `localizationsDelegates` SHALL include `AppLocalizations.localizationsDelegates`
- **AND** its `supportedLocales` SHALL include `AppLocalizations.supportedLocales`
