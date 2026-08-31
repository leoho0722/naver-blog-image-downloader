# web-app-foundation Specification

## Purpose

Web 前端基礎建設——Vite + React 19 + React Router v7 專案架構、API client（timeout/retry/雙層 JSON 解析）、M3 色彩主題系統、BlogId 產生、URL 驗證。

## Requirements

### Requirement: Vite project initialization with React 19 and TypeScript

The web app SHALL be a Vite project at `apps/web/` using React 19, TypeScript, and SWC for compilation. The project SHALL include `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, and `index.html` as the entry point.

#### Scenario: Development server starts successfully

- **WHEN** `pnpm dev` is run in `apps/web/`
- **THEN** Vite dev server starts and serves the application at `http://localhost:5173`

#### Scenario: Production build produces static files

- **WHEN** `pnpm build` is run in `apps/web/`
- **THEN** static files are generated in `apps/web/dist/`


<!-- @trace
source: web-app-with-backend-packaging
updated: 2026-04-12
code:
  - apps/web/src/pages/GalleryPage.tsx
  - apps/web/tsconfig.tsbuildinfo
  - apps/web/src/lib/i18n/messages/ja.json
  - CLAUDE.md
  - apps/web/src/lib/services/url-validator.ts
  - apps/web/src/lib/services/blog-id.ts
  - apps/web/CLAUDE.md
  - apps/web/src/lib/stores/use-blog-input-store.ts
  - apps/web/index.html
  - apps/backend/src/data_models.py
  - apps/web/src/components/blog-input/BlogInputForm.tsx
  - apps/web/src/lib/i18n/messages/zh-TW.json
  - apps/backend/src/routes/photos.py
  - apps/web/package.json
  - apps/web/src/components/settings/LanguageSwitcher.tsx
  - apps/web/src/lib/api/photos.ts
  - apps/web/src/pages/NotFoundPage.tsx
  - apps/web/public/icons.svg
  - apps/web/src/components/gallery/ImageViewer.tsx
  - apps/web/src/components/gallery/SelectionToolbar.tsx
  - apps/backend/pyproject.toml
  - apps/backend/src/response_builder.py
  - apps/web/src/components/blog-input/FetchProgress.tsx
  - apps/web/src/lib/api/types.ts
  - apps/web/vite.config.ts
  - .github/workflows/web-ci.yml
  - apps/web/src/lib/hooks/use-clipboard.ts
  - apps/web/src/lib/api/client.ts
  - apps/web/src/App.tsx
  - apps/backend/README.md
  - apps/web/src/components/settings/SettingsDrawer.tsx
  - apps/backend/CLAUDE.md
  - apps/web/src/index.css
  - apps/web/src/components/settings/ThemeSwitcher.tsx
  - apps/web/src/routes.tsx
  - apps/web/src/lib/config/api.ts
  - apps/web/src/lib/stores/use-settings-store.ts
  - apps/web/tsconfig.json
  - apps/backend/requirements.txt
  - apps/web/.gitkeep
  - apps/web/public/icons/icon_new.png
  - README.md
  - apps/web/src/lib/i18n/messages/en.json
  - apps/backend/src/job_store/package.py
  - apps/web/.env.example
  - apps/web/public/icons/icon_default.png
  - apps/web/src/main.tsx
  - apps/web/src/lib/i18n/messages/ko.json
  - apps/web/src/pages/HomePage.tsx
  - apps/backend/.envExample
  - apps/web/public/favicon.svg
  - apps/web/src/lib/stores/use-gallery-store.ts
  - apps/web/src/components/gallery/PhotoGrid.tsx
  - apps/web/src/lib/i18n/config.ts
  - apps/backend/src/app.py
  - apps/web/src/lib/stores/use-download-store.ts
  - apps/web/src/lib/hooks/use-polling.ts
  - apps/backend/.env.example
  - apps/backend/src/job_store/__init__.py
  - apps/web/src/components/download/DownloadProgress.tsx
  - apps/web/src/components/gallery/PhotoCard.tsx
tests:
  - apps/web/src/__tests__/components/gallery/PhotoCard.test.tsx
  - apps/web/src/__tests__/lib/services/blog-id.test.ts
  - apps/backend/tests/api.http
  - apps/web/src/__tests__/lib/hooks/use-polling.test.ts
  - apps/web/src/__tests__/lib/services/url-validator.test.ts
  - apps/web/src/__tests__/lib/stores/use-gallery-store.test.ts
  - apps/web/src/__tests__/lib/api/client.test.ts
  - apps/web/src/__tests__/setup.ts
-->

---
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


