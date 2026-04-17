## ADDED Requirements

### Requirement: Legacy URL redirects via React Router Navigate

The app SHALL define legacy URL redirects in `routes.tsx` using React Router's `<Navigate replace>` element to preserve compatibility for URLs that users may have bookmarked or shared while the app was deployed under the `/web/app/` sub-path.

The following redirects SHALL be in effect:

- `/web` → `/intro/web` (the web intro page)
- `/web/app` → `/app/web` (the Web SPA entry)
- `/web/app/gallery/:blogId` → `/app/web` (NOT `/app/web/gallery/:blogId`; the `blogId` SHALL be dropped)

All redirects SHALL use `replace` so the legacy URL does not stay in browser history.

#### Scenario: /web redirects to /intro/web

- **WHEN** user navigates to `/web`
- **THEN** the browser immediately navigates to `/intro/web` via `replace` (the back button does not return to `/web`)

#### Scenario: /web/app redirects to /app/web

- **WHEN** user navigates to `/web/app`
- **THEN** the browser immediately navigates to `/app/web` via `replace`

#### Scenario: /web/app/gallery/:blogId redirects to /app/web without blogId

- **WHEN** user navigates to `/web/app/gallery/abc123def456`
- **THEN** the browser immediately navigates to `/app/web` via `replace`, NOT `/app/web/gallery/abc123def456`

### Requirement: No redirect for deep links that require SPA state

The app SHALL NOT add a redirect for any URL pattern whose new equivalent requires in-memory SPA state to render correctly. Specifically, `/web/app/gallery/:blogId` SHALL redirect to the SPA entry `/app/web` (not to `/app/web/gallery/:blogId`), because a cold-loaded `GalleryPage` has no photos state and would immediately fallback to `/app/web` anyway.

#### Scenario: Redirecting to a deep path with required state is forbidden

- **WHEN** a legacy URL pattern's new path would require state not present at cold load (e.g., `photos` array for `GalleryPage`)
- **THEN** the redirect target SHALL be the nearest parent path that can cold-start (e.g., `/app/web`), not the deep path

### Requirement: SPA fallback for direct URL entry on GitHub Pages

The `deploy-pages.yml` workflow SHALL copy `apps/web/dist/index.html` to `404.html` in the Pages artifact. When GitHub Pages receives a request for any path not matching a static file, it SHALL respond with `404.html` (which is the SPA entry), allowing React Router to take over client-side and render the matching route (including legacy redirects). Users SHALL NOT see GitHub Pages' default 404 page for any path handled by the SPA.

#### Scenario: Direct URL for /intro/mobile loads correctly

- **WHEN** a user opens `https://leoho0722.github.io/naver-blog-image-downloader/intro/mobile` directly (not via in-app navigation)
- **THEN** GitHub Pages serves `404.html` (the SPA entry), React Router matches `/intro/mobile`, and `IntroMobilePage` renders; the user does NOT see GitHub's default 404 page

#### Scenario: Direct URL for legacy /web/app triggers redirect

- **WHEN** a user opens `https://leoho0722.github.io/naver-blog-image-downloader/web/app` directly
- **THEN** GitHub Pages serves `404.html`, the SPA loads, React Router matches the `/web/app` route and `<Navigate replace to="/app/web" />` redirects the URL to `/app/web`, and `HomePage` renders

#### Scenario: Unknown path renders custom NotFoundPage

- **WHEN** a user opens `https://leoho0722.github.io/naver-blog-image-downloader/nonexistent` directly
- **THEN** GitHub Pages serves `404.html`, the SPA loads, React Router matches the `*` catch-all, and the custom `NotFoundPage` renders within `PublicLayout`; the user does NOT see GitHub's default 404 page
