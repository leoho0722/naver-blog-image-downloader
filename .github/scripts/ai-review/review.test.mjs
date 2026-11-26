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
  assert.match(review.body, /整體結論：🟡 有建議修正的問題/);
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
  plan.previousThreads = [{ ref: 'P1', id: 'T-b', path: 'b.ts', filePath: 'b.ts', line: 1, comment: 'x', chunk: 2, disposition: 'ask' }];
  const chunks = [
    ok({ summary: '一', verdict: 'no_concerns', findings: [finding('a.ts', 2)] }),
    { status: '1', out: '' },
    ok({ summary: '三', verdict: 'no_concerns', findings: [] }),
  ];
  const { review, outcome } = build(plan, chunks, { synthesisRaw: answer({ summary: '彙整', conclusion: '結論' }) });
  assert.deepEqual(outcome.failedChunks, [2]);
  assert.equal(outcome.verdict, 'incomplete');
  assert.match(review.body, /整體結論：⚠️ 審查不完整/);
  assert.match(review.body, /#### 審查失敗的段落\n\n- 第 2 段（`b\.ts`、`b\.test\.ts`）：lkai 執行失敗（退出碼 1）/);
  // 失敗段落上的舊討論串維持不動
  assert.deepEqual(outcome.threadActions, []);
  assert.equal(outcome.threadSummary.kept, 1);
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

test('命令列 build-review 寫出六個檔案', () => {
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
    for (const name of ['review.json', 'review-body-only.json', 'file-comments.json', 'file-comments-fallback.json', 'summary.md', 'outcome.json']) {
      assert.equal(existsSync(join(out, name)), true, name);
    }
    const review = JSON.parse(readFileSync(join(out, 'review.json'), 'utf8'));
    // 第 99 行不在可留言行內：🟡 改發檔案層級留言，也列在本文
    assert.equal(review.comments.length, 0);
    assert.match(review.body, /#### 無法標在程式碼行上的意見[\s\S]*`a\.ts:99`/);
    const fileComments = JSON.parse(readFileSync(join(out, 'file-comments.json'), 'utf8'));
    assert.deepEqual(fileComments.map((comment) => comment.path), ['a.ts']);
    const fallback = JSON.parse(readFileSync(join(out, 'file-comments-fallback.json'), 'utf8'));
    assert.deepEqual(fallback.map((comment) => comment.path), ['a.ts']);
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
  assert.deepEqual(outcome.threadActions, []);
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
      summary: '請 @octocat 看一下 <!-- 偷藏 --> <details><summary>藏起來</summary>',
      verdict: 'changes_suggested',
      findings: [finding('a.ts', 1, 'warning', 'cc @org/team', '假冒標記 <!-- lkai-review-comment -->')],
    }),
  ]);
  assert.match(review.body, /請 @​octocat 看一下 &lt;!-- 偷藏 --&gt;/);
  // 總評中的 <details> 不會在本文形成摺疊區塊：本文裡真正的 <details> 只有程式自己產生的區塊
  assert.doesNotMatch(review.body, /<details>\s*<summary>藏起來/);
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
  // job summary 不帶「inline comment 無法發布」的提示
  assert.doesNotMatch(summaryMarkdown, /inline comment 無法發布/);
});

test('PR 修改 .gitattributes 時本文會提示，被截斷的檔案列在審查範圍', () => {
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
  assert.deepEqual(outcome.threadActions, []);
});

