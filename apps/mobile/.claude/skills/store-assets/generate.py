#!/usr/bin/env python3
"""合成 App Store / Play Store 多語系上架素材。

流程：
1. 讀 config.json 取得裝置規格與版面參數
2. 檢查 frames/ 與 fonts/，缺件時自動從 GitHub 下載
3. 讀 store_listings.json 取得每張截圖的標題與副標
4. 依 locale × device × screen 合成：背景 + 文字 + 設備框（內嵌 app 截圖）
5. 輸出到 assets/screenshots/store-assets-generated/

Galaxy Tab S7 在 fastlane/frameit-frames 沒有收錄，第一次執行若缺件會印手動下載指引後跳過。
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass
from pathlib import Path

import requests
from PIL import Image, ImageChops, ImageDraw, ImageFont

SKILL_DIR = Path(__file__).resolve().parent
MOBILE_ROOT = SKILL_DIR.parents[2]
ASSETS_DIR = MOBILE_ROOT / "assets" / "screenshots"
CONFIG_PATH = SKILL_DIR / "config.json"
STORE_LISTINGS_PATH = ASSETS_DIR / "store_listings.json"
OUTPUT_ROOT = ASSETS_DIR / "store-assets-generated"
FRAMES_DIR = SKILL_DIR / "frames"
FONTS_DIR = SKILL_DIR / "fonts"

# 每個語系對應的 Noto Sans CJK 字型；en 借用 TC（拉丁字元一致）
FONT_URL_BASE = "https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/OTF"
FONT_SPECS: dict[str, dict[str, str]] = {
    "zhTW": {
        "regular": f"{FONT_URL_BASE}/TraditionalChinese/NotoSansCJKtc-Regular.otf",
        "bold": f"{FONT_URL_BASE}/TraditionalChinese/NotoSansCJKtc-Bold.otf",
    },
    "en": {
        "regular": f"{FONT_URL_BASE}/TraditionalChinese/NotoSansCJKtc-Regular.otf",
        "bold": f"{FONT_URL_BASE}/TraditionalChinese/NotoSansCJKtc-Bold.otf",
    },
    "ja": {
        "regular": f"{FONT_URL_BASE}/Japanese/NotoSansCJKjp-Regular.otf",
        "bold": f"{FONT_URL_BASE}/Japanese/NotoSansCJKjp-Bold.otf",
    },
    "ko": {
        "regular": f"{FONT_URL_BASE}/Korean/NotoSansCJKkr-Regular.otf",
        "bold": f"{FONT_URL_BASE}/Korean/NotoSansCJKkr-Bold.otf",
    },
}


@dataclass(frozen=True)
class RenderJob:
    """描述一張要合成的輸出素材。

    [locale] 語系代碼，例如 "zhTW"。
    [device_id] 裝置代碼，例如 "iphone-16-pro-max"。
    [screen_index] 截圖在排序中的序號（1-based）。
    [scenario] 對應 [apps/mobile/scripts/screenshot_matrix.json] 的 scenario id。
    [title] 顯示在素材頂端的標題。
    [subtitle] 顯示在標題下方的副標。
    """

    locale: str
    device_id: str
    screen_index: int
    scenario: str
    title: str
    subtitle: str


def parse_args() -> argparse.Namespace:
    """解析命令列參數。

    回傳含有 [locale]、[device]、[screen] 欄位的 [Namespace]。
    """
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--locale", help="只跑指定語系（zhTW/en/ja/ko）")
    parser.add_argument("--device", help="只跑指定裝置代碼（例：iphone-16-pro-max）")
    parser.add_argument("--screen", type=int, help="只跑指定 screen 序號（1-4）")
    return parser.parse_args()


def hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    """將 "#RRGGBB" hex 色碼轉為 RGB tuple。

    [hex_color] 形如 "#F1F1F1" 的字串；可含或不含前導 "#"。

    回傳 (R, G, B) 三元 tuple。
    """
    hex_color = hex_color.lstrip("#")
    return (
        int(hex_color[0:2], 16),
        int(hex_color[2:4], 16),
        int(hex_color[4:6], 16),
    )


def download_file(url: str, dest: Path) -> None:
    """下載檔案到指定位置，建立父目錄。

    [url] 下載來源 URL。
    [dest] 目標檔案絕對路徑。

    失敗時拋出 [requests.HTTPError]。
    """
    print(f"⬇️  下載 {dest.name} ...")
    dest.parent.mkdir(parents=True, exist_ok=True)
    with requests.get(url, stream=True, timeout=60) as response:
        response.raise_for_status()
        with open(dest, "wb") as f:
            for chunk in response.iter_content(chunk_size=65536):
                f.write(chunk)
    print(f"   ✅ {dest.relative_to(SKILL_DIR)} ({dest.stat().st_size // 1024} KB)")


def create_generic_tablet_frame(inner_size: tuple[int, int]) -> Image.Image:
    """生成替代用通用平板設備框（深灰 bezel + 微圓角、無品牌、螢幕區透明）。

    [inner_size] 內嵌 app 截圖的 (寬, 高) 像素；平板常見 1600x2560。

    回傳 RGBA 模式 Image：透明外角、不透明 bezel、透明螢幕區。
    [detect_frame_inner_rect] 以掃描 bezel 內邊為準，因此螢幕區留透明即可。
    用於沒有合法授權第三方設備框的裝置（例如 Samsung Galaxy Tab S7）。
    """
    inner_w, inner_h = inner_size
    bezel = 42
    outer_radius = 36
    inner_radius = 18
    width = inner_w + bezel * 2
    height = inner_h + bezel * 2

    # bezel 主體（外框含圓角）減去中央螢幕矩形 = 環形 bezel
    mask = Image.new("L", (width, height), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle(
        (0, 0, width - 1, height - 1),
        radius=outer_radius,
        fill=255,
    )
    draw.rounded_rectangle(
        (bezel, bezel, width - bezel - 1, height - bezel - 1),
        radius=inner_radius,
        fill=0,
    )
    bezel_color = (35, 35, 38, 255)
    bezel_layer = Image.new("RGBA", (width, height), bezel_color)
    frame = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    frame.paste(bezel_layer, (0, 0), mask=mask)
    return frame


def ensure_frames(config: dict, device_ids: list[str]) -> None:
    """確認指定裝置的設備框 PNG 都存在，缺件時自動下載或生成替代框。

    [config] 已載入的 config.json dict。
    [device_ids] 本次需要使用的裝置代碼清單（由 jobs 推出來，避免下載用不到的框）。

    處理規則：
    - frame_url 有值 → 從 URL 下載
    - frame_url 為 None 且是平板類裝置 → 生成通用替代框
    - 其他情境 → 拋出錯誤（代表 config 有問題）
    """
    for device_id in device_ids:
        spec = config["devices"][device_id]
        frame_path = FRAMES_DIR / spec["frame_file"]
        if frame_path.exists():
            continue
        frame_url = spec.get("frame_url")
        if frame_url:
            download_file(frame_url, frame_path)
            continue
        # 沒有下載 URL：平板類用通用框替代
        if "tab" in device_id or "ipad" in device_id:
            print(f"ℹ️  {device_id} 無合法下載源，生成通用平板框替代")
            # 依輸出畫布寬度推內嵌尺寸（留邊距後的安全值）
            canvas_w, _ = spec["output_size"]
            inner_w = int(canvas_w * 0.9)
            inner_h = int(inner_w * 1.6)  # 9:16 近似平板 portrait
            frame = create_generic_tablet_frame((inner_w, inner_h))
            frame_path.parent.mkdir(parents=True, exist_ok=True)
            frame.save(frame_path, "PNG")
            print(f"   ✅ {frame_path.relative_to(SKILL_DIR)}（程式生成）")
        else:
            raise RuntimeError(
                f"設備框缺件：{device_id} 沒有 frame_url 也不是平板，請手動放入 {frame_path}"
            )


def ensure_fonts(locales: list[str]) -> None:
    """確認所有要用的語系字型都存在，缺件時自動從 GitHub 下載。

    [locales] 本次需要使用的 locale 代碼清單。
    """
    for locale in locales:
        specs = FONT_SPECS.get(locale)
        if not specs:
            continue
        for weight, url in specs.items():
            filename = url.rsplit("/", 1)[-1]
            dest = FONTS_DIR / filename
            if not dest.exists():
                download_file(url, dest)


def load_font(locale: str, weight: str, size: int) -> ImageFont.FreeTypeFont:
    """載入指定語系 / 粗細 / 字級的字型物件。

    [locale] 語系代碼。
    [weight] "regular" 或 "bold"。
    [size] 字級（像素）。

    回傳 Pillow 的 [FreeTypeFont] 實例。
    """
    url = FONT_SPECS[locale][weight.lower()]
    filename = url.rsplit("/", 1)[-1]
    path = FONTS_DIR / filename
    return ImageFont.truetype(str(path), size=size)


_SCREEN_MASK_CACHE: dict[str, Image.Image] = {}


def build_screen_mask(frame: Image.Image, cache_key: str | None = None) -> Image.Image:
    """生成 per-pixel 遮罩，255 = 螢幕區、0 = 外部透明 / bezel。

    [frame] 設備框 Image，需為 RGBA 模式。
    [cache_key] 可選的 cache 鍵（通常傳 frame 檔案路徑字串），有值時會快取結果。

    流程：
    1. 取 alpha channel
    2. 掃整個 PNG 邊界每一個 pixel；遇 alpha=0 就 floodfill 填 200（標記為外透明）
       — 有些框（如 iPhone 14 Plus）側邊音量 / 電源鍵把外透明切成多個島，
       單從 4 角 floodfill 會漏掉島中間的透明區，所以掃遍邊界才保險
    3. 掃剩下仍是 alpha=0 的透明島；每找到一塊用 floodfill 標記並量像素數
    4. 取像素數最多的一塊作為真實螢幕區，其餘透明島（邊緣雜訊 / 圓角 anti-aliasing
       造成的孤立透明點）全部丟棄 — 這能避免部分框（例如 iPhone 14 Plus）邊緣
       anti-aliasing 產生的斜線連通透明點（像素很少但 bbox 橫跨全圖）被誤判為最大島

    回傳 L 模式 Image；需搭配 [detect_frame_inner_rect] 取得內嵌矩形位置。
    找不到螢幕區時拋出 [ValueError]。
    """
    if cache_key and cache_key in _SCREEN_MASK_CACHE:
        return _SCREEN_MASK_CACHE[cache_key]

    # 先把 alpha 二值化：0 代表透明候選區（螢幕 / 外透明），255 代表其餘（bezel、
    # 半透明 anti-aliasing 邊緣等）。直接用原始 alpha 會讓 marker 值撞到半透明像素
    # 的原始 alpha 值（例如 bezel 邊緣 alpha=100 剛好等於 current_marker），導致
    # 遮罩把 bezel 那層也誤收進來。
    alpha = frame.getchannel("A").point(lambda p: 0 if p == 0 else 255)
    width, height = alpha.size

    # 四個固定 marker 值：外透明 / 本次掃到的島 / 目前最大的島 / 已淘汰的小島
    outer_marker = 200
    current_marker = 100
    best_marker = 150
    discard_marker = 180

    # Step 1：從整個 PNG 外框做 floodfill，把外透明區全部標成 outer_marker
    for x in range(width):
        if alpha.getpixel((x, 0)) == 0:
            ImageDraw.floodfill(alpha, (x, 0), outer_marker)
        if alpha.getpixel((x, height - 1)) == 0:
            ImageDraw.floodfill(alpha, (x, height - 1), outer_marker)
    for y in range(height):
        if alpha.getpixel((0, y)) == 0:
            ImageDraw.floodfill(alpha, (0, y), outer_marker)
        if alpha.getpixel((width - 1, y)) == 0:
            ImageDraw.floodfill(alpha, (width - 1, y), outer_marker)

    # Step 2：掃剩餘 alpha=0 的島；每找到一塊用 floodfill 標成 current_marker，
    # 立即量 bbox 面積；若比目前最大的大就升格為 best_marker（舊的王降成 discard）
    # 否則直接標成 discard。這樣不管島有幾塊都只靠固定四個 marker 值追蹤，
    # 不會撞到 iPhone 14 Plus 那種邊緣 anti-aliasing 產生數百顆 1-pixel 島的狀況。
    best_area = -1
    pixels = alpha.load()
    any_island = False
    for y in range(height):
        for x in range(width):
            if pixels[x, y] != 0:
                continue
            any_island = True
            ImageDraw.floodfill(alpha, (x, y), current_marker)
            current_mask = alpha.point(
                lambda p, cm=current_marker: 255 if p == cm else 0
            )
            # 用像素數而非 bbox 面積比大小，避免像 iPhone 14 Plus 那種邊緣
            # anti-aliasing 產生的斜線連通像素（pixel 只有幾顆但 bbox 橫跨全圖）
            # 被誤判為最大島
            area = current_mask.histogram()[255]
            if area > best_area:
                # 舊王降級成 discard
                if best_area > 0:
                    old_best_mask = alpha.point(
                        lambda p, bm=best_marker: 255 if p == bm else 0
                    )
                    alpha.paste(discard_marker, mask=old_best_mask)
                alpha.paste(best_marker, mask=current_mask)
                best_area = area
            else:
                alpha.paste(discard_marker, mask=current_mask)

    if not any_island:
        raise ValueError("設備框找不到任何透明區")

    mask = alpha.point(lambda p, bm=best_marker: 255 if p == bm else 0)
    if cache_key:
        _SCREEN_MASK_CACHE[cache_key] = mask
    return mask


def detect_frame_inner_rect(
    frame: Image.Image, cache_key: str | None = None
) -> tuple[int, int, int, int]:
    """回傳設備框螢幕區的外接矩形。

    [frame] 設備框 Image，需為 RGBA 模式。
    [cache_key] 轉交給 [build_screen_mask] 做快取。

    基於 [build_screen_mask] 的遮罩算外接矩形；圓角螢幕的矩形會稍微比真實可視範圍
    大一圈（包含圓角 AABB），貼 app 截圖後用遮罩 clip 掉圓角多出的部分。

    回傳 (left, top, right, bottom) 四元 tuple。找不到時拋出 [ValueError]。
    """
    mask = build_screen_mask(frame, cache_key=cache_key)
    bbox = mask.getbbox()
    if bbox is None:
        raise ValueError("設備框找不到內螢幕區")
    return bbox


def compose_one(
    job: RenderJob, device_config: dict, frame: Image.Image
) -> Image.Image:
    """合成單張上架素材。

    [job] 描述要合成的 locale / device / screen 與文字內容。
    [device_config] 該裝置在 config.json 內的設定片段。
    [frame] 已載入好的裝置框 RGBA Image；由 caller 快取重用，避免每張都重開檔。

    回傳合成完成的 RGBA [Image]。
    """
    width, height = device_config["output_size"]
    bg_color = hex_to_rgb(device_config["background_color"])
    canvas = Image.new("RGB", (width, height), bg_color)
    draw = ImageDraw.Draw(canvas)

    # 標題
    title_cfg = device_config["title"]
    title_font = load_font(job.locale, title_cfg["weight"], title_cfg["font_size"])
    title_color = hex_to_rgb(title_cfg["color"])
    title_width = draw.textlength(job.title, font=title_font)
    draw.text(
        ((width - title_width) / 2, title_cfg["y"]),
        job.title,
        fill=title_color,
        font=title_font,
    )

    # 副標
    subtitle_cfg = device_config["subtitle"]
    subtitle_font = load_font(job.locale, subtitle_cfg["weight"], subtitle_cfg["font_size"])
    subtitle_color = hex_to_rgb(subtitle_cfg["color"])
    subtitle_width = draw.textlength(job.subtitle, font=subtitle_font)
    draw.text(
        ((width - subtitle_width) / 2, subtitle_cfg["y"]),
        job.subtitle,
        fill=subtitle_color,
        font=subtitle_font,
    )

    # 設備框（由 caller 快取傳入）+ 內嵌 app 截圖
    cache_key = device_config["frame_file"]
    screen_mask = build_screen_mask(frame, cache_key=cache_key)
    bbox = screen_mask.getbbox()
    if bbox is None:
        raise ValueError(f"設備框 {device_config['frame_file']} 找不到內螢幕區")
    inner_left, inner_top, inner_right, inner_bottom = bbox
    inner_w = inner_right - inner_left
    inner_h = inner_bottom - inner_top

    screenshot_rel = device_config["screenshot_source"].format(
        locale=job.locale,
        scenario=job.scenario,
    )
    screenshot_path = ASSETS_DIR / screenshot_rel
    if not screenshot_path.exists():
        raise FileNotFoundError(f"找不到原始截圖 {screenshot_path}")
    screenshot = Image.open(screenshot_path).convert("RGB")
    screenshot_fitted = screenshot.resize((inner_w, inner_h), Image.Resampling.LANCZOS)

    # 合成：把 app 截圖貼進設備框，遮罩只認內螢幕區
    # 外透明（設備輪廓外）與 bezel 都 mask=0，確保截圖不會從鏡頭孔、圓角或 PNG 邊緣透出來。
    screenshot_layer = Image.new("RGBA", frame.size, (0, 0, 0, 0))
    screenshot_layer.paste(screenshot_fitted, (inner_left, inner_top))
    framed = frame.copy()
    framed.paste(screenshot_layer, (0, 0), mask=screen_mask)

    # 決定設備框在畫布上的 x 座標（置中）與放大倍率
    frame_top_y = device_config["frame"]["top_y"]
    # 保留畫布底部 5% 空白；計算允許的最大高度
    max_frame_h = int(height - frame_top_y - height * 0.02)
    frame_w, frame_h = framed.size
    scale = min(max_frame_h / frame_h, (width * 0.95) / frame_w)
    target_size = (int(frame_w * scale), int(frame_h * scale))
    framed_resized = framed.resize(target_size, Image.Resampling.LANCZOS)
    frame_x = (width - target_size[0]) // 2
    canvas_rgba = canvas.convert("RGBA")
    canvas_rgba.alpha_composite(framed_resized, dest=(frame_x, frame_top_y))
    return canvas_rgba


def build_jobs(
    config: dict,
    store_listings: dict,
    locale_filter: str | None,
    device_filter: str | None,
    screen_filter: int | None,
) -> list[RenderJob]:
    """依 filter 展開所有要跑的合成工作。

    [config] config.json dict。
    [store_listings] store_listings.json dict。
    [locale_filter] 單一語系過濾，None 表示全部。
    [device_filter] 單一裝置代碼過濾。
    [screen_filter] 單一 screen 序號過濾。

    回傳符合條件的 [RenderJob] 清單。
    """
    locales: list[str] = (
        [locale_filter] if locale_filter else list(store_listings["locales"])
    )
    device_ids: list[str] = (
        [device_filter] if device_filter else list(config["devices"].keys())
    )
    jobs: list[RenderJob] = []
    for locale in locales:
        for device_id in device_ids:
            for screen in store_listings["screens"]:
                if screen_filter and screen["index"] != screen_filter:
                    continue
                localization = screen["localizations"].get(locale)
                if not localization:
                    continue
                jobs.append(
                    RenderJob(
                        locale=locale,
                        device_id=device_id,
                        screen_index=screen["index"],
                        scenario=screen["scenario"],
                        title=localization["title"],
                        subtitle=localization["subtitle"],
                    )
                )
    return jobs


def main() -> None:
    """主流程：組合資源 → 展開工作 → 逐張合成 → 輸出。

    失敗時以非零碼退出並印錯誤訊息。
    """
    args = parse_args()
    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    store_listings = json.loads(STORE_LISTINGS_PATH.read_text(encoding="utf-8"))

    jobs = build_jobs(
        config,
        store_listings,
        args.locale,
        args.device,
        args.screen,
    )
    if not jobs:
        print("❌ 沒有匹配的工作，請檢查 filter")
        sys.exit(1)

    locales_needed = sorted({job.locale for job in jobs})
    devices_needed = sorted({job.device_id for job in jobs})
    ensure_fonts(locales_needed)
    ensure_frames(config, devices_needed)

    # 預先載入所有要用到的裝置框，避免迴圈內重複開檔（同一台裝置會被用 N 張截圖共用）
    frames: dict[str, Image.Image] = {
        device_id: Image.open(FRAMES_DIR / config["devices"][device_id]["frame_file"]).convert("RGBA")
        for device_id in devices_needed
    }

    total = len(jobs)
    for index, job in enumerate(jobs, start=1):
        device_config = config["devices"][job.device_id]
        out_dir = OUTPUT_ROOT / device_config["store"] / job.locale
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path = out_dir / device_config["output_name"].format(index=job.screen_index)

        print(f"[{index}/{total}] {job.locale}/{job.device_id}/#{job.screen_index}")
        image = compose_one(job, device_config, frames[job.device_id])
        image.convert("RGB").save(out_path, "PNG", optimize=True)
        print(f"   ✅ {out_path.relative_to(ASSETS_DIR)}")

    print()
    print(f"完成：{total} 張")


if __name__ == "__main__":
    main()
