import 'dart:io';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:naver_blog_image_downloader/data/models/photo_entity.dart';
import 'package:naver_blog_image_downloader/data/repositories/cache_repository.dart';
import 'package:naver_blog_image_downloader/data/repositories/log_repository.dart';
import 'package:naver_blog_image_downloader/data/repositories/photo_repository.dart';
import 'package:naver_blog_image_downloader/ui/photo_gallery/view_model/photo_gallery_view_model.dart';

class MockPhotoRepository extends Mock implements PhotoRepository {}

class MockCacheRepository extends Mock implements CacheRepository {}

class MockLogRepository extends Mock implements LogRepository {}

void main() {
  late MockPhotoRepository mockPhotoRepository;
  late MockCacheRepository mockCacheRepository;
  late MockLogRepository mockLogRepository;
  late ProviderContainer container;

  const testBlogId = 'blog123';
  const testPhotos = [
    PhotoEntity(
      id: '1',
      url: 'https://img.naver.com/1.jpg',
      filename: 'photo1.jpg',
    ),
    PhotoEntity(
      id: '2',
      url: 'https://img.naver.com/2.jpg',
      filename: 'photo2.jpg',
    ),
  ];

  setUpAll(() {
    registerFallbackValue(const <PhotoEntity>[]);
  });

  setUp(() {
    mockPhotoRepository = MockPhotoRepository();
    mockCacheRepository = MockCacheRepository();
    mockLogRepository = MockLogRepository();
    container = ProviderContainer(
      overrides: [
        photoRepositoryProvider.overrideWithValue(mockPhotoRepository),
        cacheRepositoryProvider.overrideWithValue(mockCacheRepository),
        logRepositoryProvider.overrideWithValue(mockLogRepository),
      ],
    );
    container.listen(photoGalleryViewModelProvider, (_, _) {});
    addTearDown(container.dispose);
  });

  group('initial state', () {
    test('cachedFiles 初始為空 map', () {
      final state = container.read(photoGalleryViewModelProvider);
      expect(state.cachedFiles, isEmpty);
    });

    test('photos 初始為空 list', () {
      final state = container.read(photoGalleryViewModelProvider);
      expect(state.photos, isEmpty);
    });

    test('blogId 初始為空字串', () {
      final state = container.read(photoGalleryViewModelProvider);
      expect(state.blogId, '');
    });
  });

  group('load photos', () {
    test('load 後 photos 與 blogId 正確設定', () async {
      // 模擬所有快取查詢回傳 null（無快取）
      when(
        () => mockCacheRepository.cachedFile(any(), any()),
      ).thenAnswer((_) async => null);

      final notifier = container.read(photoGalleryViewModelProvider.notifier);
      await notifier.load(testPhotos, testBlogId);

      final state = container.read(photoGalleryViewModelProvider);
      expect(state.photos, testPhotos);
      expect(state.blogId, testBlogId);
    });

    test('load 會觸發狀態變更', () async {
      when(
        () => mockCacheRepository.cachedFile(any(), any()),
      ).thenAnswer((_) async => null);

      int stateChangeCount = 0;
      container.listen(photoGalleryViewModelProvider, (prev, next) {
        stateChangeCount++;
      });

      final notifier = container.read(photoGalleryViewModelProvider.notifier);
      await notifier.load(testPhotos, testBlogId);

      // 第一次：設定 photos/blogId 後通知；第二次：快取解析完成後通知
      expect(stateChangeCount, 2);
    });
  });

  group('cachedFiles populated after load', () {
    test('部分照片有快取時，cachedFiles 對應正確', () async {
      final mockFile = File('/tmp/test_photo.jpg');

      // photo1 有快取，photo2 無快取
      when(
        () => mockCacheRepository.cachedFile('photo1.jpg', testBlogId),
      ).thenAnswer((_) async => mockFile);
      when(
        () => mockCacheRepository.cachedFile('photo2.jpg', testBlogId),
      ).thenAnswer((_) async => null);

      final notifier = container.read(photoGalleryViewModelProvider.notifier);
      await notifier.load(testPhotos, testBlogId);

      final state = container.read(photoGalleryViewModelProvider);
      expect(state.cachedFiles.length, 2);
      expect(state.cachedFiles['1'], mockFile);
      expect(state.cachedFiles['2'], isNull);
    });

    test('所有照片皆有快取時，cachedFiles 全部非 null', () async {
      final mockFile1 = File('/tmp/photo1.jpg');
      final mockFile2 = File('/tmp/photo2.jpg');

      when(
        () => mockCacheRepository.cachedFile('photo1.jpg', testBlogId),
      ).thenAnswer((_) async => mockFile1);
      when(
        () => mockCacheRepository.cachedFile('photo2.jpg', testBlogId),
      ).thenAnswer((_) async => mockFile2);

      final notifier = container.read(photoGalleryViewModelProvider.notifier);
      await notifier.load(testPhotos, testBlogId);

      final state = container.read(photoGalleryViewModelProvider);
      expect(state.cachedFiles['1'], mockFile1);
      expect(state.cachedFiles['2'], mockFile2);
    });

    test('所有照片皆無快取時，cachedFiles 全部為 null', () async {
      when(
        () => mockCacheRepository.cachedFile(any(), any()),
      ).thenAnswer((_) async => null);

      final notifier = container.read(photoGalleryViewModelProvider.notifier);
      await notifier.load(testPhotos, testBlogId);

      final state = container.read(photoGalleryViewModelProvider);
      expect(state.cachedFiles['1'], isNull);
      expect(state.cachedFiles['2'], isNull);
    });

    test('重新 load 會清除舊的 cachedFiles', () async {
      final mockFile = File('/tmp/test_photo.jpg');

      // 第一次 load：photo1 有快取
      when(
        () => mockCacheRepository.cachedFile('photo1.jpg', testBlogId),
      ).thenAnswer((_) async => mockFile);
      when(
        () => mockCacheRepository.cachedFile('photo2.jpg', testBlogId),
      ).thenAnswer((_) async => null);

      final notifier = container.read(photoGalleryViewModelProvider.notifier);
      await notifier.load(testPhotos, testBlogId);
      expect(
        container.read(photoGalleryViewModelProvider).cachedFiles['1'],
        mockFile,
      );

      // 第二次 load：使用不同的照片清單
      const newPhotos = [
        PhotoEntity(
          id: '3',
          url: 'https://img.naver.com/3.jpg',
          filename: 'photo3.jpg',
        ),
      ];

      when(
        () => mockCacheRepository.cachedFile('photo3.jpg', 'newBlog'),
      ).thenAnswer((_) async => null);

      await notifier.load(newPhotos, 'newBlog');

      final state = container.read(photoGalleryViewModelProvider);
      // 舊的 key 應該不存在，只有新的 key
      expect(state.cachedFiles.containsKey('1'), isFalse);
      expect(state.cachedFiles.containsKey('2'), isFalse);
      expect(state.cachedFiles.containsKey('3'), isTrue);
    });

    test('cachedFile 以 photo.id 作為 key', () async {
      when(
        () => mockCacheRepository.cachedFile(any(), any()),
      ).thenAnswer((_) async => null);

      final notifier = container.read(photoGalleryViewModelProvider.notifier);
      await notifier.load(testPhotos, testBlogId);

      final state = container.read(photoGalleryViewModelProvider);
      // 驗證 key 是 photo.id 而非 filename
      expect(state.cachedFiles.containsKey('1'), isTrue);
      expect(state.cachedFiles.containsKey('2'), isTrue);
      expect(state.cachedFiles.containsKey('photo1.jpg'), isFalse);
    });
  });

  group('選取模式狀態管理', () {
    test('初始 isSelectMode 為 false', () {
      final state = container.read(photoGalleryViewModelProvider);
      expect(state.isSelectMode, isFalse);
    });

    test('toggleSelectMode 在 browsing 與 selecting 間切換', () {
      final notifier = container.read(photoGalleryViewModelProvider.notifier);
      notifier.toggleSelectMode();
      expect(
        container.read(photoGalleryViewModelProvider).isSelectMode,
        isTrue,
      );

      notifier.toggleSelectMode();
      expect(
        container.read(photoGalleryViewModelProvider).isSelectMode,
        isFalse,
      );
    });

    test('toggleSelectMode 切回 browsing 時清空 selectedIds', () async {
      when(
        () => mockCacheRepository.cachedFile(any(), any()),
      ).thenAnswer((_) async => null);

      final notifier = container.read(photoGalleryViewModelProvider.notifier);
      await notifier.load(testPhotos, testBlogId);

      // 進入選取模式並選取照片
      notifier.toggleSelectMode();
      notifier.toggleSelection('1');
      expect(container.read(photoGalleryViewModelProvider).selectedIds, {'1'});

      // 切回 browsing 後 selectedIds 被清空
      notifier.toggleSelectMode();
      final state = container.read(photoGalleryViewModelProvider);
      expect(state.isSelectMode, isFalse);
      expect(state.selectedIds, isEmpty);
    });
  });

  group('saveSelectedToGallery 處理', () {
    setUp(() async {
      when(
        () => mockCacheRepository.cachedFile(any(), any()),
      ).thenAnswer((_) async => null);

      final notifier = container.read(photoGalleryViewModelProvider.notifier);
      await notifier.load(testPhotos, testBlogId);

      // 進入選取模式並選取一張照片
      notifier.toggleSelectMode();
      notifier.toggleSelection('1');
    });

    test('成功時 isSelectMode 回到 false 且 selectedIds 被清空', () async {
      when(
        () => mockPhotoRepository.saveToGalleryFromCache(
          photos: any(named: 'photos'),
          blogId: any(named: 'blogId'),
        ),
      ).thenAnswer((_) async {});

      final notifier = container.read(photoGalleryViewModelProvider.notifier);
      await notifier.saveSelectedToGallery();

      final state = container.read(photoGalleryViewModelProvider);
      expect(state.isSelectMode, isFalse);
      expect(state.selectedIds, isEmpty);
      expect(state.saveOperation, isA<AsyncData>());
    });

    test('拋出例外時 isSelectMode 回到 false 且 saveOperation 為 AsyncError', () async {
      when(
        () => mockPhotoRepository.saveToGalleryFromCache(
          photos: any(named: 'photos'),
          blogId: any(named: 'blogId'),
        ),
      ).thenThrow(Exception('fail'));

      final notifier = container.read(photoGalleryViewModelProvider.notifier);
      await notifier.saveSelectedToGallery();

      final state = container.read(photoGalleryViewModelProvider);
      expect(state.isSelectMode, isFalse);
      expect(state.saveOperation, isA<AsyncError>());
    });
  });

  group('saveAllToGallery 處理', () {
    setUp(() async {
      when(
        () => mockCacheRepository.cachedFile(any(), any()),
      ).thenAnswer((_) async => null);

      final notifier = container.read(photoGalleryViewModelProvider.notifier);
      await notifier.load(testPhotos, testBlogId);
    });

    test('成功時 saveOperation 為 AsyncData', () async {
      when(
        () => mockPhotoRepository.saveToGalleryFromCache(
          photos: any(named: 'photos'),
          blogId: any(named: 'blogId'),
        ),
      ).thenAnswer((_) async {});

      final notifier = container.read(photoGalleryViewModelProvider.notifier);
      await notifier.saveAllToGallery();

      final state = container.read(photoGalleryViewModelProvider);
      expect(state.saveOperation, isA<AsyncData>());
    });

    test('拋出例外時 saveOperation 為 AsyncError', () async {
      when(
        () => mockPhotoRepository.saveToGalleryFromCache(
          photos: any(named: 'photos'),
          blogId: any(named: 'blogId'),
        ),
      ).thenThrow(Exception('fail'));

      final notifier = container.read(photoGalleryViewModelProvider.notifier);
      await notifier.saveAllToGallery();

      final state = container.read(photoGalleryViewModelProvider);
      expect(state.saveOperation, isA<AsyncError>());
    });
  });
}
