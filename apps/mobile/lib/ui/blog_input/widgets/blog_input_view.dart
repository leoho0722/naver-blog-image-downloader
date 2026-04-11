import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:naver_blog_image_downloader/l10n/app_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../config/bottom_sheet_animation.dart';
import '../../../data/repositories/log_repository.dart';
import '../../../data/models/fetch_result.dart';
import '../../core/naver_url_validator.dart';
import '../../download/widgets/download_view.dart';
import '../../settings/widgets/settings_view.dart';
import '../../whats_new/view_model/whats_new_view_model.dart';
import '../../whats_new/widgets/whats_new_view.dart';
import '../view_model/blog_input_view_model.dart';

/// Blog 網址輸入頁面，提供文字輸入欄位讓使用者貼上 Naver Blog 網址並取得照片列表。
class BlogInputView extends ConsumerStatefulWidget {
  /// 建立 [BlogInputView]。
  const BlogInputView({super.key});

  /// 建立 [BlogInputView] 對應的 [ConsumerState]。
  ///
  /// 回傳 [_BlogInputViewState] 實例。
  @override
  ConsumerState<BlogInputView> createState() => _BlogInputViewState();
}

/// [BlogInputView] 的狀態管理類，處理網址輸入、剪貼板偵測、API 擷取流程與導航。
class _BlogInputViewState extends ConsumerState<BlogInputView>
    with WidgetsBindingObserver, SingleTickerProviderStateMixin {
  /// 網址輸入欄位的文字控制器，綁定至 [TextField]。
  final _controller = TextEditingController();

  /// 設定頁面 bottom sheet 的動畫控制器，控制 [SettingsView] 彈出動畫。
  late final AnimationController _sheetAnimationController;

  /// 初始化頁面狀態。
  ///
  /// 加入 [WidgetsBindingObserver] 以監聽 App 生命週期事件，
  /// 建立設定頁面 bottom sheet 的動畫控制器，
  /// 並在第一幀完成後檢查是否需要顯示新功能介紹或首次安裝引導。
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _sheetAnimationController = BottomSheetAnimation.createController(
      vsync: this,
      platform: defaultTargetPlatform,
    );
    WidgetsBinding.instance.addPostFrameCallback((_) => _checkWhatsNew());
  }

  /// 檢查是否需要顯示「新功能介紹」或「首次安裝引導」Dialog。
  ///
  /// 等待 [WhatsNewViewModel] 非同步初始化完成後，
  /// 若狀態為 [WhatsNewOnboarding] 或 [WhatsNewUpdate] 則顯示全螢幕 Dialog，
  /// Dialog 關閉後呼叫 [WhatsNewViewModel.dismiss] 寫入版本號。
  Future<void> _checkWhatsNew() async {
    final whatsNewState = await ref.read(whatsNewViewModelProvider.future);
    if (whatsNewState is WhatsNewHidden || !mounted) return;
    await showWhatsNewDialog(context, whatsNewState);
    if (mounted) {
      await ref.read(whatsNewViewModelProvider.notifier).dismiss();
    }
  }

  /// 釋放頁面資源。
  ///
  /// 移除 [WidgetsBindingObserver]，
  /// 並銷毀 bottom sheet 動畫控制器與文字輸入控制器，避免記憶體洩漏。
  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _sheetAnimationController.dispose();
    _controller.dispose();
    super.dispose();
  }

  /// 監聽 App 生命週期狀態變更。
  ///
  /// 當 App 從背景恢復至前景（[AppLifecycleState.resumed]）時，
  /// 自動檢查剪貼板是否含有 Naver Blog 網址。
  ///
  /// [state] 為目前的 App 生命週期狀態。
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _checkClipboardOnResume();
    }
  }

  /// 將 [FetchErrorType] 映射為本地化錯誤訊息。
  ///
  /// [l10n] 為當前的本地化資源。
  /// [error] 為擷取失敗例外，包含錯誤類型與可選的 HTTP 狀態碼。
  ///
  /// 回傳對應錯誤類型的本地化字串。
  String _localizedError(AppLocalizations l10n, FetchException error) {
    return switch (error.errorType) {
      FetchErrorType.emptyUrl => l10n.errorEmptyUrl,
      FetchErrorType.timeout => l10n.errorTimeout,
      FetchErrorType.serverUnavailable => l10n.errorServerUnavailable(
        error.statusCode ?? 0,
      ),
      FetchErrorType.apiFailed => l10n.errorApiFailed,
      FetchErrorType.serverError => l10n.errorServerError,
      FetchErrorType.networkError => l10n.errorNetworkError,
      FetchErrorType.unknown => l10n.errorGeneric,
    };
  }

  /// 將 [FetchLoadingPhase] 映射為本地化狀態文字。
  ///
  /// [l10n] 為當前的本地化資源。
  /// [phase] 為目前的載入階段。
  ///
  /// 回傳對應載入階段的本地化字串。
  String _localizedPhase(AppLocalizations l10n, FetchLoadingPhase phase) {
    return switch (phase) {
      FetchLoadingPhase.submitting => l10n.statusSubmitting,
      FetchLoadingPhase.processing => l10n.statusProcessing,
      FetchLoadingPhase.completed => l10n.statusCompleted,
    };
  }

  /// 當 App 從背景恢復時，檢查剪貼板是否包含 Naver Blog 網址，
  /// 若有則彈出對話框詢問使用者是否貼上。
  ///
  /// 回傳 [Future<void>]，於剪貼板讀取與對話框互動完成後結束。
  Future<void> _checkClipboardOnResume() async {
    final data = await Clipboard.getData(Clipboard.kTextPlain);
    final text = data?.text?.trim();
    if (text == null || text.isEmpty) return;
    if (!NaverUrlValidator.isValid(text)) return;
    if (text == _controller.text) return;
    if (!mounted) return;

    final l10n = AppLocalizations.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.blogInputClipboardDetectedTitle),
        content: Text(text),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(l10n.commonCancel),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(l10n.blogInputPasteButton),
          ),
        ],
      ),
    );
    if (confirmed == true && mounted) {
      _pasteUrl(text);
    }
  }

  /// 使用者點擊「貼上」按鈕時觸發，從剪貼板讀取內容並驗證是否為合法網址。
  ///
  /// 若剪貼板為空或內容非合法 Naver Blog 網址，會顯示對應的提示對話框。
  ///
  /// 回傳 [Future<void>]，於剪貼板讀取與驗證流程完成後結束。
  Future<void> _onPasteButtonPressed() async {
    final data = await Clipboard.getData(Clipboard.kTextPlain);
    final text = data?.text?.trim();
    if (!mounted) return;

    final l10n = AppLocalizations.of(context);

    if (text == null || text.isEmpty) {
      unawaited(
        showDialog<void>(
          context: context,
          builder: (context) => AlertDialog(
            title: Text(l10n.blogInputClipboardEmptyTitle),
            content: Text(l10n.blogInputClipboardEmptyContent),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: Text(l10n.commonOk),
              ),
            ],
          ),
        ),
      );
      return;
    }

    if (!NaverUrlValidator.isValid(text)) {
      unawaited(
        showDialog<void>(
          context: context,
          builder: (context) => AlertDialog(
            title: Text(l10n.blogInputClipboardInvalidTitle),
            content: Text(l10n.blogInputClipboardInvalidContent),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: Text(l10n.commonOk),
              ),
            ],
          ),
        ),
      );
      return;
    }

    _pasteUrl(text);
  }

  /// 將指定的網址填入輸入欄位並通知 ViewModel。
  ///
  /// [url] 為要貼上的 Naver Blog 網址字串。
  void _pasteUrl(String url) {
    _controller.text = url;
    ref.read(blogInputViewModelProvider.notifier).onUrlChanged(url);
  }

  /// 以 AlertDialog 顯示錯誤訊息。
  ///
  /// [error] 為擷取失敗例外，包含錯誤類型與可選的 HTTP 狀態碼。
  void _showErrorDialog(FetchException error) {
    if (!mounted) return;
    final l10n = AppLocalizations.of(context);
    unawaited(
      showDialog<void>(
        context: context,
        builder: (context) => AlertDialog(
          title: Text(l10n.blogInputErrorDialogTitle),
          content: Text(_localizedError(l10n, error)),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(l10n.commonOk),
            ),
          ],
        ),
      ),
    );
  }

  /// 處理照片擷取結果：若有失敗先警告，若已快取直接導航，否則顯示下載對話框。
  ///
  /// [fetchResult] 為 API 回傳的照片擷取結果，包含照片清單與失敗資訊。
  ///
  /// 回傳 [Future<void>]，於警告對話框、下載對話框互動與導航完成後結束。
  Future<void> _handleFetchResult(FetchResult fetchResult) async {
    // 有擷取失敗時，先顯示警告對話框
    if (fetchResult.failureDownloads > 0) {
      final shouldContinue = await _showFetchFailureDialog(fetchResult);
      if (shouldContinue != true || !mounted) return;
    }

    if (fetchResult.isFullyCached) {
      // 已完整快取，直接跳到照片瀏覽頁
      _navigateToGallery(fetchResult);
      return;
    }

    // 顯示下載進度對話框
    final completed = await showDownloadDialog(context, fetchResult);
    if (completed == true && mounted) {
      _navigateToGallery(fetchResult);
    }
  }

  /// 顯示部分照片擷取失敗的警告對話框，回傳使用者是否選擇繼續下載。
  ///
  /// [fetchResult] 為照片擷取結果，用於顯示成功與失敗數量。
  /// 回傳 `true` 表示使用者選擇繼續下載，`false` 或 `null` 表示取消。
  Future<bool?> _showFetchFailureDialog(FetchResult fetchResult) {
    final l10n = AppLocalizations.of(context);
    return showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.blogInputFetchFailureTitle),
        content: Text(
          l10n.blogInputFetchFailureContent(
            fetchResult.totalImages,
            fetchResult.photos.length,
            fetchResult.failureDownloads,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(l10n.blogInputCancelDownload),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(l10n.blogInputContinueDownload),
          ),
        ],
      ),
    );
  }

  /// 導航至照片瀏覽頁面，傳入擷取結果作為頁面參數。
  ///
  /// [fetchResult] 為要傳遞給照片瀏覽頁面的擷取結果。
  void _navigateToGallery(FetchResult fetchResult) {
    context.push('/gallery/${fetchResult.blogId}', extra: fetchResult);
  }

  /// 以 modal bottom sheet 開啟設定頁面。
  ///
  /// 使用 [_sheetAnimationController] 控制過場動畫，
  /// 並以 [SettingsView] 作為 bottom sheet 的內容。
  void _showSettingsSheet() {
    ref.read(logRepositoryProvider).logPageNavigation(screenName: 'settings');
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      transitionAnimationController: _sheetAnimationController,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      clipBehavior: Clip.antiAlias,
      builder: (_) => const SettingsView(),
    );
  }

  /// 建構 Blog 網址輸入頁面的 Widget 樹。
  ///
  /// 包含 AppBar（標題與設定按鈕）、網址輸入欄位、載入狀態指示器，
  /// 以及「取得照片」按鈕。根據 [BlogInputState.fetchResult] 自動切換
  /// 載入中與一般狀態的 UI 呈現。
  ///
  /// [context] 為目前的 [BuildContext]，用於取得本地化資源。
  ///
  /// 回傳完整的頁面 [Widget]。
  @override
  Widget build(BuildContext context) {
    final state = ref.watch(blogInputViewModelProvider);

    ref.listen(blogInputViewModelProvider, (prev, next) {
      final prevFetch = prev?.fetchResult;
      final nextFetch = next.fetchResult;
      if (nextFetch is AsyncError && prevFetch is! AsyncError) {
        final error = nextFetch.error;
        ref
            .read(blogInputViewModelProvider.notifier)
            .onUrlChanged(next.blogUrl);
        if (error is FetchException) _showErrorDialog(error);
      } else if (nextFetch is AsyncData<FetchResult?> &&
          nextFetch.value != null &&
          (prevFetch is! AsyncData<FetchResult?> || prevFetch.value == null)) {
        ref.read(blogInputViewModelProvider.notifier).reset();
        _handleFetchResult(nextFetch.value!);
      }
    });

    final fetchResult = state.fetchResult;
    final isLoading = state.isLoading;
    final l10n = AppLocalizations.of(context);

    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: Scaffold(
        appBar: AppBar(
          title: Text(l10n.blogInputAppBarTitle),
          actions: [
            IconButton(
              icon: const Icon(Icons.settings),
              onPressed: _showSettingsSheet,
            ),
          ],
        ),
        body: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              TextField(
                controller: _controller,
                onChanged: ref
                    .read(blogInputViewModelProvider.notifier)
                    .onUrlChanged,
                decoration: InputDecoration(
                  labelText: l10n.blogInputUrlLabel,
                  hintText: l10n.blogInputUrlHint,
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.content_paste),
                    tooltip: l10n.blogInputPasteTooltip,
                    onPressed: _onPasteButtonPressed,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              if (fetchResult is AsyncLoading &&
                  state.loadingPhase != null) ...[
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(
                      height: 16,
                      width: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _localizedPhase(l10n, state.loadingPhase!),
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: isLoading
                      ? null
                      : () {
                          FocusScope.of(context).unfocus();
                          ref
                              .read(blogInputViewModelProvider.notifier)
                              .fetchPhotos();
                        },
                  child: isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : Text(l10n.blogInputFetchButton),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
