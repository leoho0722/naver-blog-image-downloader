import 'package:flutter_test/flutter_test.dart';
import 'package:naver_blog_image_downloader/data/services/api_service.dart';

void main() {
  group('ApiServiceException', () {
    test('isRetryable 在 502 時為 true', () {
      const exception = ApiServiceException('error', statusCode: 502);
      expect(exception.isRetryable, isTrue);
    });

    test('isRetryable 在 503 時為 true', () {
      const exception = ApiServiceException('error', statusCode: 503);
      expect(exception.isRetryable, isTrue);
    });

    test('isRetryable 在 504 時為 true', () {
      const exception = ApiServiceException('error', statusCode: 504);
      expect(exception.isRetryable, isTrue);
    });

    test('isRetryable 在 500 時為 false', () {
      const exception = ApiServiceException('error', statusCode: 500);
      expect(exception.isRetryable, isFalse);
    });

    test('isRetryable 在 400 時為 false', () {
      const exception = ApiServiceException('error', statusCode: 400);
      expect(exception.isRetryable, isFalse);
    });

    test('isRetryable 在無 statusCode 時為 false', () {
      const exception = ApiServiceException('error');
      expect(exception.isRetryable, isFalse);
    });

    test('toString 回傳 message', () {
      const exception = ApiServiceException('伺服器錯誤（503）', statusCode: 503);
      expect(exception.toString(), '伺服器錯誤（503）');
    });
  });
}
