package com.leoho.naverBlogImageDownloader.android.features.photoviewer.view

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.lifecycle.lifecycleScope
import com.leoho.naverBlogImageDownloader.android.features.photoviewer.model.ThemeColors
import com.leoho.naverBlogImageDownloader.android.features.photoviewer.viewmodel.PhotoViewerViewModel
import com.leoho.naverBlogImageDownloader.android.services.PhotoService

/**
 * 原生全螢幕圖片檢視器 Activity，使用 Jetpack Compose 實作。
 *
 * 從 Intent extras 讀取照片路徑、l10n 字串與主題色彩，
 * 建立 [PhotoViewerViewModel] 並以 [MaterialTheme] 包裝 [PhotoViewerScreen]。
 */
class PhotoViewerActivity : ComponentActivity() {

    // region Properties

    /** 檢視器的 ViewModel，供 onBackPressed 與 file-level extension 存取。 */
    internal lateinit var viewModel: PhotoViewerViewModel

    // endregion

    // region Lifecycle

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        viewModel = buildViewModel()

        // 攔截系統返回手勢，透過 ViewModel 通知 Flutter 後再 finish
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                viewModel.dismiss()
            }
        })

        setContent { buildContent() }
    }

    // endregion
}

// region Private Methods

/**
 * 從 Intent extras 還原參數並建立 [PhotoViewerViewModel]。
 *
 * @return 初始化完成的 [PhotoViewerViewModel]。
 */
private fun PhotoViewerActivity.buildViewModel(): PhotoViewerViewModel {
    val filePaths = intent.getStringArrayListExtra("filePaths") ?: arrayListOf()
    val initialIndex = intent.getIntExtra("initialIndex", 0)
    val blogId = intent.getStringExtra("blogId") ?: ""
    val isDarkMode = intent.getBooleanExtra("isDarkMode", false)

    val localizedStrings = mapOf(
        "fileInfo" to (intent.getStringExtra("localizedStrings_fileInfo") ?: "File Info"),
        "fileSize" to (intent.getStringExtra("localizedStrings_fileSize") ?: "File Size"),
        "dimensions" to (intent.getStringExtra("localizedStrings_dimensions") ?: "Dimensions"),
    )

    val themeColors = ThemeColors.fromArgb(
        surfaceContainerHigh = intent.getIntExtra("themeColor_surfaceContainerHigh", 0),
        onSurface = intent.getIntExtra("themeColor_onSurface", 0),
        onSurfaceVariant = intent.getIntExtra("themeColor_onSurfaceVariant", 0),
        primary = intent.getIntExtra("themeColor_primary", 0),
        surface = intent.getIntExtra("themeColor_surface", 0),
    )

    return PhotoViewerViewModel(
        filePaths = filePaths,
        initialIndex = initialIndex,
        blogId = blogId,
        localizedStrings = localizedStrings,
        isDarkMode = isDarkMode,
        themeColors = themeColors,
        photoService = PhotoService(this),
        scope = lifecycleScope,
        dismissAction = { finish() },
    )
}

/**
 * 建構 Compose UI 內容，以 Flutter 傳入的色彩包裝 [MaterialTheme]。
 */
@androidx.compose.runtime.Composable
private fun PhotoViewerActivity.buildContent() {
    val colors = viewModel.themeColors
    val isDark = viewModel.isDarkMode

    val baseScheme = if (isDark) darkColorScheme() else lightColorScheme()
    val colorScheme = baseScheme.copy(
        surfaceContainerHigh = colors.surfaceContainerHigh,
        onSurface = colors.onSurface,
        onSurfaceVariant = colors.onSurfaceVariant,
        primary = colors.primary,
        surface = colors.surface,
    )

    MaterialTheme(colorScheme = colorScheme) {
        PhotoViewerScreen(viewModel = viewModel)
    }
}

// endregion
