import 'package:flutter/material.dart';

/// screenshot mode 的共用外層包裝。
///
/// 會在第一個穩定 frame 後透過 [Semantics.identifier] 暴露可等待的標記，
/// 讓 Maestro 與其他自動化流程知道畫面已可截圖。
class ScreenshotScaffold extends StatefulWidget {
  /// 建立 [ScreenshotScaffold]。
  ///
  /// - [child]：實際要顯示的畫面內容。
  /// - [readinessIdentifier]：畫面就緒後要暴露的識別碼。
  const ScreenshotScaffold({
    super.key,
    required this.child,
    this.readinessIdentifier = 'screenshot_ready',
  });

  /// 實際要顯示的畫面內容。
  final Widget child;

  /// 畫面就緒後要暴露的識別碼。
  final String readinessIdentifier;

  /// 建立 [ScreenshotScaffold] 對應的狀態物件。
  ///
  /// 回傳 [_ScreenshotScaffoldState]。
  @override
  State<ScreenshotScaffold> createState() => _ScreenshotScaffoldState();
}

/// [ScreenshotScaffold] 的狀態管理類。
class _ScreenshotScaffoldState extends State<ScreenshotScaffold> {
  /// 是否已完成第一個穩定 frame。
  bool _isReady = false;

  /// 在第一幀渲染完成後將畫面標記為可截圖。
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      setState(() {
        _isReady = true;
      });
    });
  }

  /// 建構帶有 readiness semantics 的畫面。
  ///
  /// [context] 為目前的 [BuildContext]。
  ///
  /// 回傳包住 [widget.child] 的 [Semantics]。
  @override
  Widget build(BuildContext context) {
    return Semantics(
      container: true,
      identifier: _isReady ? widget.readinessIdentifier : null,
      child: widget.child,
    );
  }
}
