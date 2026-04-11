## Summary

移除 `image_gallery_saver` 第三方套件，改為 Swift（iOS）/ Kotlin（Android）原生實作相簿儲存功能，透過 MethodChannel 呼叫。

## Motivation

`image_gallery_saver` 底層使用 `UIImage` → `UIImageJPEGRepresentation()` 重新編碼圖片，導致儲存至 iOS 相簿後檔案大小大幅縮減（5.3 MB → 1.3 MB），與 PhotoDetailView 顯示的快取檔案大小不一致。自行實作原生 API 可使用 `PHAssetCreationRequest.addResource(with: .photo, fileURL:)` 直接複製檔案不轉碼，保留原始編碼與大小。

## Proposed Solution

- iOS：使用 PhotoKit `PHAssetCreationRequest.addResource(fileURL:)` + Swift async/await
- Android：使用 MediaStore API + Kotlin Coroutines，直接複製檔案 bytes
- Dart 端 `GalleryService` 改用 `MethodChannel` 呼叫原生實作
- 移除 `pubspec.yaml` 中的 `image_gallery_saver` 依賴
- `requestPermission()` 改為實際向各平台請求權限

## Impact

- Affected specs: `gallery-service`（儲存方式與權限請求變更）
- Affected code:
  - `lib/data/services/gallery_service.dart`（改用 MethodChannel）
  - `ios/Runner/GallerySaver.swift`（新增）
  - `ios/Runner/AppDelegate.swift`（註冊 MethodChannel）
  - `android/.../GallerySaver.kt`（新增）
  - `android/.../MainActivity.kt`（註冊 MethodChannel）
  - `android/app/src/main/AndroidManifest.xml`（新增 media 權限）
  - `pubspec.yaml`（移除 image_gallery_saver）
