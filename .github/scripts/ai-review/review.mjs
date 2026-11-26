// review.mjs：讀取各段的審查結果，組出要發布到 PR 的 review，並算出這一輪的審查結果。
//
// 產出：
// - review.json：含 inline comment 的 REST request body（POST /repos/{owner}/{repo}/pulls/{n}/reviews）
// - review-body-only.json：不含 inline comment、全部意見放進本文的版本（inline 版被拒時改用）
// - file-comments.json：review.json 發布後要另外送出的檔案層級留言（🔴／🟡 但不能標在行上的意見）
// - file-comments-fallback.json：改發 review-body-only.json 時要送出的檔案層級留言（全部路徑在 diff 內的 🔴／🟡）
// - summary.md：未截斷、含全部意見的完整本文，寫進 workflow 的 job summary
// - outcome.json：整體結論、失敗段落、警告，以及發布後要回覆並收掉的上一輪討論串（threadActions）

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { BLOCKING_SEVERITIES, computeVerdict, mergeFindings, parseChunkResult, parseSynthesisResult, routeFindings } from './findings.mjs';
import { SEVERITY_LABELS, VERDICT_LABELS } from './prompts.mjs';
import {
  COMMENT_LIMIT,
  fenceRawAnswer,
  fitReviewBody,
  closeOpenFences,
  sanitizeModelText,
  toInlineCode,
  toSingleLine,
  truncateComment,
  truncateUtf8,
} from './text.mjs';

/** review 本文開頭的識別標記 */
export const REVIEW_MARKER = '<!-- lkai-review -->';
/** 每則 inline comment 與檔案層級留言結尾的識別標記；收掉舊討論串時用它辨認 AI 留下的討論串 */
export const COMMENT_MARKER = '<!-- lkai-review-comment -->';
/** 這次 run 的識別標記；inline 版發布失敗時，用它確認是否其實已經發布過 */
export const runMarker = (runId) => `<!-- lkai-review-run: ${runId} -->`;

/** 段數超過這個值時發出警告（預設值，見 design「所有段落都送審，不設段數上限」） */
export const DEFAULT_WARN_CHUNKS = 6;

/** build-review 的輸入錯誤，例如 head SHA 與規劃不一致。呼叫端應以非 0 結束，不發布任何 review。 */
export class ReviewError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ReviewError';
  }
}

/**
 * @typedef {object} ChunkResult
 * @property {number} index 段落編號
 * @property {string[]} files 這一段的檔案
 * @property {boolean} ok 是否取得有效的審查結果
 * @property {string} [error] 失敗原因
 * @property {string} raw 模型的原始回答（失敗時放進摺疊區塊）
 * @property {{ summary: string, verdict: string, findings: Array<object> }} [value] 解析後的結果
 */

/**
 * 讀取一個檔案；不存在時回傳 null。
 *
 * @param {string} path
 * @returns {string | null}
 */
function readOptional(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : null;
}

/**
 * 讀取各段的 lkai 結果並解析。
 * 每段應有 chunk-<n>.out（lkai 的 stdout）與 chunk-<n>.status（lkai 的退出碼）。
 *
 * @param {{ chunks: Array<{ index: number, files: string[] }> }} plan
 * @param {string} resultsDir
 * @returns {ChunkResult[]}
 */
export function loadChunkResults(plan, resultsDir) {
  return plan.chunks.map((chunk) => {
    const raw = readOptional(join(resultsDir, `chunk-${chunk.index}.out`)) ?? '';
    const statusText = readOptional(join(resultsDir, `chunk-${chunk.index}.status`));
    const base = { index: chunk.index, files: chunk.files, raw };
    if (statusText === null) {
      return { ...base, ok: false, error: '沒有這一段的執行結果（送審可能沒有完成）' };
    }
    const status = statusText.trim();
    if (status === '2') {
      return { ...base, ok: false, error: '回答不完整（達到輸出上限）' };
    }
    if (status !== '0') {
      return { ...base, ok: false, error: `lkai 執行失敗（退出碼 ${status}），原因見 workflow log` };
    }
    const parsed = parseChunkResult(raw);
    return parsed.ok ? { ...base, ok: true, value: parsed.value } : { ...base, ok: false, error: `回答格式不合格：${parsed.error}` };
  });
}

/**
 * 依各段結果與上一輪討論串的處理方式計算整體結論。
 * 彙整提示詞與 review 都用這個結果，兩者的結論一定一致。
 *
 * @param {object} plan plan.json 的內容
 * @param {ChunkResult[]} results
 * @returns {{ verdict: string, findings: Array<object>, threads: ReturnType<typeof planThreadActions> }}
 */
