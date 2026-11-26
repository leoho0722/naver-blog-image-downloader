// findings.mjs 的單元測試：擷取並驗證模型回答中的 JSON、合併意見、整體結論與意見分流。

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BLOCKING_SEVERITIES,
  CHUNK_VERDICTS,
  SEVERITIES,
  computeVerdict,
  extractLastJsonBlock,
  mergeFindings,
  parseChunkResult,
  parseSynthesisResult,
  routeFindings,
} from './findings.mjs';

// 三個反引號。測試資料需要大量用到，先放進常數避免在字串中到處跳脫
const FENCE = '```';

/** 產生一項合格的意見，可用 overrides 覆寫欄位（值為 undefined 的欄位在轉成 JSON 時會消失） */
const makeFinding = (overrides = {}) => ({
  path: 'apps/web/src/a.ts',
  line: 10,
  severity: 'warning',
  title: '標題',
  body: '說明',
  ...overrides,
});

/** 產生一份合格的單段審查結果，可用 overrides 覆寫欄位 */
const makeChunk = (overrides = {}) => ({
  summary: '摘要',
  verdict: 'changes_suggested',
  findings: [makeFinding()],
  ...overrides,
});

/** 把資料包成模型回答：前面有一段說明文字，最後是 json 區塊 */
const answer = (data, fence = FENCE) => `審查完成，結果如下。\n\n${fence}json\n${JSON.stringify(data, null, 2)}\n${fence}\n`;

test('嚴重程度與段落結論的常數依序由重到輕', () => {
  assert.deepEqual(SEVERITIES, ['blocker', 'warning', 'nit']);
  assert.deepEqual(BLOCKING_SEVERITIES, ['blocker', 'warning']);
  assert.deepEqual(CHUNK_VERDICTS, ['blocker', 'changes_suggested', 'no_concerns']);
});

// spectra-scenario: pr-ai-review / Synthesis failure falls back to chunk summaries / overall verdict
// spectra-scenario: pr-ai-review / Optional suggestions alone keep the verdict clear
test('整體結論：只依意見與仍未收掉的上一輪討論串的嚴重程度、失敗段落數計算', () => {
  // spec「overall verdict」的每一列；各段的 verdict 不影響結果，所以這裡不傳入
  // failed 是失敗的段落數；open 是這一輪不會收掉的上一輪 AI 討論串的嚴重程度
  const rows = [
    { failed: 0, severities: [], open: [], expected: 'no_concerns' },
    { failed: 0, severities: ['nit'], open: [], expected: 'no_concerns' },
    { failed: 0, severities: ['warning', 'blocker'], open: [], expected: 'blocker' },
    { failed: 0, severities: [], open: [], expected: 'no_concerns' },
    { failed: 0, severities: ['nit'], open: ['warning'], expected: 'changes_suggested' },
    { failed: 0, severities: [], open: ['blocker'], expected: 'blocker' },
    { failed: 1, severities: [], open: [], expected: 'incomplete' },
    { failed: 1, severities: ['warning'], open: [], expected: 'incomplete' },
    { failed: 1, severities: ['blocker'], open: [], expected: 'blocker' },
    { failed: 2, severities: [], open: [], expected: 'incomplete' },
  ];
  for (const { failed, severities, open, expected } of rows) {
    const findings = severities.map((severity, index) => makeFinding({ severity, line: index + 1 }));
    assert.equal(
      computeVerdict({ findings, failedChunks: failed, openThreadSeverities: open }),
      expected,
      `失敗 ${failed} 段、意見 ${JSON.stringify(severities)}、未收掉的討論串 ${JSON.stringify(open)}`,
    );
  }
});

test('整體結論：沒有意見時視為沒有疑慮；只有 nit 也一樣，上一輪的 nit 討論串也不影響', () => {
  assert.equal(computeVerdict({ findings: [], failedChunks: 0 }), 'no_concerns');
  assert.equal(computeVerdict({ findings: [makeFinding({ severity: 'nit' })], failedChunks: 0, openThreadSeverities: ['nit'] }), 'no_concerns');
  assert.equal(computeVerdict({ findings: [makeFinding({ severity: 'warning' })], failedChunks: 0 }), 'changes_suggested');
});

