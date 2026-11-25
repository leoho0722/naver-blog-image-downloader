#!/usr/bin/env bash
# lkai-helpers.sh：呼叫 LKAIKit 的 lkai 與把 AI 文字印到 log 的共用函式。
# 以 source 載入後使用，不直接執行：
#   source "$GITHUB_WORKSPACE/.github/scripts/lkai-helpers.sh"
#
# 使用前要先執行 .github/actions/setup-lkai（建置 lkai 並加進 PATH），並設定：
#   LKAI_PROVIDER、LKAI_MODEL   要用的供應商與模型（setup-lkai 的輸出）
#   LKAI_*_API_KEY             所選供應商的 API 金鑰，由 lkai 自己讀取；這裡不讀、不印、不放進引數
#
# 寫法的限制：macOS runner（xcode-27）的 bash 是 3.2。bash 3.2 會把緊接在變數後面的中文或全形標點
# 當成變數名稱的一部分，所以變數後面緊接著這類字元時一定要寫成 ${名稱}。

# print_untrusted_text <文字>：把 AI 寫的文字（回答、lkai 轉述的錯誤訊息）印到 log。
# 在 GitHub Actions 中，前後各加一行 ::stop-commands::<token> 與 ::<token>::，文字裡就算出現
# ::error:: 之類的 workflow command 也不會被執行。token 每次隨機產生，AI 猜不到，無法提早結束保護。
# 呼叫端要把整個輸出導到同一個流（stdout 或 stderr），標記才會和文字留在一起。
print_untrusted_text() {
  local token
  if [ "${GITHUB_ACTIONS:-}" != "true" ]; then
    printf '%s\n' "$1"
    return 0
  fi
  token="$(od -An -N16 -tx1 /dev/urandom | tr -d ' \n')" || token=""
  if ! [[ "$token" =~ ^[0-9a-f]{32}$ ]]; then
    echo "::error::無法產生保護 AI 文字用的隨機 token，所以不印出 AI 的文字"
    return 1
  fi
  printf '::stop-commands::%s\n' "$token"
  printf '%s\n' "$1"
  printf '::%s::\n' "$token"
}

# ask_lkai <提示詞檔案> <回答輸出檔案> [lkai 的其他選項...]
# 以 LKAI_PROVIDER、LKAI_MODEL 送出一次對話請求，回答寫進輸出檔案；lkai 的訊息（stderr）
# 經 print_untrusted_text 印到 log，因為模型拒答時，裡面會有模型自己寫的文字。
# 提示詞檔案的副檔名必須是 .txt 或 .md（lkai 的限制）。
# 回傳 lkai 的退出碼：
#   0   成功，輸出檔案是完整的回答
#   1   服務回報錯誤、逾時或回應無法解讀，輸出檔案是空的
#   2   回答不完整（例如達到輸出上限），輸出檔案是已經收到的部分
#   64  命令列的輸入不合法
ask_lkai() {
  local prompt_file="$1" output_file="$2" stderr_file status=0
  shift 2
  stderr_file="${output_file}.err"
  lkai --provider "$LKAI_PROVIDER" --model "$LKAI_MODEL" --prompt-file "$prompt_file" \
    --output-language zh-TW "$@" >"$output_file" 2>"$stderr_file" || status=$?
  if [ -s "$stderr_file" ]; then
    # 印不出來（產生不了 token）時已經寫了錯誤訊息；原本的退出碼照常回傳
    print_untrusted_text "$(cat "$stderr_file")" >&2 || true
  fi
  return "$status"
}
