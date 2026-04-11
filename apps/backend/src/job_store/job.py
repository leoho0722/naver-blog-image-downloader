"""S3 任務狀態管理：建立、查詢、更新任務"""

import time
import uuid

from data_models import JobStatus

from .base import BaseStore


class JobStore(BaseStore):
    """S3 任務狀態管理（建立/查詢/更新 job）"""

    @property
    def _file_suffix(self) -> str:
        return "results"

    def create_job(self, blog_url: str) -> str:
        """建立新任務，將初始狀態寫入 S3

        Args:
            blog_url (str): Naver Blog 文章 URL

        Returns:
            str: 新建立的任務 ID（UUID）
        """
        job_id = str(uuid.uuid4())
        job_data = {
            "job_id": job_id,
            "status": JobStatus.PROCESSING,
            "blog_url": blog_url,
            "result": None,
            "created_at": int(time.time()),
        }
        self._put_json(job_id, job_data)
        return job_id

    def update_job(self, job_id: str, status: JobStatus, result: dict | None = None):
        """更新任務狀態與結果

        Args:
            job_id (str): 任務 ID
            status (JobStatus): 新的任務狀態
            result (dict | None): 任務執行結果，None 表示不更新結果
        """
        job = self.get_job(job_id)
        if job is None:
            return
        job["status"] = status
        job["updated_at"] = int(time.time())
        if result is not None:
            job["result"] = result
        self._put_json(job_id, job)

    def get_job(self, job_id: str) -> dict | None:
        """取得任務狀態與結果

        Args:
            job_id (str): 任務 ID

        Returns:
            任務資料 dict，若任務不存在則回傳 None
        """
        return self._get_json(job_id)
