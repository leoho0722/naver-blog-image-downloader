import Foundation

/// 照片相簿操作協議，解耦 ViewModel 與 Channel 對平台具體實作的依賴。
///
/// 透過此協議存取儲存與權限功能，測試時可替換為 Fake 實作。
protocol PhotoSaveable {

    /// 將指定路徑的圖片檔案儲存至系統相簿。
    ///
    /// - Parameter filePath: 圖片檔案的完整路徑。
    /// - Returns: 儲存成功回傳 `true`。
    /// - Throws: 檔案讀取或寫入相簿失敗時拋出錯誤。
    func saveToGallery(filePath: String) async throws -> Bool

    /// 請求相簿寫入權限。
    ///
    /// - Returns: 使用者授權或有限授權時回傳 `true`，否則回傳 `false`。
    func requestPermission() async -> Bool
}
