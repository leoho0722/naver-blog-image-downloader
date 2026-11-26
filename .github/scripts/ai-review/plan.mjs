// plan.mjs：規劃一次 PR 審查——產生 diff、替檔案分類、切段，並產出每段的提示詞。
//
// 檔案分類：
// - generated：base commit 的 .gitattributes 標記為 linguist-generated（自動產生的檔案）
// - deleted：在這個 PR 中被刪除
// - binary：二進位檔案
// - reviewed：其餘的檔案，會被送審
// 只有 reviewed 的檔案會送出內容，其他分類只列在檔案總覽。
//
// 自動產生檔一律依 base commit 的 .gitattributes 判斷，PR 無法藉由修改 .gitattributes
// 讓自己的程式碼跳過審查。

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { packChunks } from './chunk.mjs';
import { annotateFile, parseDiff } from './diff.mjs';
import { renderChunkPrompt, renderOverview } from './prompts.mjs';

// 上一輪 inline comment 結尾的識別標記；放進提示詞前先去掉（與 review.mjs 的 COMMENT_MARKER 相同）
const COMMENT_MARKER = '<!-- lkai-review-comment -->';

/** 每段預設的行數上限（估計值，見 design「依元件區域分組、原始碼與測試相鄰的分段裝箱規則」） */
export const DEFAULT_MAX_CHUNK_LINES = 6000;

// git 輸出可能很大（例如整個元件被刪除），預設的 1 MB 緩衝區不夠。
// 上限取 256 MiB：再大的輸出轉成字串時會超過 V8 的字串長度上限，屆時 execFileSync 會丟出錯誤、規劃失敗
const GIT_MAX_BUFFER = 256 * 1024 * 1024;

/** 規劃失敗（例如找不到 base commit）。呼叫端應以非 0 退出碼結束，不送審、不發布。 */
export class PlanError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PlanError';
  }
}

/**
 * 在指定資料夾執行 git，回傳 stdout。
 *
 * @param {string} cwd
 * @param {string[]} args
 * @param {string} [input] 送進 stdin 的內容
 * @returns {string}
 */
function git(cwd, args, input) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    input,
    maxBuffer: GIT_MAX_BUFFER,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

/**
 * 取得 commit 的完整 SHA；不存在時丟出 PlanError。
 *
 * @param {string} cwd
 * @param {string} ref
 * @param {string} label 錯誤訊息中的名稱（base 或 head）
 * @returns {string}
 */
function resolveCommit(cwd, ref, label) {
  if (typeof ref !== 'string' || ref.trim() === '') {
    throw new PlanError(`沒有提供 ${label} commit`);
  }
  try {
    git(cwd, ['cat-file', '-e', `${ref}^{commit}`]);
    return git(cwd, ['rev-parse', '--verify', `${ref}^{commit}`]).trim();
  } catch {
    throw new PlanError(`找不到 ${label} commit「${ref}」。請確認 workflow 在規劃前已經 fetch 這個 commit。`);
  }
}

/**
 * 以 base commit 的 .gitattributes 判斷哪些路徑是 linguist-generated。
 *
 * @param {string} cwd
 * @param {string} baseSha
 * @param {string[]} paths
 * @returns {Set<string>} 被標記為自動產生的路徑
 */
function generatedPaths(cwd, baseSha, paths) {
  if (paths.length === 0) {
    return new Set();
  }
  // -z 讓輸入與輸出都以 NUL 分隔，路徑含換行或特殊字元也不會出錯
  const output = git(
    cwd,
    ['check-attr', '-z', '--stdin', `--source=${baseSha}`, 'linguist-generated'],
    `${paths.join('\0')}\0`,
  );
  const fields = output.split('\0');
  const result = new Set();
  // 輸出格式：<路徑> NUL <屬性名稱> NUL <值> NUL，重複多次
  for (let i = 0; i + 2 < fields.length; i += 3) {
    const [path, , value] = fields.slice(i, i + 3);
    if (value === 'set' || value === 'true') {
      result.add(path);
    }
  }
  return result;
}

