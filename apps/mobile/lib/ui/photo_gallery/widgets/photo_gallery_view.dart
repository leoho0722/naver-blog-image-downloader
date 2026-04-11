import 'dart:async';

import 'package:flutter/material.dart';
import 'package:naver_blog_image_downloader/l10n/app_localizations.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/models/fetch_result.dart';
import '../view_model/photo_gallery_view_model.dart';
import 'photo_card.dart';

/// 照片瀏覽頁面，使用 GridView 網格佈局展示照片卡片。
///
/// 透過 GoRouter `extra` 接收 [FetchResult]，初次進入時自動載入照片清單。
class PhotoGalleryView extends ConsumerStatefulWidget {
  /// 建立 [PhotoGalleryView]。
  ///
  /// [blogId] 為要瀏覽的 Blog 識別碼。
  const PhotoGalleryView({super.key, required this.blogId});

  /// 目前瀏覽的 Blog 識別碼，由路由參數傳入。
  final String blogId;

  /// 建立 [PhotoGalleryView] 對應的 [ConsumerState]。
  ///
  /// 回傳 [_PhotoGalleryViewState] 實例。
  @override
  ConsumerState<PhotoGalleryView> createState() => _PhotoGalleryViewState();
}

/// [PhotoGalleryView] 的狀態管理類，處理照片載入、選取模式與儲存中對話框。
class _PhotoGalleryViewState extends ConsumerState<PhotoGalleryView> {
  /// 是否已完成初始載入（防止 [didChangeDependencies] 重複觸發）。
  bool _loaded = false;

  /// 「儲存中」對話框是否正在顯示，用於避免重複開啟或多餘關閉。
  bool _isSavingDialogOpen = false;

  /// 依賴變更時初始化並載入照片資料。
  ///
  /// 首次呼叫時從路由 `extra` 取得 [FetchResult]，觸發 ViewModel 載入照片清單。
  /// 透過 [_loaded] 旗標防止重複觸發。
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_loaded) {
      _loaded = true;
      final fetchResult = GoRouterState.of(context).extra as FetchResult?;
      if (fetchResult != null) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            ref
                .read(photoGalleryViewModelProvider.notifier)
                .load(fetchResult.photos, fetchResult.blogId);
          }
        });
      }
    }
  }

  /// 建構照片瀏覽頁面的 Widget 樹。
  ///
  /// [context] 為目前的 [BuildContext]，用於取得本地化資源與導航。
  ///
  /// 回傳包含 AppBar 操作列與 GridView 照片網格的 [Scaffold]。
  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final state = ref.watch(photoGalleryViewModelProvider);
    final photos = state.photos;

    ref.listen(photoGalleryViewModelProvider.select((s) => s.isSaving), (
      prev,
      next,
    ) {
      if (next && !_isSavingDialogOpen) {
        _isSavingDialogOpen = true;
        unawaited(
          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (context) => Center(
              child: Material(
                color: Theme.of(context).colorScheme.surfaceContainerHigh,
                borderRadius: BorderRadius.circular(28),
                child: SizedBox(
                  width: 140,
                  height: 140,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const CircularProgressIndicator(),
                      const SizedBox(height: 16),
                      Text(l10n.gallerySaving),
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      } else if (!next && _isSavingDialogOpen) {
        _isSavingDialogOpen = false;
        Navigator.of(context).pop();
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.galleryTitle(photos.length)),
        actions: [
          IconButton(
            icon: Icon(state.isSelectMode ? Icons.close : Icons.select_all),
            tooltip: state.isSelectMode
                ? l10n.galleryDeselectMode
                : l10n.gallerySelectMode,
            onPressed: ref
                .read(photoGalleryViewModelProvider.notifier)
                .toggleSelectMode,
          ),
          if (state.isSelectMode) ...[
            IconButton(
              icon: const Icon(Icons.check_box_outlined),
              tooltip: l10n.gallerySelectAll,
              onPressed: ref
                  .read(photoGalleryViewModelProvider.notifier)
                  .selectAll,
            ),
            IconButton(
              icon: const Icon(Icons.save_alt),
              tooltip: l10n.gallerySaveSelected,
              onPressed: state.selectedIds.isEmpty
                  ? null
                  : ref
                        .read(photoGalleryViewModelProvider.notifier)
                        .saveSelectedToGallery,
            ),
          ] else
            IconButton(
              icon: const Icon(Icons.save),
              tooltip: l10n.gallerySaveAll,
              onPressed: photos.isEmpty
                  ? null
                  : ref
                        .read(photoGalleryViewModelProvider.notifier)
                        .saveAllToGallery,
            ),
        ],
      ),
      body: photos.isEmpty
          ? Center(child: Text(l10n.galleryEmpty))
          : GridView.builder(
              padding: const EdgeInsets.all(4),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                mainAxisSpacing: 4,
                crossAxisSpacing: 4,
              ),
              itemCount: photos.length,
              itemBuilder: (context, index) {
                final photo = photos[index];
                return PhotoCard(
                  photo: photo,
                  cachedFile: state.cachedFiles[photo.id],
                  isSelected: state.selectedIds.contains(photo.id),
                  isSelectMode: state.isSelectMode,
                  onTap: () => _onPhotoTap(context, index),
                  onSelect: () => ref
                      .read(photoGalleryViewModelProvider.notifier)
                      .toggleSelection(photo.id),
                );
              },
            ),
    );
  }

  /// 使用者點擊照片時，導航至照片詳細頁面。
  ///
  /// [context] 為當前的 BuildContext，用於執行路由導航。
  /// [index] 為被點擊照片在清單中的索引位置。
  void _onPhotoTap(BuildContext context, int index) {
    final state = ref.read(photoGalleryViewModelProvider);
    final photo = state.photos[index];
    context.push(
      '/detail/${photo.id}',
      extra: (
        photos: state.photos,
        blogId: state.blogId,
        initialIndex: index,
        cachedFiles: state.cachedFiles,
      ),
    );
  }
}
