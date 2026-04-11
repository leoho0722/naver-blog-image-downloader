"""圖片擷取路由：處理 /api/photos 的下載請求與狀態查詢"""

import json
import re

import boto3
from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import sync_playwright

import helper
from data_models import DownloadResult, JobStatus
from job_store import JobStore, LogStore
from response_builder import build_response
from router import route

job_store = JobStore()
log_store = LogStore()


def _dedup_urls(img_urls: list[str]) -> list[str]:
    """去重：移除重複的 URL，保留首次出現的順序

    Args:
        img_urls (list[str]): 可能含重複的圖片 URL 列表

    Returns:
        去重後的圖片 URL 列表
    """
    if not img_urls:
        return img_urls

    helper.debug_print(f"去重前共 {len(img_urls)} 筆 URL：")
    for i, url in enumerate(img_urls):
        helper.debug_print(f"  [{i + 1}] {url}")

    seen = set()
    unique_urls = []
    duplicate_urls = []
    for url in img_urls:
        if url not in seen:
            seen.add(url)
            unique_urls.append(url)
        else:
            duplicate_urls.append(url)
    if duplicate_urls:
        helper.debug_print(f"去重：從 {len(img_urls)} 筆移除 {len(duplicate_urls)} 筆重複，剩餘 {len(unique_urls)} 筆")
        for dup_url in duplicate_urls:
            helper.debug_print(f"去重移除: {dup_url}")

    helper.debug_print(f"去重後共 {len(unique_urls)} 筆 URL：")
    for i, url in enumerate(unique_urls):
        helper.debug_print(f"  [{i + 1}] {url}")

    return unique_urls


def _sort_urls_by_number(img_urls: list[str]) -> list[str]:
    """根據檔名中的數字編號（如 /1.jpg、_31.jpg）遞增排序

    Args:
        img_urls (list[str]): 圖片 URL 列表

    Returns:
        按編號排序後的圖片 URL 列表
    """
    if len(img_urls) <= 1:
        return img_urls

    try:
        url_with_numbers = []
        for url in img_urls:
            match = re.search(r"[/_](\d+)\.(jpg|jpeg|png|gif)", url, re.IGNORECASE)
            if match:
                number = int(match.group(1))
                url_with_numbers.append((number, url))
            else:
                url_with_numbers.append((float("inf"), url))

        helper.debug_print(f"提取到的編號: {[num for num, _ in url_with_numbers]}")

        all_numbers = [num for num, _ in url_with_numbers if num != float("inf")]
        is_sorted = all(all_numbers[i] <= all_numbers[i + 1] for i in range(len(all_numbers) - 1))

        if not is_sorted:
            url_with_numbers.sort(key=lambda x: x[0])
            img_urls = [url for _, url in url_with_numbers]
            helper.debug_print(f"圖片順序已修正,排序後編號: {[num for num, _ in url_with_numbers]}")
        else:
            helper.debug_print("圖片順序正確,無需調整")

    except Exception as e:
        helper.debug_print(f"順序修正時發生錯誤: {e},保持原順序")

    return img_urls


