// diff.mjs：解析 git 的 unified diff，並替每個檔案產生「標上新檔案行號」的 patch。
//
// 送審的 patch 中，每一行前面加上它在新檔案的行號，模型才能精確指出要留言的那一行；
// 有行號的行（前後文與新增的行）就是 GitHub 允許留 inline comment 的行（可留言行）。
//
// 輸入應由 `git -c core.quotePath=false diff --no-color --no-ext-diff -M` 產生：
// 關掉 core.quotePath 後，中文檔名不會被轉成八進位跳脫；含引號、反斜線或控制字元的路徑
// 仍可能以 C 語言式的引號輸出，這裡會還原。

/**
 * @typedef {'context' | 'add' | 'del' | 'meta'} DiffLineKind
 * - context：前後文（開頭是空白）
 * - add：新增的行（開頭是 +）
 * - del：刪除的行（開頭是 -）
 * - meta：`\ No newline at end of file` 這類說明行，不屬於檔案內容
 */

/**
 * @typedef {object} DiffLine
 * @property {DiffLineKind} kind 這一行的種類
 * @property {string} raw diff 中的原始內容（含開頭的 + - 空白 或 \）
 * @property {number | null} newLine 這一行在新檔案的行號；刪除的行與說明行為 null
 */

/**
 * @typedef {object} Hunk
 * @property {string} header hunk 的標頭，例如 `@@ -10,3 +10,4 @@ function foo()`
 * @property {DiffLine[]} lines hunk 內的每一行
 */

/**
 * @typedef {object} FileDiff
 * @property {string} path 新檔案的路徑（刪除的檔案則是被刪除的路徑）
 * @property {string | null} oldPath 更名前的路徑；沒有更名時為 null
 * @property {'added' | 'modified' | 'renamed' | 'deleted'} status 變更類型
 * @property {boolean} binary 是否為二進位檔案
 * @property {Hunk[]} hunks 文字檔案的 hunk；二進位、只更名或只改權限時是空陣列
 */

// C 語言式跳脫字元對應的 byte 值（git 引號路徑使用的寫法）
const SIMPLE_ESCAPES = {
  a: 0x07,
  b: 0x08,
  t: 0x09,
  n: 0x0a,
  v: 0x0b,
  f: 0x0c,
  r: 0x0d,
  '"': 0x22,
  '\\': 0x5c,
};

/**
 * 還原 git 以 C 語言式引號輸出的路徑，例如 `"a/\346\226\207.md"` 或 `"a/say \"hi\".txt"`。
 * 沒有被引號包住的字串原樣回傳。
 *
 * @param {string} value git 輸出的路徑片段
 * @returns {string} 還原後的路徑
 */
export function unquoteGitPath(value) {
  if (typeof value !== 'string') {
    throw new TypeError('unquoteGitPath 需要字串');
  }
  if (value.length < 2 || !value.startsWith('"') || !value.endsWith('"')) {
    return value;
  }
  const inner = value.slice(1, -1);
  // 先把每個字元換成 UTF-8 bytes，跳脫的八進位則直接是 byte，最後再整體解碼成字串
  const bytes = [];
  for (let i = 0; i < inner.length; i += 1) {
    const ch = inner[i];
    if (ch !== '\\') {
      const codePoint = inner.codePointAt(i);
      const encoded = Buffer.from(String.fromCodePoint(codePoint), 'utf8');
      bytes.push(...encoded);
      if (codePoint > 0xffff) {
        i += 1; // surrogate pair 佔兩個 UTF-16 單位
      }
      continue;
    }
    const next = inner[i + 1];
    if (next !== undefined && next in SIMPLE_ESCAPES) {
      bytes.push(SIMPLE_ESCAPES[next]);
      i += 1;
      continue;
    }
    const octal = inner.slice(i + 1, i + 4);
    if (/^[0-7]{3}$/.test(octal)) {
      bytes.push(Number.parseInt(octal, 8));
      i += 3;
      continue;
    }
    // 不認得的跳脫寫法：保留反斜線本身，不猜測
    bytes.push(0x5c);
  }
  return Buffer.from(bytes).toString('utf8');
}

/**
 * 去掉 git diff 路徑前面的 `a/` 或 `b/`，並還原引號路徑。`/dev/null` 回傳 null。
 *
 * @param {string} token `---`／`+++`／rename 行中的路徑片段
 * @param {string} prefix 要去掉的前綴（`a/`、`b/` 或空字串）
 * @returns {string | null}
 */
function cleanPath(token, prefix) {
  // 路徑含空白時，git 會在 ---／+++ 行的路徑後面補一個 tab，用來標示路徑結束
  const withoutTab = token.endsWith('\t') ? token.slice(0, -1) : token;
  if (withoutTab === '/dev/null') {
    return null;
  }
  const unquoted = unquoteGitPath(withoutTab);
  return prefix && unquoted.startsWith(prefix) ? unquoted.slice(prefix.length) : unquoted;
}

