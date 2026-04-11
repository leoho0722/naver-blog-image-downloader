import 'package:flutter/material.dart';

/// 將 Material Icon 名稱字串映射為 [IconData]。
///
/// [name] 為 icon 名稱（如 `"auto_awesome"`、`"content_paste"`）。
/// 未知名稱 fallback 為 [Icons.info_outline]。
///
/// 回傳對應的 [IconData]。
IconData resolveIcon(String name) {
  return switch (name) {
    'content_paste' => Icons.content_paste,
    'photo_library' => Icons.photo_library,
    'download' => Icons.download,
    'swipe' => Icons.swipe,
    'auto_awesome' => Icons.auto_awesome,
    'info_outline' => Icons.info_outline,
    _ => Icons.info_outline,
  };
}