<!-- @trace
source: remove-mobile-app-flatten-web-routes
updated: 2026-08-31
code:
  - apps/mobile/.claude/settings.json
  - .agents/skills/spectra-drift/SKILL.md
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-40x40@2x.png
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-60x60@2x.png
  - apps/mobile/lib/data/models/dtos/photo_download_response.dart
  - apps/mobile/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - apps/mobile/scripts/screenshot_matrix.json
  - .github/workflows/mobile-cd.yml
  - apps/web/src/lib/i18n/messages/ko.json
  - apps/web/src/routes.tsx
  - apps/mobile/ios/Runner/Configurations/Info.plist
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-29x29@2x.png
  - apps/mobile/lib/screenshot/screenshot_scenarios.dart
  - apps/web/src/pages/HomePage.tsx
  - apps/mobile/ios/Podfile
  - apps/mobile/ios/Runner/Features/PhotoViewer/View/ZoomableImageView.swift
  - apps/mobile/l10n.yaml
  - apps/mobile/lib/amplifyconfiguration.dart
  - apps/mobile/ios/Runner/Services/PhotoService.swift
  - apps/mobile/android/app/src/main/res/mipmap-hdpi/ic_launcher.png
  - apps/mobile/lib/ui/core/app_error.dart
  - apps/mobile/.claude/skills/store-assets/frames/.gitkeep
  - apps/mobile/android/gradle.properties
  - apps/mobile/README.md
  - apps/mobile/lib/data/services/photo_service.dart
  - apps/web/src/components/intro/FeatureCard.tsx
  - apps/web/src/components/intro/ScreenshotCarousel.tsx
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-76x76@2x.png
  - apps/mobile/android/app/src/main/res/values-night/styles.xml
  - apps/mobile/lib/data/services/whats_new_data_source.dart
  - apps/mobile/.claude/skills/store-assets/SKILL.md
  - apps/mobile/assets/samples/sample_photo_03.jpg
  - apps/mobile/ios/RunnerTests/PhotoFileInfoTests.swift
  - .agents/skills/spectra-commit/SKILL.md
  - apps/mobile/.claude/skills/spectra-audit/SKILL.md
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-20x20@3x.png
  - apps/mobile/lib/l10n/app_localizations_ko.dart
  - apps/web/src/pages/intro/IntroWebPage.tsx
  - apps/mobile/ios/Runner/Applications/AppDelegate.swift
  - apps/mobile/ios/Runner/Applications/Channels/Features/GalleryChannel.swift
  - apps/mobile/ios/Runner/Features/Base.lproj/LaunchScreen.storyboard
  - apps/mobile/lib/data/services/auth_service.dart
  - apps/mobile/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - apps/mobile/lib/app.dart
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/channels/features/GalleryChannel.kt
  - apps/web/public/intro/mobile/setting_view_ios_snapshot.png
  - apps/mobile/.claude/skills/spectra-debug/SKILL.md
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-20x20@2x.png
  - apps/mobile/lib/config/whats_new_icon_resolver.dart
  - apps/mobile/lib/data/services/photo_viewer_service.dart
  - apps/mobile/lib/data/repositories/cache_repository.dart
  - apps/mobile/CLAUDE.md
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/MainActivity.kt
  - apps/mobile/lib/data/services/api_service.dart
  - apps/web/public/intro/mobile/setting_view_android_snapshot.png
  - apps/web/src/pages/GalleryPage.tsx
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/viewmodel/PhotoViewerViewModel.kt
  - apps/mobile/lib/ui/core/naver_url_validator.dart
  - apps/mobile/ios/Runner/Applications/Channels/Features/AppIconChannel.swift
  - apps/mobile/assets/store/google-play-feature-graphic.png
  - apps/mobile/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - apps/mobile/android/app/src/main/res/mipmap-mdpi/ic_launcher.png
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-1024x1024.png
  - apps/mobile/lib/l10n/app_localizations.dart
  - apps/mobile/android/app/build.gradle.kts
  - apps/mobile/lib/screenshot/app_runtime_mode.dart
  - apps/web/src/components/intro/DownloadBadge.tsx
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage.png
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/FileInfoContent.kt
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-40x40@3x.png
  - apps/mobile/lib/ui/core/view_model/app_settings_view_model.dart
  - apps/web/src/lib/config/privacy-policy.ts
  - apps/mobile/android/app/src/main/res/drawable/launch_background.xml
  - apps/mobile/ios/Runner.xcodeproj/project.pbxproj
  - apps/mobile/lib/ui/settings/widgets/settings_view.dart
  - apps/mobile/lib/l10n/app_zh_TW.arb
  - apps/mobile/lib/config/app_config.dart
  - apps/mobile/lib/routing/app_router.dart
  - apps/mobile/lib/screenshot/screenshot_config.dart
  - apps/mobile/ios/Runner/GoogleService-Info.plist
  - apps/mobile/scripts/generate_maestro_matrix.dart
  - apps/mobile/ios/Runner/Headers/Runner-Bridging-Header.h
  - .agents/skills/spectra-apply/SKILL.md
  - apps/mobile/ios/Runner.xcodeproj/project.xcworkspace/xcshareddata/IDEWorkspaceChecks.plist
  - apps/web/src/pages/PrivacyPolicyPage.tsx
  - README.md
  - apps/mobile/scripts/run_ios_screenshot_matrix.sh
  - AGENTS.md
  - apps/mobile/ios/Runner/Features/PhotoViewer/View/AsyncButton.swift
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-60x60@3x.png
  - apps/mobile/lib/data/services/crashlytics_service.dart
  - apps/mobile/lib/data/services/local_storage_service.dart
  - apps/mobile/.claude/skills/spectra-ingest/SKILL.md
  - apps/mobile/lib/data/models/dtos/whats_new_request.dart
  - apps/mobile/assets/screenshots/store_listings.json
  - apps/mobile/assets/samples/sample_photo_06.jpg
  - apps/mobile/ios/Runner/Features/PhotoViewer/View/PhotoViewerNavigationBar.swift
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/services/PhotoService.kt
  - apps/mobile/ios/Runner/Features/PhotoViewer/View/PhotoViewerView.swift
  - .agents/skills/spectra-ingest/SKILL.md
  - apps/mobile/.claude/skills/store-assets/.python-version
  - apps/mobile/ios/Runner.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-1024x1024.png
  - apps/mobile/lib/data/models/blog_cache_metadata.dart
  - apps/mobile/lib/screenshot/widgets/screenshot_scaffold.dart
  - apps/mobile/lib/ui/photo_gallery/widgets/photo_card.dart
  - apps/mobile/lib/ui/whats_new/widgets/whats_new_dialog.dart
  - apps/mobile/assets/samples/sample_photo_04.jpg
  - apps/web/public/intro/mobile/photo_gallery_view_ios_snapshot.png
  - apps/web/public/intro/mobile/blog_input_view_ios_snapshot.png
  - apps/mobile/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - apps/mobile/.claude/skills/spectra-ask/SKILL.md
  - apps/mobile/lib/data/models/download_batch_result.dart
  - apps/mobile/lib/l10n/app_en.arb
  - .agents/skills/spectra-discuss/SKILL.md
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/Contents.json
  - apps/mobile/lib/screenshot/screenshot_app.dart
  - apps/mobile/lib/utils/constants.dart
  - apps/mobile/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
  - apps/mobile/.maestro/screenshot_matrix.yaml
  - apps/mobile/lib/ui/whats_new/widgets/whats_new_view.dart
  - apps/mobile/.claude/skills/screenshot-workflow/SKILL.md
  - apps/mobile/devtools_options.yaml
  - apps/mobile/scripts/screenshot_common.sh
  - apps/mobile/lib/data/services/log_service.dart
  - apps/web/src/components/layout/PublicLayout.tsx
  - apps/mobile/ios/Runner/Features/PhotoViewer/Model/PhotoFileInfo.swift
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/PhotoViewerActivity.kt
  - apps/mobile/scripts/run_android_screenshot_matrix.sh
  - apps/mobile/ios/Runner.xcodeproj/xcshareddata/xcschemes/Runner.xcscheme
  - apps/mobile/pubspec.yaml
  - CLAUDE.md
  - apps/mobile/assets/samples/sample_photo_09.jpg
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Contents.json
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-60x60@2x.png
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-76x76@2x.png
  - apps/web/CLAUDE.md
  - apps/mobile/lib/data/repositories/photo_repository.dart
  - apps/web/public/intro/mobile/photo_gallery_view_android_snapshot.png
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/channels/features/PhotoViewerChannel.kt
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-83.5x83.5@2x.png
  - apps/web/src/components/layout/AppLayout.tsx
  - apps/mobile/.claude/skills/spectra-propose/SKILL.md
  - apps/mobile/ios/Runner/Features/Base.lproj/Main.storyboard
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-38x38@3x.png
  - apps/mobile/ios/Runner/Features/PhotoViewer/ViewModel/PhotoViewerViewModel.swift
  - apps/mobile/analysis_options.yaml
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage@2x.png
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage@3x.png
  - apps/mobile/android/app/src/main/AndroidManifest.xml
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-29x29@2x.png
  - apps/mobile/.claude/skills/spectra-apply/SKILL.md
  - apps/mobile/android/app/src/main/res/drawable-v21/launch_background.xml
  - apps/mobile/ios/Flutter/Debug.xcconfig
  - .agents/skills/spectra-propose/SKILL.md
  - apps/web/src/pages/intro/IntroRootPage.tsx
  - apps/web/src/lib/i18n/messages/en.json
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-76x76.png
  - apps/mobile/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - apps/mobile/lib/config/whats_new_registry.dart
  - apps/mobile/ios/Podfile.lock
  - .github/workflows/mobile-ci.yml
  - apps/mobile/assets/samples/sample_photo_02.jpg
  - apps/mobile/ios/Runner.xcodeproj/project.xcworkspace/contents.xcworkspacedata
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-38x38@2x.png
  - apps/mobile/android/app/src/main/res/mipmap-hdpi/ic_launcher_new.png
  - apps/mobile/lib/data/repositories/log_repository.dart
  - apps/mobile/lib/l10n/app_ja.arb
  - apps/mobile/android/app/google-services.json
  - apps/mobile/lib/data/models/dtos/whats_new_response.dart
  - apps/mobile/lib/ui/download/widgets/download_view.dart
  - apps/web/public/intro/mobile/blog_input_view_android_snapshot.png
  - apps/web/public/intro/mobile/photo_detail_view_android_snapshot.png
  - apps/mobile/android/app/src/profile/AndroidManifest.xml
  - apps/mobile/android/build.gradle.kts
  - apps/mobile/lib/data/models/dtos/photo_download_request.dart
  - apps/mobile/android/app/src/main/res/mipmap-xhdpi/ic_launcher_new.png
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-20x20@2x.png
  - apps/web/src/components/intro/IntroNav.tsx
  - apps/web/src/lib/i18n/messages/ja.json
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/Contents.json
  - apps/mobile/lib/screenshot/screenshot_mock_data.dart
  - apps/mobile/lib/data/models/photo_entity.dart
  - apps/mobile/.claude/skills/store-assets/pyproject.toml
  - apps/mobile/assets/icons/icon_default.png
  - apps/mobile/lib/data/services/app_icon_service.dart
  - apps/web/src/pages/intro/IntroMobilePage.tsx
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/Contents.json
  - apps/mobile/ios/Runner/Features/PhotoViewer/View/CapsuleBottomBar.swift
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-29x29@3x.png
  - apps/web/src/pages/NotFoundPage.tsx
  - apps/mobile/lib/data/services/file_download_service.dart
  - apps/mobile/ios/Runner/Services/PhotoSaveable.swift
  - apps/web/public/intro/mobile/photo_detail_view_ios_snapshot.png
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/CapsuleBottomBar.kt
  - apps/web/src/lib/i18n/messages/zh-TW.json
  - .agents/skills/spectra-archive/SKILL.md
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-40x40.png
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/README.md
  - apps/mobile/lib/config/app_settings_keys.dart
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/PhotoFileInfo.kt
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-40x40@2x.png
  - apps/mobile/lib/utils/extensions.dart
  - apps/mobile/ios/Runner.xcworkspace/xcshareddata/IDEWorkspaceChecks.plist
  - apps/mobile/ios/Runner/Applications/SceneDelegate.swift
  - apps/mobile/assets/samples/sample_photo_08.jpg
  - apps/mobile/.claude/skills/spectra-discuss/SKILL.md
  - apps/mobile/lib/config/privacy_policy_url.dart
  - apps/mobile/.claude/skills/spectra-archive/SKILL.md
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/ZoomableImage.kt
  - apps/web/src/pages/LandingPage.tsx
  - apps/mobile/lib/data/models/whats_new_item.dart
  - apps/mobile/lib/ui/blog_input/widgets/blog_input_view.dart
  - apps/mobile/.claude/skills/store-assets/uv.lock
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-20x20.png
  - apps/mobile/scripts/sync_scenarios.dart
  - apps/web/package.json
  - apps/mobile/lib/l10n/app_localizations_ja.dart
  - apps/mobile/lib/data/models/dtos/job_status_response.dart
  - apps/mobile/.metadata
  - apps/mobile/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_new.png
  - apps/mobile/assets/icons/icon_new.png
  - apps/mobile/lib/ui/settings/view_model/settings_view_model.dart
  - apps/mobile/pubspec.lock
  - apps/mobile/lib/l10n/app_localizations_zh.dart
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/ThemeColors.kt
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/services/PhotoSaveable.kt
  - apps/mobile/.maestro/take_screenshot.yaml
  - apps/mobile/lib/data/repositories/settings_repository.dart
  - apps/mobile/.claude/skills/store-assets/config.json
  - apps/mobile/ios/Flutter/Release.xcconfig
  - apps/mobile/ios/Runner.xcworkspace/xcshareddata/WorkspaceSettings.xcsettings
  - apps/mobile/assets/samples/sample_photo_05.jpg
  - apps/mobile/lib/data/models/fetch_result.dart
  - apps/mobile/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
  - apps/mobile/assets/samples/sample_photo_01.jpg
  - apps/mobile/assets/samples/sample_photo_07.jpg
  - apps/mobile/.claude/skills/store-assets/generate.py
  - apps/mobile/ios/Runner/Features/PhotoViewer/View/FileInfoSheet.swift
  - apps/mobile/lib/config/app_icon.dart
  - apps/mobile/android/app/src/debug/AndroidManifest.xml
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-29x29@3x.png
  - apps/mobile/lib/ui/whats_new/view_model/whats_new_view_model.dart
  - apps/mobile/android/app/src/main/res/mipmap-mdpi/ic_launcher_new.png
  - apps/mobile/android/app/src/main/res/mipmap-xxhdpi/ic_launcher_new.png
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-20x20@3x.png
  - apps/mobile/lib/ui/download/view_model/download_view_model.dart
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/channels/features/AppIconChannel.kt
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-29x29.png
  - apps/mobile/lib/config/supported_locale.dart
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/PhotoViewerScreen.kt
  - apps/mobile/.claude/skills/store-assets/fonts/.gitkeep
  - apps/mobile/lib/l10n/app_localizations_en.dart
  - apps/mobile/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
  - apps/mobile/ios/Runner.xcworkspace/xcshareddata/swiftpm/Package.resolved
  - apps/mobile/android/settings.gradle.kts
  - apps/mobile/ios/Flutter/AppFrameworkInfo.plist
  - apps/mobile/ios/RunnerTests/ThemeColorsTests.swift
  - apps/mobile/lib/screenshot/screenshot_scenario_definitions.dart
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-40x40@3x.png
  - apps/mobile/ios/RunnerTests/PhotoViewerViewModelTests.swift
  - apps/mobile/android/app/src/main/res/values/styles.xml
  - apps/mobile/lib/l10n/app_ko.arb
  - apps/mobile/lib/main.dart
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-60x60@3x.png
  - apps/mobile/ios/Runner.xcworkspace/contents.xcworkspacedata
  - apps/web/src/lib/config/public-navigation.ts
  - apps/mobile/ios/Runner/Applications/Channels/Features/PhotoViewerChannel.swift
  - apps/mobile/ios/Runner/Features/PhotoViewer/View/PhotoViewerController.swift
  - apps/mobile/lib/config/bottom_sheet_animation.dart
  - apps/mobile/ios/Runner/Features/PhotoViewer/View/ZoomableScrollView.swift
  - apps/mobile/lib/config/theme.dart
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-83.5x83.5@2x.png
  - apps/mobile/ios/Runner/Features/PhotoViewer/Model/ThemeColors.swift
  - apps/mobile/ios/Runner.xcodeproj/project.xcworkspace/xcshareddata/WorkspaceSettings.xcsettings
  - apps/mobile/lib/l10n/app_zh.arb
  - apps/mobile/android/gradle/wrapper/gradle-wrapper.properties
  - apps/web/src/components/intro/StepCard.tsx
tests:
  - apps/web/src/__tests__/components/layout/PublicLayout.test.tsx
  - apps/mobile/android/app/src/test/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/viewmodel/PhotoViewerViewModelTest.kt
  - apps/mobile/test/widget_test.dart
  - apps/mobile/test/ui/blog_input/blog_input_view_model_test.dart
  - apps/mobile/android/app/src/test/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/ThemeColorsTest.kt
  - apps/web/src/__tests__/lib/i18n/intro-parity.test.ts
  - apps/web/src/__tests__/pages/HomePage.test.tsx
  - apps/mobile/test/ui/core/naver_url_validator_test.dart
  - apps/web/src/__tests__/components/intro/DownloadBadge.test.tsx
  - apps/mobile/test/data/services/api_service_test.dart
  - apps/web/src/__tests__/pages/LandingPage.test.tsx
  - apps/mobile/test/ui/photo_detail/photo_detail_view_model_test.dart
  - apps/mobile/test/data/repositories/photo_repository_test.dart
  - apps/web/src/__tests__/components/layout/AppLayout.test.tsx
  - apps/mobile/test/ui/download/download_view_model_test.dart
  - apps/web/src/__tests__/routes.test.tsx
  - apps/mobile/test/config/privacy_policy_url_test.dart
  - apps/mobile/android/app/src/test/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/PhotoFileInfoTest.kt
  - apps/mobile/test/data/repositories/cache_repository_test.dart
  - apps/mobile/test/ui/photo_gallery/photo_gallery_view_model_test.dart
