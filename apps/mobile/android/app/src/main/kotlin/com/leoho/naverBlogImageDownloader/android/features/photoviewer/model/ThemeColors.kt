package com.leoho.naverBlogImageDownloader.android.features.photoviewer.model

import androidx.compose.ui.graphics.Color

/**
 * Flutter 傳入的 Material 3 主題色彩值（ARGB 整數轉 Compose Color）。
 *
 * @param surfaceContainerHigh Surface Container High 色（膠囊列背景）。
 * @param onSurface On Surface 色（主要文字）。
 * @param onSurfaceVariant On Surface Variant 色（次要文字）。
 * @param primary Primary 色（強調色）。
 * @param surface Surface 色（背景）。
 */
data class ThemeColors(
    val surfaceContainerHigh: Color,
    val onSurface: Color,
    val onSurfaceVariant: Color,
    val primary: Color,
    val surface: Color,
) {
    companion object {
        /**
         * 從 ARGB 整數建立 [ThemeColors]。
         *
         * @param surfaceContainerHigh ARGB 整數。
         * @param onSurface ARGB 整數。
         * @param onSurfaceVariant ARGB 整數。
         * @param primary ARGB 整數。
         * @param surface ARGB 整數。
         * @return [ThemeColors] 實例。
         */
        fun fromArgb(
            surfaceContainerHigh: Int,
            onSurface: Int,
            onSurfaceVariant: Int,
            primary: Int,
            surface: Int,
        ) = ThemeColors(
            surfaceContainerHigh = Color(surfaceContainerHigh),
            onSurface = Color(onSurface),
            onSurfaceVariant = Color(onSurfaceVariant),
            primary = Color(primary),
            surface = Color(surface),
        )
    }
}
