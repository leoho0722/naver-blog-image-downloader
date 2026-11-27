// findings.mjs：處理 AI 模型回傳的審查結果（意見），只做純資料處理，不做任何 I/O。
//
// 每一段 diff 交給模型審查後，模型的回答最後必須附上一個 ```json 區塊。這個模組負責：
// 1. 從回答中擷取並驗證那個 JSON；
// 2. 把各段的意見合併、排序；
// 3. 計算整體審查結論；
// 4. 決定每一項意見要發成 inline comment（貼在程式碼那一行），還是放進 review 本文。
//
// 「模型回答的格式不對」不算程式錯誤，一律用 `{ ok: false, error }` 回報，讓呼叫端把那一段標成失敗；
// 只有「呼叫這個模組的程式傳錯參數」才會丟出 TypeError。

import { compareCodePoint } from './chunk.mjs';
import { isCommentable } from './diff.mjs';

/** 意見的嚴重程度，依序由重到輕 */
export const SEVERITIES = Object.freeze(['blocker', 'warning', 'nit']);

/** 單一段落的審查結論：有阻擋問題、建議修改、沒有疑慮 */
export const CHUNK_VERDICTS = Object.freeze(['blocker', 'changes_suggested', 'no_concerns']);

// 開頭行：三個以上的反引號，後面可以接說明文字（說明文字中不可再有反引號）。前面允許縮排。
const OPENING_FENCE = /^[ \t]*(`{3,})([^`]*)$/;
// 結尾行：只有反引號與空白
const CLOSING_FENCE = /^[ \t]*(`{3,})[ \t]*$/;
// 說明文字要是 json（不分大小寫，前後可有空白）才算 json 區塊
const JSON_INFO = /^[ \t]*json[ \t]*$/i;

/**
 * 判斷是不是一般物件（排除 null 與陣列）。
 *
 * @param {unknown} value
 * @returns {boolean}
 */
function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * 判斷是不是有內容的字串（只有空白也視為沒內容）。
 *
 * @param {unknown} value
 * @returns {boolean}
 */
function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * 判斷是不是合格的行號：大於等於 1 的整數，或 null（表示不針對特定行）。
 *
 * @param {unknown} value
 * @returns {boolean}
 */
function isValidLine(value) {
  return value === null || (Number.isInteger(value) && value >= 1);
}

/**
 * 從模型回答中擷取「最後一個」```json 區塊並解析。
 *
 * 規則：
 * - 區塊的開頭行是三個以上的反引號，後面緊接 json（不分大小寫，可有空白），例如 ```json；
 * - 結尾行是至少一樣多的反引號，所以用四個反引號開頭的區塊，內容裡的三個反引號不會提早結束它；
 * - 只看最後一個 json 區塊，前面的區塊即使合法也不採用；其他語言的區塊不影響結果；
 * - 最後一個 json 區塊如果沒有結尾行（回答可能被截斷），視為格式不合格，不退回去採用前面的區塊。
 *
 * @param {string} text 模型的完整回答
 * @returns {{ ok: true, value: any } | { ok: false, error: string }}
 */
export function extractLastJsonBlock(text) {
  if (typeof text !== 'string') {
    throw new TypeError('extractLastJsonBlock 需要字串');
  }

  /** @type {{ content: string, closed: boolean } | null} */
  let lastJson = null;
  /** @type {{ length: number, isJson: boolean, lines: string[] } | null} */
  let open = null;

  for (const line of text.split(/\r?\n/)) {
    if (open === null) {
      const opening = OPENING_FENCE.exec(line);
      if (opening) {
        open = { length: opening[1].length, isJson: JSON_INFO.test(opening[2]), lines: [] };
      }
      continue;
    }
    const closing = CLOSING_FENCE.exec(line);
    if (closing && closing[1].length >= open.length) {
      if (open.isJson) {
        lastJson = { content: open.lines.join('\n'), closed: true };
      }
      open = null;
    } else {
      open.lines.push(line);
    }
  }
  // 讀到結尾還沒關閉的 json 區塊
  if (open !== null && open.isJson) {
    lastJson = { content: open.lines.join('\n'), closed: false };
  }

  if (lastJson === null) {
    return { ok: false, error: '回答中沒有 json 程式碼區塊' };
  }
  if (!lastJson.closed) {
    return { ok: false, error: '最後一個 json 程式碼區塊沒有結尾行（回答可能被截斷）' };
  }
  try {
    return { ok: true, value: JSON.parse(lastJson.content) };
  } catch (error) {
    return { ok: false, error: `最後一個 json 程式碼區塊不是合法的 JSON：${error.message}` };
  }
}

/**
 * @typedef {object} Finding
 * @property {string} path 檔案路徑
 * @property {number | null} line 新檔案的行號；null 表示不針對特定行
 * @property {'blocker' | 'warning' | 'nit'} severity 嚴重程度
 * @property {string} title 一句話標題
 * @property {string} body 詳細說明
 */

/**
 * 驗證單一項意見。合格時回傳只含固定欄位的新物件（多餘欄位丟掉）。
 *
 * @param {unknown} item 模型回傳的某一項意見
 * @param {string} where 錯誤訊息中用來指出位置的文字，例如 `findings[2]`
 * @returns {{ ok: true, value: Finding } | { ok: false, error: string }}
 */
function validateFinding(item, where) {
  if (!isPlainObject(item)) {
    return { ok: false, error: `${where} 必須是物件` };
  }
  if (!isNonEmptyString(item.path)) {
    return { ok: false, error: `${where}.path 必須是非空字串` };
  }
  if (!isValidLine(item.line)) {
    return { ok: false, error: `${where}.line 必須是正整數或 null` };
  }
  if (!SEVERITIES.includes(item.severity)) {
    return { ok: false, error: `${where}.severity 必須是 ${SEVERITIES.join('、')} 其中之一` };
  }
  if (!isNonEmptyString(item.title)) {
    return { ok: false, error: `${where}.title 必須是非空字串` };
  }
  if (typeof item.body !== 'string') {
    return { ok: false, error: `${where}.body 必須是字串` };
  }
  return {
    ok: true,
    value: { path: item.path, line: item.line, severity: item.severity, title: item.title, body: item.body },
  };
}

/**
 * 解析並驗證「單一段落」的審查結果。
 *
 * 回答最後的 ```json 區塊必須是
 * `{ summary, verdict, findings: [{ path, line, severity, title, body }] }`。
 * 任何欄位不合格都回傳 `ok: false`，error 會指出是哪個欄位；合格時只保留規定的欄位。
 *
 * @param {string} text 模型的完整回答
 * @returns {{ ok: true, value: { summary: string, verdict: 'blocker' | 'changes_suggested' | 'no_concerns', findings: Finding[] } } | { ok: false, error: string }}
 */
export function parseChunkResult(text) {
  const extracted = extractLastJsonBlock(text);
  if (!extracted.ok) {
    return extracted;
  }
  const data = extracted.value;
  if (!isPlainObject(data)) {
    return { ok: false, error: 'JSON 內容必須是物件' };
  }
  if (typeof data.summary !== 'string') {
    return { ok: false, error: 'summary 必須是字串' };
  }
  if (!CHUNK_VERDICTS.includes(data.verdict)) {
    return { ok: false, error: `verdict 必須是 ${CHUNK_VERDICTS.join('、')} 其中之一` };
  }
  if (!Array.isArray(data.findings)) {
    return { ok: false, error: 'findings 必須是陣列' };
  }

  /** @type {Finding[]} */
  const findings = [];
  for (let index = 0; index < data.findings.length; index += 1) {
    const checked = validateFinding(data.findings[index], `findings[${index}]`);
    if (!checked.ok) {
      return checked;
    }
    findings.push(checked.value);
  }

  // previousThreads：提示詞列出上一輪的 AI 討論串時，模型逐一回報是否已修正；沒有這個欄位時視為全部沒有判斷
  /** @type {Array<{ ref: string, fixed: boolean, note: string }>} */
  const previousThreads = [];
  if (data.previousThreads !== undefined) {
    if (!Array.isArray(data.previousThreads)) {
      return { ok: false, error: 'previousThreads 必須是陣列' };
    }
    for (let index = 0; index < data.previousThreads.length; index += 1) {
      const item = data.previousThreads[index];
      const where = `previousThreads[${index}]`;
      if (!isPlainObject(item)) {
        return { ok: false, error: `${where} 必須是物件` };
      }
      if (!isNonEmptyString(item.ref)) {
        return { ok: false, error: `${where}.ref 必須是非空字串` };
      }
      if (typeof item.fixed !== 'boolean') {
        return { ok: false, error: `${where}.fixed 必須是 true 或 false` };
      }
      if (typeof item.note !== 'string') {
        return { ok: false, error: `${where}.note 必須是字串` };
      }
      previousThreads.push({ ref: item.ref, fixed: item.fixed, note: item.note });
    }
  }
  return { ok: true, value: { summary: data.summary, verdict: data.verdict, findings, previousThreads } };
}

/**
 * 解析並驗證「彙整」請求的結果：`{ summary, conclusion }`，兩個欄位都必須是字串。
 *
 * @param {string} text 模型的完整回答
 * @returns {{ ok: true, value: { summary: string, conclusion: string } } | { ok: false, error: string }}
 */
export function parseSynthesisResult(text) {
  const extracted = extractLastJsonBlock(text);
  if (!extracted.ok) {
    return extracted;
  }
  const data = extracted.value;
  if (!isPlainObject(data)) {
    return { ok: false, error: 'JSON 內容必須是物件' };
  }
  if (typeof data.summary !== 'string') {
    return { ok: false, error: 'summary 必須是字串' };
  }
  if (typeof data.conclusion !== 'string') {
    return { ok: false, error: 'conclusion 必須是字串' };
  }
  return { ok: true, value: { summary: data.summary, conclusion: data.conclusion } };
}

/**
 * 比較兩項意見的先後：嚴重程度（重的在前）→ 路徑（依 code point）→ 行號（小的在前，null 排在數字之後）。
 *
 * @param {Finding} a
 * @param {Finding} b
 * @returns {number}
 */
function compareFindings(a, b) {
  const bySeverity = SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity);
  if (bySeverity !== 0) {
    return bySeverity;
  }
  const byPath = compareCodePoint(a.path, b.path);
  if (byPath !== 0) {
    return byPath;
  }
  if (a.line === b.line) {
    return 0;
  }
  if (a.line === null) {
    return 1;
  }
  if (b.line === null) {
    return -1;
  }
  return a.line - b.line;
}

