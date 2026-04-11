import Flutter
import SwiftUI

// MARK: - Photo Viewer Channel

extension AppDelegate {

    /// 註冊 PhotoViewer MethodChannel，處理 `openViewer` 呼叫。
    ///
    /// - Parameter messenger: Flutter BinaryMessenger，用於建立 MethodChannel。
    func setupPhotoViewerChannel(messenger: FlutterBinaryMessenger) {
        let channel = FlutterMethodChannel(
            name: "com.leoho.naverBlogImageDownloader/photoViewer",
            binaryMessenger: messenger
        )
        photoViewerChannel = channel

        channel.setMethodCallHandler { [weak self] call, result in
            guard let self else {
                result(FlutterError(
                    code: "UNAVAILABLE",
                    message: "AppDelegate deallocated",
                    details: nil
                ))
                return
            }
            switch call.method {
            case "openViewer":
                self.handleOpenViewer(call, result: result)
            default:
                result(FlutterMethodNotImplemented)
            }
        }
    }
}

// MARK: - Private Helpers

private extension AppDelegate {

    /// 處理 `openViewer` 方法呼叫，建立並呈現原生全螢幕圖片檢視器。
    ///
    /// - Parameters:
    ///   - call: 需包含參數 `filePaths`、`initialIndex`、`blogId`、`localizedStrings`、`isDarkMode`、`themeColors`。
    ///   - result: 成功時回傳 `nil`。
    func handleOpenViewer(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
        guard let args = call.arguments as? [String: Any],
              let filePaths = args["filePaths"] as? [String],
              let initialIndex = args["initialIndex"] as? Int,
              let blogId = args["blogId"] as? String,
              let localizedStrings = args["localizedStrings"] as? [String: String],
              let isDarkMode = args["isDarkMode"] as? Bool,
              let themeColorsRaw = args["themeColors"] as? [String: Int] else {
            result(FlutterError(code: "INVALID_ARG", message: "Missing required parameters", details: nil))
            return
        }

        guard let channel = photoViewerChannel else {
            result(FlutterError(code: "NO_CHANNEL", message: "PhotoViewer channel not initialized", details: nil))
            return
        }

        let themeColors = ThemeColors(from: themeColorsRaw)

        let viewModel = PhotoViewerViewModel(
            filePaths: filePaths,
            blogId: blogId,
            initialIndex: initialIndex,
            localizedStrings: localizedStrings,
            isDarkMode: isDarkMode,
            themeColors: themeColors,
            channel: channel,
            photoService: PhotoService()
        )

        let controller = PhotoViewerController(viewModel: viewModel)

        guard let rootVC = UIApplication.shared.connectedScenes
            .compactMap({ $0 as? UIWindowScene })
            .flatMap(\.windows)
            .first(where: \.isKeyWindow)?
            .rootViewController else {
            result(FlutterError(code: "NO_VC", message: "No root view controller", details: nil))
            return
        }

        // 以 UINavigationController 包裝，隱藏系統 navigation bar（使用自定義導航列）
        let navController = UINavigationController(rootViewController: controller)
        navController.setNavigationBarHidden(true, animated: false)
        navController.modalPresentationStyle = .fullScreen

        // 使用從右到左的 push 風格過場動畫
        let transition = CATransition()
        transition.duration = 0.35
        transition.type = .push
        transition.subtype = .fromRight
        transition.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
        rootVC.view.window?.layer.add(transition, forKey: kCATransition)

        viewModel.dismissAction = { [weak navController] in
            // 返回時使用從左到右的 pop 風格過場動畫
            let popTransition = CATransition()
            popTransition.duration = 0.35
            popTransition.type = .push
            popTransition.subtype = .fromLeft
            popTransition.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
            navController?.view.window?.layer.add(popTransition, forKey: kCATransition)
            navController?.dismiss(animated: false)
        }

        rootVC.present(navController, animated: false) {
            result(nil)
        }
    }
}