// spectra-scenario: pr-ai-review / Model text is sanitized
test('落到本文的意見：模型給的 path 放進無法跳出的 code span', () => {
  const plan = makePlan([['a.ts']]);
  const { review } = build(plan, [
    ok({ summary: 's', verdict: 'changes_suggested', findings: [finding('x` @org/team <!-- y', null, 'nit', 't', 'b')] }),
  ]);
  // 路徑含一個反引號，所以用兩個反引號包住；@ 與 <!-- 都在 code span 內，不會生效
  assert.match(review.body, /（``x` @org\/team <!-- y``）/);
  assert.equal(review.comments.length, 0);
});

test('失敗原因中的模型原文會被清理後才放進本文', () => {
  const plan = makePlan([['a.ts']]);
  const { review } = build(plan, [{ status: '0', out: '```json\n@octocat <!-- 偷藏\n```' }]);
  const line = review.body.split('\n').find((text) => text.startsWith('- 第 1 段'));
  assert.ok(line, review.body);
  assert.match(line, /回答格式不合格/);
  assert.doesNotMatch(line, /@octocat/);
  assert.doesNotMatch(line, /<!--/);
});

// spectra-scenario: pr-ai-review / Findings are routed to inline comments or the body / finding routing
test('意見指向其他段的檔案時不發成 inline comment：模型沒看過那個檔案的內容，🟡 改發檔案層級留言', () => {
  const plan = makePlan([['a.ts'], ['b.ts']]);
  const { review, fileComments } = build(
    plan,
    [
      ok({ summary: '一', verdict: 'changes_suggested', findings: [finding('b.ts', 5, 'warning', '猜測的問題'), finding('a.ts', 3)] }),
      ok({ summary: '二', verdict: 'no_concerns', findings: [] }),
    ],
    { synthesisRaw: answer({ summary: '彙整', conclusion: '結論' }) },
  );
  assert.deepEqual(
    review.comments.map((comment) => `${comment.path}:${comment.line}`),
    ['a.ts:3'],
  );
  assert.match(review.body, /猜測的問題\*\*（`b\.ts:5`）/);
  assert.deepEqual(fileComments.map((comment) => comment.path), ['b.ts']);
});

test('標題的換行換成空白，內文未閉合的 code fence 會補上，不會吞掉後面的本文', () => {
  const plan = makePlan([['a.ts']]);
  const { review } = build(plan, [
    ok({
      summary: '總評',
      verdict: 'changes_suggested',
      findings: [finding('a.ts', null, 'nit', '第一行\n第二行', '範例：\n```ts\nconst a = 1;'), finding('a.ts', null, 'nit', '下一項', 'x')],
    }),
  ]);
  assert.match(review.body, /\*\*第一行 第二行\*\*/);
  // 補上的結尾 fence 在下一項意見之前
  const closedAt = review.body.indexOf('const a = 1;\n  ```');
  assert.ok(closedAt > 0, review.body);
  assert.ok(closedAt < review.body.indexOf('下一項'));
});

