/// Dart 擴充方法：檔名清理、格式化等常用功能。
///
/// 所有擴充方法集中於此單一檔案中，供專案各層級程式碼使用。
library;

/// 字串擴充方法，提供檔名清理功能。
extension StringExtension on String {
  /// 清理字串使其適合作為檔案名稱。
  ///
  /// 移除檔案系統不允許的字元（`/`、`\`、`:`、`*`、`?`、`"`、`<`、`>`、`|`），
  /// 並確保回傳非空字串。若清理後字串為空，則回傳 `"unnamed"`。
  ///
  /// 回傳清理後可安全用於檔案系統的名稱字串。
  String sanitizeFileName() {
    final sanitized = replaceAll(RegExp(r'[/\\:*?"<>|]'), '');
    final trimmed = sanitized.trim();
    return trimmed.isEmpty ? 'unnamed' : trimmed;
  }
}

/// 整數擴充方法，提供檔案大小格式化功能。
extension IntExtension on int {
  /// 將位元組數轉換為人類可讀的檔案大小字串。
  ///
  /// 依照大小自動選擇適當的單位（B、KB、MB、GB），
  /// 並以最多兩位小數表示。
  ///
  /// 範例：
  /// - `512.toFileSizeString()` → `"512 B"`
  /// - `1572864.toFileSizeString()` → `"1.50 MB"`
  ///
  /// 回傳帶有適當單位的檔案大小字串。
  String toFileSizeString() {
    const units = ['B', 'KB', 'MB', 'GB'];
    double size = toDouble();
    int unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    if (unitIndex == 0) {
      return '${size.toInt()} ${units[unitIndex]}';
    }

    return '${size.toStringAsFixed(2)} ${units[unitIndex]}';
  }
}
