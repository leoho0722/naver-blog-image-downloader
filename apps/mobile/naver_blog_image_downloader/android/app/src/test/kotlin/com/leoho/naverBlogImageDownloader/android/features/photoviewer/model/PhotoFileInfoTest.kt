package com.leoho.naverBlogImageDownloader.android.features.photoviewer.model

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

/**
 * [PhotoFileInfo] 格式化邏輯的單元測試。
 */
class PhotoFileInfoTest {

    // region formattedFileSize 測試

    /** 驗證小於 1MB 的檔案大小格式化為 KB。 */
    @Test
    fun `500000 bytes 格式化為 500_0 KB`() {
        val info = PhotoFileInfo(fileSizeBytes = 500_000L, width = 100, height = 100)
        assertEquals("500.0 KB", info.formattedFileSize)
    }

    /** 驗證大於等於 1MB 的檔案大小格式化為 MB。 */
    @Test
    fun `2500000 bytes 格式化為 2_5 MB`() {
        val info = PhotoFileInfo(fileSizeBytes = 2_500_000L, width = 100, height = 100)
        assertEquals("2.5 MB", info.formattedFileSize)
    }

    /** 驗證邊界值 999999 bytes 格式化為 KB。 */
    @Test
    fun `999999 bytes 格式化為 1000_0 KB`() {
        val info = PhotoFileInfo(fileSizeBytes = 999_999L, width = 100, height = 100)
        assertEquals("1000.0 KB", info.formattedFileSize)
    }

    /** 驗證邊界值 1000000 bytes 格式化為 MB。 */
    @Test
    fun `1000000 bytes 格式化為 1_0 MB`() {
        val info = PhotoFileInfo(fileSizeBytes = 1_000_000L, width = 100, height = 100)
        assertEquals("1.0 MB", info.formattedFileSize)
    }

    /** 驗證 0 bytes 格式化為 KB。 */
    @Test
    fun `0 bytes 格式化為 0_0 KB`() {
        val info = PhotoFileInfo(fileSizeBytes = 0L, width = 100, height = 100)
        assertEquals("0.0 KB", info.formattedFileSize)
    }

    // endregion

    // region formattedDimensions 測試

    /** 驗證正常尺寸格式化。 */
    @Test
    fun `1920x1080 格式化為 1920 x 1080`() {
        val info = PhotoFileInfo(fileSizeBytes = 100L, width = 1920, height = 1080)
        assertEquals("1920 × 1080", info.formattedDimensions)
    }

    /** 驗證零尺寸格式化。 */
    @Test
    fun `零尺寸格式化為 0 x 0`() {
        val info = PhotoFileInfo(fileSizeBytes = 100L, width = 0, height = 0)
        assertEquals("0 × 0", info.formattedDimensions)
    }

    // endregion

    // region data class 測試

    /** 驗證相同輸入產生相等實例。 */
    @Test
    fun `data class equality 相同輸入產生相等實例`() {
        val a = PhotoFileInfo(fileSizeBytes = 100L, width = 200, height = 300)
        val b = PhotoFileInfo(fileSizeBytes = 100L, width = 200, height = 300)
        assertEquals(a, b)
    }

    /** 驗證 copy 可修改單一屬性。 */
    @Test
    fun `data class copy 可修改單一屬性`() {
        val original = PhotoFileInfo(fileSizeBytes = 100L, width = 200, height = 300)
        val copied = original.copy(width = 400)
        assertEquals(400, copied.width)
        assertEquals(original.fileSizeBytes, copied.fileSizeBytes)
    }

    // endregion
}
