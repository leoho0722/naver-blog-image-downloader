import Flutter
import Testing
@testable import Runner

/// ``PhotoViewerViewModel`` 同步狀態管理的單元測試。
@Suite("PhotoViewerViewModel Tests")
struct PhotoViewerViewModelTests {

    // MARK: - 初始狀態測試

    /// 驗證初始化後 currentIndex 等於 initialIndex。
    @Test("初始 currentIndex 等於 initialIndex")
    @MainActor
    func initialCurrentIndex() {
        let vm = makeViewModel(initialIndex: 2)
        #expect(vm.currentIndex == 2)
    }

    /// 驗證初始化後 totalCount 等於 filePaths.count。
    @Test("totalCount 等於 filePaths 數量")
    @MainActor
    func totalCountMatchesFilePaths() {
        let vm = makeViewModel()
        #expect(vm.totalCount == 3)
    }

    /// 驗證 currentFilePath 回傳正確路徑。
    @Test("currentFilePath 回傳對應索引的路徑")
    @MainActor
    func currentFilePathReturnsCorrectPath() {
        let vm = makeViewModel(initialIndex: 1)
        #expect(vm.currentFilePath == "/path/to/photo2.jpg")
    }

    /// 驗證索引超出範圍時 currentFilePath 回傳空字串。
    @Test("索引超出範圍時 currentFilePath 回傳空字串")
    @MainActor
    func currentFilePathOutOfBoundsReturnsEmpty() {
        let vm = makeViewModel(initialIndex: 99)
        #expect(vm.currentFilePath == "")
    }

    /// 驗證 viewState 初始為 .idle。
    @Test("viewState 初始為 .idle")
    @MainActor
    func initialViewState() {
        let vm = makeViewModel()
        #expect(vm.viewState == .idle)
    }

    /// 驗證 isImmersive 初始為 false。
    @Test("isImmersive 初始為 false")
    @MainActor
    func initialIsImmersive() {
        let vm = makeViewModel()
        #expect(vm.isImmersive == false)
    }

    /// 驗證 showFileInfo 初始為 false。
    @Test("showFileInfo 初始為 false")
    @MainActor
    func initialShowFileInfo() {
        let vm = makeViewModel()
        #expect(vm.showFileInfo == false)
    }

    // MARK: - onPageChanged 測試

    /// 驗證 onPageChanged 更新 currentIndex。
    @Test("onPageChanged 更新 currentIndex")
    @MainActor
    func onPageChangedUpdatesIndex() {
        let vm = makeViewModel(initialIndex: 0)
        vm.onPageChanged(2)
        #expect(vm.currentIndex == 2)
    }

    /// 驗證 onPageChanged 重設 viewState 為 .idle。
    @Test("onPageChanged 重設 viewState 為 .idle")
    @MainActor
    func onPageChangedResetsViewState() {
        let vm = makeViewModel()
        vm.onPageChanged(1)
        #expect(vm.viewState == .idle)
    }

    // MARK: - dismiss 測試

    /// 驗證 dismiss 觸發 dismissAction closure。
    @Test("dismiss 觸發 dismissAction")
    @MainActor
    func dismissTriggersAction() {
        var dismissed = false
        let vm = makeViewModel()
        vm.dismissAction = { dismissed = true }
        vm.dismiss()
        #expect(dismissed == true)
    }
}

// MARK: - Test Helpers

/// 測試用的 ``FlutterBinaryMessenger`` mock，不做實際訊息傳遞。
private class MockBinaryMessenger: NSObject, FlutterBinaryMessenger {

    /// 傳送訊息（忽略）。
    func send(onChannel channel: String, message: Data?) {}

    /// 傳送訊息並回呼（回傳 nil）。
    func send(
        onChannel channel: String,
        message: Data?,
        binaryReply callback: FlutterBinaryReply?
    ) {
        callback?(nil)
    }

    /// 設定訊息處理器（忽略）。
    func setMessageHandlerOnChannel(
        _ channel: String,
        binaryMessageHandler handler: FlutterBinaryMessageHandler?
    ) -> FlutterBinaryMessengerConnection {
        return 0
    }

    /// 清除連線（忽略）。
    func cleanUpConnection(_ connection: FlutterBinaryMessengerConnection) {}
}

/// 測試用的 ``PhotoSaveable`` fake，固定回傳 true。
private struct MockPhotoService: PhotoSaveable {

    /// 模擬儲存成功，固定回傳 `true`。
    func saveToGallery(filePath: String) async throws -> Bool {
        return true
    }

    /// 模擬權限已授予，固定回傳 `true`。
    func requestPermission() async -> Bool {
        return true
    }
}

/// 建立測試用的 ``PhotoViewerViewModel``。
///
/// - Parameter initialIndex: 初始照片索引，預設為 0。
/// - Returns: 配置好的 ViewModel 實例。
@MainActor
private func makeViewModel(initialIndex: Int = 0) -> PhotoViewerViewModel {
    let messenger = MockBinaryMessenger()
    let channel = FlutterMethodChannel(
        name: "test/photoViewer",
        binaryMessenger: messenger
    )
    return PhotoViewerViewModel(
        filePaths: ["/path/to/photo1.jpg", "/path/to/photo2.jpg", "/path/to/photo3.jpg"],
        blogId: "test-blog",
        initialIndex: initialIndex,
        localizedStrings: [:],
        isDarkMode: false,
        themeColors: ThemeColors(from: [:]),
        channel: channel,
        photoService: MockPhotoService()
    )
}
