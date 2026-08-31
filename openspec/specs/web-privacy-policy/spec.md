# web-privacy-policy Specification

## Purpose

隱私政策頁（`/privacy`）—— 本專案對外的正式隱私政策，位於 PublicLayout 下，可從 `IntroFooter` 或任何外部引用連入。版面依序為：頁面標題、最後更新日期列、導言、由 i18n `privacy.sections` 陣列驅動的內容章節，以及導向 GitHub Issues 的聯絡區塊。章節至少涵蓋 dataCollection、dataUsage、thirdParty、dataTransfer、retention、security、userRights、children、legalBasis、changes 十個 id，內容須如實反映專案實際的資料處理方式（目前只有 Web 前端與 AWS Lambda 後端，不得宣告任何僅存在於行動版 App 的蒐集行為）。四語系（zh-TW/en/ja/ko）維持 key 結構與 section id 順序一致，由 `privacy-parity.test.ts` 把關；最後更新日期以 `lib/config/privacy-policy.ts` 的 `PRIVACY_POLICY_LAST_UPDATED` 為單一事實來源，與文案在同一次修訂中一起更新；`document.title` 與 `<meta name="description">` 於掛載時設定、卸載時還原。

## Requirements

### Requirement: Privacy policy page at /privacy

The Web app SHALL render a `PrivacyPolicyPage` component at the `/privacy` route within `PublicLayout`. The page SHALL serve as the canonical privacy policy for the project, linkable from the web `IntroFooter` and from any external reference. It SHALL NOT be described as the privacy policy backing an App Store Connect listing, a Google Play Console listing, or a mobile app Settings view, because the project no longer ships a mobile App.

The page SHALL contain, in this top-to-bottom order:

- Page title sourced from i18n key `privacy.pageTitle`
- A metadata row displaying the last-updated date, labeled with i18n key `privacy.lastUpdatedLabel`. The date value SHALL come from the `PRIVACY_POLICY_LAST_UPDATED` constant exported by `apps/web/src/lib/config/privacy-policy.ts`.
- Introductory paragraph from i18n key `privacy.intro`
- A sequence of content sections rendered from `t('privacy.sections', { returnObjects: true })`, where each section is an object with `id`, `title`, and `body` fields. `body` SHALL support either a plain string or an array of strings (rendered as paragraphs).
- A contact section with heading `privacy.contact.title`, body `privacy.contact.body`, and a call-to-action link whose label comes from `privacy.contact.issueLinkLabel` and whose `href` equals `privacy.contact.issueUrl`. The link SHALL open in a new tab (`target="_blank"` with `rel="noopener noreferrer"`).

The page SHALL NOT display any Web App version string. Version disclosure for the Web App belongs to the App Layout header; it is out of scope for the privacy policy page.

#### Scenario: Page renders at /privacy

- **WHEN** a user navigates to `/privacy`
- **THEN** `PrivacyPolicyPage` is rendered inside `PublicLayout` with the page title, last-updated row, intro paragraph, all configured sections, and contact block

#### Scenario: Last-updated date matches config constant

- **WHEN** `PRIVACY_POLICY_LAST_UPDATED` is updated in the same change that edits the policy text
- **THEN** the last-updated row on the rendered page shows that new date next to the `privacy.lastUpdatedLabel` label

#### Scenario: Version string is not rendered

- **WHEN** the page is rendered under any locale
- **THEN** no `v<semver>` text derived from `__APP_VERSION__` appears anywhere on the page

#### Scenario: Contact link points to GitHub issues in a new tab

- **WHEN** the page is rendered
- **THEN** the contact section contains an anchor whose `href` equals `privacy.contact.issueUrl` and whose `target` attribute equals `_blank`


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
### Requirement: Four-locale content coverage with structural parity

The `privacy.*` i18n namespace SHALL exist in all four locale files `apps/web/src/lib/i18n/messages/{zh-TW,en,ja,ko}.json`. All four locales SHALL define the same set of keys (excluding differences in `privacy.sections[].body` array lengths), and `privacy.sections` SHALL have the same length with the same per-section `id` values in the same order.

