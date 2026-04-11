## Context

`image_gallery_saver` 套件底層使用 `UIImage` 重新編碼圖片，導致 iOS 相簿中的檔案大小與原始快取檔案不一致。需改為原生實作以直接複製檔案不轉碼。

## Goals / Non-Goals

**Goals:**

- iOS 使用 PhotoKit `PHAssetCreationRequest.addResource(fileURL:)` 直接寫入
- Android 使用 MediaStore API + FileInputStream 直接複製
- 透過 MethodChannel 呼叫原生實作
- 移除 `image_gallery_saver` 依賴
- `requestPermission()` 改為實際請求各平台權限

**Non-Goals:**

- 不修改 PhotoRepository 的呼叫方式（`saveToGallery(filePath)` 簽名不變）
- 不修改 PhotoDetailView 的檔案大小顯示邏輯

## Decisions

### MethodChannel 通訊架構

Channel name: `com.example.naver_blog_image_downloader/gallery`

提供兩個 method：
- `saveToGallery`：參數 `filePath` (String)，回傳 `true` 表示成功，失敗拋 `FlutterError`
- `requestPermission`：無參數，回傳 `true`/`false`

### iOS 使用 PHAssetCreationRequest.addResource(fileURL:)

使用 Swift async/await 版本的 PhotoKit API：

```swift
func saveToGallery(filePath: String) async throws -> Bool {
    let url = URL(fileURLWithPath: filePath)
    try await PHPhotoLibrary.shared().performChanges {
        let request = PHAssetCreationRequest.forAsset()
        request.addResource(with: .photo, fileURL: url, options: nil)
    }
    return true
}
```

- `addResource(fileURL:)` 直接用檔案 URL 寫入，不經過 UIImage，保留原始編碼與大小
- `performChanges` 的 async/await 版本自動處理錯誤
- `requestPermission` 使用 `PHPhotoLibrary.requestAuthorization(for: .addOnly)`

### Android 使用 MediaStore + FileInputStream.copyTo

使用 Kotlin Coroutines（suspend + withContext）：

```kotlin
suspend fun saveToGallery(filePath: String): Boolean = withContext(Dispatchers.IO) {
    val file = File(filePath)
    val values = ContentValues().apply {
        put(MediaStore.Images.Media.DISPLAY_NAME, file.name)
        put(MediaStore.Images.Media.MIME_TYPE, getMimeType(file))
        put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES)
    }
    val uri = contentResolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values)
        ?: throw Exception("Failed to create MediaStore entry")
    contentResolver.openOutputStream(uri)?.use { output ->
        FileInputStream(file).use { input -> input.copyTo(output) }
    } ?: throw Exception("Failed to open output stream")
    true
}
```

- 直接用 `FileInputStream.copyTo` 複製原始 bytes，不轉碼
- `requestPermission` 使用 `ActivityCompat.requestPermissions`

### Dart 端錯誤處理

`PlatformException` → `AppError(type: AppErrorType.gallery)`，與現有 spec 一致。

## Risks / Trade-offs

- [原生程式碼維護] 需同時維護 Swift + Kotlin 原生程式碼 → 邏輯簡單，變動頻率低，可接受
- [Android 權限差異] Android 13+ 需 `READ_MEDIA_IMAGES`，舊版需 `WRITE_EXTERNAL_STORAGE` → AndroidManifest 中同時宣告，系統自動選用
