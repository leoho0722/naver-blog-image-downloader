"""資料模型定義：任務狀態列舉與下載結果資料類別"""

from dataclasses import dataclass
from enum import Enum
from typing import Any


class JobStatus(str, Enum):
    """非同步任務狀態

    Attributes:
        PROCESSING: 任務處理中
        COMPLETED: 任務已完成
        FAILED: 任務失敗
    """

    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class PhotoAction(str, Enum):
    """照片 API 的操作類型

    Attributes:
        DOWNLOAD: 提交圖片擷取任務
        STATUS: 查詢擷取任務狀態
        PACKAGE: 提交圖片打包任務
        PACKAGE_STATUS: 查詢打包任務狀態
    """

    DOWNLOAD = "download"
    STATUS = "status"
    PACKAGE = "package"
    PACKAGE_STATUS = "package_status"


class PackageStatus(str, Enum):
    """圖片打包任務狀態

    Attributes:
        PROCESSING: 打包處理中
        COMPLETED: 打包已完成
        FAILED: 打包失敗
    """

    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class DownloadResult:
    """圖片下載結果

    Attributes:
        total_images: 頁面上找到的圖片總數
        successful_downloads: 成功擷取的圖片數量
        failure_downloads: 失敗的圖片數量
        image_urls: 成功擷取的圖片 URL 列表
        errors: 錯誤訊息列表
        elapsed_time: 執行耗時（秒）
    """

    total_images: int
    successful_downloads: int
    failure_downloads: int
    image_urls: list[str]
    errors: list[str]
    elapsed_time: float = 0.0

    def to_dict(self) -> dict[str, Any]:
        """轉換為 dict，elapsed_time 四捨五入至小數第二位

        Returns:
            包含所有欄位的 dict
        """
        result = {k: v for k, v in vars(self).items() if k != "elapsed_time"}
        result["elapsed_time"] = round(self.elapsed_time, 2)
        return result
