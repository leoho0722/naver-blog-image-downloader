# naver-url-validator Specification

## Purpose

TBD - created by archiving change 'blog-input-clipboard-paste'. Update Purpose after archive.

## Requirements

### Requirement: Validate Naver Blog URL format

The `NaverUrlValidator` SHALL provide a static method that accepts a string and returns `true` if the string is a valid Naver Blog URL. A valid URL MUST start with `https://blog.naver.com/` (desktop) or `https://m.blog.naver.com/` (mobile). URLs starting with `http://` (non-HTTPS) SHALL be rejected as invalid.

#### Scenario: Valid desktop URL

- **GIVEN** the input is `https://blog.naver.com/example_post`
- **WHEN** the validator is called
- **THEN** it SHALL return `true`

#### Scenario: Valid mobile URL

- **GIVEN** the input is `https://m.blog.naver.com/example_post`
- **WHEN** the validator is called
- **THEN** it SHALL return `true`

#### Scenario: HTTP URL rejected

- **GIVEN** the input is `http://blog.naver.com/example_post`
- **WHEN** the validator is called
- **THEN** it SHALL return `false`

#### Scenario: Non-Naver URL rejected

- **GIVEN** the input is `https://example.com/some-page`
- **WHEN** the validator is called
- **THEN** it SHALL return `false`

#### Scenario: Empty string rejected

- **GIVEN** the input is an empty string
- **WHEN** the validator is called
- **THEN** it SHALL return `false`

#### Scenario: Non-URL text rejected

- **GIVEN** the input is plain text without a URL scheme
- **WHEN** the validator is called
- **THEN** it SHALL return `false`

<!-- @trace
source: blog-input-clipboard-paste
updated: 2026-03-22
code:
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/ui/core/naver_url_validator.dart
tests:
  - naver_blog_image_downloader/test/ui/core/naver_url_validator_test.dart
-->

---
### Requirement: Normalize mobile URL to desktop format

The `NaverUrlValidator` SHALL provide a static method `normalize(String url)` that converts mobile Naver Blog URLs to their desktop equivalent. The method SHALL replace the prefix `https://m.blog.naver.com/` with `https://blog.naver.com/`. If the URL does not start with `https://m.blog.naver.com/`, the method SHALL return the original URL unchanged.

#### Scenario: Mobile URL normalized to desktop

- **GIVEN** the input is `https://m.blog.naver.com/edament/224238392216`
- **WHEN** `normalize` is called
- **THEN** it SHALL return `https://blog.naver.com/edament/224238392216`

#### Scenario: Desktop URL remains unchanged

- **GIVEN** the input is `https://blog.naver.com/edament/224238392216`
- **WHEN** `normalize` is called
- **THEN** it SHALL return `https://blog.naver.com/edament/224238392216`

#### Scenario: Non-Naver URL remains unchanged

- **GIVEN** the input is `https://example.com/some-page`
- **WHEN** `normalize` is called
- **THEN** it SHALL return `https://example.com/some-page`

#### Scenario: Mobile URL with path preserved

- **GIVEN** the input is `https://m.blog.naver.com/user/12345?query=abc`
- **WHEN** `normalize` is called
- **THEN** it SHALL return `https://blog.naver.com/user/12345?query=abc`

<!-- @trace
source: fix-cache-key-url-normalization
updated: 2026-04-04
code:
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/FileInfoContent.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/channels/features/PhotoViewerChannel.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/PhotoViewerScreen.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/CapsuleBottomBar.kt
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/ZoomableImageView.swift
  - naver_blog_image_downloader/ios/Runner/GeneratedPlugin/GeneratedPluginRegistrant.h
  - naver_blog_image_downloader/ios/Runner/GoogleService-Info.plist
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/PhotoViewerView.swift
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/ZoomableScrollView.swift
  - naver_blog_image_downloader/ios/Runner/Configurations/GoogleService-Info.plist
  - naver_blog_image_downloader/android/app/src/main/AndroidManifest.xml
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/PhotoViewerNavigationBar.swift
  - naver_blog_image_downloader/android/app/build.gradle.kts
  - naver_blog_image_downloader/ios/Runner/GeneratedPlugin/GeneratedPluginRegistrant.m
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/PhotoViewerActivity.kt
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/ios/Runner/Applications/Channels/Features/PhotoViewerChannel.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/ZoomableImage.kt
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/CapsuleBottomBar.swift
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/PhotoViewerController.swift
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/viewmodel/PhotoViewerViewModel.kt
  - CLAUDE.md
  - naver_blog_image_downloader/android/settings.gradle.kts
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/FileInfoSheet.swift
-->