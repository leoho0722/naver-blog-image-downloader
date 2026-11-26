// prompts.mjs：送給模型的提示詞（審查指示、檔案總覽與彙整請求）。
//
// 審查面向與嚴重程度沿用改版前 pr-ai-review.yml 的提示詞；輸出改為結構化的 JSON，
// script 才能把意見標在程式碼行上、合併各段結果，並由 script 自己計算整體結論。

/** 檔案分類在總覽中的說明 */
export const CATEGORY_LABELS = {
  reviewed: '送審',
  generated: '已略過（自動產生）',
  deleted: '已刪除（只列出，不附內容）',
  binary: '二進位（只列出，不附內容）',
};

/** 變更類型在總覽中的說明 */
const STATUS_LABELS = {
  added: '新增',
  modified: '修改',
  renamed: '更名',
  deleted: '刪除',
};

/** 模型輸出中 severity 的意思，與發布時的標籤一致 */
export const SEVERITY_LABELS = {
  blocker: '🔴 阻擋合併',
  warning: '🟡 建議修正',
  nit: '🟢 可選優化',
};

/** 整體結論的說明 */
// 整體結論與「會不會擋合併」一致（見 findings.mjs 的 computeVerdict）
export const VERDICT_LABELS = {
  blocker: '🔴 有阻擋合併的問題',
  incomplete: '⚠️ 審查不完整',
  changes_suggested: '🟡 有建議修正的問題',
  no_concerns: '🟢 沒有擋合併的問題',
};

const REVIEW_INSTRUCTIONS = `你是本 monorepo 的資深 code reviewer。請審查下方「本段 patch」中的變更，涵蓋：
1. 正確性：邏輯錯誤、邊界條件、race condition、資料一致性
2. 安全性：OWASP top 10、敏感資料處理、權限邊界
3. 可維護性：命名、模組邊界、重複程式碼、測試覆蓋
4. 專案規範：是否違反 root CLAUDE.md 與 apps/<component>/CLAUDE.md 裡的規則（註解正體中文、Conventional Commits、架構分層、版號管理）
5. 效能：明顯的 N+1、不必要的 allocation、阻塞主執行緒

審查範圍：
- 這個 PR 依檔案的相關性分成多段審查。「檔案總覽」列出本段的檔案，以及刪除、二進位與其他段落的檔案（檔案很多時只列出一部分，並附上沒有列出的數量）；自動產生的檔案只寫數量。請只對「本段 patch」中的內容提出意見，其他段落會另外審查。
- 總覽中標為「已刪除」「二進位」的檔案與自動產生的檔案沒有附上內容，不要對它們的內容下結論；但可以指出可疑的刪除，例如整個測試檔或安全檢查被移除。
- 標示「這個檔案超過每段的行數上限」的檔案只附上前段，不要對沒附上的部分下結論。

行號：
- patch 每行前面「|」左邊的數字，是該行在新檔案中的行號；刪除的行沒有行號。
- 意見對應到特定的行時，line 填那個行號，而且必須是本段 patch 中出現的行號；不對應到特定的行時填 null。
- path 填本段 patch 中的檔案；severity 是 blocker 或 warning 的意見一定要填本段的檔案，才能以留言擋住合併。

輸出格式：
- 所有文字以正體中文撰寫，body 可以使用 Markdown。
- 回答只包含一個 \`\`\`json 區塊，不要輸出其他文字。格式如下：

\`\`\`json
{
  "summary": "2-3 句總評：整體判斷與主要風險",
  "verdict": "blocker | changes_suggested | no_concerns",
  "findings": [
    {
      "path": "apps/web/src/example.ts",
      "line": 42,
      "severity": "blocker | warning | nit",
      "title": "一句話說明問題",
      "body": "問題的細節、影響與建議的修正方式"
    }
  ]
}
\`\`\`

- verdict：blocker 表示有阻擋合併的問題；changes_suggested 表示有建議修正的問題；no_concerns 表示沒有問題或只有可選優化。
- severity：blocker 是 ${SEVERITY_LABELS.blocker}，warning 是 ${SEVERITY_LABELS.warning}，nit 是 ${SEVERITY_LABELS.nit}。
  - blocker 與 warning 會留下討論串，修正或由人確認之前會擋住合併；nit 只列在 review 本文，不擋合併。
  - 只有確實需要修正的問題才標 warning；風格、命名等可有可無的建議標 nit。
- 沒有任何意見時，findings 是空陣列。`;

