## MODIFIED Requirements

### Requirement: Legacy URL redirects via React Router Navigate

The app SHALL define legacy URL redirects in `routes.tsx` using React Router's `<Navigate replace>` element to preserve compatibility for URLs that users bookmarked or shared under earlier route layouts — both the original `/web/app/` sub-path deployment and the `/intro/*` plus `/app/web` layout that preceded the removal of the mobile App.

The following redirects SHALL be in effect:

- `/web` → `/` (the product landing page)
- `/intro/web` → `/` (the Web intro page was merged into the landing page)
- `/intro/mobile` → `/` (the mobile intro page was deleted with the mobile App)
- `/web/app` → `/app` (the Web SPA entry)
- `/app/web` → `/app` (the Web SPA entry under its previous path)
- `/web/app/gallery/:blogId` → `/app` (NOT a gallery path; the `blogId` SHALL be dropped)
- `/app/web/gallery/:blogId` → `/app` (NOT `/app/gallery/:blogId`; the `blogId` SHALL be dropped)

All redirects SHALL use `replace` so the legacy URL does not stay in browser history.

#### Scenario: /web redirects to the landing page

- **WHEN** user navigates to `/web`
- **THEN** the browser immediately navigates to `/` via `replace` (the back button does not return to `/web`)

#### Scenario: /intro/web redirects to the landing page

- **WHEN** user navigates to `/intro/web`
- **THEN** the browser immediately navigates to `/` via `replace` and `LandingPage` renders

#### Scenario: /intro/mobile redirects to the landing page

- **WHEN** user navigates to `/intro/mobile`
- **THEN** the browser immediately navigates to `/` via `replace` and `LandingPage` renders; the user does NOT see `NotFoundPage`

#### Scenario: /app/web redirects to /app

- **WHEN** user navigates to `/app/web`
- **THEN** the browser immediately navigates to `/app` via `replace` and `HomePage` renders under `AppLayout`

#### Scenario: /web/app redirects to /app

- **WHEN** user navigates to `/web/app`
- **THEN** the browser immediately navigates to `/app` via `replace`

#### Scenario: Legacy gallery deep links redirect to the SPA entry without blogId

- **WHEN** user navigates to `/app/web/gallery/abc123def456` or `/web/app/gallery/abc123def456`
- **THEN** the browser immediately navigates to `/app` via `replace`, NOT to `/app/gallery/abc123def456`

##### Example: full redirect table

| Legacy path | Redirect target | Cold-start capable |
| --- | --- | --- |
| `/web` | `/` | yes |
| `/intro/web` | `/` | yes |
| `/intro/mobile` | `/` | yes |
| `/web/app` | `/app` | yes |
| `/app/web` | `/app` | yes |
| `/web/app/gallery/abc123def456` | `/app` | no — `blogId` dropped |
| `/app/web/gallery/abc123def456` | `/app` | no — `blogId` dropped |

### Requirement: No redirect for deep links that require SPA state

The app SHALL NOT add a redirect for any URL pattern whose new equivalent requires in-memory SPA state to render correctly. Specifically, `/web/app/gallery/:blogId` and `/app/web/gallery/:blogId` SHALL redirect to the SPA entry `/app` (not to `/app/gallery/:blogId`), because a cold-loaded `GalleryPage` has no photos state and would immediately fall back to `/app` anyway.

#### Scenario: Redirecting to a deep path with required state is forbidden

- **WHEN** a legacy URL pattern's new path would require state not present at cold load (for example, the `photos` array for `GalleryPage`)
- **THEN** the redirect target SHALL be the nearest parent path that can cold-start (for example, `/app`), not the deep path

### Requirement: SPA fallback for direct URL entry on GitHub Pages

The `deploy-pages.yml` workflow SHALL copy `apps/web/dist/index.html` to `404.html` in the Pages artifact. When GitHub Pages receives a request for any path not matching a static file, it SHALL respond with `404.html` (which is the SPA entry), allowing React Router to take over client-side and render the matching route (including legacy redirects). Users SHALL NOT see GitHub Pages' default 404 page for any path handled by the SPA.

#### Scenario: Direct URL for a legacy intro path triggers redirect

- **WHEN** a user opens `https://leoho0722.github.io/naver-blog-image-downloader/intro/mobile` directly (not via in-app navigation)
- **THEN** GitHub Pages serves `404.html` (the SPA entry), the SPA loads, React Router matches the `/intro/mobile` redirect route, the URL is replaced with `/`, and `LandingPage` renders; the user does NOT see GitHub's default 404 page

#### Scenario: Direct URL for legacy /web/app triggers redirect

- **WHEN** a user opens `https://leoho0722.github.io/naver-blog-image-downloader/web/app` directly
- **THEN** GitHub Pages serves `404.html`, the SPA loads, React Router matches the `/web/app` route and `<Navigate replace to="/app" />` redirects the URL to `/app`, and `HomePage` renders

#### Scenario: Unknown path renders custom NotFoundPage

- **WHEN** a user opens `https://leoho0722.github.io/naver-blog-image-downloader/nonexistent` directly
- **THEN** GitHub Pages serves `404.html`, the SPA loads, React Router matches the `*` catch-all, and the custom `NotFoundPage` renders within `PublicLayout`; the user does NOT see GitHub's default 404 page
