package com.leoho.naverBlogImageDownloader.android.features.photoviewer.model

/**
 * 照片檔案的元資料，包含檔案大小與圖片尺寸。
 *
 * @param fileSizeBytes 檔案大小（bytes）。
 * @param width 圖片寬度（px）。
 * @param height 圖片高度（px）。
 */
data class PhotoFileInfo(
    val fileSizeBytes: Long,
    val width: Int,
    val height: Int,
) {

    /** 格式化的檔案大小字串（KB 或 MB，保留一位小數）。 */
    val formattedFileSize: String
        get() = if (fileSizeBytes < 1_000_000) {
            String.format("%.1f KB", fileSizeBytes / 1_000.0)
        } else {
            String.format("%.1f MB", fileSizeBytes / 1_000_000.0)
        }

    /** 格式化的圖片尺寸字串（"寬 × 高"）。 */
    val formattedDimensions: String
        get() = "$width × $height"
}
