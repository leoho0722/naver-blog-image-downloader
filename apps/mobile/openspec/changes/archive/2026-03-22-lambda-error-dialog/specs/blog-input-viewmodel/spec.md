## ADDED Requirements

### Requirement: Human-readable error messages

The `BlogInputViewModel` SHALL convert all error types to human-readable Chinese messages before setting `errorMessage`. For `AppError` with `AppErrorType.serverError`, the message SHALL be "伺服器處理失敗，請稍後再試". For `AppError` with `AppErrorType.networkError`, the message SHALL be "網路連線異常，請檢查網路設定". For any other `AppError` type, the message SHALL be "發生錯誤，請稍後再試". The `errorMessage` property SHALL NOT contain raw JSON, technical details, or unicode escape sequences.

#### Scenario: Server error produces human-readable message

- **GIVEN** `PhotoRepository.fetchPhotos()` returns `Result.error` with `AppError(type: AppErrorType.serverError)`
- **WHEN** the error is processed
- **THEN** `errorMessage` SHALL be "伺服器處理失敗，請稍後再試"

#### Scenario: Network error produces human-readable message

- **GIVEN** `PhotoRepository.fetchPhotos()` returns `Result.error` with `AppError(type: AppErrorType.networkError)`
- **WHEN** the error is processed
- **THEN** `errorMessage` SHALL be "網路連線異常，請檢查網路設定"

#### Scenario: Unknown error produces generic message

- **GIVEN** an unexpected error type is encountered
- **WHEN** the error is processed
- **THEN** `errorMessage` SHALL be "發生錯誤，請稍後再試"
