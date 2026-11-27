// diff.mjs 的單元測試：diff 解析、行號標註、可留言行與引號路徑的還原。

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { annotateFile, isCommentable, parseDiff, TRUNCATED_LINE, unquoteGitPath } from './diff.mjs';

/** 把多行字串組成 diff 文字（每行結尾補換行） */
const diffText = (...lines) => `${lines.join('\n')}\n`;

// spectra-scenario: pr-ai-review / Hunk lines are numbered
// spectra-scenario: pr-ai-review / Hunk lines are numbered / one hunk
test('一個 hunk：前後文與新增的行標上新檔案行號，刪除的行留空', () => {
  const [file] = parseDiff(
    diffText(
      'diff --git a/src/a.ts b/src/a.ts',
      'index 1111111..2222222 100644',
      '--- a/src/a.ts',
      '+++ b/src/a.ts',
      '@@ -10,3 +10,3 @@',
      ' a',
      '-b',
      '+c',
      ' d',
    ),
  );
  assert.equal(file.path, 'src/a.ts');
  assert.equal(file.status, 'modified');

  const result = annotateFile(file);
  assert.deepEqual(result.text.split('\n'), [
    '### src/a.ts（修改）',
    '@@ -10,3 +10,3 @@',
    '10| a',
    '  |-b',
    '11|+c',
    '12| d',
  ]);
  assert.deepEqual(result.commentable, [[10, 12]]);
  assert.equal(result.lineCount, 6);
  assert.equal(result.truncated, false);
});

// spectra-scenario: pr-ai-review / Hunk lines are numbered / missing newline at end of file
test('檔案結尾缺少換行：說明行的行號欄留空，也不推進行號', () => {
  const [file] = parseDiff(
    diffText(
      'diff --git a/x.txt b/x.txt',
      'index 1111111..2222222 100644',
      '--- a/x.txt',
      '+++ b/x.txt',
      '@@ -1 +1 @@',
      '-old',
      '\\ No newline at end of file',
      '+new',
      '\\ No newline at end of file',
    ),
  );
  const result = annotateFile(file);
  assert.deepEqual(result.text.split('\n').slice(2), [
    ' |-old',
    ' |\\ No newline at end of file',
    '1|+new',
    ' |\\ No newline at end of file',
  ]);
  assert.deepEqual(result.commentable, [[1, 1]]);
});

test('多個 hunk：行號寬度取整個檔案最大的行號，可留言行分成多段區間', () => {
  const [file] = parseDiff(
    diffText(
      'diff --git a/b.ts b/b.ts',
      'index 1111111..2222222 100644',
      '--- a/b.ts',
      '+++ b/b.ts',
      '@@ -1,2 +1,2 @@ first',
      ' one',
      '-two',
      '+TWO',
      '@@ -98,2 +98,3 @@ second',
      ' x',
      '+y',
      ' z',
    ),
  );
  assert.equal(file.hunks.length, 2);
  const result = annotateFile(file);
  assert.deepEqual(result.text.split('\n'), [
    '### b.ts（修改）',
    '@@ -1,2 +1,2 @@ first',
    '  1| one',
    '   |-two',
    '  2|+TWO',
    '@@ -98,2 +98,3 @@ second',
    ' 98| x',
    ' 99|+y',
    '100| z',
  ]);
  assert.deepEqual(result.commentable, [
    [1, 2],
    [98, 100],
  ]);
});

test('新增、刪除、更名與二進位檔案的狀態與路徑', () => {
  const files = parseDiff(
    diffText(
      'diff --git a/new.ts b/new.ts',
      'new file mode 100644',
      'index 0000000..1111111',
      '--- /dev/null',
      '+++ b/new.ts',
      '@@ -0,0 +1,2 @@',
      '+line 1',
      '+line 2',
      'diff --git a/gone.ts b/gone.ts',
      'deleted file mode 100644',
      'index 1111111..0000000',
      '--- a/gone.ts',
      '+++ /dev/null',
      '@@ -1 +0,0 @@',
      '-bye',
      'diff --git a/old/name.ts b/new/name.ts',
      'similarity index 100%',
      'rename from old/name.ts',
      'rename to new/name.ts',
      'diff --git a/icon.png b/icon.png',
      'new file mode 100644',
      'index 0000000..1111111',
      'Binary files /dev/null and b/icon.png differ',
      'diff --git a/run.sh b/run.sh',
      'old mode 100644',
      'new mode 100755',
    ),
  );
  assert.deepEqual(
    files.map((f) => [f.path, f.status, f.oldPath, f.binary, f.hunks.length]),
    [
      ['new.ts', 'added', null, false, 1],
      ['gone.ts', 'deleted', null, false, 1],
      ['new/name.ts', 'renamed', 'old/name.ts', false, 0],
      ['icon.png', 'added', null, true, 0],
      ['run.sh', 'modified', null, false, 0],
    ],
  );
  // 新增檔案的行號從 1 開始
  assert.deepEqual(annotateFile(files[0]).commentable, [[1, 2]]);
  // 沒有 hunk 的檔案（只更名、只改權限）只有標題行，沒有可留言行
  const renamed = annotateFile(files[2]);
  assert.equal(renamed.text, '### new/name.ts（更名自 old/name.ts）');
  assert.equal(renamed.lineCount, 1);
  assert.deepEqual(renamed.commentable, []);
});

