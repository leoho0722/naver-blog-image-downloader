## REMOVED Requirements

### Requirement: Service providers registered

**Reason**: Replaced by `riverpod-di` capability. Services are now defined with `@Riverpod(keepAlive: true)` annotations co-located in each service file, instead of being registered in `MultiProvider`.

**Migration**: Remove all `Provider(create: ...)` entries from `main.dart`. Each service file SHALL define its own provider function with `@Riverpod(keepAlive: true)`.

### Requirement: Repository providers registered

**Reason**: Replaced by `riverpod-di` capability. Repositories are now defined with `@Riverpod(keepAlive: true)` annotations and use `ref.watch` for dependency resolution instead of `ProxyProvider4`.

**Migration**: Remove `ProxyProvider4` and `Provider(create: (context) => ...)` entries from `main.dart`. Each repository file SHALL define its own provider function.

### Requirement: ViewModel providers registered

**Reason**: Replaced by `riverpod-di` capability. ViewModels are now defined with `@riverpod` annotations on their class declarations instead of `ChangeNotifierProvider` in `main.dart`.

**Migration**: Remove all `ChangeNotifierProvider` entries from `main.dart`. Each ViewModel file SHALL use `@riverpod` or `@Riverpod(keepAlive: true)` annotation.

### Requirement: NaverPhotoApp widget defined

**Reason**: Replaced by `riverpod-di` capability. `NaverPhotoApp` now extends `ConsumerWidget` instead of `StatelessWidget` and uses `ref.watch` instead of `context.watch`.

**Migration**: Change `NaverPhotoApp` from `StatelessWidget` to `ConsumerWidget`. Replace `context.watch<AppSettingsViewModel>()` with `ref.watch(appSettingsViewModelProvider)`.

### Requirement: main function defined

**Reason**: Replaced by `riverpod-di` capability. `main()` now uses `ProviderScope` instead of `MultiProvider`.

**Migration**: Replace `MultiProvider(providers: [...], child: const NaverPhotoApp())` with `ProviderScope(overrides: [...], child: const NaverPhotoApp())`.

### Requirement: AppSettingsViewModel provider registered

**Reason**: Replaced by `riverpod-di` capability. `AppSettingsViewModel` is now registered via `@Riverpod(keepAlive: true)` annotation on the class itself.

**Migration**: Remove `ChangeNotifierProvider` for `AppSettingsViewModel` from `main.dart`. The `@Riverpod(keepAlive: true)` annotation on `AppSettingsViewModel` class handles registration.

### Requirement: SharedPreferences eagerly initialized

**Reason**: Replaced by `riverpod-di` capability. `SharedPreferences` is still eagerly initialized in `main()` but passed via `sharedPreferencesProvider.overrideWithValue(prefs)` in `ProviderScope.overrides`.

**Migration**: Keep `await SharedPreferences.getInstance()` in `main()`. Pass the result via `ProviderScope.overrides` instead of directly to `LocalStorageService` constructor.
