import 'dart:ui';

/// 應用程式支援的語系列舉，包含對應的 [Locale] 物件與原生語言名稱。
enum SupportedLocale {
  /// 繁體中文。
  zhTW(Locale('zh', 'TW'), '繁體中文'),

  /// 英文。
  en(Locale('en'), 'English'),

  /// 日文。
  ja(Locale('ja'), '日本語'),

  /// 韓文。
  ko(Locale('ko'), '한국어');

  /// 建立 [SupportedLocale]。
  ///
  /// [locale] 為對應的 [Locale] 物件，[label] 為該語言的原生名稱。
  const SupportedLocale(this.locale, this.label);

  /// 對應的 [Locale] 物件。
  final Locale locale;

  /// 該語言的原生名稱（不做 l10n）。
  final String label;

  /// 從裝置預設語系解析最近的支援語系。
  ///
  /// 依語言碼匹配，無法匹配時 fallback 為 [SupportedLocale.zhTW]。
  ///
  /// 回傳匹配的 [SupportedLocale]。
  static SupportedLocale fromDeviceLocale() {
    final languageCode = PlatformDispatcher.instance.locale.languageCode;
    for (final supported in values) {
      if (supported.locale.languageCode == languageCode) {
        return supported;
      }
    }
    return zhTW;
  }
}
