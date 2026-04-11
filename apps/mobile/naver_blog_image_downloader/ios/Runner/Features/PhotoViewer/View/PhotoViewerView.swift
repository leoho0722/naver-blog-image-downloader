import SwiftUI

/// 原生全螢幕圖片檢視器的 SwiftUI 主畫面。
///
/// 不使用 `NavigationStack` 管理 layout，改為純 `ZStack` 疊加
/// 自訂頂部列與底部膠囊列，避免 safe area 與 toolbar 造成的位移問題。
struct PhotoViewerView: View {

    // MARK: - Properties

    /// 檢視器的狀態管理 ViewModel。
    @Bindable var viewModel: PhotoViewerViewModel

    /// TabView 當前選中的頁面索引。
    @State private var selectedTab: Int

    // MARK: - Initialization

    /// 建立 ``PhotoViewerView``。
    ///
    /// - Parameter viewModel: 檢視器的 ViewModel。
    init(viewModel: PhotoViewerViewModel) {
        self.viewModel = viewModel
        self._selectedTab = State(initialValue: viewModel.currentIndex)
    }

    // MARK: - Body

    var body: some View {
        ZStack {
            // 全螢幕黑色背景
            Color.black.ignoresSafeArea()

            // 照片翻頁 — 填滿整個螢幕
            TabView(selection: $selectedTab) {
                ForEach(viewModel.filePaths.enumerated().map { $0 }, id: \.offset) { _, filePath in
                    ZoomableImageView(filePath: filePath)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .ignoresSafeArea()
            .onChange(of: selectedTab) { _, newValue in
                viewModel.onPageChanged(newValue)
            }
            .onTapGesture {
                viewModel.isImmersive.toggle()
            }

            // 頂部列
            if !viewModel.isImmersive {
                VStack {
                    PhotoViewerNavigationBar(viewModel: viewModel)
                    Spacer()
                }
                .transition(.opacity)
            }

            // 底部膠囊列
            if !viewModel.isImmersive {
                VStack {
                    Spacer()
                    CapsuleBottomBar(viewModel: viewModel)
                        .padding(.bottom, 16)
                }
                .transition(.opacity)
            }
        }
        .animation(.easeInOut(duration: 0.25), value: viewModel.isImmersive)
        .sheet(isPresented: $viewModel.showFileInfo) {
            FileInfoSheet(viewModel: viewModel)
                .presentationDetents([.height(180)])
                .presentationDragIndicator(.hidden)
                .presentationBackground(Color(.systemBackground))
        }
    }
}
