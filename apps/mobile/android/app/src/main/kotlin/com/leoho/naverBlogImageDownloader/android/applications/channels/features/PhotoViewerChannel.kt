package com.leoho.naverBlogImageDownloader.android.applications.channels.features

import android.content.Intent
import com.leoho.naverBlogImageDownloader.android.applications.MainActivity
import com.leoho.naverBlogImageDownloader.android.features.photoviewer.model.ThemeColors
import com.leoho.naverBlogImageDownloader.android.features.photoviewer.view.PhotoViewerActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel

// region Channel Reference

/** 圖片檢視器的 MethodChannel 參照，供 PhotoViewerActivity 回呼 Flutter 使用。 */
private var photoViewerChannel: MethodChannel? = null

/** PhotoViewer MethodChannel 通道名稱。 */
private const val PHOTO_VIEWER_CHANNEL_NAME = "com.leoho.naverBlogImageDownloader/photoViewer"

/**
 * 取得已註冊的 PhotoViewer MethodChannel 參照。
 *
 * @return MethodChannel 實例，未註冊時回傳 null。
 */
fun getPhotoViewerChannel(): MethodChannel? = photoViewerChannel

// endregion

// region Channel Setup

/**
 * 註冊 PhotoViewer MethodChannel，處理 `openViewer` 呼叫。
 *
 * @param flutterEngine Flutter 引擎實例，用於取得 BinaryMessenger。
 */
fun MainActivity.setupPhotoViewerChannel(flutterEngine: FlutterEngine) {
    val channel = MethodChannel(
        flutterEngine.dartExecutor.binaryMessenger,
        PHOTO_VIEWER_CHANNEL_NAME
    )
    photoViewerChannel = channel

    channel.setMethodCallHandler { call, result ->
        when (call.method) {
            "openViewer" -> handleOpenViewer(call, result)
            else -> result.notImplemented()
        }
    }
}

// endregion

// region Private Methods

/**
 * 處理 `openViewer` 方法呼叫，啟動 PhotoViewerActivity。
 *
 * @param call 需包含參數 `filePaths`、`initialIndex`、`blogId`、
 *             `localizedStrings`、`isDarkMode`、`themeColors`。
 * @param result 成功時回傳 null。
 */
private fun MainActivity.handleOpenViewer(
    call: MethodCall,
    result: MethodChannel.Result
) {
    val args = call.arguments as? Map<*, *>
    val filePaths = (args?.get("filePaths") as? List<*>)?.filterIsInstance<String>()
    val initialIndex = (args?.get("initialIndex") as? Int) ?: 0
    val blogId = args?.get("blogId") as? String
    val localizedStrings = (args?.get("localizedStrings") as? Map<*, *>)
        ?.entries?.associate { (it.key as String) to (it.value as String) }
    val isDarkMode = args?.get("isDarkMode") as? Boolean ?: false
    val themeColors = (args?.get("themeColors") as? Map<*, *>)
        ?.entries?.associate { (it.key as String) to ((it.value as? Int) ?: 0) }

    android.util.Log.d("PhotoViewer", "openViewer filePaths[0]=${filePaths?.firstOrNull()}")
    android.util.Log.d("PhotoViewer", "openViewer filePaths.size=${filePaths?.size}")

    if (filePaths == null || blogId == null) {
        result.error("INVALID_ARG", "Missing required parameters", null)
        return
    }

    val intent = Intent(this, PhotoViewerActivity::class.java).apply {
        putStringArrayListExtra("filePaths", ArrayList(filePaths))
        putExtra("initialIndex", initialIndex)
        putExtra("blogId", blogId)
        putExtra("isDarkMode", isDarkMode)

        localizedStrings?.let { strings ->
            putExtra("localizedStrings_fileInfo", strings["fileInfo"] ?: "")
            putExtra("localizedStrings_fileSize", strings["fileSize"] ?: "")
            putExtra("localizedStrings_dimensions", strings["dimensions"] ?: "")
        }
        themeColors?.let { colors ->
            putExtra("themeColor_surfaceContainerHigh", colors["surfaceContainerHigh"] ?: 0)
            putExtra("themeColor_onSurface", colors["onSurface"] ?: 0)
            putExtra("themeColor_onSurfaceVariant", colors["onSurfaceVariant"] ?: 0)
            putExtra("themeColor_primary", colors["primary"] ?: 0)
            putExtra("themeColor_surface", colors["surface"] ?: 0)
        }
    }
    startActivity(intent)
    result.success(null)
}

// endregion
