# Mobile (Flutter)

跨平台 Flutter App（iOS + Android），透過 AWS API Gateway + Lambda 後端擷取 Naver Blog 的圖片並下載至本機快取與裝置相簿。

> 產品定位、系統架構與跨元件流程請參閱 monorepo root [README.md](../../README.md)。
> API 介面細節請參閱 [apps/backend/README.md](../backend/README.md)。

## 技術棧

- **框架**：Flutter（僅 iOS / Android）
- **架構**：MVVM + Riverpod 3.x（code generation + `@riverpod` 註解）
- **導航**：GoRouter
- **API 通訊**：AWS Amplify Flutter SDK（REST）
- **檔案下載**：Dio（串流 + 指數退避重試）
- **相簿存取**：原生 MethodChannel（iOS: PhotoKit / Android: MediaStore）
- **照片檢視器**：原生實作（iOS: SwiftUI / Android: Jetpack Compose），透過 MethodChannel 橋接
- **App 圖示切換**：原生 MethodChannel（iOS: `setAlternateIconName` / Android: `activity-alias`）
- **快取**：磁碟快取 + SharedPreferences metadata
- **Firebase**：Firebase Auth（匿名登入）+ Cloud Firestore（操作 Log）+ Crashlytics（crash 回報）
- **裝置資訊**：device_info_plus（記錄 log 時附帶平台/系統版本/機型）
- **iOS 依賴管理**：Swift Package Manager（主要）+ CocoaPods（fallback）

## 初始設定（新 clone）

```bash
flutter pub get
dart run build_runner build --delete-conflicting-outputs
```

> `.g.dart` 檔案已加入 `.gitignore`，新 clone 後須執行 code generation 產生 Riverpod provider 定義。
>
> Firebase 設定檔（`ios/Runner/GoogleService-Info.plist` 與 `android/app/google-services.json`）已包含在版控中。

## 平台最低版本

- **iOS**：17.0
- **Android**：14.0（API 34）

## 架構概覽

```text
View（ConsumerWidget / ConsumerStatefulWidget）
  ↓ ref.watch
ViewModel（Notifier<State> / AsyncNotifier<State>，@riverpod 註解）
  ↓ ref.read
Repository（PhotoRepository / CacheRepository / LogRepository）— SSOT
  ↓
Service（ApiService / FileDownloadService / PhotoService / PhotoViewerService / AppIconService / AuthService / LogService / CrashlyticsService）— 無狀態
  ↓
Native（Swift / Kotlin via MethodChannel）— PhotoService 橋接原生相簿 API、PhotoViewerService 橋接原生圖片檢視器、AppIconService 橋接原生 App 圖示切換
Firebase（Auth + Firestore + Crashlytics）— AuthService / LogService / CrashlyticsService 橋接
```

## 快取策略

- Blog ID：URL 的 SHA-256 前 16 碼
- 快取路徑：`<appCacheDir>/blogs/<blogId>/<filename>`
- 軟性閥值：300 MB，超過時自動淘汰（優先清除已儲存至相簿的最舊 Blog）
- Metadata 持久化至 SharedPreferences

## 環境切換

透過編譯參數切換 API Gateway 部署階段：

```bash
flutter run                                     # 預設（default stage）
flutter run --dart-define=API_STAGE=uat         # UAT 環境
flutter build apk --dart-define=API_STAGE=prod  # 正式環境
```

支援階段：`default`、`ut`、`stg`、`uat`、`prod`