def download_images_from_naver_blog(blog_url: str) -> DownloadResult:
    """從 Naver Blog 文章擷取所有原始圖片 URL

    透過 Playwright Chromium 訪問文章頁面，直接從 img 元素的
    data-lazy-src / src 屬性提取縮圖 URL，將 type 參數替換為
    w3840 取得最高解析度原圖。去重後按檔名編號排序。

    Args:
        blog_url (str): Naver Blog 文章 URL

    Returns:
        DownloadResult 包含擷取到的圖片 URL、錯誤訊息與統計資訊
    """
    start_time = helper.get_current_time()
    errors = []
    img_urls = []

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                args=[
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-accelerated-2d-canvas",
                    "--no-first-run",
                    "--no-zygote",
                    "--single-process",  # 關鍵:在 Lambda 中使用單進程模式
                    "--disable-gpu",
                    "--disable-software-rasterizer",
                    "--disable-blink-features=AutomationControlled",
                ],
                chromium_sandbox=False,  # 關鍵:完全禁用 sandbox
            )
            context = browser.new_context(
                locale="ko-KR",
                viewport={"width": 1280, "height": 720},
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            )
            page = context.new_page()

            # 將手機版 URL 轉為桌面版，確保載入桌面版頁面結構
            if "m.blog.naver.com" in blog_url:
                blog_url = blog_url.replace("m.blog.naver.com", "blog.naver.com", 1)
                helper.debug_print(f"已將手機版 URL 轉為桌面版: {blog_url}")

            helper.debug_print(f"正在訪問: {blog_url}")
            page.goto(blog_url, wait_until="domcontentloaded", timeout=30000)
            page.wait_for_timeout(500)  # 等待頁面穩定

            # 等待 mainFrame 載入
            try:
                page.wait_for_selector("iframe#mainFrame", timeout=5000)
            except Exception:
                pass

            frame = page.frame(name="mainFrame") or page
            helper.debug_print(f"使用 frame: {'mainFrame' if page.frame(name='mainFrame') else 'page'}")

            # 等待圖片載入
            try:
                helper.debug_print("等待圖片元素載入...")
                frame.wait_for_selector("img.se-image-resource.egjs-visible", timeout=10000)
                helper.debug_print("圖片元素已載入")
            except PlaywrightTimeoutError:
                errors.append("等待圖片元素超時")
                elapsed = helper.calculate_elapsed_time(start_time)
                return DownloadResult(0, 0, 0, [], errors, elapsed)
            except Exception as e:
                error_msg = str(e)
                elapsed = helper.calculate_elapsed_time(start_time)
                if "closed" in error_msg.lower():
                    errors.append(f"瀏覽器/頁面被關閉: {error_msg}")
                    return DownloadResult(0, 0, 0, [], errors, elapsed)
                else:
                    errors.append(f"載入圖片時發生錯誤: {error_msg}")
                    return DownloadResult(0, 0, 0, [], errors, elapsed)

            # 額外等待確保所有圖片都載入
            page.wait_for_timeout(500)

            img_elements = frame.query_selector_all("img.se-image-resource.egjs-visible")
            helper.debug_print(f"找到 {len(img_elements)} 張圖片")

            if not img_elements:
                elapsed = helper.calculate_elapsed_time(start_time)
                return DownloadResult(0, 0, 0, [], ["未找到任何圖片"], elapsed)

            # === 直接從元素屬性提取原圖 URL ===
            # 優先使用 data-lazy-src（已載入的縮圖 URL），否則用 src
            # 將 type 參數替換為 w3840 取得最高解析度原圖
            for i, elem in enumerate(img_elements):
                raw_url = elem.get_attribute("data-lazy-src") or elem.get_attribute("src")
                if not raw_url or not raw_url.startswith("http"):
                    errors.append(f"第{i + 1}張圖片無法取得 URL")
                    helper.debug_print(f"第 {i + 1} 張圖片無有效 URL，跳過")
                    continue

                # 替換 type 參數為 w3840（原圖解析度）
                full_url = re.sub(r"\?type=\w+", "?type=w3840", raw_url)
                img_urls.append(full_url)
                helper.debug_print(f"第 {i + 1} 張圖片 URL: {full_url}")

            # 去重 + 排序
            img_urls = _dedup_urls(img_urls)
            img_urls = _sort_urls_by_number(img_urls)

            browser.close()

        # 根據最終序號缺漏計算實際失敗數量
        final_numbers = set()
        for url in img_urls:
            m = re.search(r"[/_](\d+)\.(jpg|jpeg|png|gif)", url, re.IGNORECASE)
            if m:
                final_numbers.add(int(m.group(1)))
        if final_numbers:
            expected_total = max(max(final_numbers), len(img_elements))
            actual_failures = len(set(range(1, expected_total + 1)) - final_numbers)
        else:
            expected_total = len(img_elements)
            actual_failures = expected_total

        elapsed = helper.calculate_elapsed_time(start_time)
        return DownloadResult(
            total_images=expected_total,
            successful_downloads=len(img_urls),
            failure_downloads=actual_failures,
            image_urls=img_urls,
            errors=errors,
            elapsed_time=elapsed,
        )

    except Exception as e:
        elapsed = helper.calculate_elapsed_time(start_time)
        return DownloadResult(0, 0, 0, [], [str(e)], elapsed)


