/// 照片檔案的元資料，包含檔案大小與圖片尺寸。
struct PhotoFileInfo {

    // MARK: - Properties

    /// 檔案大小（bytes）。
    let fileSizeBytes: Int

    /// 圖片寬度（px）。
    let width: Int

    /// 圖片高度（px）。
    let height: Int

    // MARK: - Computed Properties

    /// 格式化的檔案大小字串（KB 或 MB，保留一位小數）。
    var formattedFileSize: String {
        if fileSizeBytes < 1_000_000 {
            return String(format: "%.1f KB", Double(fileSizeBytes) / 1_000)
        }
        return String(format: "%.1f MB", Double(fileSizeBytes) / 1_000_000)
    }

    /// 格式化的圖片尺寸字串（"寬 × 高"）。
    var formattedDimensions: String {
        "\(width) × \(height)"
    }
}
