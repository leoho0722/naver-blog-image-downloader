import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:shared_preferences/shared_preferences.dart';

part 'local_storage_service.g.dart';

/// SharedPreferences 的 Riverpod provider，由 ProviderScope.overrides 注入。
///
/// [ref] 為 Riverpod 的依賴參照。
/// 回傳 [SharedPreferences] 實例；未覆寫時拋出 [UnimplementedError]。
@Riverpod(keepAlive: true)
SharedPreferences sharedPreferences(Ref ref) => throw UnimplementedError(
  'sharedPreferencesProvider must be overridden in ProviderScope',
);

/// LocalStorageService 的 Riverpod provider（App 級單例）。
///
/// [ref] 為 Riverpod 的依賴參照，用於取得 [SharedPreferences] 實例。
/// 回傳以注入的 [SharedPreferences] 建立的 [LocalStorageService] 實例。
@Riverpod(keepAlive: true)
LocalStorageService localStorageService(Ref ref) {
  return LocalStorageService(prefs: ref.watch(sharedPreferencesProvider));
}

/// 本機鍵值對儲存服務，封裝 [SharedPreferences] 提供簡潔的讀寫介面。
class LocalStorageService {
  /// 建立 [LocalStorageService]。
  ///
  /// - [prefs]：已初始化的 [SharedPreferences] 實例，作為底層鍵值對儲存。
  LocalStorageService({required SharedPreferences prefs}) : _prefs = prefs;

  /// 底層的 [SharedPreferences] 實例，實際負責鍵值對的讀寫。
  final SharedPreferences _prefs;

  /// 讀取字串值，不存在時回傳 `null`。
  ///
  /// - [key]：要讀取的鍵名。
  /// - 回傳：對應的字串值，若該鍵不存在則回傳 `null`。
  String? getString(String key) => _prefs.getString(key);

  /// 寫入字串值。
  ///
  /// - [key]：要寫入的鍵名。
  /// - [value]：要寫入的字串值。
  /// - 回傳：寫入成功時回傳 `true`，否則回傳 `false`。
  Future<bool> setString(String key, String value) =>
      _prefs.setString(key, value);

  /// 讀取布林值，不存在時回傳 `null`。
  ///
  /// - [key]：要讀取的鍵名。
  /// - 回傳：對應的布林值，若該鍵不存在則回傳 `null`。
  bool? getBool(String key) => _prefs.getBool(key);

  /// 寫入布林值。
  ///
  /// - [key]：要寫入的鍵名。
  /// - [value]：要寫入的布林值。
  /// - 回傳：寫入成功時回傳 `true`，否則回傳 `false`。
  Future<bool> setBool(String key, bool value) => _prefs.setBool(key, value);

  /// 取得所有已儲存的 key 集合。
  ///
  /// 回傳 [SharedPreferences] 中所有已存在的 key。
  Set<String> getKeys() => _prefs.getKeys();

  /// 移除指定 key 的資料。
  ///
  /// - [key]：要移除的鍵名。
  /// - 回傳：移除成功時回傳 `true`，否則回傳 `false`。
  Future<bool> remove(String key) => _prefs.remove(key);
}
