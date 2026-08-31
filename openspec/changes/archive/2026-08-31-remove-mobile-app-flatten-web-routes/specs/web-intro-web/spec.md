## REMOVED Requirements

### Requirement: Web version intro page at /intro/web

**Reason**: The `/intro/web` path existed only to distinguish the Web introduction from `/intro/mobile`. With the mobile App removed, the `web` qualifier carries no information and the page is the only introduction the project has, so it belongs at the root.

**Migration**: The page content moves to `LandingPage` at `/` under the `web-landing` capability. The back link (`intro.web.back`) is dropped because `/` has no parent. `/intro/web` redirects to `/` with `<Navigate replace>`; see the `web-legacy-redirects` capability. The primary CTA target changes from `/app/web` to `/app`.

### Requirement: Web intro page i18n for four locales

**Reason**: The `intro.web.*` namespace is deleted; its keys move into `intro.root.*`.

**Migration**: `intro.web.featureUrl`, `intro.web.featureGrid`, `intro.web.featureBatch`, `intro.web.featureI18n`, `intro.web.cta`, and `intro.web.tech` are renamed to the matching `intro.root.*` keys in all four locale files. `intro.web.docTitle`, `intro.web.back`, `intro.web.title`, and `intro.web.tagline` are deleted — the landing page uses `intro.root.title` and `intro.root.taglineLine1` / `intro.root.taglineLine2` instead.
