import 'dart:convert';
import 'dart:io';

/// `sync_scenarios.dart` 進入點，讀 JSON 並重新產生 scenarios Dart 定義檔。
///
/// 呼叫時須將工作目錄設為 `apps/mobile/`，否則找不到
/// `scripts/screenshot_matrix.json`。
void main() {
  syncScenariosFromJson();
}

/// 讀 `scripts/screenshot_matrix.json` 並同步寫回
/// `lib/screenshot/screenshot_scenario_definitions.dart`。
///
/// 此函式亦供 `generate_maestro_matrix.dart` 在產 Maestro yaml 前先行呼叫，
/// 避免 Dart / yaml 兩邊步調不一致。
///
/// 呼叫時須將工作目錄設為 `apps/mobile/`，否則找不到來源 / 目標檔。
void syncScenariosFromJson() {
  final jsonFile = File('scripts/screenshot_matrix.json');
  if (!jsonFile.existsSync()) {
    stderr.writeln('❌ 找不到 ${jsonFile.absolute.path}');
    exit(1);
  }

  final config =
      jsonDecode(jsonFile.readAsStringSync()) as Map<String, dynamic>;
  final scenarios = (config['scenarios'] as List).cast<Map<String, dynamic>>();

  // waitForId 目前只有這兩個預定義常數；若 JSON 寫其他值會 fallback 成字串字面值，
  // 但那通常是錯字，此處預警並讓 CI / 本機可及早發現。
  const allowedWaitForIds = {'screenshot_ready', 'photo_viewer_pager'};
  for (final s in scenarios) {
    final waitForId = s['waitForId'] as String?;
    if (waitForId != null && !allowedWaitForIds.contains(waitForId)) {
      stderr.writeln(
        '⚠️  場景 ${s['id']} 使用非預定義 waitForId「$waitForId」，'
        '若這是新的識別碼請同步在 screenshot_scenario_definitions.dart 新增對應常數。',
      );
    }
  }

  final buf = StringBuffer()
    ..writeln('// 此檔案由 scripts/sync_scenarios.dart 自動產生，請勿手動修改。')
    ..writeln('// 修改場景請編輯 scripts/screenshot_matrix.json 後執行：')
    ..writeln('//   dart run scripts/sync_scenarios.dart')
    ..writeln()
    ..writeln('/// Flutter 截圖穩定完成後的預設等待識別碼。')
    ..writeln("const String screenshotReadyIdentifier = 'screenshot_ready';")
    ..writeln()
    ..writeln('/// 原生 PhotoViewer 的等待識別碼。')
    ..writeln("const String photoViewerPagerIdentifier = 'photo_viewer_pager';")
    ..writeln()
    ..writeln('/// 單一截圖場景的描述資料。')
    ..writeln('class ScreenshotScenarioMetadata {')
    ..writeln('  /// 建立 [ScreenshotScenarioMetadata]。')
    ..writeln('  ///')
    ..writeln('  /// - [id]：場景識別碼。')
    ..writeln('  /// - [waitForId]：Maestro 等待的識別碼。')
    ..writeln('  const ScreenshotScenarioMetadata({')
    ..writeln('    required this.id,')
    ..writeln('    required this.waitForId,')
    ..writeln('  });')
    ..writeln()
    ..writeln('  /// 場景識別碼。')
    ..writeln('  final String id;')
    ..writeln()
    ..writeln('  /// Maestro 等待的識別碼。')
    ..writeln('  final String waitForId;')
    ..writeln('}')
    ..writeln()
    ..writeln('/// 所有 screenshot 場景的中繼資料清單。')
    ..writeln(
      'const List<ScreenshotScenarioMetadata> screenshotScenarioMetadatas = [',
    );
  for (final s in scenarios) {
    final waitForId = switch (s['waitForId']) {
      'screenshot_ready' => 'screenshotReadyIdentifier',
      'photo_viewer_pager' => 'photoViewerPagerIdentifier',
      _ => "'${s['waitForId']}'",
    };
    buf
      ..writeln('  ScreenshotScenarioMetadata(')
      ..writeln("    id: '${s['id']}',")
      ..writeln('    waitForId: $waitForId,')
      ..writeln('  ),');
  }
  buf
    ..writeln('];')
    ..writeln()
    ..writeln('/// 依場景識別碼查詢 metadata 的對照表（lazy final，只建一次）。')
    ..writeln(
      'final Map<String, ScreenshotScenarioMetadata> screenshotScenarioMetadataById = {',
    )
    ..writeln(
      '  for (final metadata in screenshotScenarioMetadatas) metadata.id: metadata,',
    )
    ..writeln('};');

  final outFile = File('lib/screenshot/screenshot_scenario_definitions.dart');
  outFile.writeAsStringSync(buf.toString());
  stdout.writeln('✅ 已更新 ${outFile.path}');
}