test('檔案內容裡的 diff --git 文字不會被誤認為下一個檔案', () => {
  const files = parseDiff(
    diffText(
      'diff --git a/doc.md b/doc.md',
      'index 1111111..2222222 100644',
      '--- a/doc.md',
      '+++ b/doc.md',
      '@@ -1,1 +1,3 @@',
      ' intro',
      '+diff --git a/fake b/fake',
      '+@@ -1 +1 @@',
    ),
  );
  assert.equal(files.length, 1);
  assert.equal(files[0].hunks[0].lines.length, 3);
});

test('截斷：只保留前面的行，最後一行是截斷說明，可留言行只含送出的部分', () => {
  const body = Array.from({ length: 20 }, (_, i) => `+line ${i + 1}`);
  const [file] = parseDiff(
    diffText('diff --git a/big.ts b/big.ts', '--- a/big.ts', '+++ b/big.ts', '@@ -0,0 +1,20 @@', ...body),
  );
  const result = annotateFile(file, { maxLines: 6 });
  const lines = result.text.split('\n');
  assert.equal(result.truncated, true);
  assert.equal(result.lineCount, 6);
  assert.equal(lines.length, 6);
  assert.equal(lines[5], TRUNCATED_LINE);
  // 標題、hunk 標頭之後送出了 3 行內容（第 1 到 3 行）
  assert.deepEqual(result.commentable, [[1, 3]]);
  assert.equal(isCommentable(result.commentable, 3), true);
  assert.equal(isCommentable(result.commentable, 4), false);
});

test('maxLines 小於 2 時丟出 RangeError', () => {
  const [file] = parseDiff(diffText('diff --git a/a b/a', '--- a/a', '+++ b/a', '@@ -1 +1 @@', '-x', '+y'));
  assert.throws(() => annotateFile(file, { maxLines: 1 }), RangeError);
});

test('unquoteGitPath 還原 C 語言式引號路徑', () => {
  assert.equal(unquoteGitPath('"a/\\346\\226\\207.md"'), 'a/文.md');
  assert.equal(unquoteGitPath('"a/say \\"hi\\".txt"'), 'a/say "hi".txt');
  assert.equal(unquoteGitPath('"a/tab\\there"'), 'a/tab\there');
  assert.equal(unquoteGitPath('a/plain.txt'), 'a/plain.txt');
  assert.throws(() => unquoteGitPath(1), TypeError);
});

/**
 * 在暫存資料夾建立 git repo，執行 callback 後刪除。
 *
 * @param {(run: (...args: string[]) => string, dir: string) => void} callback
 */
function withRepo(callback) {
  const dir = mkdtempSync(join(tmpdir(), 'ai-review-diff-'));
  const run = (...args) =>
    execFileSync('git', ['-c', 'user.name=test', '-c', 'user.email=test@example.com', ...args], {
      cwd: dir,
      encoding: 'utf8',
    });
  try {
    run('init', '-q');
    callback(run, dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// spectra-scenario: pr-ai-review / Non-ASCII paths are not escaped
test('實際的 git diff：中文、空白與引號路徑都還原成原本的路徑', () => {
  withRepo((run, dir) => {
    mkdirSync(join(dir, 'docs'));
    writeFileSync(join(dir, 'docs', '說明.md'), 'a\n');
    writeFileSync(join(dir, 'with space.txt'), 'a\n');
    writeFileSync(join(dir, 'say "hi".txt'), 'a\n');
    run('add', '.');
    run('commit', '-q', '-m', 'base');
    writeFileSync(join(dir, 'docs', '說明.md'), 'b\n');
    writeFileSync(join(dir, 'with space.txt'), 'b\n');
    writeFileSync(join(dir, 'say "hi".txt'), 'b\n');
    run('commit', '-q', '-am', 'change');

    // 刻意開啟 diff.noprefix，確認固定前綴後仍能正確解析
    const text = run(
      '-c',
      'core.quotePath=false',
      '-c',
      'diff.noprefix=true',
      'diff',
      '--no-color',
      '--no-ext-diff',
      '-M',
      '--src-prefix=a/',
      '--dst-prefix=b/',
      'HEAD~1',
      'HEAD',
    );
    const paths = parseDiff(text)
      .map((f) => f.path)
      .sort();
    assert.deepEqual(paths, ['docs/說明.md', 'say "hi".txt', 'with space.txt'].sort());
  });
});
