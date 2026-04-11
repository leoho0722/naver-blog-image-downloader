import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'file_download_service.g.dart';

/// FileDownloadService 的 Riverpod provider（App 級單例）。
///
/// [ref] 為 Riverpod 的依賴參照。
/// 回傳以預設 [Dio] 實例建立的 [FileDownloadService]。
@Riverpod(keepAlive: true)
FileDownloadService fileDownloadService(Ref ref) => FileDownloadService(Dio());

/// 檔案下載服務，使用 [Dio] 將遠端檔案下載至本機路徑，內建指數退避重試機制。
class FileDownloadService {
  /// 建立 [FileDownloadService]。
  ///
  /// [dio] 為負責執行 HTTP 請求的 [Dio] 實例。
  FileDownloadService(Dio dio) : _dio = dio;

  /// HTTP 客戶端，負責執行實際的檔案下載請求。
  final Dio _dio;

  /// 最大重試次數（不含首次嘗試）。
  static const _maxRetries = 3;

  /// 下載指定 [url] 的檔案並儲存至 [savePath]。
  ///
  /// - [url]：遠端檔案的下載網址。
  /// - [savePath]：本機儲存路徑。
  ///
  /// 失敗時以指數退避策略重試最多 [_maxRetries] 次。
  /// 回傳成功儲存後的 [savePath]。
  /// 全部重試耗盡後拋出最後一次的 [DioException]。
  Future<String> downloadFile(String url, String savePath) async {
    DioException? lastError;

    for (var attempt = 0; attempt <= _maxRetries; attempt++) {
      if (attempt > 0) {
        await Future.delayed(Duration(seconds: 1 << (attempt - 1)));
      }

      try {
        await _dio.download(
          url,
          savePath,
          options: Options(receiveTimeout: const Duration(seconds: 30)),
        );

        return savePath;
      } on DioException catch (e) {
        lastError = e;
        continue;
      }
    }

    throw lastError!;
  }
}
