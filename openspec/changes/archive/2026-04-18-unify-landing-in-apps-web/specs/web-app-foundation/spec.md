## MODIFIED Requirements

### Requirement: React Router v7 routing with two routes

The app SHALL use React Router v7 with `createBrowserRouter`. Routes SHALL be organized under two layout components: `PublicLayout` (for landing and intro pages) and `AppLayout` (for the Web SPA). The router's `basename` SHALL be set to `import.meta.env.BASE_URL` so route paths automatically track the deployment base path.

The routable paths SHALL be:

- `/` — renders `IntroRootPage` within `PublicLayout`
- `/intro/mobile` — renders `IntroMobilePage` within `PublicLayout`
- `/intro/web` — renders `IntroWebPage` within `PublicLayout`
- `/app/web` — renders `HomePage` within `AppLayout`
- `/app/web/gallery/:blogId` — renders `GalleryPage` within `AppLayout`

Unmatched routes SHALL render `NotFoundPage` within `PublicLayout` via a `*` catch-all.

Legacy redirect routes SHALL also be defined (see the `web-legacy-redirects` capability for details).

#### Scenario: Navigate to root landing page

- **WHEN** user navigates to `/`
- **THEN** the `IntroRootPage` component is rendered within `PublicLayout`

#### Scenario: Navigate to mobile intro page

- **WHEN** user navigates to `/intro/mobile`
- **THEN** the `IntroMobilePage` component is rendered within `PublicLayout`

#### Scenario: Navigate to web intro page

- **WHEN** user navigates to `/intro/web`
- **THEN** the `IntroWebPage` component is rendered within `PublicLayout`

#### Scenario: Navigate to web app home

- **WHEN** user navigates to `/app/web`
- **THEN** the `HomePage` component is rendered within `AppLayout`

#### Scenario: Navigate to gallery with blogId

- **WHEN** user navigates to `/app/web/gallery/abc123def456`
- **THEN** the `GalleryPage` component is rendered within `AppLayout` with `blogId` param value `abc123def456`

#### Scenario: Navigate to unknown route

- **WHEN** user navigates to `/something-that-does-not-exist`
- **THEN** the `NotFoundPage` component is rendered within `PublicLayout`

#### Scenario: Router basename tracks Vite base path

- **WHEN** `VITE_BASE_PATH` is set to `/naver-blog-image-downloader/` at build time
- **THEN** `createBrowserRouter` uses `basename: "/naver-blog-image-downloader/"` and all route paths are resolved relative to that base

### Requirement: Build-time app version injection

The Vite build configuration SHALL define a global constant `__APP_VERSION__` injected at build time from the `version` field of `apps/web/package.json`. A TypeScript declaration SHALL exist so that `__APP_VERSION__` is typed as `string`. The `AppLayout` header SHALL display the version as `v<semver>` next to the app title, using subdued styling (`text-xs`, `color-on-surface-variant`) that is visible on all pages rendered under `AppLayout`.

#### Scenario: Version displayed in AppLayout header

- **WHEN** the user opens any page rendered under `AppLayout` (such as `/app/web` or `/app/web/gallery/:blogId`)
- **THEN** the header displays the current version string in the format `v<semver>` (e.g., `v1.2.0`)

#### Scenario: Version matches package.json

- **WHEN** `apps/web/package.json` has `"version": "1.2.0"`
- **THEN** the header displays `v1.2.0`

## ADDED Requirements

### Requirement: Two-layer layout separation

The app SHALL define two layout components under `apps/web/src/components/layout/`:

- `PublicLayout` — for landing, intro, and not-found pages. Structure SHALL be `<IntroNav /> <main><Outlet /></main> <IntroFooter />`. The layout SHALL consume `useSettingsStore` for theme and locale, and SHALL NOT manage theme state independently.
- `AppLayout` — for the Web SPA pages (`/app/web` and `/app/web/gallery/:blogId`). This layout SHALL replace the previous `RootLayout.tsx` component with the same visual structure, except the header brand link SHALL point to `/app/web` instead of `/`.

The previous `RootLayout.tsx` component SHALL be removed after `AppLayout.tsx` replaces it.

#### Scenario: PublicLayout renders child route

- **WHEN** a child route such as `/` or `/intro/mobile` is matched
- **THEN** `PublicLayout` renders `<IntroNav />`, the matched child component in `<main>`, and `<IntroFooter />`

#### Scenario: AppLayout header brand links to app root

- **WHEN** the user views any page rendered under `AppLayout` and clicks the brand/title link in the header
- **THEN** the browser navigates to `/app/web`

#### Scenario: Both layouts share theme and locale state

- **WHEN** the user switches theme from light to dark while viewing a `PublicLayout` page
- **THEN** navigating to an `AppLayout` page shows the same dark theme without re-toggling

### Requirement: NotFoundPage as a first-class page

`NotFoundPage` SHALL be rendered under `PublicLayout` and SHALL include:

- A hero area with a large `404` numeral using `var(--font-display)`
- A lucide icon (such as `MapPinOff` or `SearchX`) paired with the numeral
- A main heading and subheading sourced from i18n keys `notFound.title` and `notFound.desc`
- Three calls-to-action as links:
  - Primary "Go home" → `/` (label from `notFound.ctaHome`)
  - Secondary "Go to Web app" → `/app/web` (label from `notFound.ctaWebApp`)
  - Secondary "See App intro" → `/intro/mobile` (label from `notFound.ctaMobileIntro`)
- Responsive layout: CTAs stacked on mobile, horizontal on desktop

The page SHALL be visually consistent with `IntroRootPage` and SHALL NOT appear as a minimal placeholder.

#### Scenario: NotFoundPage renders under PublicLayout

- **WHEN** user navigates to an unknown path such as `/nonexistent`
- **THEN** `NotFoundPage` is rendered within `PublicLayout` with the hero 404, icon, heading, subheading, and three CTA links

#### Scenario: NotFoundPage "Go home" CTA navigates to root

- **WHEN** user clicks the primary CTA labeled from `notFound.ctaHome` on `NotFoundPage`
- **THEN** the browser navigates to `/`

#### Scenario: NotFoundPage "Go to Web app" CTA navigates to SPA

- **WHEN** user clicks the secondary CTA labeled from `notFound.ctaWebApp` on `NotFoundPage`
- **THEN** the browser navigates to `/app/web`

#### Scenario: NotFoundPage "See App intro" CTA navigates to mobile intro

- **WHEN** user clicks the secondary CTA labeled from `notFound.ctaMobileIntro` on `NotFoundPage`
- **THEN** the browser navigates to `/intro/mobile`

### Requirement: Vite base path for GitHub Pages root deployment

The production build SHALL set `VITE_BASE_PATH=/naver-blog-image-downloader/` (no `web/app/` suffix). The Vite `base` option in `vite.config.ts` SHALL read from `process.env.VITE_BASE_PATH` and default to `/` for local development.

#### Scenario: Production build uses root base path

- **WHEN** `pnpm build` is run with `VITE_BASE_PATH=/naver-blog-image-downloader/`
- **THEN** the resulting `dist/index.html` references assets under `/naver-blog-image-downloader/assets/` and the router basename is `/naver-blog-image-downloader/`

#### Scenario: Local dev build uses root base path

- **WHEN** `pnpm dev` is run without `VITE_BASE_PATH` set
- **THEN** the dev server serves the app at `/` and the router basename is `/`
