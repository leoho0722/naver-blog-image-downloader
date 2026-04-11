import 'dart:io';

import 'package:flutter/material.dart';

import '../../../data/models/photo_entity.dart';

/// 照片卡片元件，負責單張照片的縮圖顯示與選取互動。
class PhotoCard extends StatelessWidget {
  /// 建立 [PhotoCard]。
  ///
  /// [photo] 為照片實體資料。
  /// [cachedFile] 為本機快取的照片檔案，若尚未快取則為 `null`。
  /// [isSelected] 表示此卡片是否已被選取。
  /// [isSelectMode] 表示是否處於選取模式。
  /// [onTap] 為非選取模式下點擊照片的回呼。
  /// [onSelect] 為選取模式下點擊照片的回呼。
  const PhotoCard({
    super.key,
    required this.photo,
    required this.cachedFile,
    required this.isSelected,
    required this.isSelectMode,
    required this.onTap,
    required this.onSelect,
  });

  /// 照片實體資料。
  final PhotoEntity photo;

  /// 本機快取的照片檔案，若尚未快取則為 null。
  final File? cachedFile;

  /// 是否已被選取。
  final bool isSelected;

  /// 是否處於選取模式。
  final bool isSelectMode;

  /// 非選取模式下點擊照片的回呼（進入全螢幕檢視）。
  final VoidCallback onTap;

  /// 選取模式下點擊照片的回呼（切換選取狀態）。
  final VoidCallback onSelect;

  /// 建構照片卡片的 Widget 樹。
  ///
  /// [context] 為目前的 [BuildContext]。
  ///
  /// 回傳包含縮圖與選取勾選框的堆疊 [Widget]。
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: isSelectMode ? onSelect : onTap,
      child: Stack(
        fit: StackFit.expand,
        children: [
          if (cachedFile != null)
            Image.file(cachedFile!, fit: BoxFit.cover, cacheWidth: 200)
          else
            const ColoredBox(
              color: Colors.black12,
              child: Center(child: CircularProgressIndicator()),
            ),
          if (isSelectMode)
            Positioned(
              top: 4,
              right: 4,
              child: Checkbox(value: isSelected, onChanged: (_) => onSelect()),
            ),
        ],
      ),
    );
  }
}