The `privacy.contact.issueUrl` value SHALL be identical across all four locales, so that every locale links to the same canonical GitHub issues endpoint.

A unit test at `apps/web/src/__tests__/lib/i18n/privacy-parity.test.ts` SHALL assert that all four locales contain identical key paths under `privacy.*` (excluding `privacy.sections` sub-paths) and identical section `id` ordering.

#### Scenario: All four locales defined

- **WHEN** the privacy namespace is loaded from `zh-TW.json`, `en.json`, `ja.json`, and `ko.json`
- **THEN** every key path present in one locale is present in all four, and no locale has extra keys relative to the others

#### Scenario: Section id ordering matches across locales

- **WHEN** `privacy.sections` is read from each of the four locales
- **THEN** the resulting arrays have the same length and the same `id` value at every index position

#### Scenario: Issue URL is identical across locales

- **WHEN** `privacy.contact.issueUrl` is read from each of the four locales
- **THEN** all four locales return the same string value


<!-- @trace
source: add-privacy-policy-page
updated: 2026-04-18
code:
  - apps/mobile/lib/l10n/app_localizations_zh.dart
  - apps/mobile/lib/l10n/app_localizations_ko.dart
  - apps/mobile/lib/l10n/app_ja.arb
  - apps/web/src/lib/i18n/messages/zh-TW.json
  - apps/mobile/lib/config/privacy_policy_url.dart
  - apps/web/package.json
  - apps/web/src/routes.tsx
  - apps/web/src/components/privacy/PrivacyPolicySection.tsx
  - apps/web/src/lib/config/public-navigation.ts
  - apps/mobile/lib/l10n/app_localizations.dart
  - apps/web/src/lib/config/privacy-policy.ts
  - apps/web/src/pages/PrivacyPolicyPage.tsx
  - apps/web/src/lib/i18n/messages/ko.json
  - apps/mobile/lib/l10n/app_localizations_en.dart
  - apps/mobile/lib/l10n/app_ko.arb
  - apps/web/src/lib/i18n/messages/ja.json
  - apps/web/src/lib/hooks/use-page-meta.ts
  - apps/mobile/lib/l10n/app_localizations_ja.dart
  - apps/mobile/pubspec.lock
  - apps/mobile/lib/l10n/app_zh_TW.arb
  - apps/mobile/lib/ui/settings/widgets/settings_view.dart
  - apps/mobile/pubspec.yaml
  - apps/web/src/components/intro/IntroFooter.tsx
  - apps/mobile/lib/l10n/app_en.arb
  - apps/web/src/lib/i18n/messages/en.json
  - apps/mobile/lib/l10n/app_zh.arb
tests:
  - apps/web/src/__tests__/pages/PrivacyPolicyPage.test.tsx
  - apps/web/src/__tests__/lib/i18n/privacy-parity.test.ts
  - apps/mobile/test/config/privacy_policy_url_test.dart
  - apps/web/src/__tests__/routes.test.tsx
  - apps/web/src/__tests__/components/intro/IntroFooter.test.tsx
-->

---
### Requirement: Required privacy content topics

`privacy.sections` SHALL include, at minimum, sections with the following `id` values (in any order the project maintainer chooses, but consistent across all four locales):

- `dataCollection` — what categories of data are collected
- `dataUsage` — purposes for which the data is used
- `thirdParty` — named third-party services that process the data
- `dataTransfer` — disclosure of cross-border data transfers (GDPR Art. 13(1)(f) / PIPA §17)
- `retention` — how long data is kept and how it is deleted, including a commitment to delete all cloud records when the project is discontinued
- `security` — the baseline security posture (encryption in transit, encryption at rest per platform defaults)
- `userRights` — self-service actions available to the user, with an explicit acknowledgement that individual GDPR Articles 15–20 rights cannot be fulfilled per-user because the project does not collect identifying data
- `children` — the project's stance on children's data, referencing the differing age thresholds across COPPA, PIPA, and GDPR
- `legalBasis` — GDPR Article 6 legal bases relied on for EU/EEA users, and a scoping statement covering other jurisdictions
- `changes` — how policy changes are announced and the treatment of continued use after the announcement

