## ADDED Requirements

### Requirement: Home-screen and PWA icons in the HTML shell

The web app `index.html` SHALL declare an iOS `apple-touch-icon` (PNG) and a web app manifest in the `<head>`, in addition to the existing SVG favicon, so that "Add to Home Screen" on iOS and Android displays the branded app icon rather than a page screenshot or a generic placeholder.

The following PNG assets SHALL exist in `apps/web/public/` and SHALL each use an opaque, edge-to-edge background with no transparent corners (iOS applies its own rounded-corner mask, and transparent pixels render as black):

- `apple-touch-icon.png` — 180×180, referenced by `<link rel="apple-touch-icon">`
- `icon-192.png` — 192×192, referenced by the manifest
- `icon-512.png` — 512×512, referenced by the manifest

The `<head>` SHALL include `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` and `<link rel="manifest" href="/manifest.webmanifest">`, using root-absolute `href` values so Vite rewrites them to the deployment `base` path (matching the existing favicon declaration).

`apps/web/public/manifest.webmanifest` SHALL define `name`, `short_name`, an `icons` array referencing `icon-192.png` (192×192) and `icon-512.png` (512×512), `theme_color`, `background_color`, `display: "standalone"`, and `start_url`. Every URL inside the manifest (`icons[].src`, `start_url`, `scope`) SHALL be a relative path so the manifest resolves correctly under the GitHub Pages sub-path deployment (`/naver-blog-image-downloader/`) rather than the domain root.

The existing SVG favicon (`favicon.svg`) SHALL remain unchanged and continue to serve as the browser-tab icon on desktop browsers.

#### Scenario: iOS home-screen icon shows the branded design

- **GIVEN** the web app is deployed with `apple-touch-icon.png` present and linked in the `<head>`
- **WHEN** a user opens the site in Safari or Chrome on iPhone and chooses "Add to Home Screen"
- **THEN** the home-screen icon displays the branded 180×180 PNG icon instead of a page screenshot or a generic placeholder

#### Scenario: Manifest URLs resolve under sub-path deployment

- **GIVEN** the app is deployed to GitHub Pages at base path `/naver-blog-image-downloader/`
- **WHEN** a browser fetches `manifest.webmanifest` and resolves its `icons[].src` and `start_url`
- **THEN** each URL resolves relative to the manifest location under `/naver-blog-image-downloader/` and returns the corresponding asset, not a 404 at the domain root

##### Example: manifest URL resolution

| Manifest field  | Declared value  | Resolved URL under sub-path                          |
| --------------- | --------------- | ---------------------------------------------------- |
| `icons[0].src`  | `icon-192.png`  | `/naver-blog-image-downloader/icon-192.png`          |
| `icons[1].src`  | `icon-512.png`  | `/naver-blog-image-downloader/icon-512.png`          |
| `start_url`     | `.`             | `/naver-blog-image-downloader/`                      |

#### Scenario: Production build emits icon assets and rewritten links

- **WHEN** `pnpm build` runs in `apps/web/`
- **THEN** `dist/` contains `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, and `manifest.webmanifest`, and the built `index.html` `<head>` contains `apple-touch-icon` and `manifest` links whose `href` values are prefixed with the configured `base` path
