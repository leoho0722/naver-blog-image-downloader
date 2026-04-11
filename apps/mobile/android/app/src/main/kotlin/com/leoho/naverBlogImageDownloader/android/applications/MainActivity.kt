package com.leoho.naverBlogImageDownloader.android.applications

import com.leoho.naverBlogImageDownloader.android.applications.channels.features.setupAppIconChannel
import com.leoho.naverBlogImageDownloader.android.applications.channels.features.setupGalleryChannel
import com.leoho.naverBlogImageDownloader.android.applications.channels.features.setupPhotoViewerChannel
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine

/**
 * 應用程式主 Activity，負責 Flutter 引擎初始化與 MethodChannel 註冊。
 *
 * 在 [configureFlutterEngine] 中註冊 Gallery Channel 與 PhotoViewer Channel，
 * 橋接 Flutter 與原生功能。
 */
class MainActivity : FlutterActivity() {

    // region Lifecycle

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        setupGalleryChannel(flutterEngine)
        setupPhotoViewerChannel(flutterEngine)
        setupAppIconChannel(flutterEngine)
    }

    // endregion
}
