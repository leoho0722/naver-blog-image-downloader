import 'dart:io';

import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../data/models/photo_entity.dart';
import '../../../data/repositories/log_repository.dart';

part 'photo_detail_view_model.g.dart';

/// 照片詳細頁面的不可變狀態，封裝照片列表、當前索引與快取檔案對應表。
///
/// 元資料（檔案大小、圖片尺寸）改由原生檢視器直接讀取，
/// 此 State 僅保留 Flutter 端路由與 log 記錄所需的欄位。
class PhotoDetailState {
  /// 建立 [PhotoDetailState]。
  ///
  /// - [photos]：照片實體清單，預設為空清單。
  /// - [blogId]：Blog 識別碼，預設為空字串。
  /// - [currentIndex]：目前顯示照片的索引，預設為 0。
  /// - [saveOperation]：儲存操作的非同步狀態，預設為 `null`（閒置）。
  /// - [cachedFiles]：照片 ID 對應快取檔案的 Map，預設為空 Map。
  const PhotoDetailState({
    this.photos = const [],
    this.blogId = '',
    this.currentIndex = 0,
    this.saveOperation,
    this.cachedFiles = const {},
  });

  /// 目前載入的照片實體清單。
  final List<PhotoEntity> photos;

  /// 目前操作的 Blog 識別碼。
  final String blogId;

  /// 目前顯示照片在 [photos] 中的索引位置。
  final int currentIndex;

  /// 儲存操作的非同步狀態；`null` 表示閒置。
  final AsyncValue<void>? saveOperation;

  /// 照片 ID 對應快取檔案的 Map，由 Gallery 頁面傳遞。
  final Map<String, File?> cachedFiles;

  /// 目前載入的照片實體。
  ///
  /// 回傳 [currentIndex] 對應的 [PhotoEntity]；清單為空時回傳 `null`。
  PhotoEntity? get photo => photos.isNotEmpty ? photos[currentIndex] : null;

  /// 照片總數。
  ///
  /// 回傳 [photos] 清單的長度。
  int get totalCount => photos.length;

  /// 是否正在儲存中。
  ///
  /// 回傳 `true` 表示 [saveOperation] 為 [AsyncLoading] 狀態。
  bool get isSaving => saveOperation is AsyncLoading;

  /// 是否已成功儲存。
  ///
  /// 回傳 `true` 表示 [saveOperation] 為 [AsyncData] 狀態。
  bool get isSaved => saveOperation is AsyncData;

  /// 建立狀態副本，僅覆寫指定欄位。
  ///
  /// - [photos]：若提供則覆寫照片清單。
  /// - [blogId]：若提供則覆寫 Blog 識別碼。
  /// - [currentIndex]：若提供則覆寫目前索引。
  /// - [saveOperation]：使用函式包裝以允許顯式設定為 `null`。
  /// - [cachedFiles]：若提供則覆寫快取檔案 Map。
  ///
  /// 回傳新的 [PhotoDetailState]，未指定的欄位保留原值。
  PhotoDetailState copyWith({
    List<PhotoEntity>? photos,
    String? blogId,
    int? currentIndex,
    AsyncValue<void>? Function()? saveOperation,
    Map<String, File?>? cachedFiles,
  }) {
    return PhotoDetailState(
      photos: photos ?? this.photos,
      blogId: blogId ?? this.blogId,
      currentIndex: currentIndex ?? this.currentIndex,
      saveOperation: saveOperation != null
          ? saveOperation()
          : this.saveOperation,
      cachedFiles: cachedFiles ?? this.cachedFiles,
    );
  }
}

/// 照片詳細頁面的 ViewModel，管理照片列表與當前索引。
///
/// 元資料讀取與儲存至相簿由原生檢視器處理，
/// 此 ViewModel 僅負責初始化狀態與記錄儲存操作 log。
@riverpod
class PhotoDetailViewModel extends _$PhotoDetailViewModel {
  /// 初始化狀態，回傳預設的 [PhotoDetailState]。
  @override
  PhotoDetailState build() => const PhotoDetailState();

  /// 載入照片列表與快取檔案對應表。
  ///
  /// - [photos]：照片實體清單。
  /// - [blogId]：Blog 識別碼。
  /// - [initialIndex]：初始顯示的照片索引。
  /// - [cachedFiles]：照片 ID 對應快取檔案的 Map。
  void loadAll(
    List<PhotoEntity> photos,
    String blogId,
    int initialIndex,
    Map<String, File?> cachedFiles,
  ) {
    state = state.copyWith(
      photos: photos,
      blogId: blogId,
      currentIndex: initialIndex,
      saveOperation: () => null,
      cachedFiles: cachedFiles,
    );
  }

  /// 切換當前顯示的照片索引。
  ///
  /// [index] 為目標照片在清單中的索引位置。
  void setCurrentIndex(int index) {
    if (index < 0 || index >= state.photos.length) return;
    state = state.copyWith(currentIndex: index, saveOperation: () => null);
  }

  /// 記錄儲存至相簿的操作 log（fire-and-forget）。
  ///
  /// 由原生端儲存成功後透過 `onSaveCompleted` 回呼觸發。
  ///
  /// - [blogId]：照片所屬的 Blog 識別碼。
  void logSaveToGallery(String blogId) {
    ref
        .read(logRepositoryProvider)
        .logSaveToGallery(blogId: blogId, photoCount: 1, mode: 'single');
  }
}
