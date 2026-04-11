import Flutter
import ImageIO
import Observation

/// 圖片檢視器的狀態管理 ViewModel。
///
/// 使用 `@Observable` 巨集管理檢視器狀態，
/// 透過 `FlutterMethodChannel` 與 Flutter 端進行雙向通訊。
@MainActor
@Observable
final class PhotoViewerViewModel {

    // MARK: - Properties

    /// 照片檔案路徑清單。
    let filePaths: [String]

    /// Blog 識別碼。
    let blogId: String

    /// Flutter 傳入的已翻譯 UI 字串。
    let localizedStrings: [String: String]

    /// 是否為深色模式。
    let isDarkMode: Bool

    /// Flutter 傳入的主題色彩。
    let themeColors: ThemeColors

    /// 目前顯示的照片索引。
    var currentIndex: Int

    /// 是否處於沉浸模式（隱藏覆蓋列與系統 UI）。
    var isImmersive = false

    /// 目前照片的檢視狀態。
    private(set) var viewState: ViewState = .idle

    /// 是否正在顯示檔案資訊 Sheet。
    var showFileInfo = false

    /// 關閉檢視器的閉包，由 ``PhotoViewerController`` 注入。
    @ObservationIgnored
    var dismissAction: (() -> Void)?

    /// 與 Flutter 端通訊的 MethodChannel。
    @ObservationIgnored
    private let channel: FlutterMethodChannel

    /// 照片儲存服務，透過 ``PhotoSaveable`` 協議注入，解耦具體實作。
    @ObservationIgnored
    private let photoService: PhotoSaveable

    // MARK: - Computed Properties

    /// 照片總數。
    var totalCount: Int { filePaths.count }

    /// 目前照片的檔案路徑。
    ///
    /// 回傳 ``currentIndex`` 對應的檔案路徑；索引超出範圍時回傳空字串。
    var currentFilePath: String {
        guard currentIndex >= 0, currentIndex < filePaths.count else {
            return ""
        }
        return filePaths[currentIndex]
    }

    // MARK: - Initialization

    /// 建立 ``PhotoViewerViewModel``。
    ///
    /// - Parameters:
    ///   - filePaths: 照片檔案路徑清單。
    ///   - blogId: Blog 識別碼。
    ///   - initialIndex: 初始顯示的照片索引。
    ///   - localizedStrings: Flutter 傳入的已翻譯字串。
    ///   - isDarkMode: 是否為深色模式。
    ///   - themeColors: Flutter 傳入的主題色彩。
    ///   - channel: Flutter MethodChannel。
    ///   - photoSaveable: 照片儲存服務，透過 ``PhotoSaveable`` 協議注入。
    init(
        filePaths: [String],
        blogId: String,
        initialIndex: Int,
        localizedStrings: [String: String],
        isDarkMode: Bool,
        themeColors: ThemeColors,
        channel: FlutterMethodChannel,
        photoService: PhotoSaveable
    ) {
        self.filePaths = filePaths
        self.blogId = blogId
        self.currentIndex = initialIndex
        self.localizedStrings = localizedStrings
        self.isDarkMode = isDarkMode
        self.themeColors = themeColors
        self.channel = channel
        self.photoService = photoService
    }
}

// MARK: - Internal Methods

extension PhotoViewerViewModel {

    /// 切換至指定頁面，重設儲存狀態。
    ///
    /// - Parameter index: 新的照片索引。
    func onPageChanged(_ index: Int) {
        currentIndex = index
        viewState = .idle
    }

    /// 儲存目前照片至相簿。
    ///
    /// 透過注入的 ``PhotoSaveable`` 執行儲存，成功後透過 channel 通知 Flutter 記錄 log。
    /// 儲存失敗時 ``viewState`` 會回到 `.idle`。
    func save() async {
        guard viewState == .idle else {
            return
        }
        viewState = .saving

        do {
            _ = try await photoService.saveToGallery(filePath: currentFilePath)
            viewState = .saved
            channel.invokeMethod("onSaveCompleted", arguments: ["blogId": blogId])
        } catch {
            viewState = .idle
        }
    }

    /// 關閉檢視器並通知 Flutter。
    func dismiss() {
        channel.invokeMethod("onDismissed", arguments: ["lastIndex": currentIndex])
        dismissAction?()
    }

    /// 取得指定索引照片的檔案資訊。
    ///
    /// - Parameter index: 照片在 ``filePaths`` 中的索引。
    /// - Returns: 檔案大小與圖片尺寸；讀取失敗時回傳 `nil`。
    func fileInfo(at index: Int) -> PhotoFileInfo? {
        guard index >= 0, index < filePaths.count else {
            return nil
        }
        let path = filePaths[index]

        guard let attrs = try? FileManager.default.attributesOfItem(atPath: path),
              let size = attrs[.size] as? Int else {
            return nil
        }

        let url = URL(fileURLWithPath: path) as CFURL
        guard let source = CGImageSourceCreateWithURL(url, nil) else {
            return nil
        }
        guard let properties = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [CFString: Any] else {
            return nil
        }

        let width = properties[kCGImagePropertyPixelWidth] as? Int ?? 0
        let height = properties[kCGImagePropertyPixelHeight] as? Int ?? 0

        return PhotoFileInfo(fileSizeBytes: size, width: width, height: height)
    }
}

// MARK: - Nested Types

extension PhotoViewerViewModel {

    /// 照片檢視器的檢視狀態，表示目前照片的儲存操作進度。
    enum ViewState {
        
        /// 閒置，尚未觸發儲存。
        case idle

        /// 儲存中。
        case saving

        /// 已成功儲存至相簿。
        case saved
    }
}
