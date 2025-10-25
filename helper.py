import os
import time


def is_debug_mode() -> bool:
    """判斷是否為 Debug 模式

    Returns:
        bool: 是否為 Debug 模式
    """

    return bool(os.environ.get("DEBUG_MODE"))


def debug_print(message: str):
    """在 Debug 模式下輸出訊息

    Args:
        message (str): 要輸出的訊息
    """

    if is_debug_mode():
        print(f"[DEBUG] {message}")


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
