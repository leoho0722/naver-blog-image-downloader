## ADDED Requirements

### Requirement: Normalize mobile URL to desktop format

The `NaverUrlValidator` SHALL provide a static method `normalize(String url)` that converts mobile Naver Blog URLs to their desktop equivalent. The method SHALL replace the prefix `https://m.blog.naver.com/` with `https://blog.naver.com/`. If the URL does not start with `https://m.blog.naver.com/`, the method SHALL return the original URL unchanged.

#### Scenario: Mobile URL normalized to desktop

- **GIVEN** the input is `https://m.blog.naver.com/edament/224238392216`
- **WHEN** `normalize` is called
- **THEN** it SHALL return `https://blog.naver.com/edament/224238392216`

#### Scenario: Desktop URL remains unchanged

- **GIVEN** the input is `https://blog.naver.com/edament/224238392216`
- **WHEN** `normalize` is called
- **THEN** it SHALL return `https://blog.naver.com/edament/224238392216`

#### Scenario: Non-Naver URL remains unchanged

- **GIVEN** the input is `https://example.com/some-page`
- **WHEN** `normalize` is called
- **THEN** it SHALL return `https://example.com/some-page`

#### Scenario: Mobile URL with path preserved

- **GIVEN** the input is `https://m.blog.naver.com/user/12345?query=abc`
- **WHEN** `normalize` is called
- **THEN** it SHALL return `https://blog.naver.com/user/12345?query=abc`
