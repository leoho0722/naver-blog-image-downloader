"""圖片擷取路由：處理 /api/photos 的下載請求、狀態查詢與圖片打包"""

import asyncio
import hashlib
import json
import os
import re
import tempfile
import zipfile
from urllib.parse import unquote

import boto3
from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import sync_playwright

import helper
from data_models import DownloadResult, JobStatus, PackageStatus, PhotoAction
from job_store import JobStore, LogStore, PackageStore
from response_builder import build_response
from router import route

job_store = JobStore()
log_store = LogStore()
package_store = PackageStore()


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
    raw_action = body.get("action", PhotoAction.DOWNLOAD)
    try:
        action = PhotoAction(raw_action)
    except ValueError:
        return build_response(400, {"error": f"未知的 action: {raw_action}"})

    match action:
        case PhotoAction.DOWNLOAD:
            return _handle_submit(body, context)
        case PhotoAction.STATUS:
            return _handle_status(body)
        case PhotoAction.PACKAGE:
            return _handle_package(body, context)
        case PhotoAction.PACKAGE_STATUS:
            return _handle_package_status(body)


def _compute_cache_key(job_id: str, indices: list[int] | None) -> str:
    """計算打包快取鍵

    以 job_id 與排序後的 indices 組成字串，取 SHA-256 前 16 字元。
    indices 為 None 時使用 "all" 表示全部圖片。

    Args:
        job_id (str): 原始任務 ID
        indices (list[int] | None): 圖片索引列表

    Returns:
        str: 快取鍵（SHA-256 前 16 字元）
    """
    indices_part = "all" if indices is None else ",".join(str(i) for i in sorted(indices))
    raw = f"{job_id}:{indices_part}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


def _handle_package(body, context):
    """處理打包請求：檢查快取 → 建立 S3 任務 → 非同步呼叫 worker → 回傳 package_id

    若相同 job_id + indices 已有未過期的已完成打包，直接回傳快取結果。

    Args:
        body (dict): 請求內容，需包含 job_id，可選 indices
        context: Lambda context

    Returns:
        API Gateway 回應 dict（HTTP 200 快取命中 / HTTP 202 新任務 / 400/404 錯誤）
    """
    job_id = body.get("job_id")
    if not job_id:
        return build_response(400, {"error": "缺少 job_id 參數"})

    job = job_store.get_job(job_id)
    if not job:
        return build_response(404, {"error": "任務不存在"})

    indices = body.get("indices")
    cache_key = _compute_cache_key(job_id, indices)

    # 檢查快取
    cached = package_store.find_by_cache_key(cache_key)
    if cached:
        pid = cached["package_id"]
        download_url = package_store.generate_download_url(pid)
        result = cached.get("result", {})
        response = build_response(
            200,
            {
                "package_id": pid,
                "status": PackageStatus.COMPLETED,
                "download_url": download_url,
                "file_count": result.get("file_count", 0),
                "file_size": result.get("file_size", 0),
            },
        )
        helper.debug_print(f"打包快取命中: {pid}")
        return response

    package_id = package_store.create_package(job_id, indices, cache_key)
    helper.debug_print(f"已建立打包任務: {package_id}，準備非同步呼叫 worker")

    boto3.client("lambda").invoke(
        FunctionName=context.function_name,
        InvocationType="Event",
        Payload=json.dumps(
            {
                "_async_worker": True,
                "_worker_type": "package",
                "package_id": package_id,
                "job_id": job_id,
                "indices": indices,
            }
        ),
    )

    return build_response(202, {"package_id": package_id, "status": PackageStatus.PROCESSING})


def _handle_package_status(body):
    """查詢打包任務狀態與結果

    Args:
        body (dict): 請求內容，需包含 package_id

    Returns:
        API Gateway 回應 dict（HTTP 200/404/500 含打包狀態）
    """
    package_id = body.get("package_id")
    if not package_id:
        return build_response(400, {"error": "缺少 package_id 參數"})

    package = package_store.get_package(package_id)
    if not package:
        return build_response(404, {"error": "打包任務不存在"})

    response_body = {"package_id": package_id, "status": package["status"]}

    if package["status"] == PackageStatus.COMPLETED:
        download_url = package_store.generate_download_url(package_id)
        result = package.get("result", {})
        response_body["download_url"] = download_url
        response_body["file_count"] = result.get("file_count", 0)
        response_body["file_size"] = result.get("file_size", 0)
        return build_response(200, response_body)

    if package["status"] == PackageStatus.FAILED:
        response_body["error"] = package.get("result", {}).get("error", "打包失敗")
        return build_response(500, response_body)

    return build_response(200, response_body)


