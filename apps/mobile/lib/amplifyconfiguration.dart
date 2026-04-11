import 'config/app_config.dart';

/// 產生 Amplify 配置 JSON，endpoint 包含目前的部署階段。
///
/// 此配置通常由 Amplify CLI 自動產生，
/// 但因本專案僅使用 REST API 功能，故以手動方式定義。
/// 部署階段由 [AppConfig.stage] 決定（可透過 `--dart-define=API_STAGE` 切換）。
///
/// 回傳包含 REST API endpoint、region 與授權類型的 JSON 字串。
String get amplifyConfig =>
    '''{
  "api": {
    "plugins": {
      "awsAPIPlugin": {
        "naverBlogApi": {
          "endpointType": "REST",
          "endpoint": "https://5dsrqoxfni.execute-api.ap-northeast-1.amazonaws.com/${AppConfig.stage.value}",
          "region": "ap-northeast-1",
          "authorizationType": "NONE"
        }
      }
    }
  }
}''';
