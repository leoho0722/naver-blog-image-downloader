import 'photo_download_response.dart';

/// 非同步任務的狀態列舉。
enum JobStatus {
  /// 任務正在處理中。
  processing,

  /// 任務已完成。
  completed,

  /// 任務執行失敗。
  failed;

  /// 從 API 回傳的字串解析為 [JobStatus]。
  ///
  /// - [value]：API 回傳的狀態字串（`processing`、`completed`、`failed`）。
  ///
  /// 回傳對應的 [JobStatus] 列舉值。
  /// 若 [value] 不在已知範圍內，拋出 [FormatException]。
  static JobStatus fromString(String value) => switch (value) {
    'processing' => JobStatus.processing,
    'completed' => JobStatus.completed,
    'failed' => JobStatus.failed,
    _ => throw FormatException('未知的任務狀態：$value'),
  };
}

/// 非同步任務狀態查詢的回應 DTO。
///
/// 對應 API 回傳的 JSON 結構，包含任務 ID、狀態與結果。
/// `completed` 和 `failed` 兩種狀態都會攜帶 [result]（相同的 [PhotoDownloadResponse] 結構），
/// 失敗時的錯誤訊息在 `result.errors` 中。
class JobStatusResponse {
  /// 建立 [JobStatusResponse] 實例。
  ///
  /// - [jobId]：任務識別碼。
  /// - [status]：目前的任務狀態。
  /// - [result]：任務結果，僅在 `completed` 或 `failed` 時有值。
  const JobStatusResponse({
    required this.jobId,
    required this.status,
    this.result,
  });

  /// 任務識別碼。
  final String jobId;

  /// 目前的任務狀態。
  final JobStatus status;

  /// 任務結果（[JobStatus.completed] 和 [JobStatus.failed] 時有值）。
  ///
  /// 失敗時 `result.errors` 包含錯誤訊息。
  final PhotoDownloadResponse? result;

  /// 從 JSON 格式的 [Map] 反序列化為 [JobStatusResponse] 實例。
  ///
  /// - [json]：API 回傳的 JSON [Map]，須包含 `job_id` 與 `status` 欄位。
  ///
  /// 回傳對應的 [JobStatusResponse] 實例。
  factory JobStatusResponse.fromJson(Map<String, dynamic> json) {
    final status = JobStatus.fromString(json['status'] as String);
    PhotoDownloadResponse? result;

    if (json['result'] != null) {
      result = PhotoDownloadResponse.fromJson(
        json['result'] as Map<String, dynamic>,
      );
    }

    return JobStatusResponse(
      jobId: json['job_id'] as String,
      status: status,
      result: result,
    );
  }
}
