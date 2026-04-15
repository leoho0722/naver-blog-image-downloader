import 'dart:async';
import 'dart:io';

import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

/// widget / golden test 的全域初始化。
///
/// 載入 macOS 可用的 Latin / CJK 系統字型與 Material Icons，確保 golden 不會
/// 把英數字、CJK 或 icon 渲染為方格。
///
/// 運作原理：
/// 1. `_themeFallbackFamilies` 中每個別名都掛 **PingFang 等 CJK 字型** 的 bytes，
///    讓 Flutter 查 CJK 字時找得到。
/// 2. `AppTheme.fontFamilyFallback` 最前面的 `Helvetica` 另外登記 Helvetica bytes，
///    負責英數字覆蓋。Flutter engine 在 CJK family 找不到 Latin glyph 時會自動
///    沿 fallback chain 再找下去，最終 hit Helvetica。
Future<void> testExecutable(FutureOr<void> Function() testMain) async {
  TestWidgetsFlutterBinding.ensureInitialized();
  await _loadAppFonts();
  await testMain();
}

/// Chinese / Japanese 字型候選檔名（依優先順序）。PingFang 不含韓文，
/// 韓文另外從 [_koreanFontCandidates] 載。
const _cjFontCandidates = <String>[
  'PingFang.ttc',
  'Hiragino Sans GB.ttc',
  'NotoSansCJK-Regular.ttc',
];

/// Korean 字型候選檔名，補 PingFang 不含的韓文 glyph。
const _koreanFontCandidates = <String>[
  'AppleSDGothicNeo.ttc',
  'NotoSansKR-Regular.ttc',
];

/// Latin 字型候選檔名（依優先順序），命中第一個即停止。
///
/// 優先使用 Flutter 內建的 Roboto-Regular.ttf，因為 FontLoader 對單一 .ttf 的支援
/// 比 .ttc 穩定；系統 ttc 字型作為備援。
const _latinFontCandidates = <String>[
  'Roboto-Regular.ttf',
  'Helvetica.ttc',
  'HelveticaNeue.ttc',
  'SFNS.ttf',
];

/// `AppTheme.fontFamilyFallback` 中負責中 / 日文的 family 別名，掛 PingFang bytes。
const _cjFallbackFamilies = <String>[
  'PingFang TC',
  'Hiragino Sans GB',
  'Noto Sans CJK TC',
  'Noto Sans CJK JP',
  'Noto Sans JP',
];

/// `AppTheme.fontFamilyFallback` 中負責韓文的 family 別名，掛 Apple SD Gothic Neo bytes。
const _koreanFallbackFamilies = <String>[
  'Apple SD Gothic Neo',
  'Noto Sans CJK KR',
  'Noto Sans KR',
];

/// 載入 golden / screenshot 測試需要的所有字型。
Future<void> _loadAppFonts() async {
  final latinBytes = await _readFirstAvailable(_latinFontCandidates);
  final cjBytes = await _readFirstAvailable(_cjFontCandidates);
  final koreanBytes = await _readFirstAvailable(_koreanFontCandidates);

  if (latinBytes == null) {
    stderr.writeln('⚠️  測試環境找不到 Latin 系統字型，英數字可能渲染為方格。');
  } else {
    // Latin 字型：Helvetica 對應 AppTheme.fontFamily（primary），
    // sans-serif 對應 AppTheme.fontFamilyFallback 的最後一層保險。
    for (final family in const ['Helvetica', 'sans-serif']) {
      final loader = FontLoader(family)
        ..addFont(Future<ByteData>.value(latinBytes));
      await loader.load();
    }
  }

  if (cjBytes == null) {
    stderr.writeln('⚠️  測試環境找不到中日文系統字型，中文 / 日文可能渲染為方格。');
  } else {
    for (final family in _cjFallbackFamilies) {
      final loader = FontLoader(family)
        ..addFont(Future<ByteData>.value(cjBytes));
      await loader.load();
    }
  }

  if (koreanBytes == null) {
    stderr.writeln('⚠️  測試環境找不到韓文系統字型，韓文可能渲染為方格。');
  } else {
    for (final family in _koreanFallbackFamilies) {
      final loader = FontLoader(family)
        ..addFont(Future<ByteData>.value(koreanBytes));
      await loader.load();
    }
  }

  await _loadMaterialIcons();
}

/// 依序嘗試 [candidates] 中的檔名，找到第一個存在的檔案並回傳其 bytes。
///
/// 回傳 `null` 表示都找不到。
Future<ByteData?> _readFirstAvailable(List<String> candidates) async {
  for (final name in candidates) {
    final file = _findSystemFont(name);
    if (file != null) {
      final bytes = await file.readAsBytes();
      return ByteData.sublistView(bytes);
    }
  }
  return null;
}

/// 從 Flutter cache 載入 MaterialIcons-Regular.otf。
///
/// 找不到時靜默跳過，golden 中 Icon widget 會顯示空白位置而不是方格。
Future<void> _loadMaterialIcons() async {
  final home = Platform.environment['HOME'];
  if (home == null) return;

  final candidates = <String>[
    '$home/flutter/bin/cache/artifacts/material_fonts/MaterialIcons-Regular.otf',
    '$home/development/flutter/bin/cache/artifacts/material_fonts/MaterialIcons-Regular.otf',
  ];
  for (final path in candidates) {
    final file = File(path);
    if (file.existsSync()) {
      final bytes = await file.readAsBytes();
      final loader = FontLoader('MaterialIcons')
        ..addFont(Future<ByteData>.value(ByteData.sublistView(bytes)));
      await loader.load();
      return;
    }
  }
}

/// 以 BFS 方式在 macOS 常見字型目錄中尋找指定檔名。
///
/// - [fileName]：要尋找的字型檔名（如 `PingFang.ttc`）。
///
/// 回傳命中的 [File]，找不到時回傳 `null`。
/// 對無權限的子目錄（如 AssetsV2 底下部分受保護資料夾）會靜默跳過。
File? _findSystemFont(String fileName) {
  final home = Platform.environment['HOME'] ?? '';
  final roots = <String>[
    '$home/flutter/bin/cache/artifacts/material_fonts',
    '$home/development/flutter/bin/cache/artifacts/material_fonts',
    '/System/Library/Fonts',
    '/System/Library/Fonts/Supplemental',
    '/System/Library/AssetsV2',
    '/Library/Fonts',
  ];

  for (final rootPath in roots) {
    final root = Directory(rootPath);
    if (!root.existsSync()) continue;

    final queue = <Directory>[root];
    while (queue.isNotEmpty) {
      final dir = queue.removeLast();
      try {
        for (final entity in dir.listSync(followLinks: false)) {
          if (entity is Directory) {
            queue.add(entity);
          } else if (entity is File && entity.path.endsWith(fileName)) {
            return entity;
          }
        }
      } on Object {
        // 碰到無權限子目錄（如 AssetsV2 內部受保護資料夾）直接跳過。
        continue;
      }
    }
  }
  return null;
}
