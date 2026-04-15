// ⚠️ 本檔案內容**僅供 screenshot / golden 測試使用**，不可被正式功能程式碼引用。
// 網址、URL、時間戳等皆為假資料，在真實下載 / 快取 / API 流程中會導致錯誤。
// 如需新增截圖所需 mock，延伸此檔即可；若要擴充正式邏輯請另起 repository / service。
import '../data/models/blog_cache_metadata.dart';
import '../data/models/fetch_result.dart';
import '../data/models/photo_entity.dart';
import '../data/models/whats_new_item.dart';

/// 截圖情境共用的 Blog 網址。
const String screenshotBlogUrl =
    'https://blog.naver.com/naver_blog_image_downloader/223456789012';

/// 截圖情境共用的 Blog 識別碼。
const String screenshotBlogId = 'screenshot-blog-id';

/// 截圖情境共用的照片清單。
const List<PhotoEntity> screenshotPhotos = [
  PhotoEntity(
    id: 'photo-01',
    url: 'https://example.com/photo-01.png',
    filename: 'photo_01.png',
    width: 1080,
    height: 1350,
  ),
  PhotoEntity(
    id: 'photo-02',
    url: 'https://example.com/photo-02.png',
    filename: 'photo_02.png',
    width: 1080,
    height: 1350,
  ),
  PhotoEntity(
    id: 'photo-03',
    url: 'https://example.com/photo-03.png',
    filename: 'photo_03.png',
    width: 1080,
    height: 1350,
  ),
  PhotoEntity(
    id: 'photo-04',
    url: 'https://example.com/photo-04.png',
    filename: 'photo_04.png',
    width: 1080,
    height: 1350,
  ),
  PhotoEntity(
    id: 'photo-05',
    url: 'https://example.com/photo-05.png',
    filename: 'photo_05.png',
    width: 1080,
    height: 1350,
  ),
  PhotoEntity(
    id: 'photo-06',
    url: 'https://example.com/photo-06.png',
    filename: 'photo_06.png',
    width: 1080,
    height: 1350,
  ),
  PhotoEntity(
    id: 'photo-07',
    url: 'https://example.com/photo-07.png',
    filename: 'photo_07.png',
    width: 1080,
    height: 1350,
  ),
  PhotoEntity(
    id: 'photo-08',
    url: 'https://example.com/photo-08.png',
    filename: 'photo_08.png',
    width: 1080,
    height: 1350,
  ),
  PhotoEntity(
    id: 'photo-09',
    url: 'https://example.com/photo-09.png',
    filename: 'photo_09.png',
    width: 1080,
    height: 1350,
  ),
];

/// 截圖情境共用的照片擷取結果。
const FetchResult screenshotFetchResult = FetchResult(
  photos: screenshotPhotos,
  blogId: screenshotBlogId,
  blogUrl: screenshotBlogUrl,
  isFullyCached: true,
  totalImages: 9,
  failureDownloads: 0,
);

/// 設定頁面截圖情境的快取 metadata。
final List<BlogCacheMetadata> screenshotCachedBlogs = [
  BlogCacheMetadata(
    blogId: screenshotBlogId,
    blogUrl: screenshotBlogUrl,
    photoCount: screenshotPhotos.length,
    downloadedAt: DateTime(2026, 4, 13, 20, 0),
    isSavedToGallery: true,
    filenames: screenshotPhotos.map((photo) => photo.filename).toList(),
  ),
];

/// 首次安裝引導的截圖內容。
const WhatsNewEntry screenshotOnboardingEntry = WhatsNewEntry(
  items: [
    WhatsNewTextItem(
      icon: 'content_paste',
      title: '貼上部落格網址',
      description: '從剪貼簿貼上 Naver Blog 網址後，一鍵取得全部照片。',
    ),
    WhatsNewTextItem(
      icon: 'photo_library',
      title: '預覽照片清單',
      description: '支援快速瀏覽九宮格照片，並切換選取模式。',
    ),
    WhatsNewTextItem(
      icon: 'download',
      title: '批次下載與儲存',
      description: '下載完成後可一次儲存全部照片，或挑選部分照片另存。',
    ),
  ],
);

/// 版本更新介紹的截圖內容。
const WhatsNewEntry screenshotUpdateEntry = WhatsNewEntry(
  items: [
    WhatsNewTextItem(
      icon: 'auto_awesome',
      title: '支援多語系截圖',
      description: '可直接切換語系與主題，快速產出一致的商店素材。',
    ),
    WhatsNewTextItem(
      icon: 'swipe',
      title: '原生圖片檢視器更穩定',
      description: '全螢幕檢視器支援自動化等待標記，截圖流程更可靠。',
    ),
  ],
);
