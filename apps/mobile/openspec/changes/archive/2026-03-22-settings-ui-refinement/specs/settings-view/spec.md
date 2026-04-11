## MODIFIED Requirements

### Requirement: Cache size display

The `SettingsView` SHALL display a cache info tile with `title` set to "快取大小". The `additionalInfo` area SHALL show the formatted cache size value followed by a clear button (broom icon). The clear button SHALL trigger a confirmation dialog before clearing.

#### Scenario: Cache size shown with clear button

- **GIVEN** the SettingsView is rendered
- **WHEN** the cache section is displayed
- **THEN** a `CupertinoListTile` SHALL show "快取大小" as `title`, the formatted cache size and a broom-icon clear button in the trailing area

#### Scenario: Cache size updates after clearing

- **GIVEN** cache items have been cleared
- **WHEN** the clear operation completes
- **THEN** the displayed cache size SHALL update to reflect the new total

### Requirement: Clear all button

The cache tile trailing area SHALL contain a clear button with a broom icon (`Icons.cleaning_services`). Tapping the button SHALL display a confirmation dialog before clearing. The button SHALL be hidden when no cached blogs exist.

#### Scenario: Clear button tapped

- **GIVEN** cached blogs exist
- **WHEN** the user taps the clear button (broom icon)
- **THEN** a confirmation `AlertDialog` SHALL be displayed before any data is deleted

#### Scenario: Clear button hidden when no cache

- **GIVEN** no cached blogs exist
- **WHEN** the SettingsView is rendered
- **THEN** the clear button SHALL NOT be displayed

### Requirement: Confirmation dialog

The `SettingsView` SHALL display an `AlertDialog` before executing the clear-all cache operation. The dialog SHALL contain a title describing the operation, a warning message body, a cancel button that dismisses the dialog without action, and a confirm button that executes the clear operation.

#### Scenario: User confirms deletion

- **GIVEN** the confirmation AlertDialog is displayed
- **WHEN** the user presses the confirm button
- **THEN** the clear-all operation SHALL be executed and the dialog SHALL be dismissed

#### Scenario: User cancels deletion

- **GIVEN** the confirmation AlertDialog is displayed
- **WHEN** the user presses the cancel button
- **THEN** the dialog SHALL be dismissed and no data SHALL be deleted

## ADDED Requirements

### Requirement: Inset grouped list layout

The `SettingsView` body SHALL use a `ListView` containing `CupertinoListSection.insetGrouped` widgets to present settings items in iOS inset grouped style. The list SHALL occupy the full screen width. All `CupertinoListTile` items SHALL have a fixed height of 50 with cell content vertically centered. The cell content horizontal padding SHALL be 20 on both sides. The trailing text (cache size value) SHALL use the same font size as the title text.

#### Scenario: Settings displayed in inset grouped style

- **GIVEN** the SettingsView is rendered
- **WHEN** the body content is displayed
- **THEN** settings items SHALL be wrapped in `CupertinoListSection.insetGrouped` with header labels and the list SHALL fill the full screen width

#### Scenario: Cell height is fixed and content is vertically centered

- **GIVEN** the SettingsView is rendered
- **WHEN** any CupertinoListTile is displayed
- **THEN** the tile height SHALL be 50 and all content within the tile SHALL be vertically centered on the Y axis

#### Scenario: Cell horizontal padding

- **GIVEN** the SettingsView is rendered
- **WHEN** any CupertinoListTile is displayed
- **THEN** the cell content SHALL have 20 horizontal padding on both sides

#### Scenario: Trailing text font size matches title

- **GIVEN** the SettingsView is rendered
- **WHEN** the cache size value is displayed in the trailing area
- **THEN** the font size SHALL match the title text font size

### Requirement: Version number display

The `SettingsView` SHALL display the application version number in a dedicated `CupertinoListSection.insetGrouped` with header "關於". The version SHALL be shown as a `CupertinoListTile` with title "版本" and the version string as `additionalInfo`. The version SHALL be retrieved via `PackageInfo.fromPlatform()` from `package_info_plus` and managed as local widget state.

#### Scenario: Version number shown in About section

- **GIVEN** the SettingsView is rendered
- **WHEN** `PackageInfo.fromPlatform()` returns successfully
- **THEN** a `CupertinoListSection.insetGrouped` with header "關於" SHALL contain a tile showing "版本" as title and the version string as `additionalInfo`

## REMOVED Requirements

### Requirement: Cached blog list

**Reason**: Individual blog cache management is removed to simplify the settings UI.
**Migration**: Users SHALL use the "clear all cache" action to manage cache.

### Requirement: Individual clear button

**Reason**: Individual blog cache clearing is removed to simplify the settings UI.
**Migration**: Users SHALL use the "clear all cache" action to manage cache.
