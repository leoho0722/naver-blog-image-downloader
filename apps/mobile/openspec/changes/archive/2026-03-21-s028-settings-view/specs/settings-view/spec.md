## ADDED Requirements

### Requirement: Cache size display

The `SettingsView` SHALL display the total cache size as a formatted text string obtained from the ViewModel. The cache size SHALL be visible at the top of the settings page.

#### Scenario: Cache size shown

- **WHEN** the SettingsView is rendered
- **THEN** a Text widget SHALL display the total cache size from the ViewModel

#### Scenario: Cache size updates after clearing

- **WHEN** cache items are cleared
- **THEN** the displayed cache size SHALL update to reflect the new total

### Requirement: Cached blog list

The `SettingsView` SHALL display a list of cached Blog entries using a `ListView`. Each list item SHALL show the Blog name or URL to identify the cached content.

#### Scenario: Blogs are cached

- **WHEN** the ViewModel provides a non-empty list of cached blogs
- **THEN** a ListView SHALL render one item per cached blog

#### Scenario: No blogs cached

- **WHEN** the cached blog list is empty
- **THEN** the ListView SHALL render with no items

### Requirement: Clear all button

The `SettingsView` SHALL provide a "clear all" button that triggers the deletion of all cached data. The button SHALL NOT execute the clear operation directly; it SHALL first display a confirmation dialog.

#### Scenario: Clear all button pressed

- **WHEN** the user presses the clear all button
- **THEN** a confirmation AlertDialog SHALL be displayed before any data is deleted

### Requirement: Individual clear button

Each cached Blog item in the list SHALL have an individual clear button (IconButton) that allows the user to delete the cache for that specific Blog. The button SHALL NOT execute the clear operation directly; it SHALL first display a confirmation dialog.

#### Scenario: Individual clear button pressed

- **WHEN** the user presses the clear button next to a specific Blog item
- **THEN** a confirmation AlertDialog SHALL be displayed before that Blog's cache is deleted

### Requirement: Confirmation dialog

The `SettingsView` SHALL display an `AlertDialog` before executing any cache clear operation (both clear-all and individual clear). The dialog SHALL contain a title describing the operation, a warning message body, a cancel button that dismisses the dialog without action, and a confirm button that executes the clear operation.

#### Scenario: User confirms deletion

- **WHEN** the user presses the confirm button in the AlertDialog
- **THEN** the corresponding clear operation SHALL be executed and the dialog SHALL be dismissed

#### Scenario: User cancels deletion

- **WHEN** the user presses the cancel button in the AlertDialog
- **THEN** the dialog SHALL be dismissed and no data SHALL be deleted
