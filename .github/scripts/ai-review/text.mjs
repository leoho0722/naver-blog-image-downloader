// PR AI 審查：模型文字的清理與長度控制
//
// 這支檔案只做「純文字處理」，不讀檔、不連網、不輸出任何東西。
//
// 為什麼需要它：
// - AI 模型寫出來的審查文字，可能被 PR 裡的程式碼內容間接影響（prompt injection）。
//   如果直接貼到 PR，可能會亂 @ 別人、偽造我們的隱藏標記、或把摺疊區塊弄壞。
//   所以發布前要先清理。
// - GitHub 對留言長度有上限，太長會發布失敗。所以要在發布前先縮短到上限以內。
//
// 只使用 Node 內建功能，相容 Node 20 以上。

/** review 本文的長度上限（字元數，以 JS 字串的 .length 計算）。 */
export const BODY_LIMIT = 60000;

/** 單則 inline comment 的長度上限（字元數）。 */
export const COMMENT_LIMIT = 60000;

/** job summary 的大小上限（UTF-8 位元組數）。 */
export const SUMMARY_BYTE_LIMIT = 1000000;

/** review 本文被截斷時，附加在結尾的說明文字。 */
export const TRUNCATION_NOTE =
  '> 注意：本文因超過長度上限已截斷，完整內容請見這次 workflow run 的 job summary。';

// 零寬空白（U+200B）：肉眼看不到，但能讓 GitHub 不再把 `@帳號` 認成提及。
const ZERO_WIDTH_SPACE = '\u200B';

// 本文各段落之間的分隔（一個空行）。
const SECTION_SEPARATOR = '\n\n';

// 單則 inline comment 被截斷時附加的說明。
const COMMENT_TRUNCATION_NOTE = '\n\n…（內容過長已截斷）';

// job summary 被截斷時附加的說明。
const SUMMARY_TRUNCATION_NOTE = '\n\n…（job summary 超過大小上限，已截斷）';

// ---------------------------------------------------------------------------
// 內部小工具（不對外匯出）
// ---------------------------------------------------------------------------

/** 回傳人看得懂的型別名稱，用在錯誤訊息裡。 */
function describeType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

/** 確認 value 是字串，不是就丟 TypeError（不做任何自動轉型）。 */
function assertString(value, name) {
  if (typeof value !== 'string') {
    throw new TypeError(`${name} 必須是字串，但收到 ${describeType(value)}`);
  }
}

/** 確認 value 是「每一項都是字串」的陣列。 */
function assertStringArray(value, name) {
  if (!Array.isArray(value)) {
    throw new TypeError(`${name} 必須是字串陣列，但收到 ${describeType(value)}`);
  }
  for (let index = 0; index < value.length; index += 1) {
    assertString(value[index], `${name}[${index}]`);
  }
}

/**
 * 確認長度上限是合理的整數。
 * 不是數字丟 TypeError；是數字但不是整數（含 NaN、Infinity）或小於 minimum 則丟 RangeError。
 * 這樣可以避免有人傳入 Infinity 就把長度上限整個關掉。
 */
function assertLimit(value, name, minimum) {
  if (typeof value !== 'number') {
    throw new TypeError(`${name} 必須是數字，但收到 ${describeType(value)}`);
  }
  if (!Number.isInteger(value) || value < minimum) {
    throw new RangeError(`${name} 必須是不小於 ${minimum} 的整數，但收到 ${value}`);
  }
}

/**
 * 從尾端截斷字串，最多保留 maxLength 個字元。
 * 如果截斷點剛好落在一個 emoji（UTF-16 代理對）的中間，就多退一格，
 * 避免留下半個 emoji（顯示成亂碼）。
 */
function clipText(text, maxLength) {
  if (maxLength <= 0) return '';
  if (text.length <= maxLength) return text;
  let end = maxLength;
  const before = text.charCodeAt(end - 1);
  const after = text.charCodeAt(end);
  const beforeIsHighSurrogate = before >= 0xd800 && before <= 0xdbff;
  const afterIsLowSurrogate = after >= 0xdc00 && after <= 0xdfff;
  if (beforeIsHighSurrogate && afterIsLowSurrogate) end -= 1;
  return text.slice(0, end);
}

