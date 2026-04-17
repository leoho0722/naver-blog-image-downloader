## ADDED Requirements

### Requirement: Web version intro page at /intro/web

The Web app SHALL render `IntroWebPage` at the `/intro/web` route within `PublicLayout`. The page SHALL introduce the Web version of the downloader and replace the content previously served by `docs/web/index.html`.

The page SHALL contain:

- A back link to `/` labeled from `intro.web.back`
- Title from `intro.web.title` and tagline from `intro.web.tagline`
- Four feature cards describing: URL input, photo grid, batch download, and i18n (keys `intro.web.featureUrl`, `intro.web.featureGrid`, `intro.web.featureBatch`, `intro.web.featureI18n`)
- A primary CTA labeled from `intro.web.cta` that navigates to `/app/web` as a same-site React Router `<Link>` (not a full-page `window.open` or external URL)
- A technology stack line from `intro.web.tech`

#### Scenario: Web intro page renders

- **WHEN** user navigates to `/intro/web`
- **THEN** `IntroWebPage` renders the back link, title, tagline, four feature cards, CTA button, and tech stack line

#### Scenario: CTA navigates to Web SPA without page reload

- **WHEN** user clicks the primary CTA on `/intro/web`
- **THEN** the browser navigates to `/app/web` using React Router client-side routing (no full page reload)

#### Scenario: Back link returns to root landing

- **WHEN** user clicks the back link on `/intro/web`
- **THEN** the browser navigates to `/`

### Requirement: Web intro page i18n for four locales

All text content SHALL be sourced from i18n keys under the `intro.web.*` namespace. All four supported locales (`zh-TW`, `en`, `ja`, `ko`) SHALL have full translations for every key referenced by `IntroWebPage`. The `ja` locale MAY contain machine-translated placeholder content, which SHALL be clearly marked in the PR description as pending native-speaker review.

#### Scenario: Language switch updates all web intro text

- **WHEN** user switches from `zh-TW` to `ko` while on `/intro/web`
- **THEN** all text content (back link, title, tagline, feature cards, CTA, tech stack) updates to Korean immediately without page reload
