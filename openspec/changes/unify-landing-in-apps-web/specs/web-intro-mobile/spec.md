## ADDED Requirements

### Requirement: Mobile app intro page at /intro/mobile

The Web app SHALL render `IntroMobilePage` at the `/intro/mobile` route within `PublicLayout`. The page SHALL introduce the Flutter mobile App and replicate the content previously served by `docs/mobile/index.html`.

The page SHALL contain these sections in order:

- Hero section with title, tagline, phone mockup image, and two CTAs ("Get it" and "Learn more")
- Features grid with four feature cards: batch download, gallery browsing, caching, async downloads
- How-it-works section with four numbered steps: paste URL, extract photos, browse gallery, download
- Screenshots section with iOS/Android tabs and a 4-image carousel per platform showing input, gallery, detail, and settings views
- Download section with App Store and Google Play download badges (shown as "Coming Soon" placeholders until apps are published)

All 8 screenshot images SHALL be served from `apps/web/public/intro/mobile/` with filenames `{view}_view_{platform}_snapshot.png` where `view` is one of `blog_input`, `photo_gallery`, `photo_detail`, `setting` and `platform` is one of `ios`, `android`.

#### Scenario: Mobile intro page renders all sections

- **WHEN** user navigates to `/intro/mobile`
- **THEN** `IntroMobilePage` renders hero, features grid, how-it-works, screenshots, and download sections in that order

#### Scenario: Screenshot images load from public path

- **WHEN** `IntroMobilePage` renders the screenshots section
- **THEN** each `<img>` element has a `src` that resolves under `{BASE_URL}intro/mobile/{view}_view_{platform}_snapshot.png`

### Requirement: iOS/Android platform tab switching

The screenshots section SHALL provide two tabs labeled "iOS" and "Android". Selecting a tab SHALL update all 4 displayed screenshots to the corresponding platform's images without page reload. The iOS tab SHALL be active by default.

#### Scenario: Default tab is iOS

- **WHEN** `IntroMobilePage` first renders on a cold visit
- **THEN** the iOS tab is active and the 4 `_ios_snapshot.png` images are displayed

#### Scenario: Switch to Android tab

- **WHEN** user clicks the "Android" tab
- **THEN** the 4 displayed images update to `_android_snapshot.png` variants without page reload and the Android tab is marked active

#### Scenario: Switch back to iOS tab

- **WHEN** user clicks the "iOS" tab after viewing Android
- **THEN** the 4 displayed images update back to `_ios_snapshot.png` variants and the iOS tab is marked active

### Requirement: Mobile intro page i18n for four locales

All text content SHALL be sourced from i18n keys under the `intro.mobile.*` namespace. All four supported locales (`zh-TW`, `en`, `ja`, `ko`) SHALL have full translations for every key referenced by `IntroMobilePage`. The `ja` locale MAY contain machine-translated placeholder content, which SHALL be clearly marked in the PR description as pending native-speaker review.

The namespace SHALL include sub-namespaces: `intro.mobile.nav.*`, `intro.mobile.hero.*`, `intro.mobile.features.*`, `intro.mobile.howItWorks.*`, `intro.mobile.screenshots.*`, `intro.mobile.download.*`.

#### Scenario: Korean locale translations exist

- **WHEN** user switches to `ko` while on `/intro/mobile`
- **THEN** all visible text in all sections updates to Korean translations without showing any raw i18n keys or English fallbacks

#### Scenario: Machine-translated Japanese renders without console warnings

- **WHEN** user switches to `ja` while on `/intro/mobile`
- **THEN** all visible text updates to the placeholder Japanese content (no raw key exposure) and the browser console shows no `react-i18next` missing-key warnings

### Requirement: Anchor navigation in IntroNav

When rendered on `/intro/mobile`, `IntroNav` SHALL include in-page anchor links to the four main sections: features, how-it-works, screenshots, download. Clicking an anchor link SHALL smooth-scroll to the corresponding section.

#### Scenario: Anchor link scrolls to section

- **WHEN** user clicks the "Features" anchor link in the IntroNav on `/intro/mobile`
- **THEN** the viewport smooth-scrolls to the features section such that the section heading is visible in the viewport
