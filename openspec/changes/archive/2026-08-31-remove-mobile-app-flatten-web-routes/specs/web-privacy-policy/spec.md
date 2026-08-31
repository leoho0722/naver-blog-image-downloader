## MODIFIED Requirements

### Requirement: Privacy policy page at /privacy

The Web app SHALL render a `PrivacyPolicyPage` component at the `/privacy` route within `PublicLayout`. The page SHALL serve as the canonical privacy policy for the project, linkable from the web `IntroFooter` and from any external reference. It SHALL NOT be described as the privacy policy backing an App Store Connect listing, a Google Play Console listing, or a mobile app Settings view, because the project no longer ships a mobile App.

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

- **WHEN** `PRIVACY_POLICY_LAST_UPDATED` is updated in the same change that edits the policy text
- **THEN** the last-updated row on the rendered page shows that new date next to the `privacy.lastUpdatedLabel` label

#### Scenario: Version string is not rendered

- **WHEN** the page is rendered under any locale
- **THEN** no `v<semver>` text derived from `__APP_VERSION__` appears anywhere on the page

#### Scenario: Contact link points to GitHub issues in a new tab

- **WHEN** the page is rendered
- **THEN** the contact section contains an anchor whose `href` equals `privacy.contact.issueUrl` and whose `target` attribute equals `_blank`

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

The content of each section SHALL describe the project's actual data practices truthfully; forward-looking or absolute promises that cannot be honored operationally (for example, unconditional per-user deletion of anonymously-keyed logs) SHALL NOT be made.

Because the project ships only a Web app and an AWS Lambda backend, the policy text SHALL NOT claim to collect or process any data category that exists only in a mobile App. Specifically, no section SHALL describe an anonymous device identifier, Firebase Authentication, Cloud Firestore operation logs, Firebase Crashlytics crash reports, on-device caches cleared through an App settings screen, or uninstalling an App as a way to stop data collection. Wording that offered the user a choice between an App and the Web (for example, "sent by the App or the Web") SHALL name only the Web.

#### Scenario: All required section ids present

- **WHEN** `privacy.sections` is read from `zh-TW.json`
- **THEN** the array contains objects whose `id` values cover every entry in the required list above

#### Scenario: No mobile-only data practice is claimed

- **WHEN** the concatenated `body` text of every section in any of the four locale files is inspected
- **THEN** it contains no claim of collecting an anonymous device identifier, Firebase Authentication data, Cloud Firestore operation logs, or Firebase Crashlytics crash reports, and no instruction to uninstall an App or to clear a cache from an App settings screen

#### Scenario: Third-party list matches the surviving stack

- **WHEN** the `thirdParty` section is read under any locale
- **THEN** it names the AWS services used by the backend and the Naver disclaimer, and names no Google LLC Firebase service

### Requirement: Privacy link in IntroFooter

The `IntroFooter` component SHALL render a link labeled from i18n key `privacy.footerLink` that navigates to `/privacy`. The link SHALL appear on every page that uses `PublicLayout`, namely `LandingPage`, `NotFoundPage`, and `PrivacyPolicyPage` itself.

#### Scenario: Footer shows privacy link on landing page

- **WHEN** a user views `/`
- **THEN** `IntroFooter` renders a link with the text from `privacy.footerLink` that points to `/privacy`

#### Scenario: Clicking footer privacy link navigates to page

- **WHEN** a user clicks the privacy link in `IntroFooter` from any `PublicLayout` page
- **THEN** the browser navigates to `/privacy` and `PrivacyPolicyPage` renders
