// 此檔案由 scripts/sync_scenarios.dart 自動產生，請勿手動修改。
// 修改場景請編輯 scripts/screenshot_matrix.json 後執行：
//   dart run scripts/sync_scenarios.dart

/// Flutter 截圖穩定完成後的預設等待識別碼。
const String screenshotReadyIdentifier = 'screenshot_ready';

/// 原生 PhotoViewer 的等待識別碼。
const String photoViewerPagerIdentifier = 'photo_viewer_pager';

/// 單一截圖場景的描述資料。
class ScreenshotScenarioMetadata {
  /// 建立 [ScreenshotScenarioMetadata]。
  ///
  /// - [id]：場景識別碼。
  /// - [waitForId]：Maestro 等待的識別碼。
  const ScreenshotScenarioMetadata({required this.id, required this.waitForId});

  /// 場景識別碼。
  final String id;

  /// Maestro 等待的識別碼。
  final String waitForId;
}

/// 所有 screenshot 場景的中繼資料清單。
const List<ScreenshotScenarioMetadata> screenshotScenarioMetadatas = [
  ScreenshotScenarioMetadata(
    id: 'blog_input_empty',
    waitForId: screenshotReadyIdentifier,
  ),
  ScreenshotScenarioMetadata(
    id: 'blog_input_with_url',
    waitForId: screenshotReadyIdentifier,
  ),
  ScreenshotScenarioMetadata(
    id: 'blog_input_loading',
    waitForId: screenshotReadyIdentifier,
  ),
  ScreenshotScenarioMetadata(
    id: 'photo_gallery_grid',
    waitForId: screenshotReadyIdentifier,
  ),
  ScreenshotScenarioMetadata(
    id: 'photo_gallery_select',
    waitForId: screenshotReadyIdentifier,
  ),
  ScreenshotScenarioMetadata(
    id: 'photo_detail_native',
    waitForId: photoViewerPagerIdentifier,
  ),
  ScreenshotScenarioMetadata(
    id: 'settings_default',
    waitForId: screenshotReadyIdentifier,
  ),
  ScreenshotScenarioMetadata(
    id: 'download_in_progress',
    waitForId: screenshotReadyIdentifier,
  ),
  ScreenshotScenarioMetadata(
    id: 'download_completed',
    waitForId: screenshotReadyIdentifier,
  ),
  ScreenshotScenarioMetadata(
    id: 'whats_new_onboarding',
    waitForId: screenshotReadyIdentifier,
  ),
  ScreenshotScenarioMetadata(
    id: 'whats_new_update',
    waitForId: screenshotReadyIdentifier,
  ),
];

/// 依場景識別碼查詢 metadata 的對照表（lazy final，只建一次）。
final Map<String, ScreenshotScenarioMetadata> screenshotScenarioMetadataById = {
  for (final metadata in screenshotScenarioMetadatas) metadata.id: metadata,
};
