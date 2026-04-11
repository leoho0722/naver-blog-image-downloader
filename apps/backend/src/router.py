"""輕量級路由器：依 HTTP path + method 分派至對應 handler"""

from collections.abc import Callable

_routes: dict[tuple[str, str], Callable] = {}


def route(path: str, method: str = "POST"):
    """路由裝飾器：註冊 (path, method) → handler 映射

    Args:
        path (str): HTTP 路徑（如 /api/photos）
        method (str): HTTP 方法（預設 POST）

    Returns:
        裝飾器函式
    """

    def decorator(func):
        _routes[(path.rstrip("/"), method.upper())] = func
        return func

    return decorator


def dispatch(path: str, method: str, body: dict, event: dict, context) -> dict | None:
    """查找並執行匹配的 handler

    Args:
        path (str): HTTP 路徑
        method (str): HTTP 方法
        body (dict): 解析後的請求 body
        event (dict): 原始 Lambda event
        context: Lambda context

    Returns:
        handler 回傳的 API Gateway 回應 dict，找不到匹配路由則回傳 None
    """
    handler = _routes.get((path.rstrip("/"), method.upper()))
    if handler is None:
        return None
    return handler(body=body, event=event, context=context)


def extract_route_info(event: dict) -> tuple[str, str]:
    """從 API Gateway v2 (HTTP API) event 提取 HTTP path 與 method

    自動移除 rawPath 中的 stage 前綴（如 /default/api/photos → /api/photos）。

    Args:
        event (dict): Lambda event

    Returns:
        (path, method) tuple，無法辨識格式時回傳 ("", "")
    """
    if "requestContext" in event and "http" in event.get("requestContext", {}):
        rc_http = event["requestContext"]["http"]
        path = event.get("rawPath", "")
        method = rc_http.get("method", "")

        # rawPath 含 stage 前綴（如 /default/api/photos），需移除
        stage = event["requestContext"].get("stage", "")
        if stage and path.startswith(f"/{stage}/"):
            path = path[len(f"/{stage}") :]

        return path, method

    return "", ""