/**
 * 把各段的意見合併成一個新陣列並排序（穩定排序，不改動傳入的陣列）。
 *
 * 排序依據：嚴重程度（blocker → warning → nit）→ 路徑（依 code point）→ 行號（由小到大，
 * null 排在同一路徑的數字之後）。三項都相同的意見維持輸入時的先後。
 *
 * @param {Finding[][]} lists 每一段的意見陣列
 * @returns {Finding[]} 合併排序後的新陣列
 */
export function mergeFindings(lists) {
  if (!Array.isArray(lists)) {
    throw new TypeError('mergeFindings 需要「意見陣列的陣列」');
  }
  /** @type {Finding[]} */
  const merged = [];
  lists.forEach((list, listIndex) => {
    if (!Array.isArray(list)) {
      throw new TypeError(`mergeFindings 的 lists[${listIndex}] 必須是陣列`);
    }
    list.forEach((finding, index) => {
      const where = `lists[${listIndex}][${index}]`;
      if (!isPlainObject(finding)) {
        throw new TypeError(`mergeFindings 的 ${where} 必須是物件`);
      }
      if (typeof finding.path !== 'string') {
        throw new TypeError(`mergeFindings 的 ${where}.path 必須是字串`);
      }
      if (!SEVERITIES.includes(finding.severity)) {
        throw new TypeError(`mergeFindings 的 ${where}.severity 必須是 ${SEVERITIES.join('、')} 其中之一`);
      }
      if (!isValidLine(finding.line)) {
        throw new TypeError(`mergeFindings 的 ${where}.line 必須是正整數或 null`);
      }
      merged.push(finding);
    });
  });
  // Array.prototype.sort 在 Node 12 之後保證穩定
  return merged.sort(compareFindings);
}

