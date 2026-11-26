// review.mjs：讀取各段的審查結果，組出要發布到 PR 的 review，並算出這一輪的審查結果。
//
// 產出：
// - review.json：含 inline comment 的 REST request body（POST /repos/{owner}/{repo}/pulls/{n}/reviews）
// - review-body-only.json：不含 inline comment、全部意見放進本文的版本（inline 版被拒時改用）
// - summary.md：未截斷、含全部意見的完整本文，寫進 workflow 的 job summary
// - outcome.json：整體結論、失敗段落、警告，以及這一輪不收掉舊討論串的檔案（keepThreadPaths）

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { computeVerdict, mergeFindings, parseChunkResult, parseSynthesisResult, routeFindings } from './findings.mjs';
import { SEVERITY_LABELS, VERDICT_LABELS } from './prompts.mjs';
import {
  COMMENT_LIMIT,
  fenceRawAnswer,
  fitReviewBody,
  sanitizeModelText,
  toInlineCode,
  truncateComment,
  truncateUtf8,
} from './text.mjs';

/** review 本文開頭的識別標記 */
export const REVIEW_MARKER = '<!-- lkai-review -->';
/** 每則 inline comment 結尾的識別標記；收掉舊討論串時用它辨認 AI 留下的討論串 */
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
 * 依各段結果計算整體結論。
 *
 * @param {ChunkResult[]} results
 * @returns {{ verdict: string, findings: Array<object> }}
 */
export function summarizeResults(results) {
  const succeeded = results.filter((result) => result.ok);
  const findings = mergeFindings(succeeded.map((result) => result.value.findings));
  const verdict = computeVerdict({
    chunkVerdicts: succeeded.map((result) => result.value.verdict),
    findings,
    failedChunks: results.length - succeeded.length,
  });
  return { verdict, findings };
}

/** 意見的位置文字：`path:line` 或只有 `path` */
const locationOf = (finding) => (finding.line === null ? finding.path : `${finding.path}:${finding.line}`);

/**
 * 本文中「無法標在程式碼行上的意見」的一項。
 *
 * @param {object} finding
 * @returns {string}
 */
function bodyItem(finding) {
  const title = sanitizeModelText(finding.title);
  const detail = sanitizeModelText(finding.body)
    .split('\n')
    .map((line) => (line === '' ? '' : `  ${line}`))
    .join('\n');
  // 落到本文的意見，path 可能不是真實檔案（模型可以寫任意文字），一律放進無法跳出的 code span
  const head = `- ${SEVERITY_LABELS[finding.severity]}｜**${title}**（${toInlineCode(locationOf(finding))}）`;
  return detail.trim() === '' ? head : `${head}\n\n${detail}`;
}

/**
 * inline comment 的內文。內容先截斷再補上識別標記，標記一定會留著。
 *
 * @param {object} finding
 * @returns {string}
 */
function commentBody(finding) {
  const content = `**${SEVERITY_LABELS[finding.severity]}｜${sanitizeModelText(finding.title)}**\n\n${sanitizeModelText(finding.body)}`;
  const suffix = `\n\n${COMMENT_MARKER}`;
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
 * 組出 review 的本文、inline comment、job summary 與 outcome。
 *
 * @param {object} input
 * @param {object} input.plan plan.json 的內容
 * @param {ChunkResult[]} input.results loadChunkResults 的結果
 * @param {string | null} input.synthesisRaw 彙整請求的原始回答；沒有送彙整請求或沒有結果時為 null
 * @param {string} input.headSha workflow 給的 PR head SHA，必須與 plan.headSha 相同
 * @param {string} input.runId 這次 run 的識別字串
 * @param {number} [input.warnChunks] 段數超過這個值時發出警告
 * @param {string} [input.modelLabel] 標題中顯示的供應商與模型
 * @returns {{ review: object, bodyOnly: object, summaryMarkdown: string, outcome: object }}
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
  const { verdict, findings } = summarizeResults(results);
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
    summary = sanitizeModelText(succeeded[0].value.summary);
  } else {
    const parsed = synthesisRaw === null ? null : parseSynthesisResult(synthesisRaw);
    if (parsed?.ok) {
      summary = sanitizeModelText(parsed.value.summary);
      conclusion = sanitizeModelText(parsed.value.conclusion);
    } else {
      const reason = parsed ? parsed.error : '沒有彙整結果';
      warnings.push(`彙整總評失敗（${reason}），改列各段的總評`);
      summary = succeeded.map((result) => `- 第 ${result.index} 段：${sanitizeModelText(result.value.summary)}`).join('\n');
    }
  }

  if (plan.gitattributesChanged) {
    notes.push('> ℹ️ 這個 PR 修改了 `.gitattributes`；本次仍以 base commit 的 `.gitattributes` 判斷哪些是自動產生的檔案，新的規則要等合併後才會生效。');
  }

  // 這一輪沒有完整審查的檔案：它們上面的舊討論串不收掉
  const failedFiles = new Set(failed.flatMap((result) => result.files));
  const keepThreadPaths = plan.files
    .filter(
      (file) =>
        file.category === 'generated' ||
        file.category === 'binary' ||
        (file.category === 'reviewed' && (file.truncated || file.chunk === null || failedFiles.has(file.path))),
    )
    .map((file) => file.path);

  const reviewedPaths = new Set(succeeded.flatMap((result) => result.files));
  const { inline, body } = routeFindings(findings, { commentable: plan.commentable, reviewedPaths });

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
      nonInlineHeading: '#### 無法標在程式碼行上的意見',
      nonInline: nonInlineFindings.map(bodyItem),
      rawAnswers,
      tail: '',
    };
  };

  const inlineParts = assemble(body, null);
  const bodyOnlyParts = assemble(findings, '> ⚠️ inline comment 無法發布，所有意見改列在本文。');

  const inlineBody = fitReviewBody(inlineParts);
  const bodyOnlyBody = fitReviewBody(bodyOnlyParts);
  if (inlineBody.truncated || bodyOnlyBody.truncated) {
    warnings.push('review 本文超過 GitHub 的長度上限，已截斷；完整內容寫在這次 workflow run 的 job summary');
  }

  // job summary 放未截斷、含全部意見的版本
  const fullBodyOnly = fitReviewBody(bodyOnlyParts, Number.MAX_SAFE_INTEGER).body;
  const summaryMarkdown = truncateUtf8(fullBodyOnly).text;

  const review = {
    commit_id: plan.headSha,
    event: 'COMMENT',
    body: inlineBody.body,
    comments: inline.map((finding) => ({ path: finding.path, line: finding.line, side: 'RIGHT', body: commentBody(finding) })),
  };
  const bodyOnly = { commit_id: plan.headSha, event: 'COMMENT', body: bodyOnlyBody.body };

  const outcome = {
    verdict,
    failedChunks: failed.map((result) => result.index),
    warnings,
    inlineCount: inline.length,
    bodyOnlyCount: findings.length,
    keepThreadPaths,
  };
  return { review, bodyOnly, summaryMarkdown, outcome };
}