The content of each section SHALL describe the project's actual data practices truthfully; forward-looking or absolute promises that cannot be honored operationally (for example, unconditional per-user deletion of anonymously-keyed logs) SHALL NOT be made.

Because the project ships only a Web app and an AWS Lambda backend, the policy text SHALL NOT claim to collect or process any data category that exists only in a mobile App. Specifically, no section SHALL describe an anonymous device identifier, Firebase Authentication, Cloud Firestore operation logs, Firebase Crashlytics crash reports, on-device caches cleared through an App settings screen, or uninstalling an App as a way to stop data collection. Wording that offered the user a choice between an App and the Web (for example, "sent by the App or the Web") SHALL name only the Web.

#### Scenario: All required section ids present

- **WHEN** `privacy.sections` is read from `zh-TW.json`
- **THEN** the array contains objects whose `id` values cover every entry in the required list above

#### Scenario: No mobile-only data practice is claimed

- **WHEN** the concatenated `body` text of every section in any of the four locale files is inspected
- **THEN** it contains no claim of collecting an anonymous device identifier, Firebase Authentication data, Cloud Firestore operation logs, or Firebase Crashlytics crash reports, and no instruction to uninstall an App or to clear a cache from an App settings screen

#### Scenario: Third-party list matches the surviving stack

- **WHEN** the `thirdParty` section is read under any locale
- **THEN** it names the AWS services used by the backend and the Naver disclaimer, and names no Google LLC Firebase service


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
### Requirement: Privacy link in IntroFooter

The `IntroFooter` component SHALL render a link labeled from i18n key `privacy.footerLink` that navigates to `/privacy`. The link SHALL appear on every page that uses `PublicLayout`, namely `LandingPage`, `NotFoundPage`, and `PrivacyPolicyPage` itself.

#### Scenario: Footer shows privacy link on landing page

- **WHEN** a user views `/`
- **THEN** `IntroFooter` renders a link with the text from `privacy.footerLink` that points to `/privacy`

#### Scenario: Clicking footer privacy link navigates to page

- **WHEN** a user clicks the privacy link in `IntroFooter` from any `PublicLayout` page
- **THEN** the browser navigates to `/privacy` and `PrivacyPolicyPage` renders


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
### Requirement: Privacy-policy config constant

The module `apps/web/src/lib/config/privacy-policy.ts` SHALL export:

- `PRIVACY_POLICY_LAST_UPDATED: string` — ISO 8601 date (`YYYY-MM-DD`) of the most recent substantive content update

This constant SHALL be the single source of truth consumed by `PrivacyPolicyPage` for the displayed last-updated date. Updating this constant SHALL be the mechanism for signaling a policy revision, and the i18n content SHALL be updated in the same revision whenever the wording of any section changes.

The contact channel (a GitHub Issues URL) is stored in i18n as `privacy.contact.issueUrl` rather than as a TypeScript constant, because the locale files also carry the localized `issueLinkLabel` that must stay adjacent to the URL.

#### Scenario: Last-updated constant exported as ISO date

- **WHEN** the module `apps/web/src/lib/config/privacy-policy.ts` is imported
- **THEN** `PRIVACY_POLICY_LAST_UPDATED` resolves to a string matching `/^\d{4}-\d{2}-\d{2}$/`


<!-- @trace
source: add-privacy-policy-page
updated: 2026-04-18
code:
  - apps/mobile/lib/l10n/app_localizations_zh.dart
  - apps/mobile/lib/l10n/app_localizations_ko.dart
  - apps/mobile/lib/l10n/app_ja.arb
  - apps/web/src/lib/i18n/messages/zh-TW.json
  - apps/mobile/lib/config/privacy_policy_url.dart
  - apps/web/package.json
  - apps/web/src/routes.tsx
  - apps/web/src/components/privacy/PrivacyPolicySection.tsx
  - apps/web/src/lib/config/public-navigation.ts
  - apps/mobile/lib/l10n/app_localizations.dart
  - apps/web/src/lib/config/privacy-policy.ts
  - apps/web/src/pages/PrivacyPolicyPage.tsx
  - apps/web/src/lib/i18n/messages/ko.json
  - apps/mobile/lib/l10n/app_localizations_en.dart
  - apps/mobile/lib/l10n/app_ko.arb
  - apps/web/src/lib/i18n/messages/ja.json
  - apps/web/src/lib/hooks/use-page-meta.ts
  - apps/mobile/lib/l10n/app_localizations_ja.dart
  - apps/mobile/pubspec.lock
  - apps/mobile/lib/l10n/app_zh_TW.arb
  - apps/mobile/lib/ui/settings/widgets/settings_view.dart
  - apps/mobile/pubspec.yaml
  - apps/web/src/components/intro/IntroFooter.tsx
  - apps/mobile/lib/l10n/app_en.arb
  - apps/web/src/lib/i18n/messages/en.json
  - apps/mobile/lib/l10n/app_zh.arb
