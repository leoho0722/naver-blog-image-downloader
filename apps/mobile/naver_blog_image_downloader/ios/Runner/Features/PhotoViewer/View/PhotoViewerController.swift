import SwiftUI
import UIKit

/// 原生全螢幕圖片檢視器的 UIKit 包裝容器。
///
/// 使用 `UIHostingController` 包裝 SwiftUI 的 ``PhotoViewerView``，
/// 並根據 ViewModel 的沉浸模式狀態控制狀態列顯隱。
final class PhotoViewerController: UIHostingController<PhotoViewerView> {

    // MARK: - Properties

    /// 檢視器的 ViewModel，用於監聽沉浸模式狀態。
    private let viewModel: PhotoViewerViewModel

    // MARK: - Computed Properties

    /// 根據沉浸模式狀態決定是否隱藏狀態列。
    override var prefersStatusBarHidden: Bool {
        viewModel.isImmersive
    }

    // MARK: - Initialization

    /// 建立全螢幕圖片檢視器控制器。
    ///
    /// - Parameter viewModel: 檢視器的狀態管理 ViewModel。
    init(viewModel: PhotoViewerViewModel) {
        self.viewModel = viewModel
        let view = PhotoViewerView(viewModel: viewModel)
        super.init(rootView: view)
    }

    @available(*, unavailable)
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}