test('整體結論：參數型別不對時丟出 TypeError', () => {
  const valid = { findings: [], failedChunks: 0 };
  assert.throws(() => computeVerdict(), TypeError);
  assert.throws(() => computeVerdict(null), TypeError);
  assert.throws(() => computeVerdict({ ...valid, findings: undefined }), TypeError);
  assert.throws(() => computeVerdict({ ...valid, findings: ['不是物件'] }), TypeError);
  assert.throws(() => computeVerdict({ ...valid, findings: [{ severity: 'critical' }] }), TypeError);
  assert.throws(() => computeVerdict({ ...valid, failedChunks: -1 }), TypeError);
  assert.throws(() => computeVerdict({ ...valid, failedChunks: 1.5 }), TypeError);
  assert.throws(() => computeVerdict({ ...valid, failedChunks: '1' }), TypeError);
  assert.throws(() => computeVerdict({ findings: [] }), TypeError);
  assert.throws(() => computeVerdict({ ...valid, openThreadSeverities: 'warning' }), TypeError);
  assert.throws(() => computeVerdict({ ...valid, openThreadSeverities: ['critical'] }), TypeError);
});

// spectra-scenario: pr-ai-review / Findings are routed to inline comments or the body / finding routing
// spectra-scenario: pr-ai-review / Optional suggestions stay in the body
test('意見分流：依 spec「finding routing」的每一列分成 inline、檔案層級留言與只列在本文', () => {
  const inRange = makeFinding({ severity: 'warning', line: 11, title: '在範圍內' });
  const nitInRange = makeFinding({ severity: 'nit', line: 11, title: 'nit 在範圍內' });
  const outOfRange = makeFinding({ severity: 'warning', line: 99, title: '超出範圍' });
  const noLine = makeFinding({ severity: 'blocker', line: null, title: '沒有行號' });
  const generated = makeFinding({ severity: 'warning', path: 'apps/web/pnpm-lock.yaml', line: 5, title: '自動產生的檔案' });
  const otherChunk = makeFinding({ severity: 'warning', path: 'apps/web/src/b.ts', line: 5, title: '其他段的檔案' });
  const notInDiff = makeFinding({ severity: 'blocker', path: 'docs/missing.md', line: 3, title: '不在 diff 內' });

  const result = routeFindings([inRange, nitInRange, outOfRange, noLine, generated, otherChunk, notInDiff], {
    // b.ts 有可留言行，但不是這一段送審的檔案
    commentable: { 'apps/web/src/a.ts': [[10, 12]], 'apps/web/src/b.ts': [[1, 20]] },
    reviewedPaths: new Set(['apps/web/src/a.ts']),
    diffPaths: new Set(['apps/web/src/a.ts', 'apps/web/src/b.ts', 'apps/web/pnpm-lock.yaml']),
  });

  assert.deepEqual(result.inline, [inRange]);
  assert.deepEqual(result.fileLevel, [outOfRange, noLine, generated, otherChunk]);
  assert.deepEqual(result.body, [nitInRange, notInDiff]);
});

test('意見分流：路徑清單可以是陣列，三個結果都維持輸入順序', () => {
  const first = makeFinding({ line: 12, title: '第一' });
  const second = makeFinding({ line: 99, title: '第二' });
  const third = makeFinding({ line: 10, severity: 'nit', title: '第三' });
  const fourth = makeFinding({ line: 10, title: '第四' });
  const fifth = makeFinding({ line: null, title: '第五' });
  const result = routeFindings([first, second, third, fourth, fifth], {
    commentable: { 'apps/web/src/a.ts': [[10, 12]] },
    reviewedPaths: ['apps/web/src/a.ts'],
    diffPaths: ['apps/web/src/a.ts'],
  });
  const titles = (list) => list.map((finding) => finding.title);
  assert.deepEqual(titles(result.inline), ['第一', '第四']);
  assert.deepEqual(titles(result.fileLevel), ['第二', '第五']);
  assert.deepEqual(titles(result.body), ['第三']);
});

