## ADDED Requirements

### Requirement: View initialization without unnecessary postFrameCallback

The `PhotoDetailView` SHALL load data in `didChangeDependencies` using a `_loaded` flag to ensure single execution. The ViewModel `load()` call SHALL be invoked directly without wrapping in `WidgetsBinding.instance.addPostFrameCallback`.

#### Scenario: Data loaded on first build

- **WHEN** the PhotoDetailView is rendered for the first time
- **THEN** `viewModel.load()` SHALL be called directly in `didChangeDependencies`

#### Scenario: Data not reloaded on subsequent builds

- **WHEN** `didChangeDependencies` is called after the first time
- **THEN** `viewModel.load()` SHALL NOT be called again
