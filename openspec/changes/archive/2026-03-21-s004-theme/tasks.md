## 1. AppTheme class structure（Material 3 主題配置結構）

- [x] 1.1 在 `lib/config/theme.dart` 中實作 AppTheme class structure：定義 `AppTheme` 為 `abstract final class`
- [x] 1.2 定義 seed color 常數，採用藍色系色調

## 2. Light theme defined（色彩方案使用 ColorScheme.fromSeed）

- [x] 2.1 實作 Light theme defined：定義 `static ThemeData get lightTheme`，使用 `useMaterial3: true`
- [x] 2.2 使用 `ColorScheme.fromSeed` 搭配 `Brightness.light` 生成亮色色彩方案

## 3. Dark theme defined（文字樣式使用預設 Material 3 TextTheme）

- [x] 3.1 實作 Dark theme defined：定義 `static ThemeData get darkTheme`，使用 `useMaterial3: true`
- [x] 3.2 使用 `ColorScheme.fromSeed` 搭配 `Brightness.dark` 與相同 seed color 生成暗色色彩方案
