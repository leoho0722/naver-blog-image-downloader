## ADDED Requirements

### Requirement: App icon localization keys

All ARB files SHALL contain the following localization keys for the App Icon settings section:

- `settingsSectionAppIcon`: Section header text for the app icon setting.
  - zh_TW: "App 圖示"
  - en: "App Icon"
  - ja: "アプリアイコン"
  - ko: "앱 아이콘"

- `settingsAppIconSheetTitle`: Title text for the app icon bottom sheet.
  - zh_TW: "選擇 App 圖示"
  - en: "Choose App Icon"
  - ja: "アプリアイコンを選択"
  - ko: "앱 아이콘 선택"

- `settingsAppIconStyleScroll`: Label for the toggle button to switch to horizontal scroll view.
  - zh_TW: "以滑動檢視"
  - en: "Scroll View"
  - ja: "スクロール表示"
  - ko: "스크롤 보기"

- `settingsAppIconStyleSheet`: Label for the toggle button to switch to grid/bottom sheet view.
  - zh_TW: "以網格檢視"
  - en: "Grid View"
  - ja: "グリッド表示"
  - ko: "그리드 보기"

- `settingsAppIconDefault`: Label for the default icon option.
  - zh_TW: "預設"
  - en: "Default"
  - ja: "デフォルト"
  - ko: "기본"

- `settingsAppIconNew`: Label for the new icon option.
  - zh_TW: "新版"
  - en: "New"
  - ja: "新バージョン"
  - ko: "새 버전"

#### Scenario: Traditional Chinese ARB contains app icon keys

- **WHEN** `app_zh_TW.arb` is parsed
- **THEN** it SHALL contain key `settingsSectionAppIcon` with value `"App 圖示"`
- **AND** key `settingsAppIconSheetTitle` with value `"選擇 App 圖示"`
- **AND** key `settingsAppIconStyleScroll` with value `"以滑動檢視"`
- **AND** key `settingsAppIconStyleSheet` with value `"以網格檢視"`
- **AND** key `settingsAppIconDefault` with value `"預設"`
- **AND** key `settingsAppIconNew` with value `"新版"`

#### Scenario: English ARB contains app icon keys

- **WHEN** `app_en.arb` is parsed
- **THEN** it SHALL contain key `settingsSectionAppIcon` with value `"App Icon"`
- **AND** key `settingsAppIconSheetTitle` with value `"Choose App Icon"`
- **AND** key `settingsAppIconStyleScroll` with value `"Scroll View"`
- **AND** key `settingsAppIconStyleSheet` with value `"Grid View"`
- **AND** key `settingsAppIconDefault` with value `"Default"`
- **AND** key `settingsAppIconNew` with value `"New"`

#### Scenario: Japanese ARB contains app icon keys

- **WHEN** `app_ja.arb` is parsed
- **THEN** it SHALL contain key `settingsSectionAppIcon` with value `"アプリアイコン"`
- **AND** key `settingsAppIconSheetTitle` with value `"アプリアイコンを選択"`
- **AND** key `settingsAppIconStyleScroll` with value `"スクロール表示"`
- **AND** key `settingsAppIconStyleSheet` with value `"グリッド表示"`
- **AND** key `settingsAppIconDefault` with value `"デフォルト"`
- **AND** key `settingsAppIconNew` with value `"新バージョン"`

#### Scenario: Korean ARB contains app icon keys

- **WHEN** `app_ko.arb` is parsed
- **THEN** it SHALL contain key `settingsSectionAppIcon` with value `"앱 아이콘"`
- **AND** key `settingsAppIconSheetTitle` with value `"앱 아이콘 선택"`
- **AND** key `settingsAppIconStyleScroll` with value `"스크롤 보기"`
- **AND** key `settingsAppIconStyleSheet` with value `"그리드 보기"`
- **AND** key `settingsAppIconDefault` with value `"기본"`
- **AND** key `settingsAppIconNew` with value `"새 버전"`
