import Testing
@testable import Runner

/// ``PhotoFileInfo`` 格式化邏輯的單元測試。
@Suite("PhotoFileInfo Tests")
struct PhotoFileInfoTests {

    // MARK: - formattedFileSize 測試

    /// 驗證小於 1MB 的檔案大小格式化為 KB。
    @Test("500000 bytes 格式化為 500.0 KB")
    func fileSizeUnder1MB() {
        let info = PhotoFileInfo(fileSizeBytes: 500_000, width: 100, height: 100)
        #expect(info.formattedFileSize == "500.0 KB")
    }

    /// 驗證大於等於 1MB 的檔案大小格式化為 MB。
    @Test("2500000 bytes 格式化為 2.5 MB")
    func fileSizeAbove1MB() {
        let info = PhotoFileInfo(fileSizeBytes: 2_500_000, width: 100, height: 100)
        #expect(info.formattedFileSize == "2.5 MB")
    }

    /// 驗證邊界值 999999 bytes 格式化為 KB。
    @Test("999999 bytes 格式化為 1000.0 KB")
    func fileSizeBoundaryBelow1MB() {
        let info = PhotoFileInfo(fileSizeBytes: 999_999, width: 100, height: 100)
        #expect(info.formattedFileSize == "1000.0 KB")
    }

    /// 驗證邊界值 1000000 bytes 格式化為 MB。
    @Test("1000000 bytes 格式化為 1.0 MB")
    func fileSizeBoundaryAt1MB() {
        let info = PhotoFileInfo(fileSizeBytes: 1_000_000, width: 100, height: 100)
        #expect(info.formattedFileSize == "1.0 MB")
    }

    /// 驗證 0 bytes 格式化為 KB。
    @Test("0 bytes 格式化為 0.0 KB")
    func fileSizeZero() {
        let info = PhotoFileInfo(fileSizeBytes: 0, width: 100, height: 100)
        #expect(info.formattedFileSize == "0.0 KB")
    }

    // MARK: - formattedDimensions 測試

    /// 驗證正常尺寸格式化。
    @Test("1920x1080 格式化為 1920 × 1080")
    func normalDimensions() {
        let info = PhotoFileInfo(fileSizeBytes: 100, width: 1920, height: 1080)
        #expect(info.formattedDimensions == "1920 × 1080")
    }

    /// 驗證零尺寸格式化。
    @Test("零尺寸格式化為 0 × 0")
    func zeroDimensions() {
        let info = PhotoFileInfo(fileSizeBytes: 100, width: 0, height: 0)
        #expect(info.formattedDimensions == "0 × 0")
    }
}
