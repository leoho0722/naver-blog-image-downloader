package com.leoho.naverBlogImageDownloader.android.applications.channels.features

import com.leoho.naverBlogImageDownloader.android.applications.MainActivity
import com.leoho.naverBlogImageDownloader.android.services.PhotoService
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

// region Channel Setup

/** Gallery MethodChannel 通道名稱。 */
private const val GALLERY_CHANNEL_NAME = "com.leoho.naverBlogImageDownloader/gallery"

/**
 * 註冊 Gallery MethodChannel，處理 `saveToGallery` 與 `requestPermission` 呼叫。
 *
 * @param flutterEngine Flutter 引擎實例，用於取得 BinaryMessenger。
 */
fun MainActivity.setupGalleryChannel(flutterEngine: FlutterEngine) {
    val photoService = PhotoService(this)

    MethodChannel(flutterEngine.dartExecutor.binaryMessenger, GALLERY_CHANNEL_NAME)
        .setMethodCallHandler { call, result ->
            handleGalleryMethodCall(call, result, photoService)
        }
}

// endregion

// region Private Methods

/**
 * 分派 Gallery MethodChannel 的方法呼叫。
 *
 * @param call Flutter 端傳入的方法呼叫，包含方法名稱與參數。
 * @param result 回傳結果給 Flutter 端的 callback。
 * @param photoService 相簿儲存服務實例。
 */
private fun MainActivity.handleGalleryMethodCall(
    call: MethodCall,
    result: MethodChannel.Result,
    photoService: PhotoService
) {
    lifecycleScope.launch {
        when (call.method) {
            "saveToGallery" -> handleSaveToGallery(call, result, photoService)
            "requestPermission" -> handleRequestPermission(result, photoService)
            else -> result.notImplemented()
        }
    }
}

/**
 * 處理 `saveToGallery` 方法呼叫。
 *
 * @param call 需包含 `Map` 類型的參數，含 `filePath`（String）與 `totalCount`（Int）。
 * @param result 成功回傳 `true`，失敗回傳錯誤。
 * @param photoService 相簿儲存服務實例。
 */
private suspend fun MainActivity.handleSaveToGallery(
    call: MethodCall,
    result: MethodChannel.Result,
    photoService: PhotoService
) {
    val args = call.arguments as? Map<*, *>
    val filePath = args?.get("filePath") as? String
    val totalCount = (args?.get("totalCount") as? Int) ?: 1
    if (filePath == null) {
        result.error("INVALID_ARG", "filePath is required", null)
        return
    }
    try {
        val success = photoService.saveToGallery(filePath, totalCount)
        result.success(success)
    } catch (e: Exception) {
        result.error("SAVE_FAILED", e.message, null)
    }
}

/**
 * 處理 `requestPermission` 方法呼叫。
 *
 * @param result 授權成功回傳 `true`，否則回傳 `false`。
 * @param photoService 相簿儲存服務實例。
 */
private fun MainActivity.handleRequestPermission(
    result: MethodChannel.Result,
    photoService: PhotoService
) {
    result.success(photoService.requestPermission())
}

// endregion
