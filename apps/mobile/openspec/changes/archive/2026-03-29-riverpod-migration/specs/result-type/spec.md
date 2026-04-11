## REMOVED Requirements

### Requirement: Result sealed class defined

**Reason**: Replaced by Riverpod's `AsyncValue` pattern. Repository methods now throw exceptions directly, which `AsyncValue` catches and represents as `AsyncError`.

**Migration**: Remove all `Result<T>` usage. Repository methods that returned `Result.ok(value)` SHALL return the value directly. Repository methods that returned `Result.error(exception)` SHALL throw the exception. ViewModel callers SHALL use try-catch with `AsyncValue` instead of switch on `Ok`/`Error`.
