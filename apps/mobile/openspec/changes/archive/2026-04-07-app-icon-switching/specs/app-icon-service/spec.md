## ADDED Requirements

### Requirement: AppIconService provider

`AppIconService` SHALL be registered as a `@Riverpod(keepAlive: true)` singleton provider named `appIconServiceProvider`. It SHALL return an `AppIconService` instance.

#### Scenario: AppIconService created as singleton

- **GIVEN** the app is running with `ProviderScope`
- **WHEN** `appIconServiceProvider` is first accessed
- **THEN** an `AppIconService` instance SHALL be created and retained for the app lifecycle

### Requirement: MethodChannel definition

`AppIconService` SHALL use a `MethodChannel` with the name `com.leoho.naverBlogImageDownloader/appIcon` to communicate with native platform code.

#### Scenario: Channel name matches native registration

- **GIVEN** `AppIconService` is instantiated
- **WHEN** the internal channel is inspected
- **THEN** its name SHALL be `com.leoho.naverBlogImageDownloader/appIcon`

### Requirement: Set app icon

`AppIconService` SHALL provide a `setAppIcon(String iconName)` method that invokes the native `setAppIcon` method via MethodChannel, passing `iconName` as an argument under the key `"iconName"`. On `PlatformException`, it SHALL throw an `AppError` with type `AppErrorType.appIcon`.

#### Scenario: Set icon to new version

- **GIVEN** the native platform supports alternate icons
- **WHEN** `setAppIcon("new")` is called
- **THEN** the native `setAppIcon` method SHALL be invoked with `{"iconName": "new"}`

#### Scenario: Native platform throws error

- **GIVEN** the native platform returns a `PlatformException`
- **WHEN** `setAppIcon("new")` is called
- **THEN** an `AppError` with type `AppErrorType.appIcon` SHALL be thrown

### Requirement: Get current icon

`AppIconService` SHALL provide a `getCurrentIcon()` method that invokes the native `getCurrentIcon` method via MethodChannel. It SHALL return the icon name string (`"default"` or `"new"`). If the native call fails or returns `null`, it SHALL return `"default"` as a fallback.

#### Scenario: Current icon is default (primary)

- **GIVEN** no alternate icon has been set
- **WHEN** `getCurrentIcon()` is called
- **THEN** it SHALL return `"default"`

#### Scenario: Current icon is new

- **GIVEN** the alternate icon has been set to new
- **WHEN** `getCurrentIcon()` is called
- **THEN** it SHALL return `"new"`

#### Scenario: Native call fails

- **GIVEN** the native platform throws a `PlatformException`
- **WHEN** `getCurrentIcon()` is called
- **THEN** it SHALL return `"default"` as a fallback

### Requirement: iOS native implementation

The iOS native side SHALL register a `FlutterMethodChannel` named `com.leoho.naverBlogImageDownloader/appIcon` in `AppDelegate` via `setupAppIconChannel(messenger:)`.

The `setAppIcon` handler SHALL call `UIApplication.shared.setAlternateIconName(_:)`:
- When `iconName` is `"default"`, it SHALL pass `nil` (primary icon).
- When `iconName` is `"new"`, it SHALL pass `"NewAppIcon"` (the xcassets icon set name).

The `getCurrentIcon` handler SHALL read `UIApplication.shared.alternateIconName`:
- When `nil`, it SHALL return `"default"`.
- When non-nil, it SHALL return `"new"`.

#### Scenario: iOS switch to alternate icon

- **GIVEN** the current icon is primary (default)
- **WHEN** `setAppIcon` is called with `iconName: "new"`
- **THEN** `UIApplication.shared.setAlternateIconName("NewAppIcon")` SHALL be called

#### Scenario: iOS switch back to primary icon

- **GIVEN** the current icon is alternate (new)
- **WHEN** `setAppIcon` is called with `iconName: "default"`
- **THEN** `UIApplication.shared.setAlternateIconName(nil)` SHALL be called

#### Scenario: iOS get current icon when primary

- **GIVEN** `UIApplication.shared.alternateIconName` is `nil`
- **WHEN** `getCurrentIcon` is called
- **THEN** it SHALL return `"default"`

### Requirement: Android native implementation

The Android native side SHALL register a `MethodChannel` named `com.leoho.naverBlogImageDownloader/appIcon` in `MainActivity` via `setupAppIconChannel(flutterEngine)`.

The `setAppIcon` handler SHALL use `PackageManager.setComponentEnabledSetting` to enable the target `activity-alias` and disable the other:
- `MainActivityClassic` alias uses `@mipmap/ic_launcher`.
- `MainActivityNew` alias uses `@mipmap/ic_launcher_new`.
- Both enable/disable calls SHALL use `DONT_KILL_APP` flag.

The `getCurrentIcon` handler SHALL check the enabled state of `MainActivityNew`:
- If `COMPONENT_ENABLED_STATE_ENABLED`, it SHALL return `"new"`.
- Otherwise, it SHALL return `"default"`.

#### Scenario: Android switch to new icon

- **GIVEN** `MainActivityClassic` is enabled and `MainActivityNew` is disabled
- **WHEN** `setAppIcon` is called with `iconName: "new"`
- **THEN** `MainActivityClassic` SHALL be disabled and `MainActivityNew` SHALL be enabled with `DONT_KILL_APP`

#### Scenario: Android get current icon

- **GIVEN** `MainActivityNew` is in `COMPONENT_ENABLED_STATE_ENABLED`
- **WHEN** `getCurrentIcon` is called
- **THEN** it SHALL return `"new"`

### Requirement: Xcode build settings for alternate icons

The Xcode project SHALL have `ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS` set to `YES` in its build settings. The alternate icon set `NewAppIcon.appiconset` SHALL exist in `Assets.xcassets` alongside the primary `AppIcon.appiconset`.

#### Scenario: All icon assets included in build

- **WHEN** the Xcode build settings are inspected
- **THEN** `ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS` SHALL be `YES`
- **AND** `Assets.xcassets` SHALL contain both `AppIcon.appiconset` and `NewAppIcon.appiconset`

### Requirement: AndroidManifest activity-alias configuration

The `AndroidManifest.xml` SHALL define two `<activity-alias>` entries targeting `.applications.MainActivity`:
- `.MainActivityClassic` with `android:enabled="true"` and `android:icon="@mipmap/ic_launcher"`
- `.MainActivityNew` with `android:enabled="false"` and `android:icon="@mipmap/ic_launcher_new"`

Both aliases SHALL have a LAUNCHER `<intent-filter>`. The original `MainActivity` `<activity>` SHALL NOT have a LAUNCHER intent-filter.

#### Scenario: Classic alias is default enabled

- **WHEN** AndroidManifest.xml is inspected
- **THEN** `.MainActivityClassic` SHALL have `android:enabled="true"`
- **AND** `.MainActivityNew` SHALL have `android:enabled="false"`
