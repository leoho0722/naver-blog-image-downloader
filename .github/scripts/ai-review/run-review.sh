#!/usr/bin/env bash
# run-review.sh：PR AI 審查的流程控制，由 .github/workflows/pr-ai-review.yml 分三個 step 呼叫。
#
# 用法：bash run-review.sh <plan | review | publish>
#   plan     fetch base commit，產生 diff、替檔案分類並切段（ai-review.mjs plan）
#   review   分批送審每一段、需要時送彙整請求，最後組出要發布的 review（ai-review.mjs build-review）
#   publish  收集上一輪 AI 的討論串、發布 review（被拒時改發只有本文的版本）、收掉舊討論串，並判定結果
#
# 環境變數：
#   BASE_SHA、HEAD_SHA            PR 的 base 與 head commit（head 必須是 PR head，不是 merge commit）
#   PR_NUMBER、REPO               PR 編號與 owner/name
#   GH_TOKEN                      gh 使用的 token（這個 script 不讀、不印）
#   LKAI_PROVIDER、LKAI_MODEL     setup-lkai 輸出的供應商與模型；API 金鑰由 lkai 自己讀取
#   MAX_CHUNK_LINES               每段的行數上限（預設 6000）
#   MAX_PARALLEL_CHUNKS           同時送審的段數上限（預設 3）
#   WARN_CHUNKS                   段數超過多少時發出警告（預設 6）
#   AI_REVIEW_WORK_DIR            中間檔案的資料夾（預設 $RUNNER_TEMP/ai-review）
#   GITHUB_RUN_ID、GITHUB_RUN_ATTEMPT、GITHUB_STEP_SUMMARY  GitHub Actions 提供
#
# 寫法的限制：xcode-27 runner 的 bash 是 3.2。變數後面緊接中文或全形標點時一律寫成 ${名稱}；
# 不使用 wait -n、關聯陣列等 bash 4 才有的功能。不依賴 set -e，每個會失敗的指令都明確處理。

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source-path=SCRIPTDIR source=../lkai-helpers.sh
source "${script_dir}/../lkai-helpers.sh"

work_dir="${AI_REVIEW_WORK_DIR:-${RUNNER_TEMP:-/tmp}/ai-review}"
plan_dir="${work_dir}/plan"
results_dir="${work_dir}/results"
review_dir="${work_dir}/review"
cli="${script_dir}/ai-review.mjs"

max_chunk_lines="${MAX_CHUNK_LINES:-6000}"
max_parallel="${MAX_PARALLEL_CHUNKS:-3}"
warn_chunks="${WARN_CHUNKS:-6}"

# 識別標記，必須與 review.mjs 的 COMMENT_MARKER 與 runMarker 一致
comment_marker='<!-- lkai-review-comment -->'
run_id="${GITHUB_RUN_ID:-local}-${GITHUB_RUN_ATTEMPT:-1}"
run_marker="<!-- lkai-review-run: ${run_id} -->"

# escape_command_data <文字>：依 GitHub workflow command 的規則跳脫 % \r \n，
# 讓訊息只會是一行、不會被當成另一個 workflow command
escape_command_data() {
  local text="$1"
  text="${text//%/%25}"
  text="${text//$'\r'/%0D}"
  text="${text//$'\n'/%0A}"
  printf '%s' "$text"
}

warn() {
  printf '::warning::%s\n' "$(escape_command_data "$1")"
}

fail() {
  printf '::error::%s\n' "$(escape_command_data "$1")"
  exit 1
}

require_positive_integer() {
  case "$2" in
    '' | *[!0-9]* | 0*) fail "$1 必須是正整數，目前是「$2」" ;;
  esac
}

# ---------------------------------------------------------------------------
# plan
# ---------------------------------------------------------------------------
command_plan() {
  require_positive_integer MAX_CHUNK_LINES "$max_chunk_lines"
  [ -n "${BASE_SHA:-}" ] || fail "沒有 BASE_SHA"
  [ -n "${HEAD_SHA:-}" ] || fail "沒有 HEAD_SHA"

  rm -rf "$work_dir"
  mkdir -p "$work_dir" || fail "無法建立工作資料夾 ${work_dir}"

  # base commit 必須在本機；fetch 失敗時仍交給 plan 確認（checkout 時可能已經取得）
  if ! git fetch --no-tags --quiet origin "$BASE_SHA" 2>/dev/null; then
    echo "fetch base commit 失敗，改用本機已有的資料"
  fi

  if ! node "$cli" plan --base "$BASE_SHA" --head "$HEAD_SHA" --out "$plan_dir" --max-chunk-lines "$max_chunk_lines"; then
    fail "規劃審查失敗（原因見上方訊息），不送審、不發布、不收掉任何討論串"
  fi
}

