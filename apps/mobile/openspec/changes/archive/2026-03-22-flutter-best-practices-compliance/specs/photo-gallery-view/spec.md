## MODIFIED Requirements

### Requirement: GridView gallery layout

The `PhotoGalleryView` SHALL render a `GridView` widget to display photo cards in a grid layout. Each cell in the grid SHALL contain a `PhotoCard` widget. The GridView SHALL use a builder pattern for efficient rendering of large photo collections.

The `PhotoCard.cachedFile` SHALL be obtained synchronously from `viewModel.cachedFiles[photo.id]` instead of using a `FutureBuilder`. The view SHALL NOT create new `Future` instances inside the `build` method.

#### Scenario: Gallery renders grid of photos

- **WHEN** the PhotoGalleryView is rendered with a list of photos
- **THEN** a GridView SHALL display PhotoCard widgets in a grid layout

#### Scenario: Empty gallery

- **WHEN** the photo list is empty
- **THEN** the GridView SHALL render with no children

#### Scenario: Cached files accessed synchronously

- **WHEN** a PhotoCard is built in the GridView
- **THEN** the `cachedFile` SHALL be read from `viewModel.cachedFiles` without creating a new Future

## ADDED Requirements

### Requirement: View initialization without unnecessary postFrameCallback

The `PhotoGalleryView` SHALL load data in `didChangeDependencies` using a `_loaded` flag to ensure single execution. The ViewModel `load()` call SHALL be invoked directly without wrapping in `WidgetsBinding.instance.addPostFrameCallback`.

#### Scenario: Data loaded on first build

- **WHEN** the PhotoGalleryView is rendered for the first time
- **THEN** `viewModel.load()` SHALL be called directly in `didChangeDependencies`

#### Scenario: Data not reloaded on subsequent builds

- **WHEN** `didChangeDependencies` is called after the first time
- **THEN** `viewModel.load()` SHALL NOT be called again
