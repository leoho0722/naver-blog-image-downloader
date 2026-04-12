"""S3 圖片打包任務管理：建立、查詢、更新打包任務，產生 pre-signed 下載連結"""

import time
import uuid

from botocore.exceptions import ClientError

from data_models import PackageStatus

from .base import BaseStore


class PackageStore(BaseStore):
    """S3 打包任務管理（建立/查詢/更新 package + pre-signed URL 產生）"""

    _PACKAGES_PREFIX = "packages/"

    @property
    def _file_suffix(self) -> str:
        return "results"

    def _build_key(self, key_id: str) -> str:
        """建構打包任務 metadata 的 S3 key

        格式：packages/{package_id}/{package_id}_results.json
        覆寫父類別預設格式，使用獨立的 packages/ 前綴。

        Args:
            key_id (str): 打包任務 ID

        Returns:
            str: S3 object key
        """
        return f"{self._PACKAGES_PREFIX}{key_id}/{key_id}_{self._file_suffix}.json"

    def _zip_key(self, package_id: str) -> str:
        """建構 ZIP 檔案的 S3 key

        格式：packages/{package_id}/images.zip

        Args:
            package_id (str): 打包任務 ID

        Returns:
            str: ZIP 檔案的 S3 object key
        """
        return f"{self._PACKAGES_PREFIX}{package_id}/images.zip"

    def _cache_index_key(self, cache_key: str) -> str:
        """建構快取索引的 S3 key

        格式：packages/cache/{cache_key}.json

        Args:
            cache_key (str): 快取鍵

        Returns:
            str: S3 object key
        """
        return f"{self._PACKAGES_PREFIX}cache/{cache_key}.json"

    def create_package(self, job_id: str, indices: list[int] | None, cache_key: str) -> str:
        """建立新打包任務，將初始狀態與快取索引寫入 S3

        Args:
            job_id (str): 原始圖片擷取任務 ID
            indices (list[int] | None): 要打包的圖片索引，None 表示全部
            cache_key (str): 快取鍵（SHA-256 前 16 字元），用於重複請求比對

        Returns:
            str: 新建立的打包任務 ID（UUID）
        """
        package_id = str(uuid.uuid4())
        package_data = {
            "package_id": package_id,
            "status": PackageStatus.PROCESSING,
            "job_id": job_id,
            "indices": indices,
            "cache_key": cache_key,
            "result": None,
            "created_at": int(time.time()),
        }
        self._put_json(package_id, package_data)

        # 寫入快取索引，供 find_by_cache_key 直接查詢
        import json

        self._s3.put_object(
            Bucket=self._bucket,
            Key=self._cache_index_key(cache_key),
            Body=json.dumps({"package_id": package_id}),
            ContentType="application/json",
        )

        return package_id

    def update_package(self, package_id: str, status: PackageStatus, result: dict | None = None):
        """更新打包任務狀態與結果

        Args:
            package_id (str): 打包任務 ID
            status (PackageStatus): 新的任務狀態
            result (dict | None): 打包結果（file_count、file_size 等），None 表示不更新
        """
        package = self.get_package(package_id)
        if package is None:
            return
        package["status"] = status
        package["updated_at"] = int(time.time())
        if result is not None:
            package["result"] = result
        self._put_json(package_id, package)

    def get_package(self, package_id: str) -> dict | None:
        """取得打包任務狀態與結果

        Args:
            package_id (str): 打包任務 ID

        Returns:
            打包任務資料 dict，若任務不存在則回傳 None
        """
        return self._get_json(package_id)

    def generate_download_url(self, package_id: str, expires_in: int = 3600) -> str:
        """產生 ZIP 檔案的 S3 pre-signed 下載連結

        Args:
            package_id (str): 打包任務 ID
            expires_in (int): 連結有效秒數，預設 3600（1 小時）

        Returns:
            str: S3 pre-signed URL
        """
        return self._s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": self._bucket, "Key": self._zip_key(package_id)},
            ExpiresIn=expires_in,
        )

    def zip_exists(self, package_id: str) -> bool:
        """檢查 ZIP 檔案是否存在於 S3

        用於判斷快取是否因 lifecycle policy 過期而被刪除。

        Args:
            package_id (str): 打包任務 ID

        Returns:
            bool: ZIP 檔案存在回傳 True，否則 False
        """
        try:
            self._s3.head_object(Bucket=self._bucket, Key=self._zip_key(package_id))
            return True
        except ClientError:
            return False

    def find_by_cache_key(self, cache_key: str) -> dict | None:
        """依 cache key 查詢已完成的打包任務

        透過快取索引（packages/cache/{cache_key}.json）直接取得 package_id，
        再讀取該打包任務的 metadata。若任務未完成或 ZIP 檔案已被 lifecycle
        policy 刪除，視為快取失效並回傳 None。

        只需 s3:GetObject 權限，不需 s3:ListBucket。

        Args:
            cache_key (str): 快取鍵

        Returns:
            匹配的打包任務 dict，若無匹配則回傳 None
        """
        import json

        try:
            resp = self._s3.get_object(
                Bucket=self._bucket,
                Key=self._cache_index_key(cache_key),
            )
            index = json.loads(resp["Body"].read().decode("utf-8"))
        except ClientError:
            return None

        package_id = index.get("package_id")
        if not package_id:
            return None

        data = self.get_package(package_id)
        if not data:
            return None

        if data.get("status") != PackageStatus.COMPLETED:
            return None

        if not self.zip_exists(package_id):
            return None

        return data

    def upload_zip(self, package_id: str, file_path: str):
        """上傳 ZIP 檔案至 S3

        Args:
            package_id (str): 打包任務 ID
            file_path (str): 本地 ZIP 檔案路徑
        """
        self._s3.upload_file(file_path, self._bucket, self._zip_key(package_id))
