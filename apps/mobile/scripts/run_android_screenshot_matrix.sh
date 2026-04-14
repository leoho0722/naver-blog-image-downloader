#!/bin/bash
# 直接透過 adb 對 Android 模擬器逐一啟動 screenshot mode 並擷取畫面。
#
# 需求：
#   - 指定 Android 模擬器已 boot
#   - Debug 版 APK 已 install（screenshot mode 只在 kDebugMode 生效）
#   - 系統已安裝 jq（用於讀取 screenshot_matrix.json）
#
# 可用環境變數（均有預設值）：
#   ADB              — adb 執行檔路徑
#   DEVICE           — 目標裝置序號（adb -s 指定）
#   PACKAGE          — Android package name
#   ACTIVITY         — 啟動 activity（相對 package 的路徑）
#   OUT_DIR          — 截圖輸出目錄（預設 /tmp/naver_blog_image_downloader_android_screenshots_<timestamp>）
#   SCENARIOS_FILTER — 只跑指定場景（逗號分隔），如 "photo_gallery_grid,photo_gallery_select"
#   LOCALES_FILTER   — 只跑指定語系（逗號分隔），如 "zhTW,en"
#   THEMES_FILTER    — 只跑指定主題（逗號分隔），如 "light"
#
# 所有場景 / 語系 / 主題 / 等待秒數皆來自 screenshot_matrix.json，
# 新增場景時只要編輯該 JSON 並執行 `dart run scripts/generate_maestro_matrix.dart`。
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
JSON="${SCRIPT_DIR}/screenshot_matrix.json"

# 前置檢查：必備檔案與工具
if [ ! -f "$JSON" ]; then
  echo "❌ 找不到 $JSON" >&2
  exit 1
fi
if ! command -v jq >/dev/null 2>&1; then
  echo "❌ 需要 jq，請先安裝（brew install jq）" >&2
  exit 1
fi

ADB="${ADB:-$HOME/Library/Android/sdk/platform-tools/adb}"
DEVICE="${DEVICE:-emulator-5554}"
PACKAGE="${PACKAGE:-com.leoho.naverBlogImageDownloader.android}"
ACTIVITY="${ACTIVITY:-.applications.MainActivity}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUT_DIR="${OUT_DIR:-/tmp/naver_blog_image_downloader_android_screenshots_${TIMESTAMP}}"
LOG_FILE="${OUT_DIR}/run.log"

mkdir -p "$OUT_DIR"
echo "Matrix 執行開始：$(date)" | tee "$LOG_FILE"
echo "裝置：$DEVICE" | tee -a "$LOG_FILE"
echo "Package：$PACKAGE" | tee -a "$LOG_FILE"
echo "輸出目錄：$OUT_DIR" | tee -a "$LOG_FILE"

# 確認裝置連線狀態
if ! "$ADB" -s "$DEVICE" shell getprop sys.boot_completed 2>/dev/null | grep -q "^1"; then
  echo "❌ 裝置 $DEVICE 未就緒或尚未完成開機，請先 boot 再執行" | tee -a "$LOG_FILE"
  exit 1
fi

# 從 JSON 讀取 locales / themes / scenarios（含 Android 等待秒數）
LOCALES=()
while IFS= read -r line; do LOCALES+=("$line"); done < <(jq -r '.locales[]' "$JSON")
THEMES=()
while IFS= read -r line; do THEMES+=("$line"); done < <(jq -r '.themes[]' "$JSON")

SCENARIO_ENTRIES=()
while IFS= read -r line; do SCENARIO_ENTRIES+=("$line"); done < <(
  jq -r '.scenarios[] | "\(.id):\(.waitSecsAndroid)"' "$JSON"
)

# 套用白名單過濾器；留空等於不過濾
filter_array() {
  local filter_csv="$1"
  shift
  local values=("$@")
  if [ -z "$filter_csv" ]; then
    printf '%s\n' "${values[@]}"
    return
  fi
  local -a allow
  IFS=',' read -ra allow <<< "$filter_csv"
  for value in "${values[@]}"; do
    for needle in "${allow[@]}"; do
      # SCENARIO_ENTRIES 格式為 "id:wait"，過濾時只比對 id 部分
      local id="${value%%:*}"
      if [ "$value" = "$needle" ] || [ "$id" = "$needle" ]; then
        printf '%s\n' "$value"
        break
      fi
    done
  done
}