test('意見分流：沒有可留言行資料、行號不是整數或路徑碰巧是內建屬性名稱時，不會成為 inline comment', () => {
  const options = {
    commentable: { 'apps/web/src/a.ts': [[1, 5]] },
    reviewedPaths: ['apps/web/src/a.ts', 'constructor'],
    diffPaths: ['apps/web/src/a.ts'],
  };
  const noRanges = makeFinding({ path: 'constructor', line: 1 });
  const stringLine = makeFinding({ line: '3' });
  const fractionLine = makeFinding({ line: 2.5 });
  const result = routeFindings([noRanges, stringLine, fractionLine], options);
  assert.deepEqual(result.inline, []);
  // a.ts 在 diff 內，改發檔案層級留言；constructor 不在 diff 內，只列在本文
  assert.deepEqual(result.fileLevel, [stringLine, fractionLine]);
  assert.deepEqual(result.body, [noRanges]);

  assert.deepEqual(routeFindings([], options), { inline: [], fileLevel: [], body: [] });
});

test('意見分流：參數型別不對時丟出 TypeError', () => {
  const valid = { commentable: {}, reviewedPaths: new Set(), diffPaths: new Set() };
  assert.throws(() => routeFindings(undefined, valid), TypeError);
  assert.throws(() => routeFindings([], undefined), TypeError);
  assert.throws(() => routeFindings([], null), TypeError);
  assert.throws(() => routeFindings([], { ...valid, commentable: undefined }), TypeError);
  assert.throws(() => routeFindings([], { ...valid, commentable: [] }), TypeError);
  assert.throws(() => routeFindings([], { ...valid, reviewedPaths: undefined }), TypeError);
  assert.throws(() => routeFindings([], { ...valid, reviewedPaths: 'apps/web/src/a.ts' }), TypeError);
  assert.throws(() => routeFindings([], { ...valid, reviewedPaths: [1, 2] }), TypeError);
  assert.throws(() => routeFindings([], { ...valid, diffPaths: undefined }), TypeError);
  assert.throws(() => routeFindings([], { ...valid, diffPaths: [1] }), TypeError);
  assert.throws(() => routeFindings(['不是物件'], valid), TypeError);
  assert.throws(() => routeFindings([{ line: 1 }], valid), TypeError);
});

// spectra-scenario: pr-ai-review / Answer without a valid JSON block fails the chunk
test('回答格式不合格：回傳 ok: false 並指出原因，不丟出例外', () => {
  const cases = [
    ['沒有任何 code block', '審查完成，沒有發現問題。', 'json'],
    ['只有其他語言的 code block', `${FENCE}ts\nconst a = 1;\n${FENCE}\n`, 'json'],
    ['JSON 語法錯誤', `${FENCE}json\n{ "summary": \n${FENCE}\n`, 'JSON'],
    ['json 區塊沒有結尾', `${FENCE}json\n${JSON.stringify(makeChunk())}\n`, '結尾'],
    ['最後一個 json 區塊壞掉，即使前一個合格也不採用', `${answer(makeChunk())}\n${FENCE}json\n{ broken\n${FENCE}\n`, 'JSON'],
    ['最後一個 json 區塊沒有結尾，即使前一個合格也不採用', `${answer(makeChunk())}\n${FENCE}json\n{ "summary": "x"\n`, '結尾'],
    ['JSON 內容不是物件', answer([]), '物件'],
    ['JSON 內容是 null', answer(null), '物件'],
    ['缺少 summary', answer(makeChunk({ summary: undefined })), 'summary'],
    ['summary 不是字串', answer(makeChunk({ summary: 3 })), 'summary'],
    ['缺少 verdict', answer(makeChunk({ verdict: undefined })), 'verdict'],
    ['verdict 不合法', answer(makeChunk({ verdict: 'approve' })), 'verdict'],
    ['缺少 findings', answer(makeChunk({ findings: undefined })), 'findings'],
    ['findings 不是陣列', answer(makeChunk({ findings: {} })), 'findings'],
    ['finding 不是物件', answer(makeChunk({ findings: ['x'] })), 'findings[0]'],
    ['path 是空字串', answer(makeChunk({ findings: [makeFinding({ path: '' })] })), 'findings[0].path'],
    ['缺少 path', answer(makeChunk({ findings: [makeFinding({ path: undefined })] })), 'findings[0].path'],
    ['line 是字串 "12"', answer(makeChunk({ findings: [makeFinding({ line: '12' })] })), 'findings[0].line'],
    ['line 是 1.5', answer(makeChunk({ findings: [makeFinding({ line: 1.5 })] })), 'findings[0].line'],
    ['line 是 0', answer(makeChunk({ findings: [makeFinding({ line: 0 })] })), 'findings[0].line'],
    ['line 是負數', answer(makeChunk({ findings: [makeFinding({ line: -3 })] })), 'findings[0].line'],
    ['缺少 line', answer(makeChunk({ findings: [makeFinding({ line: undefined })] })), 'findings[0].line'],
    ['severity 不合法', answer(makeChunk({ findings: [makeFinding({ severity: 'critical' })] })), 'findings[0].severity'],
    ['title 是空字串', answer(makeChunk({ findings: [makeFinding({ title: '' })] })), 'findings[0].title'],
    ['body 不是字串', answer(makeChunk({ findings: [makeFinding({ body: null })] })), 'findings[0].body'],
    [
      '錯誤出在第三項意見時指出索引 2',
      answer(makeChunk({ findings: [makeFinding(), makeFinding(), makeFinding({ line: '12' })] })),
      'findings[2].line',
    ],
  ];
  for (const [name, text, mention] of cases) {
    const result = parseChunkResult(text);
    assert.equal(result.ok, false, name);
    assert.equal(typeof result.error, 'string', name);
    assert.ok(result.error.length > 0, name);
    assert.ok(result.error.includes(mention), `${name}：錯誤訊息應包含「${mention}」，實際是「${result.error}」`);
  }
});

