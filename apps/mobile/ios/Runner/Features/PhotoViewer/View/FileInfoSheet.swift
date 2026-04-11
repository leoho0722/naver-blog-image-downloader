import SwiftUI

/// 檔案資訊 Sheet，顯示檔案大小與圖片尺寸。
///
/// 使用 Flutter 傳入的 l10n 字串作為標籤文字，
/// 從 ``PhotoViewerViewModel/fileInfo(at:)`` 取得檔案元資料。
struct FileInfoSheet: View {

    // MARK: - Properties

    /// 檢視器的 ViewModel，用於讀取檔案資訊與 l10n 字串。
    let viewModel: PhotoViewerViewModel

    // MARK: - Body

    var body: some View {
        NavigationStack {
            List {
                if let info = viewModel.fileInfo(at: viewModel.currentIndex) {
                    HStack {
                        Text(viewModel.localizedStrings["fileSize"] ?? "File Size")
                        Spacer()
                        Text(info.formattedFileSize)
                            .foregroundStyle(.secondary)
                    }
                    HStack {
                        Text(viewModel.localizedStrings["dimensions"] ?? "Dimensions")
                        Spacer()
                        Text(info.formattedDimensions)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .contentMargins(.top, 8)
            .navigationTitle(viewModel.localizedStrings["fileInfo"] ?? "File Info")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}
