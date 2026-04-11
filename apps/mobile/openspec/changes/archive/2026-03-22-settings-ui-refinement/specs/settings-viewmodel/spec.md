## REMOVED Requirements

### Requirement: Clear blog cache

**Reason**: Individual blog cache clearing feature is removed from the settings UI. The `clearBlogCache` method in SettingsViewModel is no longer needed.
**Migration**: Cache clearing is handled exclusively via the `clearAllCache` method. `CacheRepository.clearBlog()` remains available at the repository layer if needed by other features.
