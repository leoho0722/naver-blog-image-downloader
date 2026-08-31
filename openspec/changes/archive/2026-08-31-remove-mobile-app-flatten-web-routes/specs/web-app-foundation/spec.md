## MODIFIED Requirements

### Requirement: React Router v7 routing with two routes

The app SHALL use React Router v7 with `createBrowserRouter`. Routes SHALL be organized under two layout components: `PublicLayout` (for the landing, privacy-policy, and not-found pages) and `AppLayout` (for the Web SPA). The router's `basename` SHALL be set to `import.meta.env.BASE_URL` so route paths automatically track the deployment base path.

The routable paths SHALL be:

- `/` — renders `LandingPage` within `PublicLayout`
- `/privacy` — renders `PrivacyPolicyPage` within `PublicLayout`
- `/app` — renders `HomePage` within `AppLayout`
- `/app/gallery/:blogId` — renders `GalleryPage` within `AppLayout`

Unmatched routes SHALL render `NotFoundPage` within `PublicLayout` via a `*` catch-all.

No route SHALL exist under an `/intro/` prefix, and no route SHALL render `IntroRootPage`, `IntroWebPage`, or `IntroMobilePage`; those components are deleted.

Legacy redirect routes SHALL also be defined (see the `web-legacy-redirects` capability for details).

#### Scenario: Navigate to root landing page

- **WHEN** user navigates to `/`
- **THEN** the `LandingPage` component is rendered within `PublicLayout`

#### Scenario: Navigate to privacy policy page

- **WHEN** user navigates to `/privacy`
- **THEN** the `PrivacyPolicyPage` component is rendered within `PublicLayout`

#### Scenario: Navigate to web app home

- **WHEN** user navigates to `/app`
- **THEN** the `HomePage` component is rendered within `AppLayout`

#### Scenario: Navigate to gallery with blogId after in-app fetch

- **WHEN** the user has just fetched photos via `HomePage` (so `GalleryStore` holds the photos array for `blogId="abc123def456"`) and `HomePage` calls `navigate("/app/gallery/abc123def456", { state: { fetchResult, jobId } })`
- **THEN** the `GalleryPage` component is rendered within `AppLayout` with `blogId` param value `abc123def456` and displays the photos from store

#### Scenario: Direct deep-link to gallery without state

- **WHEN** the user opens `/app/gallery/abc123def456` directly (reload, external link, or cold start) with no photos in `GalleryStore`
- **THEN** the `GalleryPage` component mounts, detects the empty state, and immediately calls `navigate("/app")` as a fallback; the user lands on `HomePage` where they can paste a URL to fetch photos. Cold-start deep linking is NOT supported in this spec; see `web-legacy-redirects` for the matching redirect rule

#### Scenario: Navigate to a removed intro path

- **WHEN** user navigates to `/intro/web` or `/intro/mobile`
- **THEN** the route matches a legacy redirect and the browser navigates to `/` via `replace`; `NotFoundPage` is NOT rendered

#### Scenario: Navigate to unknown route

- **WHEN** user navigates to `/something-that-does-not-exist`
- **THEN** the `NotFoundPage` component is rendered within `PublicLayout`

#### Scenario: Router basename tracks Vite base path

- **WHEN** `VITE_BASE_PATH` is set to `/naver-blog-image-downloader/` at build time
- **THEN** `createBrowserRouter` uses `basename: "/naver-blog-image-downloader/"` and all route paths are resolved relative to that base

### Requirement: Two-layer layout separation

The app SHALL define two layout components under `apps/web/src/components/layout/`:

- `PublicLayout` — for the landing, privacy-policy, and not-found pages. Structure SHALL be `<IntroNav /> <main><Outlet /></main> <IntroFooter />`. The layout SHALL consume `useSettingsStore` for theme and locale, and SHALL NOT manage theme state independently. `PublicLayout` SHALL render `<IntroNav />` with no props and SHALL NOT call `useMatches` to look up route-supplied anchor links.
- `AppLayout` — for the Web SPA pages (`/app` and `/app/gallery/:blogId`). The header brand link SHALL point to `/app` instead of `/`.

#### Scenario: PublicLayout renders child route

- **WHEN** a child route such as `/` or `/privacy` is matched
- **THEN** `PublicLayout` renders `<IntroNav />`, the matched child component in `<main>`, and `<IntroFooter />`

#### Scenario: PublicLayout renders no anchor navigation

- **WHEN** any `PublicLayout` page is rendered
- **THEN** the header contains the brand link and the theme/locale controls only, and contains no in-page anchor links whose `href` begins with `#`

#### Scenario: AppLayout header brand links to app root

- **WHEN** the user views any page rendered under `AppLayout` and clicks the brand/title link in the header
- **THEN** the browser navigates to `/app`

#### Scenario: Both layouts share theme and locale state

- **WHEN** the user switches theme from light to dark while viewing a `PublicLayout` page
- **THEN** navigating to an `AppLayout` page shows the same dark theme without re-toggling

### Requirement: NotFoundPage as a first-class page

`NotFoundPage` SHALL be rendered under `PublicLayout` and SHALL include:

- A hero area with a large `404` numeral using `var(--font-display)`
- A lucide icon (such as `MapPinOff` or `SearchX`) paired with the numeral
- A main heading and subheading sourced from i18n keys `notFound.title` and `notFound.desc`
- Two calls-to-action as links:
  - Primary "Go home" → `/` (label from `notFound.ctaHome`)
  - Secondary "Go to Web app" → `/app` (label from `notFound.ctaWebApp`)
- Responsive layout: CTAs stacked on narrow viewports, horizontal on desktop

The page SHALL be visually consistent with `LandingPage` and SHALL NOT appear as a minimal placeholder. The page SHALL NOT render a CTA pointing at a mobile intro page, and the i18n key `notFound.ctaMobileIntro` SHALL NOT exist in any locale file.

#### Scenario: NotFoundPage renders under PublicLayout

- **WHEN** user navigates to an unknown path such as `/nonexistent`
- **THEN** `NotFoundPage` is rendered within `PublicLayout` with the hero 404, icon, heading, subheading, and exactly two CTA links

#### Scenario: NotFoundPage "Go home" CTA navigates to root

- **WHEN** user clicks the primary CTA labeled from `notFound.ctaHome` on `NotFoundPage`
- **THEN** the browser navigates to `/`

#### Scenario: NotFoundPage "Go to Web app" CTA navigates to SPA

- **WHEN** user clicks the secondary CTA labeled from `notFound.ctaWebApp` on `NotFoundPage`
- **THEN** the browser navigates to `/app`

#### Scenario: NotFoundPage has no mobile intro CTA

- **WHEN** `NotFoundPage` is rendered under any locale
- **THEN** no CTA navigating to `/intro/mobile` is present and no text resolved from `notFound.ctaMobileIntro` appears
