## MODIFIED Requirements

### Requirement: Navigation on fetch result

The `BlogInputView` SHALL navigate to the download page when `viewModel.fetchResult` is successfully obtained. The navigation SHALL pass the fetchResult data to the download page.

The `_BlogInputViewState` SHALL store a reference to `BlogInputViewModel` in a `late final` field during `initState`. The `dispose` method SHALL use this stored reference to remove the listener, instead of calling `context.read<BlogInputViewModel>()`.

#### Scenario: Fetch result obtained

- **WHEN** `viewModel.fetchResult` becomes available after a successful fetch
- **THEN** the app SHALL navigate to the download page with the fetchResult data

#### Scenario: ViewModel reference stored safely

- **WHEN** `initState` is called
- **THEN** the ViewModel reference SHALL be stored in a `late final` field

#### Scenario: Listener removed safely on dispose

- **WHEN** `dispose` is called
- **THEN** the listener SHALL be removed using the stored ViewModel reference, NOT via `context.read`