test('回答格式合格：line 可以是 null，findings 可以是空陣列', () => {
  const nullLine = parseChunkResult(answer(makeChunk({ findings: [makeFinding({ line: null })] })));
  assert.equal(nullLine.ok, true);
  assert.equal(nullLine.value.findings[0].line, null);

  const empty = parseChunkResult(answer({ summary: '沒問題', verdict: 'no_concerns', findings: [] }));
  assert.deepEqual(empty, { ok: true, value: { summary: '沒問題', verdict: 'no_concerns', findings: [], previousThreads: [] } });
});

test('有多個 json 區塊時只取最後一個，其他語言的區塊不影響', () => {
  const stale = makeChunk({ summary: '舊的範例', verdict: 'blocker', findings: [] });
  const final = makeChunk({ summary: '最後的結果', verdict: 'no_concerns', findings: [] });
  const text = [
    '先看一個範例：',
    `${FENCE}json\n${JSON.stringify(stale)}\n${FENCE}`,
    '再看一段程式碼：',
    `${FENCE}ts\nconst a = { "summary": "不是這個" };\n${FENCE}`,
    '最後是正式結果：',
    `${FENCE}json\n${JSON.stringify(final)}\n${FENCE}`,
  ].join('\n');

  const result = parseChunkResult(text);
  assert.equal(result.ok, true);
  assert.equal(result.value.summary, '最後的結果');
  assert.equal(result.value.verdict, 'no_concerns');
});

test('開頭用四個反引號也能解析；結尾要至少一樣多的反引號，內容中較少的反引號不會提早結束區塊', () => {
  const four = '`'.repeat(4);
  const five = '`'.repeat(5);
  const data = makeChunk({ findings: [makeFinding({ body: `建議改成：\n${FENCE}ts\nconst a = 1;\n${FENCE}` })] });

  const result = parseChunkResult(answer(data, four));
  assert.equal(result.ok, true);
  assert.equal(result.value.findings[0].body, data.findings[0].body);

  // 獨立一行的三個反引號不會結束四個反引號的區塊；若提早結束，內容會變成合法的 {"a":1}
  const nested = extractLastJsonBlock(`${four}json\n{"a":1}\n${FENCE}\n${four}`);
  assert.equal(nested.ok, false);
  assert.match(nested.error, /JSON/);

  // 五個反引號比四個多，可以結束四個反引號的區塊
  assert.deepEqual(extractLastJsonBlock(`${four}json\n{"a":1}\n${five}`), { ok: true, value: { a: 1 } });
});

test('json 標記不分大小寫、可有前後空白，也能處理 Windows 換行', () => {
  const data = { summary: 'x', conclusion: 'y' };
  const body = JSON.stringify(data);
  for (const opening of ['```JSON', '```Json  ', '``` json']) {
    assert.deepEqual(extractLastJsonBlock(`${opening}\n${body}\n${FENCE}  \n`), { ok: true, value: data }, opening);
  }
  assert.deepEqual(extractLastJsonBlock(`說明\r\n${FENCE}json\r\n${body}\r\n${FENCE}\r\n`), { ok: true, value: data });
});

