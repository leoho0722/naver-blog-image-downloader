package com.leoho.naverBlogImageDownloader.android.features.photoviewer.model

import androidx.compose.ui.graphics.Color
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

/**
 * [ThemeColors] 的 ARGB 整數解析單元測試。
 */
class ThemeColorsTest {

    // region fromArgb 轉換測試

    /** 驗證不透明白色（0xFFFFFFFF）正確轉換為 Compose Color。 */
    @Test
    fun `fromArgb 不透明白色轉換正確`() {
        val colors = ThemeColors.fromArgb(
            surfaceContainerHigh = 0xFFFFFFFF.toInt(),
            onSurface = 0,
            onSurfaceVariant = 0,
            primary = 0,
            surface = 0,
        )
        assertEquals(Color.White, colors.surfaceContainerHigh)
    }

    /** 驗證不透明紅色（0xFFFF0000）正確轉換為 Compose Color。 */
    @Test
    fun `fromArgb 不透明紅色轉換正確`() {
        val colors = ThemeColors.fromArgb(
            surfaceContainerHigh = 0,
            onSurface = 0,
            onSurfaceVariant = 0,
            primary = 0xFFFF0000.toInt(),
            surface = 0,
        )
        assertEquals(Color.Red, colors.primary)
    }

    /** 驗證全透明黑色（0x00000000）正確轉換。 */
    @Test
    fun `fromArgb 全透明黑色轉換正確`() {
        val colors = ThemeColors.fromArgb(
            surfaceContainerHigh = 0,
            onSurface = 0x00000000,
            onSurfaceVariant = 0,
            primary = 0,
            surface = 0,
        )
        assertEquals(0f, colors.onSurface.alpha, 0.01f)
    }

    /** 驗證所有 5 個色彩屬性各自獨立解析。 */
    @Test
    fun `fromArgb 五色各屬性獨立解析`() {
        val colors = ThemeColors.fromArgb(
            surfaceContainerHigh = 0xFFFF0000.toInt(),
            onSurface = 0xFF00FF00.toInt(),
            onSurfaceVariant = 0xFF0000FF.toInt(),
            primary = 0xFFFFFF00.toInt(),
            surface = 0xFF000000.toInt(),
        )
        assertEquals(Color.Red, colors.surfaceContainerHigh)
        assertEquals(Color.Green, colors.onSurface)
        assertEquals(Color.Blue, colors.onSurfaceVariant)
        assertEquals(Color.Yellow, colors.primary)
        assertEquals(Color.Black, colors.surface)
    }

    // endregion

    // region data class 測試

    /** 驗證相同輸入產生相等實例。 */
    @Test
    fun `data class equality 相同輸入產生相等實例`() {
        val a = ThemeColors.fromArgb(0xFFFF0000.toInt(), 0, 0, 0, 0)
        val b = ThemeColors.fromArgb(0xFFFF0000.toInt(), 0, 0, 0, 0)
        assertEquals(a, b)
    }

    /** 驗證 copy 可修改單一屬性。 */
    @Test
    fun `data class copy 可修改單一屬性`() {
        val original = ThemeColors.fromArgb(0xFFFF0000.toInt(), 0, 0, 0, 0)
        val copied = original.copy(primary = Color.Cyan)
        assertEquals(Color.Cyan, copied.primary)
        assertEquals(original.surfaceContainerHigh, copied.surfaceContainerHigh)
    }

    // endregion
}
