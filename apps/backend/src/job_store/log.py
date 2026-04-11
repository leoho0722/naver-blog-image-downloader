"""S3 debug log 儲存管理"""

from .base import BaseStore


class LogStore(BaseStore):
    """S3 debug log 管理"""

    @property
    def _file_suffix(self) -> str:
        return "logs"

    def save_logs(self, job_id: str, logs: list[dict]):
        """將 debug log 儲存至 S3

        Args:
            job_id (str): 任務 ID
            logs (list[dict]): debug log 列表，每筆包含 timestamp 與 message
        """
        self._put_json(job_id, {"job_id": job_id, "logs": logs})
