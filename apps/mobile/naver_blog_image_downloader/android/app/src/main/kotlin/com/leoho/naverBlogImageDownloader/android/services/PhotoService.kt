package com.leoho.naverBlogImageDownloader.android.services

import android.content.ContentValues
import android.content.Context
import android.os.Environment
import android.provider.MediaStore
import android.webkit.MimeTypeMap
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileInputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.atomic.AtomicInteger

/**
 * 原生相簿儲存服務，使用 MediaStore 直接複製檔案不轉碼。
 *
 * @param context Android Context，用於存取 ContentResolver。
 */
class PhotoService(private val context: Context) : PhotoSaveable {

    // region Properties

    /** 檔名序號計數器，確保批次儲存時檔名唯一。 */
    private val sequenceCounter = AtomicInteger(0)

    // endregion

    // region Public Methods

    /**
     * 將指定路徑的圖片檔案儲存至系統相簿。
     *
     * 使用 MediaStore API + FileInputStream.copyTo 直接複製原始 bytes，
     * 不轉碼，保留原始編碼與檔案大小。
     *
     * @param filePath 圖片檔案的完整路徑。
     * @param totalCount 本次批次儲存的總張數，用於計算檔名序號的補零位數。
     * @return 儲存成功回傳 `true`。
     * @throws Exception 建立 MediaStore entry 或開啟輸出流失敗時拋出。
     */
    override suspend fun saveToGallery(filePath: String, totalCount: Int): Boolean = withContext(Dispatchers.IO) {
        val file = File(filePath)
        val mimeType = getMimeType(file)

        val displayName = generateDisplayName(file.extension, totalCount)
        val values = ContentValues().apply {
            put(MediaStore.Images.Media.DISPLAY_NAME, displayName)
            put(MediaStore.Images.Media.MIME_TYPE, mimeType)
            put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES)
        }

        val uri = context.contentResolver.insert(
            MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values
        ) ?: throw Exception("Failed to create MediaStore entry")

        context.contentResolver.openOutputStream(uri)?.use { output ->
            FileInputStream(file).use { input -> input.copyTo(output) }
        } ?: throw Exception("Failed to open output stream")

        true
    }

    /**
     * 請求相簿存取權限。
     *
     * Android 的權限由 Activity 層級處理，此處回傳 true。
     * 實際權限請求透過 AndroidManifest 宣告自動觸發。
     *
     * @return 固定回傳 `true`。
     */
    override fun requestPermission(): Boolean {
        return true
    }

    // endregion

    // region Private Methods

    /**
     * 產生系統風格的檔名，使用時間戳 + 動態補零遞增序號確保唯一性與排序一致。
     *
     * 補零位數根據 [totalCount] 動態決定（例如 100 張 → 3 位數，1000 張 → 4 位數）。
     *
     * @param extension 檔案副檔名（如 jpg、png）。
     * @param totalCount 本次批次的總張數，用於計算補零位數。
     * @return 含時間戳與序號的檔名，例如 `IMG_20260323_143025_001.jpg`。
     */
    private fun generateDisplayName(extension: String, totalCount: Int): String {
        val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val padLength = totalCount.toString().length
        val sequence = sequenceCounter.incrementAndGet().toString().padStart(padLength, '0')
        val ext = extension.lowercase().ifEmpty { "jpg" }
        return "IMG_${timestamp}_$sequence.$ext"
    }

    /**
     * 根據檔案副檔名取得 MIME 類型。
     *
     * @param file 要偵測 MIME 類型的檔案。
     * @return MIME 類型字串，無法偵測時預設回傳 `image/jpeg`。
     */
    private fun getMimeType(file: File): String {
        val extension = file.extension.lowercase()
        return MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension)
            ?: "image/jpeg"
    }

    // endregion
}