tests:
  - apps/web/src/__tests__/pages/PrivacyPolicyPage.test.tsx
  - apps/web/src/__tests__/lib/i18n/privacy-parity.test.ts
  - apps/mobile/test/config/privacy_policy_url_test.dart
  - apps/web/src/__tests__/routes.test.tsx
  - apps/web/src/__tests__/components/intro/IntroFooter.test.tsx
-->

---
### Requirement: Page-level meta set at runtime

When `PrivacyPolicyPage` mounts, it SHALL set `document.title` to the localized value of `privacy.pageTitle`, and it SHALL ensure a `<meta name="description">` element exists in `document.head` with content derived from `privacy.metaDescription`. When the component unmounts, it SHALL restore the previous `document.title` value so that other routes are not affected.

#### Scenario: Document title updated on mount

- **WHEN** a user opens `/privacy`
- **THEN** `document.title` equals the value of `privacy.pageTitle` for the current locale

#### Scenario: Document title restored on unmount

- **WHEN** a user navigates away from `/privacy` to `/`
- **THEN** `document.title` equals the value it had before `PrivacyPolicyPage` mounted

#### Scenario: Meta description uses the dedicated i18n key

- **WHEN** `PrivacyPolicyPage` is mounted
- **THEN** the `<meta name="description">` element in `document.head` has `content` equal to the localized `privacy.metaDescription` value

<!-- @trace
source: add-privacy-policy-page
updated: 2026-04-18
code:
  - apps/mobile/lib/l10n/app_localizations_zh.dart
  - apps/mobile/lib/l10n/app_localizations_ko.dart
  - apps/mobile/lib/l10n/app_ja.arb
  - apps/web/src/lib/i18n/messages/zh-TW.json
  - apps/mobile/lib/config/privacy_policy_url.dart
  - apps/web/package.json
  - apps/web/src/routes.tsx
  - apps/web/src/components/privacy/PrivacyPolicySection.tsx
  - apps/web/src/lib/config/public-navigation.ts
  - apps/mobile/lib/l10n/app_localizations.dart
  - apps/web/src/lib/config/privacy-policy.ts
  - apps/web/src/pages/PrivacyPolicyPage.tsx
  - apps/web/src/lib/i18n/messages/ko.json
  - apps/mobile/lib/l10n/app_localizations_en.dart
  - apps/mobile/lib/l10n/app_ko.arb
  - apps/web/src/lib/i18n/messages/ja.json
  - apps/web/src/lib/hooks/use-page-meta.ts
  - apps/mobile/lib/l10n/app_localizations_ja.dart
  - apps/mobile/pubspec.lock
  - apps/mobile/lib/l10n/app_zh_TW.arb
  - apps/mobile/lib/ui/settings/widgets/settings_view.dart
  - apps/mobile/pubspec.yaml
  - apps/web/src/components/intro/IntroFooter.tsx
  - apps/mobile/lib/l10n/app_en.arb
  - apps/web/src/lib/i18n/messages/en.json
  - apps/mobile/lib/l10n/app_zh.arb
tests:
  - apps/web/src/__tests__/pages/PrivacyPolicyPage.test.tsx
  - apps/web/src/__tests__/lib/i18n/privacy-parity.test.ts
  - apps/mobile/test/config/privacy_policy_url_test.dart
  - apps/web/src/__tests__/routes.test.tsx
  - apps/web/src/__tests__/components/intro/IntroFooter.test.tsx
-->