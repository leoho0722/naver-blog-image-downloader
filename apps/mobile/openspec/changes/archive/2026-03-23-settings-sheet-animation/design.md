## Context

`BlogInputView` AppBar 的設定按鈕透過 `showModalBottomSheet` 呈現 `SettingsView`。目前使用 Flutter 預設的 `AnimationController`（enter 250ms / exit 200ms），在 iOS 與 Android 上的動畫體感不夠流暢，缺乏各平台的原生感。

現有程式碼直接在 `onPressed` 內呼叫 `showModalBottomSheet`，未傳入 `transitionAnimationController` 參數。`_BlogInputViewState` 目前僅使用 `WidgetsBindingObserver` mixin，尚無 `TickerProvider` 能力。

## Goals / Non-Goals

**Goals:**

- 提供平台特定的 modal bottom sheet 動畫時長（iOS: 500ms/350ms, Android: 400ms/250ms）
- 遵循 Flutter 官方 Explicit Animation 模式（`SingleTickerProviderStateMixin` + `AnimationController`）
- 確保動畫 controller 可安全跨多次開啟重用
- 維持現有 bottom sheet 外觀與功能不變

**Non-Goals:**

- 不自定義動畫曲線（框架內部已套用 Material 3 `decelerateEasing`）
- 不修改 `SettingsView` 本身
- 不移除 `app_router.dart` 中的 `/settings` 路由（屬獨立 scope）

## Decisions

### 使用 `abstract final class BottomSheetAnimation` 集中管理動畫配置

在 `lib/config/bottom_sheet_animation.dart` 建立配置類別，提供 `createController` 靜態工廠方法。此做法與專案現有的 `AppTheme`、`AppConfig` 風格一致。

**替代方案：** 直接在 `_BlogInputViewState.initState` 內建立 `AnimationController`。不採用原因：平台判斷邏輯與動畫時長常數將散落在 View 層，不利於未來其他頁面重用。

### 使用 `SingleTickerProviderStateMixin` 而非 `TickerProviderStateMixin`

`_BlogInputViewState` 僅需一個 `AnimationController`（sheet 動畫），依 Flutter 官方文件建議使用 `SingleTickerProviderStateMixin` 以提供 `vsync`。

**替代方案：** `TickerProviderStateMixin`。不採用原因：該 mixin 用於需要多個 `AnimationController` 的場景，此處不適用。

### 使用 `defaultTargetPlatform` 判斷平台

在 `initState` 中無法存取 `Theme.of(context).platform`（尚未取得 InheritedWidget），因此使用 `defaultTargetPlatform`（`package:flutter/foundation.dart`）。此為 Flutter 框架內部的標準做法。

### 抽出 `_showSettingsSheet()` 私有方法

將 `showModalBottomSheet` 呼叫抽出為獨立方法，提升可讀性並集中 sheet 呈現邏輯。

## Risks / Trade-offs

- **[風險] AnimationController 與 sheet dismiss 狀態不同步** → 緩解：`showModalBottomSheet` 在 dismiss 後會自動 reverse controller 至 0.0，且不會 dispose 外部傳入的 controller，可安全重用
- **[取捨] 僅控制時長，不自定義曲線** → 框架內部已套用適當曲線（M3 `decelerateEasing`），額外自定義需建立 custom route，複雜度與收益不成正比
- **[取捨] `Clip.antiAlias` 效能** → 圓角所需，略高於 `Clip.hardEdge` 但為合理取捨，維持現有行為不變
