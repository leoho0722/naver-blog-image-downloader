// plan.mjs 與 `ai-review.mjs plan` 的測試：以暫存的 git repo 驗證檔案分類、切段與提示詞。

import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { buildPlan, PlanError } from './plan.mjs';

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
test('檔案分類：依 base 的 .gitattributes 判斷自動產生檔，刪除與二進位只列在總覽', () => {
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

    // 提示詞：總覽列出所有檔案（含略過原因），patch 只含送審的檔案
    assert.equal(prompts.length, 1);
    const prompt = prompts[0];
    assert.match(prompt, /- \.agents\/skills\/spectra-apply\/SKILL\.md：修改，已略過（自動產生）/);
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
