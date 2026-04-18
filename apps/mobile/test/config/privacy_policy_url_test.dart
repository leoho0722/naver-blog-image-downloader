import 'package:flutter_test/flutter_test.dart';
import 'package:naver_blog_image_downloader/config/privacy_policy_url.dart';

/// 隱私政策 URL 常數的單元測試。
///
/// 目標：避免未來有人因誤改 domain、path、協定而讓 App 指向錯誤頁面。
/// 只要常數值被改動，這個測試就會失敗，提醒修改者一併確認：
///   1. Web 端 `/privacy` 是否確實部署在此 URL 下
///   2. App Store / Google Play 審查頁面的 Privacy Policy URL 欄位是否同步更新
void main() {
  group('privacyPolicyUrl', () {
    test('值為 Web 版 canonical URL', () {
      expect(
        privacyPolicyUrl,
        'https://leoho0722.github.io/naver-blog-image-downloader/privacy',
      );
    });

    test('使用 https 協定（商店審查與平台安全要求）', () {
      expect(privacyPolicyUrl.startsWith('https://'), isTrue);
    });

    test('結尾路徑為 /privacy（與 Web 路由對齊）', () {
      expect(privacyPolicyUrl.endsWith('/privacy'), isTrue);
    });

    test('可被 Uri.parse 解析且 host 正確', () {
      final uri = Uri.parse(privacyPolicyUrl);
      expect(uri.scheme, 'https');
      expect(uri.host, 'leoho0722.github.io');
      expect(uri.path, '/naver-blog-image-downloader/privacy');
    });
  });
}
