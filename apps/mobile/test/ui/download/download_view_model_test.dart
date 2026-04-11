import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:naver_blog_image_downloader/data/models/photo_entity.dart';
import 'package:naver_blog_image_downloader/data/repositories/log_repository.dart';
import 'package:naver_blog_image_downloader/data/repositories/photo_repository.dart';
import 'package:naver_blog_image_downloader/ui/download/view_model/download_view_model.dart';

class MockPhotoRepository extends Mock implements PhotoRepository {}

class MockLogRepository extends Mock implements LogRepository {}

void main() {
  late MockPhotoRepository mockPhotoRepository;
  late MockLogRepository mockLogRepository;
  late ProviderContainer container;

  const testBlogId = 'test_blog_id';
  const testBlogUrl = 'https://blog.naver.com/test';

  final testPhotos = [
    const PhotoEntity(
      id: 'p1',
      url: 'https://example.com/p1.jpg',
      filename: 'p1.jpg',
    ),
    const PhotoEntity(
      id: 'p2',
      url: 'https://example.com/p2.jpg',
      filename: 'p2.jpg',
    ),
    const PhotoEntity(
      id: 'p3',
      url: 'https://example.com/p3.jpg',
      filename: 'p3.jpg',
    ),
  ];

  const successResult = DownloadBatchResult(successCount: 3, failedPhotos: []);

  setUp(() {
    mockPhotoRepository = MockPhotoRepository();
    mockLogRepository = MockLogRepository();
    container = ProviderContainer(
      overrides: [
        photoRepositoryProvider.overrideWithValue(mockPhotoRepository),
        logRepositoryProvider.overrideWithValue(mockLogRepository),
      ],
    );
    container.listen(downloadViewModelProvider, (_, _) {});
    addTearDown(container.dispose);
  });

  group('Download state properties - 初始狀態', () {
    test('completed 初始值為 0', () {
      final state = container.read(downloadViewModelProvider);
      expect(state.completed, 0);
    });

    test('total 初始值為 0', () {
      final state = container.read(downloadViewModelProvider);
      expect(state.total, 0);
    });

    test('isDownloading 初始值為 false', () {
      final state = container.read(downloadViewModelProvider);
      expect(state.isDownloading, isFalse);
    });

    test('downloadResult 初始值為 AsyncData(null)', () {
      final state = container.read(downloadViewModelProvider);
      expect(state.downloadResult, isA<AsyncData>());
      expect(state.downloadResult.value, isNull);
    });

    test('result 初始值為 null', () {
      final state = container.read(downloadViewModelProvider);
      expect(state.result, isNull);
    });

    test('progress 初始值為 0.0', () {
      final state = container.read(downloadViewModelProvider);
      expect(state.progress, 0.0);
    });
  });

  group('Progress calculation', () {
    test('total 為 0 時 progress 回傳 0.0（避免除以零）', () {
      // 初始狀態 total = 0
      final state = container.read(downloadViewModelProvider);
      expect(state.progress, 0.0);
    });

    test('total 大於 0 時 progress 回傳 completed / total', () async {
      // Arrange — 讓 downloadAllToCache 透過 onProgress 設定 completed/total
      double capturedProgress = 0.0;

      when(
        () => mockPhotoRepository.downloadAllToCache(
          photos: any(named: 'photos'),
          blogId: any(named: 'blogId'),
          blogUrl: any(named: 'blogUrl'),
          onProgress: any(named: 'onProgress'),
        ),
      ).thenAnswer((invocation) async {
        final onProgress =
            invocation.namedArguments[#onProgress] as void Function(int, int)?;
        onProgress?.call(1, 3);
        capturedProgress = container.read(downloadViewModelProvider).progress;
        onProgress?.call(2, 3);
        onProgress?.call(3, 3);
        return successResult;
      });

      // Act
      final notifier = container.read(downloadViewModelProvider.notifier);
      await notifier.startDownload(
        photos: testPhotos,
        blogId: testBlogId,
        blogUrl: testBlogUrl,
      );

      // Assert — 在 1/3 時 progress 應約為 0.333
      expect(capturedProgress, closeTo(1 / 3, 0.001));
      // 完成後 progress 為 1.0
      expect(
        container.read(downloadViewModelProvider).progress,
        closeTo(1.0, 0.001),
      );
    });
  });

  group('Start download with progress tracking', () {
    test('成功批次下載：狀態依序正確更新', () async {
      // Arrange
      final stateSnapshots = <DownloadViewModelState>[];

      when(
        () => mockPhotoRepository.downloadAllToCache(
          photos: any(named: 'photos'),
          blogId: any(named: 'blogId'),
          blogUrl: any(named: 'blogUrl'),
          onProgress: any(named: 'onProgress'),
        ),
      ).thenAnswer((invocation) async {
        final onProgress =
            invocation.namedArguments[#onProgress] as void Function(int, int)?;

        for (int i = 1; i <= testPhotos.length; i++) {
          onProgress?.call(i, testPhotos.length);
        }

        return successResult;
      });

      container.listen(downloadViewModelProvider, (prev, next) {
        stateSnapshots.add(next);
      });

      // Act
      final notifier = container.read(downloadViewModelProvider.notifier);
      await notifier.startDownload(
        photos: testPhotos,
        blogId: testBlogId,
        blogUrl: testBlogUrl,
      );

      // Assert
      // 第一次通知：isDownloading = true, total = 3, completed = 0, result = null
      expect(stateSnapshots[0].isDownloading, isTrue);
      expect(stateSnapshots[0].completed, 0);
      expect(stateSnapshots[0].total, 3);
      expect(stateSnapshots[0].result, isNull);

      // 中間通知：progress 更新
      expect(stateSnapshots[1].completed, 1);
      expect(stateSnapshots[2].completed, 2);
      expect(stateSnapshots[3].completed, 3);

      // 最後通知：isDownloading = false, result 有值
      final lastSnapshot = stateSnapshots.last;
      expect(lastSnapshot.isDownloading, isFalse);
      expect(lastSnapshot.result, isNotNull);
      expect(lastSnapshot.result!.successCount, 3);

      verify(
        () => mockPhotoRepository.downloadAllToCache(
          photos: testPhotos,
          blogId: testBlogId,
          blogUrl: testBlogUrl,
          onProgress: any(named: 'onProgress'),
        ),
      ).called(1);
    });

    test('下載前 isDownloading 設為 true、result 清為 null', () async {
      // Arrange
      bool isDownloadingBeforeCall = false;

      when(
        () => mockPhotoRepository.downloadAllToCache(
          photos: any(named: 'photos'),
          blogId: any(named: 'blogId'),
          blogUrl: any(named: 'blogUrl'),
          onProgress: any(named: 'onProgress'),
        ),
      ).thenAnswer((_) async {
        isDownloadingBeforeCall = container
            .read(downloadViewModelProvider)
            .isDownloading;
        return successResult;
      });

      // Act
      final notifier = container.read(downloadViewModelProvider.notifier);
      await notifier.startDownload(
        photos: testPhotos,
        blogId: testBlogId,
        blogUrl: testBlogUrl,
      );

      // Assert
      expect(isDownloadingBeforeCall, isTrue);
      expect(container.read(downloadViewModelProvider).isDownloading, isFalse);
    });

    test('下載完成後 result 持有 DownloadBatchResult', () async {
      // Arrange
      final expectedResult = DownloadBatchResult(
        successCount: 2,
        failedPhotos: [testPhotos[2]],
        errors: ['p3.jpg: Exception: fail'],
      );

      when(
        () => mockPhotoRepository.downloadAllToCache(
          photos: any(named: 'photos'),
          blogId: any(named: 'blogId'),
          blogUrl: any(named: 'blogUrl'),
          onProgress: any(named: 'onProgress'),
        ),
      ).thenAnswer((_) async => expectedResult);

      // Act
      final notifier = container.read(downloadViewModelProvider.notifier);
      await notifier.startDownload(
        photos: testPhotos,
        blogId: testBlogId,
        blogUrl: testBlogUrl,
      );

      // Assert
      final state = container.read(downloadViewModelProvider);
      expect(state.result, equals(expectedResult));
      expect(state.result!.successCount, 2);
      expect(state.result!.failureCount, 1);
    });

    test('duplicate download prevention：下載中再次呼叫 startDownload 時直接返回', () async {
      // Arrange
      final completer = Completer<DownloadBatchResult>();

      when(
        () => mockPhotoRepository.downloadAllToCache(
          photos: any(named: 'photos'),
          blogId: any(named: 'blogId'),
          blogUrl: any(named: 'blogUrl'),
          onProgress: any(named: 'onProgress'),
        ),
      ).thenAnswer((_) => completer.future);

      final notifier = container.read(downloadViewModelProvider.notifier);

      // Act — 啟動第一次下載（不完成）
      final firstCall = notifier.startDownload(
        photos: testPhotos,
        blogId: testBlogId,
        blogUrl: testBlogUrl,
      );

      // 下載中嘗試第二次呼叫
      await notifier.startDownload(
        photos: testPhotos,
        blogId: testBlogId,
        blogUrl: testBlogUrl,
      );

      // 完成第一次下載
      completer.complete(successResult);
      await firstCall;

      // Assert — downloadAllToCache 只被呼叫一次
      verify(
        () => mockPhotoRepository.downloadAllToCache(
          photos: any(named: 'photos'),
          blogId: any(named: 'blogId'),
          blogUrl: any(named: 'blogUrl'),
          onProgress: any(named: 'onProgress'),
        ),
      ).called(1);
    });

    test('total 設為照片清單長度', () async {
      // Arrange
      when(
        () => mockPhotoRepository.downloadAllToCache(
          photos: any(named: 'photos'),
          blogId: any(named: 'blogId'),
          blogUrl: any(named: 'blogUrl'),
          onProgress: any(named: 'onProgress'),
        ),
      ).thenAnswer((_) async => successResult);

      int? capturedTotal;
      container.listen(downloadViewModelProvider, (prev, next) {
        if (capturedTotal == null && next.isDownloading) {
          capturedTotal = next.total;
        }
      });

      // Act
      final notifier = container.read(downloadViewModelProvider.notifier);
      await notifier.startDownload(
        photos: testPhotos,
        blogId: testBlogId,
        blogUrl: testBlogUrl,
      );

      // Assert
      expect(capturedTotal, 3);
    });

    test('每次 progress 更新都觸發狀態變更', () async {
      // Arrange
      int stateChangeCount = 0;

      when(
        () => mockPhotoRepository.downloadAllToCache(
          photos: any(named: 'photos'),
          blogId: any(named: 'blogId'),
          blogUrl: any(named: 'blogUrl'),
          onProgress: any(named: 'onProgress'),
        ),
      ).thenAnswer((invocation) async {
        final onProgress =
            invocation.namedArguments[#onProgress] as void Function(int, int)?;
        onProgress?.call(1, 3);
        onProgress?.call(2, 3);
        onProgress?.call(3, 3);
        return successResult;
      });

      container.listen(downloadViewModelProvider, (prev, next) {
        stateChangeCount++;
      });

      // Act
      final notifier = container.read(downloadViewModelProvider.notifier);
      await notifier.startDownload(
        photos: testPhotos,
        blogId: testBlogId,
        blogUrl: testBlogUrl,
      );

      // Assert
      // 1 (start) + 3 (progress) + 1 (done) = 5
      expect(stateChangeCount, 5);
    });
  });

  group('DownloadState transitions - 狀態轉換', () {
    test('downloadResult 依序從 idle → downloading → completed 轉換', () async {
      // Arrange
      final stateTransitions = <DownloadViewModelState>[];

      when(
        () => mockPhotoRepository.downloadAllToCache(
          photos: any(named: 'photos'),
          blogId: any(named: 'blogId'),
          blogUrl: any(named: 'blogUrl'),
          onProgress: any(named: 'onProgress'),
        ),
      ).thenAnswer((invocation) async {
        final onProgress =
            invocation.namedArguments[#onProgress] as void Function(int, int)?;
        onProgress?.call(1, 3);
        onProgress?.call(2, 3);
        onProgress?.call(3, 3);
        return successResult;
      });

      // 記錄初始狀態
      stateTransitions.add(container.read(downloadViewModelProvider));

      container.listen(downloadViewModelProvider, (prev, next) {
        stateTransitions.add(next);
      });

      // Act
      final notifier = container.read(downloadViewModelProvider.notifier);
      await notifier.startDownload(
        photos: testPhotos,
        blogId: testBlogId,
        blogUrl: testBlogUrl,
      );

      // Assert
      // 初始: idle (AsyncData(null)) → 開始下載: downloading (AsyncLoading) → 進度更新 x3: downloading → 完成: completed (AsyncData(result))
      final first = stateTransitions.first;
      expect(first.downloadResult, isA<AsyncData>());
      expect(first.downloadResult.value, isNull);

      expect(
        stateTransitions.where((s) => s.isDownloading).length,
        4, // 1 (start) + 3 (progress)
      );

      final last = stateTransitions.last;
      expect(last.downloadResult, isA<AsyncData>());
      expect(last.downloadResult.value, isNotNull);
    });

    test('下載中 isDownloading 為 true', () async {
      // Arrange
      bool? isDownloadingDuringDownload;

      when(
        () => mockPhotoRepository.downloadAllToCache(
          photos: any(named: 'photos'),
          blogId: any(named: 'blogId'),
          blogUrl: any(named: 'blogUrl'),
          onProgress: any(named: 'onProgress'),
        ),
      ).thenAnswer((_) async {
        isDownloadingDuringDownload = container
            .read(downloadViewModelProvider)
            .isDownloading;
        return successResult;
      });

      // Act
      final notifier = container.read(downloadViewModelProvider.notifier);
      await notifier.startDownload(
        photos: testPhotos,
        blogId: testBlogId,
        blogUrl: testBlogUrl,
      );

      // Assert
      expect(isDownloadingDuringDownload, isTrue);
      final state = container.read(downloadViewModelProvider);
      expect(state.downloadResult, isA<AsyncData>());
      expect(state.downloadResult.value, isNotNull);
    });

    test('下載完成後 downloadResult 為 AsyncData 且值非 null', () async {
      // Arrange
      when(
        () => mockPhotoRepository.downloadAllToCache(
          photos: any(named: 'photos'),
          blogId: any(named: 'blogId'),
          blogUrl: any(named: 'blogUrl'),
          onProgress: any(named: 'onProgress'),
        ),
      ).thenAnswer((_) async => successResult);

      // Act
      final notifier = container.read(downloadViewModelProvider.notifier);
      await notifier.startDownload(
        photos: testPhotos,
        blogId: testBlogId,
        blogUrl: testBlogUrl,
      );

      // Assert
      final state = container.read(downloadViewModelProvider);
      expect(state.downloadResult, isA<AsyncData>());
      expect(state.downloadResult.value, isNotNull);
      expect(state.isDownloading, isFalse);
    });
  });
}
