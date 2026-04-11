## MODIFIED Requirements

### Requirement: Inset grouped list layout

The `SettingsView` body SHALL use a `ListView` containing Material 3 `Card.filled` widgets to present settings items in card-style grouped sections. The section order SHALL be: Appearance, App Icon, Language, Cache, About. Each section SHALL have a header `Text` widget placed above the `Card.filled`, styled with `Theme.of(context).textTheme.titleSmall` and `colorScheme.onSurfaceVariant`. All section header text SHALL be sourced from `AppLocalizations`. The `Card.filled` SHALL contain `ListTile` widgets for individual items. The `Card.filled` widgets SHALL have horizontal padding of 16. The section headers SHALL have left padding of 28. The `Scaffold` SHALL NOT set an explicit `backgroundColor`; it SHALL use the default theme surface color.

#### Scenario: Settings displayed in Material 3 card style

- **GIVEN** the SettingsView is rendered
- **WHEN** the body content is displayed
- **THEN** settings items SHALL be wrapped in `Card.filled` widgets with section header labels above each card
- **AND** the section order SHALL be: Appearance, App Icon, Language, Cache, About

#### Scenario: Section header styling

- **GIVEN** the SettingsView is rendered
- **WHEN** a section header is displayed
- **THEN** the header text SHALL use `textTheme.titleSmall` with `colorScheme.onSurfaceVariant` color
- **AND** the text SHALL be sourced from `AppLocalizations`

#### Scenario: Card horizontal padding

- **GIVEN** the SettingsView is rendered
- **WHEN** any `Card.filled` is displayed
- **THEN** the card SHALL have 16 horizontal padding on both sides

## ADDED Requirements

### Requirement: App icon picker style enum

The `SettingsView` SHALL define an `AppIconPickerStyle` enum with two values: `horizontalScroll` and `bottomSheet`. The current picker style SHALL be stored as mutable widget state, defaulting to `horizontalScroll`.

#### Scenario: Default picker style

- **GIVEN** the SettingsView is first rendered
- **WHEN** the App Icon section is displayed
- **THEN** the picker style SHALL be `horizontalScroll`

### Requirement: App icon section header with style toggle

The "App Icon" section header SHALL display the section title on the left and a style toggle button on the right. The toggle button SHALL consist of an icon and a localized label indicating the target mode (the mode that will be activated on tap). When tapped, it SHALL switch `_appIconPickerStyle` between `horizontalScroll` and `bottomSheet` via `setState`.

- When current style is `horizontalScroll`, the toggle SHALL display a grid icon (`Icons.view_module_rounded`) with label from `settingsAppIconStyleSheet` (e.g., "以網格檢視").
- When current style is `bottomSheet`, the toggle SHALL display a swipe icon (`Icons.swipe_rounded`) with label from `settingsAppIconStyleScroll` (e.g., "以滑動檢視").

#### Scenario: Toggle from horizontal scroll to bottom sheet

- **GIVEN** the current picker style is `horizontalScroll`
- **WHEN** the user taps the style toggle
- **THEN** the picker style SHALL change to `bottomSheet`
- **AND** the toggle label SHALL update to show the scroll view option

#### Scenario: Toggle from bottom sheet to horizontal scroll

- **GIVEN** the current picker style is `bottomSheet`
- **WHEN** the user taps the style toggle
- **THEN** the picker style SHALL change to `horizontalScroll`
- **AND** the toggle label SHALL update to show the grid view option

### Requirement: App icon horizontal scroll picker

When `_appIconPickerStyle` is `horizontalScroll`, the App Icon section SHALL display a horizontally scrollable list of icon cards centered on screen. Each card SHALL contain:
- A 72x72 `Image.asset` showing the icon's `previewAsset` wrapped in a `ClipRRect` with 16px border radius.
- A `Row` below the image with a radio button icon (`Icons.radio_button_checked` when selected, `Icons.radio_button_unchecked` otherwise) and a localized name label.
- Selected items SHALL use `colorScheme.primary` color and `FontWeight.bold`; unselected items SHALL use `colorScheme.onSurfaceVariant` and `FontWeight.normal`.

The scroll view SHALL NOT display a scrollbar indicator. Items SHALL be spaced with `Row.spacing: 24`. When tapped, it SHALL call `AppSettingsViewModel.setAppIcon(icon)`.

#### Scenario: Horizontal scroll renders with selection

- **GIVEN** the picker style is `horizontalScroll` and `appIcon` is `AppIcon.defaultIcon`
- **WHEN** the section is displayed
- **THEN** the default icon SHALL show `radio_button_checked` and the new icon SHALL show `radio_button_unchecked`

#### Scenario: User selects icon in horizontal scroll

- **GIVEN** the horizontal scroll picker is displayed
- **WHEN** the user taps the new icon card
- **THEN** `AppSettingsViewModel.setAppIcon(AppIcon.newIcon)` SHALL be called

### Requirement: App icon bottom sheet trigger

When `_appIconPickerStyle` is `bottomSheet`, the App Icon section SHALL display an `InputDecorator` showing the currently selected icon (32x32 preview image + localized name + dropdown arrow). When tapped, it SHALL open a modal bottom sheet.

#### Scenario: Bottom sheet trigger shows current icon

- **GIVEN** the picker style is `bottomSheet` and `appIcon` is `AppIcon.newIcon`
- **WHEN** the section is displayed
- **THEN** the trigger SHALL show the new icon's preview image and localized name

### Requirement: App icon bottom sheet grid

The App Icon bottom sheet SHALL display a centered title from `settingsAppIconSheetTitle` (e.g., "選擇 App 圖示") followed by a 3-column `GridView` of icon options. Each grid item SHALL contain:
- A 64x64 `Image.asset` wrapped in a `ClipRRect` with 16px border radius.
- A `Row` with a radio button icon and localized name label below the image.

When the user taps a grid item, the bottom sheet SHALL dismiss and call `AppSettingsViewModel.setAppIcon(icon)`.

#### Scenario: Bottom sheet grid renders with selection

- **GIVEN** the bottom sheet is opened and `appIcon` is `AppIcon.defaultIcon`
- **WHEN** the grid is displayed
- **THEN** the default icon SHALL show `radio_button_checked` and the new icon SHALL show `radio_button_unchecked`

#### Scenario: User selects icon in grid

- **GIVEN** the bottom sheet grid is displayed
- **WHEN** the user taps the new icon
- **THEN** the bottom sheet SHALL dismiss
- **AND** `AppSettingsViewModel.setAppIcon(AppIcon.newIcon)` SHALL be called
