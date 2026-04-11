import 'package:flutter/material.dart';

import '../../../l10n/app_localizations.dart';
import '../view_model/whats_new_view_model.dart';
import 'whats_new_dialog.dart';

/// 顯示「新功能介紹」或「首次安裝引導」的 Dialog。
///
/// 根據 [whatsNewState] 的類型與內容格式自動選擇 Dialog 樣式：
/// - 純文字項目 → [WhatsNewTextDialog]
/// - 含圖文項目 → [WhatsNewImageDialog]
///
/// [context] 為 `BuildContext`，用於取得 l10n 資源與顯示 Dialog。
/// [whatsNewState] 為當前的顯示狀態。
Future<void> showWhatsNewDialog(
  BuildContext context,
  WhatsNewState whatsNewState,
) {
  final l10n = AppLocalizations.of(context);

  final entry = switch (whatsNewState) {
    WhatsNewOnboarding(:final entry) => entry,
    WhatsNewUpdate(:final entry) => entry,
    WhatsNewHidden() => null,
  };

  final title = switch (whatsNewState) {
    WhatsNewOnboarding() => l10n.whatsNewOnboardingTitle,
    WhatsNewUpdate(:final version) => l10n.whatsNewTitle(version),
    WhatsNewHidden() => '',
  };

  if (entry == null) return Future.value();

  void dismiss() => Navigator.of(context).pop();

  if (entry.hasImageItems) {
    return showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (_) => WhatsNewImageDialog(
        title: title,
        entry: entry,
        closeLabel: l10n.whatsNewCloseButton,
        onDismiss: dismiss,
      ),
    );
  }

  return showDialog<void>(
    context: context,
    barrierDismissible: false,
    builder: (_) => WhatsNewTextDialog(
      title: title,
      entry: entry,
      dismissLabel: l10n.whatsNewDismissButton,
      onDismiss: dismiss,
    ),
  );
}