-->

---
### Requirement: API client with timeout, retry, and dual-layer JSON parsing

The API client at `lib/api/client.ts` SHALL wrap `fetch()` with: a 30-second timeout via `AbortController`, automatic retry for HTTP 502/503/504 (max 3 attempts, exponential backoff 1s/2s/4s), and dual-layer JSON parsing for API Gateway Lambda proxy responses where the `body` field is a JSON string.

#### Scenario: Successful API call with dual-layer JSON

- **WHEN** the API returns `{ "statusCode": 200, "body": "{\"job_id\": \"abc\"}" }`
- **THEN** the client parses the outer JSON, detects the string `body` field, and returns `{ "job_id": "abc" }`

#### Scenario: Request timeout after 30 seconds

- **WHEN** the API does not respond within 30 seconds
- **THEN** the client aborts the request and throws a timeout error

#### Scenario: Retry on 503 with exponential backoff

- **WHEN** the API returns HTTP 503 on the first two attempts and HTTP 200 on the third
- **THEN** the client retries after 1s and 2s delays, then returns the successful response

#### Scenario: Exhaust retries on persistent 502

- **WHEN** the API returns HTTP 502 on all 3 attempts
- **THEN** the client throws an error after the third failed attempt


<!-- @trace
source: web-app-with-backend-packaging
updated: 2026-04-12
code:
  - apps/web/src/pages/GalleryPage.tsx
  - apps/web/tsconfig.tsbuildinfo
  - apps/web/src/lib/i18n/messages/ja.json
  - CLAUDE.md
  - apps/web/src/lib/services/url-validator.ts
  - apps/web/src/lib/services/blog-id.ts
  - apps/web/CLAUDE.md
  - apps/web/src/lib/stores/use-blog-input-store.ts
  - apps/web/index.html
  - apps/backend/src/data_models.py
  - apps/web/src/components/blog-input/BlogInputForm.tsx
  - apps/web/src/lib/i18n/messages/zh-TW.json
  - apps/backend/src/routes/photos.py
  - apps/web/package.json
  - apps/web/src/components/settings/LanguageSwitcher.tsx
  - apps/web/src/lib/api/photos.ts
  - apps/web/src/pages/NotFoundPage.tsx
  - apps/web/public/icons.svg
  - apps/web/src/components/gallery/ImageViewer.tsx
  - apps/web/src/components/gallery/SelectionToolbar.tsx
  - apps/backend/pyproject.toml
  - apps/backend/src/response_builder.py
  - apps/web/src/components/blog-input/FetchProgress.tsx
  - apps/web/src/lib/api/types.ts
  - apps/web/vite.config.ts
  - .github/workflows/web-ci.yml
  - apps/web/src/lib/hooks/use-clipboard.ts
  - apps/web/src/lib/api/client.ts
  - apps/web/src/App.tsx
  - apps/backend/README.md
  - apps/web/src/components/settings/SettingsDrawer.tsx
  - apps/backend/CLAUDE.md
  - apps/web/src/index.css
  - apps/web/src/components/settings/ThemeSwitcher.tsx
  - apps/web/src/routes.tsx
  - apps/web/src/lib/config/api.ts
  - apps/web/src/lib/stores/use-settings-store.ts
  - apps/web/tsconfig.json
  - apps/backend/requirements.txt
  - apps/web/.gitkeep
  - apps/web/public/icons/icon_new.png
  - README.md
  - apps/web/src/lib/i18n/messages/en.json
  - apps/backend/src/job_store/package.py
  - apps/web/.env.example
  - apps/web/public/icons/icon_default.png
  - apps/web/src/main.tsx
  - apps/web/src/lib/i18n/messages/ko.json
  - apps/web/src/pages/HomePage.tsx
  - apps/backend/.envExample
  - apps/web/public/favicon.svg
  - apps/web/src/lib/stores/use-gallery-store.ts
  - apps/web/src/components/gallery/PhotoGrid.tsx
  - apps/web/src/lib/i18n/config.ts
  - apps/backend/src/app.py
  - apps/web/src/lib/stores/use-download-store.ts
  - apps/web/src/lib/hooks/use-polling.ts
  - apps/backend/.env.example
  - apps/backend/src/job_store/__init__.py
  - apps/web/src/components/download/DownloadProgress.tsx
  - apps/web/src/components/gallery/PhotoCard.tsx
tests:
  - apps/web/src/__tests__/components/gallery/PhotoCard.test.tsx
  - apps/web/src/__tests__/lib/services/blog-id.test.ts
  - apps/backend/tests/api.http
  - apps/web/src/__tests__/lib/hooks/use-polling.test.ts
  - apps/web/src/__tests__/lib/services/url-validator.test.ts
  - apps/web/src/__tests__/lib/stores/use-gallery-store.test.ts
  - apps/web/src/__tests__/lib/api/client.test.ts
  - apps/web/src/__tests__/setup.ts
-->

---
### Requirement: Environment variable configuration

The API base URL and stage SHALL be configured via Vite environment variables `VITE_API_BASE_URL` and `VITE_API_STAGE`, accessed via `import.meta.env`. An `.env.example` file SHALL document the required variables.

#### Scenario: API client uses environment variables

- **WHEN** `VITE_API_BASE_URL` is set to `https://example.com` and `VITE_API_STAGE` is set to `prod`
- **THEN** the API client sends requests to `https://example.com/prod/api/photos`


<!-- @trace
source: web-app-with-backend-packaging
updated: 2026-04-12
code:
  - apps/web/src/pages/GalleryPage.tsx
  - apps/web/tsconfig.tsbuildinfo
  - apps/web/src/lib/i18n/messages/ja.json
  - CLAUDE.md
  - apps/web/src/lib/services/url-validator.ts
  - apps/web/src/lib/services/blog-id.ts
  - apps/web/CLAUDE.md
  - apps/web/src/lib/stores/use-blog-input-store.ts
  - apps/web/index.html
  - apps/backend/src/data_models.py
  - apps/web/src/components/blog-input/BlogInputForm.tsx
  - apps/web/src/lib/i18n/messages/zh-TW.json
  - apps/backend/src/routes/photos.py
  - apps/web/package.json
  - apps/web/src/components/settings/LanguageSwitcher.tsx
  - apps/web/src/lib/api/photos.ts
  - apps/web/src/pages/NotFoundPage.tsx
  - apps/web/public/icons.svg
  - apps/web/src/components/gallery/ImageViewer.tsx
  - apps/web/src/components/gallery/SelectionToolbar.tsx
  - apps/backend/pyproject.toml
  - apps/backend/src/response_builder.py
  - apps/web/src/components/blog-input/FetchProgress.tsx
  - apps/web/src/lib/api/types.ts
  - apps/web/vite.config.ts
  - .github/workflows/web-ci.yml
  - apps/web/src/lib/hooks/use-clipboard.ts
  - apps/web/src/lib/api/client.ts
  - apps/web/src/App.tsx
  - apps/backend/README.md
  - apps/web/src/components/settings/SettingsDrawer.tsx
  - apps/backend/CLAUDE.md
  - apps/web/src/index.css
  - apps/web/src/components/settings/ThemeSwitcher.tsx
  - apps/web/src/routes.tsx
  - apps/web/src/lib/config/api.ts
  - apps/web/src/lib/stores/use-settings-store.ts
  - apps/web/tsconfig.json
  - apps/backend/requirements.txt
  - apps/web/.gitkeep
  - apps/web/public/icons/icon_new.png
  - README.md
  - apps/web/src/lib/i18n/messages/en.json
  - apps/backend/src/job_store/package.py
  - apps/web/.env.example
  - apps/web/public/icons/icon_default.png
  - apps/web/src/main.tsx
  - apps/web/src/lib/i18n/messages/ko.json
  - apps/web/src/pages/HomePage.tsx
  - apps/backend/.envExample
  - apps/web/public/favicon.svg
  - apps/web/src/lib/stores/use-gallery-store.ts
  - apps/web/src/components/gallery/PhotoGrid.tsx
  - apps/web/src/lib/i18n/config.ts
  - apps/backend/src/app.py
  - apps/web/src/lib/stores/use-download-store.ts
  - apps/web/src/lib/hooks/use-polling.ts
  - apps/backend/.env.example
  - apps/backend/src/job_store/__init__.py
  - apps/web/src/components/download/DownloadProgress.tsx
  - apps/web/src/components/gallery/PhotoCard.tsx
tests:
  - apps/web/src/__tests__/components/gallery/PhotoCard.test.tsx
  - apps/web/src/__tests__/lib/services/blog-id.test.ts
  - apps/backend/tests/api.http
  - apps/web/src/__tests__/lib/hooks/use-polling.test.ts
  - apps/web/src/__tests__/lib/services/url-validator.test.ts
  - apps/web/src/__tests__/lib/stores/use-gallery-store.test.ts
  - apps/web/src/__tests__/lib/api/client.test.ts
  - apps/web/src/__tests__/setup.ts
-->

---
### Requirement: M3 color theme with dark mode support

The app SHALL define CSS custom properties derived from Material 3 seed color `#1565C0`. Both light and dark theme tokens SHALL be defined. Dark mode SHALL be toggled via the `dark` class on `<html>`, managed by Tailwind CSS 4's `class` strategy.

#### Scenario: Light theme applied by default

- **WHEN** no theme preference is set
- **THEN** light theme CSS custom properties are active

#### Scenario: Dark theme applied via class

- **WHEN** `<html>` element has the `dark` class
- **THEN** dark theme CSS custom properties override light theme values


<!-- @trace
source: web-app-with-backend-packaging
updated: 2026-04-12
code:
  - apps/web/src/pages/GalleryPage.tsx
  - apps/web/tsconfig.tsbuildinfo
  - apps/web/src/lib/i18n/messages/ja.json
  - CLAUDE.md
  - apps/web/src/lib/services/url-validator.ts
  - apps/web/src/lib/services/blog-id.ts
  - apps/web/CLAUDE.md
  - apps/web/src/lib/stores/use-blog-input-store.ts
  - apps/web/index.html
  - apps/backend/src/data_models.py
  - apps/web/src/components/blog-input/BlogInputForm.tsx
  - apps/web/src/lib/i18n/messages/zh-TW.json
  - apps/backend/src/routes/photos.py
  - apps/web/package.json
  - apps/web/src/components/settings/LanguageSwitcher.tsx
  - apps/web/src/lib/api/photos.ts
  - apps/web/src/pages/NotFoundPage.tsx
  - apps/web/public/icons.svg
  - apps/web/src/components/gallery/ImageViewer.tsx
  - apps/web/src/components/gallery/SelectionToolbar.tsx
  - apps/backend/pyproject.toml
  - apps/backend/src/response_builder.py
  - apps/web/src/components/blog-input/FetchProgress.tsx
  - apps/web/src/lib/api/types.ts
  - apps/web/vite.config.ts
  - .github/workflows/web-ci.yml
  - apps/web/src/lib/hooks/use-clipboard.ts
  - apps/web/src/lib/api/client.ts
  - apps/web/src/App.tsx
  - apps/backend/README.md
  - apps/web/src/components/settings/SettingsDrawer.tsx
  - apps/backend/CLAUDE.md
  - apps/web/src/index.css
  - apps/web/src/components/settings/ThemeSwitcher.tsx
  - apps/web/src/routes.tsx
  - apps/web/src/lib/config/api.ts
  - apps/web/src/lib/stores/use-settings-store.ts
  - apps/web/tsconfig.json
  - apps/backend/requirements.txt
  - apps/web/.gitkeep
  - apps/web/public/icons/icon_new.png
  - README.md
  - apps/web/src/lib/i18n/messages/en.json
  - apps/backend/src/job_store/package.py
  - apps/web/.env.example
  - apps/web/public/icons/icon_default.png
  - apps/web/src/main.tsx
  - apps/web/src/lib/i18n/messages/ko.json
  - apps/web/src/pages/HomePage.tsx
  - apps/backend/.envExample
  - apps/web/public/favicon.svg
  - apps/web/src/lib/stores/use-gallery-store.ts
  - apps/web/src/components/gallery/PhotoGrid.tsx
  - apps/web/src/lib/i18n/config.ts
  - apps/backend/src/app.py
  - apps/web/src/lib/stores/use-download-store.ts
  - apps/web/src/lib/hooks/use-polling.ts
  - apps/backend/.env.example
  - apps/backend/src/job_store/__init__.py
  - apps/web/src/components/download/DownloadProgress.tsx
  - apps/web/src/components/gallery/PhotoCard.tsx
