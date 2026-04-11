## ADDED Requirements

### Requirement: SupportedLocale enum definition

The `SupportedLocale` enum SHALL be defined in `lib/config/supported_locale.dart` with the following values:

- `zhTW` — representing Traditional Chinese with `Locale('zh', 'TW')` and display label `'繁體中文'`
- `en` — representing English with `Locale('en')` and display label `'English'`
- `ko` — representing Korean with `Locale('ko')` and display label `'한국어'`

Each enum value SHALL have:
- A `locale` property of type `Locale`
- A `label` property of type `String` containing the language name in its native script

#### Scenario: SupportedLocale.zhTW properties

- **WHEN** `SupportedLocale.zhTW` is inspected
- **THEN** its `locale` SHALL be `Locale('zh', 'TW')`
- **AND** its `label` SHALL be `'繁體中文'`

#### Scenario: SupportedLocale.en properties

- **WHEN** `SupportedLocale.en` is inspected
- **THEN** its `locale` SHALL be `Locale('en')`
- **AND** its `label` SHALL be `'English'`

#### Scenario: SupportedLocale.ko properties

- **WHEN** `SupportedLocale.ko` is inspected
- **THEN** its `locale` SHALL be `Locale('ko')`
- **AND** its `label` SHALL be `'한국어'`

### Requirement: AppSettingsKeys constants

The `AppSettingsKeys` class SHALL be defined as `abstract final class` in `lib/config/app_settings_keys.dart` with the following constants:

- `themeMode` — `'app_theme_mode'`
- `locale` — `'app_locale'`

#### Scenario: Key values are correct

- **WHEN** `AppSettingsKeys.themeMode` is accessed
- **THEN** its value SHALL be `'app_theme_mode'`
- **AND** `AppSettingsKeys.locale` SHALL be `'app_locale'`
