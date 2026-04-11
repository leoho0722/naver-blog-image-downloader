import 'dart:io';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:naver_blog_image_downloader/data/models/photo_entity.dart';
import 'package:naver_blog_image_downloader/data/repositories/log_repository.dart';
import 'package:naver_blog_image_downloader/ui/photo_detail/view_model/photo_detail_view_model.dart';

class MockLogRepository extends Mock implements LogRepository {}

void main() {
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
    PhotoEntity(
      id: '3',
      url: 'https://img.naver.com/3.jpg',
      filename: 'photo3.jpg',
    ),
  ];

  setUp(() {
    mockLogRepository = MockLogRepository();
    container = ProviderContainer(
      overrides: [logRepositoryProvider.overrideWithValue(mockLogRepository)],
    );
    // 維持 auto-dispose provider 存活，避免在 async 操作中被提前釋放
    container.listen(photoDetailViewModelProvider, (_, _) {});
    addTearDown(container.dispose);
  });

  group('initial state', () {
    test('photos 初始為空 list', () {
      final state = container.read(photoDetailViewModelProvider);
      expect(state.photos, isEmpty);
    });

    test('currentIndex 初始為 0', () {
      final state = container.read(photoDetailViewModelProvider);
      expect(state.currentIndex, 0);
    });

    test('totalCount 初始為 0', () {
      final state = container.read(photoDetailViewModelProvider);
      expect(state.totalCount, 0);
    });

    test('photo 初始為 null', () {
      final state = container.read(photoDetailViewModelProvider);
      expect(state.photo, isNull);
    });

    test('cachedFiles 初始為空 Map', () {
      final state = container.read(photoDetailViewModelProvider);
      expect(state.cachedFiles, isEmpty);
    });

    test('saveOperation 初始為 null（idle）', () {
      final state = container.read(photoDetailViewModelProvider);
      expect(state.saveOperation, isNull);
    });
  });

  group('loadAll', () {
    test('載入後 photos、blogId、currentIndex、cachedFiles 正確設定', () {
      final cachedFiles = <String, File?>{'1': null, '2': null, '3': null};

      final notifier = container.read(photoDetailViewModelProvider.notifier);
      notifier.loadAll(testPhotos, testBlogId, 0, cachedFiles);

      final state = container.read(photoDetailViewModelProvider);
      expect(state.photos, testPhotos);
      expect(state.blogId, testBlogId);
      expect(state.currentIndex, 0);
      expect(state.cachedFiles, cachedFiles);
    });

    test('載入後 photo 為 photos[initialIndex]', () {
      final notifier = container.read(photoDetailViewModelProvider.notifier);
      notifier.loadAll(testPhotos, testBlogId, 1, {});

      final state = container.read(photoDetailViewModelProvider);
      expect(state.photo, testPhotos[1]);
      expect(state.currentIndex, 1);
    });

    test('initialIndex 非 0 時正確定位', () {
      final notifier = container.read(photoDetailViewModelProvider.notifier);
      notifier.loadAll(testPhotos, testBlogId, 2, {});

      final state = container.read(photoDetailViewModelProvider);
      expect(state.currentIndex, 2);
      expect(state.photo?.id, '3');
    });

    test('載入會觸發狀態變更', () {
      int stateChangeCount = 0;
      container.listen(photoDetailViewModelProvider, (prev, next) {
        stateChangeCount++;
      });

      final notifier = container.read(photoDetailViewModelProvider.notifier);
      notifier.loadAll(testPhotos, testBlogId, 0, {});

      expect(stateChangeCount, 1);
    });

    test('重新 loadAll 會重設所有狀態', () {
      final notifier = container.read(photoDetailViewModelProvider.notifier);
      notifier.loadAll(testPhotos, testBlogId, 0, {});

      const newPhotos = [
        PhotoEntity(
          id: '4',
          url: 'https://img.naver.com/4.jpg',
          filename: 'photo4.jpg',
        ),
      ];
      notifier.loadAll(newPhotos, 'newBlog', 0, {});

      final state = container.read(photoDetailViewModelProvider);
      expect(state.photos, newPhotos);
      expect(state.blogId, 'newBlog');
      expect(state.photo?.id, '4');
    });
  });

  group('setCurrentIndex', () {
    test('切換後 currentIndex 更新', () {
      final notifier = container.read(photoDetailViewModelProvider.notifier);
      notifier.loadAll(testPhotos, testBlogId, 0, {});

      notifier.setCurrentIndex(2);

      final state = container.read(photoDetailViewModelProvider);
      expect(state.currentIndex, 2);
      expect(state.photo?.id, '3');
    });

    test('切換後 saveOperation 重設為 null（idle）', () {
      final notifier = container.read(photoDetailViewModelProvider.notifier);
      notifier.loadAll(testPhotos, testBlogId, 0, {});

      notifier.setCurrentIndex(1);

      final state = container.read(photoDetailViewModelProvider);
      expect(state.saveOperation, isNull);
    });

    test('切換會觸發狀態變更', () {
      final notifier = container.read(photoDetailViewModelProvider.notifier);
      notifier.loadAll(testPhotos, testBlogId, 0, {});

      int stateChangeCount = 0;
      container.listen(photoDetailViewModelProvider, (prev, next) {
        stateChangeCount++;
      });

      notifier.setCurrentIndex(1);

      expect(stateChangeCount, 1);
    });

    test('索引超出範圍時不執行', () {
      final notifier = container.read(photoDetailViewModelProvider.notifier);
      notifier.loadAll(testPhotos, testBlogId, 0, {});

      notifier.setCurrentIndex(-1);
      expect(container.read(photoDetailViewModelProvider).currentIndex, 0);

      notifier.setCurrentIndex(10);
      expect(container.read(photoDetailViewModelProvider).currentIndex, 0);
    });
  });

  group('logSaveToGallery', () {
    test('呼叫 LogRepository.logSaveToGallery', () {
      final notifier = container.read(photoDetailViewModelProvider.notifier);
      notifier.logSaveToGallery(testBlogId);

      verify(
        () => mockLogRepository.logSaveToGallery(
          blogId: testBlogId,
          photoCount: 1,
          mode: 'single',
        ),
      ).called(1);
    });
  });
}
