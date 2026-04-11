"""Lambda 入口點：路由分派至各路由模組"""

import json

import helper
import routes  # noqa: F401 — 匯入路由模組，觸發 @route 裝飾器註冊
from response_builder import build_response
from router import dispatch, extract_route_info


def _parse_request_body(event) -> dict:
    """解析 API Gateway 或 Lambda 直接呼叫的 event，回傳 body dict

    支援三種輸入格式：JSON 字串、含 body 欄位的 API Gateway event、純 dict。

    Args:
        event: Lambda event，可能是 str、dict 或含 body 的 API Gateway 格式

    Returns:
        解析後的請求 body dict
    """
    if isinstance(event, str):
        event = json.loads(event or "{}")

    if not isinstance(event, dict):
        return {}

    helper.debug_print(f"Raw Event: {event}")

    if "body" in event:
        body = event["body"]
        if isinstance(body, str):
            body = json.loads(body or "{}")
        elif not isinstance(body, dict):
            body = {}
        helper.debug_print(f"Parsed Request Body: {body}")
        return body

    return event


def lambda_handler(event, context):
    """Lambda 入口點：根據 HTTP path 路由至對應 handler

    路由優先順序：
    1. 非同步 worker 模式（_async_worker 標記）
    2. Path-based routing（API Gateway v2 rawPath）

    Args:
        event: Lambda event（API Gateway 請求或非同步 worker 呼叫）
        context: Lambda context
    """
    helper.debug_print(f"Event: {event}")

    # 1. 非同步 worker 模式（被自己 async invoke）
    if isinstance(event, dict) and "_async_worker" in event:
        worker_type = event.get("_worker_type", "photos")
        if worker_type == "photos":
            from routes.photos import handle_async_worker

            handle_async_worker(event)
        return

    # 2. Path-based routing（API Gateway v2）
    path, method = extract_route_info(event)
    body = _parse_request_body(event)

    result = dispatch(path, method, body, event, context)
    if result is None:
        return build_response(404, {"error": f"未知的路徑: {path}"})
    return result
