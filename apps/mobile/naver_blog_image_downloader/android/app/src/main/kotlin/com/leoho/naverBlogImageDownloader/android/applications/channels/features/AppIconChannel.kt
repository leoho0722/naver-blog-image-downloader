package com.leoho.naverBlogImageDownloader.android.applications.channels.features

import android.content.ComponentName
import android.content.pm.PackageManager
import com.leoho.naverBlogImageDownloader.android.applications.MainActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel

// region Channel Setup

/** AppIcon MethodChannel 通道名稱。 */
private const val APP_ICON_CHANNEL_NAME = "com.leoho.naverBlogImageDownloader/appIcon"

/** 預設圖示的 activity-alias 完整 component 名稱。 */
private const val ALIAS_CLASSIC = "com.leoho.naverBlogImageDownloader.android.MainActivityClassic"

/** 新版圖示的 activity-alias 完整 component 名稱。 */
private const val ALIAS_NEW = "com.leoho.naverBlogImageDownloader.android.MainActivityNew"

/**
 * 註冊 AppIcon MethodChannel，處理 `setAppIcon` 與 `getCurrentIcon` 呼叫。
 *
 * @param flutterEngine Flutter 引擎實例，用於取得 BinaryMessenger。
 */
fun MainActivity.setupAppIconChannel(flutterEngine: FlutterEngine) {
    MethodChannel(flutterEngine.dartExecutor.binaryMessenger, APP_ICON_CHANNEL_NAME)
        .setMethodCallHandler { call, result ->
            handleAppIconMethodCall(call, result)
        }
}

// endregion

// region Private Methods

/**
 * 分派 AppIcon MethodChannel 的方法呼叫。
 *
 * @param call Flutter 端傳入的方法呼叫，包含方法名稱與參數。
 * @param result 回傳結果給 Flutter 端的 callback。
 */
private fun MainActivity.handleAppIconMethodCall(
    call: MethodCall,
    result: MethodChannel.Result
) {
    when (call.method) {
        "setAppIcon" -> handleSetAppIcon(call, result)
        "getCurrentIcon" -> handleGetCurrentIcon(result)
        else -> result.notImplemented()
    }
}

/**
 * 處理 `setAppIcon` 方法呼叫，透過 PackageManager 啟用/停用 activity-alias 切換圖示。
 *
 * 使用 `DONT_KILL_APP` 旗標避免切換時殺掉 App。
 *
 * @param call 需包含 `Map` 類型的參數，含 `iconName`（String，`"default"` 或 `"new"`）。
 * @param result 成功回傳 null，失敗回傳錯誤。
 */
private fun MainActivity.handleSetAppIcon(
    call: MethodCall,
    result: MethodChannel.Result
) {
    val args = call.arguments as? Map<*, *>
    val iconName = args?.get("iconName") as? String
    if (iconName == null) {
        result.error("INVALID_ARG", "iconName is required", null)
        return
    }

    try {
        val pm = packageManager
        val enableAlias: String
        val disableAlias: String

        if (iconName == "default") {
            enableAlias = ALIAS_CLASSIC
            disableAlias = ALIAS_NEW
        } else {
            enableAlias = ALIAS_NEW
            disableAlias = ALIAS_CLASSIC
        }

        pm.setComponentEnabledSetting(
            ComponentName(this, disableAlias),
            PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
            PackageManager.DONT_KILL_APP
        )
        pm.setComponentEnabledSetting(
            ComponentName(this, enableAlias),
            PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
            PackageManager.DONT_KILL_APP
        )
        result.success(null)
    } catch (e: Exception) {
        result.error("SET_ICON_FAILED", e.message, null)
    }
}

/**
 * 處理 `getCurrentIcon` 方法呼叫，檢查哪個 activity-alias 目前啟用中。
 *
 * @param result 回傳 `"default"` 或 `"new"`。
 */
private fun MainActivity.handleGetCurrentIcon(result: MethodChannel.Result) {
    val pm = packageManager
    val newState = pm.getComponentEnabledSetting(
        ComponentName(this, ALIAS_NEW)
    )
    val iconName = if (newState == PackageManager.COMPONENT_ENABLED_STATE_ENABLED) {
        "new"
    } else {
        "default"
    }
    result.success(iconName)
}

// endregion
