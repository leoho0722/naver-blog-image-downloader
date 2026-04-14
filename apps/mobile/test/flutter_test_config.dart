import 'dart:async';
import 'dart:io';

import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

/// widget/golden test 的全域初始化。
///
/// 載入 app 內建字型與 macOS 可用的 CJK 系統字型，避免東亞文字渲染成方格。
Future<void> testExecutable(FutureOr<void> Function() testMain) async {
  TestWidgetsFlutterBinding.ensureInitialized();
  await _loadCjkSystemFonts();
  await testMain();
}

/// 載入 screenshot/golden 需要的 CJK 字型。
Future<void> _loadCjkSystemFonts() async {
  final families = <String, String>{
    'PingFang TC': 'PingFang.ttc',
    'Hiragino Sans GB': 'Hiragino Sans GB.ttc',
    'Apple SD Gothic Neo': 'AppleSDGothicNeo.ttc',
  };

  for (final entry in families.entries) {
    final file = _findSystemFont(entry.value);
    if (file == null) {
      continue;
    }

    final bytes = await file.readAsBytes();
    final loader = FontLoader(entry.key)
      ..addFont(Future<ByteData>.value(ByteData.sublistView(bytes)));
    await loader.load();
  }
}

/// 從 macOS 常見字型目錄尋找指定檔名。
File? _findSystemFont(String fileName) {
  const roots = <String>[
    '/System/Library/Fonts',
    '/System/Library/Fonts/Supplemental',
    '/System/Library/AssetsV2',
    '/Library/Fonts',
  ];

  for (final rootPath in roots) {
    final root = Directory(rootPath);
    if (!root.existsSync()) {
      continue;
    }

    try {
      final matches = root
          .listSync(recursive: true, followLinks: false)
          .whereType<File>()
          .where((file) => file.path.endsWith(fileName));
      if (matches.isNotEmpty) {
        return matches.first;
      }
    } on FileSystemException {
      continue;
    }
  }

  return null;
}
