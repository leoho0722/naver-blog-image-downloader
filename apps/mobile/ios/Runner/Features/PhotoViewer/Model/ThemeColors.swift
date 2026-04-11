import UIKit

/// Flutter 傳入的 Material 3 主題色彩值（ARGB 整數）。
struct ThemeColors {

    // MARK: - Properties

    /// Surface Container High 色（膠囊列背景）。
    let surfaceContainerHigh: UIColor

    /// On Surface 色（主要文字）。
    let onSurface: UIColor

    /// On Surface Variant 色（次要文字）。
    let onSurfaceVariant: UIColor

    /// Primary 色（強調色）。
    let primary: UIColor

    /// Surface 色（背景）。
    let surface: UIColor

    // MARK: - Initialization

    /// 從 ARGB 整數 Map 建立 ``ThemeColors``。
    ///
    /// - Parameter raw: Flutter 端傳入的 `[String: Int]` ARGB 色彩對應表。
    init(from raw: [String: Int]) {
        surfaceContainerHigh = Self.color(from: raw["surfaceContainerHigh"])
        onSurface = Self.color(from: raw["onSurface"])
        onSurfaceVariant = Self.color(from: raw["onSurfaceVariant"])
        primary = Self.color(from: raw["primary"])
        surface = Self.color(from: raw["surface"])
    }
}

// MARK: - Private Methods

private extension ThemeColors {

    /// 將 ARGB 整數轉為 UIColor。
    ///
    /// - Parameter argb: 32-bit ARGB 整數值，`nil` 時回傳白色。
    /// - Returns: 對應的 UIColor。
    static func color(from argb: Int?) -> UIColor {
        guard let argb else {
            return .white
        }
        let a = CGFloat((argb >> 24) & 0xFF) / 255
        let r = CGFloat((argb >> 16) & 0xFF) / 255
        let g = CGFloat((argb >> 8) & 0xFF) / 255
        let b = CGFloat(argb & 0xFF) / 255
        return UIColor(red: r, green: g, blue: b, alpha: a)
    }
}
