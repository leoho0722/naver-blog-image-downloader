/// API Gateway 部署階段。
///
/// 透過 `--dart-define=API_STAGE=<value>` 在編譯時指定，
/// 例如：`flutter run --dart-define=API_STAGE=uat`。
enum ApiStage {
  /// 預設階段。
  defaultStage('default'),

  /// 單元測試階段。
  ut('ut'),

  /// 預備環境階段。
  stg('stg'),

  /// 使用者驗收測試階段。
  uat('uat'),

  /// 正式環境階段。
  prod('prod');

  /// 建立 [ApiStage]，[value] 為 API Gateway URL 中使用的階段名稱。
  const ApiStage(this.value);

  /// 對應 API Gateway URL 路徑中的階段名稱。
  final String value;
}

/// 應用程式環境配置。
///
/// 以 static 集中管理 API base URL 與部署階段等配置值。
/// 部署階段由編譯參數 `API_STAGE` 決定，未指定時預設為 `default`。
///
/// ```bash
/// # 開發時使用預設階段
/// flutter run
///
/// # 指定 UAT 階段
/// flutter run --dart-define=API_STAGE=uat
///
/// # 正式發佈
/// flutter build apk --dart-define=API_STAGE=prod
/// ```
abstract final class AppConfig {
  /// API Gateway 根路徑（不含部署階段）。
  static const String _apiHost =
      'https://5dsrqoxfni.execute-api.ap-northeast-1.amazonaws.com';

  /// 從編譯參數 `API_STAGE` 讀取的階段名稱，未指定時為 `default`。
  static const String _stageName = String.fromEnvironment(
    'API_STAGE',
    defaultValue: 'default',
  );

  /// 目前使用的部署階段，由 `--dart-define=API_STAGE` 決定。
  ///
  /// 回傳與編譯參數 `API_STAGE` 匹配的 [ApiStage]，
  /// 若無匹配則回傳 [ApiStage.defaultStage]。
  static final ApiStage stage = ApiStage.values.firstWhere(
    (s) => s.value == _stageName,
    orElse: () => ApiStage.defaultStage,
  );

  /// 完整的 API base URL（根路徑 + 部署階段）。
  ///
  /// 回傳格式為 `https://<host>/<stage>` 的完整 URL 字串。
  static String get baseUrl => '$_apiHost/${stage.value}';
}
