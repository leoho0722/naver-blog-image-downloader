package com.leoho.naverBlogImageDownloader.android.services

/**
 * 照片相簿操作介面，解耦 ViewModel 與 Channel 對平台具體實作的依賴。
 *
 * 透過此介面存取儲存與權限功能，測試時可替換為 Fake 實作。
 */
interface PhotoSaveable {

    /**
     * 將指定路徑的圖片檔案儲存至系統相簿。
     *
     * @param filePath 圖片檔案的完整路徑。
     * @param totalCount 本次批次儲存的總張數，用於計算檔名序號的補零位數。
     * @return 儲存成功回傳 `true`。
     * @throws Exception 建立 MediaStore entry 或開啟輸出流失敗時拋出。
     */
    suspend fun saveToGallery(filePath: String, totalCount: Int = 1): Boolean

    /**
     * 請求相簿存取權限。
     *
     * @return 權限已授予時回傳 `true`，否則回傳 `false`。
     */
    fun requestPermission(): Boolean
}
