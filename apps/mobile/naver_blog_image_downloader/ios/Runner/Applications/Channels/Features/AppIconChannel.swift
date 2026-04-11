import Flutter
import UIKit

// MARK: - App Icon Channel

extension AppDelegate {

    /// 註冊 AppIcon MethodChannel，處理 `setAppIcon` 與 `getCurrentIcon` 呼叫。
    ///
    /// - Parameter messenger: Flutter BinaryMessenger，用於建立 MethodChannel。
    func setupAppIconChannel(messenger: FlutterBinaryMessenger) {
        let channel = FlutterMethodChannel(
            name: "com.leoho.naverBlogImageDownloader/appIcon",
            binaryMessenger: messenger
        )

        channel.setMethodCallHandler { [weak self] call, result in
            guard let self else {
                result(FlutterError(
                    code: "UNAVAILABLE",
                    message: "AppDelegate deallocated",
                    details: nil
                ))
                return
            }
            self.handleAppIconMethodCall(call, result: result)
        }
    }
}

// MARK: - Private Methods

private extension AppDelegate {

    /// 分派 AppIcon MethodChannel 的方法呼叫。
    ///
    /// - Parameters:
    ///   - call: Flutter 端傳入的方法呼叫，包含方法名稱與參數。
    ///   - result: 回傳結果給 Flutter 端的 callback。
    func handleAppIconMethodCall(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
        Task {
            switch call.method {
            case "setAppIcon":
                await handleSetAppIcon(call, result: result)
            case "getCurrentIcon":
                handleGetCurrentIcon(result: result)
            default:
                result(FlutterMethodNotImplemented)
            }
        }
    }

    /// 處理 `setAppIcon` 方法呼叫，透過 UIApplication 切換 App 圖示。
    ///
    /// 使用 xcassets icon set 方式：
    /// `"default"` 對應 `nil`（主圖示），`"new"` 對應 `"NewAppIcon"`（替代圖示 icon set 名稱）。
    ///
    /// - Parameters:
    ///   - call: 需包含 `Map` 類型的參數，含 `iconName`（String）。
    ///   - result: 成功回傳 `nil`，失敗回傳 `FlutterError`。
    func handleSetAppIcon(_ call: FlutterMethodCall, result: @escaping FlutterResult) async {
        guard let args = call.arguments as? [String: Any],
              let iconName = args["iconName"] as? String else {
            result(FlutterError(code: "INVALID_ARG", message: "iconName is required", details: nil))
            return
        }

        let alternateIconName: String? = (iconName == "default") ? nil : "NewAppIcon"

        do {
            try await UIApplication.shared.setAlternateIconName(alternateIconName)
            result(nil)
        } catch {
            result(FlutterError(code: "SET_ICON_FAILED", message: error.localizedDescription, details: nil))
        }
    }

    /// 處理 `getCurrentIcon` 方法呼叫，取得目前使用中的 App 圖示名稱。
    ///
    /// `alternateIconName` 為 `nil` 表示使用主圖示（classic），非 `nil` 表示使用替代圖示（new）。
    ///
    /// - Parameter result: 回傳 `"default"` 或 `"new"`。
    func handleGetCurrentIcon(result: @escaping FlutterResult) {
        let currentAlternate = UIApplication.shared.alternateIconName
        let iconName = (currentAlternate == nil) ? "default" : "new"
        result(iconName)
    }
}
