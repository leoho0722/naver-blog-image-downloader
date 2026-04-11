import Flutter

// MARK: - Gallery Channel

extension AppDelegate {

    /// 註冊 Gallery MethodChannel，處理 `saveToGallery` 與 `requestPermission` 呼叫。
    ///
    /// - Parameter messenger: Flutter BinaryMessenger，用於建立 MethodChannel。
    func setupGalleryChannel(messenger: FlutterBinaryMessenger) {
        let channel = FlutterMethodChannel(
            name: "com.leoho.naverBlogImageDownloader/gallery",
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
            self.handleGalleryMethodCall(call, result: result)
        }
    }
}

// MARK: - Private Methods

private extension AppDelegate {

    /// 分派 Gallery MethodChannel 的方法呼叫。
    ///
    /// - Parameters:
    ///   - call: Flutter 端傳入的方法呼叫，包含方法名稱與參數。
    ///   - result: 回傳結果給 Flutter 端的 callback。
    func handleGalleryMethodCall(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
        Task {
            switch call.method {
            case "saveToGallery":
                await handleSaveToGallery(call, result: result)
            case "requestPermission":
                await handleRequestPermission(result: result)
            default:
                result(FlutterMethodNotImplemented)
            }
        }
    }

    /// 處理 `saveToGallery` 方法呼叫。
    ///
    /// - Parameters:
    ///   - call: 需包含 `Map` 類型的參數，含 `filePath`（String）與 `totalCount`（Int）。
    ///   - result: 成功回傳 `true`，失敗回傳 `FlutterError`。
    func handleSaveToGallery(_ call: FlutterMethodCall, result: @escaping FlutterResult) async {
        guard let args = call.arguments as? [String: Any],
              let filePath = args["filePath"] as? String else {
            result(FlutterError(code: "INVALID_ARG", message: "filePath is required", details: nil))
            return
        }
        do {
            let success = try await photoService.saveToGallery(filePath: filePath)
            result(success)
        } catch {
            result(FlutterError(code: "SAVE_FAILED", message: error.localizedDescription, details: nil))
        }
    }

    /// 處理 `requestPermission` 方法呼叫。
    ///
    /// - Parameter result: 授權成功回傳 `true`，否則回傳 `false`。
    func handleRequestPermission(result: @escaping FlutterResult) async {
        let granted = await photoService.requestPermission()
        result(granted)
    }
}
