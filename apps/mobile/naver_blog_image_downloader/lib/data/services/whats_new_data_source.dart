import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../config/whats_new_registry.dart';
import '../models/dtos/whats_new_response.dart';
import '../models/whats_new_item.dart';
import 'api_service.dart';

part 'whats_new_data_source.g.dart';

/// 「版本新功能」與「首次安裝引導」的資料來源抽象介面。
///
/// ViewModel 透過此介面取得內容，不直接存取 registry 常數。
abstract class WhatsNewDataSource {
  /// 取得首次安裝引導的內容。
  ///
  /// [version] 為當前 App 版本號。
  /// [locale] 為使用者語系（如 `"zh-TW"`、`"en"`）。
  /// 回傳 [WhatsNewEntry]，無內容時回傳 `null`。
  Future<WhatsNewEntry?> getOnboardingEntry({
    required String version,
    required String locale,
  });

  /// 取得指定版本的新功能內容。
  ///
  /// [version] 為目標版本號。
  /// [locale] 為使用者語系。
  /// 回傳 [WhatsNewEntry]，無內容時回傳 `null`。
  Future<WhatsNewEntry?> getWhatsNewEntry({
    required String version,
    required String locale,
  });
}

/// [WhatsNewDataSource] 的 Riverpod provider（App 級單例）。
///
/// [ref] 為 Riverpod 的依賴參照。
/// 回傳注入 [ApiService] 的 [WhatsNewDataSourceImpl] 實例。
@Riverpod(keepAlive: true)
WhatsNewDataSource whatsNewDataSource(Ref ref) {
  return WhatsNewDataSourceImpl(apiService: ref.watch(apiServiceProvider));
}

/// [WhatsNewDataSource] 的實作。
///
/// 主要透過後端 API（`POST /api/whatsNew`）取得內容，
/// API 失敗時 fallback 至本地 registry 常數（繁體中文）。
/// 以 `version+locale` 為 cache key，避免重複請求。
class WhatsNewDataSourceImpl implements WhatsNewDataSource {
  /// 建立 [WhatsNewDataSourceImpl]。
  ///
  /// [apiService] 為 API 呼叫服務。
  WhatsNewDataSourceImpl({required ApiService apiService})
    : _apiService = apiService;

  /// API 呼叫服務。
  final ApiService _apiService;

  /// 快取的 API response。
  WhatsNewResponse? _cachedResponse;

  /// 快取的 cache key（`version:locale`）。
  String? _cacheKey;

  /// 從 API 取得或從快取讀取 response。
  ///
  /// [version] 為 App 版本號。
  /// [locale] 為使用者語系。
  ///
  /// API 失敗時回傳 `null`。
  Future<WhatsNewResponse?> _fetchOrCache(String version, String locale) async {
    final key = '$version:$locale';
    if (_cacheKey == key && _cachedResponse != null) {
      return _cachedResponse;
    }

    try {
      final json = await _apiService.fetchWhatsNew(
        version: version,
        locale: locale,
      );
      _cachedResponse = WhatsNewResponse.fromJson(json);
      _cacheKey = key;
      return _cachedResponse;
    } catch (_) {
      // API 失敗或 JSON 解析錯誤（含 TypeError / CastError）皆 fallback 至本地
      return null;
    }
  }

  /// 將 [WhatsNewItemDto] 列表轉換為 [WhatsNewEntry]。
  ///
  /// [dtos] 為 DTO 列表。
  /// 列表為空時回傳 `null`。
  ///
  /// 回傳 [WhatsNewEntry]。
  WhatsNewEntry? _toEntry(List<WhatsNewItemDto> dtos) {
    if (dtos.isEmpty) return null;
    final items = dtos.map((dto) {
      // base64Image 為 null 或空字串時降級為 TextItem，避免無效圖片
      if (dto.type == 'image' &&
          dto.base64Image != null &&
          dto.base64Image!.isNotEmpty) {
        return WhatsNewImageItem(
          base64Image: dto.base64Image!,
          title: dto.title,
          description: dto.description,
        );
      }
      return WhatsNewTextItem(
        icon: dto.icon ?? 'info_outline',
        title: dto.title,
        description: dto.description,
      );
    }).toList();
    return WhatsNewEntry(items: items);
  }

  @override
  Future<WhatsNewEntry?> getOnboardingEntry({
    required String version,
    required String locale,
  }) async {
    final response = await _fetchOrCache(version, locale);
    if (response != null) {
      return _toEntry(response.onboarding);
    }
    // API 失敗：fallback 至本地 registry
    return onboardingEntry;
  }

  @override
  Future<WhatsNewEntry?> getWhatsNewEntry({
    required String version,
    required String locale,
  }) async {
    final response = await _fetchOrCache(version, locale);
    if (response != null) {
      return _toEntry(response.whatsNew);
    }
    // API 失敗：fallback 至本地 registry
    return whatsNewRegistry[version];
  }
}