tests:
  - apps/web/src/__tests__/components/gallery/PhotoCard.test.tsx
  - apps/web/src/__tests__/lib/services/blog-id.test.ts
  - apps/backend/tests/api.http
  - apps/web/src/__tests__/lib/hooks/use-polling.test.ts
  - apps/web/src/__tests__/lib/services/url-validator.test.ts
  - apps/web/src/__tests__/lib/stores/use-gallery-store.test.ts
  - apps/web/src/__tests__/lib/api/client.test.ts
  - apps/web/src/__tests__/setup.ts
-->

---
### Requirement: BlogId generation using Web Crypto API

The `blog-id.ts` service SHALL generate a blogId by computing SHA-256 of the blog URL and returning the first 16 hexadecimal characters. This SHALL match the mobile app's `CacheRepository.blogId()` output.

#### Scenario: Generate blogId from URL

- **WHEN** `blogId("https://blog.naver.com/user/12345")` is called
- **THEN** the function returns the first 16 characters of the SHA-256 hex digest of the input string


<!-- @trace
source: web-app-with-backend-packaging
updated: 2026-04-12
code:
  - apps/web/src/pages/GalleryPage.tsx
  - apps/web/tsconfig.tsbuildinfo
  - apps/web/src/lib/i18n/messages/ja.json
  - CLAUDE.md
  - apps/web/src/lib/services/url-validator.ts
  - apps/web/src/lib/services/blog-id.ts
  - apps/web/CLAUDE.md
  - apps/web/src/lib/stores/use-blog-input-store.ts
  - apps/web/index.html
  - apps/backend/src/data_models.py
  - apps/web/src/components/blog-input/BlogInputForm.tsx
  - apps/web/src/lib/i18n/messages/zh-TW.json
  - apps/backend/src/routes/photos.py
  - apps/web/package.json
  - apps/web/src/components/settings/LanguageSwitcher.tsx
  - apps/web/src/lib/api/photos.ts
  - apps/web/src/pages/NotFoundPage.tsx
  - apps/web/public/icons.svg
  - apps/web/src/components/gallery/ImageViewer.tsx
  - apps/web/src/components/gallery/SelectionToolbar.tsx
  - apps/backend/pyproject.toml
  - apps/backend/src/response_builder.py
  - apps/web/src/components/blog-input/FetchProgress.tsx
  - apps/web/src/lib/api/types.ts
  - apps/web/vite.config.ts
  - .github/workflows/web-ci.yml
  - apps/web/src/lib/hooks/use-clipboard.ts
  - apps/web/src/lib/api/client.ts
  - apps/web/src/App.tsx
  - apps/backend/README.md
  - apps/web/src/components/settings/SettingsDrawer.tsx
  - apps/backend/CLAUDE.md
  - apps/web/src/index.css
  - apps/web/src/components/settings/ThemeSwitcher.tsx
  - apps/web/src/routes.tsx
  - apps/web/src/lib/config/api.ts
  - apps/web/src/lib/stores/use-settings-store.ts
  - apps/web/tsconfig.json
  - apps/backend/requirements.txt
  - apps/web/.gitkeep
  - apps/web/public/icons/icon_new.png
  - README.md
  - apps/web/src/lib/i18n/messages/en.json
  - apps/backend/src/job_store/package.py
  - apps/web/.env.example
  - apps/web/public/icons/icon_default.png
  - apps/web/src/main.tsx
  - apps/web/src/lib/i18n/messages/ko.json
  - apps/web/src/pages/HomePage.tsx
  - apps/backend/.envExample
  - apps/web/public/favicon.svg
  - apps/web/src/lib/stores/use-gallery-store.ts
  - apps/web/src/components/gallery/PhotoGrid.tsx
  - apps/web/src/lib/i18n/config.ts
  - apps/backend/src/app.py
  - apps/web/src/lib/stores/use-download-store.ts
  - apps/web/src/lib/hooks/use-polling.ts
  - apps/backend/.env.example
  - apps/backend/src/job_store/__init__.py
  - apps/web/src/components/download/DownloadProgress.tsx
  - apps/web/src/components/gallery/PhotoCard.tsx
tests:
  - apps/web/src/__tests__/components/gallery/PhotoCard.test.tsx
  - apps/web/src/__tests__/lib/services/blog-id.test.ts
  - apps/backend/tests/api.http
  - apps/web/src/__tests__/lib/hooks/use-polling.test.ts
  - apps/web/src/__tests__/lib/services/url-validator.test.ts
  - apps/web/src/__tests__/lib/stores/use-gallery-store.test.ts
  - apps/web/src/__tests__/lib/api/client.test.ts
  - apps/web/src/__tests__/setup.ts
-->

---
### Requirement: Naver URL validator ported from mobile

The `url-validator.ts` service SHALL validate URLs matching the regex `^https://(m\.)?blog\.naver\.com/` and normalize mobile URLs (`m.blog.naver.com`) to desktop URLs (`blog.naver.com`).

#### Scenario: Valid desktop URL

- **WHEN** `isValid("https://blog.naver.com/user/12345")` is called
- **THEN** the function returns `true`

#### Scenario: Valid mobile URL normalized

- **WHEN** `normalize("https://m.blog.naver.com/user/12345")` is called
- **THEN** the function returns `"https://blog.naver.com/user/12345"`

#### Scenario: Invalid URL rejected

- **WHEN** `isValid("https://example.com/page")` is called
- **THEN** the function returns `false`

<!-- @trace
source: web-app-with-backend-packaging
updated: 2026-04-12
code:
  - apps/web/src/pages/GalleryPage.tsx
  - apps/web/tsconfig.tsbuildinfo
  - apps/web/src/lib/i18n/messages/ja.json
  - CLAUDE.md
  - apps/web/src/lib/services/url-validator.ts
  - apps/web/src/lib/services/blog-id.ts
  - apps/web/CLAUDE.md
  - apps/web/src/lib/stores/use-blog-input-store.ts
  - apps/web/index.html
  - apps/backend/src/data_models.py
  - apps/web/src/components/blog-input/BlogInputForm.tsx
  - apps/web/src/lib/i18n/messages/zh-TW.json
  - apps/backend/src/routes/photos.py
  - apps/web/package.json
  - apps/web/src/components/settings/LanguageSwitcher.tsx
  - apps/web/src/lib/api/photos.ts
  - apps/web/src/pages/NotFoundPage.tsx
  - apps/web/public/icons.svg
  - apps/web/src/components/gallery/ImageViewer.tsx
  - apps/web/src/components/gallery/SelectionToolbar.tsx
  - apps/backend/pyproject.toml
  - apps/backend/src/response_builder.py
  - apps/web/src/components/blog-input/FetchProgress.tsx
  - apps/web/src/lib/api/types.ts
  - apps/web/vite.config.ts
  - .github/workflows/web-ci.yml
  - apps/web/src/lib/hooks/use-clipboard.ts
  - apps/web/src/lib/api/client.ts
  - apps/web/src/App.tsx
  - apps/backend/README.md
  - apps/web/src/components/settings/SettingsDrawer.tsx
  - apps/backend/CLAUDE.md
  - apps/web/src/index.css
  - apps/web/src/components/settings/ThemeSwitcher.tsx
  - apps/web/src/routes.tsx
  - apps/web/src/lib/config/api.ts
  - apps/web/src/lib/stores/use-settings-store.ts
  - apps/web/tsconfig.json
  - apps/backend/requirements.txt
  - apps/web/.gitkeep
  - apps/web/public/icons/icon_new.png
  - README.md
  - apps/web/src/lib/i18n/messages/en.json
  - apps/backend/src/job_store/package.py
  - apps/web/.env.example
  - apps/web/public/icons/icon_default.png
  - apps/web/src/main.tsx
  - apps/web/src/lib/i18n/messages/ko.json
  - apps/web/src/pages/HomePage.tsx
  - apps/backend/.envExample
  - apps/web/public/favicon.svg
  - apps/web/src/lib/stores/use-gallery-store.ts
  - apps/web/src/components/gallery/PhotoGrid.tsx
  - apps/web/src/lib/i18n/config.ts
  - apps/backend/src/app.py
  - apps/web/src/lib/stores/use-download-store.ts
  - apps/web/src/lib/hooks/use-polling.ts
  - apps/backend/.env.example
  - apps/backend/src/job_store/__init__.py
  - apps/web/src/components/download/DownloadProgress.tsx
  - apps/web/src/components/gallery/PhotoCard.tsx
tests:
  - apps/web/src/__tests__/components/gallery/PhotoCard.test.tsx
  - apps/web/src/__tests__/lib/services/blog-id.test.ts
  - apps/backend/tests/api.http
  - apps/web/src/__tests__/lib/hooks/use-polling.test.ts
  - apps/web/src/__tests__/lib/services/url-validator.test.ts
  - apps/web/src/__tests__/lib/stores/use-gallery-store.test.ts
  - apps/web/src/__tests__/lib/api/client.test.ts
  - apps/web/src/__tests__/setup.ts
-->

---
### Requirement: Build-time app version injection

The Vite build configuration SHALL define a global constant `__APP_VERSION__` injected at build time from the `version` field of `apps/web/package.json`. A TypeScript declaration SHALL exist so that `__APP_VERSION__` is typed as `string`. The `AppLayout` header SHALL display the version as `v<semver>` next to the app title, using subdued styling (`text-xs`, `color-on-surface-variant`) that is visible on all pages rendered under `AppLayout`.

#### Scenario: Version displayed in AppLayout header

- **WHEN** the user opens any page rendered under `AppLayout` (such as `/app/web` or `/app/web/gallery/:blogId`)
- **THEN** the header displays the current version string in the format `v<semver>` (e.g., `v1.2.0`)

#### Scenario: Version matches package.json

- **WHEN** `apps/web/package.json` has `"version": "1.2.0"`
- **THEN** the header displays `v1.2.0`


