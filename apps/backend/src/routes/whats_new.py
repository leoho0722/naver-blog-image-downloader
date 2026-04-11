"""新功能介紹路由：處理 /api/whatsNew 的請求，依 App 版號從 S3 取得對應資料"""

import json

import helper
from job_store import LogStore, WhatsNewStore
from response_builder import build_response
from router import route

log_store = LogStore()
whats_new_store = WhatsNewStore()


@route("/api/whatsNew", method="POST")
def handle_whats_new(body: dict, event: dict, context) -> dict:
    """依 App 版號與語系從 S3 取得新功能介紹資料

    S3 路徑格式：<version>/<locale>/whats_new.json

    Args:
        body (dict): 請求 body，需包含 version 與 locale
        event (dict): 原始 Lambda event
        context: Lambda context

    Returns:
        API Gateway 回應 dict
    """
    helper.clear_logs()
    helper.debug_print("whatsNew 請求開始處理")

    try:
        version = body.get("version")
        locale = body.get("locale")
        if not version or not locale:
            missing = [p for p in ("version", "locale") if not body.get(p)]
            response = build_response(400, {"error": f"缺少 {', '.join(missing)} 參數"})
            _log_response(response)
            return response

        helper.debug_print(f"查詢版本 {version}（{locale}）的新功能介紹")
        data = whats_new_store.get_whats_new(version, locale)

        if data is None:
            helper.debug_print(f"版本 {version}（{locale}）的新功能介紹不存在")
            response = build_response(404, {"error": f"版本 {version}（{locale}）的新功能介紹不存在"})
            _log_response(response)
            return response

        response = build_response(200, data)
        _log_response(response)
        return response
    finally:
        log_id = f"whats_new_{version}_{locale}" if version and locale else "whats_new"
        log_store.save_logs(log_id, helper.get_logs())


def _log_response(response: dict):
    """記錄結構化 response log（statusCode + body 為獨立欄位）"""
    status_code = response.get("statusCode")
    body_str = response.get("body", "")
    try:
        body = json.loads(body_str)
    except (json.JSONDecodeError, TypeError):
        body = body_str
    helper.log_entry({"type": "response", "statusCode": status_code, "body": body})
