// chunk.mjs 的單元測試：元件區域、功能鍵與分段裝箱規則。

import assert from 'node:assert/strict';
import test from 'node:test';

import { areaOf, compareCodePoint, featureKeyOf, packChunks } from './chunk.mjs';

/** 只取每段的檔案清單與行數，方便比對 */
const shape = (result) => result.chunks.map((chunk) => ({ files: chunk.files, lines: chunk.lines }));

// spectra-scenario: pr-ai-review / Oversized diff is split by area and feature group
// spectra-scenario: pr-ai-review / Oversized diff is split by area and feature group / packing with a budget of 100 lines
test('以 100 行為上限裝箱：根目錄區域排第一，原始碼與測試在同一段', () => {
  const result = packChunks(
    [
      { path: 'apps/web/src/lib/x.ts', lines: 40 },
      { path: 'apps/web/src/components/Y.tsx', lines: 60 },
      { path: 'apps/backend/src/app.py', lines: 50 },
      { path: '.github/workflows/a.yml', lines: 30 },
      { path: 'apps/web/src/__tests__/lib/x.test.ts', lines: 30 },
      { path: 'README.md', lines: 10 },
    ],
    100,
  );
  assert.deepEqual(shape(result), [
    { files: ['README.md', '.github/workflows/a.yml', 'apps/backend/src/app.py'], lines: 90 },
    { files: ['apps/web/src/components/Y.tsx'], lines: 60 },
    { files: ['apps/web/src/__tests__/lib/x.test.ts', 'apps/web/src/lib/x.ts'], lines: 70 },
  ]);
  assert.deepEqual(result.truncated, []);
  assert.ok(result.chunks.every((chunk) => chunk.lines <= 100));
});

// spectra-scenario: pr-ai-review / Oversized diff is split by area and feature group / feature group larger than the budget
test('功能群組本身超過上限時，改以檔案為單位裝箱', () => {
  const result = packChunks(
    [
      { path: 'apps/web/src/lib/z.ts', lines: 70 },
      { path: 'apps/web/src/__tests__/lib/z.test.ts', lines: 60 },
    ],
    100,
  );
  assert.deepEqual(shape(result), [
    { files: ['apps/web/src/__tests__/lib/z.test.ts'], lines: 60 },
    { files: ['apps/web/src/lib/z.ts'], lines: 70 },
  ]);
});

// spectra-scenario: pr-ai-review / Oversized diff is split by area and feature group / feature keys
test('功能鍵：去掉 src 與測試目錄、副檔名、測試後綴與前綴', () => {
  const cases = [
    ['apps/web/src/__tests__/lib/x.test.ts', 'apps/web/lib/x'],
    ['apps/web/src/__tests__/lib/x.test.tsx', 'apps/web/lib/x'],
    ['apps/web/src/lib/x.ts', 'apps/web/lib/x'],
    ['apps/backend/tests/test_app.py', 'apps/backend/app'],
    ['apps/backend/src/app.py', 'apps/backend/app'],
    ['apps/backend/src/handler_test.py', 'apps/backend/handler'],
    ['README.md', 'README'],
  ];
  for (const [path, expected] of cases) {
    assert.equal(featureKeyOf(path), expected, path);
  }
  // 沒有副檔名、以 . 開頭的檔名與去掉後會變空的檔名維持原樣
  assert.equal(featureKeyOf('.gitattributes'), '.gitattributes');
  assert.equal(featureKeyOf('Makefile'), 'Makefile');
  assert.equal(featureKeyOf('tests/test_.py'), 'test_');
});

test('元件區域：apps 底下取前兩段、其他取第一段、根目錄是空字串', () => {
  assert.equal(areaOf('apps/web/src/a.ts'), 'apps/web');
  assert.equal(areaOf('apps/backend/Dockerfile'), 'apps/backend');
  assert.equal(areaOf('.github/workflows/a.yml'), '.github');
  assert.equal(areaOf('openspec/specs/x/spec.md'), 'openspec');
  assert.equal(areaOf('README.md'), '');
  assert.equal(areaOf('apps/README.md'), 'apps');
});

// spectra-scenario: pr-ai-review / Small diff stays in one chunk
test('總行數不超過上限時只有一段', () => {
  const result = packChunks(
    [
      { path: 'apps/web/src/a.ts', lines: 10 },
      { path: '.github/workflows/b.yml', lines: 20 },
      { path: 'README.md', lines: 5 },
    ],
    6000,
  );
  assert.equal(result.chunks.length, 1);
  assert.equal(result.chunks[0].lines, 35);
});

// spectra-scenario: pr-ai-review / File larger than one chunk is truncated
test('單一檔案超過上限時自成一段、截斷到上限並列入 truncated', () => {
  const result = packChunks(
    [
      { path: 'apps/web/src/a.ts', lines: 30 },
      { path: 'apps/web/src/huge.ts', lines: 250 },
      { path: 'apps/web/src/z.ts', lines: 30 },
    ],
    100,
  );
  assert.deepEqual(shape(result), [
    { files: ['apps/web/src/a.ts'], lines: 30 },
    { files: ['apps/web/src/huge.ts'], lines: 100 },
    { files: ['apps/web/src/z.ts'], lines: 30 },
  ]);
  assert.deepEqual(result.truncated, ['apps/web/src/huge.ts']);
});

test('段數沒有上限：產生 10 段時全部保留，沒有檔案被丟掉', () => {
  const files = Array.from({ length: 10 }, (_, i) => ({ path: `area${i}/file.ts`, lines: 80 }));
  const result = packChunks(files, 100);
  assert.equal(result.chunks.length, 10);
  assert.deepEqual(
    result.chunks.flatMap((chunk) => chunk.files).sort(compareCodePoint),
    files.map((file) => file.path).sort(compareCodePoint),
  );
});

test('沒有檔案時沒有段落', () => {
  assert.deepEqual(packChunks([], 100), { chunks: [], truncated: [] });
});

test('不合法的輸入會丟出錯誤', () => {
  assert.throws(() => packChunks('x', 100), TypeError);
  assert.throws(() => packChunks([], 1), RangeError);
  assert.throws(() => packChunks([{ path: 'a', lines: 0 }], 100), TypeError);
});

test('compareCodePoint 依 code point 排序，emoji 排在一般中文字之後', () => {
  // U+1F600（😀）的 code point 大於 U+FFFD，但 UTF-16 單位（0xD83D）比它小
  assert.ok(compareCodePoint('\u{1F600}', '�') > 0);
  assert.ok('\u{1F600}' < '�'); // 對照：預設比較會得到相反的順序
  assert.ok(compareCodePoint('', '.github') < 0);
  assert.ok(compareCodePoint('.github', 'apps/backend') < 0);
  assert.equal(compareCodePoint('abc', 'abc'), 0);
  assert.ok(compareCodePoint('ab', 'abc') < 0);
});