/** 會擋合併的嚴重程度：🔴 阻擋合併與 🟡 建議修正（見 design「依嚴重程度決定意見是否擋合併」） */
export const BLOCKING_SEVERITIES = Object.freeze(['blocker', 'warning']);

/**
 * 計算整體審查結論，讓結論與「會不會擋合併」一致。依序判斷，第一個符合的就是結果：
 * 1. 任一項意見是 blocker，或這一輪沒有收掉的上一輪討論串中有 blocker → `blocker`
 * 2. 有失敗的段落（沒審到的部分無法保證沒問題）→ `incomplete`
 * 3. 任一項意見是 warning，或這一輪沒有收掉的上一輪討論串中有 warning → `changes_suggested`
 * 4. 其他（可以有 nit）→ `no_concerns`
 * 模型在各段給的 verdict 不影響結果：真正會擋合併的是意見本身。
 *
 * @param {{ findings: Finding[], failedChunks: number, openThreadSeverities?: Array<'blocker' | 'warning' | 'nit'> }} input
 *   findings：合併後的意見；failedChunks：失敗的段落數（非負整數）；
 *   openThreadSeverities：這一輪不會收掉的上一輪 AI 討論串的嚴重程度
 * @returns {'blocker' | 'incomplete' | 'changes_suggested' | 'no_concerns'}
 */
