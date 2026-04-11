import Photos

/// 原生相簿存取服務，使用 PhotoKit 直接寫入檔案不轉碼。
final class PhotoService: PhotoSaveable {}

// MARK: - Internal Methods

extension PhotoService {

    /// 將指定路徑的圖片檔案儲存至系統相簿。
    ///
    /// 使用 `PHAssetCreationRequest.addResource(with:data:options:)` 寫入原始 bytes，
    /// 不經過 UIImage，保留原始編碼與檔案大小。
    /// iOS 系統自動產生 IMG_xxxx 檔名。
    ///
    /// - Parameter filePath: 圖片檔案的完整路徑。
    /// - Returns: 儲存成功回傳 `true`。
    /// - Throws: 檔案讀取或 `PHPhotoLibrary.performChanges` 失敗時拋出錯誤。
    func saveToGallery(filePath: String) async throws -> Bool {
        let url = URL(fileURLWithPath: filePath)
        let data = try Data(contentsOf: url)
        try await PHPhotoLibrary.shared().performChanges {
            let request = PHAssetCreationRequest.forAsset()
            request.addResource(with: .photo, data: data, options: nil)
        }
        return true
    }

    /// 請求相簿寫入權限（addOnly）。
    ///
    /// - Returns: 使用者授權或有限授權時回傳 `true`，否則回傳 `false`。
    func requestPermission() async -> Bool {
        let status = await PHPhotoLibrary.requestAuthorization(for: .addOnly)
        return status == .authorized || status == .limited
    }
}
