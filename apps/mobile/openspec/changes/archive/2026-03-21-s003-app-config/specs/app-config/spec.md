## ADDED Requirements

### Requirement: ApiStage enum defined

The file `lib/config/app_config.dart` SHALL define an `ApiStage` enum that represents API Gateway deployment stages.

- `ApiStage` SHALL contain the following values: `defaultStage`, `ut`, `stg`, `uat`, `prod`.
- Each value SHALL have a `String value` property corresponding to the API Gateway URL path segment.

#### Scenario: Stage value mapping

- **WHEN** `ApiStage.defaultStage.value` is accessed
- **THEN** it SHALL return `'default'`

#### Scenario: All stages have distinct values

- **WHEN** all `ApiStage.values` are enumerated
- **THEN** each SHALL have a unique `value` property

### Requirement: AppConfig class defined

The file `lib/config/app_config.dart` SHALL define an `AppConfig` abstract final class that provides API configuration with compile-time stage switching via `--dart-define=API_STAGE`.

- `AppConfig` SHALL be declared as `abstract final class` to prevent instantiation and inheritance.
- `AppConfig` SHALL read the `API_STAGE` compile-time environment variable, defaulting to `'default'` when unspecified.
- `AppConfig` SHALL expose a `stage` property of type `ApiStage` resolved from the environment variable.
- `AppConfig` SHALL expose a `baseUrl` getter that concatenates the API host with the stage value.

#### Scenario: Default stage when no dart-define provided

- **WHEN** the application is compiled without `--dart-define=API_STAGE`
- **THEN** `AppConfig.stage` SHALL be `ApiStage.defaultStage`
- **AND** `AppConfig.baseUrl` SHALL end with `'/default'`

#### Scenario: Custom stage via dart-define

- **WHEN** the application is compiled with `--dart-define=API_STAGE=uat`
- **THEN** `AppConfig.stage` SHALL be `ApiStage.uat`
- **AND** `AppConfig.baseUrl` SHALL end with `'/uat'`

#### Scenario: Invalid stage falls back to default

- **WHEN** the application is compiled with an unrecognized `API_STAGE` value
- **THEN** `AppConfig.stage` SHALL fall back to `ApiStage.defaultStage`

#### Scenario: AppConfig cannot be instantiated

- **WHEN** an attempt is made to instantiate `AppConfig`
- **THEN** the Dart compiler SHALL reject the code at compile time

### Requirement: Constants class defined

The file `lib/utils/constants.dart` SHALL define a `Constants` abstract final class that provides shared application constants.

- `Constants` SHALL be declared as `abstract final class` to prevent instantiation and inheritance.
- `Constants` SHALL define the application name as a `static const String`.

#### Scenario: Application name constant is accessible

- **WHEN** `Constants.appName` is referenced
- **THEN** it SHALL return a non-empty `String`

#### Scenario: Constants cannot be instantiated

- **WHEN** an attempt is made to instantiate `Constants`
- **THEN** the Dart compiler SHALL reject the code at compile time
