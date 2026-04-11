import 'dart:io';

import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../data/models/photo_entity.dart';
import '../../../data/repositories/cache_repository.dart';
import '../../../data/repositories/log_repository.dart';
import '../../../data/repositories/photo_repository.dart';

part 'photo_gallery_view_model.g.dart';

/// 照片瀏覽頁面的不可變狀態，封裝照片清單、選取模式與儲存操作狀態。
class PhotoGalleryState {
  /// 建立 [PhotoGalleryState]。
  ///
  /// - [photos]：照片實體清單，預設為空清單。
  /// - [blogId]：Blog 識別碼，預設為空字串。
  /// - [cachedFiles]：照片 ID 對應的快取檔案，預設為空 Map。
  /// - [selectedIds]：已選取的照片 ID 集合，預設為空 Set。
  /// - [isSelectMode]：是否處於選取模式，預設為 `false`。
  /// - [saveOperation]：儲存至相簿的非同步狀態，預設為 `null`。
  const PhotoGalleryState({
    this.photos = const [],
    this.blogId = '',
    this.cachedFiles = const {},
    this.selectedIds = const {},
    this.isSelectMode = false,
    this.saveOperation,
  });

  /// 目前載入的照片實體清單。
  final List<PhotoEntity> photos;

  /// 目前操作的 Blog 識別碼。
  final String blogId;

  /// 照片 ID 對應的本機快取檔案（預先解析，避免重複查詢）。
  final Map<String, File?> cachedFiles;

  /// 目前已選取的照片 ID 集合（選取模式下使用）。
  final Set<String> selectedIds;

  /// 是否處於選取模式。
  final bool isSelectMode;

  /// 儲存至相簿的非同步操作狀態，`null` 表示尚未開始。
  final AsyncValue<void>? saveOperation;

  /// 是否正在執行儲存至相簿操作。
  ///
  /// 回傳 `true` 表示 [saveOperation] 為 [AsyncLoading] 狀態。
  bool get isSaving => saveOperation is AsyncLoading;

  /// 複製並覆寫指定欄位，回傳新的 [PhotoGalleryState]。
  ///
  /// - [photos]：若提供則覆寫照片清單。
  /// - [blogId]：若提供則覆寫 Blog 識別碼。
  /// - [cachedFiles]：若提供則覆寫快取檔案對應表。
  /// - [selectedIds]：若提供則覆寫已選取的照片 ID 集合。
  /// - [isSelectMode]：若提供則覆寫選取模式旗標。
  /// - [saveOperation]：使用函式包裝以允許顯式設定為 `null`。
  ///
  /// 回傳新的 [PhotoGalleryState]，未指定的欄位保留原值。
  PhotoGalleryState copyWith({
    List<PhotoEntity>? photos,
    String? blogId,
    Map<String, File?>? cachedFiles,
    Set<String>? selectedIds,
    bool? isSelectMode,
    AsyncValue<void>? Function()? saveOperation,
  }) {
    return PhotoGalleryState(
      photos: photos ?? this.photos,
      blogId: blogId ?? this.blogId,
      cachedFiles: cachedFiles ?? this.cachedFiles,
      selectedIds: selectedIds ?? this.selectedIds,
      isSelectMode: isSelectMode ?? this.isSelectMode,
      saveOperation: saveOperation != null
          ? saveOperation()
          : this.saveOperation,
    );
  }
}

/// 照片瀏覽頁面的 ViewModel，管理照片清單呈現、選取模式與相簿儲存操作。
@riverpod
class PhotoGalleryViewModel extends _$PhotoGalleryViewModel {
  /// 初始化狀態，回傳預設的 [PhotoGalleryState]。
  @override
  PhotoGalleryState build() => const PhotoGalleryState();

  /// 載入照片清單與 Blog 識別碼，並預先解析所有快取檔案。
  ///
  /// [photos] 為要載入的照片實體清單。
  /// [blogId] 為目前操作的 Blog 識別碼，用於查詢對應的快取檔案。
  Future<void> load(List<PhotoEntity> photos, String blogId) async {
    state = state.copyWith(photos: photos, blogId: blogId, cachedFiles: {});

    final cacheRepo = ref.read(cacheRepositoryProvider);
    final files = <String, File?>{};
    for (final photo in photos) {
      files[photo.id] = await cacheRepo.cachedFile(photo.filename, blogId);
    }
    state = state.copyWith(cachedFiles: files);
  }

  /// 切換選取模式。離開選取模式時清空已選取的照片。
  void toggleSelectMode() {
    if (state.isSelectMode) {
      state = state.copyWith(isSelectMode: false, selectedIds: {});
    } else {
      state = state.copyWith(isSelectMode: true);
    }
  }

  /// 切換指定照片的選取狀態。
  ///
  /// [photoId] 為要切換選取狀態的照片識別碼。
  void toggleSelection(String photoId) {
    final updated = Set<String>.of(state.selectedIds);
    updated.contains(photoId) ? updated.remove(photoId) : updated.add(photoId);
    state = state.copyWith(selectedIds: updated);
  }

  /// 全選或取消全選。若目前已全選則取消全選，否則全選。
  void selectAll() {
    if (state.selectedIds.length == state.photos.length) {
      state = state.copyWith(selectedIds: {});
    } else {
      state = state.copyWith(
        selectedIds: state.photos.map((p) => p.id).toSet(),
      );
    }
  }

  /// 將已選取的照片儲存至裝置相簿。
  Future<void> saveSelectedToGallery() async {
    state = state.copyWith(saveOperation: () => const AsyncLoading());

    try {
      final selected = state.photos
          .where((p) => state.selectedIds.contains(p.id))
          .toList();
      final repo = ref.read(photoRepositoryProvider);
      await repo.saveToGalleryFromCache(photos: selected, blogId: state.blogId);
      ref
          .read(logRepositoryProvider)
          .logSaveToGallery(
            blogId: state.blogId,
            photoCount: selected.length,
            mode: 'selected',
          );
      state = state.copyWith(
        saveOperation: () => const AsyncData(null),
        selectedIds: {},
        isSelectMode: false,
      );
    } catch (e, st) {
      ref
          .read(logRepositoryProvider)
          .logError(
            errorType: e.runtimeType.toString(),
            message: e.toString(),
            stackTrace: st.toString(),
          );
      state = state.copyWith(
        saveOperation: () => AsyncError(e, st),
        isSelectMode: false,
      );
    }
  }

  /// 將所有照片儲存至裝置相簿。
  Future<void> saveAllToGallery() async {
    state = state.copyWith(saveOperation: () => const AsyncLoading());

    try {
      final repo = ref.read(photoRepositoryProvider);
      await repo.saveToGalleryFromCache(
        photos: state.photos,
        blogId: state.blogId,
      );
      ref
          .read(logRepositoryProvider)
          .logSaveToGallery(
            blogId: state.blogId,
            photoCount: state.photos.length,
            mode: 'all',
          );
      state = state.copyWith(saveOperation: () => const AsyncData(null));
    } catch (e, st) {
      ref
          .read(logRepositoryProvider)
          .logError(
            errorType: e.runtimeType.toString(),
            message: e.toString(),
            stackTrace: st.toString(),
          );
      state = state.copyWith(saveOperation: () => AsyncError(e, st));
    }
  }
}
