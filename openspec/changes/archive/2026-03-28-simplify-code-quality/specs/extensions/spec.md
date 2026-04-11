## REMOVED Requirements

### Requirement: String URL validation extensions

**Reason**: The `isValidUrl` and `isNaverBlogUrl` extension methods on `String` are dead code — they are not referenced anywhere in the `lib/` directory. The project uses `NaverUrlValidator.isValid()` (a dedicated static utility class) for all Naver Blog URL validation. Keeping these unused methods creates a maintenance burden and risks confusion with the canonical validation path.

**Migration**: No migration is needed. All call sites already use `NaverUrlValidator.isValid()` from `lib/ui/core/naver_url_validator.dart`. The `StringExtension` extension SHALL continue to provide `sanitizeFileName()` (and `IntExtension` SHALL continue to provide `toFileSizeString()`).

#### Scenario: URL validation methods no longer exist

- **WHEN** `extensions.dart` is loaded
- **THEN** the `StringExtension` extension SHALL NOT contain `isValidUrl` or `isNaverBlogUrl` methods

#### Scenario: Remaining extensions unaffected

- **WHEN** `sanitizeFileName()` or `toFileSizeString()` is called after removal
- **THEN** they SHALL continue to function identically to their previous behavior
