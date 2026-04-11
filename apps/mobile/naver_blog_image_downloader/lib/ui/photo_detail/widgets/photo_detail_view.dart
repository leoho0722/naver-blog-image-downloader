import 'dart:io';

import 'package:flutter/material.dart';
import 'package:naver_blog_image_downloader/l10n/app_localizations.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/models/photo_entity.dart';
import '../../../data/services/photo_viewer_service.dart';
import '../view_model/photo_detail_view_model.dart';

/// 照片詳細頁面（薄殼），僅負責啟動原生全螢幕檢視器與處理回呼。
///
/// 不渲染任何照片 UI，所有顯示邏輯由原生端（iOS SwiftUI / Android Compose）處理。
/// 透過 [PhotoViewerService] 傳送照片路徑、l10n 字串與 theme 色彩至原生端。
class PhotoDetailView extends ConsumerStatefulWidget {
  /// 建立 [PhotoDetailView]。
  ///
  /// [photoId] 為要顯示的照片識別碼，由路由參數傳入。
  const PhotoDetailView({super.key, required this.photoId});

  /// 要顯示的照片識別碼，由路由參數傳入。
  final String photoId;

  /// 建立 [PhotoDetailView] 對應的 [ConsumerState]。
  ///
  /// 回傳 [_PhotoDetailViewState] 實例。
  @override
  ConsumerState<PhotoDetailView> createState() => _PhotoDetailViewState();
}

/// [PhotoDetailView] 的狀態管理類，負責啟動原生檢視器與處理回呼。
class _PhotoDetailViewState extends ConsumerState<PhotoDetailView> {
  /// 是否已完成初始載入（防止 [didChangeDependencies] 重複觸發）。
  bool _loaded = false;

  /// 快取的 [PhotoViewerService] 引用，供 [dispose] 安全使用。
  PhotoViewerService? _photoViewerService;

  /// 依賴變更時初始化並啟動原生圖片檢視器。
  ///
  /// 首次呼叫時從路由 `extra` 取得照片清單、初始索引與快取檔案 Map，
  /// 觸發 ViewModel 載入後啟動原生檢視器，並註冊回呼處理器。
  /// 透過 [_loaded] 旗標防止重複觸發。
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_loaded) {
      _loaded = true;
      final extra = GoRouterState.of(context).extra;
      if (extra
          is ({
            List<PhotoEntity> photos,
            String blogId,
            int initialIndex,
            Map<String, File?> cachedFiles,
          })) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            _launchNativeViewer(
              extra.photos,
              extra.blogId,
              extra.initialIndex,
              extra.cachedFiles,
            );
          }
        });
      }
    }
  }

  /// 釋放資源，移除原生回呼處理器。
  @override
  void dispose() {
    _photoViewerService?.removeCallbackHandler();
    super.dispose();
  }

  /// 建構空白 Scaffold（原生檢視器覆蓋在上層）。
  ///
  /// [context] 為目前的 [BuildContext]。
  ///
  /// 回傳空白 [Scaffold]，背景為黑色以避免閃白。
  @override
  Widget build(BuildContext context) {
    return const Scaffold(backgroundColor: Colors.black);
  }

  /// 組建參數並啟動原生全螢幕圖片檢視器。
  ///
  /// - [photos]：照片實體清單。
  /// - [blogId]：Blog 識別碼。
  /// - [initialIndex]：初始顯示的照片索引。
  /// - [cachedFiles]：照片 ID 對應快取檔案的 Map。
  void _launchNativeViewer(
    List<PhotoEntity> photos,
    String blogId,
    int initialIndex,
    Map<String, File?> cachedFiles,
  ) {
    // 更新 ViewModel 狀態
    ref
        .read(photoDetailViewModelProvider.notifier)
        .loadAll(photos, blogId, initialIndex, cachedFiles);

    // 組建檔案路徑清單
    final filePaths = photos.map((p) => cachedFiles[p.id]?.path ?? '').toList();

    // 收集 l10n 字串
    final l10n = AppLocalizations.of(context);
    final localizedStrings = {
      'fileInfo': l10n.detailFileInfo,
      'fileSize': l10n.detailFileSize,
      'dimensions': l10n.detailDimensions,
    };

    // 收集 theme 色彩 ARGB
    final colorScheme = Theme.of(context).colorScheme;
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final themeColors = {
      'surfaceContainerHigh': colorScheme.surfaceContainerHigh.toARGB32(),
      'onSurface': colorScheme.onSurface.toARGB32(),
      'onSurfaceVariant': colorScheme.onSurfaceVariant.toARGB32(),
      'primary': colorScheme.primary.toARGB32(),
      'surface': colorScheme.surface.toARGB32(),
    };

    // 註冊回呼
    final service = ref.read(photoViewerServiceProvider);
    _photoViewerService = service;
    service.setCallbackHandler(
      onSaveCompleted: (blogId) {
        ref
            .read(photoDetailViewModelProvider.notifier)
            .logSaveToGallery(blogId);
      },
      onDismissed: (_) {
        if (mounted) context.pop();
      },
    );

    // 啟動原生檢視器
    service.openViewer(
      filePaths: filePaths,
      initialIndex: initialIndex,
      blogId: blogId,
      localizedStrings: localizedStrings,
      isDarkMode: isDarkMode,
      themeColors: themeColors,
    );
  }
}
