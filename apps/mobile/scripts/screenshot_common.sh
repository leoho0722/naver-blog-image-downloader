#!/bin/bash
# iOS / Android screenshot matrix 腳本共用函式。
# 被 run_ios_screenshot_matrix.sh 與 run_android_screenshot_matrix.sh 以 `source` 引入。
#
# 這個檔案不應被直接執行，僅作為 library。

# 以 csv 白名單過濾陣列，留空時代表不過濾。
#
# 用法：
#   filter_array "a,b" "a" "b" "c"         # 輸出 a / b
#   filter_array ""    "a" "b" "c"         # 輸出 a / b / c
#
# SCENARIOS 陣列的項目格式為 "id:wait"，過濾時會同時比對完整字串與冒號前的 id 部分，
# 讓呼叫端可以只用 scenario id 做白名單。
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
      local id="${value%%:*}"
      if [ "$value" = "$needle" ] || [ "$id" = "$needle" ]; then
        printf '%s\n' "$value"
        break
      fi
    done
  done
}
