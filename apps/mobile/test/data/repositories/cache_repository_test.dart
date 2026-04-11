import 'dart:io';

import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:naver_blog_image_downloader/data/models/blog_cache_metadata.dart';
import 'package:naver_blog_image_downloader/data/repositories/cache_repository.dart';
import 'package:path/path.dart' as p;
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('blogId（SHA-256 blogId 產生策略）', () {
    late CacheRepository repository;

    setUp(() {
      SharedPreferences.setMockInitialValues({});
      repository = CacheRepository();
    });

    test('相同 URL 產生一致的 16 碼十六進制字串', () {
      const url = 'https://blog.naver.com/test/12345';
      final id1 = repository.blogId(url);
      final id2 = repository.blogId(url);

      expect(id1, equals(id2));
      expect(id1.length, 16);
      expect(RegExp(r'^[0-9a-f]{16}$').hasMatch(id1), isTrue);
    });

    test('不同 URL 產生不同結果', () {
      const url1 = 'https://blog.naver.com/test/12345';
      const url2 = 'https://blog.naver.com/test/67890';

      final id1 = repository.blogId(url1);
      final id2 = repository.blogId(url2);

      expect(id1, isNot(equals(id2)));
    });

    test('不同格式的 URL 產生不同 blogId（呼叫端須先正規化）', () {
      const mobileUrl = 'https://m.blog.naver.com/edament/224238392216';
      const desktopUrl = 'https://blog.naver.com/edament/224238392216';

      final mobileId = repository.blogId(mobileUrl);
      final desktopId = repository.blogId(desktopUrl);

      // blogId 本身不做正規化，不同字串產生不同 hash
      expect(mobileId, isNot(equals(desktopId)));
    });
  });

  group('快取淘汰功能', () {
    late CacheRepository repository;
    late Directory tempDir;

    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      tempDir = await Directory.systemTemp.createTemp('cache_test_');

      // Mock path_provider 的 getApplicationCacheDirectory
      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
          .setMockMethodCallHandler(
            const MethodChannel('plugins.flutter.io/path_provider'),
            (MethodCall methodCall) async {
              if (methodCall.method == 'getApplicationCacheDirectory') {
                return tempDir.path;
              }
              return null;
            },
          );

      repository = CacheRepository();
    });

    tearDown(() async {
      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
          .setMockMethodCallHandler(
            const MethodChannel('plugins.flutter.io/path_provider'),
            null,
          );
      if (await tempDir.exists()) {
        await tempDir.delete(recursive: true);
      }
    });

    BlogCacheMetadata createMetadata({
      required String blogId,
      required DateTime downloadedAt,
      bool isSavedToGallery = false,
      int photoCount = 1,
    }) {
      return BlogCacheMetadata(
        blogId: blogId,
        blogUrl: 'https://blog.naver.com/$blogId',
        photoCount: photoCount,
        downloadedAt: downloadedAt,
        isSavedToGallery: isSavedToGallery,
        filenames: List.generate(photoCount, (i) => 'photo_$i.jpg'),
      );
    }

    Future<void> createCacheFiles(
      String blogId,
      int count,
      int sizeEach,
    ) async {
      final dir = Directory(p.join(tempDir.path, 'blogs', blogId));
      await dir.create(recursive: true);
      for (int i = 0; i < count; i++) {
        final file = File(p.join(dir.path, 'photo_$i.jpg'));
        await file.writeAsBytes(List.filled(sizeEach, 0));
      }
    }

    group('markAsSavedToGallery（Gallery save marking）', () {
      test('標記存在的 blogId 為已儲存至相簿', () async {
        final meta = createMetadata(
          blogId: 'blog-001',
          downloadedAt: DateTime(2025, 1, 1),
          isSavedToGallery: false,
        );
        await repository.updateMetadata(meta);

        await repository.markAsSavedToGallery('blog-001');

        final updated = await repository.metadata('blog-001');
        expect(updated, isNotNull);
        expect(updated!.isSavedToGallery, isTrue);
      });

      test('標記不存在的 blogId 不報錯（no-op）', () async {
        // 不應拋出例外
        await repository.markAsSavedToGallery('non-existent');

        final meta = await repository.metadata('non-existent');
        expect(meta, isNull);
      });

      test('標記後 metadata 持久化至 shared_preferences', () async {
        final meta = createMetadata(
          blogId: 'blog-persist',
          downloadedAt: DateTime(2025, 1, 1),
          isSavedToGallery: false,
        );
        await repository.updateMetadata(meta);
        await repository.markAsSavedToGallery('blog-persist');

        // 建立新 repository 實例以驗證持久化
        final newRepo = CacheRepository();
        final persisted = await newRepo.metadata('blog-persist');
        expect(persisted, isNotNull);
        expect(persisted!.isSavedToGallery, isTrue);
      });
    });

    group('totalCacheSize（快取大小計算）', () {
      test('有快取檔案時回傳正確的總大小', () async {
        // 建立兩個 blog 目錄，各含檔案
        await createCacheFiles('blog-a', 2, 1024); // 2KB
        await createCacheFiles('blog-b', 3, 2048); // 6KB

        final size = await repository.totalCacheSize();
        expect(size, equals(2 * 1024 + 3 * 2048)); // 8192 bytes
      });

      test('空快取時回傳 0', () async {
        final size = await repository.totalCacheSize();
        expect(size, equals(0));
      });

      test('blogs 目錄存在但無檔案時回傳 0', () async {
        final blogsDir = Directory(p.join(tempDir.path, 'blogs'));
        await blogsDir.create(recursive: true);

        final size = await repository.totalCacheSize();
        expect(size, equals(0));
      });
    });

    group('evictIfNeeded（Automatic eviction）', () {
      test('低於閥值時不淘汰任何 Blog', () async {
        // 建立少量快取（遠低於 300MB）
        await createCacheFiles('blog-small', 1, 1024);
        final meta = createMetadata(
          blogId: 'blog-small',
          downloadedAt: DateTime(2025, 1, 1),
          isSavedToGallery: true,
        );
        await repository.updateMetadata(meta);

        await repository.evictIfNeeded();

        final remaining = await repository.metadata('blog-small');
        expect(remaining, isNotNull);
      });

      test('超過閥值時優先清除已儲存至相簿的最舊 Blog', () async {
        // 建立超過 300MB 的快取
        // 使用較小的檔案但多個 blog，透過 photoCount 估算讓 eviction 生效
        const fileSize = 1024 * 1024; // 1MB per file
        const filesPerBlog = 100; // 100 files = ~100MB

        // 建立 4 個 blog 目錄，總計 400MB > 300MB
        for (int i = 0; i < 4; i++) {
          await createCacheFiles('blog-$i', filesPerBlog, fileSize);
          final meta = createMetadata(
            blogId: 'blog-$i',
            downloadedAt: DateTime(2025, 1, i + 1),
            isSavedToGallery: true,
            photoCount: filesPerBlog,
          );
          await repository.updateMetadata(meta);
        }

        await repository.evictIfNeeded();

        // 最舊的 blog-0 應被優先清除
        final evicted = await repository.metadata('blog-0');
        expect(evicted, isNull);
      });

      test('無已儲存至相簿的 Blog 時不淘汰（保護未儲存的快取）', () async {
        const fileSize = 1024 * 1024; // 1MB per file
        const filesPerBlog = 100;

        // 建立 4 個未儲存至相簿的 blog
        for (int i = 0; i < 4; i++) {
          await createCacheFiles('unsaved-$i', filesPerBlog, fileSize);
          final meta = createMetadata(
            blogId: 'unsaved-$i',
            downloadedAt: DateTime(2025, 1, i + 1),
            isSavedToGallery: false,
            photoCount: filesPerBlog,
          );
          await repository.updateMetadata(meta);
        }

        await repository.evictIfNeeded();

        // 所有 blog 都應保留
        for (int i = 0; i < 4; i++) {
          final remaining = await repository.metadata('unsaved-$i');
          expect(remaining, isNotNull, reason: 'unsaved-$i 不應被淘汰');
        }
      });
    });

    group('clearAll（Clear all cache）', () {
      test('清除所有快取檔案與 metadata', () async {
        // 建立快取
        await createCacheFiles('blog-x', 2, 1024);
        await createCacheFiles('blog-y', 3, 2048);
        await repository.updateMetadata(
          createMetadata(blogId: 'blog-x', downloadedAt: DateTime(2025, 1, 1)),
        );
        await repository.updateMetadata(
          createMetadata(blogId: 'blog-y', downloadedAt: DateTime(2025, 1, 2)),
        );

        await repository.clearAll();

        // blogs 目錄應被刪除
        final blogsDir = Directory(p.join(tempDir.path, 'blogs'));
        expect(await blogsDir.exists(), isFalse);

        // metadata 應為空
        final allMeta = await repository.allMetadata();
        expect(allMeta, isEmpty);
      });

      test('空快取時清除不報錯', () async {
        // 不應拋出例外
        await repository.clearAll();

        final allMeta = await repository.allMetadata();
        expect(allMeta, isEmpty);
      });
    });

    group('clearBlog（Clear single blog cache）', () {
      test('清除存在的 Blog 快取與 metadata', () async {
        await createCacheFiles('blog-target', 2, 1024);
        await createCacheFiles('blog-keep', 1, 512);
        await repository.updateMetadata(
          createMetadata(
            blogId: 'blog-target',
            downloadedAt: DateTime(2025, 1, 1),
          ),
        );
        await repository.updateMetadata(
          createMetadata(
            blogId: 'blog-keep',
            downloadedAt: DateTime(2025, 1, 2),
          ),
        );

        await repository.clearBlog('blog-target');

        // 目標 blog 的 metadata 應被移除
        final targetMeta = await repository.metadata('blog-target');
        expect(targetMeta, isNull);

        // 目標 blog 的目錄應被刪除
        final targetDir = Directory(
          p.join(tempDir.path, 'blogs', 'blog-target'),
        );
        expect(await targetDir.exists(), isFalse);

        // 其他 blog 應保留
        final keepMeta = await repository.metadata('blog-keep');
        expect(keepMeta, isNotNull);
      });

      test('清除不存在的 blogId 不報錯', () async {
        // 不應拋出例外
        await repository.clearBlog('non-existent');
      });
    });
  });
}