def _handle_submit(body, context):
    """處理下載請求：建立 S3 任務 → 非同步呼叫 worker → 回傳 job_id

    Args:
        body (dict): 請求內容，需包含 blog_url
        context: Lambda context，用於取得 function_name 進行非同步自呼叫

    Returns:
        API Gateway 回應 dict（HTTP 202 含 job_id，或 400 錯誤）
    """
    blog_url = body.get("blog_url")
    if not blog_url:
        response = build_response(400, {"error": "缺少 blog_url 參數"})
        helper.debug_print(f"Response: {response}")
        return response

    job_id = job_store.create_job(blog_url)
    helper.debug_print(f"已建立任務: {job_id}，準備非同步呼叫 worker")

    # 非同步呼叫自身處理
    boto3.client("lambda").invoke(
        FunctionName=context.function_name,
        InvocationType="Event",
        Payload=json.dumps(
            {
                "_async_worker": True,
                "_worker_type": "photos",
                "job_id": job_id,
                "blog_url": blog_url,
            }
        ),
    )

    response = build_response(202, {"job_id": job_id, "status": JobStatus.PROCESSING})
    helper.debug_print(f"Response: {response}")
    return response


def _handle_status(body):
    """查詢任務狀態與結果

    Args:
        body (dict): 請求內容，需包含 job_id

    Returns:
        API Gateway 回應 dict（HTTP 200/404/500 含任務狀態）
    """
    job_id = body.get("job_id")
    if not job_id:
        response = build_response(400, {"error": "缺少 job_id 參數"})
        helper.debug_print(f"Response: {response}")
        return response

    job = job_store.get_job(job_id)
    if not job:
        response = build_response(404, {"error": "任務不存在"})
        helper.debug_print(f"Response: {response}")
        return response

    response_body = {"job_id": job_id, "status": job["status"]}
    if job.get("result"):
        response_body["result"] = job["result"]
    status_code = 500 if job["status"] == JobStatus.FAILED else 200
    response = build_response(status_code, response_body)
    helper.debug_print(f"Response: {response}")
    return response


@route("/api/photos", method="POST")
def handle_photos(body: dict, event: dict, context) -> dict:
    """路由入口：依 action 分派至 submit 或 status handler

    Args:
        body (dict): 請求 body
        event (dict): 原始 Lambda event
        context: Lambda context

    Returns:
        API Gateway 回應 dict
    """
    action = body.get("action", "download")
    if action == "download":
        return _handle_submit(body, context)
    elif action == "status":
        return _handle_status(body)
    else:
        return build_response(400, {"error": f"未知的 action: {action}"})


def handle_async_worker(event):
    """背景 worker：執行 Playwright 爬取圖片，結果與 log 寫入 S3

    由 _handle_submit 透過 Lambda 非同步呼叫觸發。
    無論成功或失敗，最終都會將 debug log 儲存至 S3。

    Args:
        event (dict): 包含 job_id 與 blog_url 的 worker 事件
    """
    job_id = event["job_id"]
    blog_url = event["blog_url"]
    helper.clear_logs()
    helper.debug_print(f"Worker 開始處理任務: {job_id}，URL: {blog_url}")

    try:
        result = download_images_from_naver_blog(blog_url)
        if result.image_urls:
            status = JobStatus.COMPLETED
        elif result.errors:
            status = JobStatus.FAILED
        else:
            status = JobStatus.COMPLETED  # 沒有圖片也沒有錯誤（例如文章本身無圖）
        job_store.update_job(job_id, status, result.to_dict())
        helper.debug_print(f"任務 {job_id} 狀態: {status}，找到 {result.successful_downloads} 張圖片")
    except Exception as e:
        helper.debug_print(f"任務 {job_id} 處理失敗: {e}")
        job_store.update_job(job_id, JobStatus.FAILED, {"error": str(e)})
    finally:
        log_store.save_logs(job_id, helper.get_logs())
