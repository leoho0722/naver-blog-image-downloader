## ADDED Requirements

### Requirement: Build-time app version injection

The Vite build configuration SHALL define a global constant `__APP_VERSION__` injected at build time from the `version` field of `apps/web/package.json`. A TypeScript declaration SHALL exist so that `__APP_VERSION__` is typed as `string`. The RootLayout header SHALL display the version as `v<semver>` next to the app title, using subdued styling (`text-xs`, `color-on-surface-variant`) that is visible on all pages.

#### Scenario: Version displayed in header

- **WHEN** the user opens any page of the Web app
- **THEN** the header displays the current version string in the format `v<semver>` (e.g., `v1.1.0`)

#### Scenario: Version matches package.json

- **WHEN** `apps/web/package.json` has `"version": "1.1.0"`
- **THEN** the header displays `v1.1.0`
