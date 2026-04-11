## ADDED Requirements

### Requirement: LocalStorageService class with injectable SharedPreferences

The file `lib/data/services/local_storage_service.dart` SHALL define a `LocalStorageService` class that accepts a `SharedPreferences` instance via its constructor.

- `LocalStorageService` SHALL store the injected `SharedPreferences` as a private final field.
- The constructor SHALL require a named parameter `prefs` of type `SharedPreferences` (i.e., `required SharedPreferences prefs`).

#### Scenario: LocalStorageService is instantiated with SharedPreferences

- **WHEN** a `LocalStorageService` is created with a `SharedPreferences` instance
- **THEN** it SHALL be successfully instantiated without errors

### Requirement: getString and setString operations

The `LocalStorageService` SHALL provide methods for reading and writing string values.

- `getString(String key)` SHALL return `String?` by calling `SharedPreferences.getString(key)`.
- `setString(String key, String value)` SHALL return `Future<bool>` by calling `SharedPreferences.setString(key, value)`.

#### Scenario: String value is stored and retrieved

- **GIVEN** a key-value pair is stored using `setString`
- **WHEN** `getString` is called with the same key
- **THEN** it SHALL return the previously stored string value

#### Scenario: Non-existent key returns null

- **GIVEN** no value has been stored for a given key
- **WHEN** `getString` is called with that key
- **THEN** it SHALL return `null`

### Requirement: getBool and setBool operations

The `LocalStorageService` SHALL provide methods for reading and writing boolean values.

- `getBool(String key)` SHALL return `bool?` by calling `SharedPreferences.getBool(key)`.
- `setBool(String key, bool value)` SHALL return `Future<bool>` by calling `SharedPreferences.setBool(key, value)`.

#### Scenario: Bool value is stored and retrieved

- **GIVEN** a boolean value is stored using `setBool`
- **WHEN** `getBool` is called with the same key
- **THEN** it SHALL return the previously stored boolean value

#### Scenario: Non-existent bool key returns null

- **GIVEN** no value has been stored for a given key
- **WHEN** `getBool` is called with that key
- **THEN** it SHALL return `null`

### Requirement: remove operation

The `LocalStorageService` SHALL provide a `remove` method for deleting stored values.

- `remove(String key)` SHALL return `Future<bool>` by calling `SharedPreferences.remove(key)`.
- After removal, subsequent reads for the same key SHALL return `null`.

#### Scenario: Value is removed successfully

- **GIVEN** a value has been stored for a key
- **WHEN** `remove` is called with that key
- **THEN** it SHALL return `true` and subsequent reads SHALL return `null`

#### Scenario: Removing non-existent key

- **GIVEN** no value exists for a key
- **WHEN** `remove` is called with that key
- **THEN** it SHALL complete without error
