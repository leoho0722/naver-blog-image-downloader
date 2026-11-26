// findings.mjs 的單元測試：擷取並驗證模型回答中的 JSON、合併意見、整體結論與意見分流。

import assert from 'node:assert/strict';
import test from 'node:test';

import {
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
  assert.deepEqual(CHUNK_VERDICTS, ['blocker', 'changes_suggested', 'no_concerns']);
});

// spectra-scenario: pr-ai-review / Synthesis failure falls back to chunk summaries / overall verdict
test('整體結論：依各段結論、意見嚴重程度與失敗段落數計算', () => {
  // failed 是失敗的段落數；失敗的段落不會出現在 chunks 中
  const rows = [
    { chunks: ['no_concerns', 'no_concerns'], failed: 0, severities: [], expected: 'no_concerns' },
    { chunks: ['no_concerns', 'changes_suggested'], failed: 0, severities: ['nit'], expected: 'changes_suggested' },
    { chunks: ['changes_suggested', 'no_concerns'], failed: 0, severities: ['warning', 'blocker'], expected: 'blocker' },
    { chunks: ['blocker', 'no_concerns'], failed: 0, severities: [], expected: 'blocker' },
    { chunks: ['no_concerns'], failed: 1, severities: [], expected: 'incomplete' },
    { chunks: ['changes_suggested'], failed: 1, severities: ['blocker'], expected: 'blocker' },
    { chunks: [], failed: 2, severities: [], expected: 'incomplete' },
  ];
  for (const { chunks, failed, severities, expected } of rows) {
    const findings = severities.map((severity, index) => makeFinding({ severity, line: index + 1 }));
    assert.equal(
      computeVerdict({ chunkVerdicts: chunks, findings, failedChunks: failed }),
      expected,
      `各段結論 ${JSON.stringify(chunks)}、失敗 ${failed} 段、意見 ${JSON.stringify(severities)}`,
    );
  }
});

test('整體結論：沒有任何段落也沒有意見時視為沒有疑慮；只有意見也算建議修改', () => {
  assert.equal(computeVerdict({ chunkVerdicts: [], findings: [], failedChunks: 0 }), 'no_concerns');
  assert.equal(
    computeVerdict({ chunkVerdicts: ['no_concerns'], findings: [makeFinding({ severity: 'warning' })], failedChunks: 0 }),
    'changes_suggested',
  );
});

test('整體結論：參數型別不對時丟出 TypeError', () => {
  const valid = { chunkVerdicts: ['no_concerns'], findings: [], failedChunks: 0 };
  assert.throws(() => computeVerdict(), TypeError);
  assert.throws(() => computeVerdict(null), TypeError);
  assert.throws(() => computeVerdict({ ...valid, chunkVerdicts: 'no_concerns' }), TypeError);
  assert.throws(() => computeVerdict({ ...valid, chunkVerdicts: ['unknown'] }), TypeError);
  assert.throws(() => computeVerdict({ ...valid, findings: undefined }), TypeError);
  assert.throws(() => computeVerdict({ ...valid, findings: ['不是物件'] }), TypeError);
  assert.throws(() => computeVerdict({ ...valid, findings: [{ severity: 'critical' }] }), TypeError);
  assert.throws(() => computeVerdict({ ...valid, failedChunks: -1 }), TypeError);
  assert.throws(() => computeVerdict({ ...valid, failedChunks: 1.5 }), TypeError);
  assert.throws(() => computeVerdict({ ...valid, failedChunks: '1' }), TypeError);
  assert.throws(() => computeVerdict({ chunkVerdicts: [], findings: [] }), TypeError);
});

// spectra-scenario: pr-ai-review / Findings are routed to inline comments or the body / finding routing
test('意見分流：只有送審成功、有行號且在可留言行內的意見才是 inline comment', () => {
  const inRange = makeFinding({ line: 11, title: '在範圍內' });
  const outOfRange = makeFinding({ line: 99, title: '超出範圍' });
  const noLine = makeFinding({ line: null, title: '沒有行號' });
  const notReviewed = makeFinding({ path: 'apps/web/pnpm-lock.yaml', line: 5, title: '沒有送審' });

  const result = routeFindings([inRange, outOfRange, noLine, notReviewed], {
    commentable: { 'apps/web/src/a.ts': [[10, 12]] },
    reviewedPaths: new Set(['apps/web/src/a.ts']),
  });

  assert.deepEqual(result.inline, [inRange]);
  assert.deepEqual(result.body, [outOfRange, noLine, notReviewed]);
});

test('意見分流：reviewedPaths 可以是陣列，兩個結果都維持輸入順序', () => {
  const first = makeFinding({ line: 12, title: '第一' });
  const second = makeFinding({ line: 99, title: '第二' });
  const third = makeFinding({ line: 10, title: '第三' });
  const fourth = makeFinding({ line: null, title: '第四' });
  const result = routeFindings([first, second, third, fourth], {
    commentable: { 'apps/web/src/a.ts': [[10, 12]] },
    reviewedPaths: ['apps/web/src/a.ts'],
  });
  assert.deepEqual(
    result.inline.map((finding) => finding.title),
    ['第一', '第三'],
  );
  assert.deepEqual(
    result.body.map((finding) => finding.title),
    ['第二', '第四'],
  );
});

test('意見分流：沒有可留言行資料、行號不是整數或路徑碰巧是內建屬性名稱時，都放進本文', () => {
  const options = { commentable: { 'apps/web/src/a.ts': [[1, 5]] }, reviewedPaths: ['apps/web/src/a.ts', 'constructor'] };
  const noRanges = makeFinding({ path: 'constructor', line: 1 });
  const stringLine = makeFinding({ line: '3' });
  const fractionLine = makeFinding({ line: 2.5 });
  const result = routeFindings([noRanges, stringLine, fractionLine], options);
  assert.deepEqual(result.inline, []);
  assert.deepEqual(result.body, [noRanges, stringLine, fractionLine]);

  assert.deepEqual(routeFindings([], options), { inline: [], body: [] });
});

test('意見分流：參數型別不對時丟出 TypeError', () => {
  const valid = { commentable: {}, reviewedPaths: new Set() };
  assert.throws(() => routeFindings(undefined, valid), TypeError);
  assert.throws(() => routeFindings([], undefined), TypeError);
  assert.throws(() => routeFindings([], null), TypeError);
  assert.throws(() => routeFindings([], { reviewedPaths: new Set() }), TypeError);
  assert.throws(() => routeFindings([], { ...valid, commentable: [] }), TypeError);
  assert.throws(() => routeFindings([], { commentable: {} }), TypeError);
  assert.throws(() => routeFindings([], { ...valid, reviewedPaths: 'apps/web/src/a.ts' }), TypeError);
  assert.throws(() => routeFindings([], { ...valid, reviewedPaths: [1, 2] }), TypeError);
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
  assert.deepEqual(empty, { ok: true, value: { summary: '沒問題', verdict: 'no_concerns', findings: [] } });
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
  assert.deepEqual(Object.keys(result.value), ['summary', 'verdict', 'findings']);
  assert.deepEqual(Object.keys(result.value.findings[0]), ['path', 'line', 'severity', 'title', 'body']);
  assert.deepEqual(result.value, { summary: '摘要', verdict: 'changes_suggested', findings: [makeFinding()] });
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
