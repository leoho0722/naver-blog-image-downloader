## 1. LocalStorageService class with injectable SharedPreferences（LocalStorageService 類別設計）

- [x] 1.1 在 `lib/data/services/local_storage_service.dart` 中實作 LocalStorageService class with injectable SharedPreferences：定義 `LocalStorageService` 類別，建構子接受 `SharedPreferences` 參數
- [x] 1.2 將注入的 `SharedPreferences` 儲存為 `_prefs` 私有 final 欄位

## 2. getString and setString operations（可注入設計）

- [x] 2.1 實作 getString and setString operations：定義 `String? getString(String key)` 方法，呼叫 `_prefs.getString(key)`
- [x] 2.2 定義 `Future<bool> setString(String key, String value)` 方法，呼叫 `_prefs.setString(key, value)`

## 3. getBool and setBool operations（LocalStorageService 類別設計）

- [x] 3.1 實作 getBool and setBool operations：定義 `bool? getBool(String key)` 方法，呼叫 `_prefs.getBool(key)`
- [x] 3.2 定義 `Future<bool> setBool(String key, bool value)` 方法，呼叫 `_prefs.setBool(key, value)`

## 4. remove operation（LocalStorageService 類別設計）

- [x] 4.1 實作 remove operation：定義 `Future<bool> remove(String key)` 方法，呼叫 `_prefs.remove(key)`