/**
 * @typedef {object} PlannedFileEntry
 * @property {string} path
 * @property {string | null} oldPath
 * @property {'added' | 'modified' | 'renamed' | 'deleted'} status
 * @property {'reviewed' | 'generated' | 'deleted' | 'binary'} category
 * @property {number} lines 標註後的完整行數；沒有送審的檔案為 0
 * @property {number | null} chunk 所在段落；沒有送審的檔案為 null
 * @property {boolean} truncated 是否因超過每段上限而被截斷
 */

/**
 * 規劃一次審查。
 *
 * @param {{ cwd: string, base: string, head: string, maxChunkLines?: number, threads?: Array<{ id: string, path: string, line: number | null, comment: string }> }} options
 *   threads：上一輪仍未 resolve 的 AI 討論串（run-review.sh collect 產生的 threads.json）
 * @returns {{ plan: object, prompts: string[] }} plan 是 plan.json 的內容；prompts[i] 是第 i+1 段的提示詞
 */
export function buildPlan({ cwd, base, head, maxChunkLines = DEFAULT_MAX_CHUNK_LINES, threads = [] }) {
  if (!Number.isInteger(maxChunkLines) || maxChunkLines < 2) {
    throw new PlanError('每段的行數上限必須是 2 以上的整數');
  }
  validateThreads(threads);
  const baseSha = resolveCommit(cwd, base, 'base');
  const headSha = resolveCommit(cwd, head, 'head');

  // 有共同祖先時用三點 diff（只看 PR 本身的變更）；取不到時（例如 base 分支被 force push）退回兩點 diff
  let range = [`${baseSha}...${headSha}`];
  try {
    git(cwd, ['merge-base', baseSha, headSha]);
  } catch {
    range = [baseSha, headSha];
  }
  // 固定輸出格式：中文路徑不跳脫、不上色、不用外部 diff 工具、偵測更名，並固定 a/、b/ 前綴
  // （使用者或 runner 設定了 diff.noprefix、diff.mnemonicPrefix 時，前綴會不同，路徑就會解析錯誤）
  const diffText = git(cwd, [
    '-c',
    'core.quotePath=false',
    'diff',
    '--no-color',
    '--no-ext-diff',
    '-M',
    '--src-prefix=a/',
    '--dst-prefix=b/',
    ...range,
  ]);
  const diffs = parseDiff(diffText);

  const generated = generatedPaths(
    cwd,
    baseSha,
    diffs.filter((file) => file.status !== 'deleted').map((file) => file.path),
  );

  /** @type {PlannedFileEntry[]} */
  const files = [];
  const annotated = new Map();
  for (const file of diffs) {
    let category = 'reviewed';
    if (file.status === 'deleted') {
      category = 'deleted';
    } else if (generated.has(file.path)) {
      category = 'generated';
    } else if (file.binary) {
      category = 'binary';
    }
    let lines = 0;
    if (category === 'reviewed') {
      const full = annotateFile(file);
      annotated.set(file.path, { file, full });
      lines = full.lineCount;
    }
    files.push({
      path: file.path,
      oldPath: file.oldPath,
      status: file.status,
      category,
      lines,
      chunk: null,
      truncated: false,
    });
  }

  const reviewed = files.filter((file) => file.category === 'reviewed');
  const { chunks, truncated } = packChunks(
    reviewed.map((file) => ({ path: file.path, lines: file.lines })),
    maxChunkLines,
  );
  const truncatedSet = new Set(truncated);
  const byPath = new Map(files.map((file) => [file.path, file]));

  /** @type {Record<string, Array<[number, number]>>} */
  const commentable = {};
  /** @type {Map<string, string>} */
  const patchText = new Map();
  for (const chunk of chunks) {
    for (const path of chunk.files) {
      const entry = byPath.get(path);
      entry.chunk = chunk.index;
      const { file, full } = annotated.get(path);
      const result = truncatedSet.has(path) ? annotateFile(file, { maxLines: maxChunkLines }) : full;
      entry.truncated = result.truncated;
      commentable[path] = result.commentable;
      patchText.set(path, result.text);
    }
  }

  const previousThreads = classifyThreads(threads, files);

  const overview = renderOverview(files);
  const prompts = chunks.map((chunk) =>
    renderChunkPrompt({
      index: chunk.index,
      total: chunks.length,
      overview,
      patch: chunk.files.map((path) => patchText.get(path)).join('\n\n'),
      previousThreads: previousThreads.filter((thread) => thread.disposition === 'ask' && thread.chunk === chunk.index),
    }),
  );

  const plan = {
    baseSha,
    headSha,
    gitattributesChanged: diffs.some(
      (file) => file.path.split('/').pop() === '.gitattributes' || file.oldPath?.split('/').pop() === '.gitattributes',
    ),
    maxChunkLines,
    files,
    chunks,
    commentable,
    previousThreads,
  };
  return { plan, prompts };
}

