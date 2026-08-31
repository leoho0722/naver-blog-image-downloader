## ADDED Requirements

### Requirement: Product landing page at /

The Web app SHALL render a `LandingPage` component at the `/` route within `PublicLayout`. The page SHALL be the single public entry point for the project and SHALL introduce the Web downloader directly, without an intermediate platform-selection step.

The page SHALL contain, in this top-to-bottom order:

- A hero icon rendered with a lucide icon component
- The product title sourced from i18n key `intro.root.title`
- A two-line tagline sourced from i18n keys `intro.root.taglineLine1` and `intro.root.taglineLine2`
- Four `FeatureCard` components describing URL input, photo grid, batch download, and i18n support, sourced from i18n keys `intro.root.featureUrl`, `intro.root.featureGrid`, `intro.root.featureBatch`, and `intro.root.featureI18n`
- A primary call-to-action labeled from `intro.root.cta` that navigates to `/app` as a same-site React Router `<Link>`, NOT a `window.open` call or an external URL
- A technology stack line sourced from `intro.root.tech`

The page SHALL NOT render a back link, because `/` has no parent route. The page SHALL NOT render platform-selection cards, and SHALL NOT reference a mobile application.

The component file SHALL live at `apps/web/src/pages/LandingPage.tsx`. The directory `apps/web/src/pages/intro/` SHALL NOT exist.

#### Scenario: Navigate to root renders the landing page

- **GIVEN** the app is served with React Router configured from `routes.tsx`
- **WHEN** a user navigates to `/`
- **THEN** `LandingPage` renders within `PublicLayout`, showing the hero title, two-line tagline, four feature cards, the primary CTA, and the technology stack line

#### Scenario: Primary CTA navigates to the SPA entry

- **GIVEN** a user is viewing `/`
- **WHEN** the user clicks the primary CTA labeled from `intro.root.cta`
- **THEN** the browser navigates to `/app` within the same document and `HomePage` renders under `AppLayout`

#### Scenario: Landing page has no back link

- **WHEN** `LandingPage` is rendered under any locale
- **THEN** no link labeled from `intro.web.back` is present, and no anchor navigating to `/intro/web` or `/intro/mobile` is present

#### Scenario: Landing page does not mention the mobile app

- **WHEN** `LandingPage` is rendered under any locale
- **THEN** no App Store or Google Play download badge is rendered, no platform-selection card is rendered, and no link navigating to `/intro/mobile` is present

### Requirement: Landing page i18n for four locales

The landing page SHALL display all text content through i18n keys under the `intro.root.*` namespace. All four supported locales (`zh-TW`, `en`, `ja`, `ko`) SHALL have full translations for every key referenced by `LandingPage`.

The `intro.root.*` namespace SHALL contain the keys previously split between `intro.root.*` and `intro.web.*`:

- Retained from `intro.root.*`: `title`, `taglineLine1`, `taglineLine2`
- Moved in from `intro.web.*`: `featureUrl.title`, `featureUrl.desc`, `featureGrid.title`, `featureGrid.desc`, `featureBatch.title`, `featureBatch.desc`, `featureI18n.title`, `featureI18n.desc`, `cta`, `tech`

The following keys SHALL NOT exist in any locale file: `intro.root.cardAppTitle`, `intro.root.cardAppDesc`, `intro.root.cardWebTitle`, `intro.root.cardWebDesc`, `intro.root.cardLearnMore`, and every key under `intro.web.*` and `intro.mobile.*`.

#### Scenario: Language switch updates all landing page text

- **GIVEN** a user is viewing `/` in `zh-TW`
- **WHEN** the user switches the locale to `en`
- **THEN** the title, tagline, all four feature cards, the CTA label, and the technology stack line update to their English translations immediately without a page reload

#### Scenario: All four locales carry identical intro key structure

- **WHEN** the flattened key sets under the `intro` namespace of `zh-TW.json`, `en.json`, `ja.json`, and `ko.json` are compared
- **THEN** the four sets are identical, with no locale missing a key and no locale carrying an extra key

##### Example: keys removed from every locale

| Key prefix | Present after this change | Reason |
| --- | --- | --- |
| `intro.root.title` | yes | Hero title, reused by `NotFoundPage` document title |
| `intro.root.cta` | yes | Moved in from `intro.web.cta` |
| `intro.root.cardAppTitle` | no | Platform-selection card removed |
| `intro.web.back` | no | `/intro/web` removed; landing page has no parent |
| `intro.mobile.hero.title` | no | Mobile intro page removed |
| `notFound.ctaMobileIntro` | no | Mobile intro CTA removed from `NotFoundPage` |

### Requirement: Landing page theme and responsive design

The landing page SHALL support the three theme modes (`system`, `light`, `dark`) managed by `useSettingsStore`. All colors SHALL be sourced from M3 CSS custom properties (`--color-*`) defined in `index.css`, and SHALL NOT be hardcoded hex values. The feature-card section SHALL be responsive, stacking vertically on narrow viewports.

#### Scenario: Dark theme applies M3 tokens

- **GIVEN** a user is viewing `/`
- **WHEN** the user switches to the dark theme
- **THEN** the page background, card backgrounds, and text colors all resolve to the dark-mode values of the `--color-*` tokens, with no hardcoded hex color overriding them

#### Scenario: Narrow viewport stacks feature cards

- **WHEN** the viewport width is 375 pixels
- **THEN** the four feature cards are stacked vertically and the page body does not scroll horizontally