# ---------------------------------------------------------------------------
# review
# ---------------------------------------------------------------------------

# 送出第 n 段並記錄退出碼；在背景執行，不印出任何內容
review_chunk() {
  local n="$1" status=0
  run_lkai "${plan_dir}/chunk-${n}.md" "${results_dir}/chunk-${n}.out" --max-output-tokens 32000 --timeout 300 || status=$?
  printf '%s\n' "$status" >"${results_dir}/chunk-${n}.status"
}

command_review() {
  require_positive_integer MAX_PARALLEL_CHUNKS "$max_parallel"
  require_positive_integer WARN_CHUNKS "$warn_chunks"
  [ -f "${plan_dir}/plan.json" ] || fail "找不到規劃結果 ${plan_dir}/plan.json"
  mkdir -p "$results_dir" || fail "無法建立資料夾 ${results_dir}"

  local total
  total="$(jq '.chunks | length' "${plan_dir}/plan.json")" || fail "無法讀取規劃結果"
  echo "共 ${total} 段，每批最多同時送審 ${max_parallel} 段"

  local start=1 end n
  while [ "$start" -le "$total" ]; do
    end=$((start + max_parallel - 1))
    [ "$end" -le "$total" ] || end="$total"
    echo "送審第 ${start} 到第 ${end} 段"
    n="$start"
    while [ "$n" -le "$end" ]; do
      review_chunk "$n" &
      n=$((n + 1))
    done
    wait

    # 整批結束、沒有背景工作在跑時才印出 lkai 的訊息，各段的 ::stop-commands:: 區塊才不會交錯
    n="$start"
    while [ "$n" -le "$end" ]; do
      echo "第 ${n} 段：lkai 退出碼 $(cat "${results_dir}/chunk-${n}.status" 2>/dev/null || echo '（沒有結果）')"
      if [ -s "${results_dir}/chunk-${n}.out.err" ]; then
        print_untrusted_text "$(cat "${results_dir}/chunk-${n}.out.err")" || true
      fi
      n=$((n + 1))
    done
    start=$((end + 1))
  done

  # 兩段以上取得有效結果時才需要彙整
  local synthesis_args=()
  if ! node "$cli" synthesis-prompt --plan "${plan_dir}/plan.json" --results "$results_dir" --out "${work_dir}/synthesis.md"; then
    fail "產生彙整提示詞失敗"
  fi
  if [ -f "${work_dir}/synthesis.md" ]; then
    local synthesis_status=0
    ask_lkai "${work_dir}/synthesis.md" "${work_dir}/synthesis.out" --max-output-tokens 16000 --timeout 300 || synthesis_status=$?
    echo "彙整請求：lkai 退出碼 ${synthesis_status}"
    if [ "$synthesis_status" -eq 0 ]; then
      synthesis_args=(--synthesis "${work_dir}/synthesis.out")
    fi
  fi

  if ! node "$cli" build-review \
    --plan "${plan_dir}/plan.json" \
    --results "$results_dir" \
    ${synthesis_args[@]+"${synthesis_args[@]}"} \
    --head-sha "$HEAD_SHA" \
    --run-id "$run_id" \
    --warn-chunks "$warn_chunks" \
    --model-label "${LKAI_PROVIDER} / ${LKAI_MODEL}" \
    --out "$review_dir"; then
    fail "組裝 review 失敗（原因見上方訊息），不發布、不收掉任何討論串"
  fi
}

# ---------------------------------------------------------------------------
# publish
# ---------------------------------------------------------------------------

