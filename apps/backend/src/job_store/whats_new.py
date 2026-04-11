"""新功能介紹 S3 儲存：依版號與語系讀取 whats_new.json"""

from .base import BaseStore


class WhatsNewStore(BaseStore):
    """依 App 版號與語系存取 S3 上的新功能介紹資料

    S3 key 格式：whatsnew/<version>/whats_new_<locale>.json
    """

    @property
    def _file_suffix(self) -> str:
        return "whats_new"

    def _build_key(self, key_id: str) -> str:
        """建構 S3 object key

        格式：whatsnew/<version>/whats_new_<locale>.json
        key_id 由呼叫端組合為 "<version>/<locale>"。

        Args:
            key_id (str): 組合識別碼（version/locale）

        Returns:
            str: S3 object key
        """
        version, locale = key_id.split("/", 1)
        return f"whatsnew/{version}/whats_new_{locale}.json"

    def get_whats_new(self, version: str, locale: str) -> dict | None:
        """讀取指定版號與語系的新功能介紹資料

        Args:
            version (str): App 版號
            locale (str): App 語系（如 zh-TW、en、ja）

        Returns:
            解析後的 JSON dict，若不存在則回傳 None
        """
        return self._get_json(f"{version}/{locale}")

    def put_whats_new(self, version: str, locale: str, data: dict) -> str:
        """寫入指定版號與語系的新功能介紹資料至 S3

        Args:
            version (str): App 版號（如 1.4.0）
            locale (str): App 語系（如 zh-TW、en、ja、ko）
            data (dict): 新功能介紹 JSON 資料

        Returns:
            str: 寫入的 S3 object key
        """
        key_id = f"{version}/{locale}"
        self._put_json(key_id, data)
        return self._build_key(key_id)

    def list_versions(self, prefix: str = "") -> list[str]:
        """列出 S3 上 whatsnew/ 前綴下的所有 key

        Args:
            prefix (str): 可選前綴過濾（如特定版號 "1.4.0"）

        Returns:
            list[str]: S3 object key 列表
        """
        resp = self._s3.list_objects_v2(
            Bucket=self._bucket,
            Prefix=f"whatsnew/{prefix}",
        )
        return [obj["Key"] for obj in resp.get("Contents", [])]