LOCALES_FILTERED=()
while IFS= read -r line; do LOCALES_FILTERED+=("$line"); done < <(
  filter_array "${LOCALES_FILTER:-}" "${LOCALES[@]}"
)
THEMES_FILTERED=()
while IFS= read -r line; do THEMES_FILTERED+=("$line"); done < <(
  filter_array "${THEMES_FILTER:-}" "${THEMES[@]}"
)
SCENARIO_ENTRIES_FILTERED=()
while IFS= read -r line; do SCENARIO_ENTRIES_FILTERED+=("$line"); done < <(
  filter_array "${SCENARIOS_FILTER:-}" "${SCENARIO_ENTRIES[@]}"
)

if [ ${#LOCALES_FILTERED[@]} -eq 0 ] || [ ${#THEMES_FILTERED[@]} -eq 0 ] || [ ${#SCENARIO_ENTRIES_FILTERED[@]} -eq 0 ]; then
  echo "❌ 過濾後沒有任何可執行組合，請檢查 *_FILTER 參數" | tee -a "$LOG_FILE"
  exit 1
fi

TOTAL_EXPECTED=$((${#LOCALES_FILTERED[@]} * ${#THEMES_FILTERED[@]} * ${#SCENARIO_ENTRIES_FILTERED[@]}))
TOTAL=0
FAILED=0
SUCCESS=0
FAILED_LIST=()

for locale in "${LOCALES_FILTERED[@]}"; do
  for theme in "${THEMES_FILTERED[@]}"; do
    SUB_DIR="${OUT_DIR}/${locale}/${theme}"
    mkdir -p "$SUB_DIR"
    for entry in "${SCENARIO_ENTRIES_FILTERED[@]}"; do
      scenario="${entry%%:*}"
      WAIT_SECS="${entry##*:}"
      TOTAL=$((TOTAL+1))
      OUT_PATH="${SUB_DIR}/${scenario}.png"

      echo "[${TOTAL}/${TOTAL_EXPECTED}] ${locale}/${theme}/${scenario}" | tee -a "$LOG_FILE"

      # 先強制停止 app，避免前一次狀態殘留
      "$ADB" -s "$DEVICE" shell am force-stop "$PACKAGE" >/dev/null 2>&1 || true

      # 啟動 activity 並透過 Intent extras 傳遞 screenshot mode 參數
      LAUNCH_OUT=$("$ADB" -s "$DEVICE" shell am start \
        -n "${PACKAGE}/${ACTIVITY}" \
        --ez screenshotMode true \
        --es scenario "$scenario" \
        --es locale "$locale" \
        --es theme "$theme" 2>&1)
      LAUNCH_RC=$?

      if [ $LAUNCH_RC -ne 0 ] || echo "$LAUNCH_OUT" | grep -qi "error"; then
        echo "  ❌ launch 失敗：$LAUNCH_OUT" | tee -a "$LOG_FILE"
        FAILED=$((FAILED+1))
        FAILED_LIST+=("${locale}/${theme}/${scenario}:launch")
        continue
      fi

      sleep "$WAIT_SECS"

      if "$ADB" -s "$DEVICE" exec-out screencap -p > "$OUT_PATH" 2>/dev/null; then
        if [ -s "$OUT_PATH" ]; then
          SUCCESS=$((SUCCESS+1))
          echo "  ✅ 截圖成功 ($(du -h "$OUT_PATH" | cut -f1))" | tee -a "$LOG_FILE"
        else
          echo "  ❌ 截圖檔為空" | tee -a "$LOG_FILE"
          FAILED=$((FAILED+1))
          FAILED_LIST+=("${locale}/${theme}/${scenario}:empty")
        fi
      else
        echo "  ❌ 截圖指令失敗" | tee -a "$LOG_FILE"
        FAILED=$((FAILED+1))
        FAILED_LIST+=("${locale}/${theme}/${scenario}:screenshot")
      fi

      "$ADB" -s "$DEVICE" shell am force-stop "$PACKAGE" >/dev/null 2>&1 || true
    done
  done
done

echo "" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "完成時間：$(date)" | tee -a "$LOG_FILE"
echo "總計：$TOTAL / 成功：$SUCCESS / 失敗：$FAILED" | tee -a "$LOG_FILE"
if [ ${#FAILED_LIST[@]} -gt 0 ]; then
  echo "失敗清單：" | tee -a "$LOG_FILE"
  for item in "${FAILED_LIST[@]}"; do
    echo "  - $item" | tee -a "$LOG_FILE"
  done
fi
echo "輸出目錄：$OUT_DIR" | tee -a "$LOG_FILE"

if [ $FAILED -gt 0 ]; then
  exit 1
fi
