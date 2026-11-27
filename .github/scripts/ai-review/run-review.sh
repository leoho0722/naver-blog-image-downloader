#!/usr/bin/env bash
# run-review.sh：PR AI 審查的流程控制，由 .github/workflows/pr-ai-review.yml 分三個 step 呼叫。
#
# 用法：bash run-review.sh <collect | plan | review | publish>
#   collect  收集上一輪仍未 resolve 的 AI 討論串，寫出 threads.json（需要 GH_TOKEN）
#   plan     fetch base commit，產生 diff、替檔案分類並切段，並把要判斷的討論串放進提示詞（ai-review.mjs plan）
#   review   分批送審每一段、需要時送彙整請求，最後組出要發布的 review（ai-review.mjs build-review）
#   publish  發布 review（被拒時改發只有本文的版本）與檔案層級留言，對要收掉的討論串回覆並 resolve，並判定結果（需要 GH_TOKEN）
#
# 環境變數：
#   BASE_SHA、HEAD_SHA            PR 的 base 與 head commit（head 必須是 PR head，不是 merge commit）
#   PR_NUMBER、REPO               PR 編號與 owner/name
#   GH_TOKEN                      gh 使用的 token，只有 collect 與 publish 需要（這個 script 不讀、不印）
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
# collect
# ---------------------------------------------------------------------------

