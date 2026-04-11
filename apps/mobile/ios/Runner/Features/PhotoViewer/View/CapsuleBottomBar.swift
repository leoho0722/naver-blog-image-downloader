import SwiftUI

/// 底部膠囊操作列，包含資訊按鈕與儲存按鈕。
///
/// 使用 Flutter 傳入的 `surfaceContainerHigh` 色彩作為背景，
/// 透過 ``AsyncButton`` 執行非同步儲存操作。
struct CapsuleBottomBar: View {

    // MARK: - Properties

    /// 檢視器的 ViewModel，用於讀取儲存狀態與觸發操作。
    @Bindable var viewModel: PhotoViewerViewModel

    // MARK: - Body

    var body: some View {
        HStack(spacing: 0) {
            Button(viewModel.localizedStrings["fileInfo"] ?? "Info", systemImage: "info.circle") {
                viewModel.showFileInfo = true
            }
            .labelStyle(.iconOnly)
            .font(.title3)
            .foregroundStyle(.white)
            .frame(width: 56, height: 44)

            Divider()
                .frame(height: 24)
                .overlay(Color.white.opacity(0.3))

            AsyncButton(action: viewModel.save) {
                Group {
                    switch viewModel.viewState {
                    case .idle:
                        Image(systemName: "square.and.arrow.down")
                            .imageScale(.medium)
                            .offset(y: -2)

                    case .saving:
                        ProgressView()
                            .tint(.white)

                    case .saved:
                        Image(systemName: "checkmark")
                    }
                }
                .font(.title3)
                .foregroundStyle(.white)
                .frame(width: 56, height: 44)
            }
            .disabled(viewModel.viewState != .idle)
        }
        .background(
            Capsule()
                .fill(Color(viewModel.themeColors.surfaceContainerHigh).opacity(0.85))
        )
    }
}
