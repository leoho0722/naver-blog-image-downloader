import SwiftUI

/// 將 `async` 閉包橋接為 SwiftUI `Button` 的通用元件。
///
/// 停用狀態由外部透過 `.disabled()` 修飾器控制，
/// 此元件僅負責在點擊時以 `Task` 啟動非同步操作。
struct AsyncButton<Label: View>: View {

    // MARK: - Properties

    /// 非同步操作閉包。
    let action: () async -> Void

    /// 按鈕標籤內容。
    @ViewBuilder let label: () -> Label

    // MARK: - Initialization

    /// 建立 ``AsyncButton``。
    ///
    /// - Parameters:
    ///   - action: 點擊時執行的非同步閉包。
    ///   - label: 按鈕的視覺內容。
    init(
        action: @escaping () async -> Void,
        @ViewBuilder label: @escaping () -> Label
    ) {
        self.action = action
        self.label = label
    }

    // MARK: - Body

    var body: some View {
        Button {
            Task { 
                await action() 
            }
        } label: {
            label()
        }
    }
}