/** 總覽中「其他檔案」最多列出的筆數（估計值，見 design「精簡每段的檔案總覽」） */
export const OVERVIEW_OTHER_LIMIT = 100;

/**
 * 產生某一段的檔案總覽（見 design「精簡每段的檔案總覽」）：
 * - 本段的檔案全部列出
 * - 其他檔案依序列出刪除的、二進位的、其他段落的，最多 limit 筆；超過時加一行，依段落與分類列出沒有列出的數量
 * - 自動產生的檔案只寫數量
 * 總覽的大小因此只隨本段的檔案數增加，不會因為 PR 的檔案很多而讓每一段的提示詞都變得很大。
 *
 * @param {Array<{ path: string, oldPath: string | null, status: string, category: string, chunk: number | null, truncated: boolean }>} files
 * @param {number} chunkIndex 這是第幾段
 * @param {number} [limit] 其他檔案最多列出的筆數
 * @returns {string}
 */
export function renderOverview(files, chunkIndex, limit = OVERVIEW_OTHER_LIMIT) {
  const describe = (file) => {
    const parts = [STATUS_LABELS[file.status] ?? file.status, CATEGORY_LABELS[file.category] ?? file.category];
    if (file.chunk !== null) {
      parts.push(`第 ${file.chunk} 段`);
    }
    if (file.truncated) {
      parts.push('只附前段（超過每段上限）');
    }
    const renamed = file.oldPath ? `（更名自 ${file.oldPath}）` : '';
    return `- ${file.path}${renamed}：${parts.join('，')}`;
  };
  const own = files.filter((file) => file.chunk === chunkIndex);
  // 刪除的檔案排在最前面，讓模型仍能指出可疑的刪除（例如整個測試檔被移除）
  const others = [
    ...files.filter((file) => file.category === 'deleted'),
    ...files.filter((file) => file.category === 'binary'),
    ...files.filter((file) => file.category === 'reviewed' && file.chunk !== chunkIndex),
  ];
  const generated = files.filter((file) => file.category === 'generated').length;

  const lines = ['本段的檔案：', ...own.map(describe)];
  if (others.length > 0) {
    lines.push('', '其他檔案：', ...others.slice(0, limit).map(describe));
  }
  const omitted = others.slice(limit);
  if (omitted.length > 0) {
    /** @type {Map<string, number>} */
    const groups = new Map();
    for (const file of omitted) {
      const key = file.chunk !== null ? `第 ${file.chunk} 段` : file.category === 'deleted' ? '刪除的檔案' : '二進位檔案';
      groups.set(key, (groups.get(key) ?? 0) + 1);
    }
    const detail = [...groups].map(([key, count]) => `${key} ${count} 個`).join('、');
    lines.push(`- 另有 ${omitted.length} 個檔案沒有列出：${detail}`);
  }
  if (generated > 0) {
    lines.push('', `已略過的自動產生檔案：${generated} 個（不附內容，也不列出路徑）`);
  }
  return lines.join('\n');
}

/**
 * 產生一段的審查提示詞。
 *
 * @param {{ index: number, total: number, overview: string, patch: string, previousThreads?: Array<object> }} input
 *   index：第幾段；total：總段數；overview：這一段的 renderOverview 結果；patch：這一段標註後的 patch；
 *   previousThreads：這一段要請模型判斷是否已修正的上一輪討論串（見 renderPreviousThreads）
 * @returns {string}
 */
export function renderChunkPrompt({ index, total, overview, patch, previousThreads = [] }) {
  const sections = [
    REVIEW_INSTRUCTIONS,
    '',
    `## 檔案總覽（共 ${total} 段，本段是第 ${index} 段）`,
    '',
    overview,
    '',
  ];
  if (previousThreads.length > 0) {
    sections.push(renderPreviousThreads(previousThreads), '');
  }
  sections.push(`## 本段 patch（第 ${index} 段）`, '', patch, '');
  return sections.join('\n');
}

/** 上一輪留言內容放進提示詞時的長度上限（字元）；只需要讓模型知道是什麼問題 */
const PREVIOUS_COMMENT_LIMIT = 1500;

/**
 * 產生「上一輪仍未解決的意見」區塊：請模型逐一判斷這些問題是否已在本段的程式碼中修正。
 *
 * @param {Array<{ ref: string, path: string, filePath: string, line: number | null, comment: string }>} threads
 *   ref：代號（P1、P2…）；path：討論串記錄的路徑；filePath：這次 diff 中對應的檔案（更名時與 path 不同）；
 *   line：上一輪標記的行號；comment：上一輪的留言內容
 * @returns {string}
 */
