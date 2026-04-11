## Context

本專案為 Flutter 應用程式，需要統一的 Material 3 主題配置供 `MaterialApp` 使用。主題包含色彩方案（ColorScheme）與文字樣式（TextTheme），需同時支援亮色與暗色模式。

## Goals / Non-Goals

**Goals:**

- 定義 Material 3 亮色與暗色主題的 `ThemeData`
- 配置 `ColorScheme`（包含 seed color 或自訂色彩）
- 配置 `TextTheme`（文字大小與樣式層級）
- 提供集中存取主題的方式

**Non-Goals:**

- 不實作主題動態切換的狀態管理
- 不實作自訂元件主題（如自訂按鈕樣式）
- 不支援使用者自訂色彩

## Decisions

### Material 3 主題配置結構

使用 abstract final class 定義 `AppTheme`，提供兩個靜態 getter：
- `lightTheme`：亮色模式 ThemeData
- `darkTheme`：暗色模式 ThemeData

兩者皆啟用 `useMaterial3: true`。

### 色彩方案使用 ColorScheme.fromSeed

使用 `ColorScheme.fromSeed` 從種子色自動生成完整的色彩方案，確保色彩和諧性與無障礙對比度。seed color 預設採用適合照片下載器應用的藍色系色調。

### 文字樣式使用預設 Material 3 TextTheme

沿用 Material 3 預設的 TextTheme 層級（displayLarge、headlineMedium、bodyLarge 等），不做額外自訂，保持一致性。

## Risks / Trade-offs

- [取捨] 使用 `fromSeed` 自動生成色彩而非手動定義每個色階，簡化維護但可能不完全符合設計稿 → 對於此應用程式，自動生成已足夠
- [取捨] 暗色模式使用相同 seed color，由 Material 3 演算法自動調整 → 確保亮暗模式色彩一致性
