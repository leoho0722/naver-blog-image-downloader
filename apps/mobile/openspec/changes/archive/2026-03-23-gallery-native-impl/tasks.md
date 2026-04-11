## 1. iOS 原生實作

- [x] 1.1 新增 `ios/Runner/GallerySaver.swift`，iOS 使用 PHAssetCreationRequest.addResource(fileURL:) + async/await 實作 saveToGallery 與 requestPermission（GalleryService saveToGallery method）
- [x] 1.2 修改 `ios/Runner/AppDelegate.swift` 註冊 MethodChannel handler

## 2. Android 原生實作

- [x] [P] 2.1 新增 `android/.../GallerySaver.kt`，Android 使用 MediaStore + FileInputStream.copyTo + Kotlin Coroutines 實作 saveToGallery 與 requestPermission（GalleryService requestPermission method）
- [x] [P] 2.2 修改 `android/.../MainActivity.kt` 註冊 MethodChannel handler
- [x] [P] 2.3 修改 `android/app/src/main/AndroidManifest.xml` 新增 READ_MEDIA_IMAGES 權限

## 3. Dart 端整合

- [x] 3.1 修改 `lib/data/services/gallery_service.dart` 改用 MethodChannel 呼叫原生 + Dart 端錯誤處理 PlatformException → AppError（MethodChannel 通訊架構）
- [x] 3.2 移除 `pubspec.yaml` 中的 `image_gallery_saver` 依賴 + `flutter pub get`

## 4. 驗證

- [x] 4.1 執行 `flutter analyze` + `dart format .`
- [x] 4.2 執行 `flutter test test/ui/` 確認所有測試通過
