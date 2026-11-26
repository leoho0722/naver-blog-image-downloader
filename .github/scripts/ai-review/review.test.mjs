// review.mjs 與 `ai-review.mjs synthesis-prompt`／`build-review` 的測試。

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { buildReview, COMMENT_MARKER, loadChunkResults, REVIEW_MARKER, ReviewError, runMarker } from './review.mjs';

const CLI = join(dirname(fileURLToPath(import.meta.url)), 'ai-review.mjs');
const HEAD = 'a'.repeat(40);
const RUN_ID = '123-1';

/**
 * 產生一份 plan：每段的檔案都是 reviewed，可留言行是 1–20。
 *
 * @param {string[][]} chunkFiles 每段的檔案
 * @param {Array<object>} [extraFiles] 其他分類的檔案
 */
function makePlan(chunkFiles, extraFiles = []) {
  const files = [];
  const commentable = {};
  const chunks = chunkFiles.map((paths, i) => {
    for (const path of paths) {
      files.push({ path, oldPath: null, status: 'modified', category: 'reviewed', lines: 10, chunk: i + 1, truncated: false });
      commentable[path] = [[1, 20]];
    }
    return { index: i + 1, files: paths, lines: paths.length * 10 };
  });
  return {
    baseSha: 'b'.repeat(40),
    headSha: HEAD,
    gitattributesChanged: false,
    maxChunkLines: 6000,
    files: [...files, ...extraFiles],
    chunks,
    commentable,
  };
}

/** 包成模型的回答格式 */
const answer = (value) => `\`\`\`json\n${JSON.stringify(value)}\n\`\`\`\n`;

const finding = (path, line, severity = 'warning', title = '標題', body = '說明') => ({ path, line, severity, title, body });

/**
 * 在暫存資料夾寫出各段的 lkai 結果，執行 callback 後刪除。
 *
 * @param {Array<{ status: string | null, out: string }>} chunks status 為 null 表示沒有結果檔
 * @param {(dir: string) => void} callback
 */
