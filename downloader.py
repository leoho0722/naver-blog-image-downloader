import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import requests
from dotenv import load_dotenv
from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import sync_playwright

import helper
from data_models import DownloadResult, FetchResult


load_dotenv()  # 從 .env 檔案載入環境變數


def fetch_naver_blog_images(blog_url: str) -> FetchResult:
    """根據給定的 Naver Blog URL 擷取圖片

    Args:
        blog_url (str): Naver Blog URL

    Returns:
        FetchResult: 擷取結果
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
                user_agent=(
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/120.0.0.0 Safari/537.36"
                ),
            )
            page = context.new_page()

            helper.debug_print(f"正在訪問: {blog_url}")
            page.goto(blog_url, wait_until="domcontentloaded", timeout=30000)
            page.wait_for_timeout(500)  # 等待頁面穩定

            # 若是手機版則切換到電腦版
            if "m.blog.naver.com" in page.url:
                try:
                    pc_btn = page.locator("a#goToBase")
                    if pc_btn.is_visible():
                        pc_btn.click()
                        page.wait_for_load_state("domcontentloaded", timeout=10000)
                        page.wait_for_timeout(500)
                except Exception as e:
                    helper.debug_print(f"切換到電腦版時發生錯誤: {e}")

            # 等待 mainFrame 載入
            try:
                page.wait_for_selector("iframe#mainFrame", timeout=5000)
            except Exception:
                pass

            frame = page.frame(name="mainFrame") or page
            helper.debug_print(
                f"使用 frame: {'mainFrame' if page.frame(name='mainFrame') else 'page'}"
            )

            # 等待圖片載入
            try:
                helper.debug_print("等待圖片元素載入...")
                frame.wait_for_selector(
                    "img.se-image-resource.egjs-visible", timeout=10000
                )
                helper.debug_print("圖片元素已載入")
            except PlaywrightTimeoutError:
                errors.append("等待圖片元素超時")
                elapsed = helper.calculate_elapsed_time(start_time)
                return FetchResult(0, 0, 1, [], errors, elapsed)
            except Exception as e:
                error_msg = str(e)
                elapsed = helper.calculate_elapsed_time(start_time)
                if "closed" in error_msg.lower():
                    errors.append(f"瀏覽器/頁面被關閉: {error_msg}")
                    return FetchResult(0, 0, 1, [], errors, elapsed)
                else:
                    errors.append(f"載入圖片時發生錯誤: {error_msg}")
                    return FetchResult(0, 0, 1, [], errors, elapsed)

            # 額外等待確保所有圖片都載入
            page.wait_for_timeout(500)

            img_elements = frame.query_selector_all(
                "img.se-image-resource.egjs-visible"
            )
            helper.debug_print(f"找到 {len(img_elements)} 張圖片")

            if not img_elements:
                elapsed = helper.calculate_elapsed_time(start_time)
                return FetchResult(0, 0, 0, [], ["未找到任何圖片"], elapsed)

            for idx, img_element in enumerate(img_elements):
                try:
                    helper.debug_print(f"處理第 {idx + 1}/{len(img_elements)} 張圖片")

                    # 檢查元素是否還存在
                    if not img_element.is_visible():
                        errors.append(f"第{idx + 1}張圖片不可見")
                        continue

                    # 點擊圖片
                    img_element.click()
                    page.wait_for_timeout(300)

                    # 等待彈窗出現
                    popup_img = None
                    for attempt in range(8):
                        popup_img_el = frame.query_selector(
                            "div.cpv__img_wrap img.cpv__img"
                        )
                        if popup_img_el:
                            popup_img = popup_img_el
                            helper.debug_print(f"第 {idx + 1} 張圖片彈窗已出現")
                            break
                        page.wait_for_timeout(200)

                    if not popup_img:
                        errors.append(f"第{idx + 1}張圖片未找到彈窗原圖")
                        # 嘗試關閉可能存在的彈窗
                        try:
                            page.keyboard.press("Escape")
                            page.wait_for_timeout(200)
                        except Exception:
                            pass
                        continue

                    img_url = popup_img.get_attribute("src")
                    if not img_url or not img_url.startswith("http"):
                        errors.append(f"第{idx + 1}張圖片無效連結: {img_url}")
                        page.keyboard.press("Escape")
                        page.wait_for_timeout(200)
                        continue

                    img_urls.append(img_url)
                    helper.debug_print(f"第 {idx + 1} 張圖片 URL: {img_url[:80]}...")

                    # 關閉彈窗
                    page.keyboard.press("Escape")
                    page.wait_for_timeout(200)

                except Exception as e:
                    error_msg = str(e)
                    if "closed" in error_msg.lower():
                        errors.append(f"第{idx + 1}張圖片處理時瀏覽器被關閉")
                        break  # 停止處理剩餘圖片
                    else:
                        errors.append(f"第{idx + 1}張圖片錯誤: {error_msg}")

                    # 嘗試關閉可能存在的彈窗
                    try:
                        page.keyboard.press("Escape")
                        page.wait_for_timeout(200)
                    except Exception:
                        pass
                    continue

            browser.close()

        # 修正順序:根據檔名編號排序
        if len(img_urls) > 1:
            try:
                import re

                # 提取所有圖片的編號
                url_with_numbers = []
                for url in img_urls:
                    match = re.search(r"_(\d+)\.(jpg|jpeg|png|gif)", url)
                    if match:
                        number = int(match.group(1))
                        url_with_numbers.append((number, url))
                    else:
                        url_with_numbers.append(
                            (float("inf"), url)
                        )  # 無法提取編號的放最後

                helper.debug_print(
                    f"提取到的編號: {[num for num, _ in url_with_numbers[:10]]}"
                )

                # 檢查是否需要排序(前幾張編號是否已經是遞增的)
                check_count = min(5, len(url_with_numbers))
                first_few_numbers = [num for num, _ in url_with_numbers[:check_count]]

                # 檢查前幾張是否已經排序好
                is_sorted = all(
                    first_few_numbers[i] <= first_few_numbers[i + 1]
                    for i in range(len(first_few_numbers) - 1)
                    if first_few_numbers[i] != float("inf")
                    and first_few_numbers[i + 1] != float("inf")
                )

                if not is_sorted:
                    # 按編號排序
                    url_with_numbers.sort(key=lambda x: x[0])
                    img_urls = [url for _, url in url_with_numbers]
                    first_five_nums = [num for num, _ in url_with_numbers[:5]]
                    helper.debug_print(
                        f"圖片順序已修正,排序後前 5 張編號: {first_five_nums}"
                    )
                else:
                    helper.debug_print("圖片順序正確,無需調整")

            except Exception as e:
                helper.debug_print(f"順序修正時發生錯誤: {e},保持原順序")

        elapsed = helper.calculate_elapsed_time(start_time)
        return FetchResult(
            total_images=len(img_elements),
            successful_fetches=len(img_urls),
            failure_fetches=len(errors),
            image_urls=img_urls,
            errors=errors,
            elapsed_time=elapsed,
        )

    except Exception as e:
        elapsed = helper.calculate_elapsed_time(start_time)
        return FetchResult(0, 0, 0, [], [str(e)], elapsed)


def _download_single_image(
    index: int, img_url: str, output_dir: str
) -> tuple[int, bool, str, str]:
    """下載單張圖片的輔助函數

    Args:
        index (int): 圖片索引
        img_url (str): 圖片 URL
        output_dir (str): 輸出目錄

    Returns:
        Tuple[int, bool, str, str]: (索引, 是否成功, 圖片URL, 錯誤訊息)
    """
    try:
        helper.debug_print(f"正在下載第 {index + 1} 張圖片 (index={index})...")

        # 發送 GET 請求下載圖片
        response = requests.get(img_url, timeout=30)
        response.raise_for_status()

        # 從 URL 中提取檔案副檔名
        url_parts = img_url.split("?")[0]  # 移除 query string
        ext = url_parts.split(".")[-1] if "." in url_parts else "jpg"

        # 確保副檔名合法
        if ext.lower() not in ["jpg", "jpeg", "png", "gif", "webp", "bmp"]:
            ext = "jpg"

        # 建立檔案名稱 (使用 index + 1 來保持順序)
        filename = f"{index + 1:03d}.{ext}"
        filepath = Path(output_dir) / filename

        # 寫入檔案
        filepath.write_bytes(response.content)

        helper.debug_print(
            f"第 {index + 1} 張圖片下載完成: {filename} (URL: {img_url[:60]}...)"
        )
        return (index, True, img_url, "")

    except Exception as e:
        error_msg = f"第{index + 1}張圖片下載失敗: {str(e)}"
        helper.debug_print(error_msg)
        return (index, False, img_url, error_msg)


def download_naver_blog_images(
    image_urls: list[str], output_dir: str
) -> DownloadResult:
    """並行下載圖片並保持順序

    Args:
        image_urls (List[str]): 圖片 URL 列表
        output_dir (str): 輸出目錄路徑

    Returns:
        DownloadResult: 下載結果
    """
    start_time = helper.get_current_time()
    errors = []
    successful_urls = []

    # 建立輸出目錄
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    helper.debug_print(f"輸出目錄: {output_path.absolute()}")

    if not image_urls:
        elapsed = helper.calculate_elapsed_time(start_time)
        return DownloadResult(
            total_images=0,
            successful_downloads=0,
            failure_downloads=0,
            image_urls=[],
            errors=["沒有圖片需要下載"],
            elapsed_time=elapsed,
        )

    # 使用 ThreadPoolExecutor 並行下載
    # 使用字典來儲存結果,key 為 index,確保順序
    results = {}

    helper.debug_print(f"開始並行下載 {len(image_urls)} 張圖片...")
    for i, url in enumerate(image_urls):
        helper.debug_print(f"  image_urls[{i}]: {url[:80]}...")

    with ThreadPoolExecutor(max_workers=5) as executor:
        # 提交所有下載任務
        future_to_index = {
            executor.submit(_download_single_image, idx, url, output_dir): idx
            for idx, url in enumerate(image_urls)
        }

        # 收集完成的任務
        for future in as_completed(future_to_index):
            index, success, img_url, error_msg = future.result()
            results[index] = (success, img_url, error_msg)
            helper.debug_print(f"完成下載任務: index={index}, success={success}")

    # 按照原始順序處理結果
    helper.debug_print("按順序處理下載結果...")
    for idx in sorted(results.keys()):
        success, img_url, error_msg = results[idx]
        if success:
            successful_urls.append(img_url)
        if error_msg:  # 只有在有錯誤訊息時才添加
            errors.append(error_msg)

    elapsed = helper.calculate_elapsed_time(start_time)

    return DownloadResult(
        total_images=len(image_urls),
        successful_downloads=len(successful_urls),
        failure_downloads=len(errors),
        image_urls=successful_urls,
        errors=errors,
        elapsed_time=elapsed,
    )


def main():
    import argparse

    parser = argparse.ArgumentParser(description="自動下載 Naver Blog 原始圖片")
    parser.add_argument("--url", required=True, help="Naver Blog 網址")
    parser.add_argument("--output", default="images", help="圖片儲存資料夾")

    args = parser.parse_args()

    url: str = args.url
    output_dir: str = args.output

    # 擷取圖片
    fetch_result = fetch_naver_blog_images(url)

    # 使用 debug_print 輸出 JSON 格式的擷取結果
    fetch_result_json = json.dumps(fetch_result.to_dict(), ensure_ascii=False, indent=4)
    helper.debug_print(f"擷取結果 JSON: {fetch_result_json}")

    print("\n=== 擷取結果 ===")
    print(f"總圖片數: {fetch_result.total_images}")
    print(f"成功擷取: {fetch_result.successful_fetches}")
    print(f"擷取失敗: {fetch_result.failure_fetches}")
    print(f"擷取耗時: {fetch_result.elapsed_time:.2f} 秒")

    if fetch_result.errors:
        print("\n擷取錯誤:")
        for error in fetch_result.errors:
            print(f"  - {error}")

    if not fetch_result.image_urls:
        print("\n沒有圖片可供下載")
        return

    # 下載圖片
    print(f"\n開始下載圖片到 {output_dir} ...")
    download_result = download_naver_blog_images(fetch_result.image_urls, output_dir)

    print("\n=== 下載結果 ===")
    print(f"總圖片數: {download_result.total_images}")
    print(f"成功下載: {download_result.successful_downloads}")
    print(f"下載失敗: {download_result.failure_downloads}")
    print(f"下載耗時: {download_result.elapsed_time:.2f} 秒")

    if download_result.errors:
        print("\n下載錯誤:")
        for error in download_result.errors:
            print(f"  - {error}")

    if download_result.successful_downloads > 0:
        success_count = download_result.successful_downloads
        print(f"\n✅ 成功下載 {success_count} 張圖片到 {output_dir}")
    else:
        print("\n❌ 沒有成功下載任何圖片")


if __name__ == "__main__":
    main()
