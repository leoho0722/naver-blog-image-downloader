## Summary

將 iOS 依賴管理從 CocoaPods 遷移至 Swift Package Manager (SPM)。

## Motivation

CocoaPods 1.16.2 與 Xcode 26（project object version 70）不相容，導致 `pod install` 失敗。Flutter 3.41.5 已原生支援 SPM 整合（3.24+ 即可），遷移後可減少對 Ruby/CocoaPods 的依賴，簡化開發環境與 CI/CD 流程。

目前 iOS 有 9 個原生 plugin，Flutter 會自動將支援 SPM 的 plugin 切換至 SPM，不支援的則 fallback 至 CocoaPods（兩者共存）。

## Proposed Solution

1. 使用 `flutter config --enable-swift-package-manager` 啟用 SPM
2. 執行 `flutter build ios --config-only` 觸發 Flutter CLI 自動遷移（修改 `project.pbxproj`、`Runner.xcscheme`，新增 `FlutterGeneratedPluginSwiftPackage` 與 Build Pre-action script）
3. 驗證 build 成功與功能正常
4. 降級 Firebase 套件（`firebase_core: ^3.13.0`、`firebase_auth: ^5.6.0`、`cloud_firestore: ^5.6.7`、`firebase_crashlytics: ^4.3.5`）以解決 `firebase-ios-sdk` 12.x Pipeline API bridge 在 release build 的編譯錯誤
5. 調整 Crashlytics dSYM 上傳腳本路徑（SPM 模式下 `upload-symbols` 位於 DerivedData SourcePackages 內）

## Non-Goals

- 不修改任何 Flutter/Dart 應用程式碼（驗證用 code 已移除）
- 不修改 Android 端配置
- 不處理 macOS 平台（專案僅支援 iOS/Android）
- 不完全移除 CocoaPods（`amplify_secure_storage` 仍需 fallback）

## Alternatives Considered

- **維持 CocoaPods**：需等待 CocoaPods 更新支援 Xcode 26，時程不確定
- **降級 Xcode**：會失去 iOS 26 SDK 與新功能，不建議
- **Firebase 最新版 + SPM**：`firebase-ios-sdk` 12.x 的 Pipeline API bridge 在 release build 有編譯錯誤，降級至 11.x 系列解決

## Impact

- 受影響程式碼:
  - `pubspec.yaml` — Firebase 套件降級至 3.x/5.x 系列
  - `ios/Runner.xcodeproj/project.pbxproj` — SPM integration + dSYM 上傳腳本路徑調整
  - `ios/Runner.xcodeproj/xcshareddata/xcschemes/Runner.xcscheme` — Build Pre-action script
  - `ios/Podfile` — 保留（amplify_secure_storage fallback）
  - `ios/Podfile.lock` — 保留（amplify_secure_storage fallback）
  - `ios/Pods/` — 保留（僅 Flutter + amplify_secure_storage 兩個 pod）

### 遷移結果

| Plugin | 依賴管理 |
|--------|---------|
| firebase_core | ✓ SPM |
| firebase_auth | ✓ SPM |
| cloud_firestore | ✓ SPM |
| firebase_crashlytics | ✓ SPM |
| connectivity_plus | ✓ SPM |
| device_info_plus | ✓ SPM |
| package_info_plus | ✓ SPM |
| shared_preferences_foundation | ✓ SPM |
| amplify_secure_storage | CocoaPods fallback |
