"""S3 儲存基礎類別，定義共用常數與 CRUD 抽象介面"""

import json
import os
from abc import ABC, abstractmethod

import boto3
from botocore.exceptions import ClientError

BUCKET_NAME = os.environ.get("S3_BUCKET_NAME", "naver-blog-download-jobs")
PREFIX = "jobs/"


class BaseStore(ABC):
    """S3 儲存基礎類別，提供共用的 S3 CRUD 操作"""

    def __init__(self):
        """初始化 S3 client 與儲存設定（bucket 名稱、key 前綴）"""
        self._s3 = boto3.client("s3")
        self._bucket = BUCKET_NAME
        self._prefix = PREFIX

    @property
    @abstractmethod
    def _file_suffix(self) -> str:
        """子類別定義 S3 key 的檔案後綴（如 results、logs）

        Returns:
            str: 檔案後綴名稱
        """
        ...

    def _build_key(self, key_id: str) -> str:
        """建構 S3 object key

        預設格式：{prefix}{key_id}/{key_id}_{file_suffix}.json
        子類別可覆寫以自訂 key 格式。

        Args:
            key_id (str): 識別碼（如任務 ID、版號等）

        Returns:
            str: S3 object key
        """
        return f"{self._prefix}{key_id}/{key_id}_{self._file_suffix}.json"

    def _put_json(self, key_id: str, data: dict):
        """寫入 JSON 資料到 S3

        Args:
            key_id (str): 識別碼，用於建構 S3 key
            data (dict): 要寫入的 JSON 資料
        """
        self._s3.put_object(
            Bucket=self._bucket,
            Key=self._build_key(key_id),
            Body=json.dumps(data, ensure_ascii=False),
            ContentType="application/json",
        )

    def _get_json(self, key_id: str) -> dict | None:
        """從 S3 讀取 JSON 資料

        Args:
            key_id (str): 識別碼，用於建構 S3 key

        Returns:
            解析後的 JSON dict，若 key 不存在則回傳 None
        """
        try:
            resp = self._s3.get_object(
                Bucket=self._bucket,
                Key=self._build_key(key_id),
            )
            return json.loads(resp["Body"].read().decode("utf-8"))
        except ClientError as e:
            if e.response["Error"]["Code"] == "NoSuchKey":
                return None
            raise
