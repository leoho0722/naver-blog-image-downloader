## MODIFIED Requirements

### Requirement: React Router v7 routing with two routes

The app SHALL use React Router v7 with `createBrowserRouter`. Routes SHALL be organized under two layout components: `PublicLayout` (for landing, intro, privacy-policy, and not-found pages) and `AppLayout` (for the Web SPA). The router's `basename` SHALL be set to `import.meta.env.BASE_URL` so route paths automatically track the deployment base path.

The routable paths SHALL be:

- `/` — renders `IntroRootPage` within `PublicLayout`
- `/intro/mobile` — renders `IntroMobilePage` within `PublicLayout`
- `/intro/web` — renders `IntroWebPage` within `PublicLayout`
- `/privacy` — renders `PrivacyPolicyPage` within `PublicLayout`
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

#### Scenario: Navigate to privacy policy page

- **WHEN** user navigates to `/privacy`
- **THEN** the `PrivacyPolicyPage` component is rendered within `PublicLayout`

#### Scenario: Navigate to web app home

- **WHEN** user navigates to `/app/web`
- **THEN** the `HomePage` component is rendered within `AppLayout`

#### Scenario: Navigate to gallery with blogId after in-app fetch

- **WHEN** the user has just fetched photos via `HomePage` (so `GalleryStore` holds the photos array for `blogId="abc123def456"`) and `HomePage` calls `navigate("/app/web/gallery/abc123def456", { state: { fetchResult, jobId } })`
- **THEN** the `GalleryPage` component is rendered within `AppLayout` with `blogId` param value `abc123def456` and displays the photos from store

#### Scenario: Direct deep-link to gallery without state

- **WHEN** the user opens `/app/web/gallery/abc123def456` directly (reload, external link, or cold start) with no photos in `GalleryStore`
- **THEN** the `GalleryPage` component mounts, detects the empty state, and immediately calls `navigate("/app/web")` as a fallback; the user lands on `HomePage` where they can paste a URL to fetch photos. Cold-start deep linking is NOT supported in this spec; see `web-legacy-redirects` for the matching redirect rule

#### Scenario: Navigate to unknown route

- **WHEN** user navigates to `/something-that-does-not-exist`
- **THEN** the `NotFoundPage` component is rendered within `PublicLayout`

#### Scenario: Router basename tracks Vite base path

- **WHEN** `VITE_BASE_PATH` is set to `/naver-blog-image-downloader/` at build time
- **THEN** `createBrowserRouter` uses `basename: "/naver-blog-image-downloader/"` and all route paths are resolved relative to that base
