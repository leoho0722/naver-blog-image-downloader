/// 「版本新功能」API 的請求資料傳輸物件（DTO）。
///
/// 對應後端 `POST /api/whatsNew` 的 request body。
class WhatsNewRequest {
  /// 建立 [WhatsNewRequest]。
  ///
  /// [version] 為當前 App 版本號。
  /// [locale] 為使用者語系（如 `"zh-TW"`、`"en"`）。
  const WhatsNewRequest({required this.version, required this.locale});

  /// 當前 App 版本號。
  final String version;

  /// 使用者語系。
  final String locale;

  /// 將此請求序列化為 JSON 格式的 [Map]。
  ///
  /// 回傳包含 `version` 與 `locale` 的 `Map<String, dynamic>`。
  Map<String, dynamic> toJson() {
    return {'version': version, 'locale': locale};
  }
}
