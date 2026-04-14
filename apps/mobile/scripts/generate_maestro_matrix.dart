import 'dart:convert';
import 'dart:io';

import 'sync_scenarios.dart';

/// 產生完整 screenshot matrix 的進入點。
///
/// 執行流程：
/// 1. 先呼叫 [syncScenariosFromJson] 將 JSON 同步寫回 Dart 定義檔，
///    確保 App 運行期與 Maestro 拍攝流程使用同一份場景清單。
/// 2. 從 `scripts/screenshot_matrix.json` 讀取 locales / themes / scenarios，
///    逐一組合成 Maestro 可直接執行的 `screenshot_matrix.yaml`。
///
/// 呼叫時須將工作目錄設為 `apps/mobile/`，否則找不到來源 / 目標檔。
void main() {
  syncScenariosFromJson();

  final config =
      jsonDecode(File('scripts/screenshot_matrix.json').readAsStringSync())
          as Map<String, dynamic>;
  final locales = (config['locales'] as List).cast<String>();
  final themes = (config['themes'] as List).cast<String>();
  final scenarios = (config['scenarios'] as List).cast<Map<String, dynamic>>();

  final buffer = StringBuffer()..writeln('---');
  for (final locale in locales) {
    for (final theme in themes) {
      for (final scenario in scenarios) {
        buffer
          ..writeln('- runFlow:')
          ..writeln('    file: take_screenshot.yaml')
          ..writeln('    env:')
          ..writeln('      SCENARIO: ${scenario['id']}')
          ..writeln('      LOCALE: $locale')
          ..writeln('      THEME: $theme')
          ..writeln('      WAIT_FOR: ${scenario['waitForId']}')
          ..writeln('      OUTPUT_PATH: $locale/$theme/${scenario['id']}');
      }
    }
  }

  File('.maestro/screenshot_matrix.yaml').writeAsStringSync(buffer.toString());
  stdout.writeln('✅ 已更新 .maestro/screenshot_matrix.yaml');
}