function withResults(chunks, callback) {
  const dir = mkdtempSync(join(tmpdir(), 'ai-review-results-'));
  try {
    chunks.forEach((chunk, i) => {
      writeFileSync(join(dir, `chunk-${i + 1}.out`), chunk.out);
      if (chunk.status !== null) {
        writeFileSync(join(dir, `chunk-${i + 1}.status`), `${chunk.status}\n`);
      }
    });
    callback(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** 直接以 buildReview 組出結果 */
function build(plan, chunkOutputs, options = {}) {
  let output;
  withResults(chunkOutputs, (dir) => {
    output = buildReview({
      plan,
      results: loadChunkResults(plan, dir),
      synthesisRaw: options.synthesisRaw ?? null,
      headSha: options.headSha ?? HEAD,
      runId: RUN_ID,
      warnChunks: options.warnChunks,
      modelLabel: 'anthropic / claude-opus-5-5',
    });
  });
  return output;
}

const ok = (value) => ({ status: '0', out: answer(value) });

// spectra-scenario: pr-ai-review / Single chunk skips synthesis
test('只有一段時不送彙整請求，直接使用那一段的總評，並發出 inline comment', () => {
  const plan = makePlan([['apps/web/src/a.ts']]);
  const chunk = ok({ summary: '只有一段的總評', verdict: 'changes_suggested', findings: [finding('apps/web/src/a.ts', 5)] });

  withResults([chunk], (dir) => {
    const planPath = join(dir, 'plan.json');
    writeFileSync(planPath, JSON.stringify(plan));
    const prompt = join(dir, 'synthesis.md');
    const result = spawnSync(process.execPath, [CLI, 'synthesis-prompt', '--plan', planPath, '--results', dir, '--out', prompt], {
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(existsSync(prompt), false);
  });

  const { review, outcome } = build(plan, [chunk]);
  assert.ok(review.body.startsWith(`${REVIEW_MARKER}\n${runMarker(RUN_ID)}`));
  assert.match(review.body, /只有一段的總評/);
  assert.match(review.body, /整體結論：🟡 可接受但建議調整/);
  assert.equal(review.commit_id, HEAD);
  assert.equal(review.event, 'COMMENT');
  assert.equal(review.comments.length, 1);
  assert.deepEqual(
    { path: review.comments[0].path, line: review.comments[0].line, side: review.comments[0].side },
    { path: 'apps/web/src/a.ts', line: 5, side: 'RIGHT' },
  );
  assert.ok(review.comments[0].body.endsWith(COMMENT_MARKER));
  assert.equal(outcome.verdict, 'changes_suggested');
  assert.deepEqual(outcome.failedChunks, []);
  assert.deepEqual(outcome.warnings, []);
});

// spectra-scenario: pr-ai-review / Synthesis failure falls back to chunk summaries
test('兩段以上但彙整失敗時，改列各段總評並記錄警告', () => {
  const plan = makePlan([['a.ts'], ['b.ts']]);
  const chunks = [
    ok({ summary: '第一段總評', verdict: 'no_concerns', findings: [] }),
    ok({ summary: '第二段總評', verdict: 'no_concerns', findings: [] }),
  ];
  const { review, outcome } = build(plan, chunks, { synthesisRaw: '這不是 JSON' });
  assert.match(review.body, /- 第 1 段：第一段總評\n- 第 2 段：第二段總評/);
  assert.ok(outcome.warnings.some((warning) => warning.includes('彙整總評失敗')));
  assert.equal(outcome.verdict, 'no_concerns');
  assert.deepEqual(outcome.failedChunks, []);
});

test('兩段以上且彙整成功時，使用彙整的總評與結論；彙整提示詞附上程式計算的結論', () => {
  const plan = makePlan([['a.ts'], ['b.ts']]);
  const chunks = [
    ok({ summary: '第一段總評', verdict: 'blocker', findings: [finding('a.ts', 3, 'blocker', '嚴重問題')] }),
    ok({ summary: '第二段總評', verdict: 'no_concerns', findings: [] }),
  ];
  withResults(chunks, (dir) => {
    const planPath = join(dir, 'plan.json');
    writeFileSync(planPath, JSON.stringify(plan));
    const prompt = join(dir, 'synthesis.md');
    const result = spawnSync(process.execPath, [CLI, 'synthesis-prompt', '--plan', planPath, '--results', dir, '--out', prompt], {
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr);
    const text = readFileSync(prompt, 'utf8');
    assert.match(text, /程式計算的整體結論：🔴 有阻擋合併的問題/);
    assert.match(text, /🔴 阻擋合併｜嚴重問題（a\.ts:3）/);
    assert.doesNotMatch(text, /\|\+/); // 不附程式碼
  });

  const { review, outcome } = build(plan, chunks, {
    synthesisRaw: answer({ summary: '彙整後的總評', conclusion: '請先修正阻擋問題' }),
  });
  assert.match(review.body, /#### 總評\n\n彙整後的總評/);
  assert.match(review.body, /#### 最終結論\n\n請先修正阻擋問題/);
  assert.equal(outcome.verdict, 'blocker');
});

// spectra-scenario: pr-ai-review / One chunk fails
test('三段中一段失敗：列出失敗段落與檔案，結論為審查不完整，該段檔案的舊討論串保留', () => {
  const plan = makePlan([['a.ts'], ['b.ts', 'b.test.ts'], ['c.ts']]);
  const chunks = [
    ok({ summary: '一', verdict: 'no_concerns', findings: [finding('a.ts', 2, 'nit')] }),
    { status: '1', out: '' },
    ok({ summary: '三', verdict: 'no_concerns', findings: [] }),
  ];
  const { review, outcome } = build(plan, chunks, { synthesisRaw: answer({ summary: '彙整', conclusion: '結論' }) });
  assert.deepEqual(outcome.failedChunks, [2]);
  assert.equal(outcome.verdict, 'incomplete');
  assert.match(review.body, /整體結論：⚠️ 審查不完整/);
  assert.match(review.body, /#### 審查失敗的段落\n\n- 第 2 段（`b\.ts`、`b\.test\.ts`）：lkai 執行失敗（退出碼 1）/);
  assert.deepEqual(outcome.keepThreadPaths.sort(), ['b.test.ts', 'b.ts']);
  // 成功段落的意見照常發布
  assert.equal(review.comments.length, 1);

  // 有 🔴 意見時，結論仍是阻擋合併
  const withBlocker = build(plan, [ok({ summary: '一', verdict: 'blocker', findings: [finding('a.ts', 2, 'blocker')] }), chunks[1], chunks[2]]);
  assert.equal(withBlocker.outcome.verdict, 'blocker');
});

// spectra-scenario: pr-ai-review / Answer without a valid JSON block fails the chunk
test('回答不是合格的 JSON：該段失敗，原始回答放進摺疊區塊；回答不完整也視為失敗', () => {
  const plan = makePlan([['a.ts'], ['b.ts']]);
  const { review, outcome } = build(plan, [
    { status: '0', out: '我忘了輸出 JSON </details> 還有 ```' },
    { status: '2', out: '```json\n{"summary": "被截斷' },
  ]);
  assert.deepEqual(outcome.failedChunks, [1, 2]);
  assert.match(review.body, /第 1 段（`a\.ts`）：回答格式不合格/);
  assert.match(review.body, /第 2 段（`b\.ts`）：回答不完整/);
  assert.match(review.body, /<summary>第 1 段的原始回答<\/summary>/);
  assert.match(review.body, /&lt;\/details> 還有/);
  assert.match(review.body, /\n````\n我忘了輸出 JSON/);
});

test('所有段落都失敗：總評說明沒有有效結果，結論為審查不完整', () => {
  const plan = makePlan([['a.ts'], ['b.ts']]);
  const { review, outcome } = build(plan, [
    { status: '1', out: '' },
    { status: null, out: '' },
  ]);
  assert.equal(outcome.verdict, 'incomplete');
  assert.deepEqual(outcome.failedChunks, [1, 2]);
  assert.match(review.body, /沒有任何段落取得有效的審查結果/);
  assert.match(review.body, /第 2 段（`b\.ts`）：沒有這一段的執行結果/);
});

// spectra-scenario: pr-ai-review / Head commit mismatch stops publication
test('head SHA 與規劃不一致時不產出 review，命令列以 1 結束', () => {
  const plan = makePlan([['a.ts']]);
  const chunk = ok({ summary: 's', verdict: 'no_concerns', findings: [] });
  assert.throws(() => build(plan, [chunk], { headSha: 'c'.repeat(40) }), ReviewError);

  withResults([chunk], (dir) => {
    const planPath = join(dir, 'plan.json');
    writeFileSync(planPath, JSON.stringify(plan));
    const out = join(dir, 'review');
    const result = spawnSync(
      process.execPath,
      [CLI, 'build-review', '--plan', planPath, '--results', dir, '--head-sha', 'c'.repeat(40), '--run-id', RUN_ID, '--out', out],
      { encoding: 'utf8' },
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, /head SHA/);
    assert.equal(existsSync(join(out, 'outcome.json')), false);
    assert.equal(existsSync(join(out, 'review.json')), false);
  });
});

test('命令列 build-review 寫出四個檔案', () => {
  const plan = makePlan([['a.ts']]);
  withResults([ok({ summary: 's', verdict: 'no_concerns', findings: [finding('a.ts', 99)] })], (dir) => {
    const planPath = join(dir, 'plan.json');
    writeFileSync(planPath, JSON.stringify(plan));
    const out = join(dir, 'review');
    const result = spawnSync(
      process.execPath,
      [CLI, 'build-review', '--plan', planPath, '--results', dir, '--head-sha', HEAD, '--run-id', RUN_ID, '--out', out],
      { encoding: 'utf8' },
    );
    assert.equal(result.status, 0, result.stderr);
    for (const name of ['review.json', 'review-body-only.json', 'summary.md', 'outcome.json']) {
      assert.equal(existsSync(join(out, name)), true, name);
    }
    const review = JSON.parse(readFileSync(join(out, 'review.json'), 'utf8'));
    // 第 99 行不在可留言行內：放進本文
    assert.equal(review.comments.length, 0);
    assert.match(review.body, /#### 無法標在程式碼行上的意見[\s\S]*`a\.ts:99`/);
    const bodyOnly = JSON.parse(readFileSync(join(out, 'review-body-only.json'), 'utf8'));
    assert.equal(bodyOnly.comments, undefined);
    assert.match(bodyOnly.body, /inline comment 無法發布/);
  });
});

// spectra-scenario: pr-ai-review / Nothing is reviewable
test('沒有可審查的檔案：說明沒有可審查內容，結論為無疑慮', () => {
  const plan = makePlan([], [
    { path: 'pnpm-lock.yaml', oldPath: null, status: 'modified', category: 'generated', lines: 0, chunk: null, truncated: false },
    { path: 'gone.ts', oldPath: null, status: 'deleted', category: 'deleted', lines: 0, chunk: null, truncated: false },
  ]);
  const { review, outcome } = build(plan, []);
  assert.equal(outcome.verdict, 'no_concerns');
  assert.match(review.body, /沒有可以審查的變更/);
  assert.match(review.body, /已略過的自動產生檔案（1 個）[\s\S]*`pnpm-lock\.yaml`/);
  assert.deepEqual(review.comments, []);
  assert.deepEqual(outcome.keepThreadPaths, ['pnpm-lock.yaml']);
});

test('段數超過 WARN_CHUNKS 時，本文開頭（識別標記之後）就是警告', () => {
  const plan = makePlan(Array.from({ length: 7 }, (_, i) => [`f${i}.ts`]));
  const chunks = plan.chunks.map(() => ok({ summary: 's', verdict: 'no_concerns', findings: [] }));
  const { review, outcome } = build(plan, chunks, { warnChunks: 6, synthesisRaw: answer({ summary: '彙整', conclusion: '結論' }) });
  const afterMarkers = review.body.split('\n\n')[1];
  assert.match(afterMarkers, /^> ⚠️ 這個 PR 分成 7 段審查，超過 6 段/);
  assert.ok(outcome.warnings.some((warning) => warning.includes('超過 6 段')));
});

test('模型文字經過清理：@mention 被中和、HTML 註解無法成立', () => {
  const plan = makePlan([['a.ts']]);
  const { review } = build(plan, [
    ok({
      summary: '請 @octocat 看一下 <!-- 偷藏 -->',
      verdict: 'changes_suggested',
      findings: [finding('a.ts', 1, 'warning', 'cc @org/team', '假冒標記 <!-- lkai-review-comment -->')],
    }),
  ]);
  assert.match(review.body, /請 @​octocat 看一下 &lt;!-- 偷藏 --&gt;/);
  const comment = review.comments[0].body;
  assert.match(comment, /cc @​org\/team/);
  assert.match(comment, /假冒標記 &lt;!-- lkai-review-comment --&gt;/);
  // 只有結尾那一個是真正的識別標記
  assert.equal(comment.split(COMMENT_MARKER).length, 2);
  assert.ok(comment.endsWith(COMMENT_MARKER));
});

test('本文超過長度上限時截斷並記錄警告，summary.md 保有全部意見', () => {
  const plan = makePlan([['a.ts']]);
  const many = Array.from({ length: 400 }, (_, i) => finding('a.ts', null, 'nit', `意見 ${i}`, 'x'.repeat(300)));
  const { review, summaryMarkdown, outcome } = build(plan, [ok({ summary: 's', verdict: 'changes_suggested', findings: many })]);
  assert.ok(review.body.length <= 60000);
  assert.ok(review.body.startsWith(REVIEW_MARKER));
  assert.match(review.body, /另有 \d+ 項意見因長度上限未列出/);
  assert.ok(outcome.warnings.some((warning) => warning.includes('長度上限')));
  assert.match(summaryMarkdown, /意見 399/);
});

test('PR 修改 .gitattributes 時本文會提示；截斷、自動產生、二進位檔案上的舊討論串保留，刪除的不保留', () => {
  const plan = makePlan([['a.ts', 'big.ts']], [
    { path: 'gen.yaml', oldPath: null, status: 'modified', category: 'generated', lines: 0, chunk: null, truncated: false },
    { path: 'img.png', oldPath: null, status: 'added', category: 'binary', lines: 0, chunk: null, truncated: false },
    { path: 'gone.ts', oldPath: null, status: 'deleted', category: 'deleted', lines: 0, chunk: null, truncated: false },
  ]);
  plan.gitattributesChanged = true;
  plan.files.find((file) => file.path === 'big.ts').truncated = true;
  const { review, outcome } = build(plan, [ok({ summary: 's', verdict: 'no_concerns', findings: [] })]);
  assert.match(review.body, /這個 PR 修改了 `\.gitattributes`/);
  assert.match(review.body, /只審查了前段：`big\.ts`/);
  assert.deepEqual(outcome.keepThreadPaths.sort(), ['big.ts', 'gen.yaml', 'img.png']);
});
