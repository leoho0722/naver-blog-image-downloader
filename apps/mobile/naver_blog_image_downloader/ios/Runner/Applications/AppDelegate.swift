import Flutter
import UIKit

/// 應用程式委派，負責 Flutter 引擎初始化與 MethodChannel 註冊。
///
/// 在 ``didInitializeImplicitFlutterEngine(_:)`` 中註冊
/// Gallery Channel 與 PhotoViewer Channel，橋接 Flutter 與原生功能。
@main
@objc class AppDelegate: FlutterAppDelegate, FlutterImplicitEngineDelegate {

    // MARK: - Properties

    /// 相簿存取服務實例，供 Gallery Channel 使用。
    let photoService = PhotoService()

    /// 圖片檢視器用的 MethodChannel，供原生端回呼 Flutter 使用。
    var photoViewerChannel: FlutterMethodChannel?

    // MARK: - Lifecycle

    /// 應用程式啟動完成回呼。
    ///
    /// - Parameters:
    ///   - application: 應用程式實例。
    ///   - launchOptions: 啟動選項字典。
    /// - Returns: 啟動是否成功。
    override func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        super.application(application, didFinishLaunchingWithOptions: launchOptions)
    }

    /// Flutter 隱式引擎初始化完成回呼，註冊所有 MethodChannel。
    ///
    /// - Parameter engineBridge: Flutter 引擎橋接物件，提供 Plugin 註冊與 BinaryMessenger。
    func didInitializeImplicitFlutterEngine(_ engineBridge: FlutterImplicitEngineBridge) {
        GeneratedPluginRegistrant.register(with: engineBridge.pluginRegistry)
        guard let registrar = engineBridge.pluginRegistry.registrar(forPlugin: "PhotoService") else {
            return
        }
        let messenger = registrar.messenger()
        setupGalleryChannel(messenger: messenger)
        setupPhotoViewerChannel(messenger: messenger)
        setupAppIconChannel(messenger: messenger)
    }
}