<!-- @trace
source: unify-landing-in-apps-web
updated: 2026-04-18
code:
  - apps/web/src/lib/i18n/messages/ko.json
  - apps/web/src/pages/HomePage.tsx
  - apps/web/public/intro/mobile/photo_gallery_view_android_snapshot.png
  - apps/web/src/routes.tsx
  - docs/mobile/images/setting_view_ios_snapshot.png
  - apps/web/src/components/intro/ScreenshotCarousel.tsx
  - docs/web/index.html
  - apps/web/public/intro/mobile/photo_detail_view_ios_snapshot.png
  - apps/web/public/intro/mobile/setting_view_ios_snapshot.png
  - docs/mobile/images/photo_gallery_view_android_snapshot.png
  - docs/mobile/images/photo_gallery_view_ios_snapshot.png
  - apps/web/public/intro/mobile/blog_input_view_ios_snapshot.png
  - docs/mobile/index.html
  - apps/web/src/pages/intro/IntroRootPage.tsx
  - apps/web/public/intro/mobile/blog_input_view_android_snapshot.png
  - apps/web/src/components/layout/AppLayout.tsx
  - docs/mobile/css/style.css
  - docs/mobile/js/main.js
  - docs/mobile/images/photo_detail_view_android_snapshot.png
  - .github/workflows/deploy-pages.yml
  - apps/web/src/lib/i18n/messages/en.json
  - apps/web/src/pages/GalleryPage.tsx
  - apps/web/src/lib/i18n/messages/ja.json
  - apps/web/src/lib/stores/use-settings-store.ts
  - apps/web/src/components/intro/DownloadBadge.tsx
  - apps/web/public/intro/mobile/setting_view_android_snapshot.png
  - apps/web/public/intro/mobile/photo_detail_view_android_snapshot.png
  - apps/web/src/pages/intro/IntroMobilePage.tsx
  - apps/web/src/components/intro/FeatureCard.tsx
  - docs/mobile/images/setting_view_android_snapshot.png
  - docs/mobile/images/blog_input_view_android_snapshot.png
  - docs/mobile/images/blog_input_view_ios_snapshot.png
  - apps/web/src/components/layout/ThemeLocaleControls.tsx
  - README.md
  - apps/web/CLAUDE.md
  - apps/web/src/lib/i18n/messages/zh-TW.json
  - apps/web/src/components/layout/PublicLayout.tsx
  - docs/mobile/images/photo_detail_view_ios_snapshot.png
  - apps/web/src/App.tsx
  - apps/web/package.json
  - docs/index.html
  - docs/mobile/mobile-architecture.md
  - apps/web/src/components/intro/IntroFooter.tsx
  - apps/web/src/pages/NotFoundPage.tsx
  - docs/mobile/js/i18n.js
  - apps/web/src/lib/config/ui-controls.ts
  - apps/web/src/components/intro/IntroNav.tsx
  - apps/web/src/components/intro/StepCard.tsx
  - apps/web/src/pages/intro/IntroWebPage.tsx
  - apps/web/public/intro/mobile/photo_gallery_view_ios_snapshot.png
  - apps/web/src/lib/config/public-navigation.ts
tests:
  - apps/web/src/__tests__/components/intro/DownloadBadge.test.tsx
  - apps/web/src/__tests__/pages/HomePage.test.tsx
  - apps/web/src/__tests__/routes.test.tsx
  - apps/web/src/__tests__/lib/i18n/intro-parity.test.ts
  - apps/web/src/__tests__/components/layout/AppLayout.test.tsx
  - apps/web/src/__tests__/components/layout/PublicLayout.test.tsx
-->

---
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


