import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:naver_blog_image_downloader/data/models/blog_cache_metadata.dart';
import 'package:naver_blog_image_downloader/data/models/dtos/job_status_response.dart';
import 'package:naver_blog_image_downloader/data/models/dtos/photo_download_response.dart';
import 'package:naver_blog_image_downloader/data/models/fetch_result.dart';
import 'package:naver_blog_image_downloader/data/models/photo_entity.dart';
import 'package:naver_blog_image_downloader/data/repositories/cache_repository.dart';
import 'package:naver_blog_image_downloader/data/repositories/photo_repository.dart';
import 'package:naver_blog_image_downloader/data/services/api_service.dart';
import 'package:naver_blog_image_downloader/data/services/file_download_service.dart';
import 'package:naver_blog_image_downloader/data/services/photo_service.dart';
import 'package:naver_blog_image_downloader/ui/core/app_error.dart';

class MockApiService extends Mock implements ApiService {}

class MockFileDownloadService extends Mock implements FileDownloadService {}

class MockPhotoService extends Mock implements PhotoService {}

class MockCacheRepository extends Mock implements CacheRepository {}

class FakeBlogCacheMetadata extends Fake implements BlogCacheMetadata {}

class FakeFile extends Fake implements File {
  final String _path;
  FakeFile([String? path]) : _path = path ?? '/tmp/fake_file';

  @override
  String get path => _path;
}

class FakeDirectory extends Fake implements Directory {
  final String _path;
  FakeDirectory(this._path);

  @override
  String get path => _path;

  @override
  Directory get parent =>
      FakeDirectory(path.substring(0, path.lastIndexOf('/')));
}