# 列出可以收掉的上一輪 AI 討論串 ID：未 resolve、第一則留言是 github-actions 寫的、含識別標記、
# 所在檔案不在 outcome.json 的 keepThreadPaths 內。結果寫到 threads.txt
collect_threads() {
  local query
  # shellcheck disable=SC2016  # $owner 等是 GraphQL 變數，不是 shell 變數
  query='query($owner: String!, $name: String!, $number: Int!, $endCursor: String) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      reviewThreads(first: 100, after: $endCursor) {
        pageInfo { hasNextPage endCursor }
        nodes { id isResolved path comments(first: 1) { nodes { author { login } body } } }
      }
    }
  }
}'
  if ! gh api graphql --paginate -f query="$query" -f owner="${REPO%%/*}" -f name="${REPO#*/}" -F number="$PR_NUMBER" \
    >"${work_dir}/threads.json"; then
    warn "查詢上一輪的 AI 討論串失敗，這次不收掉任何討論串"
    : >"${work_dir}/threads.txt"
    return 0
  fi
  if ! jq -r --arg marker "$comment_marker" --slurpfile outcome "${review_dir}/outcome.json" '
      .data.repository.pullRequest.reviewThreads.nodes[]
      | select(.isResolved | not)
      | select((.comments.nodes[0].author.login // "") == "github-actions")
      | select((.comments.nodes[0].body // "") | contains($marker))
      | select(.path as $path | ($outcome[0].keepThreadPaths | index($path)) | not)
      | .id' "${work_dir}/threads.json" >"${work_dir}/threads.txt"; then
    warn "解析上一輪的 AI 討論串失敗，這次不收掉任何討論串"
    : >"${work_dir}/threads.txt"
  fi
}

# 發布 review：先送含 inline comment 的版本；失敗時確認沒有帶著這次 run 標記的 review，
# 才改送只有本文的版本。回傳 0 表示有一個版本已發布
post_review() {
  if gh api --method POST "repos/${REPO}/pulls/${PR_NUMBER}/reviews" --input "${review_dir}/review.json" >/dev/null; then
    echo "已發布含 inline comment 的 review"
    return 0
  fi

  # 確認這次 run 的 review 是否其實已經發布（請求成功、只是回應沒收到）。
  # 查詢失敗時重試一次；仍然失敗就無法確認，寧可不改發也不要重複發布
  local existing="" listed=false attempt
  for attempt in 1 2; do
    if existing="$(gh api --paginate "repos/${REPO}/pulls/${PR_NUMBER}/reviews" \
      --jq ".[] | select((.body // \"\") | contains(\"${run_marker}\")) | .id")"; then
      listed=true
      break
    fi
    echo "查詢既有的 review 失敗（第 ${attempt} 次）"
  done
  if [ "$listed" != true ]; then
    warn "含 inline comment 的 review 發布失敗，且無法確認是否其實已經發布，為避免重複發布，不改發只有本文的版本"
    return 1
  fi
  if [ -n "$existing" ]; then
    echo "發布請求回報失敗，但這次 run 的 review 已經存在，不重複發布"
    return 0
  fi

  if gh api --method POST "repos/${REPO}/pulls/${PR_NUMBER}/reviews" --input "${review_dir}/review-body-only.json" >/dev/null; then
    warn "含 inline comment 的 review 發布失敗，已改發只有本文的版本（所有意見列在本文）"
    return 0
  fi
  return 1
}

resolve_threads() {
  local id resolved=0
  # shellcheck disable=SC2016  # $id 是 GraphQL 變數
  local mutation='mutation($id: ID!) { resolveReviewThread(input: { threadId: $id }) { thread { isResolved } } }'
  while IFS= read -r id; do
    [ -n "$id" ] || continue
    if gh api graphql -f query="$mutation" -f id="$id" >/dev/null; then
      resolved=$((resolved + 1))
    else
      warn "無法把上一輪的 AI 討論串 ${id} 標為 resolved，請手動處理"
    fi
  done <"${work_dir}/threads.txt"
  echo "已收掉上一輪的 AI 討論串 ${resolved} 個"
}

command_publish() {
  local outcome="${review_dir}/outcome.json"
  [ -f "$outcome" ] || fail "找不到 ${outcome}，不發布 review"

  collect_threads
  echo "上一輪可以收掉的 AI 討論串：$(grep -c . "${work_dir}/threads.txt" || true) 個"

  local published=false
  if post_review; then
    published=true
    resolve_threads
  fi

  if [ -n "${GITHUB_STEP_SUMMARY:-}" ] && [ -f "${review_dir}/summary.md" ]; then
    cat "${review_dir}/summary.md" >>"$GITHUB_STEP_SUMMARY"
  fi

  # outcome.json 的警告可能含有模型文字（例如彙整失敗的原因），一律跳脫後再發出
  local warning
  while IFS= read -r warning; do
    [ -n "$warning" ] && printf '::warning::%s\n' "$warning"
  done < <(jq -r '.warnings[] | gsub("%"; "%25") | gsub("\r"; "%0D") | gsub("\n"; "%0A")' "$outcome")

  if [ "$published" != true ]; then
    fail "review 無法發布，上一輪的 AI 討論串維持原狀"
  fi
  local failed
  failed="$(jq -r '.failedChunks | map(tostring) | join("、")' "$outcome")"
  if [ -n "$failed" ]; then
    fail "第 ${failed} 段審查失敗，review 已發布但內容不完整"
  fi
  echo "審查完成，整體結論：$(jq -r '.verdict' "$outcome")"
}

case "${1:-}" in
  plan) command_plan ;;
  review) command_review ;;
  publish) command_publish ;;
  *) fail "用法：run-review.sh <plan | review | publish>" ;;
esac
