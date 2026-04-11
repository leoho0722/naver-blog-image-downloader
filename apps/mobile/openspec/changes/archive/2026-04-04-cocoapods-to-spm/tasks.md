## 1. 啟用 SPM 並觸發自動遷移

- [x] 1.1 執行 `flutter config --enable-swift-package-manager` 啟用 SPM
- [x] 1.2 執行 `flutter build ios --config-only` 觸發 Flutter CLI 自動遷移，確認輸出 `Adding Swift Package Manager integration...`
- [x] 1.3 確認 `ios/Runner.xcodeproj/project.pbxproj` 已新增 `FlutterGeneratedPluginSwiftPackage` 參照（10 處）
- [x] 1.4 確認 `ios/Runner.xcodeproj/xcshareddata/xcschemes/Runner.xcscheme` 已新增 Build Pre-action script

## 2. 手動遷移（僅在自動遷移失敗時）

- [x] 2.1 自動遷移已成功，跳過手動步驟
- [x] 2.2 自動遷移已成功，跳過手動步驟

## 3. 驗證 build 與功能

- [x] 3.1 執行 `flutter clean && flutter pub get` 成功，`flutter test` 136 tests passed
- [x] 3.2 確認 Firebase Auth 匿名登入正常（Firestore 安全規則驗證通過）
- [x] 3.3 確認 Firestore 讀寫正常
- [x] 3.4 確認 Firebase Crashlytics 有收到 non-fatal error（`recordError` 驗證通過，版本 1.3.0）
- [x] 3.5 確認原生圖片檢視器功能正常
- [x] 3.6 確認 Amplify API 呼叫正常
- [x] 3.7 執行 `flutter test` 確認所有測試通過（136/136）

## 4. CocoaPods 清理

- [x] 4.1 確認 `amplify_secure_storage` 仍需 CocoaPods fallback，保留 Podfile/Pods（僅 Flutter + amplify_secure_storage 兩個 pod）
- [x] 4.2 跳過刪除 `ios/Podfile`（fallback 需要）
- [x] 4.3 跳過刪除 `ios/Podfile.lock`（fallback 需要）
- [x] 4.4 跳過刪除 `ios/Pods/`（fallback 需要）
- [x] 4.5 跳過更新 `.gitignore`（CocoaPods 項目仍需保留）
- [x] 4.6 確認 SPM + CocoaPods 共存 build 成功

## 5. Firebase 降級與 dSYM 修正

- [x] 5.1 降級 Firebase 套件（`firebase_core: ^3.13.0`、`firebase_auth: ^5.6.0`、`cloud_firestore: ^5.6.7`、`firebase_crashlytics: ^4.3.5`）解決 `firebase-ios-sdk` 12.x Pipeline API bridge release build 編譯錯誤
- [x] 5.2 確認 `flutter build ios --release` 成功（41.3MB）
- [x] 5.3 調整 Crashlytics dSYM 上傳腳本路徑（優先 DerivedData `find` → Xcode SPM path → CocoaPods fallback）
- [x] 5.4 確認 dSYM 成功上傳至 Firebase Crashlytics
- [x] 5.5 移除 Crashlytics 驗證用 `recordError` code
