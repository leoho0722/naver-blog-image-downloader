package com.leoho.naverBlogImageDownloader.android.features.photoviewer.viewmodel

import com.leoho.naverBlogImageDownloader.android.features.photoviewer.model.ThemeColors
import com.leoho.naverBlogImageDownloader.android.services.PhotoSaveable
import kotlinx.coroutines.test.TestScope
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

/**
 * [PhotoViewerViewModel] 同步狀態管理的單元測試。
 */
class PhotoViewerViewModelTest {

    // region 初始狀態測試

    /** 驗證初始化後 currentIndex 等於 initialIndex。 */
    @Test
    fun `初始 currentIndex 等於 initialIndex`() {
        val vm = makeViewModel(initialIndex = 2)
        assertEquals(2, vm.currentIndex)
    }

    /** 驗證初始化後 totalCount 等於 filePaths.size。 */
    @Test
    fun `totalCount 等於 filePaths 數量`() {
        val vm = makeViewModel()
        assertEquals(3, vm.totalCount)
    }

    /** 驗證 currentFilePath 回傳正確路徑。 */
    @Test
    fun `currentFilePath 回傳對應索引的路徑`() {
        val vm = makeViewModel(initialIndex = 1)
        assertEquals("/path/to/photo2.jpg", vm.currentFilePath)
    }

    /** 驗證索引超出範圍時 currentFilePath 回傳空字串。 */
    @Test
    fun `索引超出範圍時 currentFilePath 回傳空字串`() {
        val vm = makeViewModel(initialIndex = 99)
        assertEquals("", vm.currentFilePath)
    }

    /** 驗證 viewState 初始為 Idle。 */
    @Test
    fun `viewState 初始為 Idle`() {
        val vm = makeViewModel()
        assertEquals(PhotoViewerViewModel.ViewState.Idle, vm.viewState)
    }

    /** 驗證 isImmersive 初始為 false。 */
    @Test
    fun `isImmersive 初始為 false`() {
        val vm = makeViewModel()
        assertFalse(vm.isImmersive)
    }

    /** 驗證 showFileInfo 初始為 false。 */
    @Test
    fun `showFileInfo 初始為 false`() {
        val vm = makeViewModel()
        assertFalse(vm.showFileInfo)
    }

    // endregion

    // region onPageChanged 測試

    /** 驗證 onPageChanged 更新 currentIndex。 */
    @Test
    fun `onPageChanged 更新 currentIndex`() {
        val vm = makeViewModel(initialIndex = 0)
        vm.onPageChanged(2)
        assertEquals(2, vm.currentIndex)
    }

    /** 驗證 onPageChanged 重設 viewState 為 Idle。 */
    @Test
    fun `onPageChanged 重設 viewState 為 Idle`() {
        val vm = makeViewModel()
        vm.onPageChanged(1)
        assertEquals(PhotoViewerViewModel.ViewState.Idle, vm.viewState)
    }

    // endregion

    // region dismiss 測試

    /** 驗證 dismiss 觸發 dismissAction callback。 */
    @Test
    fun `dismiss 觸發 dismissAction`() {
        var dismissed = false
        val vm = makeViewModel(dismissAction = { dismissed = true })
        vm.dismiss()
        assertTrue(dismissed)
    }

    // endregion
}

// region Test Helpers

/**
 * 測試用的 [PhotoService] fake，固定回傳 true。
 */
private class MockPhotoService : PhotoSaveable {

    /** 模擬儲存成功，固定回傳 `true`。 */
    override suspend fun saveToGallery(filePath: String, totalCount: Int): Boolean = true

    /** 模擬權限已授予，固定回傳 `true`。 */
    override fun requestPermission(): Boolean = true
}

/**
 * 建立測試用的 [PhotoViewerViewModel]。
 *
 * @param initialIndex 初始照片索引，預設為 0。
 * @param dismissAction 關閉回呼，預設為空操作。
 * @return 配置好的 ViewModel 實例。
 */
private fun makeViewModel(
    initialIndex: Int = 0,
    dismissAction: (() -> Unit)? = null,
): PhotoViewerViewModel {
    return PhotoViewerViewModel(
        filePaths = listOf("/path/to/photo1.jpg", "/path/to/photo2.jpg", "/path/to/photo3.jpg"),
        initialIndex = initialIndex,
        blogId = "test-blog",
        localizedStrings = emptyMap(),
        isDarkMode = false,
        themeColors = ThemeColors.fromArgb(0, 0, 0, 0, 0),
        photoService = MockPhotoService(),
        scope = TestScope(),
        dismissAction = dismissAction,
    )
}

// endregion
