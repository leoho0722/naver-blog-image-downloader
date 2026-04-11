import 'package:flutter/material.dart';

/// 依照平台（iOS / Android）提供不同動畫時長的 modal bottom sheet 動畫配置。
///
/// iOS 動畫較慢（500ms 展開 / 350ms 收合），貼近原生體驗；
/// 其他平台使用稍快的預設值（400ms / 250ms）。
abstract final class BottomSheetAnimation {
  /// 建立平台特定的 [AnimationController]，傳入 `showModalBottomSheet` 的
  /// `transitionAnimationController` 參數即可套用。
  ///
  /// [vsync] 為動畫 ticker 來源，通常由 [SingleTickerProviderStateMixin] 提供。
  /// [platform] 決定使用 iOS 或 Android 的動畫時長。
  ///
  /// 回傳已設定展開與收合時長的 [AnimationController]。
  static AnimationController createController({
    required TickerProvider vsync,
    required TargetPlatform platform,
  }) {
    final (duration, reverseDuration) = switch (platform) {
      TargetPlatform.iOS => (
        const Duration(milliseconds: 500),
        const Duration(milliseconds: 350),
      ),
      _ => (
        const Duration(milliseconds: 400),
        const Duration(milliseconds: 250),
      ),
    };

    return AnimationController(
      vsync: vsync,
      duration: duration,
      reverseDuration: reverseDuration,
    );
  }
}
