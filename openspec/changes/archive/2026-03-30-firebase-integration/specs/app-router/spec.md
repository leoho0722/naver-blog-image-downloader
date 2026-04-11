# app-router Delta Spec (firebase-integration)

## MODIFIED Requirements

### Requirement: GoRouter instance defined

The file `lib/routing/app_router.dart` SHALL define the GoRouter as a `@Riverpod(keepAlive: true)` provider function instead of a top-level global variable. The provider function SHALL be named `appRouter` and SHALL return a `GoRouter` instance.

- The `GoRouter` SHALL set `initialLocation` to `'/'`.
- The `GoRouter` SHALL contain exactly 4 route definitions.
- The `GoRouter` SHALL include `observers: [_LoggingObserver(ref)]` in its constructor.

The top-level `final appRouter = GoRouter(...)` global variable SHALL be removed.

#### Scenario: GoRouter provided via Riverpod

- **GIVEN** the app is running with `ProviderScope`
- **WHEN** `appRouterProvider` is accessed
- **THEN** it SHALL return a valid `GoRouter` instance
- **AND** the provider SHALL be `keepAlive` (not auto-disposed)

#### Scenario: Initial location is root

- **WHEN** `appRouterProvider` is accessed
- **THEN** the GoRouter's `initialLocation` SHALL be `'/'`

#### Scenario: Four routes are configured

- **WHEN** the `routes` list of the provided GoRouter is inspected
- **THEN** it SHALL contain exactly 4 `GoRoute` entries

---

## ADDED Requirements

### Requirement: Navigation logging observer

The file `lib/routing/app_router.dart` SHALL define a private `_LoggingObserver` class that extends `NavigatorObserver`.

- `_LoggingObserver` SHALL accept a `Ref` parameter in its constructor.
- `_LoggingObserver.didPush()` SHALL extract the route name from `route.settings.name` and call `ref.read(logRepositoryProvider).logPageNavigation(pageName: routeName)`.
- If `route.settings.name` is `null`, `didPush()` SHALL use the string `'unknown'` as the page name.

#### Scenario: Page navigation logged on push

- **GIVEN** the app is running with the GoRouter that includes `_LoggingObserver`
- **WHEN** a new route is pushed (e.g., navigating to `'/gallery/abc123'`)
- **THEN** `_LoggingObserver.didPush()` SHALL call `logPageNavigation` with the route's settings name

#### Scenario: Unknown route name handled

- **GIVEN** a route is pushed with `settings.name` equal to `null`
- **WHEN** `_LoggingObserver.didPush()` is invoked
- **THEN** it SHALL call `logPageNavigation(pageName: 'unknown')`

---

## MODIFIED Requirements

### Requirement: app.dart uses appRouterProvider

`NaverPhotoApp` SHALL obtain the GoRouter instance via `ref.watch(appRouterProvider)` instead of referencing the global `appRouter` variable. The `routerConfig` parameter of `MaterialApp.router` SHALL use the provider-sourced GoRouter.

#### Scenario: NaverPhotoApp uses provider-sourced router

- **WHEN** `NaverPhotoApp.build()` is invoked
- **THEN** it SHALL call `ref.watch(appRouterProvider)` to obtain the `GoRouter`
- **AND** SHALL pass it to `MaterialApp.router(routerConfig: ...)`
