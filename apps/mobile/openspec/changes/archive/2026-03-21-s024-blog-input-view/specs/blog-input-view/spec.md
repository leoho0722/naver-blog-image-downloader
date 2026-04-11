## ADDED Requirements

### Requirement: URL text field rendered

The `BlogInputView` SHALL render a `TextField` widget with `labelText` set to "Naver Blog 網址" and `hintText` set to "https://blog.naver.com/...". The `onChanged` callback SHALL invoke `viewModel.onUrlChanged` to pass the input value to the ViewModel.

#### Scenario: Text field displays label and hint

- **WHEN** the BlogInputView is rendered
- **THEN** a TextField SHALL be visible with the label "Naver Blog 網址" and hint "https://blog.naver.com/..."

#### Scenario: User types a URL

- **WHEN** the user enters text into the TextField
- **THEN** `viewModel.onUrlChanged` SHALL be called with the entered text

### Requirement: Fetch button with loading indicator

The `BlogInputView` SHALL render a `FilledButton` that triggers `viewModel.fetchPhotos` when pressed. When `viewModel.isLoading` is true, the button SHALL be disabled (`onPressed: null`) and SHALL display a `CircularProgressIndicator` with `strokeWidth: 2` instead of the text label. When not loading, the button SHALL display the text "取得照片列表".

#### Scenario: Button in idle state

- **WHEN** `viewModel.isLoading` is false
- **THEN** the FilledButton SHALL display "取得照片列表" and `onPressed` SHALL invoke `viewModel.fetchPhotos`

#### Scenario: Button in loading state

- **WHEN** `viewModel.isLoading` is true
- **THEN** the FilledButton SHALL be disabled and SHALL display a CircularProgressIndicator with strokeWidth 2

### Requirement: Error message displayed

The `BlogInputView` SHALL display an error message text below the TextField when `viewModel.errorMessage` is not null. The error text color SHALL use `Theme.of(context).colorScheme.error`.

#### Scenario: No error present

- **WHEN** `viewModel.errorMessage` is null
- **THEN** no error text SHALL be displayed

#### Scenario: Error message present

- **WHEN** `viewModel.errorMessage` is not null
- **THEN** a Text widget SHALL be rendered with the error message and the theme's error color

### Requirement: Navigation on fetch result

The `BlogInputView` SHALL navigate to the download page when `viewModel.fetchResult` is successfully obtained. The navigation SHALL pass the fetchResult data to the download page.

#### Scenario: Fetch result obtained

- **WHEN** `viewModel.fetchResult` becomes available after a successful fetch
- **THEN** the app SHALL navigate to the download page with the fetchResult data