<!-- @trace
source: remove-mobile-app-flatten-web-routes
updated: 2026-08-31
code:
  - apps/mobile/.claude/settings.json
  - .agents/skills/spectra-drift/SKILL.md
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-40x40@2x.png
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-60x60@2x.png
  - apps/mobile/lib/data/models/dtos/photo_download_response.dart
  - apps/mobile/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - apps/mobile/scripts/screenshot_matrix.json
  - .github/workflows/mobile-cd.yml
  - apps/web/src/lib/i18n/messages/ko.json
  - apps/web/src/routes.tsx
  - apps/mobile/ios/Runner/Configurations/Info.plist
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-29x29@2x.png
  - apps/mobile/lib/screenshot/screenshot_scenarios.dart
  - apps/web/src/pages/HomePage.tsx
  - apps/mobile/ios/Podfile
  - apps/mobile/ios/Runner/Features/PhotoViewer/View/ZoomableImageView.swift
  - apps/mobile/l10n.yaml
  - apps/mobile/lib/amplifyconfiguration.dart
  - apps/mobile/ios/Runner/Services/PhotoService.swift
  - apps/mobile/android/app/src/main/res/mipmap-hdpi/ic_launcher.png
  - apps/mobile/lib/ui/core/app_error.dart
  - apps/mobile/.claude/skills/store-assets/frames/.gitkeep
  - apps/mobile/android/gradle.properties
  - apps/mobile/README.md
  - apps/mobile/lib/data/services/photo_service.dart
  - apps/web/src/components/intro/FeatureCard.tsx
  - apps/web/src/components/intro/ScreenshotCarousel.tsx
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-76x76@2x.png
  - apps/mobile/android/app/src/main/res/values-night/styles.xml
  - apps/mobile/lib/data/services/whats_new_data_source.dart
  - apps/mobile/.claude/skills/store-assets/SKILL.md
  - apps/mobile/assets/samples/sample_photo_03.jpg
  - apps/mobile/ios/RunnerTests/PhotoFileInfoTests.swift
  - .agents/skills/spectra-commit/SKILL.md
  - apps/mobile/.claude/skills/spectra-audit/SKILL.md
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-20x20@3x.png
  - apps/mobile/lib/l10n/app_localizations_ko.dart
  - apps/web/src/pages/intro/IntroWebPage.tsx
  - apps/mobile/ios/Runner/Applications/AppDelegate.swift
  - apps/mobile/ios/Runner/Applications/Channels/Features/GalleryChannel.swift
  - apps/mobile/ios/Runner/Features/Base.lproj/LaunchScreen.storyboard
  - apps/mobile/lib/data/services/auth_service.dart
  - apps/mobile/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - apps/mobile/lib/app.dart
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/channels/features/GalleryChannel.kt
  - apps/web/public/intro/mobile/setting_view_ios_snapshot.png
  - apps/mobile/.claude/skills/spectra-debug/SKILL.md
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-20x20@2x.png
  - apps/mobile/lib/config/whats_new_icon_resolver.dart
  - apps/mobile/lib/data/services/photo_viewer_service.dart
  - apps/mobile/lib/data/repositories/cache_repository.dart
  - apps/mobile/CLAUDE.md
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/MainActivity.kt
  - apps/mobile/lib/data/services/api_service.dart
  - apps/web/public/intro/mobile/setting_view_android_snapshot.png
  - apps/web/src/pages/GalleryPage.tsx
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/viewmodel/PhotoViewerViewModel.kt
  - apps/mobile/lib/ui/core/naver_url_validator.dart
  - apps/mobile/ios/Runner/Applications/Channels/Features/AppIconChannel.swift
  - apps/mobile/assets/store/google-play-feature-graphic.png
  - apps/mobile/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - apps/mobile/android/app/src/main/res/mipmap-mdpi/ic_launcher.png
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-1024x1024.png
  - apps/mobile/lib/l10n/app_localizations.dart
  - apps/mobile/android/app/build.gradle.kts
  - apps/mobile/lib/screenshot/app_runtime_mode.dart
  - apps/web/src/components/intro/DownloadBadge.tsx
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage.png
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/FileInfoContent.kt
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-40x40@3x.png
  - apps/mobile/lib/ui/core/view_model/app_settings_view_model.dart
  - apps/web/src/lib/config/privacy-policy.ts
  - apps/mobile/android/app/src/main/res/drawable/launch_background.xml
  - apps/mobile/ios/Runner.xcodeproj/project.pbxproj
  - apps/mobile/lib/ui/settings/widgets/settings_view.dart
  - apps/mobile/lib/l10n/app_zh_TW.arb
  - apps/mobile/lib/config/app_config.dart
  - apps/mobile/lib/routing/app_router.dart
  - apps/mobile/lib/screenshot/screenshot_config.dart
  - apps/mobile/ios/Runner/GoogleService-Info.plist
  - apps/mobile/scripts/generate_maestro_matrix.dart
  - apps/mobile/ios/Runner/Headers/Runner-Bridging-Header.h
  - .agents/skills/spectra-apply/SKILL.md
  - apps/mobile/ios/Runner.xcodeproj/project.xcworkspace/xcshareddata/IDEWorkspaceChecks.plist
  - apps/web/src/pages/PrivacyPolicyPage.tsx
  - README.md
  - apps/mobile/scripts/run_ios_screenshot_matrix.sh
  - AGENTS.md
  - apps/mobile/ios/Runner/Features/PhotoViewer/View/AsyncButton.swift
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-60x60@3x.png
  - apps/mobile/lib/data/services/crashlytics_service.dart
  - apps/mobile/lib/data/services/local_storage_service.dart
  - apps/mobile/.claude/skills/spectra-ingest/SKILL.md
  - apps/mobile/lib/data/models/dtos/whats_new_request.dart
  - apps/mobile/assets/screenshots/store_listings.json
  - apps/mobile/assets/samples/sample_photo_06.jpg
  - apps/mobile/ios/Runner/Features/PhotoViewer/View/PhotoViewerNavigationBar.swift
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/services/PhotoService.kt
  - apps/mobile/ios/Runner/Features/PhotoViewer/View/PhotoViewerView.swift
  - .agents/skills/spectra-ingest/SKILL.md
  - apps/mobile/.claude/skills/store-assets/.python-version
  - apps/mobile/ios/Runner.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-1024x1024.png
  - apps/mobile/lib/data/models/blog_cache_metadata.dart
  - apps/mobile/lib/screenshot/widgets/screenshot_scaffold.dart
  - apps/mobile/lib/ui/photo_gallery/widgets/photo_card.dart
  - apps/mobile/lib/ui/whats_new/widgets/whats_new_dialog.dart
  - apps/mobile/assets/samples/sample_photo_04.jpg
  - apps/web/public/intro/mobile/photo_gallery_view_ios_snapshot.png
  - apps/web/public/intro/mobile/blog_input_view_ios_snapshot.png
  - apps/mobile/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - apps/mobile/.claude/skills/spectra-ask/SKILL.md
  - apps/mobile/lib/data/models/download_batch_result.dart
  - apps/mobile/lib/l10n/app_en.arb
  - .agents/skills/spectra-discuss/SKILL.md
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/Contents.json
  - apps/mobile/lib/screenshot/screenshot_app.dart
  - apps/mobile/lib/utils/constants.dart
  - apps/mobile/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
  - apps/mobile/.maestro/screenshot_matrix.yaml
  - apps/mobile/lib/ui/whats_new/widgets/whats_new_view.dart
  - apps/mobile/.claude/skills/screenshot-workflow/SKILL.md
  - apps/mobile/devtools_options.yaml
  - apps/mobile/scripts/screenshot_common.sh
  - apps/mobile/lib/data/services/log_service.dart
  - apps/web/src/components/layout/PublicLayout.tsx
  - apps/mobile/ios/Runner/Features/PhotoViewer/Model/PhotoFileInfo.swift
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/PhotoViewerActivity.kt
  - apps/mobile/scripts/run_android_screenshot_matrix.sh
  - apps/mobile/ios/Runner.xcodeproj/xcshareddata/xcschemes/Runner.xcscheme
  - apps/mobile/pubspec.yaml
  - CLAUDE.md
  - apps/mobile/assets/samples/sample_photo_09.jpg
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Contents.json
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-60x60@2x.png
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-76x76@2x.png
  - apps/web/CLAUDE.md
  - apps/mobile/lib/data/repositories/photo_repository.dart
  - apps/web/public/intro/mobile/photo_gallery_view_android_snapshot.png
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/channels/features/PhotoViewerChannel.kt
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-83.5x83.5@2x.png
  - apps/web/src/components/layout/AppLayout.tsx
  - apps/mobile/.claude/skills/spectra-propose/SKILL.md
  - apps/mobile/ios/Runner/Features/Base.lproj/Main.storyboard
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-38x38@3x.png
  - apps/mobile/ios/Runner/Features/PhotoViewer/ViewModel/PhotoViewerViewModel.swift
  - apps/mobile/analysis_options.yaml
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage@2x.png
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage@3x.png
  - apps/mobile/android/app/src/main/AndroidManifest.xml
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-29x29@2x.png
  - apps/mobile/.claude/skills/spectra-apply/SKILL.md
  - apps/mobile/android/app/src/main/res/drawable-v21/launch_background.xml
  - apps/mobile/ios/Flutter/Debug.xcconfig
  - .agents/skills/spectra-propose/SKILL.md
  - apps/web/src/pages/intro/IntroRootPage.tsx
  - apps/web/src/lib/i18n/messages/en.json
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-76x76.png
  - apps/mobile/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - apps/mobile/lib/config/whats_new_registry.dart
  - apps/mobile/ios/Podfile.lock
  - .github/workflows/mobile-ci.yml
  - apps/mobile/assets/samples/sample_photo_02.jpg
  - apps/mobile/ios/Runner.xcodeproj/project.xcworkspace/contents.xcworkspacedata
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-38x38@2x.png
  - apps/mobile/android/app/src/main/res/mipmap-hdpi/ic_launcher_new.png
  - apps/mobile/lib/data/repositories/log_repository.dart
  - apps/mobile/lib/l10n/app_ja.arb
  - apps/mobile/android/app/google-services.json
  - apps/mobile/lib/data/models/dtos/whats_new_response.dart
  - apps/mobile/lib/ui/download/widgets/download_view.dart
  - apps/web/public/intro/mobile/blog_input_view_android_snapshot.png
  - apps/web/public/intro/mobile/photo_detail_view_android_snapshot.png
  - apps/mobile/android/app/src/profile/AndroidManifest.xml
  - apps/mobile/android/build.gradle.kts
  - apps/mobile/lib/data/models/dtos/photo_download_request.dart
  - apps/mobile/android/app/src/main/res/mipmap-xhdpi/ic_launcher_new.png
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-20x20@2x.png
  - apps/web/src/components/intro/IntroNav.tsx
  - apps/web/src/lib/i18n/messages/ja.json
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/Contents.json
  - apps/mobile/lib/screenshot/screenshot_mock_data.dart
  - apps/mobile/lib/data/models/photo_entity.dart
  - apps/mobile/.claude/skills/store-assets/pyproject.toml
  - apps/mobile/assets/icons/icon_default.png
  - apps/mobile/lib/data/services/app_icon_service.dart
  - apps/web/src/pages/intro/IntroMobilePage.tsx
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/Contents.json
  - apps/mobile/ios/Runner/Features/PhotoViewer/View/CapsuleBottomBar.swift
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-29x29@3x.png
  - apps/web/src/pages/NotFoundPage.tsx
  - apps/mobile/lib/data/services/file_download_service.dart
  - apps/mobile/ios/Runner/Services/PhotoSaveable.swift
  - apps/web/public/intro/mobile/photo_detail_view_ios_snapshot.png
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/CapsuleBottomBar.kt
  - apps/web/src/lib/i18n/messages/zh-TW.json
  - .agents/skills/spectra-archive/SKILL.md
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-40x40.png
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/README.md
  - apps/mobile/lib/config/app_settings_keys.dart
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/PhotoFileInfo.kt
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-40x40@2x.png
  - apps/mobile/lib/utils/extensions.dart
  - apps/mobile/ios/Runner.xcworkspace/xcshareddata/IDEWorkspaceChecks.plist
  - apps/mobile/ios/Runner/Applications/SceneDelegate.swift
  - apps/mobile/assets/samples/sample_photo_08.jpg
  - apps/mobile/.claude/skills/spectra-discuss/SKILL.md
  - apps/mobile/lib/config/privacy_policy_url.dart
  - apps/mobile/.claude/skills/spectra-archive/SKILL.md
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/ZoomableImage.kt
  - apps/web/src/pages/LandingPage.tsx
  - apps/mobile/lib/data/models/whats_new_item.dart
  - apps/mobile/lib/ui/blog_input/widgets/blog_input_view.dart
  - apps/mobile/.claude/skills/store-assets/uv.lock
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-20x20.png
  - apps/mobile/scripts/sync_scenarios.dart
  - apps/web/package.json
  - apps/mobile/lib/l10n/app_localizations_ja.dart
  - apps/mobile/lib/data/models/dtos/job_status_response.dart
  - apps/mobile/.metadata
  - apps/mobile/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_new.png
  - apps/mobile/assets/icons/icon_new.png
  - apps/mobile/lib/ui/settings/view_model/settings_view_model.dart
  - apps/mobile/pubspec.lock
  - apps/mobile/lib/l10n/app_localizations_zh.dart
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/ThemeColors.kt
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/services/PhotoSaveable.kt
  - apps/mobile/.maestro/take_screenshot.yaml
  - apps/mobile/lib/data/repositories/settings_repository.dart
  - apps/mobile/.claude/skills/store-assets/config.json
  - apps/mobile/ios/Flutter/Release.xcconfig
  - apps/mobile/ios/Runner.xcworkspace/xcshareddata/WorkspaceSettings.xcsettings
  - apps/mobile/assets/samples/sample_photo_05.jpg
  - apps/mobile/lib/data/models/fetch_result.dart
  - apps/mobile/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
  - apps/mobile/assets/samples/sample_photo_01.jpg
  - apps/mobile/assets/samples/sample_photo_07.jpg
  - apps/mobile/.claude/skills/store-assets/generate.py
  - apps/mobile/ios/Runner/Features/PhotoViewer/View/FileInfoSheet.swift
  - apps/mobile/lib/config/app_icon.dart
  - apps/mobile/android/app/src/debug/AndroidManifest.xml
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-29x29@3x.png
  - apps/mobile/lib/ui/whats_new/view_model/whats_new_view_model.dart
  - apps/mobile/android/app/src/main/res/mipmap-mdpi/ic_launcher_new.png
  - apps/mobile/android/app/src/main/res/mipmap-xxhdpi/ic_launcher_new.png
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-20x20@3x.png
  - apps/mobile/lib/ui/download/view_model/download_view_model.dart
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/channels/features/AppIconChannel.kt
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-29x29.png
  - apps/mobile/lib/config/supported_locale.dart
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/PhotoViewerScreen.kt
  - apps/mobile/.claude/skills/store-assets/fonts/.gitkeep
  - apps/mobile/lib/l10n/app_localizations_en.dart
  - apps/mobile/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
  - apps/mobile/ios/Runner.xcworkspace/xcshareddata/swiftpm/Package.resolved
  - apps/mobile/android/settings.gradle.kts
  - apps/mobile/ios/Flutter/AppFrameworkInfo.plist
  - apps/mobile/ios/RunnerTests/ThemeColorsTests.swift
  - apps/mobile/lib/screenshot/screenshot_scenario_definitions.dart
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-40x40@3x.png
  - apps/mobile/ios/RunnerTests/PhotoViewerViewModelTests.swift
  - apps/mobile/android/app/src/main/res/values/styles.xml
  - apps/mobile/lib/l10n/app_ko.arb
  - apps/mobile/lib/main.dart
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-60x60@3x.png
  - apps/mobile/ios/Runner.xcworkspace/contents.xcworkspacedata
  - apps/web/src/lib/config/public-navigation.ts
  - apps/mobile/ios/Runner/Applications/Channels/Features/PhotoViewerChannel.swift
  - apps/mobile/ios/Runner/Features/PhotoViewer/View/PhotoViewerController.swift
  - apps/mobile/lib/config/bottom_sheet_animation.dart
  - apps/mobile/ios/Runner/Features/PhotoViewer/View/ZoomableScrollView.swift
  - apps/mobile/lib/config/theme.dart
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-83.5x83.5@2x.png
  - apps/mobile/ios/Runner/Features/PhotoViewer/Model/ThemeColors.swift
  - apps/mobile/ios/Runner.xcodeproj/project.xcworkspace/xcshareddata/WorkspaceSettings.xcsettings
  - apps/mobile/lib/l10n/app_zh.arb
  - apps/mobile/android/gradle/wrapper/gradle-wrapper.properties
  - apps/web/src/components/intro/StepCard.tsx
tests:
  - apps/web/src/__tests__/components/layout/PublicLayout.test.tsx
  - apps/mobile/android/app/src/test/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/viewmodel/PhotoViewerViewModelTest.kt
  - apps/mobile/test/widget_test.dart
  - apps/mobile/test/ui/blog_input/blog_input_view_model_test.dart
  - apps/mobile/android/app/src/test/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/ThemeColorsTest.kt
  - apps/web/src/__tests__/lib/i18n/intro-parity.test.ts
  - apps/web/src/__tests__/pages/HomePage.test.tsx
  - apps/mobile/test/ui/core/naver_url_validator_test.dart
  - apps/web/src/__tests__/components/intro/DownloadBadge.test.tsx
  - apps/mobile/test/data/services/api_service_test.dart
  - apps/web/src/__tests__/pages/LandingPage.test.tsx
  - apps/mobile/test/ui/photo_detail/photo_detail_view_model_test.dart
  - apps/mobile/test/data/repositories/photo_repository_test.dart
  - apps/web/src/__tests__/components/layout/AppLayout.test.tsx
  - apps/mobile/test/ui/download/download_view_model_test.dart
  - apps/web/src/__tests__/routes.test.tsx
  - apps/mobile/test/config/privacy_policy_url_test.dart
  - apps/mobile/android/app/src/test/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/PhotoFileInfoTest.kt
  - apps/mobile/test/data/repositories/cache_repository_test.dart
  - apps/mobile/test/ui/photo_gallery/photo_gallery_view_model_test.dart
-->

---
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


