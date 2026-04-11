import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:naver_blog_image_downloader/data/models/fetch_result.dart';
import 'package:naver_blog_image_downloader/data/models/photo_entity.dart';
import 'package:naver_blog_image_downloader/data/repositories/log_repository.dart';
import 'package:naver_blog_image_downloader/data/repositories/photo_repository.dart';
import 'package:naver_blog_image_downloader/ui/blog_input/view_model/blog_input_view_model.dart';

class MockPhotoRepository extends Mock implements PhotoRepository {}

class MockLogRepository extends Mock implements LogRepository {}

void main() {
  late MockPhotoRepository mockPhotoRepository;
  late MockLogRepository mockLogRepository;
  late ProviderContainer container;

  const testBlogUrl = 'https://blog.naver.com/test/12345';

  const testFetchResult = FetchResult(
    photos: [
      PhotoEntity(
        id: 'photo-1',
        url: 'https://example.com/photo1.jpg',
        filename: 'photo1.jpg',
      ),
    ],
    blogId: 'test-blog-id',
    blogUrl: 'https://blog.naver.com/test/12345',
    isFullyCached: false,
  );

  BlogInputState readState() => container.read(blogInputViewModelProvider);
  BlogInputViewModel readNotifier() =>
      container.read(blogInputViewModelProvider.notifier);

  setUp(() {
    mockPhotoRepository = MockPhotoRepository();
    mockLogRepository = MockLogRepository();
    container = ProviderContainer(
      overrides: [
        photoRepositoryProvider.overrideWithValue(mockPhotoRepository),
        logRepositoryProvider.overrideWithValue(mockLogRepository),
      ],
    );
    container.listen(blogInputViewModelProvider, (_, _) {});
    addTearDown(container.dispose);
  });

  group('URL input state management', () {
    test('初始狀態正確', () {
      final state = readState();
      expect(state.blogUrl, '');
      expect(state.isLoading, isFalse);
      expect(state.fetchResult, isA<AsyncData<FetchResult?>>());
      expect(state.fetchResult.value, isNull);
      expect(state.fetchResultValue, isNull);
    });

    test('onUrlChanged 更新 blogUrl 並通知 listeners', () {
      final states = <BlogInputState>[];
      container.listen(
        blogInputViewModelProvider,
        (prev, next) => states.add(next),
      );

      readNotifier().onUrlChanged(testBlogUrl);

      expect(readState().blogUrl, testBlogUrl);
      expect(states.length, 1);
    });

    test('onUrlChanged 清除 fetchResult 中的錯誤', () async {
      // 先產生一個 error（blogUrl 為空會設定 FetchException）
      await readNotifier().fetchPhotos();
      expect(readState().fetchResult, isA<AsyncError<FetchResult?>>());

      readNotifier().onUrlChanged(testBlogUrl);

      final state = readState();
      expect(state.fetchResult, isA<AsyncData<FetchResult?>>());
      expect(state.fetchResult.value, isNull);
    });
  });

  group('Mobile URL normalization', () {
    test('手機版 URL 正規化後再傳給 Repository', () async {
      const mobileUrl = 'https://m.blog.naver.com/edament/224238392216';
      const normalizedUrl = 'https://blog.naver.com/edament/224238392216';

      const mobileResult = FetchResult(
        photos: [
          PhotoEntity(
            id: 'photo-1',
            url: 'https://example.com/photo1.jpg',
            filename: 'photo1.jpg',
          ),
        ],
        blogId: 'mobile-blog-id',
        blogUrl: normalizedUrl,
        isFullyCached: false,
      );

      readNotifier().onUrlChanged(mobileUrl);

      // mock 使用正規化後的電腦版 URL
      when(
        () => mockPhotoRepository.fetchPhotos(
          normalizedUrl,
          onStatusChanged: any(named: 'onStatusChanged'),
        ),
      ).thenAnswer((_) async => mobileResult);

      await readNotifier().fetchPhotos();

      // 驗證 Repository 收到的是正規化後的電腦版 URL
      verify(
        () => mockPhotoRepository.fetchPhotos(
          normalizedUrl,
          onStatusChanged: any(named: 'onStatusChanged'),
        ),
      ).called(1);

      // 驗證不會使用原始手機版 URL 呼叫 Repository
      verifyNever(
        () => mockPhotoRepository.fetchPhotos(
          mobileUrl,
          onStatusChanged: any(named: 'onStatusChanged'),
        ),
      );

      expect(readState().fetchResult.value, mobileResult);
    });

    test('電腦版 URL 不變，直接傳給 Repository', () async {
      readNotifier().onUrlChanged(testBlogUrl);

      when(
        () => mockPhotoRepository.fetchPhotos(
          testBlogUrl,
          onStatusChanged: any(named: 'onStatusChanged'),
        ),
      ).thenAnswer((_) async => testFetchResult);

      await readNotifier().fetchPhotos();

      verify(
        () => mockPhotoRepository.fetchPhotos(
          testBlogUrl,
          onStatusChanged: any(named: 'onStatusChanged'),
        ),
      ).called(1);
    });
  });

  group('Empty URL validation', () {
    test('blogUrl 為空時設定 FetchException(emptyUrl) 且不呼叫 repository', () async {
      final states = <BlogInputState>[];
      container.listen(
        blogInputViewModelProvider,
        (prev, next) => states.add(next),
      );

      await readNotifier().fetchPhotos();

      final state = readState();
      expect(state.fetchResult, isA<AsyncError<FetchResult?>>());
      final error = (state.fetchResult as AsyncError).error;
      expect(error, isA<FetchException>());
      expect((error as FetchException).errorType, FetchErrorType.emptyUrl);
      expect(state.isLoading, isFalse);
      expect(states.length, 1);
      verifyNever(() => mockPhotoRepository.fetchPhotos(any()));
    });
  });

  group('Fetch photos with loading state', () {
    test('成功取得照片', () async {
      readNotifier().onUrlChanged(testBlogUrl);

      when(
        () => mockPhotoRepository.fetchPhotos(
          testBlogUrl,
          onStatusChanged: any(named: 'onStatusChanged'),
        ),
      ).thenAnswer((_) async => testFetchResult);

      await readNotifier().fetchPhotos();

      final state = readState();
      expect(state.isLoading, isFalse);
      expect(state.fetchResult.value, testFetchResult);
      expect(state.fetchResult, isA<AsyncData<FetchResult?>>());
      expect(state.fetchResult.value, isNotNull);
    });

    test('fetchPhotos 開始時 isLoading 設為 true', () async {
      readNotifier().onUrlChanged(testBlogUrl);

      bool wasLoadingDuringFetch = false;
      when(
        () => mockPhotoRepository.fetchPhotos(
          testBlogUrl,
          onStatusChanged: any(named: 'onStatusChanged'),
        ),
      ).thenAnswer((_) async {
        wasLoadingDuringFetch = readState().isLoading;
        return testFetchResult;
      });

      await readNotifier().fetchPhotos();

      expect(wasLoadingDuringFetch, isTrue);
      expect(readState().isLoading, isFalse);
    });

    test('取得照片失敗時 fetchResult 設為 AsyncError', () async {
      readNotifier().onUrlChanged(testBlogUrl);

      final exception = Exception('Network error');
      when(
        () => mockPhotoRepository.fetchPhotos(
          testBlogUrl,
          onStatusChanged: any(named: 'onStatusChanged'),
        ),
      ).thenThrow(exception);

      await readNotifier().fetchPhotos();

      final state = readState();
      expect(state.isLoading, isFalse);
      expect(state.fetchResult, isA<AsyncError<FetchResult?>>());
      final error = (state.fetchResult as AsyncError).error;
      expect(error, isA<FetchException>());
      expect((error as FetchException).errorType, FetchErrorType.unknown);
      expect(state.fetchResult.value, isNull);
    });

    test(
      'isLoading 為 true 時不重複呼叫 repository（duplicate fetch prevention）',
      () async {
        readNotifier().onUrlChanged(testBlogUrl);

        final completer = Completer<FetchResult>();

        when(
          () => mockPhotoRepository.fetchPhotos(
            testBlogUrl,
            onStatusChanged: any(named: 'onStatusChanged'),
          ),
        ).thenAnswer((_) => completer.future);

        // 同時觸發兩次 fetchPhotos
        final future1 = readNotifier().fetchPhotos();
        final future2 = readNotifier()
            .fetchPhotos(); // 應該立即回傳（isLoading 為 true）

        // 完成 future 後等待兩個 fetchPhotos 結束
        completer.complete(testFetchResult);
        await Future.wait([future1, future2]);

        // repository 只被呼叫一次
        verify(
          () => mockPhotoRepository.fetchPhotos(
            testBlogUrl,
            onStatusChanged: any(named: 'onStatusChanged'),
          ),
        ).called(1);
      },
    );

    test('通知 listeners 在 loading 開始和結束時各一次（加上 URL 變更）', () async {
      final states = <BlogInputState>[];
      container.listen(
        blogInputViewModelProvider,
        (prev, next) => states.add(next),
      );

      readNotifier().onUrlChanged(testBlogUrl);

      when(
        () => mockPhotoRepository.fetchPhotos(
          testBlogUrl,
          onStatusChanged: any(named: 'onStatusChanged'),
        ),
      ).thenAnswer((_) async => testFetchResult);

      await readNotifier().fetchPhotos();

      // onUrlChanged: 1 次, fetchPhotos: loading=true 1 次 + 完成 1 次 = 共 3 次
      expect(states.length, 3);
      expect(states[0].isLoading, isFalse); // onUrlChanged 時 isLoading 仍為 false
      expect(states[1].isLoading, isTrue); // fetchPhotos 開始 loading
      expect(states[2].isLoading, isFalse); // fetchPhotos 完成
    });
  });

  group('Reset state', () {
    test('reset 清除 fetchResult 並將 fetchResult 重設為初始值', () async {
      // 先取得一個成功結果
      readNotifier().onUrlChanged(testBlogUrl);
      when(
        () => mockPhotoRepository.fetchPhotos(
          testBlogUrl,
          onStatusChanged: any(named: 'onStatusChanged'),
        ),
      ).thenAnswer((_) async => testFetchResult);
      await readNotifier().fetchPhotos();
      expect(readState().fetchResult.value, isNotNull);

      final states = <BlogInputState>[];
      container.listen(
        blogInputViewModelProvider,
        (prev, next) => states.add(next),
      );

      readNotifier().reset();

      final state = readState();
      expect(state.fetchResult.value, isNull);
      expect(state.fetchResult, isA<AsyncData<FetchResult?>>());
      expect(states.length, 1);
    });

    test('reset 後仍可重新 fetchPhotos', () async {
      readNotifier().onUrlChanged(testBlogUrl);
      when(
        () => mockPhotoRepository.fetchPhotos(
          testBlogUrl,
          onStatusChanged: any(named: 'onStatusChanged'),
        ),
      ).thenAnswer((_) async => testFetchResult);

      await readNotifier().fetchPhotos();
      readNotifier().reset();
      expect(readState().fetchResult.value, isNull);

      await readNotifier().fetchPhotos();
      expect(readState().fetchResult.value, testFetchResult);
      verify(
        () => mockPhotoRepository.fetchPhotos(
          testBlogUrl,
          onStatusChanged: any(named: 'onStatusChanged'),
        ),
      ).called(2);
    });

    test('reset 清除 fetchResult 中的錯誤', () async {
      readNotifier().onUrlChanged(testBlogUrl);
      final exception = Exception('Some error');
      when(
        () => mockPhotoRepository.fetchPhotos(
          testBlogUrl,
          onStatusChanged: any(named: 'onStatusChanged'),
        ),
      ).thenThrow(exception);

      await readNotifier().fetchPhotos();
      expect(readState().fetchResult, isA<AsyncError<FetchResult?>>());

      readNotifier().reset();
      final state = readState();
      expect(state.fetchResult, isA<AsyncData<FetchResult?>>());
      expect(state.fetchResult.value, isNull);
    });
  });

  group('BlogInputState 狀態轉換', () {
    test('初始 fetchResult 為 AsyncData(null)', () {
      final state = readState();
      expect(state.fetchResult, isA<AsyncData<FetchResult?>>());
      expect(state.fetchResult.value, isNull);
    });

    test('fetchPhotos 執行中 fetchResult 轉為 AsyncLoading', () async {
      readNotifier().onUrlChanged(testBlogUrl);

      BlogInputState? stateDuringFetch;
      when(
        () => mockPhotoRepository.fetchPhotos(
          testBlogUrl,
          onStatusChanged: any(named: 'onStatusChanged'),
        ),
      ).thenAnswer((_) async {
        stateDuringFetch = readState();
        return testFetchResult;
      });

      await readNotifier().fetchPhotos();

      expect(stateDuringFetch, isNotNull);
      expect(stateDuringFetch!.fetchResult, isA<AsyncLoading<FetchResult?>>());
      expect(stateDuringFetch!.loadingPhase, FetchLoadingPhase.submitting);
    });

    test('fetchPhotos 成功後 fetchResult 轉為 AsyncData 且值非 null', () async {
      readNotifier().onUrlChanged(testBlogUrl);

      when(
        () => mockPhotoRepository.fetchPhotos(
          testBlogUrl,
          onStatusChanged: any(named: 'onStatusChanged'),
        ),
      ).thenAnswer((_) async => testFetchResult);

      await readNotifier().fetchPhotos();

      final state = readState();
      expect(state.fetchResult, isA<AsyncData<FetchResult?>>());
      expect(state.fetchResult.value, testFetchResult);
    });

    test('fetchPhotos 失敗後 fetchResult 轉為 AsyncError', () async {
      readNotifier().onUrlChanged(testBlogUrl);

      final exception = Exception('Network error');
      when(
        () => mockPhotoRepository.fetchPhotos(
          testBlogUrl,
          onStatusChanged: any(named: 'onStatusChanged'),
        ),
      ).thenThrow(exception);

      await readNotifier().fetchPhotos();

      final state = readState();
      expect(state.fetchResult, isA<AsyncError<FetchResult?>>());
      final error = (state.fetchResult as AsyncError).error;
      expect(error, isA<FetchException>());
      expect((error as FetchException).errorType, FetchErrorType.unknown);
    });

    test(
      'blogUrl 為空時 fetchPhotos 將 fetchResult 設為 AsyncError(emptyUrl)',
      () async {
        // blogUrl 預設為空字串
        await readNotifier().fetchPhotos();

        final state = readState();
        expect(state.fetchResult, isA<AsyncError<FetchResult?>>());
        final error = (state.fetchResult as AsyncError).error;
        expect(error, isA<FetchException>());
        expect((error as FetchException).errorType, FetchErrorType.emptyUrl);
      },
    );

    test('onUrlChanged 將 fetchResult 重設為 AsyncData(null)', () async {
      // 先讓 fetchResult 進入 AsyncError 狀態
      await readNotifier().fetchPhotos();
      expect(readState().fetchResult, isA<AsyncError<FetchResult?>>());

      readNotifier().onUrlChanged(testBlogUrl);

      final state = readState();
      expect(state.fetchResult, isA<AsyncData<FetchResult?>>());
      expect(state.fetchResult.value, isNull);
    });

    test('reset 將 fetchResult 重設為 AsyncData(null)', () async {
      readNotifier().onUrlChanged(testBlogUrl);

      when(
        () => mockPhotoRepository.fetchPhotos(
          testBlogUrl,
          onStatusChanged: any(named: 'onStatusChanged'),
        ),
      ).thenAnswer((_) async => testFetchResult);

      await readNotifier().fetchPhotos();
      expect(readState().fetchResult.value, isNotNull);

      readNotifier().reset();

      final state = readState();
      expect(state.fetchResult, isA<AsyncData<FetchResult?>>());
      expect(state.fetchResult.value, isNull);
    });

    test(
      'fetchResult 完整轉換流程：AsyncData(null) → AsyncLoading → AsyncData(result) → reset → AsyncData(null)',
      () async {
        // 1. 初始為 AsyncData(null)
        expect(readState().fetchResult, isA<AsyncData<FetchResult?>>());
        expect(readState().fetchResult.value, isNull);

        readNotifier().onUrlChanged(testBlogUrl);

        final states = <BlogInputState>[];
        container.listen(
          blogInputViewModelProvider,
          (prev, next) => states.add(next),
        );

        when(
          () => mockPhotoRepository.fetchPhotos(
            testBlogUrl,
            onStatusChanged: any(named: 'onStatusChanged'),
          ),
        ).thenAnswer((_) async => testFetchResult);

        // 2. 執行 fetch
        await readNotifier().fetchPhotos();

        // 3. reset
        readNotifier().reset();

        // 驗證轉換順序：AsyncLoading → AsyncData(result) → AsyncData(null)
        expect(states.length, 3);
        expect(states[0].fetchResult, isA<AsyncLoading<FetchResult?>>());
        expect(states[1].fetchResult, isA<AsyncData<FetchResult?>>());
        expect(states[1].fetchResult.value, testFetchResult);
        expect(states[2].fetchResult, isA<AsyncData<FetchResult?>>());
        expect(states[2].fetchResult.value, isNull);
      },
    );
  });
}
