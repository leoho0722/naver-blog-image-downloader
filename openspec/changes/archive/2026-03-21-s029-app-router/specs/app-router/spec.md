## ADDED Requirements

### Requirement: GoRouter instance defined

The file `lib/routing/app_router.dart` SHALL define a top-level `appRouter` variable of type `GoRouter`.

- The `appRouter` SHALL set `initialLocation` to `'/'`.
- The `appRouter` SHALL contain exactly 4 route definitions.

#### Scenario: Initial location is root

- **WHEN** `appRouter.routeInformationProvider.value` is inspected
- **THEN** the initial location SHALL be `'/'`

#### Scenario: Four routes are configured

- **WHEN** the `routes` list of `appRouter` is inspected
- **THEN** it SHALL contain exactly 4 `GoRoute` entries

### Requirement: Static routes configured

The `appRouter` SHALL define routes for paths that do not require parameters:

- A `GoRoute` with path `'/'` that builds a `BlogInputView` widget.
- A `GoRoute` with path `'/settings'` that builds a `SettingsView` widget.

#### Scenario: Root path renders BlogInputView

- **WHEN** navigating to `'/'`
- **THEN** the router SHALL build a `BlogInputView` widget

#### Scenario: Settings path renders SettingsView

- **WHEN** navigating to `'/settings'`
- **THEN** the router SHALL build a `SettingsView` widget

### Requirement: Parameterized routes configured

The `appRouter` SHALL define routes that accept path parameters:

- A `GoRoute` with path `'/gallery/:blogId'` that builds a `PhotoGalleryView` widget.
- A `GoRoute` with path `'/detail/:photoId'` that builds a `PhotoDetailView` widget.

Note: Download is handled as a dialog (not a routed page), so there is no `/download/:blogId` route.

#### Scenario: Gallery path accepts blogId

- **WHEN** navigating to `'/gallery/abc123'`
- **THEN** the router SHALL build a `PhotoGalleryView` widget
- **AND** the `blogId` path parameter SHALL be `'abc123'`

#### Scenario: Detail path accepts photoId

- **WHEN** navigating to `'/detail/photo456'`
- **THEN** the router SHALL build a `PhotoDetailView` widget
- **AND** the `photoId` path parameter SHALL be `'photo456'`

### Requirement: Path parameters extracted from state

Each parameterized route SHALL extract its path parameter from `GoRouterState.pathParameters` and pass it to the corresponding view widget constructor.

#### Scenario: blogId passed to PhotoGalleryView

- **WHEN** the `/gallery/:blogId` route builder is invoked with state containing `pathParameters['blogId']`
- **THEN** the extracted `blogId` value SHALL be passed to `PhotoGalleryView`

#### Scenario: photoId passed to PhotoDetailView

- **WHEN** the `/detail/:photoId` route builder is invoked with state containing `pathParameters['photoId']`
- **THEN** the extracted `photoId` value SHALL be passed to `PhotoDetailView`
