## Context

應用程式需要在本機持久化儲存簡單的鍵值對資料，例如使用者偏好設定、快取 metadata 等。`SharedPreferences` 提供了跨平台的輕量鍵值儲存方案。透過 `LocalStorageService` 封裝 `SharedPreferences`，可隔離儲存實作細節，便於測試與未來替換。

## Goals / Non-Goals

**Goals:**

- 實作 `LocalStorageService` 類別，封裝 SharedPreferences 的讀寫操作
- 提供 `getString`、`setString`、`remove` 等常用鍵值操作方法
- 確保服務可透過建構子注入 `SharedPreferences` 實例以便測試

**Non-Goals:**

- 不實作加密儲存
- 不實作資料遷移機制
- 不實作複雜資料結構的序列化（使用 JSON 字串儲存由呼叫端負責）

## Decisions

### LocalStorageService 類別設計

`LocalStorageService` 類別透過建構子接收 `SharedPreferences` 實例，提供以下方法：
- `getString(String key)`：讀取字串值，回傳 `String?`
- `setString(String key, String value)`：寫入字串值，回傳 `Future<bool>`
- `remove(String key)`：移除指定鍵的值，回傳 `Future<bool>`
- `getBool(String key)`：讀取布林值，回傳 `bool?`
- `setBool(String key, bool value)`：寫入布林值，回傳 `Future<bool>`

### 可注入設計

透過建構子注入 `SharedPreferences` 實例，而非在服務內部呼叫 `SharedPreferences.getInstance()`。此設計確保服務可在測試中使用 mock 物件，且避免在服務層處理非同步初始化邏輯。

## Risks / Trade-offs

- [取捨] 僅封裝 `String` 與 `bool` 型別，未涵蓋 `int`、`double`、`List<String>` → 目前需求僅用到這兩種型別，未來可按需擴充
- [取捨] 建構子注入而非靜態初始化，呼叫端需先取得 `SharedPreferences` 實例 → 由 DI 層（S030）統一處理
- [風險] `SharedPreferences` 在 Web 平台的行為可能不同 → 本專案僅支援 iOS 與 Android，無此顧慮
