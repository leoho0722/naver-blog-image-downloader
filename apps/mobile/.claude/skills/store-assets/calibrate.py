#!/usr/bin/env python3
"""從 AppMockUp 產出的 zhTW 既有上架素材抽取背景色，並寫入 config.json。

版面（字級、文字位置、設備框座標）使用預設值；需要微調時直接改 config.json。
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from PIL import Image

SKILL_DIR = Path(__file__).resolve().parent
MOBILE_ROOT = SKILL_DIR.parents[2]  # .claude/skills/store-assets → apps/mobile
ASSETS_DIR = MOBILE_ROOT / "assets" / "screenshots"
CONFIG_PATH = SKILL_DIR / "config.json"


@dataclass(frozen=True)
class DeviceSpec:
    """描述一個上架用裝置的輸出規格與對應資源。

    [device_id] 設備代碼（用於檔名與 config key）。
    [store] 屬於 "app-store" 或 "play-store"。
    [output_name] 輸出檔名模板，含 {index} 佔位符。
    [output_size] 輸出畫布寬高（像素）。
    [frame_file] 設備框 PNG 在 frames/ 內的檔名。
    [frame_url] 自動下載來源 URL；為 None 表示無法自動下載，須手動放置。
    [screenshot_source] app 截圖來源路徑模板，含 {locale}、{scenario} 佔位符，相對 assets/screenshots/。
    [sample_zhtw_basename] 用來抽背景色的 zhTW PNG 基底檔名（相對 app-store/zhTW/ 或 play-store/zhTW/）。
    """

    device_id: str
    store: str
    output_name: str
    output_size: tuple[int, int]
    frame_file: str
    frame_url: str | None
    screenshot_source: str
    sample_zhtw_basename: str


DEVICES: tuple[DeviceSpec, ...] = (
    DeviceSpec(
        device_id="iphone-16-pro-max",
        store="app-store",
        output_name="Apple iPhone 16 Pro Max Screenshot {index}.png",
        output_size=(1320, 2868),
        frame_file="iphone-16-pro-max.png",
        frame_url="https://raw.githubusercontent.com/fastlane/frameit-frames/gh-pages/latest/Apple%20iPhone%2016%20Pro%20Max%20Black%20Titanium.png",
        screenshot_source="ios-phone/iPhone 17 Pro Max/{locale}/light/{scenario}.png",
        sample_zhtw_basename="Apple iPhone 16 Pro Max Screenshot 1.png",
    ),
    DeviceSpec(
        device_id="iphone-14-plus",
        store="app-store",
        output_name="Apple iPhone 14 Plus Screenshot {index}.png",
        output_size=(1284, 2778),
        frame_file="iphone-14-plus.png",
        frame_url="https://raw.githubusercontent.com/fastlane/frameit-frames/gh-pages/latest/Apple%20iPhone%2014%20Plus%20Midnight.png",
        screenshot_source="ios-phone/iPhone 14 Plus/{locale}/light/{scenario}.png",
        sample_zhtw_basename="Apple iPhone 14 Plus Screenshot 1.png",
    ),
    DeviceSpec(
        device_id="ipad-pro-129",
        store="app-store",
        output_name="Apple iPad Pro 12.9 Inch Screenshot {index}.png",
        output_size=(2048, 2732),
        frame_file="ipad-pro-129.png",
        frame_url="https://raw.githubusercontent.com/fastlane/frameit-frames/gh-pages/latest/Apple%20iPad%20Pro%20%2812.9-inch%29%20%284th%20generation%29%20Space%20Gray.png",
        screenshot_source="ios-tablet/{locale}/light/{scenario}.png",
        sample_zhtw_basename="Apple iPad Pro 12.9 Inch Screenshot 1.png",
    ),
    DeviceSpec(
        device_id="galaxy-s21-ultra",
        store="play-store",
        output_name="Phone Screenshot {index}.png",
        output_size=(1620, 2880),
        frame_file="galaxy-s21-ultra.png",
        frame_url="https://raw.githubusercontent.com/fastlane/frameit-frames/gh-pages/latest/Samsung%20Galaxy%20S21%20Ultra%205G%20Black.png",
        screenshot_source="android-phone/{locale}/light/{scenario}.png",
        sample_zhtw_basename="Phone Screenshot 1.png",
    ),
    DeviceSpec(
        device_id="galaxy-tab-s7",
        store="play-store",
        output_name="Tablet Screenshot {index}.png",
        output_size=(1620, 2880),
        frame_file="galaxy-tab-s7.png",
        frame_url=None,
        screenshot_source="android-tablet/{locale}/light/{scenario}.png",
        sample_zhtw_basename="Tablet Screenshot 1.png",
    ),
)


def sample_background_color(image_path: Path) -> str:
    """從素材左上角取樣像素回傳 hex 色碼。

    [image_path] AppMockUp 產出的 zhTW PNG 絕對路徑。

    假設圖片四角落都是純色背景，取 (10, 10) 作代表；遇到 RGBA 圖會忽略 alpha。
    回傳 hex 色碼字串如 "#F1F1F1"。
    """
    with Image.open(image_path) as img:
        rgb = img.convert("RGB")
        r, g, b = rgb.getpixel((10, 10))
    return f"#{r:02X}{g:02X}{b:02X}"


def build_device_config(device: DeviceSpec) -> dict:
    """合成單一裝置的 config 片段。

    [device] 描述設備的 [DeviceSpec]。

    會嘗試從 assets 取樣對應 zhTW 素材抓背景色；找不到則退回預設 "#F1F1F1"。
    版面位置 / 字級採用根據 output_size 推得的比例預設，後續可手動改 config.json。
    回傳 dict 形式的單裝置設定。
    """
    store_dir = ASSETS_DIR / device.store / "zhTW"
    sample_path = store_dir / device.sample_zhtw_basename
    if sample_path.exists():
        background_color = sample_background_color(sample_path)
    else:
        print(f"⚠️ 找不到 {sample_path}，用預設 #F1F1F1")
        background_color = "#F1F1F1"

    width, height = device.output_size
    # 標題從頂端 5% 開始，字級約為畫布寬 6.5%，平板字級較小避免過於誇張
    is_tablet = "ipad" in device.device_id or "tab" in device.device_id
    title_font_size = int(width * (0.055 if is_tablet else 0.065))
    subtitle_font_size = int(title_font_size * 0.58)
    title_y = int(height * 0.045)
    subtitle_y = title_y + title_font_size + int(height * 0.012)
    frame_top_y = int(height * 0.16)  # 設備框從畫布 16% 處開始

    return {
        "store": device.store,
        "output_name": device.output_name,
        "output_size": list(device.output_size),
        "frame_file": device.frame_file,
        "frame_url": device.frame_url,
        "screenshot_source": device.screenshot_source,
        "background_color": background_color,
        "title": {
            "y": title_y,
            "font_size": title_font_size,
            "color": "#1F1F1F",
            "weight": "Bold",
        },
        "subtitle": {
            "y": subtitle_y,
            "font_size": subtitle_font_size,
            "color": "#4A4A4A",
            "weight": "Regular",
        },
        "frame": {
            "top_y": frame_top_y,
        },
    }


def main() -> None:
    """主流程：組合所有裝置設定，寫入 config.json。

    會覆寫既有 config.json；之後手動微調的數值會流失。
    """
    config = {
        "_comment": "由 calibrate.py 從 AppMockUp 版 zhTW 素材產生；手動微調後再跑會被覆寫。",
        "scenario_by_index": {
            "1": "photo_gallery_grid",
            "2": "photo_detail_native",
            "3": "blog_input_with_url",
            "4": "settings_default",
        },
        "devices": {device.device_id: build_device_config(device) for device in DEVICES},
    }
    CONFIG_PATH.write_text(
        json.dumps(config, indent=4, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"✅ config.json 已寫入 {CONFIG_PATH}")
    for device in DEVICES:
        bg = config["devices"][device.device_id]["background_color"]
        print(f"   {device.device_id}: background={bg}")


if __name__ == "__main__":
    main()