export function summarizeResults(plan, results) {
  const succeeded = results.filter((result) => result.ok);
  const findings = mergeFindings(succeeded.map((result) => result.value.findings));
  const threads = planThreadActions(plan, succeeded);
  const verdict = computeVerdict({
    findings,
    failedChunks: results.length - succeeded.length,
    openThreadSeverities: threads.openThreadSeverities,
  });
  return { verdict, findings, threads };
}

/** 意見的位置文字：`path:line` 或只有 `path` */
const locationOf = (finding) => (finding.line === null ? finding.path : `${finding.path}:${finding.line}`);

/**
 * 本文中「無法標在程式碼行上的意見」的一項。
 *
 * @param {object} finding
 * @param {boolean} [unattached] 是否為路徑不在 diff 內、無法留言的 🔴／🟡；是的話加上 ⚠️ 標示
 * @returns {string}
 */
function bodyItem(finding, unattached = false) {
  const title = sanitizeModelText(toSingleLine(finding.title));
  const detail = closeOpenFences(sanitizeModelText(finding.body))
    .split('\n')
    .map((line) => (line === '' ? '' : `  ${line}`))
    .join('\n');
  // 落到本文的意見，path 可能不是真實檔案（模型可以寫任意文字），一律放進無法跳出的 code span
  const mark = unattached ? '⚠️ ' : '';
  const head = `- ${mark}${SEVERITY_LABELS[finding.severity]}｜**${title}**（${toInlineCode(locationOf(finding))}）`;
  return detail.trim() === '' ? head : `${head}\n\n${detail}`;
}

/**
 * inline comment 與檔案層級留言的內文。內容先截斷再補上識別標記，標記一定會留著。
 *
 * @param {object} finding
 * @param {string} [extraMarker] 放在識別標記之前的其他標記（檔案層級留言放這次 run 的標記）
 * @returns {string}
 */
function commentBody(finding, extraMarker = '') {
  const content = `**${SEVERITY_LABELS[finding.severity]}｜${sanitizeModelText(toSingleLine(finding.title))}**\n\n${closeOpenFences(sanitizeModelText(finding.body))}`;
  const suffix = extraMarker ? `\n\n${extraMarker}\n${COMMENT_MARKER}` : `\n\n${COMMENT_MARKER}`;
  return `${truncateComment(content, COMMENT_LIMIT - suffix.length)}${suffix}`;
}

/**
 * 以檔案清單產生摺疊區塊；清單為空時回傳空字串。
 *
 * @param {string} title
 * @param {string[]} paths
 * @returns {string}
 */
function fileListBlock(title, paths) {
  if (paths.length === 0) {
    return '';
  }
  return [`<details>`, `<summary>${title}（${paths.length} 個）</summary>`, '', ...paths.map((path) => `- ${toInlineCode(path)}`), '', `</details>`].join('\n');
}

/**
 * 組出 review 的本文、inline comment、檔案層級留言、job summary 與 outcome。
 *
 * @param {object} input
 * @param {object} input.plan plan.json 的內容
 * @param {ChunkResult[]} input.results loadChunkResults 的結果
 * @param {string | null} input.synthesisRaw 彙整請求的原始回答；沒有送彙整請求或沒有結果時為 null
 * @param {string} input.headSha workflow 給的 PR head SHA，必須與 plan.headSha 相同
 * @param {string} input.runId 這次 run 的識別字串
 * @param {number} [input.warnChunks] 段數超過這個值時發出警告
 * @param {string} [input.modelLabel] 標題中顯示的供應商與模型
 * @returns {{ review: object, bodyOnly: object, fileComments: Array<{ path: string, body: string }>, fallbackFileComments: Array<{ path: string, body: string }>, summaryMarkdown: string, outcome: object }}
 *   fileComments：review 發布後要送的檔案層級留言；fallbackFileComments：改發 bodyOnly 時要送的檔案層級留言
 */
