import 'dart:convert';

import 'package:flutter/material.dart';

import '../../../config/whats_new_icon_resolver.dart';
import '../../../data/models/whats_new_item.dart';

// region 純文字列表 Dialog

/// 純文字格式的圓角 Dialog，以列表方式呈現功能項目。
///
/// [title] 為 Dialog 頂部標題文字。
/// [entry] 為功能內容（所有項目須為 [WhatsNewTextItem]）。
/// [dismissLabel] 為底部關閉按鈕的文字。
/// [onDismiss] 為使用者點擊關閉按鈕時的回呼。
class WhatsNewTextDialog extends StatelessWidget {
  /// 建立 [WhatsNewTextDialog]。
  ///
  /// [title] 為 Dialog 標題。
  /// [entry] 為功能內容。
  /// [dismissLabel] 為關閉按鈕文字。
  /// [onDismiss] 為關閉回呼。
  const WhatsNewTextDialog({
    required this.title,
    required this.entry,
    required this.dismissLabel,
    required this.onDismiss,
    super.key,
  });

  /// Dialog 頂部標題文字。
  final String title;

  /// 功能內容。
  final WhatsNewEntry entry;

  /// 底部關閉按鈕的文字。
  final String dismissLabel;

  /// 使用者點擊關閉按鈕時的回呼。
  final VoidCallback onDismiss;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
      clipBehavior: Clip.antiAlias,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(title, style: theme.textTheme.headlineSmall),
            const SizedBox(height: 20),
            ...entry.items.map((item) {
              final textItem = item as WhatsNewTextItem;
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      resolveIcon(textItem.icon),
                      size: 32,
                      color: theme.colorScheme.primary,
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            textItem.title,
                            style: theme.textTheme.titleSmall,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            textItem.description,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            }),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: onDismiss,
                child: Text(dismissLabel),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// endregion

// region 圖文 PageView Dialog

/// 圖文格式的圓角 Dialog，以 PageView 輪播呈現功能項目。
///
/// [title] 為 Dialog 頂部標題文字。
/// [entry] 為功能內容（項目須包含 [WhatsNewImageItem]）。
/// [closeLabel] 為所有頁面的關閉按鈕文字。
/// [onDismiss] 為使用者點擊關閉按鈕時的回呼。
class WhatsNewImageDialog extends StatefulWidget {
  /// 建立 [WhatsNewImageDialog]。
  ///
  /// [title] 為 Dialog 標題。
  /// [entry] 為功能內容。
  /// [closeLabel] 為關閉按鈕文字。
  /// [onDismiss] 為關閉回呼。
  const WhatsNewImageDialog({
    required this.title,
    required this.entry,
    required this.closeLabel,
    required this.onDismiss,
    super.key,
  });

  /// Dialog 頂部標題文字。
  final String title;

  /// 功能內容。
  final WhatsNewEntry entry;

  /// 所有頁面的關閉按鈕文字。
  final String closeLabel;

  /// 使用者點擊關閉按鈕時的回呼。
  final VoidCallback onDismiss;

  @override
  State<WhatsNewImageDialog> createState() => _WhatsNewImageDialogState();
}

/// [WhatsNewImageDialog] 的狀態管理類，控制 PageView 頁面切換與圓點指示器。
class _WhatsNewImageDialogState extends State<WhatsNewImageDialog> {
  /// PageView 的頁面控制器。
  final _pageController = PageController();

  /// 目前顯示的頁面索引。
  int _currentPage = 0;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final items = widget.entry.items;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
      clipBehavior: Clip.antiAlias,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(widget.title, style: theme.textTheme.headlineSmall),
            const SizedBox(height: 16),
            SizedBox(
              height: 320,
              child: PageView.builder(
                controller: _pageController,
                itemCount: items.length,
                onPageChanged: (index) => setState(() => _currentPage = index),
                itemBuilder: (context, index) {
                  final item = items[index];
                  return _buildPage(theme, item);
                },
              ),
            ),
            if (items.length > 1) ...[
              const SizedBox(height: 12),
              _buildPageIndicator(theme, items.length),
            ],
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: widget.onDismiss,
                child: Text(widget.closeLabel),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// 建構單一頁面內容，根據 item 類型自適應渲染。
  ///
  /// [theme] 為當前主題。
  /// [item] 為功能項目。
  ///
  /// 回傳頁面 Widget。
  Widget _buildPage(ThemeData theme, WhatsNewItem item) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Column(
        children: switch (item) {
          WhatsNewImageItem(:final base64Image) => [
            Expanded(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.memory(
                  base64Decode(base64Image),
                  fit: BoxFit.contain,
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              item.title,
              style: theme.textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 4),
            Text(
              item.description,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
          ],
          WhatsNewTextItem(:final icon) => [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(
                  resolveIcon(icon),
                  size: 32,
                  color: theme.colorScheme.primary,
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item.title, style: theme.textTheme.titleSmall),
                      const SizedBox(height: 2),
                      Text(
                        item.description,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        },
      ),
    );
  }

  /// 建構圓點頁面指示器。
  ///
  /// [theme] 為當前主題。
  /// [pageCount] 為總頁數。
  ///
  /// 回傳指示器 Widget。
  Widget _buildPageIndicator(ThemeData theme, int pageCount) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(pageCount, (index) {
        final isActive = index == _currentPage;
        return Container(
          width: isActive ? 10 : 8,
          height: isActive ? 10 : 8,
          margin: const EdgeInsets.symmetric(horizontal: 4),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isActive
                ? theme.colorScheme.primary
                : theme.colorScheme.outlineVariant,
          ),
        );
      }),
    );
  }
}

// endregion