# 收集上一輪仍未 resolve 的 AI 討論串：第一則留言是 github-actions 寫的，而且含有識別標記。
# 寫出 threads.json：[{ id, path, line, comment, commit }]，line 優先用目前的行號，討論串已過時則用原本的行號；
# 檔案層級的討論串沒有行號，寫成 null（GraphQL 對它回傳的 line 是 1，不能直接使用）。
# commit 是第一則留言建立時的 commit，規劃時用來判斷刪除檔案上的討論串是不是在講「刪除這件事」。
# 查詢失敗時只發出警告並寫出空清單，這一輪不收掉任何討論串，審查照常進行。
command_collect() {
  rm -rf "$work_dir"
  mkdir -p "$work_dir" || fail "無法建立工作資料夾 ${work_dir}"

  local query
  # shellcheck disable=SC2016  # $owner 等是 GraphQL 變數，不是 shell 變數
  query='query($owner: String!, $name: String!, $number: Int!, $endCursor: String) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      reviewThreads(first: 100, after: $endCursor) {
        pageInfo { hasNextPage endCursor }
        nodes { id isResolved path line originalLine subjectType comments(first: 1) { nodes { author { login } body originalCommit { oid } } } }
      }
    }
  }
}'
  if ! gh api graphql --paginate -f query="$query" -f owner="${REPO%%/*}" -f name="${REPO#*/}" -F number="$PR_NUMBER" \
    >"${work_dir}/threads-raw.json"; then
    warn "查詢上一輪的 AI 討論串失敗，這一輪不收掉任何討論串"
    printf '[]\n' >"${work_dir}/threads.json"
    return 0
  fi
  if ! jq -s --arg marker "$comment_marker" '
      [ .[].data.repository.pullRequest.reviewThreads.nodes[]
        | select(.isResolved | not)
        | select((.comments.nodes[0].author.login // "") == "github-actions")
        | select((.comments.nodes[0].body // "") | contains($marker))
        | { id, path, line: (if .subjectType == "FILE" then null else (.line // .originalLine) end), comment: .comments.nodes[0].body,
            commit: (.comments.nodes[0].originalCommit.oid // null) } ]' \
    "${work_dir}/threads-raw.json" >"${work_dir}/threads.json"; then
    warn "解析上一輪的 AI 討論串失敗，這一輪不收掉任何討論串"
    printf '[]\n' >"${work_dir}/threads.json"
    return 0
  fi
  echo "上一輪仍未 resolve 的 AI 討論串：$(jq 'length' "${work_dir}/threads.json") 個"
}

# ---------------------------------------------------------------------------
# plan
# ---------------------------------------------------------------------------
command_plan() {
  require_positive_integer MAX_CHUNK_LINES "$max_chunk_lines"
  [ -n "${BASE_SHA:-}" ] || fail "沒有 BASE_SHA"
  [ -n "${HEAD_SHA:-}" ] || fail "沒有 HEAD_SHA"

  # 工作資料夾由 collect 建立；這裡只清掉自己與之後步驟的輸出，保留 collect 寫出的 threads.json
  mkdir -p "$work_dir" || fail "無法建立工作資料夾 ${work_dir}"
  rm -rf "$plan_dir" "$results_dir" "$review_dir"

  # base commit 必須在本機；fetch 失敗時仍交給 plan 確認（checkout 時可能已經取得）
  if ! git fetch --no-tags --quiet origin "$BASE_SHA" 2>/dev/null; then
    echo "fetch base commit 失敗，改用本機已有的資料"
  fi
  # 只抓了部分歷史（shallow）時可能找不到共同祖先，先補抓完整歷史；
  # 補抓失敗時仍交給 plan 判斷，找不到共同祖先會以說明原因的訊息失敗
  if [ "$(git rev-parse --is-shallow-repository 2>/dev/null)" = true ]; then
    if git fetch --no-tags --quiet --unshallow origin 2>/dev/null; then
      echo "checkout 只有部分歷史，已補抓完整歷史"
    else
      echo "checkout 只有部分歷史，補抓完整歷史失敗，改用本機已有的資料"
    fi
  fi

  local thread_args=()
  if [ -f "${work_dir}/threads.json" ]; then
    thread_args=(--threads "${work_dir}/threads.json")
  fi
  if ! node "$cli" plan --base "$BASE_SHA" --head "$HEAD_SHA" --out "$plan_dir" --max-chunk-lines "$max_chunk_lines" \
    ${thread_args[@]+"${thread_args[@]}"}; then
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

# 發布 review：先送含 inline comment 的版本；失敗時確認沒有帶著這次 run 標記的 review，
# 才改送只有本文的版本。回傳 0 表示有一個版本已發布，並把發布的版本寫進 published_version：
# inline（含 inline comment 的版本）或 fallback（只有本文的版本）
published_version=""
post_review() {
  if gh api --method POST "repos/${REPO}/pulls/${PR_NUMBER}/reviews" --input "${review_dir}/review.json" >/dev/null; then
    echo "已發布含 inline comment 的 review"
    published_version=inline
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
    published_version=inline
    return 0
  fi

  if gh api --method POST "repos/${REPO}/pulls/${PR_NUMBER}/reviews" --input "${review_dir}/review-body-only.json" >/dev/null; then
    warn "含 inline comment 的 review 發布失敗，已改發只有本文的版本（所有意見列在本文，🔴／🟡 改發檔案層級留言）"
    published_version=fallback
    return 0
  fi
  return 1
}

# 送出一則檔案層級留言：參數為路徑、內文與 commit SHA
post_file_comment() {
  gh api --method POST "repos/${REPO}/pulls/${PR_NUMBER}/comments" \
    -f body="$2" -f commit_id="$3" -f path="$1" -f subject_type=file >/dev/null
}

# 確認 PR 上是否已經有路徑與內文完全相同的留言（請求成功、只是回應沒收到）。
# 檔案層級留言的內文含有這次 run 的標記，所以不會誤認成其他輪的留言。查詢失敗時視為不存在
file_comment_exists() {
  local listing
  listing="$(gh api --paginate "repos/${REPO}/pulls/${PR_NUMBER}/comments?per_page=100")" || return 1
  printf '%s' "$listing" | jq -e -s --arg path "$1" --arg body "$2" \
    '[.[][] | select(.path == $path and .body == $body)] | length > 0' >/dev/null
}

# 逐則送出檔案層級留言（🔴／🟡 但不能標在程式碼行上的意見），讓它們形成討論串、擋住合併。
# 建立 review 的 API 不接受檔案層級的留言，所以 review 發布後另外送（見 design「依嚴重程度決定意見是否擋合併」）。
# 請求失敗時先確認留言是否其實已經發布，沒有才重試一次；仍然失敗時發出 error 並記在 file_comment_failures，
# 由 publish 在最後讓 workflow 失敗：這則意見沒能擋住合併。意見仍列在 review 本文
file_comment_failures=0
post_file_comments() {
  local file="$1" total i path body commit_id posted=0
  [ -f "$file" ] || return 0
  total="$(jq 'length' "$file")" || total=0
  [ "$total" -gt 0 ] || return 0
  commit_id="$(jq -r '.commit_id' "${review_dir}/review.json")"
  i=0
  while [ "$i" -lt "$total" ]; do
    path="$(jq -r ".[${i}].path" "$file")"
    body="$(jq -r ".[${i}].body" "$file")"
    if post_file_comment "$path" "$body" "$commit_id"; then
      posted=$((posted + 1))
    elif file_comment_exists "$path" "$body"; then
      echo "對 ${path} 的檔案層級留言回報失敗，但這則留言已經存在，不重複發布"
      posted=$((posted + 1))
    elif post_file_comment "$path" "$body" "$commit_id"; then
      echo "對 ${path} 的檔案層級留言重試後發布成功"
      posted=$((posted + 1))
    else
      printf '::error::%s\n' "$(escape_command_data "無法對 ${path} 發布檔案層級留言（已重試一次），這則 🔴／🟡 意見不會擋合併，仍列在 review 本文")"
      file_comment_failures=$((file_comment_failures + 1))
    fi
    i=$((i + 1))
  done
  echo "已發布檔案層級留言 ${posted} 則（預計 ${total} 則）"
}

# 依 outcome.json 的 threadActions，對每個討論串先回覆說明、再標為 resolved。
# threadActions 只包含 AI 確認已修正的討論串，以及檔案已沒有可審查變更的討論串（見 review.mjs 的 planThreadActions）
apply_thread_actions() {
  local outcome="$1" total i id reply resolved=0
  # shellcheck disable=SC2016  # $id、$body 是 GraphQL 變數
  local reply_mutation='mutation($id: ID!, $body: String!) { addPullRequestReviewThreadReply(input: { pullRequestReviewThreadId: $id, body: $body }) { comment { id } } }'
  # shellcheck disable=SC2016
  local resolve_mutation='mutation($id: ID!) { resolveReviewThread(input: { threadId: $id }) { thread { isResolved } } }'
  total="$(jq '.threadActions | length' "$outcome")" || total=0
  i=0
  while [ "$i" -lt "$total" ]; do
    id="$(jq -r ".threadActions[${i}].id" "$outcome")"
    reply="$(jq -r ".threadActions[${i}].reply" "$outcome")"
    if ! gh api graphql -f query="$reply_mutation" -f id="$id" -f body="$reply" >/dev/null; then
      warn "無法回覆 AI 討論串 ${id}，仍會嘗試把它標為 resolved"
    fi
    if gh api graphql -f query="$resolve_mutation" -f id="$id" >/dev/null; then
      resolved=$((resolved + 1))
    else
      warn "無法把 AI 討論串 ${id} 標為 resolved，請手動處理"
    fi
    i=$((i + 1))
  done
  echo "已回覆並收掉 AI 討論串 ${resolved} 個（預計 ${total} 個）"
}

command_publish() {
  local outcome="${review_dir}/outcome.json"
  [ -f "$outcome" ] || fail "找不到 ${outcome}，不發布 review"

  local published=false
  if post_review; then
    published=true
    if [ "$published_version" = fallback ]; then
      post_file_comments "${review_dir}/file-comments-fallback.json"
    else
      post_file_comments "${review_dir}/file-comments.json"
    fi
    apply_thread_actions "$outcome"
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
  if [ "$file_comment_failures" -gt 0 ]; then
    fail "${file_comment_failures} 則檔案層級留言發布失敗，這些 🔴／🟡 意見沒有擋住合併（已列在 review 本文）"
  fi
  echo "審查完成，整體結論：$(jq -r '.verdict' "$outcome")"
}

case "${1:-}" in
  collect) command_collect ;;
  plan) command_plan ;;
  review) command_review ;;
  publish) command_publish ;;
  *) fail "用法：run-review.sh <collect | plan | review | publish>" ;;
esac
