## ADDED Requirements

### Requirement: Vitest test environment configuration

The project SHALL configure Vitest in `vite.config.ts` with jsdom environment, React Testing Library, and `@testing-library/jest-dom` matchers. Test files SHALL be located at `src/__tests__/` mirroring the `src/` directory structure.

#### Scenario: Run all tests

- **WHEN** `pnpm test` is executed
- **THEN** Vitest runs all `*.test.ts` and `*.test.tsx` files and reports results

### Requirement: Service layer unit tests

Unit tests SHALL cover `url-validator.ts` (validation and normalization) and `blog-id.ts` (SHA-256 blogId generation). Tests SHALL verify pure function input/output without external dependencies.

#### Scenario: URL validator tests

- **WHEN** url-validator tests execute
- **THEN** tests verify valid URL acceptance, invalid URL rejection, and mobile-to-desktop URL normalization

#### Scenario: BlogId generation tests

- **WHEN** blog-id tests execute
- **THEN** tests verify SHA-256 hex output matches expected first 16 characters for known input strings

### Requirement: API client unit tests with MSW

Unit tests SHALL cover `client.ts` (timeout, retry, dual-layer JSON parsing) and `photos.ts` (submitJob, checkJobStatus, requestPackage, checkPackageStatus) using MSW to mock HTTP responses.

#### Scenario: API client retry test

- **WHEN** MSW returns HTTP 503 twice then HTTP 200
- **THEN** the test verifies the client retries and returns the successful response

#### Scenario: Dual-layer JSON parsing test

- **WHEN** MSW returns `{ "statusCode": 200, "body": "{\"job_id\": \"abc\"}" }`
- **THEN** the test verifies the client returns `{ "job_id": "abc" }`

### Requirement: Store unit tests

Unit tests SHALL cover `use-blog-input-store`, `use-gallery-store`, and `use-download-store`. Tests SHALL verify state transitions: initial state, action invocations, and resulting state changes.

#### Scenario: Gallery store selection test

- **WHEN** the gallery store loads 10 photos and `toggleSelection("photo-3")` is called
- **THEN** `selectedIds` contains `"photo-3"` and `isSelectMode` is `true`

### Requirement: Hook unit tests

Unit tests SHALL cover `use-polling` (polling interval, max attempts, cleanup on unmount) and `use-clipboard` (focus event detection). Tests SHALL use `@testing-library/react`'s `renderHook`.

#### Scenario: Polling cleanup on unmount

- **WHEN** a component using `usePolling` unmounts during active polling
- **THEN** the polling interval is cleared and no further API calls are made

### Requirement: Component unit tests

Unit tests SHALL cover `BlogInputForm`, `PhotoGrid`, `PhotoCard`, `SelectionToolbar`, and `DownloadProgress`. Tests SHALL use React Testing Library to simulate user interactions and verify rendered output.

#### Scenario: BlogInputForm submission test

- **WHEN** user types a valid URL and clicks the fetch button
- **THEN** the test verifies the store's `fetchPhotos` action is triggered

#### Scenario: PhotoCard selection test

- **WHEN** selection mode is active and user clicks a PhotoCard
- **THEN** the test verifies the card displays a selected state