export function buildReview({ plan, results, synthesisRaw, headSha, runId, warnChunks = DEFAULT_WARN_CHUNKS, modelLabel }) {
  if (typeof headSha !== 'string' || headSha !== plan.headSha) {
    throw new ReviewError(`head SHA（${headSha}）與規劃時的 head SHA（${plan.headSha}）不一致，不發布 review，避免 inline comment 對到錯的 commit`);
  }
  if (typeof runId !== 'string' || runId.trim() === '') {
    throw new ReviewError('沒有提供 run ID');
  }

  const warnings = [];
  const notes = [];
  const { verdict, findings, threads } = summarizeResults(plan, results);
  const { threadActions, threadSummary, notFixedThreads } = threads;
  const succeeded = results.filter((result) => result.ok);
  const failed = results.filter((result) => !result.ok);

  if (plan.chunks.length > warnChunks) {
    const message = `這個 PR 分成 ${plan.chunks.length} 段審查，超過 ${warnChunks} 段；所有段落仍已審查，但建議把 PR 拆小，審查會更準確、費用也較低。`;
    warnings.push(message);
    notes.push(`> ⚠️ ${message}`);
  }

  // 總評：多段時用彙整結果；只有一段時用那一段的總評；全部失敗或沒有可審查內容時另外說明
  let summary = '';
  let conclusion = null;
  if (plan.chunks.length === 0) {
    summary = '這個 PR 沒有可以審查的變更：所有檔案都是自動產生、已刪除或二進位的檔案。';
  } else if (succeeded.length === 0) {
    summary = '沒有任何段落取得有效的審查結果，各段的失敗原因列在下方。';
  } else if (succeeded.length === 1) {
    summary = closeOpenFences(sanitizeModelText(succeeded[0].value.summary));
  } else {
    const parsed = synthesisRaw === null ? null : parseSynthesisResult(synthesisRaw);
    if (parsed?.ok) {
      summary = closeOpenFences(sanitizeModelText(parsed.value.summary));
      conclusion = closeOpenFences(sanitizeModelText(parsed.value.conclusion));
    } else {
      const reason = parsed ? parsed.error : '沒有彙整結果';
      warnings.push(`彙整總評失敗（${reason}），改列各段的總評`);
      summary = succeeded.map((result) => `- 第 ${result.index} 段：${sanitizeModelText(toSingleLine(result.value.summary))}`).join('\n');
    }
  }

  if (plan.gitattributesChanged) {
    notes.push('> ℹ️ 這個 PR 修改了 `.gitattributes`；本次仍以 base commit 的 `.gitattributes` 判斷哪些是自動產生的檔案，新的規則要等合併後才會生效。');
  }

  // 意見分流以「產生這項意見的那一段」為準：模型只看得到本段的內容，對其他段的檔案只看過總覽，
  // 就算給了剛好落在可留言行內的行號，也只是猜測，所以不發成 inline comment。
  // 🔴／🟡 不能標在行上時改發檔案層級留言，🟢 只列在本文（見 design「依嚴重程度決定意見是否擋合併」）
  const diffPaths = plan.files.map((file) => file.path);
  const routed = succeeded.map((result) =>
    routeFindings(result.value.findings, { commentable: plan.commentable, reviewedPaths: result.files, diffPaths }),
  );
  const inline = mergeFindings(routed.map((entry) => entry.inline));
  const fileLevel = mergeFindings(routed.map((entry) => entry.fileLevel));
  // 路徑不在 diff 內的 🔴／🟡：無法留言，只能列在本文並標示不會擋合併
  const unattached = new Set(routed.flatMap((entry) => entry.body).filter((finding) => BLOCKING_SEVERITIES.includes(finding.severity)));
  const nonInline = mergeFindings(routed.map((entry) => [...entry.fileLevel, ...entry.body]));
  // 改發只有本文的版本時，所有路徑在 diff 內的 🔴／🟡 都改發檔案層級留言，讓它們仍然擋合併
  const inDiff = new Set(diffPaths);
  const fallbackFileLevel = findings.filter((finding) => BLOCKING_SEVERITIES.includes(finding.severity) && inDiff.has(finding.path));

  const skipped = plan.files.filter((file) => file.category === 'generated').map((file) => file.path);
  const listed = plan.files.filter((file) => file.category === 'deleted' || file.category === 'binary').map((file) => file.path);
  const truncatedFiles = plan.files.filter((file) => file.truncated).map((file) => file.path);
  const reviewedCount = plan.files.filter((file) => file.category === 'reviewed').length;

  const title = modelLabel ? `### 🤖 LKAIKit Review（${modelLabel}）` : '### 🤖 LKAIKit Review';
  const headSections = [
    `${REVIEW_MARKER}\n${runMarker(runId)}`,
    ...notes,
    title,
    `**整體結論：${VERDICT_LABELS[verdict]}**`,
    `#### 總評\n\n${summary}`,
  ];
  if (conclusion) {
    headSections.push(`#### 最終結論\n\n${conclusion}`);
  }
  if ((plan.previousThreads ?? []).length > 0) {
    const lines = [
      `- 確認已修正並收掉：${threadSummary.fixed} 則`,
      `- 仍未修正或沒有判斷（維持未 resolve）：${threadSummary.notFixed} 則${
        notFixedThreads.length > 0 ? `（${notFixedThreads.map(toInlineCode).join('、')}）` : ''
      }`,
      `- 檔案已沒有可審查的變更而收掉：${threadSummary.noLongerChanged} 則`,
      `- 這一輪沒有重新審查而維持不動：${threadSummary.kept} 則`,
      `- 🟢 可選優化不擋合併而收掉：${threadSummary.nit} 則`,
    ];
    headSections.push(`#### 上一輪意見的追蹤\n\n${lines.join('\n')}`);
  }
  if (failed.length > 0) {
    // 失敗原因可能含有模型原文（JSON.parse 的錯誤訊息會引用一段輸入），清理後才放進本文
    const reason = (result) => sanitizeModelText(result.error.replace(/\s*[\r\n]+\s*/g, ' '));
    const lines = failed.map((result) => `- 第 ${result.index} 段（${result.files.map(toInlineCode).join('、')}）：${reason(result)}`);
    headSections.push(`#### 審查失敗的段落\n\n${lines.join('\n')}`);
  }
  const scope = [`送審 ${reviewedCount} 個檔案，分成 ${plan.chunks.length} 段。`];
  if (truncatedFiles.length > 0) {
    scope.push(`以下檔案超過每段上限，只審查了前段：${truncatedFiles.map(toInlineCode).join('、')}`);
  }
  headSections.push(
    [`#### 審查範圍`, '', scope.join('\n'), fileListBlock('已略過的自動產生檔案', skipped), fileListBlock('只列出、不審查內容的刪除或二進位檔案', listed)]
      .filter((part) => part !== '')
      .join('\n\n'),
  );

  const rawAnswers = failed
    .filter((result) => result.raw.trim() !== '')
    .map((result) => fenceRawAnswer(result.raw, `第 ${result.index} 段的原始回答`));

  const assemble = (nonInlineFindings, extraNote) => {
    const head = headSections.slice();
    if (extraNote) {
      head.splice(1, 0, extraNote);
    }
    return {
      head: head.join('\n\n'),
      nonInlineHeading: nonInlineHeading(nonInlineFindings, unattached),
      nonInline: nonInlineFindings.map((finding) => bodyItem(finding, unattached.has(finding))),
      rawAnswers,
      tail: '',
    };
  };

  const inlineParts = assemble(nonInline, null);
  const bodyOnlyParts = assemble(findings, '> ⚠️ inline comment 無法發布，所有意見改列在本文。');

  const inlineBody = fitReviewBody(inlineParts);
  const bodyOnlyBody = fitReviewBody(bodyOnlyParts);
  if (inlineBody.truncated || bodyOnlyBody.truncated) {
    warnings.push('review 本文超過 GitHub 的長度上限，已截斷；完整內容寫在這次 workflow run 的 job summary');
  }

  // job summary 放未截斷、含全部意見的版本；不帶「inline comment 無法發布」的提示，那只適用於改發本文版的情況
  const fullBody = fitReviewBody(assemble(findings, null), Number.MAX_SAFE_INTEGER).body;
  const summaryMarkdown = truncateUtf8(fullBody).text;

  const review = {
    commit_id: plan.headSha,
    event: 'COMMENT',
    body: inlineBody.body,
    comments: inline.map((finding) => ({ path: finding.path, line: finding.line, side: 'RIGHT', body: commentBody(finding) })),
  };
  const bodyOnly = { commit_id: plan.headSha, event: 'COMMENT', body: bodyOnlyBody.body };
  // 檔案層級留言是逐則另外送出的，內文帶著這次 run 的標記：請求失敗時，用它確認留言是否其實已經發布
  const toFileComment = (finding) => ({ path: finding.path, body: commentBody(finding, runMarker(runId)) });
  const fileComments = fileLevel.map(toFileComment);
  const fallbackFileComments = fallbackFileLevel.map(toFileComment);

  const outcome = {
    verdict,
    failedChunks: failed.map((result) => result.index),
    warnings,
    inlineCount: inline.length,
    bodyOnlyCount: findings.length,
    fileCommentCount: fileComments.length,
    threadActions,
    threadSummary,
  };
  return { review, bodyOnly, fileComments, fallbackFileComments, summaryMarkdown, outcome };
}