void main() {
  late MockApiService mockApiService;
  late MockFileDownloadService mockFileDownloadService;
  late MockPhotoService mockPhotoService;
  late MockCacheRepository mockCacheRepository;
  late PhotoRepository repository;

  const testBlogId = 'abc123def456ghij';

  setUpAll(() {
    registerFallbackValue(FakeBlogCacheMetadata());
    registerFallbackValue(FakeFile());
  });

  setUp(() {
    mockApiService = MockApiService();
    mockFileDownloadService = MockFileDownloadService();
    mockPhotoService = MockPhotoService();
    mockCacheRepository = MockCacheRepository();
    repository = PhotoRepository(
      apiService: mockApiService,
      fileDownloadService: mockFileDownloadService,
      photoService: mockPhotoService,
      cacheRepository: mockCacheRepository,
    );
  });

  group('PhotoRepository construction', () {
    test('建構函式接受四個依賴並成功建立實例', () {
      expect(repository, isNotNull);
    });
  });

  group('fetchPhotos（非同步任務模式）', () {
    const testBlogUrlWithPath = 'https://blog.naver.com/test/12345';
    const testJobId = 'job-uuid-123';

    JobStatusResponse completedStatus({
      List<String> imageUrls = const [],
      List<String> errors = const [],
    }) => JobStatusResponse(
      jobId: testJobId,
      status: JobStatus.completed,
      result: PhotoDownloadResponse(
        totalImages: imageUrls.length,
        successfulDownloads: imageUrls.length - errors.length,
        failureDownloads: errors.length,
        imageUrls: imageUrls,
        errors: errors,
        elapsedTime: 1.0,
      ),
    );

    void setupSubmitJob() {
      when(
        () => mockCacheRepository.blogId(testBlogUrlWithPath),
      ).thenReturn(testBlogId);
      when(
        () => mockCacheRepository.metadata(testBlogId),
      ).thenAnswer((_) async => null);
      when(
        () => mockApiService.submitJob(testBlogUrlWithPath),
      ).thenAnswer((_) async => testJobId);
    }

    test('任務完成時回傳照片列表', () async {
      setupSubmitJob();
      when(() => mockApiService.checkJobStatus(testJobId)).thenAnswer(
        (_) async => completedStatus(
          imageUrls: [
            'https://example.com/photo1.jpg',
            'https://example.com/photo2.jpg',
          ],
        ),
      );
      when(
        () => mockCacheRepository.isBlogFullyCached(testBlogId, any()),
      ).thenAnswer((_) async => false);

      final result = await repository.fetchPhotos(testBlogUrlWithPath);

      expect(result.photos.length, 2);
      expect(result.blogId, testBlogId);
      expect(result.fetchErrors, isEmpty);
    });

    test('任務完成但部分圖片擷取失敗時，fetchErrors 包含錯誤訊息', () async {
      setupSubmitJob();
      when(() => mockApiService.checkJobStatus(testJobId)).thenAnswer(
        (_) async => completedStatus(
          imageUrls: ['https://example.com/photo1.jpg'],
          errors: ['第2張圖片無法擷取'],
        ),
      );
      when(
        () => mockCacheRepository.isBlogFullyCached(testBlogId, any()),
      ).thenAnswer((_) async => false);

      final result = await repository.fetchPhotos(testBlogUrlWithPath);

      expect(result.photos.length, 1);
      expect(result.fetchErrors, ['第2張圖片無法擷取']);
    });

    test('submitJob 失敗時拋出例外', () async {
      when(
        () => mockCacheRepository.blogId(testBlogUrlWithPath),
      ).thenReturn(testBlogId);
      when(
        () => mockCacheRepository.metadata(testBlogId),
      ).thenAnswer((_) async => null);
      when(
        () => mockApiService.submitJob(testBlogUrlWithPath),
      ).thenThrow(const ApiServiceException('伺服器錯誤（500）', statusCode: 500));

      expect(
        () => repository.fetchPhotos(testBlogUrlWithPath),
        throwsA(isA<ApiServiceException>()),
      );
    });

    test('任務失敗時拋出含錯誤訊息的例外', () async {
      setupSubmitJob();
      when(() => mockApiService.checkJobStatus(testJobId)).thenAnswer(
        (_) async => const JobStatusResponse(
          jobId: testJobId,
          status: JobStatus.failed,
          result: PhotoDownloadResponse(
            totalImages: 0,
            successfulDownloads: 0,
            failureDownloads: 1,
            imageUrls: [],
            errors: ['等待圖片元素超時'],
            elapsedTime: 10.0,
          ),
        ),
      );

      try {
        await repository.fetchPhotos(testBlogUrlWithPath);
        fail('應拋出例外');
      } on AppError catch (appError) {
        expect(appError.type, AppErrorType.serverError);
        expect(appError.toString(), contains('等待圖片元素超時'));
      }
    });
  });

  group('fetchPhotos（快取優先檢查）', () {
    const testBlogUrlWithPath = 'https://blog.naver.com/test/12345';
    const testFilenames = ['0_photo1.jpg', '1_photo2.jpg'];

    test('metadata 存在且完整快取時，不呼叫 API 並回傳 isFullyCached=true', () async {
      when(
        () => mockCacheRepository.blogId(testBlogUrlWithPath),
      ).thenReturn(testBlogId);
      when(() => mockCacheRepository.metadata(testBlogId)).thenAnswer(
        (_) async => BlogCacheMetadata(
          blogId: testBlogId,
          blogUrl: testBlogUrlWithPath,
          photoCount: 2,
          downloadedAt: DateTime(2026),
          isSavedToGallery: false,
          filenames: testFilenames,
        ),
      );
      when(
        () => mockCacheRepository.isBlogFullyCached(testBlogId, testFilenames),
      ).thenAnswer((_) async => true);

      final result = await repository.fetchPhotos(testBlogUrlWithPath);

      expect(result.isFullyCached, isTrue);
      expect(result.photos.length, 2);
      expect(result.photos[0].filename, '0_photo1.jpg');
      expect(result.photos[1].filename, '1_photo2.jpg');
      expect(result.blogId, testBlogId);

      // 不應呼叫 API
      verifyNever(() => mockApiService.submitJob(any()));
      verifyNever(() => mockApiService.checkJobStatus(any()));
    });

    test('metadata 不存在時，走正常 API 流程', () async {
      when(
        () => mockCacheRepository.blogId(testBlogUrlWithPath),
      ).thenReturn(testBlogId);
      when(
        () => mockCacheRepository.metadata(testBlogId),
      ).thenAnswer((_) async => null);
      when(
        () => mockApiService.submitJob(testBlogUrlWithPath),
      ).thenAnswer((_) async => 'job-123');
      when(() => mockApiService.checkJobStatus('job-123')).thenAnswer(
        (_) async => const JobStatusResponse(
          jobId: 'job-123',
          status: JobStatus.completed,
          result: PhotoDownloadResponse(
            totalImages: 1,
            successfulDownloads: 1,
            failureDownloads: 0,
            imageUrls: ['https://example.com/photo.jpg'],
            errors: [],
            elapsedTime: 1.0,
          ),
        ),
      );
      when(
        () => mockCacheRepository.isBlogFullyCached(testBlogId, any()),
      ).thenAnswer((_) async => false);

      final result = await repository.fetchPhotos(testBlogUrlWithPath);

      expect(result, isA<FetchResult>());
      verify(() => mockApiService.submitJob(testBlogUrlWithPath)).called(1);
    });

    test('metadata 存在但快取不完整時，走正常 API 流程', () async {
      when(
        () => mockCacheRepository.blogId(testBlogUrlWithPath),
      ).thenReturn(testBlogId);
      when(() => mockCacheRepository.metadata(testBlogId)).thenAnswer(
        (_) async => BlogCacheMetadata(
          blogId: testBlogId,
          blogUrl: testBlogUrlWithPath,
          photoCount: 2,
          downloadedAt: DateTime(2026),
          isSavedToGallery: false,
          filenames: testFilenames,
        ),
      );
      when(
        () => mockCacheRepository.isBlogFullyCached(testBlogId, testFilenames),
      ).thenAnswer((_) async => false);
      when(
        () => mockApiService.submitJob(testBlogUrlWithPath),
      ).thenAnswer((_) async => 'job-123');
      when(() => mockApiService.checkJobStatus('job-123')).thenAnswer(
        (_) async => const JobStatusResponse(
          jobId: 'job-123',
          status: JobStatus.completed,
          result: PhotoDownloadResponse(
            totalImages: 1,
            successfulDownloads: 1,
            failureDownloads: 0,
            imageUrls: ['https://example.com/photo.jpg'],
            errors: [],
            elapsedTime: 1.0,
          ),
        ),
      );
      when(
        () => mockCacheRepository.isBlogFullyCached(testBlogId, any()),
      ).thenAnswer((_) async => false);

      final result = await repository.fetchPhotos(testBlogUrlWithPath);

      expect(result, isA<FetchResult>());
      verify(() => mockApiService.submitJob(testBlogUrlWithPath)).called(1);
    });
  });

  group('downloadAllToCache', () {
    const testBlogUrl = 'https://blog.naver.com/test';
    final tempCacheDir = Directory('/tmp/cache');

    tearDown(() async {
      if (await tempCacheDir.exists()) {
        await tempCacheDir.delete(recursive: true);
      }
    });

    PhotoEntity makePhoto(String id) => PhotoEntity(
      id: id,
      url: 'https://example.com/$id.jpg',
      filename: '$id.jpg',
    );

    /// 設定共用 mock：evictIfNeeded、cacheDirectory
    void setupBaseMocks() {
      when(() => mockCacheRepository.evictIfNeeded()).thenAnswer((_) async {});
      when(
        () => mockCacheRepository.cacheDirectory(testBlogId),
      ).thenAnswer((_) async => FakeDirectory('/tmp/cache/blogs/$testBlogId'));
      when(
        () => mockCacheRepository.updateMetadata(any()),
      ).thenAnswer((_) async {});
    }

    /// 設定照片未快取的 mock
    void setupNotCached(String filename) {
      when(
        () => mockCacheRepository.cachedFile(filename, testBlogId),
      ).thenAnswer((_) async => null);
    }

    /// 設定照片已快取的 mock
    void setupCached(String filename) {
      when(
        () => mockCacheRepository.cachedFile(filename, testBlogId),
      ).thenAnswer((_) async => File('/tmp/cache/blogs/$testBlogId/$filename'));
    }

    /// 設定下載成功的 mock（在 tempPath 建立真實檔案以通過 length() 檢查）
    void setupDownloadSuccess(String url, String filename) {
      when(() => mockFileDownloadService.downloadFile(url, any())).thenAnswer((
        invocation,
      ) async {
        final savePath = invocation.positionalArguments[1] as String;
        final file = File(savePath);
        await file.parent.create(recursive: true);
        await file.writeAsBytes([0xFF, 0xD8]);
        return savePath;
      });
      when(
        () => mockCacheRepository.storeFile(any(), filename, testBlogId),
      ).thenAnswer((_) async => File('/tmp/cache/blogs/$testBlogId/$filename'));
    }

    group('1. Cache eviction before download', () {
      test('1.2 evictIfNeeded 在下載前被呼叫', () async {
        // Arrange
        setupBaseMocks();
        final photos = [makePhoto('p1')];
        setupNotCached('p1.jpg');
        setupDownloadSuccess('https://example.com/p1.jpg', 'p1.jpg');

        // Act
        await repository.downloadAllToCache(
          photos: photos,
          blogId: testBlogId,
          blogUrl: testBlogUrl,
        );

        // Assert
        verify(() => mockCacheRepository.evictIfNeeded()).called(1);
      });
    });

    group('2. Parallel download with concurrency limit', () {
      test('2.2 少於 4 張照片時全部並行處理', () async {
        // Arrange
        setupBaseMocks();
        final photos = [makePhoto('p1'), makePhoto('p2')];
        for (final photo in photos) {
          setupNotCached(photo.filename);
          setupDownloadSuccess(photo.url, photo.filename);
        }

        // Act
        final result = await repository.downloadAllToCache(
          photos: photos,
          blogId: testBlogId,
          blogUrl: testBlogUrl,
        );

        // Assert — 兩張照片都成功下載
        expect(result.successCount, 2);
        expect(result.failedPhotos, isEmpty);
      });

      test('2.2 驗證 10 張照片全部被處理（並行度限制不影響最終結果）', () async {
        // Arrange
        setupBaseMocks();
        final photos = List.generate(10, (i) => makePhoto('p$i'));
        for (final photo in photos) {
          setupNotCached(photo.filename);
          setupDownloadSuccess(photo.url, photo.filename);
        }

        // Act
        final result = await repository.downloadAllToCache(
          photos: photos,
          blogId: testBlogId,
          blogUrl: testBlogUrl,
        );

        // Assert
        expect(result.successCount, 10);
        expect(result.failedPhotos, isEmpty);
        expect(result.failureCount, 0);
      });
    });

    group('3. Cache skip logic', () {
      test('3.2 已快取檔案被跳過、未快取檔案進行下載', () async {
        // Arrange
        setupBaseMocks();
        final photos = [makePhoto('cached'), makePhoto('fresh')];
        setupCached('cached.jpg');
        setupNotCached('fresh.jpg');
        setupDownloadSuccess('https://example.com/fresh.jpg', 'fresh.jpg');

        // Act
        final result = await repository.downloadAllToCache(
          photos: photos,
          blogId: testBlogId,
          blogUrl: testBlogUrl,
        );

        // Assert
        expect(result.successCount, 1);
        expect(result.skippedCount, 1);
        expect(result.failedPhotos, isEmpty);
        // 未對已快取檔案呼叫 downloadFile
        verifyNever(
          () => mockFileDownloadService.downloadFile(
            'https://example.com/cached.jpg',
            any(),
          ),
        );
        // 對未快取檔案呼叫 downloadFile
        verify(
          () => mockFileDownloadService.downloadFile(
            'https://example.com/fresh.jpg',
            any(),
          ),
        ).called(1);
      });
    });

    group('4. Download and store flow', () {
      test('4.2 下載成功後呼叫 storeFile 存入快取', () async {
        // Arrange
        setupBaseMocks();
        final photos = [makePhoto('dl')];
        setupNotCached('dl.jpg');
        setupDownloadSuccess('https://example.com/dl.jpg', 'dl.jpg');

        // Act
        final result = await repository.downloadAllToCache(
          photos: photos,
          blogId: testBlogId,
          blogUrl: testBlogUrl,
        );

        // Assert
        expect(result.successCount, 1);
        verify(
          () => mockFileDownloadService.downloadFile(
            'https://example.com/dl.jpg',
            any(),
          ),
        ).called(1);
        verify(
          () => mockCacheRepository.storeFile(any(), 'dl.jpg', testBlogId),
        ).called(1);
      });
    });

    group('5. Progress callback', () {
      test('5.2 回呼次數與參數正確', () async {
        // Arrange
        setupBaseMocks();
        final photos = [makePhoto('a'), makePhoto('b'), makePhoto('c')];
        // a 已快取、b 和 c 未快取
        setupCached('a.jpg');
        setupNotCached('b.jpg');
        setupNotCached('c.jpg');
        setupDownloadSuccess('https://example.com/b.jpg', 'b.jpg');
        setupDownloadSuccess('https://example.com/c.jpg', 'c.jpg');

        final progressCalls = <(int, int)>[];

        // Act
        await repository.downloadAllToCache(
          photos: photos,
          blogId: testBlogId,
          blogUrl: testBlogUrl,
          onProgress: (completed, total) {
            progressCalls.add((completed, total));
          },
        );

        // Assert — 3 次回呼，total 始終為 3
        expect(progressCalls.length, 3);
        for (final call in progressCalls) {
          expect(call.$2, 3); // total 始終為 3
        }
        // 最終 completed 值應為 3
        expect(progressCalls.last.$1, 3);
      });

      test('5.2 未提供回呼時不報錯', () async {
        // Arrange
        setupBaseMocks();
        final photos = [makePhoto('x')];
        setupNotCached('x.jpg');
        setupDownloadSuccess('https://example.com/x.jpg', 'x.jpg');

        // Act & Assert — 不拋出例外
        final result = await repository.downloadAllToCache(
          photos: photos,
          blogId: testBlogId,
          blogUrl: testBlogUrl,
          // 不提供 onProgress
        );
        expect(result.successCount, 1);
      });
    });

    group('6. Single failure does not abort batch', () {
      test('6.2 單一失敗不影響其他照片的下載', () async {
        // Arrange
        setupBaseMocks();
        final photos = [makePhoto('ok1'), makePhoto('fail'), makePhoto('ok2')];
        setupNotCached('ok1.jpg');
        setupNotCached('fail.jpg');
        setupNotCached('ok2.jpg');
        setupDownloadSuccess('https://example.com/ok1.jpg', 'ok1.jpg');
        setupDownloadSuccess('https://example.com/ok2.jpg', 'ok2.jpg');

        // 第二張照片下載失敗
        when(
          () => mockFileDownloadService.downloadFile(
            'https://example.com/fail.jpg',
            any(),
          ),
        ).thenThrow(Exception('Download failed'));

        // Act
        final result = await repository.downloadAllToCache(
          photos: photos,
          blogId: testBlogId,
          blogUrl: testBlogUrl,
        );

        // Assert
        expect(result.successCount, 2);
        expect(result.failureCount, 1);
        expect(result.failedPhotos.length, 1);
        expect(result.failedPhotos.first.id, 'fail');
        expect(result.errors.length, 1);
        expect(result.errors.first, contains('fail.jpg'));
      });
    });

    group('7. Metadata update after completion', () {
      test('7.2 即使部分失敗也會更新 metadata', () async {
        // Arrange
        setupBaseMocks();
        final photos = [makePhoto('good'), makePhoto('bad')];
        setupNotCached('good.jpg');
        setupNotCached('bad.jpg');
        setupDownloadSuccess('https://example.com/good.jpg', 'good.jpg');
        when(
          () => mockFileDownloadService.downloadFile(
            'https://example.com/bad.jpg',
            any(),
          ),
        ).thenThrow(Exception('fail'));

        // Act
        await repository.downloadAllToCache(
          photos: photos,
          blogId: testBlogId,
          blogUrl: testBlogUrl,
        );

        // Assert — updateMetadata 一定被呼叫
        verify(() => mockCacheRepository.updateMetadata(any())).called(1);
      });

      test('7.1 metadata 內容包含正確的 blogId、照片數量與檔案列表', () async {
        // Arrange
        setupBaseMocks();
        final photos = [makePhoto('m1'), makePhoto('m2')];
        setupNotCached('m1.jpg');
        setupNotCached('m2.jpg');
        setupDownloadSuccess('https://example.com/m1.jpg', 'm1.jpg');
        setupDownloadSuccess('https://example.com/m2.jpg', 'm2.jpg');

        BlogCacheMetadata? capturedMetadata;
        when(() => mockCacheRepository.updateMetadata(any())).thenAnswer((
          invocation,
        ) async {
          capturedMetadata =
              invocation.positionalArguments[0] as BlogCacheMetadata;
        });

        // Act
        await repository.downloadAllToCache(
          photos: photos,
          blogId: testBlogId,
          blogUrl: testBlogUrl,
        );

        // Assert
        expect(capturedMetadata, isNotNull);
        expect(capturedMetadata!.blogId, testBlogId);
        expect(capturedMetadata!.blogUrl, testBlogUrl);
        expect(capturedMetadata!.photoCount, 2);
        expect(capturedMetadata!.filenames, ['m1.jpg', 'm2.jpg']);
        expect(capturedMetadata!.isSavedToGallery, isFalse);
      });
    });

    group('8. DownloadBatchResult return value', () {
      test('8.2 全部成功時的結果', () async {
        // Arrange
        setupBaseMocks();
        final photos = [makePhoto('s1'), makePhoto('s2'), makePhoto('s3')];
        for (final photo in photos) {
          setupNotCached(photo.filename);
          setupDownloadSuccess(photo.url, photo.filename);
        }

        // Act
        final result = await repository.downloadAllToCache(
          photos: photos,
          blogId: testBlogId,
          blogUrl: testBlogUrl,
        );

        // Assert
        expect(result.successCount, 3);
        expect(result.failureCount, 0);
        expect(result.skippedCount, 0);
        expect(result.errors, isEmpty);
        expect(result.isAllSuccessful, isTrue);
      });

      test('8.2 混合結果（成功、失敗、跳過）', () async {
        // Arrange
        setupBaseMocks();
        final photos = [
          makePhoto('success'),
          makePhoto('skipped'),
          makePhoto('failed'),
        ];
        setupNotCached('success.jpg');
        setupCached('skipped.jpg');
        setupNotCached('failed.jpg');
        setupDownloadSuccess('https://example.com/success.jpg', 'success.jpg');
        when(
          () => mockFileDownloadService.downloadFile(
            'https://example.com/failed.jpg',
            any(),
          ),
        ).thenThrow(Exception('Network error'));

        // Act
        final result = await repository.downloadAllToCache(
          photos: photos,
          blogId: testBlogId,
          blogUrl: testBlogUrl,
        );

        // Assert
        expect(
          result.successCount + result.failureCount + result.skippedCount,
          3,
        );
        expect(result.successCount, 1);
        expect(result.failureCount, 1);
        expect(result.skippedCount, 1);
        expect(result.errors.length, 1);
        expect(result.errors.first, contains('failed.jpg'));
        expect(result.isAllSuccessful, isFalse);
      });
    });
  });

  group('saveToGalleryFromCache', () {
    const saveBlogId = 'test_blog_id';

    final savePhotos = [
      const PhotoEntity(
        id: '1',
        url: 'https://example.com/photo1.jpg',
        filename: 'photo1.jpg',
      ),
      const PhotoEntity(
        id: '2',
        url: 'https://example.com/photo2.jpg',
        filename: 'photo2.jpg',
      ),
      const PhotoEntity(
        id: '3',
        url: 'https://example.com/photo3.jpg',
        filename: 'photo3.jpg',
      ),
    ];

    group('快取檔案讀取策略', () {
      test('所有快取檔案存在時，每張照片都應被儲存至相簿', () async {
        // Arrange
        final mockFile1 = FakeFile('/tmp/cache/photo1.jpg');
        final mockFile2 = FakeFile('/tmp/cache/photo2.jpg');
        final mockFile3 = FakeFile('/tmp/cache/photo3.jpg');

        when(
          () => mockCacheRepository.cachedFile('photo1.jpg', saveBlogId),
        ).thenAnswer((_) async => mockFile1);
        when(
          () => mockCacheRepository.cachedFile('photo2.jpg', saveBlogId),
        ).thenAnswer((_) async => mockFile2);
        when(
          () => mockCacheRepository.cachedFile('photo3.jpg', saveBlogId),
        ).thenAnswer((_) async => mockFile3);

        when(
          () => mockPhotoService.saveToGallery(
            any(),
            totalCount: any(named: 'totalCount'),
          ),
        ).thenAnswer((_) async {});
        when(
          () => mockCacheRepository.markAsSavedToGallery(saveBlogId),
        ).thenAnswer((_) async {});

        // Act
        await repository.saveToGalleryFromCache(
          photos: savePhotos,
          blogId: saveBlogId,
        );

        // Assert — 完成無例外
        verify(
          () => mockPhotoService.saveToGallery(
            any(),
            totalCount: any(named: 'totalCount'),
          ),
        ).called(3);
      });

      test('部分快取檔案遺失時，應跳過遺失檔案並儲存存在的檔案', () async {
        // Arrange
        final mockFile1 = FakeFile('/tmp/cache/photo1.jpg');
        final mockFile3 = FakeFile('/tmp/cache/photo3.jpg');

        when(
          () => mockCacheRepository.cachedFile('photo1.jpg', saveBlogId),
        ).thenAnswer((_) async => mockFile1);
        when(
          () => mockCacheRepository.cachedFile('photo2.jpg', saveBlogId),
        ).thenAnswer((_) async => null);
        when(
          () => mockCacheRepository.cachedFile('photo3.jpg', saveBlogId),
        ).thenAnswer((_) async => mockFile3);

        when(
          () => mockPhotoService.saveToGallery(
            any(),
            totalCount: any(named: 'totalCount'),
          ),
        ).thenAnswer((_) async {});
        when(
          () => mockCacheRepository.markAsSavedToGallery(saveBlogId),
        ).thenAnswer((_) async {});

        // Act
        await repository.saveToGalleryFromCache(
          photos: savePhotos,
          blogId: saveBlogId,
        );

        // Assert — 完成無例外
        verify(
          () => mockPhotoService.saveToGallery(
            any(),
            totalCount: any(named: 'totalCount'),
          ),
        ).called(2);
      });
    });

    group('循序儲存策略', () {
      test('saveToGallery 應被依序呼叫正確次數', () async {
        // Arrange
        final mockFile1 = FakeFile('/tmp/cache/photo1.jpg');
        final mockFile2 = FakeFile('/tmp/cache/photo2.jpg');
        final mockFile3 = FakeFile('/tmp/cache/photo3.jpg');

        when(
          () => mockCacheRepository.cachedFile('photo1.jpg', saveBlogId),
        ).thenAnswer((_) async => mockFile1);
        when(
          () => mockCacheRepository.cachedFile('photo2.jpg', saveBlogId),
        ).thenAnswer((_) async => mockFile2);
        when(
          () => mockCacheRepository.cachedFile('photo3.jpg', saveBlogId),
        ).thenAnswer((_) async => mockFile3);

        final callOrder = <String>[];
        when(
          () => mockPhotoService.saveToGallery(
            any(),
            totalCount: any(named: 'totalCount'),
          ),
        ).thenAnswer((invocation) async {
          callOrder.add(invocation.positionalArguments[0] as String);
        });
        when(
          () => mockCacheRepository.markAsSavedToGallery(saveBlogId),
        ).thenAnswer((_) async {});

        // Act
        await repository.saveToGalleryFromCache(
          photos: savePhotos,
          blogId: saveBlogId,
        );

        // Assert
        expect(callOrder.length, 3);
        verify(
          () => mockPhotoService.saveToGallery(
            any(),
            totalCount: any(named: 'totalCount'),
          ),
        ).called(3);
      });
    });

    group('markAsSavedToGallery 呼叫時機', () {
      test('標記應在所有儲存完成後被呼叫', () async {
        // Arrange
        final mockFile1 = FakeFile('/tmp/cache/photo1.jpg');

        when(
          () => mockCacheRepository.cachedFile('photo1.jpg', saveBlogId),
        ).thenAnswer((_) async => mockFile1);
        when(
          () => mockCacheRepository.cachedFile('photo2.jpg', saveBlogId),
        ).thenAnswer((_) async => null);
        when(
          () => mockCacheRepository.cachedFile('photo3.jpg', saveBlogId),
        ).thenAnswer((_) async => null);

        when(
          () => mockPhotoService.saveToGallery(
            any(),
            totalCount: any(named: 'totalCount'),
          ),
        ).thenAnswer((_) async {});
        when(
          () => mockCacheRepository.markAsSavedToGallery(saveBlogId),
        ).thenAnswer((_) async {});

        // Act
        await repository.saveToGalleryFromCache(
          photos: savePhotos,
          blogId: saveBlogId,
        );

        // Assert
        verify(
          () => mockCacheRepository.markAsSavedToGallery(saveBlogId),
        ).called(1);
      });
    });

    group('錯誤處理策略', () {
      test('成功時正常完成無例外', () async {
        // Arrange
        final mockFile1 = FakeFile('/tmp/cache/photo1.jpg');
        when(
          () => mockCacheRepository.cachedFile('photo1.jpg', saveBlogId),
        ).thenAnswer((_) async => mockFile1);
        when(
          () => mockCacheRepository.cachedFile('photo2.jpg', saveBlogId),
        ).thenAnswer((_) async => null);
        when(
          () => mockCacheRepository.cachedFile('photo3.jpg', saveBlogId),
        ).thenAnswer((_) async => null);
        when(
          () => mockPhotoService.saveToGallery(
            any(),
            totalCount: any(named: 'totalCount'),
          ),
        ).thenAnswer((_) async {});
        when(
          () => mockCacheRepository.markAsSavedToGallery(saveBlogId),
        ).thenAnswer((_) async {});

        // Act & Assert — 正常完成無例外
        await repository.saveToGalleryFromCache(
          photos: savePhotos,
          blogId: saveBlogId,
        );
      });

      test('PhotoService 例外時拋出例外', () async {
        // Arrange
        final mockFile1 = FakeFile('/tmp/cache/photo1.jpg');
        when(
          () => mockCacheRepository.cachedFile('photo1.jpg', saveBlogId),
        ).thenAnswer((_) async => mockFile1);
        when(
          () => mockPhotoService.saveToGallery(
            any(),
            totalCount: any(named: 'totalCount'),
          ),
        ).thenThrow(Exception('Gallery save failed'));

        // Act & Assert
        expect(
          () => repository.saveToGalleryFromCache(
            photos: savePhotos,
            blogId: saveBlogId,
          ),
          throwsA(
            predicate<dynamic>(
              (e) => e.toString().contains('Gallery save failed'),
            ),
          ),
        );
      });

      test('markAsSavedToGallery 例外時拋出例外', () async {
        // Arrange
        final mockFile1 = FakeFile('/tmp/cache/photo1.jpg');
        when(
          () => mockCacheRepository.cachedFile('photo1.jpg', saveBlogId),
        ).thenAnswer((_) async => mockFile1);
        when(
          () => mockCacheRepository.cachedFile('photo2.jpg', saveBlogId),
        ).thenAnswer((_) async => null);
        when(
          () => mockCacheRepository.cachedFile('photo3.jpg', saveBlogId),
        ).thenAnswer((_) async => null);
        when(
          () => mockPhotoService.saveToGallery(
            any(),
            totalCount: any(named: 'totalCount'),
          ),
        ).thenAnswer((_) async {});
        when(
          () => mockCacheRepository.markAsSavedToGallery(saveBlogId),
        ).thenThrow(Exception('Mark failed'));

        // Act & Assert
        expect(
          () => repository.saveToGalleryFromCache(
            photos: savePhotos,
            blogId: saveBlogId,
          ),
          throwsA(
            predicate<dynamic>((e) => e.toString().contains('Mark failed')),
          ),
        );
      });
    });
  });

  group('saveOneToGallery', () {
    const testFilePath = '/cache/blogs/abc/photo.jpg';

    test('權限授予時成功儲存無例外', () async {
      when(
        () => mockPhotoService.requestPermission(),
      ).thenAnswer((_) async => true);
      when(
        () => mockPhotoService.saveToGallery(testFilePath),
      ).thenAnswer((_) async {});

      await repository.saveOneToGallery(testFilePath);

      verify(() => mockPhotoService.requestPermission()).called(1);
      verify(() => mockPhotoService.saveToGallery(testFilePath)).called(1);
    });

    test('權限拒絕時拋出例外且不呼叫 saveToGallery', () async {
      when(
        () => mockPhotoService.requestPermission(),
      ).thenAnswer((_) async => false);

      try {
        await repository.saveOneToGallery(testFilePath);
        fail('應拋出例外');
      } on AppError catch (appError) {
        expect(appError.type, AppErrorType.gallery);
      }

      verifyNever(
        () => mockPhotoService.saveToGallery(
          any(),
          totalCount: any(named: 'totalCount'),
        ),
      );
    });

    test('PhotoService 拋出例外時拋出例外', () async {
      when(
        () => mockPhotoService.requestPermission(),
      ).thenAnswer((_) async => true);
      when(
        () => mockPhotoService.saveToGallery(testFilePath),
      ).thenThrow(const AppError(type: AppErrorType.gallery, message: '儲存失敗'));

      expect(
        () => repository.saveOneToGallery(testFilePath),
        throwsA(isA<AppError>()),
      );
    });
  });
}
