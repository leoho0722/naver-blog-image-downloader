import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../data/repositories/log_repository.dart';
import '../ui/blog_input/widgets/blog_input_view.dart';
import '../ui/photo_detail/widgets/photo_detail_view.dart';
import '../ui/photo_gallery/widgets/photo_gallery_view.dart';
import '../ui/settings/widgets/settings_view.dart';

part 'app_router.g.dart';

/// 應用程式路由的 Riverpod provider（App 級單例）。
///
/// [ref] 為 Riverpod 的依賴參照，用於注入 [LogRepository] 至 [_LoggingObserver]。
///
/// 回傳已設定路由規則與導航日誌觀察者的 [GoRouter] 實例。
@Riverpod(keepAlive: true)
GoRouter appRouter(Ref ref) {
  return GoRouter(
    initialLocation: '/',
    observers: [_LoggingObserver(ref)],
    routes: [
      GoRoute(path: '/', builder: (context, state) => const BlogInputView()),
      GoRoute(
        path: '/gallery/:blogId',
        builder: (context, state) =>
            PhotoGalleryView(blogId: state.pathParameters['blogId']!),
      ),
      GoRoute(
        path: '/detail/:photoId',
        builder: (context, state) =>
            PhotoDetailView(photoId: state.pathParameters['photoId']!),
      ),
      GoRoute(
        path: '/settings',
        builder: (context, state) => const SettingsView(),
      ),
    ],
  );
}

/// 導航日誌觀察者，在頁面推入時記錄 `page_navigation` log。
///
/// 將 GoRouter 的路由路徑映射為可讀的畫面名稱後，
/// 透過 [LogRepository.logPageNavigation] 寫入 Firestore。
class _LoggingObserver extends NavigatorObserver {
  /// 建立 [_LoggingObserver]。
  ///
  /// - [_ref]：Riverpod 的依賴參照，用於存取 [logRepositoryProvider]。
  _LoggingObserver(this._ref);

  /// Riverpod 的依賴參照。
  final Ref _ref;

  /// 當新頁面被推入導航堆疊時觸發，記錄頁面導航 log。
  ///
  /// - [route]：被推入的路由。
  /// - [previousRoute]：推入前的路由（可能為 null）。
  @override
  void didPush(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didPush(route, previousRoute);
    final name = _mapRouteToScreenName(route);
    if (name != null) {
      _ref.read(logRepositoryProvider).logPageNavigation(screenName: name);
    }
  }

  /// 將路由路徑映射為可讀的畫面名稱。
  ///
  /// - [route]：要映射的路由。
  ///
  /// 回傳畫面名稱字串；無法識別的路由回傳 `null`。
  String? _mapRouteToScreenName(Route<dynamic> route) {
    final path = route.settings.name;
    if (path == null) return null;
    if (path == '/') return 'blog_input';
    if (path.startsWith('/gallery')) return 'photo_gallery';
    if (path.startsWith('/detail')) return 'photo_detail';
    if (path == '/settings') return 'settings';
    return path;
  }
}