/**
 * 從 `diff --git a/X b/X` 標頭取出路徑。只在新舊路徑相同時可靠（沒有更名的情況），
 * 這時標頭是 `a/` + 路徑 + ` b/` + 路徑，路徑含空白也能對半切開。
 *
 * @param {string} rest `diff --git ` 後面的文字
 * @returns {string | null} 取不到時回傳 null
 */
function pathFromHeader(rest) {
  if (rest.startsWith('"')) {
    // 引號路徑：第一段是 "a/...", 第二段是 "b/..."
    const match = /^("(?:[^"\\]|\\.)*") ("(?:[^"\\]|\\.)*")$/.exec(rest);
    return match ? cleanPath(match[2], 'b/') : null;
  }
  if ((rest.length - 5) % 2 !== 0) {
    return null;
  }
  const length = (rest.length - 5) / 2;
  const left = rest.slice(2, 2 + length);
  const right = rest.slice(5 + length);
  if (rest.startsWith('a/') && rest.slice(2 + length, 5 + length) === ' b/' && left === right) {
    return left;
  }
  return null;
}

const HUNK_HEADER = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;

/**
 * 解析 git 的 unified diff。
 *
 * hunk 的結束位置依 hunk 標頭宣告的行數計算，所以檔案內容中就算出現 `diff --git` 這類文字，
 * 也不會被誤認為下一個檔案的開始。
 *
 * @param {string} text `git diff` 的完整輸出
 * @returns {FileDiff[]} 依 diff 中出現的順序排列的檔案
 */
export function parseDiff(text) {
  if (typeof text !== 'string') {
    throw new TypeError('parseDiff 需要字串');
  }
  const lines = text.split('\n');
  if (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop(); // 結尾的換行不是一行內容
  }

  /** @type {FileDiff[]} */
  const files = [];
  /** @type {(FileDiff & { _raw: string, _headerPath: string | null, _minus: string | null, _plus: string | null, _renameFrom: string | null, _renameTo: string | null }) | null} */
  let current = null;
  /** @type {Hunk | null} */
  let hunk = null;
  let oldRemaining = 0;
  let newRemaining = 0;
  let newLine = 0;

  const finishFile = () => {
    if (!current) {
      return;
    }
    const newPath = current._renameTo ?? current._plus ?? current._headerPath;
    const oldPath = current._renameFrom ?? current._minus ?? current._headerPath;
    const path = current.status === 'deleted' ? oldPath : newPath;
    if (!path) {
      throw new Error(`無法從 diff 取得檔案路徑：${current._raw}`);
    }
    files.push({
      path,
      oldPath: current.status === 'renamed' ? oldPath : null,
      status: current.status,
      binary: current.binary,
      hunks: current.hunks,
    });
    current = null;
  };

  for (const line of lines) {
    // hunk 內還有沒讀完的行時，這一行一定屬於 hunk
    if (hunk && (oldRemaining > 0 || newRemaining > 0)) {
      const marker = line[0];
      if (marker === '\\') {
        hunk.lines.push({ kind: 'meta', raw: line, newLine: null });
      } else if (marker === '-') {
        hunk.lines.push({ kind: 'del', raw: line, newLine: null });
        oldRemaining -= 1;
      } else if (marker === '+') {
        hunk.lines.push({ kind: 'add', raw: line, newLine });
        newLine += 1;
        newRemaining -= 1;
      } else {
        // 前後文；空字串視為內容是空行的前後文
        const raw = line === '' ? ' ' : line;
        hunk.lines.push({ kind: 'context', raw, newLine });
        newLine += 1;
        oldRemaining -= 1;
        newRemaining -= 1;
      }
      continue;
    }
    // hunk 讀完後，緊接著的 `\ No newline at end of file` 仍屬於這個 hunk
    if (hunk && line.startsWith('\\')) {
      hunk.lines.push({ kind: 'meta', raw: line, newLine: null });
      continue;
    }

    if (line.startsWith('diff --git ')) {
      finishFile();
      hunk = null;
      current = {
        path: '',
        oldPath: null,
        status: 'modified',
        binary: false,
        hunks: [],
        _raw: line,
        _headerPath: pathFromHeader(line.slice('diff --git '.length)),
        _minus: null,
        _plus: null,
        _renameFrom: null,
        _renameTo: null,
      };
      continue;
    }
    if (!current) {
      continue; // diff 開頭之前的文字（正常情況不會有）
    }

    const header = HUNK_HEADER.exec(line);
    if (header) {
      hunk = { header: line, lines: [] };
      current.hunks.push(hunk);
      oldRemaining = header[2] === undefined ? 1 : Number(header[2]);
      newRemaining = header[4] === undefined ? 1 : Number(header[4]);
      newLine = Number(header[3]);
      continue;
    }
    hunk = null;

    if (line.startsWith('new file mode ')) {
      current.status = 'added';
    } else if (line.startsWith('deleted file mode ')) {
      current.status = 'deleted';
    } else if (line.startsWith('rename from ')) {
      current.status = 'renamed';
      current._renameFrom = cleanPath(line.slice('rename from '.length), '');
    } else if (line.startsWith('rename to ')) {
      current.status = 'renamed';
      current._renameTo = cleanPath(line.slice('rename to '.length), '');
    } else if (line.startsWith('copy to ')) {
      // 只用 -M 時不會出現複製；保險起見把複製出來的檔案當成新增
      current.status = 'added';
      current._renameTo = cleanPath(line.slice('copy to '.length), '');
    } else if (line.startsWith('--- ')) {
      current._minus = cleanPath(line.slice(4), 'a/');
    } else if (line.startsWith('+++ ')) {
      current._plus = cleanPath(line.slice(4), 'b/');
    } else if (line.startsWith('Binary files ') || line === 'GIT binary patch') {
      current.binary = true;
    }
  }
  finishFile();
  return files;
}