/**
 * 「無法標在程式碼行上的意見」的標題與說明：只說明清單中實際出現的情況。
 *
 * @param {object[]} findings 清單中的意見
 * @param {Set<object>} unattached 路徑不在 diff 內的 🔴／🟡
 * @returns {string}
 */
function nonInlineHeading(findings, unattached) {
  const notes = [];
  if (findings.some((finding) => BLOCKING_SEVERITIES.includes(finding.severity) && !unattached.has(finding))) {
    notes.push('🔴／🟡 的意見另外以檔案層級留言發布，resolve 前會擋合併。');
  }
  if (findings.some((finding) => !BLOCKING_SEVERITIES.includes(finding.severity))) {
    notes.push('🟢 可選優化只列在這裡，不擋合併。');
  }
  if (findings.some((finding) => unattached.has(finding))) {
    notes.push('標示 ⚠️ 的意見找不到對應的檔案，無法留言，不會擋合併，請人工判斷。');
  }
  return notes.length === 0 ? '#### 無法標在程式碼行上的意見' : `#### 無法標在程式碼行上的意見\n\n${notes.join('')}`;
}

/** 回覆中模型說明的長度上限（字元） */
const REPLY_NOTE_LIMIT = 1000;

/**
 * 依規劃時的分類與各段模型的判斷，決定上一輪的 AI 討論串要不要收掉
 * （見 design「由 AI 確認已修正後才收掉上一輪的討論串」）：
 * - ask：只有在那一段送審成功、而且那一段的模型回報 fixed 為 true 時才收掉
 * - no-longer-changed、deleted：檔案已沒有可審查的變更，直接收掉
 * - nit：🟢 可選優化不擋合併，直接收掉
 * - keep，或 ask 但那一段失敗：維持不動
 * 模型回報的代號必須屬於它自己那一段，其他段的代號一律忽略。
 * openThreadSeverities 是這一輪不會收掉的討論串的嚴重程度，計入整體結論。
 *
 * @param {object} plan
 * @param {ChunkResult[]} succeeded 送審成功的段落
 * @returns {{ threadActions: Array<{ id: string, reason: string, reply: string }>, threadSummary: { fixed: number, notFixed: number, noLongerChanged: number, kept: number, nit: number }, notFixedThreads: string[], openThreadSeverities: string[] }}
 */
