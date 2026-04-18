## ADDED Requirements

### Requirement: Privacy policy page at /privacy

The Web app SHALL render a `PrivacyPolicyPage` component at the `/privacy` route within `PublicLayout`. The page SHALL serve as the canonical privacy policy for the project, linkable from App Store Connect, Google Play Console, the mobile app Settings view, and the web `IntroFooter`.

The page SHALL contain, in this top-to-bottom order:

- Page title sourced from i18n key `privacy.pageTitle`
- A metadata row displaying the last-updated date and document version, labeled with i18n keys `privacy.lastUpdatedLabel` and `privacy.versionLabel`. The date value SHALL come from the `PRIVACY_POLICY_LAST_UPDATED` constant exported by `apps/web/src/lib/config/privacy-policy.ts`. The version value SHALL be `v${__APP_VERSION__}`.
- Introductory paragraph from i18n key `privacy.intro`
- A sequence of content sections rendered from `t('privacy.sections', { returnObjects: true })`, where each section is an object with `id`, `title`, and `body` fields. `body` SHALL support either a plain string or an array of strings (rendered as paragraphs).
- A contact section with heading `privacy.contact.title` and a contact email derived from `privacy.contact.email`.

#### Scenario: Page renders at /privacy

- **WHEN** a user navigates to `/privacy`
- **THEN** `PrivacyPolicyPage` is rendered inside `PublicLayout` with the page title, last-updated row, version row, intro paragraph, all configured sections, and contact block

#### Scenario: Last-updated date matches config constant

- **WHEN** `PRIVACY_POLICY_LAST_UPDATED` is set to `"2026-04-18"` in `apps/web/src/lib/config/privacy-policy.ts`
- **THEN** the last-updated row on the rendered page shows the value `2026-04-18` next to the `privacy.lastUpdatedLabel` label

#### Scenario: Document version matches build-time app version

- **WHEN** `apps/web/package.json` has `"version": "1.7.0"` at build time
- **THEN** the version row on the rendered page shows `v1.7.0` next to the `privacy.versionLabel` label

---

### Requirement: Four-locale content coverage with structural parity

The `privacy.*` i18n namespace SHALL exist in all four locale files `apps/web/src/lib/i18n/messages/{zh-TW,en,ja,ko}.json`. All four locales SHALL define the same set of keys with the same `privacy.sections` array length and the same per-section `id` values in the same order.

A unit test at `apps/web/src/__tests__/lib/i18n/privacy-parity.test.ts` SHALL assert that all four locales contain identical key paths under `privacy.*` and identical section `id` ordering.

#### Scenario: All four locales defined

- **WHEN** the privacy namespace is loaded from `zh-TW.json`, `en.json`, `ja.json`, and `ko.json`
- **THEN** every key path present in one locale is present in all four, and no locale has extra keys relative to the others

#### Scenario: Section id ordering matches across locales

- **WHEN** `privacy.sections` is read from each of the four locales
- **THEN** the resulting arrays have the same length and the same `id` value at every index position

---

### Requirement: Privacy link in IntroFooter

The `IntroFooter` component SHALL render a link labeled from i18n key `privacy.footerLink` that navigates to `/privacy`. The link SHALL appear on every page that uses `PublicLayout`, including `IntroRootPage`, `IntroMobilePage`, `IntroWebPage`, `NotFoundPage`, and `PrivacyPolicyPage` itself.

#### Scenario: Footer shows privacy link on landing page

- **WHEN** a user views `/`
- **THEN** `IntroFooter` renders a link with the text from `privacy.footerLink` that points to `/privacy`

#### Scenario: Clicking footer privacy link navigates to page

- **WHEN** a user clicks the privacy link in `IntroFooter` from any `PublicLayout` page
- **THEN** the browser navigates to `/privacy` and `PrivacyPolicyPage` renders

---

### Requirement: Privacy-policy config constants

The module `apps/web/src/lib/config/privacy-policy.ts` SHALL export:

- `PRIVACY_POLICY_LAST_UPDATED: string` — ISO 8601 date (`YYYY-MM-DD`) of the most recent substantive content update
- `PRIVACY_POLICY_CONTACT_EMAIL: string` — the contact email address shown in the contact section

These constants SHALL be the single source of truth consumed by `PrivacyPolicyPage` and by any future automated checks. Updating either constant SHALL be the mechanism for signaling a policy revision, and the i18n content SHALL be updated in the same revision whenever the wording of any section changes.

#### Scenario: Last-updated constant exported as ISO date

- **WHEN** the module `apps/web/src/lib/config/privacy-policy.ts` is imported
- **THEN** `PRIVACY_POLICY_LAST_UPDATED` resolves to a string matching `/^\d{4}-\d{2}-\d{2}$/`

#### Scenario: Contact email constant exported

- **WHEN** the module is imported
- **THEN** `PRIVACY_POLICY_CONTACT_EMAIL` resolves to a non-empty string containing the `@` character

---

### Requirement: Page-level meta set at runtime

When `PrivacyPolicyPage` mounts, it SHALL set `document.title` to a localized value derived from `privacy.pageTitle`, and it SHALL ensure a `<meta name="description">` element exists in `document.head` with content derived from `privacy.intro`. When the component unmounts, it SHALL restore the previous `document.title` value so that other routes are not affected.

#### Scenario: Document title updated on mount

- **WHEN** a user opens `/privacy`
- **THEN** `document.title` equals the value of `privacy.pageTitle` for the current locale

#### Scenario: Document title restored on unmount

- **WHEN** a user navigates away from `/privacy` to `/`
- **THEN** `document.title` equals the value it had before `PrivacyPolicyPage` mounted