/**
 * 檔案標題行中的狀態文字。
 *
 * @param {FileDiff} file
 * @returns {string}
 */
export function statusLabel(file) {
  switch (file.status) {
    case 'added':
      return '新增';
    case 'deleted':
      return '刪除';
    case 'renamed':
      return `更名自 ${file.oldPath}`;
    default:
      return '修改';
  }
}

// 截斷時放在最後一行的說明
export const TRUNCATED_LINE = '…（這個檔案超過每段的行數上限，後面的內容沒有送審）';

/**
 * 產生一個檔案標上新檔案行號的 patch。
 *
 * 格式：每個檔案先有一行標題 `### <路徑>（<狀態>）`，接著每個 hunk 的標頭原樣保留，
 * hunk 內每一行寫成 `<行號靠右對齊>|<原 diff 行>`；刪除的行與 `\ No newline at end of file`
 * 的行號欄留空。行號寬度取這個檔案最大的行號。
 *
 * @param {FileDiff} file 要標註的檔案
 * @param {{ maxLines?: number }} [options] maxLines：最多輸出幾行（含標題行），超過時截斷
 * @returns {{ text: string, lineCount: number, truncated: boolean, commentable: Array<[number, number]> }}
 *   text：標註後的內容；lineCount：行數；truncated：是否被截斷；
 *   commentable：實際送出的部分中，可以留 inline comment 的行號區間（含頭尾）
 */
export function annotateFile(file, options = {}) {
  const maxLines = options.maxLines ?? Number.POSITIVE_INFINITY;
  if (!(maxLines >= 2)) {
    throw new RangeError('maxLines 至少要 2（標題行加上一行內容）');
  }

  let width = 1;
  for (const hunk of file.hunks) {
    for (const line of hunk.lines) {
      if (line.newLine !== null) {
        width = Math.max(width, String(line.newLine).length);
      }
    }
  }
  const blank = ' '.repeat(width);

  /** @type {Array<{ text: string, newLine: number | null }>} */
  const output = [{ text: `### ${file.path}（${statusLabel(file)}）`, newLine: null }];
  for (const hunk of file.hunks) {
    output.push({ text: hunk.header, newLine: null });
    for (const line of hunk.lines) {
      const column = line.newLine === null ? blank : String(line.newLine).padStart(width, ' ');
      output.push({ text: `${column}|${line.raw}`, newLine: line.newLine });
    }
  }

  let kept = output;
  let truncated = false;
  if (output.length > maxLines) {
    kept = output.slice(0, maxLines - 1);
    kept.push({ text: TRUNCATED_LINE, newLine: null });
    truncated = true;
  }

  /** @type {Array<[number, number]>} */
  const commentable = [];
  for (const entry of kept) {
    if (entry.newLine === null) {
      continue;
    }
    const last = commentable[commentable.length - 1];
    if (last && entry.newLine === last[1] + 1) {
      last[1] = entry.newLine;
    } else {
      commentable.push([entry.newLine, entry.newLine]);
    }
  }

  return {
    text: kept.map((entry) => entry.text).join('\n'),
    lineCount: kept.length,
    truncated,
    commentable,
  };
}

/**
 * 判斷某個行號是否落在可留言行區間內。
 *
 * @param {Array<[number, number]> | undefined} ranges annotateFile 回傳的 commentable
 * @param {number} line 行號
 * @returns {boolean}
 */
export function isCommentable(ranges, line) {
  if (!ranges || !Number.isInteger(line)) {
    return false;
  }
  return ranges.some(([start, end]) => line >= start && line <= end);
}
