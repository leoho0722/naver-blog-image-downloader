"""HTTP 回應格式建構，統一包含 CORS headers 與 JSON body"""

import json
from typing import Any

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def build_response(status_code: int, body: dict[str, Any]) -> dict[str, Any]:
    """建構 API Gateway 回應格式

    Args:
        status_code (int): HTTP 狀態碼
        body (dict[str, Any]): 回應內容，會被序列化為 JSON 字串

    Returns:
        包含 statusCode、headers（含 CORS）、body 的 dict
    """
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body, ensure_ascii=False),
    }


def build_cors_preflight() -> dict[str, Any]:
    """建構 CORS preflight（OPTIONS）回應

    Returns:
        HTTP 204 空 body 回應，含完整 CORS headers
    """
    return {
        "statusCode": 204,
        "headers": CORS_HEADERS,
        "body": "",
    }
