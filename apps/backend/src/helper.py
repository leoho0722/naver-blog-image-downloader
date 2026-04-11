"""工具函式：debug 輸出、log 收集、時間計算"""

import os
import time

_logs: list[dict] = []


def is_debug_mode() -> bool:
    """判斷是否為 Debug 模式

    Returns:
        bool: 是否為 Debug 模式
    """

    return bool(os.environ.get("DEBUG_MODE"))


def debug_print(message: str):
    """輸出 debug 訊息並收集到 log list（不受 DEBUG_MODE 控制）

    Args:
        message (str): 要輸出的訊息
    """

    _logs.append({"timestamp": time.time(), "message": message})
    if is_debug_mode():
        print(f"[DEBUG] {message}")


def log_entry(data: dict):
    """記錄結構化 log entry（非純文字訊息），附加 timestamp 後直接存入 log list

    Args:
        data (dict): 結構化資料（如 response statusCode + body）
    """
    entry = {"timestamp": time.time(), **data}
    _logs.append(entry)
    if is_debug_mode():
        print(f"[DEBUG] {entry}")


def get_logs() -> list[dict]:
    """取得收集的 log list

    Returns:
        包含 timestamp 與 message 的 dict 列表（副本）
    """
    return list(_logs)


def clear_logs():
    """清空收集的 log list，通常在新任務開始前呼叫"""
    _logs.clear()


def get_current_time() -> float:
    """獲取當前時間戳

    Returns:
        float: 當前時間戳
    """

    return time.time()


def calculate_elapsed_time(start_time: float) -> float:
    """計算經過的時間

    Args:
        start_time (float): 開始時間戳

    Returns:
        float: 經過的時間（秒）
    """

    return time.time() - start_time
