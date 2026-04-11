/// 「版本新功能」或「首次安裝引導」中的單一項目（sealed class）。
///
/// 兩種子類型：
/// - [WhatsNewTextItem]：純文字格式（Icon 名稱 + 標題 + 描述），以列表呈現。
/// - [WhatsNewImageItem]：圖文格式（base64 圖片 + 標題 + 描述），以 PageView 輪播呈現。
sealed class WhatsNewItem {
  /// 建立 [WhatsNewItem]。
  ///
  /// [title] 為顯示標題文字。
  /// [description] 為顯示描述文字。
  const WhatsNewItem({required this.title, required this.description});

  /// 顯示標題文字。
  final String title;

  /// 顯示描述文字。
  final String description;
}

/// 純文字格式的功能項目，以 Icon + 標題 + 描述呈現。
class WhatsNewTextItem extends WhatsNewItem {
  /// 建立 [WhatsNewTextItem]。
  ///
  /// [icon] 為 Material Icon 名稱字串（如 `"auto_awesome"`）。
  /// [title] 為顯示標題文字。
  /// [description] 為顯示描述文字。
  const WhatsNewTextItem({
    required this.icon,
    required super.title,
    required super.description,
  });

  /// Material Icon 名稱字串（如 `"auto_awesome"`）。
  final String icon;
}

/// 圖文格式的功能項目，以 base64 編碼圖片 + 標題 + 描述呈現。
class WhatsNewImageItem extends WhatsNewItem {
  /// 建立 [WhatsNewImageItem]。
  ///
  /// [base64Image] 為 base64 編碼的圖片資料。
  /// [title] 為顯示標題文字。
  /// [description] 為顯示描述文字。
  const WhatsNewImageItem({
    required this.base64Image,
    required super.title,
    required super.description,
  });

  /// base64 編碼的圖片資料。
  final String base64Image;
}

/// 一組「版本新功能」或「首次安裝引導」的內容包裝。
///
/// 渲染格式由 [items] 的實際類型決定：
/// - 全部為 [WhatsNewTextItem] → 圓角 Dialog 列表。
/// - 含 [WhatsNewImageItem] → PageView 輪播。
class WhatsNewEntry {
  /// 建立 [WhatsNewEntry]。
  ///
  /// [items] 為功能項目列表。
  const WhatsNewEntry({required this.items});

  /// 功能項目列表。
  final List<WhatsNewItem> items;

  /// 是否包含圖文項目，決定使用 PageView 輪播渲染。
  bool get hasImageItems => items.any((item) => item is WhatsNewImageItem);
}
