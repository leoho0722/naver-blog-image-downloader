/// Naver Blog 網址驗證工具。
///
/// 僅接受 HTTPS 協定的電腦版（`blog.naver.com`）與
/// 手機版（`m.blog.naver.com`）網址格式。
abstract final class NaverUrlValidator {
  /// 用來比對 Naver Blog 網址的正規表達式，支援電腦版與手機版。
  static final _pattern = RegExp(r'^https://(m\.)?blog\.naver\.com/');

  /// 手機版 Naver Blog 網址前綴。
  static const _mobilePrefix = 'https://m.blog.naver.com/';

  /// 電腦版 Naver Blog 網址前綴。
  static const _desktopPrefix = 'https://blog.naver.com/';

  /// 驗證 [url] 是否為合法的 Naver Blog 網址。
  ///
  /// - [url]：待驗證的網址字串。
  ///
  /// 合法範例：
  /// - `https://blog.naver.com/example/12345`
  /// - `https://m.blog.naver.com/example/12345`
  ///
  /// 回傳 `true` 表示為合法的 Naver Blog 網址，否則回傳 `false`。
  static bool isValid(String url) => _pattern.hasMatch(url);

  /// 將 Naver Blog 網址正規化為電腦版格式。
  ///
  /// 若 [url] 為手機版網址（`https://m.blog.naver.com/...`），
  /// 會將前綴替換為電腦版（`https://blog.naver.com/...`），
  /// 路徑與查詢參數保持不變。
  ///
  /// 若 [url] 已是電腦版或非 Naver Blog 網址，則原封回傳。
  ///
  /// - [url]：待正規化的網址字串。
  ///
  /// 回傳正規化後的網址字串。
  static String normalize(String url) {
    if (url.startsWith(_mobilePrefix)) {
      return '$_desktopPrefix${url.substring(_mobilePrefix.length)}';
    }
    return url;
  }
}