<!-- @trace
source: remove-mobile-app-flatten-web-routes
updated: 2026-08-31
code:
  - apps/mobile/.claude/settings.json
  - .agents/skills/spectra-drift/SKILL.md
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-40x40@2x.png
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-60x60@2x.png
  - apps/mobile/lib/data/models/dtos/photo_download_response.dart
  - apps/mobile/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - apps/mobile/scripts/screenshot_matrix.json
  - .github/workflows/mobile-cd.yml
  - apps/web/src/lib/i18n/messages/ko.json
  - apps/web/src/routes.tsx
  - apps/mobile/ios/Runner/Configurations/Info.plist
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-29x29@2x.png
  - apps/mobile/lib/screenshot/screenshot_scenarios.dart
  - apps/web/src/pages/HomePage.tsx
  - apps/mobile/ios/Podfile
  - apps/mobile/ios/Runner/Features/PhotoViewer/View/ZoomableImageView.swift
  - apps/mobile/l10n.yaml
  - apps/mobile/lib/amplifyconfiguration.dart
  - apps/mobile/ios/Runner/Services/PhotoService.swift
  - apps/mobile/android/app/src/main/res/mipmap-hdpi/ic_launcher.png
  - apps/mobile/lib/ui/core/app_error.dart
  - apps/mobile/.claude/skills/store-assets/frames/.gitkeep
  - apps/mobile/android/gradle.properties
  - apps/mobile/README.md
  - apps/mobile/lib/data/services/photo_service.dart
  - apps/web/src/components/intro/FeatureCard.tsx
  - apps/web/src/components/intro/ScreenshotCarousel.tsx
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-76x76@2x.png
  - apps/mobile/android/app/src/main/res/values-night/styles.xml
  - apps/mobile/lib/data/services/whats_new_data_source.dart
  - apps/mobile/.claude/skills/store-assets/SKILL.md
  - apps/mobile/assets/samples/sample_photo_03.jpg
  - apps/mobile/ios/RunnerTests/PhotoFileInfoTests.swift
  - .agents/skills/spectra-commit/SKILL.md
  - apps/mobile/.claude/skills/spectra-audit/SKILL.md
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-20x20@3x.png
  - apps/mobile/lib/l10n/app_localizations_ko.dart
  - apps/web/src/pages/intro/IntroWebPage.tsx
  - apps/mobile/ios/Runner/Applications/AppDelegate.swift
  - apps/mobile/ios/Runner/Applications/Channels/Features/GalleryChannel.swift
  - apps/mobile/ios/Runner/Features/Base.lproj/LaunchScreen.storyboard
  - apps/mobile/lib/data/services/auth_service.dart
  - apps/mobile/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - apps/mobile/lib/app.dart
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/channels/features/GalleryChannel.kt
  - apps/web/public/intro/mobile/setting_view_ios_snapshot.png
  - apps/mobile/.claude/skills/spectra-debug/SKILL.md
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-20x20@2x.png
  - apps/mobile/lib/config/whats_new_icon_resolver.dart
  - apps/mobile/lib/data/services/photo_viewer_service.dart
  - apps/mobile/lib/data/repositories/cache_repository.dart
  - apps/mobile/CLAUDE.md
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/MainActivity.kt
  - apps/mobile/lib/data/services/api_service.dart
  - apps/web/public/intro/mobile/setting_view_android_snapshot.png
  - apps/web/src/pages/GalleryPage.tsx
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/viewmodel/PhotoViewerViewModel.kt
  - apps/mobile/lib/ui/core/naver_url_validator.dart
  - apps/mobile/ios/Runner/Applications/Channels/Features/AppIconChannel.swift
  - apps/mobile/assets/store/google-play-feature-graphic.png
  - apps/mobile/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - apps/mobile/android/app/src/main/res/mipmap-mdpi/ic_launcher.png
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-1024x1024.png
  - apps/mobile/lib/l10n/app_localizations.dart
  - apps/mobile/android/app/build.gradle.kts
  - apps/mobile/lib/screenshot/app_runtime_mode.dart
  - apps/web/src/components/intro/DownloadBadge.tsx
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage.png
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/FileInfoContent.kt
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-40x40@3x.png
  - apps/mobile/lib/ui/core/view_model/app_settings_view_model.dart
  - apps/web/src/lib/config/privacy-policy.ts
  - apps/mobile/android/app/src/main/res/drawable/launch_background.xml
  - apps/mobile/ios/Runner.xcodeproj/project.pbxproj
  - apps/mobile/lib/ui/settings/widgets/settings_view.dart
  - apps/mobile/lib/l10n/app_zh_TW.arb
  - apps/mobile/lib/config/app_config.dart
  - apps/mobile/lib/routing/app_router.dart
  - apps/mobile/lib/screenshot/screenshot_config.dart
  - apps/mobile/ios/Runner/GoogleService-Info.plist
  - apps/mobile/scripts/generate_maestro_matrix.dart
  - apps/mobile/ios/Runner/Headers/Runner-Bridging-Header.h
  - .agents/skills/spectra-apply/SKILL.md
  - apps/mobile/ios/Runner.xcodeproj/project.xcworkspace/xcshareddata/IDEWorkspaceChecks.plist
  - apps/web/src/pages/PrivacyPolicyPage.tsx
  - README.md
  - apps/mobile/scripts/run_ios_screenshot_matrix.sh
  - AGENTS.md
  - apps/mobile/ios/Runner/Features/PhotoViewer/View/AsyncButton.swift
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-60x60@3x.png
  - apps/mobile/lib/data/services/crashlytics_service.dart
  - apps/mobile/lib/data/services/local_storage_service.dart
  - apps/mobile/.claude/skills/spectra-ingest/SKILL.md
  - apps/mobile/lib/data/models/dtos/whats_new_request.dart
  - apps/mobile/assets/screenshots/store_listings.json
  - apps/mobile/assets/samples/sample_photo_06.jpg
  - apps/mobile/ios/Runner/Features/PhotoViewer/View/PhotoViewerNavigationBar.swift
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/services/PhotoService.kt
  - apps/mobile/ios/Runner/Features/PhotoViewer/View/PhotoViewerView.swift
  - .agents/skills/spectra-ingest/SKILL.md
  - apps/mobile/.claude/skills/store-assets/.python-version
  - apps/mobile/ios/Runner.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-1024x1024.png
  - apps/mobile/lib/data/models/blog_cache_metadata.dart
  - apps/mobile/lib/screenshot/widgets/screenshot_scaffold.dart
  - apps/mobile/lib/ui/photo_gallery/widgets/photo_card.dart
  - apps/mobile/lib/ui/whats_new/widgets/whats_new_dialog.dart
  - apps/mobile/assets/samples/sample_photo_04.jpg
  - apps/web/public/intro/mobile/photo_gallery_view_ios_snapshot.png
  - apps/web/public/intro/mobile/blog_input_view_ios_snapshot.png
  - apps/mobile/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - apps/mobile/.claude/skills/spectra-ask/SKILL.md
  - apps/mobile/lib/data/models/download_batch_result.dart
  - apps/mobile/lib/l10n/app_en.arb
  - .agents/skills/spectra-discuss/SKILL.md
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/Contents.json
  - apps/mobile/lib/screenshot/screenshot_app.dart
  - apps/mobile/lib/utils/constants.dart
  - apps/mobile/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
  - apps/mobile/.maestro/screenshot_matrix.yaml
  - apps/mobile/lib/ui/whats_new/widgets/whats_new_view.dart
  - apps/mobile/.claude/skills/screenshot-workflow/SKILL.md
  - apps/mobile/devtools_options.yaml
  - apps/mobile/scripts/screenshot_common.sh
  - apps/mobile/lib/data/services/log_service.dart
  - apps/web/src/components/layout/PublicLayout.tsx
  - apps/mobile/ios/Runner/Features/PhotoViewer/Model/PhotoFileInfo.swift
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/PhotoViewerActivity.kt
  - apps/mobile/scripts/run_android_screenshot_matrix.sh
  - apps/mobile/ios/Runner.xcodeproj/xcshareddata/xcschemes/Runner.xcscheme
  - apps/mobile/pubspec.yaml
  - CLAUDE.md
  - apps/mobile/assets/samples/sample_photo_09.jpg
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Contents.json
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-60x60@2x.png
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-76x76@2x.png
  - apps/web/CLAUDE.md
  - apps/mobile/lib/data/repositories/photo_repository.dart
  - apps/web/public/intro/mobile/photo_gallery_view_android_snapshot.png
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/channels/features/PhotoViewerChannel.kt
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-83.5x83.5@2x.png
  - apps/web/src/components/layout/AppLayout.tsx
  - apps/mobile/.claude/skills/spectra-propose/SKILL.md
  - apps/mobile/ios/Runner/Features/Base.lproj/Main.storyboard
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-38x38@3x.png
  - apps/mobile/ios/Runner/Features/PhotoViewer/ViewModel/PhotoViewerViewModel.swift
  - apps/mobile/analysis_options.yaml
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage@2x.png
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage@3x.png
  - apps/mobile/android/app/src/main/AndroidManifest.xml
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-29x29@2x.png
  - apps/mobile/.claude/skills/spectra-apply/SKILL.md
  - apps/mobile/android/app/src/main/res/drawable-v21/launch_background.xml
  - apps/mobile/ios/Flutter/Debug.xcconfig
  - .agents/skills/spectra-propose/SKILL.md
  - apps/web/src/pages/intro/IntroRootPage.tsx
  - apps/web/src/lib/i18n/messages/en.json
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-76x76.png
  - apps/mobile/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - apps/mobile/lib/config/whats_new_registry.dart
  - apps/mobile/ios/Podfile.lock
  - .github/workflows/mobile-ci.yml
  - apps/mobile/assets/samples/sample_photo_02.jpg
  - apps/mobile/ios/Runner.xcodeproj/project.xcworkspace/contents.xcworkspacedata
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-38x38@2x.png
  - apps/mobile/android/app/src/main/res/mipmap-hdpi/ic_launcher_new.png
  - apps/mobile/lib/data/repositories/log_repository.dart
  - apps/mobile/lib/l10n/app_ja.arb
  - apps/mobile/android/app/google-services.json
  - apps/mobile/lib/data/models/dtos/whats_new_response.dart
  - apps/mobile/lib/ui/download/widgets/download_view.dart
  - apps/web/public/intro/mobile/blog_input_view_android_snapshot.png
  - apps/web/public/intro/mobile/photo_detail_view_android_snapshot.png
  - apps/mobile/android/app/src/profile/AndroidManifest.xml
  - apps/mobile/android/build.gradle.kts
  - apps/mobile/lib/data/models/dtos/photo_download_request.dart
  - apps/mobile/android/app/src/main/res/mipmap-xhdpi/ic_launcher_new.png
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-20x20@2x.png
  - apps/web/src/components/intro/IntroNav.tsx
  - apps/web/src/lib/i18n/messages/ja.json
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/Contents.json
  - apps/mobile/lib/screenshot/screenshot_mock_data.dart
  - apps/mobile/lib/data/models/photo_entity.dart
  - apps/mobile/.claude/skills/store-assets/pyproject.toml
  - apps/mobile/assets/icons/icon_default.png
  - apps/mobile/lib/data/services/app_icon_service.dart
  - apps/web/src/pages/intro/IntroMobilePage.tsx
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/Contents.json
  - apps/mobile/ios/Runner/Features/PhotoViewer/View/CapsuleBottomBar.swift
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-29x29@3x.png
  - apps/web/src/pages/NotFoundPage.tsx
  - apps/mobile/lib/data/services/file_download_service.dart
  - apps/mobile/ios/Runner/Services/PhotoSaveable.swift
  - apps/web/public/intro/mobile/photo_detail_view_ios_snapshot.png
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/CapsuleBottomBar.kt
  - apps/web/src/lib/i18n/messages/zh-TW.json
  - .agents/skills/spectra-archive/SKILL.md
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-40x40.png
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/README.md
  - apps/mobile/lib/config/app_settings_keys.dart
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/PhotoFileInfo.kt
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-40x40@2x.png
  - apps/mobile/lib/utils/extensions.dart
  - apps/mobile/ios/Runner.xcworkspace/xcshareddata/IDEWorkspaceChecks.plist
  - apps/mobile/ios/Runner/Applications/SceneDelegate.swift
  - apps/mobile/assets/samples/sample_photo_08.jpg
  - apps/mobile/.claude/skills/spectra-discuss/SKILL.md
  - apps/mobile/lib/config/privacy_policy_url.dart
  - apps/mobile/.claude/skills/spectra-archive/SKILL.md
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/ZoomableImage.kt
  - apps/web/src/pages/LandingPage.tsx
  - apps/mobile/lib/data/models/whats_new_item.dart
  - apps/mobile/lib/ui/blog_input/widgets/blog_input_view.dart
  - apps/mobile/.claude/skills/store-assets/uv.lock
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-20x20.png
  - apps/mobile/scripts/sync_scenarios.dart
  - apps/web/package.json
  - apps/mobile/lib/l10n/app_localizations_ja.dart
  - apps/mobile/lib/data/models/dtos/job_status_response.dart
  - apps/mobile/.metadata
  - apps/mobile/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_new.png
  - apps/mobile/assets/icons/icon_new.png
  - apps/mobile/lib/ui/settings/view_model/settings_view_model.dart
  - apps/mobile/pubspec.lock
  - apps/mobile/lib/l10n/app_localizations_zh.dart
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/ThemeColors.kt
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/services/PhotoSaveable.kt
  - apps/mobile/.maestro/take_screenshot.yaml
  - apps/mobile/lib/data/repositories/settings_repository.dart
  - apps/mobile/.claude/skills/store-assets/config.json
  - apps/mobile/ios/Flutter/Release.xcconfig
  - apps/mobile/ios/Runner.xcworkspace/xcshareddata/WorkspaceSettings.xcsettings
  - apps/mobile/assets/samples/sample_photo_05.jpg
  - apps/mobile/lib/data/models/fetch_result.dart
  - apps/mobile/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
  - apps/mobile/assets/samples/sample_photo_01.jpg
  - apps/mobile/assets/samples/sample_photo_07.jpg
  - apps/mobile/.claude/skills/store-assets/generate.py
  - apps/mobile/ios/Runner/Features/PhotoViewer/View/FileInfoSheet.swift
  - apps/mobile/lib/config/app_icon.dart
  - apps/mobile/android/app/src/debug/AndroidManifest.xml
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-29x29@3x.png
  - apps/mobile/lib/ui/whats_new/view_model/whats_new_view_model.dart
  - apps/mobile/android/app/src/main/res/mipmap-mdpi/ic_launcher_new.png
  - apps/mobile/android/app/src/main/res/mipmap-xxhdpi/ic_launcher_new.png
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-20x20@3x.png
  - apps/mobile/lib/ui/download/view_model/download_view_model.dart
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/channels/features/AppIconChannel.kt
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-29x29.png
  - apps/mobile/lib/config/supported_locale.dart
  - apps/mobile/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/PhotoViewerScreen.kt
  - apps/mobile/.claude/skills/store-assets/fonts/.gitkeep
  - apps/mobile/lib/l10n/app_localizations_en.dart
  - apps/mobile/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
  - apps/mobile/ios/Runner.xcworkspace/xcshareddata/swiftpm/Package.resolved
  - apps/mobile/android/settings.gradle.kts
  - apps/mobile/ios/Flutter/AppFrameworkInfo.plist
  - apps/mobile/ios/RunnerTests/ThemeColorsTests.swift
  - apps/mobile/lib/screenshot/screenshot_scenario_definitions.dart
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-40x40@3x.png
  - apps/mobile/ios/RunnerTests/PhotoViewerViewModelTests.swift
  - apps/mobile/android/app/src/main/res/values/styles.xml
  - apps/mobile/lib/l10n/app_ko.arb
  - apps/mobile/lib/main.dart
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-60x60@3x.png
  - apps/mobile/ios/Runner.xcworkspace/contents.xcworkspacedata
  - apps/web/src/lib/config/public-navigation.ts
  - apps/mobile/ios/Runner/Applications/Channels/Features/PhotoViewerChannel.swift
  - apps/mobile/ios/Runner/Features/PhotoViewer/View/PhotoViewerController.swift
  - apps/mobile/lib/config/bottom_sheet_animation.dart
  - apps/mobile/ios/Runner/Features/PhotoViewer/View/ZoomableScrollView.swift
  - apps/mobile/lib/config/theme.dart
  - apps/mobile/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-83.5x83.5@2x.png
  - apps/mobile/ios/Runner/Features/PhotoViewer/Model/ThemeColors.swift
  - apps/mobile/ios/Runner.xcodeproj/project.xcworkspace/xcshareddata/WorkspaceSettings.xcsettings
  - apps/mobile/lib/l10n/app_zh.arb
  - apps/mobile/android/gradle/wrapper/gradle-wrapper.properties
  - apps/web/src/components/intro/StepCard.tsx
