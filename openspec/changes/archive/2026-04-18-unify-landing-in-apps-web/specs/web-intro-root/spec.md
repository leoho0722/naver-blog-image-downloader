## ADDED Requirements

### Requirement: Root landing page at /

The Web app SHALL render `IntroRootPage` at the `/` route within `PublicLayout`. The page SHALL serve as the public landing page for the project, introducing both the mobile App and the Web version with links to their respective intro pages.

The page SHALL contain:

- A hero icon (such as `photo_library` or a lucide equivalent)
- The product title sourced from i18n key `intro.root.title`
- A two-line tagline sourced from i18n keys `intro.root.taglineLine1` and `intro.root.taglineLine2`
- Two navigation cards:
  - App card with title `intro.root.cardAppTitle`, description `intro.root.cardAppDesc`, navigating to `/intro/mobile`
  - Web card with title `intro.root.cardWebTitle`, description `intro.root.cardWebDesc`, navigating to `/intro/web`
- A footer area with a GitHub link and copyright text from `intro.root.footerCopyright`

#### Scenario: Landing page renders at root path

- **WHEN** user navigates to `/`
- **THEN** `IntroRootPage` renders with the hero icon, title, tagline, two navigation cards, and footer

#### Scenario: App card links to mobile intro

- **WHEN** user clicks the App card on the landing page
- **THEN** the browser navigates to `/intro/mobile`

#### Scenario: Web card links to web intro

- **WHEN** user clicks the Web card on the landing page
- **THEN** the browser navigates to `/intro/web`

### Requirement: Landing page i18n for four locales

The landing page SHALL display all text content through i18n keys under the `intro.root.*` namespace. All four supported locales (`zh-TW`, `en`, `ja`, `ko`) SHALL have full translations for every key used on this page. The `ja` locale MAY contain machine-translated placeholder content, which SHALL be clearly marked in the PR description as pending native-speaker review.

#### Scenario: Language switch updates all landing page text

- **WHEN** user switches from `zh-TW` to `en` while on `/`
- **THEN** all text content on `IntroRootPage` updates to the English translations immediately without page reload

#### Scenario: All four locales have intro.root keys

- **WHEN** the i18n messages files `zh-TW.json`, `en.json`, `ja.json`, and `ko.json` are inspected
- **THEN** each file contains values for all `intro.root.*` keys referenced by `IntroRootPage`, with no missing keys

### Requirement: Landing page theme and responsive design

The landing page SHALL support the three theme modes (`system`, `light`, `dark`) managed by `useSettingsStore`. All colors SHALL be sourced from M3 CSS custom properties (`--color-*`) defined in `index.css`, not hardcoded. The layout SHALL be responsive: navigation cards SHALL display in a grid on viewports wider than 768px and stack vertically on smaller viewports.

#### Scenario: Dark theme applies M3 tokens

- **WHEN** user switches to dark theme while on `/`
- **THEN** the page background, card backgrounds, and text colors all use the dark-mode values of the `--color-*` tokens and no hardcoded hex colors override them

#### Scenario: Mobile viewport stacks cards

- **WHEN** the viewport width is 375 pixels
- **THEN** the two navigation cards are stacked vertically rather than side-by-side