/**
 * 確認 threads.json 的格式；不符合時丟出 PlanError（代表收集步驟有問題，不應猜測）。
 *
 * @param {unknown} threads
 */
function validateThreads(threads) {
  if (!Array.isArray(threads)) {
    throw new PlanError('上一輪討論串的資料必須是陣列');
  }
  threads.forEach((thread, index) => {
    const ok =
      thread !== null &&
      typeof thread === 'object' &&
      typeof thread.id === 'string' &&
      thread.id !== '' &&
      typeof thread.path === 'string' &&
      thread.path !== '' &&
      (thread.line === null || (Number.isInteger(thread.line) && thread.line >= 1)) &&
      typeof thread.comment === 'string';
    if (!ok) {
      throw new PlanError(`上一輪討論串的第 ${index + 1} 筆資料格式不正確：${JSON.stringify(thread)}`);
    }
  });
}

/**
 * 依討論串所在的檔案在這次 diff 中的狀態分類（見 design「由 AI 確認已修正後才收掉上一輪的討論串」）：
 * - ask：檔案屬於某一段且沒有被截斷，交給那一段的模型判斷是否已修正
 * - no-longer-changed：檔案已不在這次 diff 內
 * - deleted：檔案在這次 diff 中被刪除
 * - keep：檔案被截斷、是自動產生或二進位檔案，維持未 resolve
 * 檔案被更名時，討論串記錄的是舊路徑，所以也比對更名前的路徑。
 *
 * @param {Array<{ id: string, path: string, line: number | null, comment: string }>} threads
 * @param {Array<{ path: string, oldPath: string | null, category: string, chunk: number | null, truncated: boolean }>} files
 * @returns {Array<{ ref: string, id: string, path: string, filePath: string | null, line: number | null, comment: string, chunk: number | null, disposition: string }>}
 */
function classifyThreads(threads, files) {
  return threads.map((thread, index) => {
    const file = files.find((entry) => entry.path === thread.path) ?? files.find((entry) => entry.oldPath === thread.path);
    let disposition = 'keep';
    if (!file) {
      disposition = 'no-longer-changed';
    } else if (file.category === 'deleted') {
      disposition = 'deleted';
    } else if (file.category === 'reviewed' && file.chunk !== null && !file.truncated) {
      disposition = 'ask';
    }
    return {
      ref: `P${index + 1}`,
      id: thread.id,
      path: thread.path,
      filePath: file ? file.path : null,
      line: thread.line,
      comment: thread.comment.replaceAll(COMMENT_MARKER, '').trim(),
      chunk: disposition === 'ask' ? file.chunk : null,
      disposition,
    };
  });
}

/**
 * 把規劃結果寫進資料夾：plan.json 與每段的 chunk-<n>.md。
 *
 * @param {string} outDir
 * @param {{ plan: object, prompts: string[] }} result
 */
export function writePlan(outDir, { plan, prompts }) {
  mkdirSync(outDir, { recursive: true });
  prompts.forEach((prompt, i) => {
    writeFileSync(join(outDir, `chunk-${i + 1}.md`), prompt);
  });
  // plan.json 最後寫：呼叫端可以用它是否存在判斷規劃是否完整
  writeFileSync(join(outDir, 'plan.json'), `${JSON.stringify(plan, null, 2)}\n`);
}