export function planThreadActions(plan, succeeded) {
  const shortSha = plan.headSha.slice(0, 7);
  const previous = plan.previousThreads ?? [];
  const succeededChunks = new Set(succeeded.map((result) => result.index));

  /** @type {Map<string, { fixed: boolean, note: string }>} */
  const judgements = new Map();
  for (const result of succeeded) {
    for (const judgement of result.value.previousThreads ?? []) {
      const thread = previous.find((entry) => entry.ref === judgement.ref);
      if (thread && thread.disposition === 'ask' && thread.chunk === result.index) {
        judgements.set(judgement.ref, judgement);
      }
    }
  }

  const threadActions = [];
  const threadSummary = { fixed: 0, notFixed: 0, noLongerChanged: 0, kept: 0, nit: 0 };
  const notFixedThreads = [];
  const openThreadSeverities = [];
  for (const thread of previous) {
    if (thread.disposition === 'nit') {
      threadSummary.nit += 1;
      threadActions.push({
        id: thread.id,
        reason: 'nit',
        reply: `✅ 🟢 可選優化不擋合併，收掉這則討論串（${shortSha}）；需要時仍可展開查看。`,
      });
      continue;
    }
    if (thread.disposition === 'no-longer-changed' || thread.disposition === 'deleted') {
      threadSummary.noLongerChanged += 1;
      const what = thread.disposition === 'deleted' ? '已在最新的變更中刪除' : '在最新的變更中已沒有可審查的內容';
      threadActions.push({
        id: thread.id,
        reason: thread.disposition,
        reply: `✅ 這個檔案${what}（${shortSha}），收掉這則意見。`,
      });
      continue;
    }
    if (thread.disposition !== 'ask' || !succeededChunks.has(thread.chunk)) {
      threadSummary.kept += 1;
      openThreadSeverities.push(thread.severity ?? 'warning');
      continue;
    }
    const judgement = judgements.get(thread.ref);
    if (judgement?.fixed) {
      threadSummary.fixed += 1;
      const note = sanitizeModelText(toSingleLine(judgement.note)).slice(0, REPLY_NOTE_LIMIT).trim();
      threadActions.push({
        id: thread.id,
        reason: 'fixed',
        reply: `✅ 新一輪 AI 審查（${shortSha}）確認這個問題已修正${note ? `：${note}` : '。'}`,
      });
    } else {
      threadSummary.notFixed += 1;
      notFixedThreads.push(thread.line === null ? thread.filePath : `${thread.filePath}:${thread.line}`);
      openThreadSeverities.push(thread.severity ?? 'warning');
    }
  }
  return { threadActions, threadSummary, notFixedThreads, openThreadSeverities };
}
