# bottom-sheet-animation Specification

## Purpose

TBD - created by archiving change 'settings-sheet-animation'. Update Purpose after archive.

## Requirements

### Requirement: Platform-specific animation controller factory

The `BottomSheetAnimation` class SHALL provide a static `createController` factory method that accepts a `TickerProvider` (for `vsync`) and a `TargetPlatform`, and returns an `AnimationController` configured with platform-specific durations.

For `TargetPlatform.iOS`, the controller SHALL use a forward duration of 500 milliseconds and a reverse duration of 350 milliseconds.

For all other platforms (including `TargetPlatform.android`), the controller SHALL use a forward duration of 400 milliseconds and a reverse duration of 250 milliseconds.

#### Scenario: iOS animation controller created

- **GIVEN** the platform is `TargetPlatform.iOS`
- **WHEN** `BottomSheetAnimation.createController` is called
- **THEN** the returned `AnimationController` SHALL have a duration of 500ms and a reverseDuration of 350ms

#### Scenario: Android animation controller created

- **GIVEN** the platform is `TargetPlatform.android`
- **WHEN** `BottomSheetAnimation.createController` is called
- **THEN** the returned `AnimationController` SHALL have a duration of 400ms and a reverseDuration of 250ms

#### Scenario: Controller uses provided TickerProvider

- **GIVEN** a valid `TickerProvider` is passed as the `vsync` parameter
- **WHEN** `BottomSheetAnimation.createController` is called
- **THEN** the returned `AnimationController` SHALL use the provided `TickerProvider` for frame synchronization

<!-- @trace
source: settings-sheet-animation
updated: 2026-03-23
code:
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/config/bottom_sheet_animation.dart
-->