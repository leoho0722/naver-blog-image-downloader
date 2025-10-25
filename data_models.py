from dataclasses import dataclass
from typing import Any


@dataclass
class FetchResult:
    """圖片擷取結果的資料模型"""

    total_images: int
    """總圖片數量"""

    successful_fetches: int
    """成功擷取的圖片數量"""

    failure_fetches: int
    """失敗擷取的圖片數量"""

    image_urls: list[str]
    """擷取成功的圖片網址列表"""

    errors: list[str]
    """擷取過程中的錯誤訊息列表"""

    elapsed_time: float = 0.0
    """擷取所花費的時間（秒）"""

    def to_dict(self) -> dict[str, Any]:
        """將 `FetchResult` dataclass 轉換為 `Dict[str, Any]` 物件

        Returns:
            - Dict[str, Any]: 轉換後的字典物件
        """

        result = {k: v for k, v in vars(self).items() if k != "elapsed_time"}
        result["elapsed_time"] = round(self.elapsed_time, 2)
        return result


@dataclass
class DownloadResult:
    """圖片下載結果的資料模型"""

    total_images: int
    """總圖片數量"""

    successful_downloads: int
    """成功下載的圖片數量"""

    failure_downloads: int
    """失敗下載的圖片數量"""

    image_urls: list[str]
    """下載成功的圖片網址列表"""

    errors: list[str]
    """下載過程中的錯誤訊息列表"""

    elapsed_time: float = 0.0
    """下載所花費的時間（秒）"""

    def to_dict(self) -> dict[str, Any]:
        """將 `DownloadResult` dataclass 轉換為 `Dict[str, Any]` 物件

        Returns:
            - Dict[str, Any]: 轉換後的字典物件
        """

        result = {k: v for k, v in vars(self).items() if k != "elapsed_time"}
        result["elapsed_time"] = round(self.elapsed_time, 2)
        return result
