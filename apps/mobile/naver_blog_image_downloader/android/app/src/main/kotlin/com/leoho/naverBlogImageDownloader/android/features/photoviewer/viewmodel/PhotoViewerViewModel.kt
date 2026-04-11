package com.leoho.naverBlogImageDownloader.android.features.photoviewer.viewmodel

import android.graphics.BitmapFactory
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.leoho.naverBlogImageDownloader.android.applications.channels.features.getPhotoViewerChannel
import com.leoho.naverBlogImageDownloader.android.features.photoviewer.model.PhotoFileInfo
import com.leoho.naverBlogImageDownloader.android.features.photoviewer.model.ThemeColors
import com.leoho.naverBlogImageDownloader.android.services.PhotoSaveable
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File

// region PhotoViewerViewModel

/**
 * 圖片檢視器的 Compose 狀態管理 ViewModel。
 *
 * 管理目前索引、沉浸模式、儲存狀態，並透過 MethodChannel 與 Flutter 通訊。
 *
 * @param filePaths 照片檔案路徑清單。
 * @param initialIndex 初始顯示的照片索引。
 * @param blogId Blog 識別碼。
 * @param localizedStrings Flutter 傳入的已翻譯 UI 字串。
 * @param isDarkMode 是否為深色模式。
 * @param themeColors Flutter 傳入的主題色彩。
 * @param photoService 照片儲存服務，透過 [PhotoSaveable] 介面注入，解耦具體實作。
 * @param scope 生命週期感知的協程作用域，用於背景儲存操作。
 * @param dismissAction 關閉檢視器的回呼，由 Activity 注入。
 */
class PhotoViewerViewModel(
    val filePaths: List<String>,
    initialIndex: Int,
    val blogId: String,
    val localizedStrings: Map<String, String>,
    val isDarkMode: Boolean,
    val themeColors: ThemeColors,
    private val photoService: PhotoSaveable,
    private val scope: CoroutineScope,
    private val dismissAction: (() -> Unit)? = null,
) {

    // region Properties

    /** 目前顯示的照片索引。 */
    var currentIndex by mutableIntStateOf(initialIndex)

    /** 是否處於沉浸模式（隱藏覆蓋列與系統列）。 */
    var isImmersive by mutableStateOf(false)

    /** 目前照片的檢視狀態。 */
    var viewState by mutableStateOf(ViewState.Idle)
        private set

    /** 是否正在顯示檔案資訊 Bottom Sheet。 */
    var showFileInfo by mutableStateOf(false)

    /** 照片總數。 */
    val totalCount: Int get() = filePaths.size

    /** 目前照片的檔案路徑。 */
    val currentFilePath: String
        get() = filePaths.getOrElse(currentIndex) { "" }

    // endregion

    // region Actions

    /**
     * 切換至指定頁面，重設儲存狀態。
     *
     * @param index 新的照片索引。
     */
    fun onPageChanged(index: Int) {
        currentIndex = index
        viewState = ViewState.Idle
    }

    /**
     * 儲存目前照片至相簿。
     *
     * 在 IO 執行緒呼叫 [PhotoSaveable.saveToGallery]，
     * 成功後透過 MethodChannel 通知 Flutter 記錄操作 log。
     */
    fun save() {
        if (viewState != ViewState.Idle) return
        val filePath = currentFilePath
        viewState = ViewState.Saving

        scope.launch {
            try {
                withContext(Dispatchers.IO) {
                    photoService.saveToGallery(filePath)
                }
                viewState = ViewState.Saved
                getPhotoViewerChannel()?.invokeMethod(
                    "onSaveCompleted",
                    mapOf("blogId" to blogId)
                )
            } catch (_: Exception) {
                viewState = ViewState.Idle
            }
        }
    }

    /**
     * 關閉檢視器並通知 Flutter。
     */
    fun dismiss() {
        getPhotoViewerChannel()?.invokeMethod(
            "onDismissed",
            mapOf("lastIndex" to currentIndex)
        )
        dismissAction?.invoke()
    }

    /**
     * 取得指定索引照片的檔案資訊。
     *
     * @param index 照片在 [filePaths] 中的索引。
     * @return 檔案大小與圖片尺寸；讀取失敗時回傳 null。
     */
    fun fileInfo(index: Int): PhotoFileInfo? {
        val path = filePaths.getOrNull(index) ?: return null
        val file = File(path)
        android.util.Log.d("PhotoViewer", "fileInfo index=$index path=$path exists=${file.exists()}")
        if (!file.exists()) return null

        val size = file.length()

        val options = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        BitmapFactory.decodeFile(path, options)

        return PhotoFileInfo(
            fileSizeBytes = size,
            width = options.outWidth,
            height = options.outHeight,
        )
    }

    // endregion

    // region Nested Types

    /**
     * 照片檢視器的檢視狀態，表示目前照片的儲存操作進度。
     */
    enum class ViewState {

        /** 閒置，尚未觸發儲存。 */
        Idle,

        /** 儲存中。 */
        Saving,

        /** 已成功儲存至相簿。 */
        Saved,
    }

    // endregion
}

// endregion