async def _download_images_async(image_urls: list[str], tmp_dir: str) -> list[tuple[str, str]]:
    """以 httpx AsyncClient 併發下載圖片至暫存目錄

    Args:
        image_urls (list[str]): 圖片 URL 列表
        tmp_dir (str): 暫存目錄路徑

    Returns:
        成功下載的 (檔名, 檔案路徑) 列表
    """
    import httpx

    downloaded = []
    max_concurrency = 8

    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        for batch_start in range(0, len(image_urls), max_concurrency):
            batch = image_urls[batch_start : batch_start + max_concurrency]
            tasks = []
            for i, url in enumerate(batch):
                idx = batch_start + i
                # 從 URL path 提取原始檔名（去掉 query string，解碼 percent-encoding）
                url_path = url.split("?")[0]
                original_name = unquote(url_path.rsplit("/", 1)[-1])
                if not original_name or "." not in original_name:
                    ext = re.search(r"\.(jpg|jpeg|png|gif)", url, re.IGNORECASE)
                    original_name = f"{idx + 1}{ext.group(0) if ext else '.jpg'}"
                filename = original_name
                filepath = os.path.join(tmp_dir, filename)
                tasks.append(_download_one(client, url, filepath, filename))
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for result in results:
                if isinstance(result, tuple):
                    downloaded.append(result)
                else:
                    helper.debug_print(f"下載失敗: {result}")
    return downloaded


async def _download_one(client, url: str, filepath: str, filename: str) -> tuple[str, str]:
    """下載單張圖片

    Args:
        client: httpx.AsyncClient 實例
        url (str): 圖片 URL
        filepath (str): 本地儲存路徑
        filename (str): 檔名

    Returns:
        (檔名, 檔案路徑) tuple

    Raises:
        Exception: 下載失敗時拋出
    """
    resp = await client.get(url)
    resp.raise_for_status()
    with open(filepath, "wb") as f:
        f.write(resp.content)
    return filename, filepath


def handle_package_worker(event):
    """背景 worker：下載圖片、打包為 ZIP、上傳至 S3

    由 _handle_package 透過 Lambda 非同步呼叫觸發。

    Args:
        event (dict): 包含 package_id、job_id、indices 的 worker 事件
    """
    package_id = event["package_id"]
    job_id = event["job_id"]
    indices = event.get("indices")
    helper.clear_logs()
    helper.debug_print(f"打包 Worker 開始: {package_id}，job: {job_id}，indices: {indices}")

    try:
        job = job_store.get_job(job_id)
        if not job or not job.get("result"):
            package_store.update_package(package_id, PackageStatus.FAILED, {"error": "原始任務不存在或無結果"})
            return

        image_urls = job["result"].get("image_urls", [])
        if indices is not None:
            image_urls = [image_urls[i] for i in indices if i < len(image_urls)]

        if not image_urls:
            package_store.update_package(package_id, PackageStatus.FAILED, {"error": "沒有可打包的圖片"})
            return

        with tempfile.TemporaryDirectory(prefix="pkg_") as tmp_dir:
            downloaded = asyncio.run(_download_images_async(image_urls, tmp_dir))

            if not downloaded:
                package_store.update_package(package_id, PackageStatus.FAILED, {"error": "所有圖片下載失敗"})
                return

            zip_path = os.path.join(tmp_dir, "images.zip")
            with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
                for filename, filepath in downloaded:
                    zf.write(filepath, filename)

            file_size = os.path.getsize(zip_path)
            package_store.upload_zip(package_id, zip_path)

        download_url = package_store.generate_download_url(package_id)
        package_store.update_package(
            package_id,
            PackageStatus.COMPLETED,
            {
                "file_count": len(downloaded),
                "file_size": file_size,
                "download_url": download_url,
            },
        )
        helper.debug_print(f"打包完成: {package_id}，{len(downloaded)} 張圖片，{file_size} bytes")

    except Exception as e:
        helper.debug_print(f"打包失敗: {package_id}，錯誤: {e}")
        package_store.update_package(package_id, PackageStatus.FAILED, {"error": str(e)})
    finally:
        log_store.save_logs(package_id, helper.get_logs())


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