test('json 標記必須緊接在反引號後面：jsonc、單行行內寫法與兩個反引號都不算 json 區塊', () => {
  const body = JSON.stringify({ a: 1 });
  assert.equal(extractLastJsonBlock(`${FENCE}jsonc\n${body}\n${FENCE}`).ok, false);
  assert.equal(extractLastJsonBlock(`${FENCE}json ${body} ${FENCE}`).ok, false);
  assert.equal(extractLastJsonBlock(`\`\`json\n${body}\n\`\``).ok, false);
});

test('extractLastJsonBlock：成功時回傳解析後的值，非字串時丟出 TypeError', () => {
  assert.deepEqual(extractLastJsonBlock(`${FENCE}json\n[1, 2, 3]\n${FENCE}`), { ok: true, value: [1, 2, 3] });
  assert.throws(() => extractLastJsonBlock(undefined), TypeError);
  assert.throws(() => extractLastJsonBlock(123), TypeError);
  assert.throws(() => parseChunkResult(null), TypeError);
  assert.throws(() => parseSynthesisResult({}), TypeError);
});

test('回答格式合格時，只保留規定的欄位，多餘欄位被丟掉', () => {
  const result = parseChunkResult(
    answer({
      summary: '摘要',
      verdict: 'changes_suggested',
      confidence: 0.9,
      findings: [{ ...makeFinding(), extra: '多餘', suggestion: 'x' }],
    }),
  );
  assert.equal(result.ok, true);
  assert.deepEqual(Object.keys(result.value), ['summary', 'verdict', 'findings', 'previousThreads']);
  assert.deepEqual(Object.keys(result.value.findings[0]), ['path', 'line', 'severity', 'title', 'body']);
  assert.deepEqual(result.value, { summary: '摘要', verdict: 'changes_suggested', findings: [makeFinding()], previousThreads: [] });
});

test('parseSynthesisResult：成功與失敗', () => {
  const ok = parseSynthesisResult(answer({ summary: '整體摘要', conclusion: '可以合併', extra: 1 }));
  assert.deepEqual(ok, { ok: true, value: { summary: '整體摘要', conclusion: '可以合併' } });

  const failures = [
    ['沒有 json 區塊', '沒有 JSON', 'json'],
    ['JSON 語法錯誤', `${FENCE}json\n{\n${FENCE}`, 'JSON'],
    ['JSON 內容不是物件', answer('文字'), '物件'],
    ['缺少 summary', answer({ conclusion: 'y' }), 'summary'],
    ['summary 不是字串', answer({ summary: 1, conclusion: 'y' }), 'summary'],
    ['缺少 conclusion', answer({ summary: 'x' }), 'conclusion'],
    ['conclusion 不是字串', answer({ summary: 'x', conclusion: ['y'] }), 'conclusion'],
  ];
  for (const [name, text, mention] of failures) {
    const result = parseSynthesisResult(text);
    assert.equal(result.ok, false, name);
    assert.ok(result.error.length > 0 && result.error.includes(mention), `${name}：${result.error}`);
  }
});

test('mergeFindings：依嚴重程度、路徑、行號排序，null 行號排在同路徑的數字之後', () => {
  const lists = [
    [
      makeFinding({ severity: 'nit', path: 'a.ts', line: 3, title: 'nit a.ts:3' }),
      makeFinding({ severity: 'blocker', path: 'z.ts', line: 1, title: 'blocker z.ts:1' }),
    ],
    [
      makeFinding({ severity: 'warning', path: 'b.ts', line: null, title: 'warning b.ts:null' }),
      makeFinding({ severity: 'warning', path: 'b.ts', line: 20, title: 'warning b.ts:20' }),
      makeFinding({ severity: 'blocker', path: 'a.ts', line: null, title: 'blocker a.ts:null' }),
      makeFinding({ severity: 'blocker', path: 'a.ts', line: 5, title: 'blocker a.ts:5' }),
      makeFinding({ severity: 'warning', path: 'b.ts', line: 2, title: 'warning b.ts:2' }),
    ],
    [],
  ];
  const merged = mergeFindings(lists);
  assert.deepEqual(
    merged.map((finding) => finding.title),
    [
      'blocker a.ts:5',
      'blocker a.ts:null',
      'blocker z.ts:1',
      'warning b.ts:2',
      'warning b.ts:20',
      'warning b.ts:null',
      'nit a.ts:3',
    ],
  );
});

