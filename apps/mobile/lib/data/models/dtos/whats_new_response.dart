/// 後端 `/api/whatsNew` API 的回應資料模型。
///
/// 包含 [version]（版本號）、[onboarding]（引導項目列表）、[whatsNew]（新功能項目列表）。
class WhatsNewResponse {
  /// 建立 [WhatsNewResponse]。
  ///
  /// [version] 為回應對應的 App 版本號。
  /// [onboarding] 為首次安裝引導項目列表。
  /// [whatsNew] 為版本新功能項目列表。
  const WhatsNewResponse({
    required this.version,
    required this.onboarding,
    required this.whatsNew,
  });

  /// 從 JSON Map 反序列化。
  ///
  /// [json] 為後端回傳的 JSON 結構。
  ///
  /// 回傳 [WhatsNewResponse] 實例。
  factory WhatsNewResponse.fromJson(Map<String, dynamic> json) {
    return WhatsNewResponse(
      version: json['version'] as String,
      onboarding: (json['onboarding'] as List<dynamic>)
          .map((e) => WhatsNewItemDto.fromJson(e as Map<String, dynamic>))
          .toList(),
      whatsNew: (json['whatsNew'] as List<dynamic>)
          .map((e) => WhatsNewItemDto.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  /// 回應對應的 App 版本號。
  final String version;

  /// 首次安裝引導項目列表。
  final List<WhatsNewItemDto> onboarding;

  /// 版本新功能項目列表。
  final List<WhatsNewItemDto> whatsNew;
}

/// 後端回傳的單一功能項目 DTO。
///
/// [type] 為 `"text"` 或 `"image"`，決定項目類型。
/// `"text"` 類型包含 [icon]（Material Icon 名稱），
/// `"image"` 類型包含 [base64Image]（base64 編碼圖片）。
class WhatsNewItemDto {
  /// 建立 [WhatsNewItemDto]。
  ///
  /// [type] 為項目類型（`"text"` 或 `"image"`）。
  /// [icon] 為 Material Icon 名稱（`type` 為 `"text"` 時）。
  /// [base64Image] 為 base64 編碼圖片（`type` 為 `"image"` 時）。
  /// [title] 為已翻譯的標題文字。
  /// [description] 為已翻譯的描述文字。
  const WhatsNewItemDto({
    required this.type,
    this.icon,
    this.base64Image,
    required this.title,
    required this.description,
  });

  /// 從 JSON Map 反序列化。
  ///
  /// [json] 為後端回傳的單一項目 JSON。
  ///
  /// 回傳 [WhatsNewItemDto] 實例。
  factory WhatsNewItemDto.fromJson(Map<String, dynamic> json) {
    return WhatsNewItemDto(
      type: json['type'] as String,
      icon: json['icon'] as String?,
      base64Image: json['base64Image'] as String?,
      title: json['title'] as String,
      description: json['description'] as String,
    );
  }

  /// 項目類型（`"text"` 或 `"image"`）。
  final String type;

  /// Material Icon 名稱（`type` 為 `"text"` 時使用）。
  final String? icon;

  /// base64 編碼圖片（`type` 為 `"image"` 時使用）。
  final String? base64Image;

  /// 已翻譯的標題文字。
  final String title;

  /// 已翻譯的描述文字。
  final String description;
}
