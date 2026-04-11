## ADDED Requirements

### Requirement: String URL validation extensions

The file `lib/utils/extensions.dart` SHALL define a `StringExtension` extension on `String` that provides URL validation methods.

- `isValidUrl` SHALL return `true` if the string is a valid URL with http or https scheme, and `false` otherwise.
- `isNaverBlogUrl` SHALL return `true` if the string is a valid Naver Blog URL (matching the `blog.naver.com` domain), and `false` otherwise.

#### Scenario: Valid URL detected

- **WHEN** `isValidUrl` is called on a string like `"https://example.com"`
- **THEN** it SHALL return `true`

#### Scenario: Invalid URL detected

- **WHEN** `isValidUrl` is called on a string like `"not a url"`
- **THEN** it SHALL return `false`

#### Scenario: Valid Naver Blog URL detected

- **WHEN** `isNaverBlogUrl` is called on a string like `"https://blog.naver.com/username/12345"`
- **THEN** it SHALL return `true`

#### Scenario: Non-Naver URL rejected

- **WHEN** `isNaverBlogUrl` is called on a string like `"https://example.com"`
- **THEN** it SHALL return `false`

### Requirement: String file name sanitization extension

The `StringExtension` extension SHALL provide a `sanitizeFileName` method that produces a file-system-safe string.

- `sanitizeFileName` SHALL remove or replace characters that are not allowed in file names (such as `/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`).
- `sanitizeFileName` SHALL return a non-empty string.

#### Scenario: Special characters removed

- **WHEN** `sanitizeFileName` is called on a string containing special characters
- **THEN** the returned string SHALL NOT contain any file-system-illegal characters

#### Scenario: Safe string unchanged

- **WHEN** `sanitizeFileName` is called on a string that is already file-system-safe
- **THEN** the returned string SHALL be equal to the original string

### Requirement: Integer file size formatting extension

The file `lib/utils/extensions.dart` SHALL define an `IntExtension` extension on `int` that provides a `toFileSizeString` method.

- `toFileSizeString` SHALL convert byte counts to human-readable file size strings with two decimal places (e.g., "1.50 MB", "500.00 KB").
- `toFileSizeString` SHALL use appropriate units: B, KB, MB, GB.

#### Scenario: Bytes displayed correctly

- **WHEN** `toFileSizeString` is called on an integer less than 1024
- **THEN** it SHALL return a string with the "B" unit

#### Scenario: Megabytes displayed correctly

- **WHEN** `toFileSizeString` is called on an integer representing megabytes (e.g., 1572864)
- **THEN** it SHALL return a string with the "MB" unit (e.g., "1.50 MB")
