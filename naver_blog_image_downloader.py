import os
import time

import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager


def download_images_from_naver_blog(blog_url: str, output_dir: str = "images", headless: bool = True):
    chrome_options = Options()
    if headless:
        chrome_options.add_argument('--headless')  # 測試時可先註解掉
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('--lang=ko-KR')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    driver.get(blog_url)
    time.sleep(1)  # 首次載入可略縮短

    # 切換到電腦版網頁
    if "m.blog.naver.com" in driver.current_url:
        try:
            pc_btn = driver.find_element(By.CSS_SELECTOR, 'a#goToBase')
            pc_btn.click()
            time.sleep(0.5)
        except Exception:
            pass

    # 進入 iframe 取得內容
    try:
        driver.switch_to.frame('mainFrame')
        time.sleep(1)
    except Exception:
        pass

    # 取得所有 se-image-resource.egjs-visible 圖片
    img_elements = driver.find_elements(By.CSS_SELECTOR, 'img.se-image-resource.egjs-visible')
    print(f"找到 {len(img_elements)} 張圖片")

    if not img_elements:
        print("未找到任何圖片，結束。")
        driver.quit()
        return

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    for idx in range(len(img_elements)):
        try:
            # 重新獲取所有圖片元素，避免 DOM 變動導致 stale element
            img_elements = driver.find_elements(By.CSS_SELECTOR, 'img.se-image-resource.egjs-visible')
            img_element = img_elements[idx]
            ActionChains(driver).move_to_element(img_element).click().perform()
            time.sleep(0.5)  # 彈窗出現等待時間縮短

            # 取得彈窗中的原圖網址
            popup_img = None
            for _ in range(6):  # 最多等 1.2 秒
                popup_imgs = driver.find_elements(By.CSS_SELECTOR, 'div.cpv__img_wrap img.cpv__img')
                if popup_imgs:
                    popup_img = popup_imgs[0]
                    break
                time.sleep(0.2)
            if not popup_img:
                print(f"第{idx+1}張圖片未找到彈窗原圖，略過")
                driver.find_element(By.TAG_NAME, 'body').send_keys("\uE00C")
                continue
            img_url = popup_img.get_attribute('src')
            if not img_url or not img_url.startswith('http'):
                print(f"第{idx+1}張圖片無法取得原圖網址，略過")
                driver.find_element(By.TAG_NAME, 'body').send_keys("\uE00C")
                continue
            # 下載圖片
            img_data = requests.get(img_url, timeout=10).content
            ext = os.path.splitext(img_url)[-1].split('?')[0]
            if not ext or len(ext) > 5:
                ext = '.jpg'
            img_path = os.path.join(output_dir, f"image_{idx+1}{ext}")
            with open(img_path, 'wb') as f:
                f.write(img_data)
            print(f"已儲存: {img_path}")
            # 關閉彈窗
            driver.find_element(By.TAG_NAME, 'body').send_keys("\uE00C")
            time.sleep(0.2)  # 關閉彈窗等待時間縮短
        except Exception as e:
            print(f"第{idx+1}張圖片處理失敗: {e}")
            continue

    driver.quit()
    print("所有圖片下載完成！")


def main():
    import argparse

    parser = argparse.ArgumentParser(description='自動下載 Naver Blog 原始圖片')
    parser.add_argument('--url', required=True, help='Naver Blog 網址')
    parser.add_argument('--output', default='images', help='圖片儲存資料夾')
    parser.add_argument('--headless', action='store_true', help='是否使用無頭模式')
    
    args = parser.parse_args()

    url: str = args.url
    output_dir: str = args.output
    headless: bool = args.headless

    download_images_from_naver_blog(url, output_dir, headless)

if __name__ == '__main__':
    main()