/** 把非空的段落用空行串起來；空字串的段落直接略過。 */
function joinSections(sections) {
  return sections.filter((section) => section !== '').join(SECTION_SEPARATOR);
}

/**
 * 組出「無法標在程式碼行上的意見」區塊。
 * omittedCount 大於 0 時，會在清單最後補一行說明有幾項因長度上限沒列出。
 */
function buildNonInlineBlock(heading, items, omittedCount) {
  const lines =
    omittedCount > 0
      ? [...items, `- …另有 ${omittedCount} 項意見因長度上限未列出`]
      : items;
  return joinSections([heading, lines.join('\n')]);
}

/** 找出字串中最長的一串連續反引號有多長（沒有就是 0）。 */
function longestBacktickRun(text) {
  let longest = 0;
  for (const run of text.match(/`+/g) ?? []) {
    if (run.length > longest) longest = run.length;
  }
  return longest;
}

// ---------------------------------------------------------------------------
// 對外匯出的函式
// ---------------------------------------------------------------------------

/**
 * 清理模型寫出來的文字，讓它發布到 PR 之後不會出事。
 *
 * 依序做兩件事：
 * 1. 中和 @提及：當 `@` 前面不是英文字母或數字（或 `@` 在字串最開頭），
 *    而且後面緊接英文字母或數字時，在 `@` 後面插入零寬空白（U+200B），
 *    這樣 GitHub 就不會通知對方。`@org/team` 也一併處理；
 *    `user@example.com` 這種 email 因為 `@` 前面是英數字，不會動。
 * 2. 破壞 HTML 註解符號：`<!--` 換成 `&lt;!--`，`-->` 換成 `--&gt;`，
 *    避免模型文字偽造我們用來辨識自己留言的隱藏標記。
 *
 * 限制：
 * - 這個函式不會處理 `</details>`，那是 {@link fenceRawAnswer} 的工作。
 * - 只認 ASCII 英數字；前一個字元是中文、底線等都算「不是英數字」，會被中和。
 *
 * @param {string} text 模型寫出來的文字。
 * @returns {string} 清理後的文字。
 * @throws {TypeError} text 不是字串時。
 */
export function sanitizeModelText(text) {
  assertString(text, 'text');
  return text
    .replace(
      /(^|[^A-Za-z0-9])@(?=[A-Za-z0-9])/g,
      (_match, previous) => `${previous}@${ZERO_WIDTH_SPACE}`,
    )
    .replaceAll('<!--', '&lt;!--')
    .replaceAll('-->', '--&gt;');
}

/**
 * 把「無法解讀的模型原始回答」放進一個可摺疊的 `<details>` 區塊。
 *
 * 做法：
 * - 原始回答放在 code fence（用反引號圍起來的區塊）裡，GitHub 不會在裡面通知 @，
 *   所以回答本身不做 @ 中和。
 * - fence 的反引號數量 = max(3, 回答中最長連續反引號長度 + 1)，
 *   這樣回答裡的反引號永遠不可能提早結束這個 fence。
 * - 回答中的 `</details`（不分大小寫）一律換成 `&lt;/details`，避免提早關閉摺疊區塊。
 * - 標題（label）會經過 {@link sanitizeModelText}。
 *
 * @param {string} text 模型的原始回答。
 * @param {string} label 摺疊區塊的標題文字。
 * @returns {string} 一個完整的 `<details>…</details>` 區塊（結尾沒有換行）。
 * @throws {TypeError} text 或 label 不是字串時。
 */
export function fenceRawAnswer(text, label) {
  assertString(text, 'text');
  assertString(label, 'label');
  const fence = '`'.repeat(Math.max(3, longestBacktickRun(text) + 1));
  const safeText = text.replace(/<\/details/gi, '&lt;/details');
  return [
    '<details>',
    `<summary>${sanitizeModelText(label)}</summary>`,
    '',
    fence,
    safeText,
    fence,
    '',
    '</details>',
  ].join('\n');
}

/**
 * @typedef {object} ReviewBodyParts review 本文的各個組成段落（皆由呼叫端先組好）。
 * @property {string} head 本文前段（結論、總評、警告等）。
 * @property {string} nonInlineHeading 「無法標在程式碼行上的意見」區塊的標題行。
 * @property {string[]} nonInline 該區塊的清單項目，每項是一行或多行 markdown（不含結尾換行）。
 *   空陣列表示沒有這個區塊，連標題都不會輸出。
 * @property {string[]} rawAnswers 每項是 {@link fenceRawAnswer} 產生的區塊。
 * @property {string} tail 本文結尾，可以是空字串。
 */

/**
 * 把 review 本文各段落組合起來，並確保長度不超過 GitHub 的上限。
 *
 * 組合方式：把非空的段落用空行串接，順序是
 * `head`、無法標在程式碼行上的意見區塊（標題 + 清單）、所有 `rawAnswers`、`tail`。
 *
 * 超過 limit 時依序降級，每一步做完就檢查，一旦不超過就停止：
 * 1. 移除全部 `rawAnswers`，並在結尾（`tail` 之後）加上 {@link TRUNCATION_NOTE}。
 * 2. 從 `nonInline` 的尾端一項一項移除；只要移除了至少一項，
 *    就在清單最後加一行 `- …另有 N 項意見因長度上限未列出`。
 * 3. 若意見清單全部移除後仍超過（代表 `head` 本身太長），就把 `head` 從尾端截斷，
 *    讓整份本文（含說明文字）剛好不超過上限。截斷時不會切斷 emoji。
 *    極端情況下（例如 `tail` 本身就超過上限），會依序放棄意見區塊與 `tail`，
 *    最後至少保證本文結尾是 {@link TRUNCATION_NOTE} 而且長度不超過上限。
 *
 * 限制：
 * - 這個函式不會幫你清理文字；各段落請先用 {@link sanitizeModelText} 處理。
 * - 若有「必須保留」的內容（例如辨識自己留言的隱藏標記），請放在 `tail`，
 *   因為 `head` 在最後一步可能被截斷。
 * - `truncated` 為 true 時，呼叫端應該發出 workflow 警告。
 *
 * @param {ReviewBodyParts} parts 本文的各個組成段落。
 * @param {number} [limit=BODY_LIMIT] 長度上限（字元數），預設 60000；
 *   必須是不小於 {@link TRUNCATION_NOTE} 長度的整數。
 * @returns {{ body: string, truncated: boolean }}
 *   `body` 的長度一定不超過 limit；沒有超過時 `truncated` 為 false，
 *   且內容與直接組合完全相同。
 * @throws {TypeError} parts 或其欄位型別不對、limit 不是數字時。
 * @throws {RangeError} limit 不是整數，或小於說明文字的長度時。
 */
export function fitReviewBody(parts, limit = BODY_LIMIT) {
  if (parts === null || typeof parts !== 'object' || Array.isArray(parts)) {
    throw new TypeError(`parts 必須是物件，但收到 ${describeType(parts)}`);
  }
  const { head, nonInlineHeading, nonInline, rawAnswers, tail } = parts;
  assertString(head, 'parts.head');
  assertString(nonInlineHeading, 'parts.nonInlineHeading');
  assertStringArray(nonInline, 'parts.nonInline');
  assertStringArray(rawAnswers, 'parts.rawAnswers');
  assertString(tail, 'parts.tail');
  assertLimit(limit, 'limit', TRUNCATION_NOTE.length);

  const hasNonInline = nonInline.length > 0;

  // 先照原樣組合，沒超過就直接回傳。
  const fullBlock = hasNonInline
    ? buildNonInlineBlock(nonInlineHeading, nonInline, 0)
    : '';
  const full = joinSections([head, fullBlock, rawAnswers.join(SECTION_SEPARATOR), tail]);
  if (full.length <= limit) {
    return { body: full, truncated: false };
  }

  // 降級 1：移除全部原始回答，結尾加上說明。
  const withoutRawAnswers = joinSections([head, fullBlock, tail, TRUNCATION_NOTE]);
  if (withoutRawAnswers.length <= limit) {
    return { body: withoutRawAnswers, truncated: true };
  }

  // 降級 2：從意見清單的尾端逐項移除。
  for (let removed = 1; removed <= nonInline.length; removed += 1) {
    const kept = nonInline.slice(0, nonInline.length - removed);
    const block = buildNonInlineBlock(nonInlineHeading, kept, removed);
    const body = joinSections([head, block, tail, TRUNCATION_NOTE]);
    if (body.length <= limit) {
      return { body, truncated: true };
    }
  }

  // 降級 3：意見清單已全部移除仍太長，只好截斷 head。
  // head 以外的內容（「另有 N 項」提示、tail、說明文字）盡量保留；
  // 如果連這些都放不下，依序放棄意見區塊與 tail。說明文字單獨一定放得下（limit 已檢查過）。
  const allRemovedBlock = hasNonInline
    ? buildNonInlineBlock(nonInlineHeading, [], nonInline.length)
    : '';
  const rest =
    [
      [allRemovedBlock, tail, TRUNCATION_NOTE],
      [tail, TRUNCATION_NOTE],
      [TRUNCATION_NOTE],
    ]
      .map((sections) => joinSections(sections))
      .find((candidate) => candidate.length <= limit) ?? TRUNCATION_NOTE;
  const room = limit - rest.length - SECTION_SEPARATOR.length;
  const clippedHead = clipText(head, room);
  const body = clippedHead === '' ? rest : `${clippedHead}${SECTION_SEPARATOR}${rest}`;
  return { body, truncated: true };
}

/**
 * 縮短過長的單則 inline comment。
 *
 * 長度（字元數）不超過 limit 時原樣回傳；超過時從尾端截斷，
 * 並附加 `\n\n…（內容過長已截斷）`，整體長度不超過 limit。
 * 截斷時不會切斷 emoji。
 *
 * @param {string} text 留言內容（請先經過 {@link sanitizeModelText}）。
 * @param {number} [limit=COMMENT_LIMIT] 長度上限（字元數），預設 60000；
 *   必須是不小於說明文字長度的整數。
 * @returns {string} 不超過 limit 的留言內容。
 * @throws {TypeError} text 不是字串、limit 不是數字時。
 * @throws {RangeError} limit 不是整數，或小於說明文字的長度時。
 */
export function truncateComment(text, limit = COMMENT_LIMIT) {
  assertString(text, 'text');
  assertLimit(limit, 'limit', COMMENT_TRUNCATION_NOTE.length);
  if (text.length <= limit) return text;
  return clipText(text, limit - COMMENT_TRUNCATION_NOTE.length) + COMMENT_TRUNCATION_NOTE;
}

/**
 * 依 UTF-8 位元組數縮短文字（用在 job summary，GitHub 以位元組計算大小）。
 *
 * 位元組數不超過 maxBytes 時原樣回傳；超過時從尾端截斷，
 * 並附加 `\n\n…（job summary 超過大小上限，已截斷）`，
 * 結果的位元組數不超過 maxBytes。截斷點一定落在完整字元的邊界上，
 * 不會切斷中文或 emoji 等多位元組字元。
 *
 * @param {string} text 要寫入 job summary 的文字。
 * @param {number} [maxBytes=SUMMARY_BYTE_LIMIT] 位元組數上限，預設 1000000；
 *   必須是不小於說明文字位元組數的整數。
 * @returns {{ text: string, truncated: boolean }} 處理後的文字，以及是否有被截斷。
 * @throws {TypeError} text 不是字串、maxBytes 不是數字時。
 * @throws {RangeError} maxBytes 不是整數，或小於說明文字的位元組數時。
 */
export function truncateUtf8(text, maxBytes = SUMMARY_BYTE_LIMIT) {
  assertString(text, 'text');
  const noteBytes = Buffer.byteLength(SUMMARY_TRUNCATION_NOTE, 'utf8');
  assertLimit(maxBytes, 'maxBytes', noteBytes);
  if (Buffer.byteLength(text, 'utf8') <= maxBytes) {
    return { text, truncated: false };
  }

  const bytes = Buffer.from(text, 'utf8');
  let end = maxBytes - noteBytes;
  // UTF-8 的「接續位元組」開頭是 10xxxxxx；截斷點若落在接續位元組上，
  // 代表會切到某個字元的中間，往前退到該字元的開頭為止。
  while (end > 0 && (bytes[end] & 0xc0) === 0x80) {
    end -= 1;
  }
  return {
    text: bytes.subarray(0, end).toString('utf8') + SUMMARY_TRUNCATION_NOTE,
    truncated: true,
  };
}

/**
 * 把一段文字安全地放進 Markdown 的行內程式碼（code span），例如模型回傳的檔案路徑。
 *
 * - 反引號數量比文字中最長的連續反引號多一個，文字無法提早結束 code span；
 * - 文字以反引號開頭或結尾時，前後各補一個空白（Markdown 規則：這個空白不會顯示）；
 * - 換行換成空白，避免破壞清單等版面。
 * code span 內的 `@` 不會通知任何人，HTML 註解也不會生效，所以不需要另外清理。
 *
 * @param {string} text 要顯示的文字
 * @returns {string} 例如 `` `a.ts` `` 或 ``` `` a`b `` ```
 * @throws {TypeError} text 不是字串時。
 */
export function toInlineCode(text) {
  assertString(text, 'text');
  const singleLine = text.replace(/[\r\n]+/g, ' ');
  const fence = '`'.repeat(longestBacktickRun(singleLine) + 1);
  const pad = singleLine.startsWith('`') || singleLine.endsWith('`') ? ' ' : '';
  return `${fence}${pad}${singleLine}${pad}${fence}`;
}

/**
 * 補上沒有關閉的 code fence，避免模型文字中未閉合的 ``` 把後面的本文都吞進 code block。
 *
 * 依 Markdown 規則逐行判斷：行首（最多 3 個空白縮排）連續 3 個以上的反引號或波浪號開啟 fence，
 * 之後同一種字元、數量不少於開頭的行才會關閉它。讀到結尾仍未關閉時，補上一行對應的結尾。
 *
 * @param {string} text 模型寫的文字
 * @returns {string} fence 都已成對的文字
 * @throws {TypeError} text 不是字串時。
 */
export function closeOpenFences(text) {
  assertString(text, 'text');
  /** @type {{ char: string, length: number } | null} */
  let open = null;
  for (const line of text.split('\n')) {
    const match = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (!match) {
      continue;
    }
    const [, fence, rest] = match;
    if (open === null) {
      // 反引號 fence 的說明文字不可再含反引號（Markdown 規則），否則不算開啟
      if (fence[0] === '`' && rest.includes('`')) {
        continue;
      }
      open = { char: fence[0], length: fence.length };
    } else if (fence[0] === open.char && fence.length >= open.length && rest.trim() === '') {
      open = null;
    }
  }
  if (open === null) {
    return text;
  }
  return `${text}${text.endsWith('\n') ? '' : '\n'}${open.char.repeat(open.length)}`;
}

/**
 * 把模型寫的單行文字（例如意見的標題）中的換行換成空白，避免破壞清單與粗體等版面。
 *
 * @param {string} text
 * @returns {string}
 * @throws {TypeError} text 不是字串時。
 */
export function toSingleLine(text) {
  assertString(text, 'text');
  return text.replace(/\s*[\r\n]+\s*/g, ' ');
}