test('mergeFindings：路徑依 code point 排序，不是 UTF-16 順序', () => {
  // 全形波浪線 U+FF5E 的 code point 比 emoji U+1F600 小，但 UTF-16 單位（0xFF5E 與 0xD83D）剛好相反
  const emoji = makeFinding({ path: '\u{1F600}.ts', title: 'emoji' });
  const fullWidth = makeFinding({ path: '～.ts', title: '全形' });
  assert.deepEqual(
    mergeFindings([[emoji, fullWidth]]).map((finding) => finding.title),
    ['全形', 'emoji'],
  );
});

test('mergeFindings：三項都相同的意見維持輸入順序，回傳新陣列且不改動輸入', () => {
  const first = makeFinding({ title: '第一' });
  const second = makeFinding({ title: '第二' });
  const third = makeFinding({ title: '第三' });
  const unsorted = makeFinding({ severity: 'nit', path: 'a.ts', line: 1, title: '最輕' });
  const list = [unsorted, first, second, third];
  const lists = [list, []];

  const merged = mergeFindings(lists);
  assert.deepEqual(
    merged.map((finding) => finding.title),
    ['第一', '第二', '第三', '最輕'],
  );
  assert.notEqual(merged, list);
  assert.deepEqual(
    list.map((finding) => finding.title),
    ['最輕', '第一', '第二', '第三'],
  );
  assert.deepEqual(lists, [list, []]);
  assert.deepEqual(mergeFindings([]), []);
  assert.deepEqual(mergeFindings([[], []]), []);
});

test('mergeFindings：參數型別不對時丟出 TypeError', () => {
  assert.throws(() => mergeFindings(undefined), TypeError);
  assert.throws(() => mergeFindings('x'), TypeError);
  assert.throws(() => mergeFindings([makeFinding()]), TypeError);
  assert.throws(() => mergeFindings([['x']]), TypeError);
  assert.throws(() => mergeFindings([[{ ...makeFinding(), path: 1 }]]), TypeError);
  assert.throws(() => mergeFindings([[{ ...makeFinding(), severity: 'critical' }]]), TypeError);
  assert.throws(() => mergeFindings([[{ ...makeFinding(), line: '3' }]]), TypeError);
});

// spectra-scenario: pr-ai-review / Answer without a valid JSON block fails the chunk
test('previousThreads：合格時保留 ref、fixed、note，沒有這個欄位時是空陣列', () => {
  const withThreads = parseChunkResult(
    `\`\`\`json\n${JSON.stringify({
      summary: 's',
      verdict: 'no_concerns',
      findings: [],
      previousThreads: [
        { ref: 'P1', fixed: true, note: '已改用 COMMENT_LIMIT', extra: 1 },
        { ref: 'P2', fixed: false, note: '' },
      ],
    })}\n\`\`\``,
  );
  assert.equal(withThreads.ok, true, withThreads.error);
  assert.deepEqual(withThreads.value.previousThreads, [
    { ref: 'P1', fixed: true, note: '已改用 COMMENT_LIMIT' },
    { ref: 'P2', fixed: false, note: '' },
  ]);

  const without = parseChunkResult(`\`\`\`json\n${JSON.stringify({ summary: 's', verdict: 'no_concerns', findings: [] })}\n\`\`\``);
  assert.equal(without.ok, true);
  assert.deepEqual(without.value.previousThreads, []);
});

test('previousThreads 格式不合格時這一段視為失敗，錯誤訊息指出欄位', () => {
  const cases = [
    ['不是陣列', { ref: 'P1', fixed: true, note: '' }, 'previousThreads'],
    ['項目不是物件', ['P1'], 'previousThreads[0]'],
    ['ref 是空字串', [{ ref: ' ', fixed: true, note: '' }], 'ref'],
    ['fixed 不是布林', [{ ref: 'P1', fixed: 'true', note: '' }], 'fixed'],
    ['缺少 note', [{ ref: 'P1', fixed: false }], 'note'],
  ];
  for (const [name, previousThreads, field] of cases) {
    const result = parseChunkResult(
      `\`\`\`json\n${JSON.stringify({ summary: 's', verdict: 'no_concerns', findings: [], previousThreads })}\n\`\`\``,
    );
    assert.equal(result.ok, false, name);
    assert.ok(result.error.includes(field), `${name}：${result.error}`);
  }
});
