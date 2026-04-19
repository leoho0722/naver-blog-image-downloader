---
name: store-assets
description: 從 store_listings.json + 多語系原始 app 截圖自動合成 App Store / Google Play 上架素材。用 Pillow 合成、自動下載設備框（Apple / Samsung）與 Noto Sans CJK 字型；取代 AppMockUp 手動流程。
---

# Store Assets 產生器

自動化產出四語系（zhTW / en / ja / ko）的 App Store + Play Store 上架素材。

## 輸入

- `apps/mobile/assets/screenshots/store_listings.json` — 標題 / 副標文案
- `apps/mobile/assets/screenshots/{android-phone,android-tablet,ios-phone,ios-tablet}/**` — 原始 app 截圖

## 輸出

```
apps/mobile/assets/screenshots/store-assets-generated/
├── app-store/{zhTW,en,ja,ko}/
│   ├── Apple iPhone 16 Pro Max Screenshot {1..4}.png   1320x2868
│   ├── Apple iPhone 14 Plus Screenshot {1..4}.png      1284x2778
│   └── Apple iPad Pro 12.9 Inch Screenshot {1..4}.png  2048x2732
└── play-store/{zhTW,en,ja,ko}/
    ├── Phone Screenshot {1..4}.png    1620x2880
    └── Tablet Screenshot {1..4}.png   1620x2880
```

**命名結尾為 `-generated`** 以區隔於 AppMockUp 產出的 `app-store/` / `play-store/`。

## 使用

全部語系 × 全部裝置 × 全部 screen：
```bash
cd apps/mobile/.claude/skills/store-assets
uv run generate.py
```

過濾：
```bash
uv run generate.py --locale en
uv run generate.py --device iphone-16-pro-max
uv run generate.py --screen 1
uv run generate.py --locale en --device iphone-16-pro-max --screen 1
```

## 第一次執行

腳本會自動檢查並下載缺件：

- **設備框 PNG**：從 [fastlane/frameit-frames](https://github.com/fastlane/frameit-frames) 抓（Apple 3 台 + Samsung S21 Ultra）
- **字型**：從 [notofonts/noto-cjk](https://github.com/notofonts/noto-cjk) 抓 Noto Sans TC / JP / KR（Regular + Bold）

**Galaxy Tab S7 例外**：第三方沒有可商用授權的 PNG，skill 會**程式生成通用平板框**（深灰 bezel + 微圓角、無品牌），放到 `frames/galaxy-tab-s7.png`。若想換成官方品牌框，放自己的 PNG 覆蓋即可。

下載後放在 `frames/` 與 `fonts/`（均 gitignore）。

## 校準 config

`config.json` 的版面參數（背景色、文字位置、設備框座標）由 `calibrate.py` 從 AppMockUp 版 zhTW 既有素材自動抽出。

首次或 AppMockUp 版改過時重跑：
```bash
uv run calibrate.py
```

會覆寫 `config.json`；之後可手動微調數值。

## scenario → screenshot index 對應

| index | scenario |
|---|---|
| 1 | photo_gallery_grid |
| 2 | photo_detail_native |
| 3 | blog_input_with_url |
| 4 | settings_default |

與 `store_listings.json` 的 `screens[].scenario` 一致。

## 依賴

- Python 3.10+
- `pillow`（圖片合成）
- `requests`（下載資源）
- `uv`（環境管理）

所有依賴由 `pyproject.toml` 定義，`uv sync` 自動安裝。