tests:
  - apps/web/src/__tests__/components/layout/PublicLayout.test.tsx
  - apps/mobile/android/app/src/test/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/viewmodel/PhotoViewerViewModelTest.kt
  - apps/mobile/test/widget_test.dart
  - apps/mobile/test/ui/blog_input/blog_input_view_model_test.dart
  - apps/mobile/android/app/src/test/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/ThemeColorsTest.kt
  - apps/web/src/__tests__/lib/i18n/intro-parity.test.ts
  - apps/web/src/__tests__/pages/HomePage.test.tsx
  - apps/mobile/test/ui/core/naver_url_validator_test.dart
  - apps/web/src/__tests__/components/intro/DownloadBadge.test.tsx
  - apps/mobile/test/data/services/api_service_test.dart
  - apps/web/src/__tests__/pages/LandingPage.test.tsx
  - apps/mobile/test/ui/photo_detail/photo_detail_view_model_test.dart
  - apps/mobile/test/data/repositories/photo_repository_test.dart
  - apps/web/src/__tests__/components/layout/AppLayout.test.tsx
  - apps/mobile/test/ui/download/download_view_model_test.dart
  - apps/web/src/__tests__/routes.test.tsx
  - apps/mobile/test/config/privacy_policy_url_test.dart
  - apps/mobile/android/app/src/test/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/PhotoFileInfoTest.kt
  - apps/mobile/test/data/repositories/cache_repository_test.dart
  - apps/mobile/test/ui/photo_gallery/photo_gallery_view_model_test.dart
-->

---
### Requirement: Vite base path for GitHub Pages root deployment

The production build SHALL set `VITE_BASE_PATH=/naver-blog-image-downloader/` (no `web/app/` suffix). The Vite `base` option in `vite.config.ts` SHALL read from `process.env.VITE_BASE_PATH` and default to `/` for local development.

#### Scenario: Production build uses root base path

- **WHEN** `pnpm build` is run with `VITE_BASE_PATH=/naver-blog-image-downloader/`
- **THEN** the resulting `dist/index.html` references assets under `/naver-blog-image-downloader/assets/` and the router basename is `/naver-blog-image-downloader/`

#### Scenario: Local dev build uses root base path

- **WHEN** `pnpm dev` is run without `VITE_BASE_PATH` set
- **THEN** the dev server serves the app at `/` and the router basename is `/`

<!-- @trace
source: unify-landing-in-apps-web
updated: 2026-04-18
code:
  - apps/web/src/lib/i18n/messages/ko.json
  - apps/web/src/pages/HomePage.tsx
  - apps/web/public/intro/mobile/photo_gallery_view_android_snapshot.png
  - apps/web/src/routes.tsx
  - docs/mobile/images/setting_view_ios_snapshot.png
  - apps/web/src/components/intro/ScreenshotCarousel.tsx
  - docs/web/index.html
  - apps/web/public/intro/mobile/photo_detail_view_ios_snapshot.png
  - apps/web/public/intro/mobile/setting_view_ios_snapshot.png
  - docs/mobile/images/photo_gallery_view_android_snapshot.png
  - docs/mobile/images/photo_gallery_view_ios_snapshot.png
  - apps/web/public/intro/mobile/blog_input_view_ios_snapshot.png
  - docs/mobile/index.html
  - apps/web/src/pages/intro/IntroRootPage.tsx
  - apps/web/public/intro/mobile/blog_input_view_android_snapshot.png
  - apps/web/src/components/layout/AppLayout.tsx
  - docs/mobile/css/style.css
  - docs/mobile/js/main.js
  - docs/mobile/images/photo_detail_view_android_snapshot.png
  - .github/workflows/deploy-pages.yml
  - apps/web/src/lib/i18n/messages/en.json
  - apps/web/src/pages/GalleryPage.tsx
  - apps/web/src/lib/i18n/messages/ja.json
  - apps/web/src/lib/stores/use-settings-store.ts
  - apps/web/src/components/intro/DownloadBadge.tsx
  - apps/web/public/intro/mobile/setting_view_android_snapshot.png
  - apps/web/public/intro/mobile/photo_detail_view_android_snapshot.png
  - apps/web/src/pages/intro/IntroMobilePage.tsx
  - apps/web/src/components/intro/FeatureCard.tsx
  - docs/mobile/images/setting_view_android_snapshot.png
  - docs/mobile/images/blog_input_view_android_snapshot.png
  - docs/mobile/images/blog_input_view_ios_snapshot.png
  - apps/web/src/components/layout/ThemeLocaleControls.tsx
  - README.md
  - apps/web/CLAUDE.md
  - apps/web/src/lib/i18n/messages/zh-TW.json
  - apps/web/src/components/layout/PublicLayout.tsx
  - docs/mobile/images/photo_detail_view_ios_snapshot.png
  - apps/web/src/App.tsx
  - apps/web/package.json
  - docs/index.html
  - docs/mobile/mobile-architecture.md
  - apps/web/src/components/intro/IntroFooter.tsx
  - apps/web/src/pages/NotFoundPage.tsx
  - docs/mobile/js/i18n.js
  - apps/web/src/lib/config/ui-controls.ts
  - apps/web/src/components/intro/IntroNav.tsx
  - apps/web/src/components/intro/StepCard.tsx
  - apps/web/src/pages/intro/IntroWebPage.tsx
  - apps/web/public/intro/mobile/photo_gallery_view_ios_snapshot.png
  - apps/web/src/lib/config/public-navigation.ts
tests:
  - apps/web/src/__tests__/components/intro/DownloadBadge.test.tsx
  - apps/web/src/__tests__/pages/HomePage.test.tsx
  - apps/web/src/__tests__/routes.test.tsx
  - apps/web/src/__tests__/lib/i18n/intro-parity.test.ts
  - apps/web/src/__tests__/components/layout/AppLayout.test.tsx
  - apps/web/src/__tests__/components/layout/PublicLayout.test.tsx
-->

---
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

<!-- @trace
source: web-home-screen-icons
updated: 2026-07-10
code:
  - apps/web/package.json
  - apps/web/public/apple-touch-icon.png
  - apps/web/public/icon-192.png
  - apps/web/public/manifest.webmanifest
  - apps/web/public/icon-512.png
  - apps/web/index.html
-->