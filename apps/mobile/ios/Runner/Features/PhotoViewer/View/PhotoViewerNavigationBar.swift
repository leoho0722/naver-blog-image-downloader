import SwiftUI

/// 圖片檢視器的自定義導航列，包含返回按鈕與頁碼指示器。
///
/// 使用黑色到透明的線性漸層背景，固定在螢幕頂部並尊重 safe area。
struct PhotoViewerNavigationBar: View {

    // MARK: - Properties

    /// 檢視器的 ViewModel，用於讀取頁碼與觸發關閉。
    let viewModel: PhotoViewerViewModel

    // MARK: - Body

    var body: some View {
        ZStack {
            // 置中標題
            Text("\(viewModel.currentIndex + 1) / \(viewModel.totalCount)")
                .font(.title3.weight(.medium))
                .foregroundStyle(.white)

            // 左側返回按鈕
            HStack {
                Button("Back", systemImage: "chevron.left", action: viewModel.dismiss)
                    .labelStyle(.iconOnly)
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(.white)
                    .padding(.leading, 16)

                Spacer()
            }
        }
        .frame(height: 44)
        .padding(.top, 4)
        .background(
            LinearGradient(
                colors: [.black.opacity(0.5), .clear],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea(edges: .top)
        )
    }
}
