import SwiftUI
import UIKit

/// 可捏合縮放的圖片視圖，使用 `UIViewRepresentable` 包裝 ``ZoomableScrollView``。
///
/// ``ZoomableScrollView`` 原生支援流暢的捏合縮放與慣性彈跳，
/// 搭配 `UITapGestureRecognizer` 實現雙擊切換 1x/2x 縮放。
/// 頁面切換時（`filePath` 改變）自動重設縮放至 1x。
struct ZoomableImageView: UIViewRepresentable {

    // MARK: - Properties

    /// 圖片檔案的本機絕對路徑。
    let filePath: String

    // MARK: - UIViewRepresentable

    /// 建立 ``ZoomableScrollView`` 並設定雙擊手勢。
    ///
    /// - Parameter context: SwiftUI 的 UIViewRepresentable 上下文。
    /// - Returns: 設定完成的 ``ZoomableScrollView``。
    func makeUIView(context: Context) -> ZoomableScrollView {
        let scrollView = ZoomableScrollView()

        // 雙擊手勢：切換 1x / 2x
        let doubleTap = UITapGestureRecognizer(
            target: context.coordinator,
            action: #selector(Coordinator.handleDoubleTap(_:))
        )
        doubleTap.numberOfTapsRequired = 2
        scrollView.addGestureRecognizer(doubleTap)

        return scrollView
    }

    /// 更新圖片內容（頁面切換時觸發）。
    ///
    /// - Parameters:
    ///   - scrollView: 要更新的 ``ZoomableScrollView``。
    ///   - context: SwiftUI 的 UIViewRepresentable 上下文。
    func updateUIView(_ scrollView: ZoomableScrollView, context: Context) {
        if context.coordinator.currentFilePath != filePath {
            context.coordinator.currentFilePath = filePath
            scrollView.image = UIImage(contentsOfFile: filePath)
        }
    }

    /// 建立 Coordinator，作為雙擊手勢處理器。
    ///
    /// - Returns: ``Coordinator`` 實例。
    func makeCoordinator() -> Coordinator {
        Coordinator()
    }
}

// MARK: - Coordinator

extension ZoomableImageView {

    /// 雙擊手勢處理 Coordinator。
    final class Coordinator: NSObject {

        // MARK: - Properties

        /// 目前載入的檔案路徑，用於偵測頁面切換。
        var currentFilePath: String = ""

        // MARK: - Internal Methods

        /// 處理雙擊手勢：在 1x 與 2x 之間切換縮放。
        ///
        /// - Parameter gesture: 雙擊手勢辨識器。
        @objc func handleDoubleTap(_ gesture: UITapGestureRecognizer) {
            guard let scrollView = gesture.view as? ZoomableScrollView else {
                return
            }

            if scrollView.zoomScale > 1.0 {
                scrollView.setZoomScale(1.0, animated: true)
            } else {
                let point = gesture.location(in: scrollView.subviews.first)
                let zoomRect = zoomRectForScale(2.0, center: point, in: scrollView)
                scrollView.zoom(to: zoomRect, animated: true)
            }
        }
    }
}

// MARK: - Coordinator Private Methods

private extension ZoomableImageView.Coordinator {

    /// 計算以指定中心點為基準的縮放矩形。
    ///
    /// - Parameters:
    ///   - scale: 目標縮放倍率。
    ///   - center: 縮放中心點（相對於內容視圖）。
    ///   - scrollView: 發起縮放的 scrollView。
    /// - Returns: 要縮放至的目標矩形。
    func zoomRectForScale(_ scale: CGFloat, center: CGPoint, in scrollView: UIScrollView) -> CGRect {
        let size = CGSize(
            width: scrollView.bounds.width / scale,
            height: scrollView.bounds.height / scale
        )
        return CGRect(
            x: center.x - size.width / 2,
            y: center.y - size.height / 2,
            width: size.width,
            height: size.height
        )
    }
}
