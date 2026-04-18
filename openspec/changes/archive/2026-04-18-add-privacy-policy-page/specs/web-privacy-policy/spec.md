## ADDED Requirements

### Requirement: Privacy policy page at /privacy

The Web app SHALL render a `PrivacyPolicyPage` component at the `/privacy` route within `PublicLayout`. The page SHALL serve as the canonical privacy policy for the project, linkable from App Store Connect, Google Play Console, the mobile app Settings view, and the web `IntroFooter`.

The page SHALL contain, in this top-to-bottom order:

- Page title sourced from i18n key `privacy.pageTitle`
- A metadata row displaying the last-updated date, labeled with i18n key `privacy.lastUpdatedLabel`. The date value SHALL come from the `PRIVACY_POLICY_LAST_UPDATED` constant exported by `apps/web/src/lib/config/privacy-policy.ts`.
- Introductory paragraph from i18n key `privacy.intro`
- A sequence of content sections rendered from `t('privacy.sections', { returnObjects: true })`, where each section is an object with `id`, `title`, and `body` fields. `body` SHALL support either a plain string or an array of strings (rendered as paragraphs).
- A contact section with heading `privacy.contact.title`, body `privacy.contact.body`, and a call-to-action link whose label comes from `privacy.contact.issueLinkLabel` and whose `href` equals `privacy.contact.issueUrl`. The link SHALL open in a new tab (`target="_blank"` with `rel="noopener noreferrer"`).

The page SHALL NOT display any Web App version string. Version disclosure for the Web App belongs to the App Layout header; it is out of scope for the privacy policy page.

#### Scenario: Page renders at /privacy

- **WHEN** a user navigates to `/privacy`
- **THEN** `PrivacyPolicyPage` is rendered inside `PublicLayout` with the page title, last-updated row, intro paragraph, all configured sections, and contact block

#### Scenario: Last-updated date matches config constant

- **WHEN** `PRIVACY_POLICY_LAST_UPDATED` is set to `"2026-04-18"` in `apps/web/src/lib/config/privacy-policy.ts`
- **THEN** the last-updated row on the rendered page shows the value `2026-04-18` next to the `privacy.lastUpdatedLabel` label

#### Scenario: Version string is not rendered

- **WHEN** the page is rendered under any locale
- **THEN** no `v<semver>` text derived from `__APP_VERSION__` appears anywhere on the page

#### Scenario: Contact link points to GitHub issues in a new tab

- **WHEN** the page is rendered
- **THEN** the contact section contains an anchor whose `href` equals `privacy.contact.issueUrl` and whose `target` attribute equals `_blank`

---

### Requirement: Four-locale content coverage with structural parity

The `privacy.*` i18n namespace SHALL exist in all four locale files `apps/web/src/lib/i18n/messages/{zh-TW,en,ja,ko}.json`. All four locales SHALL define the same set of keys (excluding differences in `privacy.sections[].body` array lengths), and `privacy.sections` SHALL have the same length with the same per-section `id` values in the same order.

The `privacy.contact.issueUrl` value SHALL be identical across all four locales, so that every locale links to the same canonical GitHub issues endpoint.

A unit test at `apps/web/src/__tests__/lib/i18n/privacy-parity.test.ts` SHALL assert that all four locales contain identical key paths under `privacy.*` (excluding `privacy.sections` sub-paths) and identical section `id` ordering.

#### Scenario: All four locales defined

- **WHEN** the privacy namespace is loaded from `zh-TW.json`, `en.json`, `ja.json`, and `ko.json`
- **THEN** every key path present in one locale is present in all four, and no locale has extra keys relative to the others

#### Scenario: Section id ordering matches across locales

- **WHEN** `privacy.sections` is read from each of the four locales
- **THEN** the resulting arrays have the same length and the same `id` value at every index position

#### Scenario: Issue URL is identical across locales

- **WHEN** `privacy.contact.issueUrl` is read from each of the four locales
- **THEN** all four locales return the same string value

---

### Requirement: Required privacy content topics

`privacy.sections` SHALL include, at minimum, sections with the following `id` values (in any order the project maintainer chooses, but consistent across all four locales):

- `dataCollection` — what categories of data are collected
- `dataUsage` — purposes for which the data is used
- `thirdParty` — named third-party services that process the data
- `dataTransfer` — disclosure of cross-border data transfers (GDPR Art. 13(1)(f) / PIPA §17)
- `retention` — how long data is kept and how it is deleted, including a commitment to delete all cloud records when the project is discontinued
- `security` — the baseline security posture (encryption in transit, encryption at rest per platform defaults)
- `userRights` — self-service actions available to the user, with an explicit acknowledgement that individual GDPR Articles 15–20 rights cannot be fulfilled per-user because the project does not collect identifying data
- `children` — the project's stance on children's data, referencing the differing age thresholds across COPPA, PIPA, and GDPR
- `legalBasis` — GDPR Article 6 legal bases relied on for EU/EEA users, and a scoping statement covering other jurisdictions
- `changes` — how policy changes are announced and the treatment of continued use after the announcement

The content of each section SHALL describe the project's actual data practices truthfully; forward-looking or absolute promises that cannot be honored operationally (e.g. unconditional per-user deletion of anonymously-keyed logs) SHALL NOT be made.

#### Scenario: All required section ids present

- **WHEN** `privacy.sections` is read from `zh-TW.json`
- **THEN** the array contains objects whose `id` values cover every entry in the required list above

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

### Requirement: Privacy-policy config constant

The module `apps/web/src/lib/config/privacy-policy.ts` SHALL export:

- `PRIVACY_POLICY_LAST_UPDATED: string` — ISO 8601 date (`YYYY-MM-DD`) of the most recent substantive content update

This constant SHALL be the single source of truth consumed by `PrivacyPolicyPage` for the displayed last-updated date. Updating this constant SHALL be the mechanism for signaling a policy revision, and the i18n content SHALL be updated in the same revision whenever the wording of any section changes.

The contact channel (a GitHub Issues URL) is stored in i18n as `privacy.contact.issueUrl` rather than as a TypeScript constant, because the locale files also carry the localized `issueLinkLabel` that must stay adjacent to the URL.

#### Scenario: Last-updated constant exported as ISO date

- **WHEN** the module `apps/web/src/lib/config/privacy-policy.ts` is imported
- **THEN** `PRIVACY_POLICY_LAST_UPDATED` resolves to a string matching `/^\d{4}-\d{2}-\d{2}$/`

---

### Requirement: Page-level meta set at runtime

When `PrivacyPolicyPage` mounts, it SHALL set `document.title` to the localized value of `privacy.pageTitle`, and it SHALL ensure a `<meta name="description">` element exists in `document.head` with content derived from `privacy.metaDescription`. When the component unmounts, it SHALL restore the previous `document.title` value so that other routes are not affected.

#### Scenario: Document title updated on mount

- **WHEN** a user opens `/privacy`
- **THEN** `document.title` equals the value of `privacy.pageTitle` for the current locale

#### Scenario: Document title restored on unmount

- **WHEN** a user navigates away from `/privacy` to `/`
- **THEN** `document.title` equals the value it had before `PrivacyPolicyPage` mounted

#### Scenario: Meta description uses the dedicated i18n key

- **WHEN** `PrivacyPolicyPage` is mounted
- **THEN** the `<meta name="description">` element in `document.head` has `content` equal to the localized `privacy.metaDescription` value