export function computeVerdict(input) {
  if (!isPlainObject(input)) {
    throw new TypeError('computeVerdict 需要 { findings, failedChunks } 物件');
  }
  const { findings, failedChunks, openThreadSeverities = [] } = input;
  if (!Array.isArray(findings) || !findings.every((finding) => isPlainObject(finding) && SEVERITIES.includes(finding.severity))) {
    throw new TypeError(`findings 必須是陣列，且每一項都有 ${SEVERITIES.join('、')} 其中之一的 severity`);
  }
  if (!Number.isInteger(failedChunks) || failedChunks < 0) {
    throw new TypeError('failedChunks 必須是大於等於 0 的整數');
  }
  if (!Array.isArray(openThreadSeverities) || !openThreadSeverities.every((severity) => SEVERITIES.includes(severity))) {
    throw new TypeError(`openThreadSeverities 必須是陣列，且每一項都是 ${SEVERITIES.join('、')} 其中之一`);
  }

  const severities = [...findings.map((finding) => finding.severity), ...openThreadSeverities];
  if (severities.includes('blocker')) {
    return 'blocker';
  }
  if (failedChunks > 0) {
    return 'incomplete';
  }
  if (severities.includes('warning')) {
    return 'changes_suggested';
  }
  return 'no_concerns';
}

/**
 * 依嚴重程度與位置決定每一項意見的呈現方式（見 design「依嚴重程度決定意見是否擋合併」）：
 * - inline：blocker 或 warning，路徑是這一段送審的檔案（在 reviewedPaths 中），行號是整數且落在該檔案的可留言行內
 * - fileLevel：其他 blocker 或 warning 中，路徑是這個 PR diff 中的檔案（在 diffPaths 中）的意見，另發檔案層級留言
 * - body：nit，以及路徑不在 diff 內的 blocker 或 warning，只列在 review 本文
 * inline 與 fileLevel 會形成討論串、擋住合併；body 不會。三個結果陣列都維持輸入時的順序。
 *
 * @param {Finding[]} findings 意見
 * @param {{ commentable: Record<string, Array<[number, number]>>, reviewedPaths: Set<string> | string[], diffPaths: Set<string> | string[] }} options
 *   commentable：檔案路徑 → 可留言行區間；reviewedPaths：這一段送審的檔案路徑；diffPaths：這個 PR diff 中的所有檔案路徑
 * @returns {{ inline: Finding[], fileLevel: Finding[], body: Finding[] }}
 */
export function routeFindings(findings, options) {
  if (!Array.isArray(findings)) {
    throw new TypeError('routeFindings 需要意見陣列');
  }
  if (!isPlainObject(options)) {
    throw new TypeError('routeFindings 需要 { commentable, reviewedPaths, diffPaths } 物件');
  }
  const { commentable } = options;
  if (!isPlainObject(commentable)) {
    throw new TypeError('commentable 必須是「檔案路徑 → 可留言行區間」的物件');
  }
  const reviewed = toPathSet(options.reviewedPaths, 'reviewedPaths');
  const inDiff = toPathSet(options.diffPaths, 'diffPaths');

  /** @type {Finding[]} */
  const inline = [];
  /** @type {Finding[]} */
  const fileLevel = [];
  /** @type {Finding[]} */
  const body = [];
  findings.forEach((finding, index) => {
    if (!isPlainObject(finding) || typeof finding.path !== 'string') {
      throw new TypeError(`findings[${index}] 必須是有字串 path 的物件`);
    }
    if (!BLOCKING_SEVERITIES.includes(finding.severity)) {
      body.push(finding);
      return;
    }
    // 用 hasOwn 避免路徑剛好叫 constructor 之類的名字時，讀到物件內建的屬性
    const ranges = Object.hasOwn(commentable, finding.path) ? commentable[finding.path] : undefined;
    const canInline =
      reviewed.has(finding.path) &&
      Number.isInteger(finding.line) &&
      Array.isArray(ranges) &&
      isCommentable(ranges, finding.line);
    if (canInline) {
      inline.push(finding);
    } else if (inDiff.has(finding.path)) {
      fileLevel.push(finding);
    } else {
      body.push(finding);
    }
  });
  return { inline, fileLevel, body };
}

/**
 * 把路徑清單轉成 Set；不是字串的 Set 或字串陣列時丟出 TypeError。
 *
 * @param {unknown} paths
 * @param {string} name 錯誤訊息中的參數名稱
 * @returns {Set<string>}
 */
function toPathSet(paths, name) {
  if (paths instanceof Set) {
    return paths;
  }
  if (Array.isArray(paths) && paths.every((path) => typeof path === 'string')) {
    return new Set(paths);
  }
  throw new TypeError(`${name} 必須是字串的 Set 或字串陣列`);
}