export function renderPreviousThreads(threads) {
  const items = threads.map((thread) => {
    const where = thread.line === null ? thread.filePath : `${thread.filePath} 第 ${thread.line} 行（上一輪標記時的行號）`;
    const renamed = thread.path === thread.filePath ? '' : `（原路徑 ${thread.path}）`;
    const comment =
      thread.comment.length > PREVIOUS_COMMENT_LIMIT ? `${thread.comment.slice(0, PREVIOUS_COMMENT_LIMIT)}…` : thread.comment;
    // 留言內容可能含有反引號，fence 要比內容中最長的連續反引號更長
    const longest = Math.max(0, ...(comment.match(/`+/g) ?? []).map((run) => run.length));
    const fence = '`'.repeat(Math.max(3, longest + 1));
    return [`### ${thread.ref}｜${where}${renamed}`, '', fence, comment, fence].join('\n');
  });
  return [
    '## 上一輪仍未解決的意見（本段的檔案）',
    '',
    '以下是之前的 AI 審查留下、還沒有 resolve 的意見。請依本段 patch 的程式碼逐一判斷問題是否已經修正，結果寫在 JSON 的 previousThreads，每個代號都要回報：',
    '- 已修正：fixed 為 true，note 用一句話說明怎麼修正的',
    '- 仍然存在或無法判斷：fixed 為 false，note 說明原因',
    '- 仍然存在的問題不要再列進 findings，避免重複',
    '',
    'previousThreads 的格式：`"previousThreads": [{ "ref": "P1", "fixed": true, "note": "一句話說明" }]`，和 summary、verdict、findings 放在同一個 JSON 物件中。',
    '',
    items.join('\n\n'),
  ].join('\n');
}

const SYNTHESIS_INSTRUCTIONS = `你是本 monorepo 的資深 code reviewer。這個 PR 依檔案的相關性分成多段審查，下面是各段的結論、總評與意見清單（不含程式碼）。請寫出整份 PR 的總評與最終結論。

要求：
- 程式依各段結果計算出的整體結論已經寫在下方，你的總評與最終結論必須與它一致，不可以改判。
- 總評 3-5 句：整體判斷、最重要的風險，以及各段之間相關的問題（例如同一個問題出現在多段）。
- 最終結論 1 句。
- 所有文字以正體中文撰寫。
- 回答只包含一個 \`\`\`json 區塊，不要輸出其他文字，格式如下：

\`\`\`json
{ "summary": "整份 PR 的總評", "conclusion": "最終結論" }
\`\`\``;

/**
 * 產生彙整請求的提示詞：只附各段的結論、總評與意見清單，不附程式碼。
 *
 * @param {{ verdict: string, chunks: Array<{ index: number, files: string[], ok: boolean, error?: string, value?: { summary: string, verdict: string, findings: Array<{ path: string, line: number | null, severity: string, title: string }> } }> }} input
 *   verdict：程式計算的整體結論；chunks：每一段的結果（ok 為 false 表示這一段失敗）
 * @returns {string}
 */
export function renderSynthesisPrompt({ verdict, chunks, openThreadCount = 0 }) {
  const sections = chunks.map((chunk) => {
    const header = `## 第 ${chunk.index} 段（檔案：${chunk.files.join('、')}）`;
    if (!chunk.ok) {
      return `${header}\n\n這一段審查失敗，沒有結果：${chunk.error}`;
    }
    const findings = chunk.value.findings.length
      ? chunk.value.findings
          .map((finding) => {
            const location = finding.line === null ? finding.path : `${finding.path}:${finding.line}`;
            return `- ${SEVERITY_LABELS[finding.severity]}｜${finding.title}（${location}）`;
          })
          .join('\n')
      : '- （沒有意見）';
    return [
      header,
      '',
      `結論：${chunk.value.verdict}`,
      '',
      `總評：${chunk.value.summary}`,
      '',
      '意見：',
      findings,
    ].join('\n');
  });
  return [
    SYNTHESIS_INSTRUCTIONS,
    '',
    `## 程式計算的整體結論：${VERDICT_LABELS[verdict] ?? verdict}`,
    '',
    ...(openThreadCount > 0
      ? [`另有 ${openThreadCount} 則上一輪留下、這一輪仍未收掉的 🔴／🟡 意見，已計入整體結論。`, '']
      : []),
    sections.join('\n\n'),
    '',
  ].join('\n');
}
