## MODIFIED Requirements

### Requirement: Inset grouped list layout

The `SettingsView` body SHALL use a `ListView` containing Material 3 `Card.filled` widgets to present settings items in card-style grouped sections. Each section SHALL have a header `Text` widget placed above the `Card.filled`, styled with `Theme.of(context).textTheme.titleSmall` and `colorScheme.onSurfaceVariant`. The `Card.filled` SHALL contain `ListTile` widgets for individual items. The `Card.filled` widgets SHALL have horizontal padding of 16. The section headers SHALL have left padding of 28. The `Scaffold` SHALL NOT set an explicit `backgroundColor`; it SHALL use the default theme surface color.

#### Scenario: Settings displayed in Material 3 card style

- **GIVEN** the SettingsView is rendered
- **WHEN** the body content is displayed
- **THEN** settings items SHALL be wrapped in `Card.filled` widgets with section header labels above each card, and the list SHALL fill the full screen width

#### Scenario: Section header styling

- **GIVEN** the SettingsView is rendered
- **WHEN** a section header is displayed
- **THEN** the header text SHALL use `textTheme.titleSmall` with `colorScheme.onSurfaceVariant` color

#### Scenario: Card horizontal padding

- **GIVEN** the SettingsView is rendered
- **WHEN** any `Card.filled` is displayed
- **THEN** the card SHALL have 16 horizontal padding on both sides

### Requirement: Cache size display

The `SettingsView` SHALL display a cache info `ListTile` within a `Card.filled` with `title` set to "快取大小". The `trailing` area SHALL show the formatted cache size value as a `Text` widget styled with `textTheme.bodyLarge` and `colorScheme.onSurfaceVariant`, followed by a clear `IconButton`. The clear `IconButton` SHALL trigger a confirmation dialog before clearing.

#### Scenario: Cache size shown with clear button

- **GIVEN** the SettingsView is rendered
- **WHEN** the cache section is displayed
- **THEN** a `ListTile` inside `Card.filled` SHALL show "快取大小" as `title`, the formatted cache size and a clear `IconButton` in the trailing area

#### Scenario: Cache size updates after clearing

- **GIVEN** cache items have been cleared
- **WHEN** the clear operation completes
- **THEN** the displayed cache size SHALL update to reflect the new total

### Requirement: Clear all button

The cache `ListTile` trailing area SHALL contain an `IconButton` with a broom icon (`Icons.cleaning_services`). The `IconButton` SHALL use `colorScheme.error` as its icon color and SHALL include a `tooltip` for accessibility. Tapping the button SHALL display a confirmation dialog before clearing. The button SHALL be hidden when no cached blogs exist.

After the confirmation dialog is dismissed with `true`, the view SHALL check `mounted` before calling `viewModel.clearAllCache()`.

#### Scenario: Clear button tapped

- **GIVEN** cached blogs exist
- **WHEN** the user taps the clear `IconButton`
- **THEN** a confirmation dialog SHALL appear asking for confirmation

#### Scenario: Clear confirmed with mounted check

- **GIVEN** the user confirms clearing in the dialog
- **WHEN** the dialog returns `true`
- **THEN** the view SHALL check `mounted` before calling `viewModel.clearAllCache()`

#### Scenario: Widget unmounted before confirmation

- **GIVEN** the confirmation dialog is open
- **WHEN** the widget is disposed before the user confirms
- **THEN** `viewModel.clearAllCache()` SHALL NOT be called

### Requirement: Version number display

The `SettingsView` SHALL display the application version number in a dedicated `Card.filled` section with header "關於". The version SHALL be shown as a `ListTile` with title "版本" and the version string as `trailing` text styled with `textTheme.bodyLarge` and `colorScheme.onSurfaceVariant`. The version SHALL be retrieved via `PackageInfo.fromPlatform()` from `package_info_plus` and managed as local widget state.

#### Scenario: Version number shown in About section

- **GIVEN** the SettingsView is rendered
- **WHEN** `PackageInfo.fromPlatform()` returns successfully
- **THEN** a `Card.filled` section with header "關於" SHALL contain a `ListTile` showing "版本" as title and the version string as `trailing` text
