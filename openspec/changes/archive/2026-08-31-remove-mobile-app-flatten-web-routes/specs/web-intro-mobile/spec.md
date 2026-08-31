## REMOVED Requirements

### Requirement: Mobile app intro page at /intro/mobile

**Reason**: The project no longer ships a Flutter mobile App. `apps/mobile/` is deleted, so a page introducing it would advertise software that does not exist and cannot be downloaded.

**Migration**: `IntroMobilePage` and its exclusive child components `DownloadBadge`, `ScreenshotCarousel`, and `StepCard` are deleted, together with the eight screenshots under `apps/web/public/intro/mobile/`. `/intro/mobile` redirects to `/` with `<Navigate replace>`; see the `web-legacy-redirects` capability. Visitors who followed a bookmark land on the Web product landing page rather than a 404.

### Requirement: iOS/Android platform tab switching

**Reason**: The tabbed screenshot carousel existed only on the mobile intro page.

**Migration**: None. `ScreenshotCarousel` and the eight PNG assets it displayed are deleted. No replacement component is introduced.

### Requirement: Mobile intro page i18n for four locales

**Reason**: The `intro.mobile.*` namespace describes a page that no longer exists.

**Migration**: Every key under `intro.mobile.*` is deleted from `zh-TW.json`, `en.json`, `ja.json`, and `ko.json`. The i18n parity test drops its `intro.mobile.screenshots` tab assertion. No key is renamed or carried forward.

### Requirement: Anchor navigation in IntroNav

**Reason**: `IntroMobilePage` was the only route that supplied `anchorLinks` through its route handle. With that route gone, the anchor-navigation mechanism has no producer and is dead code.

**Migration**: `INTRO_MOBILE_ANCHOR_LINKS`, the `AnchorLink` interface, and the `PublicRouteHandle` interface are deleted from `apps/web/src/lib/config/public-navigation.ts`. `IntroNav` drops its `anchorLinks` prop and renders only the brand link and `ThemeLocaleControls`. `PublicLayout` drops its `useMatches` lookup and renders `<IntroNav />` with no props. `PublicFooterLink` and `PUBLIC_FOOTER_LINKS` remain unchanged in the same file.
