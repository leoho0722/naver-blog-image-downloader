// chunk.mjs：把可審查的檔案依「元件區域」與「功能相關性」裝進每段不超過上限的段落。
//
// 同一個元件、同一個功能的檔案盡量放在同一段，原始碼與它的測試排在一起，
// 模型才能在同一次審查中看到彼此相關的變更。段數沒有上限：每一段都會送審，不會丟掉任何檔案。

// 計算功能鍵時要移除的目錄名稱：原始碼與測試常見的根目錄
const IGNORED_DIRECTORIES = new Set(['src', '__tests__', 'tests', 'test']);

/**
 * 依 Unicode code point 順序比較兩個字串（不受語系影響）。
 * JavaScript 預設的 `<` 比較的是 UTF-16 單位，遇到 emoji 等字元時順序會和 code point 不同。
 *
 * @param {string} a
 * @param {string} b
 * @returns {number} a 在前為負數、相同為 0、a 在後為正數
 */
export function compareCodePoint(a, b) {
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    const ca = a.codePointAt(i);
    const cb = b.codePointAt(j);
    if (ca !== cb) {
      return ca - cb;
    }
    i += ca > 0xffff ? 2 : 1;
    j += cb > 0xffff ? 2 : 1;
  }
  return a.length - i - (b.length - j);
}

/**
 * 檔案所屬的元件區域。
 * - `apps/` 底下取前兩段路徑，例如 `apps/web/src/a.ts` → `apps/web`
 * - 其他檔案取第一段路徑，例如 `.github/workflows/a.yml` → `.github`
 * - repo 根目錄的檔案歸在名稱為空字串的區域，排序時永遠排第一
 *
 * @param {string} path 檔案路徑
 * @returns {string}
 */
export function areaOf(path) {
  const segments = path.split('/');
  if (segments.length === 1) {
    return '';
  }
  if (segments[0] === 'apps' && segments.length >= 3) {
    return `${segments[0]}/${segments[1]}`;
  }
  return segments[0];
}

/**
 * 檔案的功能鍵：功能鍵相同的檔案視為同一個功能（例如原始碼與它的測試）。
 * - 去掉路徑中名為 `src`、`__tests__`、`tests`、`test` 的目錄
 * - 檔名去掉副檔名，再去掉 `.test`／`.spec` 後綴、`test_` 前綴與 `_test` 後綴
 *
 * 例如 `apps/web/src/__tests__/lib/x.test.tsx` 與 `apps/web/src/lib/x.ts` 都是 `apps/web/lib/x`。
 *
 * @param {string} path 檔案路徑
 * @returns {string}
 */
export function featureKeyOf(path) {
  const segments = path.split('/');
  const fileName = segments.pop();
  const directories = segments.filter((segment) => !IGNORED_DIRECTORIES.has(segment));

  // 以 . 開頭、沒有其他 . 的檔名（例如 .gitignore）沒有副檔名
  const dot = fileName.lastIndexOf('.');
  let name = dot > 0 ? fileName.slice(0, dot) : fileName;
  /** 去掉一段文字，結果不可以變成空字串（例如檔名本身就叫 test_.py） */
  const strip = (value, pattern) => {
    const stripped = value.replace(pattern, '');
    return stripped === '' ? value : stripped;
  };
  name = strip(name, /\.(test|spec)$/);
  name = strip(name, /^test_/);
  name = strip(name, /_test$/);

  return [...directories, name].join('/');
}

/**
 * @typedef {object} PlannedFile
 * @property {string} path 檔案路徑
 * @property {number} lines 這個檔案標註後的完整行數（含標題行）
 */

/**
 * @typedef {object} Chunk
 * @property {number} index 段落編號，從 1 開始
 * @property {string[]} files 這一段包含的檔案路徑，依裝入順序排列
 * @property {number} lines 這一段的行數（被截斷的檔案以截斷後的行數計算）
 */

/**
 * 把檔案依區域、功能群組與檔案的順序裝進段落。
 *
 * 1. 區域依名稱排序（根目錄的區域排第一）。整個區域放得進目前這段就加入；
 *    放不進但不超過上限就開新的一段；超過上限就改以功能群組為單位裝入。
 * 2. 功能群組依功能鍵排序，群組內依路徑排序。群組放得進目前這段就加入，否則開新的一段；
 *    群組本身超過上限時，再改以檔案為單位依序裝入。
 * 3. 單一檔案超過上限時自成一段，截斷到上限行數，並列入 truncated。
 *
 * @param {PlannedFile[]} files 可審查的檔案
 * @param {number} maxLines 每段的行數上限
 * @returns {{ chunks: Chunk[], truncated: string[] }}
 */
export function packChunks(files, maxLines) {
  if (!Array.isArray(files)) {
    throw new TypeError('packChunks 需要檔案陣列');
  }
  if (!Number.isInteger(maxLines) || maxLines < 2) {
    throw new RangeError('每段的行數上限必須是 2 以上的整數');
  }
  for (const file of files) {
    if (typeof file?.path !== 'string' || !Number.isInteger(file.lines) || file.lines < 1) {
      throw new TypeError(`檔案資料不正確：${JSON.stringify(file)}`);
    }
  }

  // 區域 → 功能鍵 → 檔案
  /** @type {Map<string, Map<string, PlannedFile[]>>} */
  const areas = new Map();
  for (const file of files) {
    const area = areaOf(file.path);
    const key = featureKeyOf(file.path);
    if (!areas.has(area)) {
      areas.set(area, new Map());
    }
    const groups = areas.get(area);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(file);
  }

  /** @type {Chunk[]} */
  const chunks = [];
  /** @type {string[]} */
  const truncated = [];
  /** @type {Chunk | null} */
  let current = null;

  const sum = (list) => list.reduce((total, file) => total + file.lines, 0);
  const fitsCurrent = (lines) => current !== null && current.lines + lines <= maxLines;
  const startChunk = () => {
    current = { index: chunks.length + 1, files: [], lines: 0 };
    chunks.push(current);
  };
  const add = (list) => {
    for (const file of list) {
      current.files.push(file.path);
      current.lines += file.lines;
    }
  };

  const areaNames = [...areas.keys()].sort(compareCodePoint);
  for (const areaName of areaNames) {
    const groups = areas.get(areaName);
    const keys = [...groups.keys()].sort(compareCodePoint);
    const groupFiles = keys.map((key) => groups.get(key).sort((a, b) => compareCodePoint(a.path, b.path)));
    const areaFiles = groupFiles.flat();
    const areaLines = sum(areaFiles);

    if (fitsCurrent(areaLines)) {
      add(areaFiles);
      continue;
    }
    if (areaLines <= maxLines) {
      startChunk();
      add(areaFiles);
      continue;
    }

    // 區域超過上限：以功能群組為單位
    for (const group of groupFiles) {
      const groupLines = sum(group);
      if (fitsCurrent(groupLines)) {
        add(group);
        continue;
      }
      if (groupLines <= maxLines) {
        startChunk();
        add(group);
        continue;
      }
      // 功能群組超過上限：以檔案為單位
      for (const file of group) {
        if (file.lines > maxLines) {
          startChunk();
          current.files.push(file.path);
          current.lines = maxLines;
          truncated.push(file.path);
          continue;
        }
        if (!fitsCurrent(file.lines)) {
          startChunk();
        }
        add([file]);
      }
    }
  }

  return { chunks, truncated };
}
