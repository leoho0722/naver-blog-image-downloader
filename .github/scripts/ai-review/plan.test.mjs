// plan.mjs 與 `ai-review.mjs plan` 的測試：以暫存的 git repo 驗證檔案分類、切段與提示詞。

import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { buildPlan, PlanError } from './plan.mjs';
import { renderOverview } from './prompts.mjs';

const CLI = join(dirname(fileURLToPath(import.meta.url)), 'ai-review.mjs');

/**
 * 建立暫存 git repo，執行 callback 後刪除。
 *
 * @param {(repo: { dir: string, git: (...args: string[]) => string, write: (path: string, content: string | Buffer) => void, remove: (path: string) => void, commit: (message: string) => string }) => void} callback
 */
function withRepo(callback) {
  const dir = mkdtempSync(join(tmpdir(), 'ai-review-plan-'));
  const git = (...args) =>
    execFileSync('git', ['-c', 'user.name=test', '-c', 'user.email=test@example.com', ...args], {
      cwd: dir,
      encoding: 'utf8',
    }).trim();
  const write = (path, content) => {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), content);
  };
  const remove = (path) => unlinkSync(join(dir, path));
  const commit = (message) => {
    git('add', '-A');
    git('commit', '-q', '-m', message);
    return git('rev-parse', 'HEAD');
  };
  try {
    git('init', '-q');
    callback({ dir, git, write, remove, commit });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** 取出每個檔案的路徑 → 分類 */
const categories = (plan) => Object.fromEntries(plan.files.map((file) => [file.path, file.category]));

// spectra-scenario: pr-ai-review / Files are classified before chunking
// spectra-scenario: pr-ai-review / Files are classified before chunking / file classification
test('檔案分類：依 base 的 .gitattributes 判斷自動產生檔，刪除與二進位只列在總覽、自動產生檔只寫數量', () => {
  withRepo(({ dir, write, remove, commit }) => {
    write('.gitattributes', '.agents/skills/** linguist-generated\n**/pnpm-lock.yaml linguist-generated\n');
    write('.agents/skills/spectra-apply/SKILL.md', 'v1\n');
    write('apps/web/pnpm-lock.yaml', 'lock: 1\n');
    write('apps/web/src/main.tsx', 'export const a = 1;\n');
    write('apps/web/src/legacy.ts', 'export const old = 1;\n');
    const base = commit('base');

    write('.agents/skills/spectra-apply/SKILL.md', 'v2\n');
    write('apps/web/pnpm-lock.yaml', 'lock: 2\n');
    write('apps/web/src/main.tsx', 'export const a = 2;\n');
    remove('apps/web/src/legacy.ts');
    write('apps/web/public/icon.png', Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0x00, 0x00, 0x0d, 0xff, 0x00]));
    const head = commit('head');

    const { plan, prompts } = buildPlan({ cwd: dir, base, head });
    assert.deepEqual(categories(plan), {
      '.agents/skills/spectra-apply/SKILL.md': 'generated',
      'apps/web/pnpm-lock.yaml': 'generated',
      'apps/web/src/main.tsx': 'reviewed',
      'apps/web/src/legacy.ts': 'deleted',
      'apps/web/public/icon.png': 'binary',
    });
    assert.equal(plan.baseSha, base);
    assert.equal(plan.headSha, head);
    assert.equal(plan.gitattributesChanged, false);
    // 只有送審的檔案被分配到段落
    assert.deepEqual(plan.chunks.map((chunk) => chunk.files), [['apps/web/src/main.tsx']]);
    assert.equal(plan.files.find((file) => file.path === 'apps/web/src/main.tsx').chunk, 1);
    assert.equal(plan.files.find((file) => file.path === 'apps/web/pnpm-lock.yaml').chunk, null);
    assert.deepEqual(Object.keys(plan.commentable), ['apps/web/src/main.tsx']);

    // 提示詞：總覽列出本段、刪除與二進位的檔案，自動產生的檔案只寫數量；patch 只含送審的檔案
    assert.equal(prompts.length, 1);
    const prompt = prompts[0];
    assert.match(prompt, /已略過的自動產生檔案：2 個（不附內容，也不列出路徑）/);
    assert.doesNotMatch(prompt, /SKILL\.md/);
    assert.match(prompt, /- apps\/web\/src\/legacy\.ts：刪除，已刪除（只列出，不附內容）/);
    assert.match(prompt, /- apps\/web\/public\/icon\.png：新增，二進位（只列出，不附內容）/);
    assert.match(prompt, /- apps\/web\/src\/main\.tsx：修改，送審，第 1 段/);
    assert.match(prompt, /### apps\/web\/src\/main\.tsx（修改）/);
    assert.match(prompt, /1\|\+export const a = 2;/);
    assert.doesNotMatch(prompt, /lock: 2/);
    assert.doesNotMatch(prompt, /v2/);
    assert.match(prompt, /```json/);
  });
});

// spectra-scenario: pr-ai-review / Pull request cannot exclude its own files through .gitattributes
test('PR 修改 .gitattributes 也無法讓自己的程式碼被略過', () => {
  withRepo(({ dir, write, commit }) => {
    write('.gitattributes', '.archify/** linguist-generated\n');
    write('apps/web/src/main.tsx', 'export const a = 1;\n');
    const base = commit('base');

    write('.gitattributes', '.archify/** linguist-generated\napps/web/** linguist-generated\n');
    write('apps/web/src/main.tsx', 'export const a = 2;\n');
    const head = commit('head');

    const { plan } = buildPlan({ cwd: dir, base, head });
    assert.deepEqual(categories(plan), {
      '.gitattributes': 'reviewed',
      'apps/web/src/main.tsx': 'reviewed',
    });
    assert.equal(plan.gitattributesChanged, true);
  });
});

// spectra-scenario: pr-ai-review / Base commit is unavailable
test('base commit 不存在時，命令列以非 0 結束且不寫出任何檔案', () => {
  withRepo(({ dir, write, commit }) => {
    write('a.txt', 'a\n');
    const head = commit('head');
    const out = join(dir, 'out');
    const missing = '0123456789abcdef0123456789abcdef01234567';

    assert.throws(() => buildPlan({ cwd: dir, base: missing, head }), PlanError);

    const result = spawnSync(process.execPath, [CLI, 'plan', '--base', missing, '--head', head, '--out', out], {
      cwd: dir,
      encoding: 'utf8',
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /找不到 base commit/);
    assert.equal(existsSync(join(out, 'plan.json')), false);
  });
});

test('命令列：寫出 plan.json 與各段提示詞，並印出各段行數', () => {
  withRepo(({ dir, write, commit }) => {
    write('README.md', 'a\n');
    write('apps/web/src/a.ts', 'a\n');
    const base = commit('base');
    write('README.md', 'b\n');
    write('apps/web/src/a.ts', 'b\n');
    write('apps/backend/src/app.py', 'print(1)\n');
    const head = commit('head');
    const out = join(dir, 'out');

    // 每段上限 8 行：每個檔案標註後是 4 行（標題、hunk 標頭、刪除、新增）或 3 行（新增檔案）
    const result = spawnSync(
      process.execPath,
      [CLI, 'plan', '--base', base, '--head', head, '--out', out, '--max-chunk-lines', '8'],
      { cwd: dir, encoding: 'utf8' },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /規劃完成：共 3 個檔案，其中 3 個送審，分成 2 段（各段行數：7、4）/);
    assert.match(result.stdout, /各段提示詞的實際行數（含審查指示與檔案總覽）：\d+、\d+/);

    const plan = JSON.parse(readFileSync(join(out, 'plan.json'), 'utf8'));
    assert.deepEqual(plan.chunks.map((chunk) => chunk.files), [
      ['README.md', 'apps/backend/src/app.py'],
      ['apps/web/src/a.ts'],
    ]);
    assert.equal(existsSync(join(out, 'chunk-1.md')), true);
    assert.equal(existsSync(join(out, 'chunk-2.md')), true);
    assert.match(readFileSync(join(out, 'chunk-2.md'), 'utf8'), /共 2 段，本段是第 2 段/);
  });
});

test('沒有 hunk 的檔案（純更名）歸為可審查，只送標題行', () => {
  withRepo(({ dir, git, write, commit }) => {
    write('old/name.ts', 'export const value = 1;\nexport const other = 2;\n');
    const base = commit('base');
    mkdirSync(join(dir, 'new'));
    git('mv', 'old/name.ts', 'new/name.ts');
    const head = commit('rename');

    const { plan, prompts } = buildPlan({ cwd: dir, base, head });
    const file = plan.files.find((entry) => entry.path === 'new/name.ts');
    assert.equal(file.category, 'reviewed');
    assert.equal(file.status, 'renamed');
    assert.equal(file.oldPath, 'old/name.ts');
    assert.equal(file.lines, 1);
    assert.deepEqual(plan.commentable['new/name.ts'], []);
    assert.match(prompts[0], /### new\/name\.ts（更名自 old\/name\.ts）/);
  });
});

test('沒有可審查的檔案時沒有段落與提示詞', () => {
  withRepo(({ dir, write, remove, commit }) => {
    write('.gitattributes', '**/pnpm-lock.yaml linguist-generated\n');
    write('pnpm-lock.yaml', '1\n');
    write('gone.ts', 'x\n');
    const base = commit('base');
    write('pnpm-lock.yaml', '2\n');
    remove('gone.ts');
    const head = commit('head');

    const { plan, prompts } = buildPlan({ cwd: dir, base, head });
    assert.deepEqual(plan.chunks, []);
    assert.deepEqual(prompts, []);
    assert.deepEqual(categories(plan), { 'gone.ts': 'deleted', 'pnpm-lock.yaml': 'generated' });
  });
});

test('取不到共同祖先時退回兩點 diff', () => {
  withRepo(({ dir, git, write, commit }) => {
    write('a.txt', 'a\n');
    const base = commit('base');
    git('checkout', '-q', '--orphan', 'other');
    git('rm', '-q', '-rf', '.');
    write('b.txt', 'b\n');
    const head = commit('unrelated');

    const { plan } = buildPlan({ cwd: dir, base, head });
    assert.deepEqual(categories(plan), { 'a.txt': 'deleted', 'b.txt': 'reviewed' });
  });
});

test('命令列參數錯誤時以 64 結束', () => {
  const result = spawnSync(process.execPath, [CLI, 'plan', '--base'], { encoding: 'utf8' });
  assert.equal(result.status, 64);
  const unknown = spawnSync(process.execPath, [CLI, 'nope'], { encoding: 'utf8' });
  assert.equal(unknown.status, 64);
});

// spectra-scenario: pr-ai-review / Confirmed fix resolves the thread with a reply
// spectra-scenario: pr-ai-review / Unfixed issue keeps the thread open
test('上一輪的討論串依檔案狀態分類，只有要判斷的討論串放進它所屬段落的提示詞', () => {
  withRepo(({ dir, git, write, remove, commit }) => {
    write('.gitattributes', '**/pnpm-lock.yaml linguist-generated\n');
    write('a.ts', 'export const a = 1;\n');
    write('keep.ts', 'export const k = 1;\n');
    write('gone.ts', 'export const g = 1;\n');
    write('big.ts', 'export const b = 0;\n');
    write('pnpm-lock.yaml', '1\n');
    write('old/name.ts', 'export const n = 1;\nexport const m = 2;\nexport const o = 3;\n');
    const base = commit('base');

    write('a.ts', 'export const a = 2;\n');
    remove('gone.ts');
    write('big.ts', Array.from({ length: 20 }, (_, i) => `export const b${i} = ${i};`).join('\n') + '\n');
    write('pnpm-lock.yaml', '2\n');
    mkdirSync(join(dir, 'new'));
    git('mv', 'old/name.ts', 'new/name.ts');
    const head = commit('head');

    const threads = [
      { id: 'T-a', path: 'a.ts', line: 1, comment: '請改成常數 <!-- lkai-review-comment -->' },
      { id: 'T-keep', path: 'keep.ts', line: 1, comment: '沒有變更的檔案' },
      // 留言建立時（base）檔案還存在，現在被刪除：留言講的程式碼已不存在
      { id: 'T-gone', path: 'gone.ts', line: 1, comment: '被刪除的檔案', commit: base },
      { id: 'T-big', path: 'big.ts', line: 3, comment: '被截斷的檔案' },
      { id: 'T-lock', path: 'pnpm-lock.yaml', line: 1, comment: '自動產生的檔案' },
      { id: 'T-renamed', path: 'old/name.ts', line: null, comment: '更名前的路徑 ```含反引號```' },
    ];
    // 每段上限 6 行：根目錄區域的 a.ts（4 行）一段、big.ts 超過上限自成一段並被截斷；new/name.ts 屬於 new 區域，另成一段
    const { plan, prompts } = buildPlan({ cwd: dir, base, head, maxChunkLines: 6, threads });

    const byId = Object.fromEntries(plan.previousThreads.map((thread) => [thread.id, thread]));
    assert.deepEqual(
      Object.fromEntries(plan.previousThreads.map((thread) => [thread.id, thread.disposition])),
      {
        'T-a': 'ask',
        'T-keep': 'no-longer-changed',
        'T-gone': 'deleted',
        'T-big': 'keep',
        'T-lock': 'keep',
        'T-renamed': 'ask',
      },
    );
    assert.deepEqual(plan.previousThreads.map((thread) => thread.ref), ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']);
    assert.equal(byId['T-renamed'].filePath, 'new/name.ts');
    // 識別標記不會放進提示詞
    assert.equal(byId['T-a'].comment, '請改成常數');

    const chunkOf = (path) => plan.files.find((file) => file.path === path).chunk;
    const promptA = prompts[chunkOf('a.ts') - 1];
    assert.match(promptA, /## 上一輪仍未解決的意見（本段的檔案）/);
    assert.match(promptA, /### P1｜a\.ts 第 1 行（上一輪標記時的行號）/);
    assert.doesNotMatch(promptA, /### P6/);
    assert.doesNotMatch(promptA, /lkai-review-comment/);
    // 更名的檔案：討論串放進新路徑所在的段落，並註明原路徑
    const promptRenamed = prompts[chunkOf('new/name.ts') - 1];
    assert.match(promptRenamed, /### P6｜new\/name\.ts（原路徑 old\/name\.ts）/);
    assert.match(promptRenamed, /````\n更名前的路徑 ```含反引號```\n````/);
    assert.doesNotMatch(promptRenamed, /### P1/);
    // 被截斷的 big.ts 所在的段落不列出任何討論串
    const promptBig = prompts[chunkOf('big.ts') - 1];
    assert.doesNotMatch(promptBig, /上一輪仍未解決的意見/);
    assert.ok(plan.files.find((file) => file.path === 'big.ts').truncated);
  });
});

test('threads 資料格式不正確時規劃失敗', () => {
  withRepo(({ dir, write, commit }) => {
    write('a.txt', 'a\n');
    const base = commit('base');
    write('a.txt', 'b\n');
    const head = commit('head');
    assert.throws(() => buildPlan({ cwd: dir, base, head, threads: [{ id: 'x', path: 'a.txt', line: '3', comment: '' }] }), PlanError);
    assert.throws(() => buildPlan({ cwd: dir, base, head, threads: {} }), PlanError);
  });
});

// spectra-scenario: pr-ai-review / Earlier optional suggestion is resolved without a judgement
test('上一輪討論串的嚴重程度從留言開頭的標籤讀出；🟢 分類為 nit、不放進提示詞，讀不出來時視為 warning', () => {
  withRepo(({ dir, write, commit }) => {
    write('a.ts', 'export const a = 1;\n');
    const base = commit('base');
    write('a.ts', 'export const a = 2;\n');
    const head = commit('head');

    const threads = [
      { id: 'T-nit', path: 'a.ts', line: 1, comment: '**🟢 可選優化｜命名可以更清楚**\n\n細節 <!-- lkai-review-comment -->' },
      { id: 'T-blocker', path: 'a.ts', line: 1, comment: '**🔴 阻擋合併｜會讓資料遺失**\n\n細節' },
      { id: 'T-plain', path: 'a.ts', line: 1, comment: '沒有標籤的留言' },
      // 檔案已不在 diff 內的 🟢 也是 nit：不擋合併，與檔案狀態無關
      { id: 'T-nit-gone', path: 'gone.ts', line: null, comment: '**🟢 可選優化｜其他檔案**' },
    ];
    const { plan, prompts } = buildPlan({ cwd: dir, base, head, threads });

    assert.deepEqual(
      plan.previousThreads.map((thread) => [thread.id, thread.severity, thread.disposition, thread.chunk]),
      [
        ['T-nit', 'nit', 'nit', null],
        ['T-blocker', 'blocker', 'ask', 1],
        ['T-plain', 'warning', 'ask', 1],
        ['T-nit-gone', 'nit', 'nit', null],
      ],
    );
    assert.equal(prompts.length, 1);
    assert.match(prompts[0], /### P2｜a\.ts/);
    assert.match(prompts[0], /### P3｜a\.ts/);
    assert.doesNotMatch(prompts[0], /### P1｜/);
    assert.doesNotMatch(prompts[0], /命名可以更清楚/);
    assert.doesNotMatch(prompts[0], /### P4｜/);
  });
});

// spectra-scenario: pr-ai-review / Overview stays bounded for a pull request with many files / overview of chunk 1
test('精簡總覽：本段全部列出，其他檔案最多 100 筆並附上沒有列出的數量，自動產生檔只寫數量', () => {
  const file = (path, category, chunk, status = 'modified') => ({ path, oldPath: null, status, category, lines: 1, chunk, truncated: false });
  const own = ['a1.ts', 'a2.ts', 'a3.ts'].map((path) => file(path, 'reviewed', 1));
  const deleted = ['gone1.ts', 'gone2.ts'].map((path) => file(path, 'deleted', null, 'deleted'));
  const chunk2 = (count) => Array.from({ length: count }, (_, i) => file(`b/${String(i).padStart(3, '0')}.ts`, 'reviewed', 2));
  const generated = (count) => Array.from({ length: count }, (_, i) => file(`gen/${i}.yaml`, 'generated', null));
  const listedIn = (text) => text.split('\n').filter((line) => line.startsWith('- ') && !line.startsWith('- 另有'));

  // 第一列：其他檔案 42 筆，沒有超過上限；500 個自動產生檔只寫數量
  const first = renderOverview([...own, ...deleted, ...chunk2(40), ...generated(500)], 1);
  assert.equal(listedIn(first).length, 3 + 2 + 40);
  assert.match(first, /^本段的檔案：\n- a1\.ts：修改，送審，第 1 段/);
  // 刪除的檔案排在其他檔案的最前面
  assert.match(first, /其他檔案：\n- gone1\.ts：刪除，已刪除/);
  assert.match(first, /已略過的自動產生檔案：500 個/);
  assert.doesNotMatch(first, /gen\/0\.yaml/);
  assert.doesNotMatch(first, /另有/);

  // 第二列：其他檔案 152 筆，只列出 100 筆，另一行說明第 2 段還有 52 個沒有列出
  const second = renderOverview([...own, ...deleted, ...chunk2(150)], 1);
  const listed = listedIn(second);
  assert.equal(listed.length, 3 + 2 + 98);
  assert.equal(listed.filter((line) => line.startsWith('- b/')).length, 98);
  assert.match(second, /- 另有 52 個檔案沒有列出：第 2 段 52 個/);
  assert.doesNotMatch(second, /自動產生/);
});

// spectra-scenario: pr-ai-review / Thread about a deletion stays open
// spectra-scenario: pr-ai-review / Unfixed issue keeps the thread open / which threads are resolved
test('刪除檔案上的討論串：留言建立時檔案還存在才分類為 deleted，否則與 commit 取不到時一樣保留', () => {
  withRepo(({ write, remove, commit, dir }) => {
    write('code.ts', 'export const c = 1;\n');
    write('tests.ts', 'export const t = 1;\n');
    write('keep.ts', 'export const k = 1;\n');
    const base = commit('base');
    // 第一個 commit：刪除 tests.ts（AI 對這個刪除留言），code.ts 仍存在（AI 對程式碼留言）
    remove('tests.ts');
    write('keep.ts', 'export const k = 2;\n');
    const first = commit('first');
    // 第二個 commit：code.ts 也被刪除
    remove('code.ts');
    const head = commit('head');

    const threads = [
      { id: 'T-code', path: 'code.ts', line: 1, comment: '**🟡 建議修正｜程式碼的問題**', commit: first },
      { id: 'T-deletion', path: 'tests.ts', line: null, comment: '**🔴 阻擋合併｜整個測試檔被移除**', commit: first },
      { id: 'T-missing', path: 'code.ts', line: 1, comment: '**🟡 建議修正｜commit 已不在**', commit: 'f'.repeat(40) },
      { id: 'T-none', path: 'code.ts', line: 1, comment: '**🟡 建議修正｜沒有 commit**', commit: null },
      { id: 'T-bad', path: 'code.ts', line: 1, comment: '**🟡 建議修正｜不是 SHA**', commit: '--output=x' },
    ];
    const { plan } = buildPlan({ cwd: dir, base, head, threads });
    assert.deepEqual(
      Object.fromEntries(plan.previousThreads.map((thread) => [thread.id, thread.disposition])),
      { 'T-code': 'deleted', 'T-deletion': 'keep', 'T-missing': 'keep', 'T-none': 'keep', 'T-bad': 'keep' },
    );
    assert.equal(plan.files.find((file) => file.path === 'tests.ts').category, 'deleted');
  });
});
