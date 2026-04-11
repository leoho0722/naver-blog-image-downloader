import Testing
import UIKit
@testable import Runner

/// ``ThemeColors`` 的 ARGB 整數解析單元測試。
@Suite("ThemeColors Tests")
struct ThemeColorsTests {

    // MARK: - ARGB 轉換測試

    /// 驗證不透明紅色（0xFFFF0000）正確轉換為 UIColor。
    @Test("不透明紅色 ARGB 轉換")
    func opaqueRedConversion() {
        let colors = ThemeColors(from: ["primary": 0xFFFF0000 as Int])
        var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
        colors.primary.getRed(&r, green: &g, blue: &b, alpha: &a)

        #expect(abs(r - 1.0) < 1.0 / 255)
        #expect(abs(g - 0.0) < 1.0 / 255)
        #expect(abs(b - 0.0) < 1.0 / 255)
        #expect(abs(a - 1.0) < 1.0 / 255)
    }

    /// 驗證不透明白色（0xFFFFFFFF）正確轉換為 UIColor。
    @Test("不透明白色 ARGB 轉換")
    func opaqueWhiteConversion() {
        let colors = ThemeColors(from: ["surface": 0xFFFFFFFF as Int])
        var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
        colors.surface.getRed(&r, green: &g, blue: &b, alpha: &a)

        #expect(abs(r - 1.0) < 1.0 / 255)
        #expect(abs(g - 1.0) < 1.0 / 255)
        #expect(abs(b - 1.0) < 1.0 / 255)
        #expect(abs(a - 1.0) < 1.0 / 255)
    }

    /// 驗證全透明黑色（0x00000000）正確轉換為 UIColor。
    @Test("全透明黑色 ARGB 轉換")
    func transparentBlackConversion() {
        let colors = ThemeColors(from: ["primary": 0x00000000 as Int])
        var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
        colors.primary.getRed(&r, green: &g, blue: &b, alpha: &a)

        #expect(abs(r - 0.0) < 1.0 / 255)
        #expect(abs(g - 0.0) < 1.0 / 255)
        #expect(abs(b - 0.0) < 1.0 / 255)
        #expect(abs(a - 0.0) < 1.0 / 255)
    }

    // MARK: - Nil Fallback 測試

    /// 驗證缺少 key 時 fallback 為白色。
    @Test("缺少 key 時 fallback 為白色")
    func missingKeyFallbackToWhite() {
        let colors = ThemeColors(from: [:])
        var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
        colors.surfaceContainerHigh.getRed(&r, green: &g, blue: &b, alpha: &a)

        #expect(abs(r - 1.0) < 1.0 / 255)
        #expect(abs(g - 1.0) < 1.0 / 255)
        #expect(abs(b - 1.0) < 1.0 / 255)
        #expect(abs(a - 1.0) < 1.0 / 255)
    }

    /// 驗證完整 5 色 Map 建立後各屬性正確對應。
    @Test("完整 5 色 Map 各屬性獨立解析")
    func fullMapParsesAllProperties() {
        let colors = ThemeColors(from: [
            "surfaceContainerHigh": 0xFFFF0000 as Int,
            "onSurface": 0xFF00FF00 as Int,
            "onSurfaceVariant": 0xFF0000FF as Int,
            "primary": 0xFFFFFF00 as Int,
            "surface": 0xFF000000 as Int,
        ])

        var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0

        // surfaceContainerHigh = 紅色
        colors.surfaceContainerHigh.getRed(&r, green: &g, blue: &b, alpha: &a)
        #expect(abs(r - 1.0) < 1.0 / 255)
        #expect(abs(g - 0.0) < 1.0 / 255)

        // onSurface = 綠色
        colors.onSurface.getRed(&r, green: &g, blue: &b, alpha: &a)
        #expect(abs(g - 1.0) < 1.0 / 255)
        #expect(abs(r - 0.0) < 1.0 / 255)

        // onSurfaceVariant = 藍色
        colors.onSurfaceVariant.getRed(&r, green: &g, blue: &b, alpha: &a)
        #expect(abs(b - 1.0) < 1.0 / 255)

        // primary = 黃色
        colors.primary.getRed(&r, green: &g, blue: &b, alpha: &a)
        #expect(abs(r - 1.0) < 1.0 / 255)
        #expect(abs(g - 1.0) < 1.0 / 255)
        #expect(abs(b - 0.0) < 1.0 / 255)

        // surface = 黑色
        colors.surface.getRed(&r, green: &g, blue: &b, alpha: &a)
        #expect(abs(r - 0.0) < 1.0 / 255)
        #expect(abs(g - 0.0) < 1.0 / 255)
        #expect(abs(b - 0.0) < 1.0 / 255)
    }
}