// spectra-scenario: pr-ai-review / Confirmed fix resolves the thread with a reply
// spectra-scenario: pr-ai-review / Unfixed issue keeps the thread open
// spectra-scenario: pr-ai-review / Unfixed issue keeps the thread open / which threads are resolved
test('上一輪的討論串：只有確認已修正與檔案已沒有變更的會收掉，並附上回覆', () => {
  const plan = makePlan([['a.ts'], ['b.ts']]);
  const thread = (ref, path, disposition, chunk = null, line = 3) => ({ ref, id: `T-${ref}`, path, filePath: path, line, comment: 'x', chunk, disposition });
  plan.previousThreads = [
    thread('P1', 'a.ts', 'ask', 1),
    thread('P2', 'a.ts', 'ask', 1, 7),
    thread('P3', 'a.ts', 'ask', 1, 9),
    thread('P4', 'b.ts', 'ask', 2),
    thread('P5', 'kept.ts', 'no-longer-changed'),
    thread('P6', 'gone.ts', 'deleted'),
    thread('P7', 'big.ts', 'keep'),
  ];
  const { review, outcome } = build(
    plan,
    [
      ok({
        summary: '一',
        verdict: 'no_concerns',
        findings: [],
        previousThreads: [
          { ref: 'P1', fixed: true, note: '已改用 @octocat 建議的寫法\n<!-- x -->' },
          { ref: 'P2', fixed: false, note: '仍然存在' },
          // P3 沒有判斷；P4 不屬於這一段，判斷會被忽略
          { ref: 'P4', fixed: true, note: '不是這一段的討論串' },
        ],
      }),
      { status: '1', out: '' },
    ],
  );
  assert.deepEqual(
    outcome.threadActions.map((action) => [action.id, action.reason]),
    [
      ['T-P1', 'fixed'],
      ['T-P5', 'no-longer-changed'],
      ['T-P6', 'deleted'],
    ],
  );
  const fixedReply = outcome.threadActions[0].reply;
  assert.match(fixedReply, /^✅ 新一輪 AI 審查（aaaaaaa）確認這個問題已修正：已改用 @\u200Boctocat 建議的寫法 &lt;!-- x --&gt;$/);
  assert.match(outcome.threadActions[1].reply, /沒有可審查的內容（aaaaaaa）/);
  assert.match(outcome.threadActions[2].reply, /已在最新的變更中刪除（aaaaaaa）/);
  assert.deepEqual(outcome.threadSummary, { fixed: 1, notFixed: 2, noLongerChanged: 2, kept: 2, nit: 0 });
  // 仍未收掉的討論串（未修正、沒有判斷、失敗段落、保留）都是 warning，計入整體結論
  assert.equal(outcome.verdict, 'incomplete');
  assert.match(review.body, /#### 上一輪意見的追蹤/);
  assert.match(review.body, /- 確認已修正並收掉：1 則/);
  assert.match(review.body, /- 仍未修正或沒有判斷（維持未 resolve）：2 則（`a\.ts:7`、`a\.ts:9`）/);
  assert.match(review.body, /- 檔案已沒有可審查的變更而收掉：2 則/);
  assert.match(review.body, /- 這一輪沒有重新審查而維持不動：2 則/);
});

test('沒有上一輪的討論串時，本文不出現追蹤區塊', () => {
  const plan = makePlan([['a.ts']]);
  const { review, outcome } = build(plan, [ok({ summary: 's', verdict: 'no_concerns', findings: [] })]);
  assert.doesNotMatch(review.body, /上一輪意見的追蹤/);
  assert.deepEqual(outcome.threadActions, []);
  assert.deepEqual(outcome.threadSummary, { fixed: 0, notFixed: 0, noLongerChanged: 0, kept: 0, nit: 0 });
});

// spectra-scenario: pr-ai-review / Findings are routed to inline comments or the body / finding routing
// spectra-scenario: pr-ai-review / Optional suggestions stay in the body
// spectra-scenario: pr-ai-review / Rejected review falls back to a body-only review
// spectra-scenario: pr-ai-review / Lost file-level comment response is not duplicated
test('依嚴重程度分流：🟢 只列在本文，🔴／🟡 不能標在行上時改發檔案層級留言，改發本文版時路徑在 diff 內的 🔴／🟡 都改發', () => {
  const plan = makePlan([['a.ts'], ['b.ts']], [
    { path: 'gen.yaml', oldPath: null, status: 'modified', category: 'generated', lines: 0, chunk: null, truncated: false },
  ]);
  const { review, bodyOnly, fileComments, fallbackFileComments, outcome } = build(
    plan,
    [
      ok({
        summary: '一',
        verdict: 'changes_suggested',
        findings: [
          finding('a.ts', 5, 'warning', '可以標在行上'),
          finding('a.ts', 6, 'nit', '可選的建議'),
          finding('a.ts', null, 'blocker', '整個檔案的問題'),
          finding('gen.yaml', 3, 'warning', '自動產生檔的問題'),
          finding('docs/missing.md', 1, 'blocker', '不在 diff 內'),
        ],
      }),
      ok({ summary: '二', verdict: 'no_concerns', findings: [] }),
    ],
    { synthesisRaw: answer({ summary: '彙整', conclusion: '結論' }) },
  );

  assert.deepEqual(review.comments.map((comment) => `${comment.path}:${comment.line}`), ['a.ts:5']);
  assert.deepEqual(fileComments.map((comment) => comment.path), ['a.ts', 'gen.yaml']);
  assert.match(fileComments[0].body, /^\*\*🔴 阻擋合併｜整個檔案的問題\*\*/);
  // 檔案層級留言在識別標記之前帶著這次 run 的標記；inline comment 不帶
  assert.ok(fileComments.every((comment) => comment.body.endsWith(`\n\n${runMarker(RUN_ID)}\n${COMMENT_MARKER}`)));
  assert.ok(review.comments.every((comment) => !comment.body.includes(runMarker(RUN_ID))));
  // 改發本文版時：inline 的那一則也改發檔案層級留言；不在 diff 內與 🟢 的不發
  assert.deepEqual(
    fallbackFileComments.map((comment) => comment.body.split('\n')[0]),
    ['**🔴 阻擋合併｜整個檔案的問題**', '**🟡 建議修正｜可以標在行上**', '**🟡 建議修正｜自動產生檔的問題**'],
  );
  assert.equal(outcome.fileCommentCount, 2);
  assert.equal(outcome.verdict, 'blocker');

  // 本文：說明三種情況，不在 diff 內的 🔴 標上 ⚠️；inline 的意見不重複列出
  assert.match(review.body, /🔴／🟡 的意見另外以檔案層級留言發布，resolve 前會擋合併。/);
  assert.match(review.body, /🟢 可選優化只列在這裡，不擋合併。/);
  assert.match(review.body, /標示 ⚠️ 的意見找不到對應的檔案，無法留言，不會擋合併，請人工判斷。/);
  assert.match(review.body, /- ⚠️ 🔴 阻擋合併｜\*\*不在 diff 內\*\*（`docs\/missing\.md:1`）/);
  assert.match(review.body, /- 🟢 可選優化｜\*\*可選的建議\*\*（`a\.ts:6`）/);
  assert.doesNotMatch(review.body, /可以標在行上/);
  assert.match(bodyOnly.body, /可以標在行上\*\*（`a\.ts:5`）/);
});

test('只有 🟢 意見時沒有檔案層級留言，本文只說明 🟢 不擋合併，結論為沒有擋合併的問題', () => {
  const plan = makePlan([['a.ts']]);
  const { review, fileComments, fallbackFileComments, outcome } = build(plan, [
    ok({ summary: 's', verdict: 'changes_suggested', findings: [finding('a.ts', 2, 'nit', '小建議')] }),
  ]);
  assert.deepEqual(review.comments, []);
  assert.deepEqual(fileComments, []);
  assert.deepEqual(fallbackFileComments, []);
  assert.equal(outcome.verdict, 'no_concerns');
  assert.match(review.body, /整體結論：🟢 沒有擋合併的問題/);
  assert.match(review.body, /🟢 可選優化只列在這裡，不擋合併。/);
  assert.doesNotMatch(review.body, /檔案層級留言/);
});

// spectra-scenario: pr-ai-review / Earlier optional suggestion is resolved without a judgement
// spectra-scenario: pr-ai-review / Synthesis failure falls back to chunk summaries / overall verdict
test('上一輪的 🟢 討論串直接回覆並收掉；這一輪沒有收掉的 🔴／🟡 討論串計入整體結論', () => {
  const thread = (ref, severity, disposition, chunk = null) => ({
    ref, id: `T-${ref}`, path: 'a.ts', filePath: 'a.ts', line: 3, comment: 'x', severity, chunk, disposition,
  });
  const run = (judgement, severity) => {
    const plan = makePlan([['a.ts']]);
    plan.previousThreads = [thread('P1', 'nit', 'nit'), thread('P2', severity, 'ask', 1)];
    return build(plan, [
      ok({ summary: 's', verdict: 'no_concerns', findings: [finding('a.ts', 2, 'nit')], previousThreads: [{ ref: 'P2', fixed: judgement, note: '說明' }] }),
    ]);
  };

  const notFixed = run(false, 'warning');
  assert.deepEqual(notFixed.outcome.threadActions.map((action) => [action.id, action.reason]), [['T-P1', 'nit']]);
  assert.match(notFixed.outcome.threadActions[0].reply, /^✅ 🟢 可選優化不擋合併，收掉這則討論串（aaaaaaa）/);
  assert.equal(notFixed.outcome.threadSummary.nit, 1);
  assert.match(notFixed.review.body, /- 🟢 可選優化不擋合併而收掉：1 則/);
  assert.equal(notFixed.outcome.verdict, 'changes_suggested');

  assert.equal(run(false, 'blocker').outcome.verdict, 'blocker');
  // 確認已修正的討論串會被收掉，不再計入；只剩 🟢 意見
  const fixed = run(true, 'blocker');
  assert.deepEqual(fixed.outcome.threadActions.map((action) => action.reason), ['nit', 'fixed']);
  assert.equal(fixed.outcome.verdict, 'no_concerns');
});

test('彙整提示詞的整體結論計入仍未收掉的上一輪討論串，並說明有幾則', () => {
  const plan = makePlan([['a.ts'], ['b.ts']]);
  plan.previousThreads = [
    { ref: 'P1', id: 'T-1', path: 'a.ts', filePath: 'a.ts', line: 1, comment: 'x', severity: 'warning', chunk: null, disposition: 'keep' },
  ];
  const chunks = [ok({ summary: '一', verdict: 'no_concerns', findings: [] }), ok({ summary: '二', verdict: 'no_concerns', findings: [] })];
  withResults(chunks, (dir) => {
    const planPath = join(dir, 'plan.json');
    writeFileSync(planPath, JSON.stringify(plan));
    const prompt = join(dir, 'synthesis.md');
    const result = spawnSync(process.execPath, [CLI, 'synthesis-prompt', '--plan', planPath, '--results', dir, '--out', prompt], {
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr);
    const text = readFileSync(prompt, 'utf8');
    assert.match(text, /程式計算的整體結論：🟡 有建議修正的問題/);
    assert.match(text, /另有 1 則上一輪留下、這一輪仍未收掉的 🔴／🟡 意見，已計入整體結論。/);
  });
  const { outcome } = build(plan, chunks, { synthesisRaw: answer({ summary: '彙整', conclusion: '結論' }) });
  assert.equal(outcome.verdict, 'changes_suggested');
});
