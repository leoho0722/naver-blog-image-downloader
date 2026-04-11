## MODIFIED Requirements

### Requirement: SHA-256 blogId generation

The `CacheRepository.blogId(String blogUrl)` method SHALL first normalize the given blog URL using `NaverUrlValidator.normalize()`, then compute a SHA-256 hash of the normalized URL and return the first 16 hexadecimal characters as the blog identifier. This ensures that mobile (`https://m.blog.naver.com/...`) and desktop (`https://blog.naver.com/...`) URLs for the same blog post produce identical blog identifiers.

#### Scenario: Consistent blogId for same URL

- **WHEN** `blogId` is called with the same URL multiple times
- **THEN** it SHALL return the same 16-character hexadecimal string each time

#### Scenario: Different blogId for different URLs

- **WHEN** `blogId` is called with two distinct blog post URLs (different blog posts)
- **THEN** it SHALL return different identifiers

#### Scenario: Same blogId for mobile and desktop URLs of same post

- **WHEN** `blogId` is called with `https://m.blog.naver.com/edament/224238392216`
- **AND** `blogId` is called with `https://blog.naver.com/edament/224238392216`
- **THEN** both calls SHALL return the same 16-character hexadecimal string
