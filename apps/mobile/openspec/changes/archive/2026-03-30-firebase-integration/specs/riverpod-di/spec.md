# riverpod-di Delta Spec (firebase-integration)

## ADDED Requirements

### Requirement: Firebase initialization in main()

The `main()` function SHALL initialize Firebase after `_configureAmplify()` completes and before `SharedPreferences.getInstance()`. The initialization sequence SHALL be:

1. `await Firebase.initializeApp()` -- reads native configuration files (`GoogleService-Info.plist` / `google-services.json`)
2. Set `FlutterError.onError` to `FirebaseCrashlytics.instance.recordFlutterFatalError` to capture Flutter framework fatal errors
3. Set `PlatformDispatcher.instance.onError` to a callback that calls `FirebaseCrashlytics.instance.recordError(error, stack, fatal: true)` and returns `true`, to capture asynchronous platform errors
4. Call `unawaited(AuthService().ensureSignedIn())` to trigger anonymous sign-in without blocking app startup

The `main()` function SHALL NOT `await` the `AuthService().ensureSignedIn()` call. The anonymous sign-in SHALL proceed in the background.

#### Scenario: Firebase initialized before SharedPreferences

- **GIVEN** the application starts
- **WHEN** `main()` is executed
- **THEN** `Firebase.initializeApp()` SHALL be awaited before `SharedPreferences.getInstance()`
- **AND** `FlutterError.onError` SHALL be assigned to the Crashlytics fatal error handler
- **AND** `PlatformDispatcher.instance.onError` SHALL be assigned to a Crashlytics platform error handler that returns `true`
- **AND** `AuthService().ensureSignedIn()` SHALL be called via `unawaited()`

#### Scenario: Crashlytics captures Flutter errors

- **GIVEN** Firebase has been initialized
- **WHEN** a Flutter framework error occurs
- **THEN** `FlutterError.onError` SHALL forward the error to `FirebaseCrashlytics.instance.recordFlutterFatalError`

#### Scenario: Crashlytics captures platform errors

- **GIVEN** Firebase has been initialized
- **WHEN** an unhandled platform error occurs
- **THEN** `PlatformDispatcher.instance.onError` SHALL forward the error and stack trace to `FirebaseCrashlytics.instance.recordError` with `fatal: true`
- **AND** the callback SHALL return `true`
