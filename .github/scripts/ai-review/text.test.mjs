// text.mjs 的單元測試（node:test）
//
// 執行方式：node --test .github/scripts/ai-review/text.test.mjs

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  BODY_LIMIT,
  COMMENT_LIMIT,
  SUMMARY_BYTE_LIMIT,
  TRUNCATION_NOTE,
  fenceRawAnswer,
  fitReviewBody,
  sanitizeModelText,
  toInlineCode,
  truncateComment,
  truncateUtf8,
} from './text.mjs';

const ZWSP = '\u200B';
const COMMENT_NOTE = '\n\n…（內容過長已截斷）';
const SUMMARY_NOTE = '\n\n…（job summary 超過大小上限，已截斷）';
const NON_INLINE_HEADING = '### 無法標在程式碼行上的意見';

// 找出落單的 surrogate（也就是被切成半個的 emoji）。
const LONE_SURROGATE = /[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/;

// 各種「不是字串」的值，用來測 TypeError。
const NON_STRINGS = [undefined, null, 123, true, {}, [], Symbol('x')];

function longestBacktickRun(text) {
  let longest = 0;
  for (const run of text.match(/`+/g) ?? []) {
    if (run.length > longest) longest = run.length;
  }
  return longest;
}

function makeParts(overrides = {}) {
  return {
    head: '## 審查結論\n\n整體看起來不錯。',
    nonInlineHeading: NON_INLINE_HEADING,
    nonInline: ['- 意見一', '- 意見二\n  補充說明'],
    rawAnswers: [fenceRawAnswer('原始回答', '第 1 段')],
    tail: '<sub>由 AI 產生</sub>',
    ...overrides,
  };
}

describe('sanitizeModelText', () => {
  // spectra-scenario: pr-ai-review / Model text is sanitized / sanitizing
  it('spec 範例五列：提及、email、HTML 註解、反引號 fence、</details> 都符合預期', () => {
    // 列 1：@提及會被中和
    assert.equal(sanitizeModelText('cc @octocat'), `cc @${ZWSP}octocat`);

    // 列 2：email 不處理
    assert.equal(sanitizeModelText('user@example.com'), 'user@example.com');

    // 列 3：HTML 註解符號被跳脫
    assert.equal(
      sanitizeModelText('<!-- lkai-review-comment -->'),
      '&lt;!-- lkai-review-comment --&gt;',
    );

    // 列 4：原始回答含三個連續反引號時，fence 用四個反引號
    const withBackticks = fenceRawAnswer('前面\n```js\nconsole.log(1)\n```\n後面', '第 1 段');
    assert.ok(withBackticks.includes('\n````\n前面\n```js'));
    assert.ok(withBackticks.includes('```\n後面\n````\n'));
    assert.equal(longestBacktickRun(withBackticks), 4);

    // 列 5：原始回答含 </details> 時，只有區塊最後那一個是真的
    const withDetails = fenceRawAnswer('壞掉的回答 </details> 後面還有字', '第 2 段');
    assert.ok(withDetails.includes('&lt;/details>'));
    assert.equal(withDetails.split('</details>').length - 1, 1);
    assert.ok(withDetails.endsWith('\n</details>'));
  });

  it('字串開頭、括號後、多行行首的 @user 與 @org/team 都會被中和', () => {
    assert.equal(sanitizeModelText('@user'), `@${ZWSP}user`);
    assert.equal(sanitizeModelText('(@user)'), `(@${ZWSP}user)`);
    assert.equal(sanitizeModelText('第一行\n@user 請看'), `第一行\n@${ZWSP}user 請看`);
    assert.equal(sanitizeModelText('@org/team'), `@${ZWSP}org/team`);
    assert.equal(sanitizeModelText('請 @org/team 處理'), `請 @${ZWSP}org/team 處理`);
  });

  it('@ 前面是英數字時不處理（a@b、x1@y）', () => {
    assert.equal(sanitizeModelText('a@b'), 'a@b');
    assert.equal(sanitizeModelText('x1@y'), 'x1@y');
  });

  it('其他邊界：連續提及、數字開頭、前面是中文或底線、@ 後面不是英數字', () => {
    assert.equal(sanitizeModelText('@a @b'), `@${ZWSP}a @${ZWSP}b`);
    assert.equal(sanitizeModelText('@a,@b'), `@${ZWSP}a,@${ZWSP}b`);
    assert.equal(sanitizeModelText('@@user'), `@@${ZWSP}user`);
    assert.equal(sanitizeModelText('@1abc'), `@${ZWSP}1abc`);
    assert.equal(sanitizeModelText('請看@user'), `請看@${ZWSP}user`);
    assert.equal(sanitizeModelText('_@user'), `_@${ZWSP}user`);
    assert.equal(sanitizeModelText('foo @ bar'), 'foo @ bar');
    assert.equal(sanitizeModelText('@'), '@');
    assert.equal(sanitizeModelText('@-x'), '@-x');
  });

  it('所有 <!-- 與 --> 都被跳脫（不只第一個）', () => {
    assert.equal(
      sanitizeModelText('a <!-- b --> c <!-- d -->'),
      'a &lt;!-- b --&gt; c &lt;!-- d --&gt;',
    );
  });

  it('刻意拼湊的輸入也不會留下 <!-- 或 -->', () => {
    for (const input of ['<!<!---->-->', '<!-->', '<!---->', '--><!--', '<<!---->>', '--->']) {
      const output = sanitizeModelText(input);
      assert.ok(!output.includes('<!--'), `輸入 ${input} 輸出 ${output} 仍含 <!--`);
      assert.ok(!output.includes('-->'), `輸入 ${input} 輸出 ${output} 仍含 -->`);
    }
  });

  it('窮舉短字串：輸出不含 <!--、-->，也不會留下可通知的 @提及', () => {
    const alphabet = ['<', '!', '-', '>', '@', 'a', '1'];
    const mention = /(^|[^A-Za-z0-9])@(?=[A-Za-z0-9])/;
    const visit = (prefix, remaining) => {
      const output = sanitizeModelText(prefix);
      assert.ok(!output.includes('<!--'), `輸入 ${prefix} 輸出仍含 <!--`);
      assert.ok(!output.includes('-->'), `輸入 ${prefix} 輸出仍含 -->`);
      assert.ok(!mention.test(output), `輸入 ${prefix} 輸出仍可通知 @`);
      if (remaining === 0) return;
      for (const symbol of alphabet) visit(prefix + symbol, remaining - 1);
    };
    visit('', 6);
  });

  it('重複清理的結果不變（冪等）', () => {
    const input = 'cc @octocat <!-- x --> user@example.com @org/team';
    const once = sanitizeModelText(input);
    assert.equal(sanitizeModelText(once), once);
  });

  it('沒有需要處理的文字時原樣回傳', () => {
    assert.equal(sanitizeModelText(''), '');
    assert.equal(sanitizeModelText('這是一般的中文句子 😀'), '這是一般的中文句子 😀');
  });

  it('傳入非字串時丟出 TypeError', () => {
    for (const value of NON_STRINGS) {
      assert.throws(() => sanitizeModelText(value), {
        name: 'TypeError',
        message: /必須是字串/,
      });
    }
  });
});

describe('fenceRawAnswer', () => {
  it('輸出格式完全符合規定', () => {
    assert.equal(
      fenceRawAnswer('hello', '第 1 段'),
      '<details>\n<summary>第 1 段</summary>\n\n```\nhello\n```\n\n</details>',
    );
  });

  it('fence 長度 = max(3, 最長連續反引號 + 1)', () => {
    for (let run = 0; run <= 8; run += 1) {
      const text = `a${'`'.repeat(run)}b`;
      const fence = '`'.repeat(Math.max(3, run + 1));
      const output = fenceRawAnswer(text, '標題');
      assert.ok(output.includes(`\n${fence}\n${text}\n${fence}\n`), `反引號 ${run} 個時 fence 不對`);
      // 輸出中最長的反引號串就是 fence 本身，代表回答裡的反引號不可能提早結束 fence
      assert.equal(longestBacktickRun(output), fence.length);
    }
  });

  it('多段反引號時以最長的那段為準', () => {
    const output = fenceRawAnswer('``a`````b```', '標題');
    assert.ok(output.includes('\n``````\n``a`````b```\n``````\n'));
  });

  it('</details 不分大小寫都被跳脫，且統一換成小寫的 &lt;/details', () => {
    const output = fenceRawAnswer('</details> </DETAILS> </Details >', '標題');
    assert.ok(output.includes('&lt;/details> &lt;/details> &lt;/details >'));
    assert.equal(output.split('</details>').length - 1, 1);
    assert.ok(!/<\/details/i.test(output.slice(0, output.lastIndexOf('</details>'))));
  });

  it('標題會經過清理，回答內文不做 @ 中和', () => {
    const output = fenceRawAnswer('cc @octocat <!-- x -->', '第 1 段 @octocat <!-- y -->');
    assert.ok(output.includes(`<summary>第 1 段 @${ZWSP}octocat &lt;!-- y --&gt;</summary>`));
    assert.ok(output.includes('\ncc @octocat <!-- x -->\n'));
  });

  it('傳入非字串時丟出 TypeError', () => {
    for (const value of NON_STRINGS) {
      assert.throws(() => fenceRawAnswer(value, '標題'), { name: 'TypeError', message: /必須是字串/ });
      assert.throws(() => fenceRawAnswer('內容', value), { name: 'TypeError', message: /必須是字串/ });
    }
  });
});

describe('fitReviewBody', () => {
  it('不超過上限時 truncated 為 false，內容等於直接組合', () => {
    const parts = makeParts();
    const expected = [
      parts.head,
      `${NON_INLINE_HEADING}\n\n- 意見一\n- 意見二\n  補充說明`,
      parts.rawAnswers[0],
      parts.tail,
    ].join('\n\n');
    const { body, truncated } = fitReviewBody(parts);
    assert.equal(truncated, false);
    assert.equal(body, expected);
    // 剛好等於上限也算沒超過
    assert.deepEqual(fitReviewBody(parts, expected.length), { body: expected, truncated: false });
  });

  it('nonInline 為空時不輸出區塊（連標題都不輸出）；空段落直接略過', () => {
    const { body, truncated } = fitReviewBody(
      makeParts({ nonInline: [], rawAnswers: [], tail: '' }),
    );
    assert.equal(truncated, false);
    assert.equal(body, '## 審查結論\n\n整體看起來不錯。');
    assert.ok(!body.includes(NON_INLINE_HEADING));
  });

  it('多個原始回答之間以空行相隔', () => {
    const first = fenceRawAnswer('甲', '第 1 段');
    const second = fenceRawAnswer('乙', '第 2 段');
    const { body } = fitReviewBody(
      makeParts({ nonInline: [], rawAnswers: [first, second], tail: '' }),
    );
    assert.equal(body, `## 審查結論\n\n整體看起來不錯。\n\n${first}\n\n${second}`);
  });

  // spectra-scenario: pr-ai-review / Oversized body is truncated
  it('本文超過 60000 字元時，截斷到上限內並以截斷說明結尾', () => {
    assert.equal(BODY_LIMIT, 60000);
    assert.ok(TRUNCATION_NOTE.includes('完整內容請見這次 workflow run 的 job summary'));

    // 情況 A：原始回答太長，移除後就夠
    const hugeRaw = fitReviewBody(
      makeParts({ rawAnswers: [fenceRawAnswer('x'.repeat(100000), '第 1 段')] }),
    );
    assert.equal(hugeRaw.truncated, true);
    assert.ok(hugeRaw.body.length <= BODY_LIMIT);
    assert.ok(hugeRaw.body.endsWith(TRUNCATION_NOTE));
    assert.ok(!hugeRaw.body.includes('xxxxxxxx'));
    assert.ok(hugeRaw.body.includes('- 意見一'));

    // 情況 B：意見清單太長，從尾端縮短
    const manyItems = Array.from({ length: 500 }, (_, index) => `- 意見 ${index} ${'中'.repeat(300)}`);
    const hugeList = fitReviewBody(makeParts({ nonInline: manyItems, rawAnswers: [] }));
    assert.equal(hugeList.truncated, true);
    assert.ok(hugeList.body.length <= BODY_LIMIT);
    assert.ok(hugeList.body.endsWith(TRUNCATION_NOTE));
    assert.ok(hugeList.body.includes('項意見因長度上限未列出'));
    assert.ok(hugeList.body.includes('- 意見 0 '));

    // 情況 C：head 本身就太長
    const hugeHead = fitReviewBody(makeParts({ head: 'a'.repeat(100000) }));
    assert.equal(hugeHead.truncated, true);
    assert.ok(hugeHead.body.length <= BODY_LIMIT);
    assert.equal(hugeHead.body.length, BODY_LIMIT);
    assert.ok(hugeHead.body.endsWith(TRUNCATION_NOTE));
  });

  it('降級 1：移除原始回答後就夠時，意見全部保留、結尾是說明文字', () => {
    const parts = makeParts({
      rawAnswers: [fenceRawAnswer('x'.repeat(2000), '第 1 段'), fenceRawAnswer('y'.repeat(2000), '第 2 段')],
    });
    const expected = [
      parts.head,
      `${NON_INLINE_HEADING}\n\n- 意見一\n- 意見二\n  補充說明`,
      parts.tail,
      TRUNCATION_NOTE,
    ].join('\n\n');
    const { body, truncated } = fitReviewBody(parts, 500);
    assert.equal(truncated, true);
    assert.equal(body, expected);
    assert.ok(body.length <= 500);
    assert.ok(body.endsWith(TRUNCATION_NOTE));
    assert.ok(!body.includes('<details>'));
    assert.ok(!body.includes('xxxx'));
    assert.ok(!body.includes('yyyy'));
    assert.ok(!body.includes('另有'));
  });

  it('降級 2：從尾端移除意見，「另有 N 項」的 N 正確且前面的項目保留', () => {
    const head = '## 審查結論';
    const tail = '<sub>由 AI 產生</sub>';
    const items = Array.from({ length: 10 }, (_, index) => `- ${index}${'x'.repeat(27)}`);
    const rawAnswers = [fenceRawAnswer('z'.repeat(5000), '第 1 段')];
    // 依規定格式寫出「保留 kept 項、移除 omitted 項」時應有的完整本文
    const expectedBody = (kept, omitted) =>
      [
        head,
        `${NON_INLINE_HEADING}\n\n${items.slice(0, kept).join('\n')}\n- …另有 ${omitted} 項意見因長度上限未列出`,
        tail,
        TRUNCATION_NOTE,
      ].join('\n\n');
    const parts = { head, nonInlineHeading: NON_INLINE_HEADING, nonInline: items, rawAnswers, tail };

    // 上限剛好容得下「保留 4 項、移除 6 項」
    const fitsFour = expectedBody(4, 6);
    const four = fitReviewBody(parts, fitsFour.length);
    assert.equal(four.truncated, true);
    assert.equal(four.body, fitsFour);
    assert.equal(four.body.length, fitsFour.length);
    assert.ok(four.body.includes('- …另有 6 項意見因長度上限未列出'));
    assert.ok(four.body.includes(items[3]));
    assert.ok(!four.body.includes(items[4]));
    assert.ok(!four.body.includes('zzzz'));

    // 少一個字元就容不下，要再多移除一項
    const three = fitReviewBody(parts, fitsFour.length - 1);
    assert.equal(three.truncated, true);
    assert.equal(three.body, expectedBody(3, 7));
    assert.ok(three.body.length <= fitsFour.length - 1);
  });

  it('降級 2：意見全部被移除時，仍保留標題與「另有 N 項」，說明文字在結尾', () => {
    const items = ['- 甲'.padEnd(200, '甲'), '- 乙'.padEnd(200, '乙'), '- 丙'.padEnd(200, '丙')];
    const parts = makeParts({ nonInline: items, rawAnswers: [] });
    const expected = [
      parts.head,
      `${NON_INLINE_HEADING}\n\n- …另有 3 項意見因長度上限未列出`,
      parts.tail,
      TRUNCATION_NOTE,
    ].join('\n\n');
    // 上限剛好容得下「全部移除」的本文，而 head 完整保留
    const { body, truncated } = fitReviewBody(parts, expected.length);
    assert.equal(truncated, true);
    assert.equal(body, expected);
  });

  it('降級 3：head 本身超過上限時，只截斷 head，長度剛好等於上限', () => {
    const items = ['- 意見一', '- 意見二', '- 意見三'];
    const parts = makeParts({
      head: '中'.repeat(1000),
      nonInline: items,
      rawAnswers: [fenceRawAnswer('原始', '第 1 段')],
    });
    const limit = 300;
    const rest = [
      `${NON_INLINE_HEADING}\n\n- …另有 3 項意見因長度上限未列出`,
      parts.tail,
      TRUNCATION_NOTE,
    ].join('\n\n');
    const room = limit - rest.length - 2;
    assert.ok(room > 0);

    const { body, truncated } = fitReviewBody(parts, limit);
    assert.equal(truncated, true);
    assert.equal(body, `${'中'.repeat(room)}\n\n${rest}`);
    assert.equal(body.length, limit);
    assert.ok(body.endsWith(TRUNCATION_NOTE));
  });

  it('降級 3：截斷點落在 emoji 中間時不會留下半個 emoji', () => {
    const items = ['- 意見一'];
    const parts = makeParts({ head: '😀'.repeat(500), nonInline: items, rawAnswers: [] });
    const rest = [
      `${NON_INLINE_HEADING}\n\n- …另有 1 項意見因長度上限未列出`,
      parts.tail,
      TRUNCATION_NOTE,
    ].join('\n\n');

    // room 為奇數：截斷點正好在某個 emoji 的兩個 UTF-16 單位之間，必須多退一格
    const oddRoom = fitReviewBody(parts, rest.length + 2 + 51);
    assert.equal(oddRoom.body, `${'😀'.repeat(25)}\n\n${rest}`);
    assert.equal(oddRoom.body.length, rest.length + 2 + 50);
    assert.ok(!LONE_SURROGATE.test(oddRoom.body));

    // room 為偶數：剛好切在 emoji 邊界，可以全用滿
    const evenRoom = fitReviewBody(parts, rest.length + 2 + 52);
    assert.equal(evenRoom.body, `${'😀'.repeat(26)}\n\n${rest}`);
    assert.equal(evenRoom.body.length, rest.length + 2 + 52);
    assert.ok(!LONE_SURROGATE.test(evenRoom.body));
  });

  it('降級 3：沒有意見區塊也沒有原始回答時，head 被截斷、結尾是說明文字', () => {
    const parts = makeParts({ head: 'a'.repeat(1000), nonInline: [], rawAnswers: [] });
    const { body, truncated } = fitReviewBody(parts, 300);
    assert.equal(truncated, true);
    assert.equal(body.length, 300);
    assert.ok(body.endsWith(TRUNCATION_NOTE));
    assert.ok(!body.includes(NON_INLINE_HEADING));
    assert.ok(!body.includes('另有'));
  });

  it('降級 3 的極端情況：tail 本身就超過上限時，放棄 tail，長度仍不超過上限', () => {
    const parts = makeParts({ head: 'H'.repeat(1000), tail: 'T'.repeat(1000) });
    const limit = 300;
    const { body, truncated } = fitReviewBody(parts, limit);
    assert.equal(truncated, true);
    assert.ok(body.length <= limit);
    assert.ok(body.endsWith(TRUNCATION_NOTE));
    assert.ok(!body.includes('TTTT'));
    assert.equal(body, `${'H'.repeat(limit - TRUNCATION_NOTE.length - 2)}\n\n${TRUNCATION_NOTE}`);
  });

  it('各種上限下 body.length 一定不超過上限，截斷時一定以說明文字結尾且不切斷 emoji', () => {
    const parts = {
      head: `結論${'😀'.repeat(60)}`,
      nonInlineHeading: NON_INLINE_HEADING,
      nonInline: Array.from({ length: 6 }, (_, index) => `- 意見 ${index} ${'中'.repeat(15)}😀`),
      rawAnswers: [
        fenceRawAnswer('原始'.repeat(100), '第 1 段'),
        fenceRawAnswer('😀'.repeat(50), '第 2 段'),
      ],
      tail: '<sub>尾端 😀</sub>',
    };
    const full = [
      parts.head,
      `${NON_INLINE_HEADING}\n\n${parts.nonInline.join('\n')}`,
      parts.rawAnswers.join('\n\n'),
      parts.tail,
    ].join('\n\n');

    let sawUntruncated = false;
    let sawTruncated = false;
    for (let limit = TRUNCATION_NOTE.length; limit <= full.length + 20; limit += 1) {
      const { body, truncated } = fitReviewBody(parts, limit);
      assert.ok(body.length <= limit, `limit=${limit} 時 body 長度 ${body.length} 超過上限`);
      assert.ok(!LONE_SURROGATE.test(body), `limit=${limit} 時出現落單的 surrogate`);
      if (truncated) {
        sawTruncated = true;
        assert.ok(body.endsWith(TRUNCATION_NOTE), `limit=${limit} 時結尾不是說明文字`);
      } else {
        sawUntruncated = true;
        assert.equal(body, full);
      }
    }
    assert.ok(sawTruncated);
    assert.ok(sawUntruncated);
  });

  it('limit 預設值啟用長度上限', () => {
    const { body, truncated } = fitReviewBody(makeParts({ head: 'a'.repeat(BODY_LIMIT + 1) }));
    assert.equal(truncated, true);
    assert.ok(body.length <= BODY_LIMIT);
  });

  it('parts 或欄位型別不對時丟出 TypeError', () => {
    for (const value of [null, undefined, 'abc', 123, []]) {
      assert.throws(() => fitReviewBody(value), { name: 'TypeError', message: /parts 必須是物件/ });
    }
    for (const field of ['head', 'nonInlineHeading', 'tail']) {
      for (const value of NON_STRINGS) {
        assert.throws(() => fitReviewBody(makeParts({ [field]: value })), {
          name: 'TypeError',
          message: /必須是字串/,
        });
      }
    }
    for (const field of ['nonInline', 'rawAnswers']) {
      for (const value of [undefined, null, 'abc', 123, {}]) {
        assert.throws(() => fitReviewBody(makeParts({ [field]: value })), {
          name: 'TypeError',
          message: /必須是字串陣列/,
        });
      }
      assert.throws(() => fitReviewBody(makeParts({ [field]: ['ok', 1] })), {
        name: 'TypeError',
        message: /必須是字串/,
      });
    }
  });

  it('limit 不是數字丟 TypeError；不是整數或小到放不下說明文字丟 RangeError', () => {
    assert.throws(() => fitReviewBody(makeParts(), '100'), { name: 'TypeError' });
    assert.throws(() => fitReviewBody(makeParts(), null), { name: 'TypeError' });
    for (const value of [Infinity, NaN, 1.5, -1, 0, TRUNCATION_NOTE.length - 1]) {
      assert.throws(() => fitReviewBody(makeParts(), value), { name: 'RangeError' });
    }
  });
});

describe('truncateComment', () => {
  it('不超過上限時原樣回傳', () => {
    assert.equal(truncateComment('短留言'), '短留言');
    assert.equal(truncateComment(''), '');
    const exact = 'a'.repeat(COMMENT_LIMIT);
    assert.equal(truncateComment(exact), exact);
    const fifty = 'a'.repeat(50);
    assert.equal(truncateComment(fifty, 50), fifty);
  });

  it('預設上限是 60000 字元', () => {
    assert.equal(COMMENT_LIMIT, 60000);
    const result = truncateComment('a'.repeat(COMMENT_LIMIT + 1));
    assert.equal(result.length, COMMENT_LIMIT);
    assert.ok(result.endsWith(COMMENT_NOTE));
  });

  it('超過時從尾端截斷並附上說明，長度剛好等於上限', () => {
    const result = truncateComment('a'.repeat(500), 100);
    assert.equal(result, `${'a'.repeat(100 - COMMENT_NOTE.length)}${COMMENT_NOTE}`);
    assert.equal(result.length, 100);
  });

  it('不會切斷 emoji 或中文', () => {
    // room 為奇數：必須多退一格，避免切斷 emoji
    const odd = truncateComment('😀'.repeat(200), COMMENT_NOTE.length + 39);
    assert.equal(odd, `${'😀'.repeat(19)}${COMMENT_NOTE}`);
    assert.ok(odd.length <= COMMENT_NOTE.length + 39);
    assert.ok(!LONE_SURROGATE.test(odd));

    // room 為偶數：可以全用滿
    const even = truncateComment('😀'.repeat(200), COMMENT_NOTE.length + 40);
    assert.equal(even, `${'😀'.repeat(20)}${COMMENT_NOTE}`);
    assert.ok(!LONE_SURROGATE.test(even));

    const chinese = truncateComment('中文'.repeat(300), 100);
    assert.equal(chinese.length, 100);
    assert.ok(chinese.endsWith(COMMENT_NOTE));
  });

  it('各種上限下長度都不超過上限、都不含落單的 surrogate、編碼來回不變', () => {
    const text = '中文😀a'.repeat(100);
    for (let limit = COMMENT_NOTE.length; limit <= 120; limit += 1) {
      const result = truncateComment(text, limit);
      assert.ok(result.length <= limit);
      assert.ok(!LONE_SURROGATE.test(result));
      assert.equal(Buffer.from(result, 'utf8').toString('utf8'), result);
      assert.ok(result.endsWith(COMMENT_NOTE));
    }
  });

  it('傳入非字串時丟出 TypeError；limit 不合理時丟出對應錯誤', () => {
    for (const value of NON_STRINGS) {
      assert.throws(() => truncateComment(value), { name: 'TypeError', message: /必須是字串/ });
    }
    assert.throws(() => truncateComment('abc', '10'), { name: 'TypeError' });
    assert.throws(() => truncateComment('abc', Infinity), { name: 'RangeError' });
    assert.throws(() => truncateComment('abc', COMMENT_NOTE.length - 1), { name: 'RangeError' });
  });
});

describe('truncateUtf8', () => {
  it('不超過上限時原樣回傳且 truncated 為 false', () => {
    assert.deepEqual(truncateUtf8('短摘要'), { text: '短摘要', truncated: false });
    assert.deepEqual(truncateUtf8(''), { text: '', truncated: false });
    // 位元組數剛好等於上限也算沒超過
    const text = '中'.repeat(100); // 300 bytes
    assert.deepEqual(truncateUtf8(text, 300), { text, truncated: false });
  });

  it('預設上限是 1000000 位元組', () => {
    assert.equal(SUMMARY_BYTE_LIMIT, 1000000);

    const exact = 'a'.repeat(SUMMARY_BYTE_LIMIT);
    assert.deepEqual(truncateUtf8(exact), { text: exact, truncated: false });

    const ascii = truncateUtf8('a'.repeat(SUMMARY_BYTE_LIMIT + 1));
    assert.equal(ascii.truncated, true);
    assert.equal(Buffer.byteLength(ascii.text, 'utf8'), SUMMARY_BYTE_LIMIT);
    assert.ok(ascii.text.endsWith(SUMMARY_NOTE));

    // 中文每字 3 位元組：40 萬字 = 120 萬位元組，超過上限
    const chinese = truncateUtf8('中'.repeat(400000));
    assert.equal(chinese.truncated, true);
    assert.ok(Buffer.byteLength(chinese.text, 'utf8') <= SUMMARY_BYTE_LIMIT);
    assert.ok(!chinese.text.includes('�'));
    assert.ok(chinese.text.endsWith(SUMMARY_NOTE));
  });

  it('超過時從尾端截斷並附上說明（ASCII 時位元組數剛好等於上限）', () => {
    const noteBytes = Buffer.byteLength(SUMMARY_NOTE, 'utf8');
    const result = truncateUtf8('a'.repeat(500), 200);
    assert.equal(result.truncated, true);
    assert.equal(result.text, `${'a'.repeat(200 - noteBytes)}${SUMMARY_NOTE}`);
    assert.equal(Buffer.byteLength(result.text, 'utf8'), 200);
  });

  it('各種上限下位元組數都不超過上限，也不會切斷中文或 emoji', () => {
    const noteBytes = Buffer.byteLength(SUMMARY_NOTE, 'utf8');
    const text = 'a中😀文'.repeat(200); // 1 + 3 + 4 + 3 = 11 位元組一組
    for (let maxBytes = noteBytes; maxBytes <= noteBytes + 60; maxBytes += 1) {
      const result = truncateUtf8(text, maxBytes);
      assert.equal(result.truncated, true);
      assert.ok(Buffer.byteLength(result.text, 'utf8') <= maxBytes, `maxBytes=${maxBytes} 超過上限`);
      assert.ok(result.text.endsWith(SUMMARY_NOTE));
      assert.ok(!result.text.includes('�'), `maxBytes=${maxBytes} 出現亂碼字元`);
      assert.ok(!LONE_SURROGATE.test(result.text));
      assert.equal(Buffer.from(result.text, 'utf8').toString('utf8'), result.text);

      // 保留下來的內容必須是原文的開頭
      const kept = result.text.slice(0, result.text.length - SUMMARY_NOTE.length);
      assert.ok(text.startsWith(kept));
    }
  });

  it('只有 emoji 與只有中文的輸入也不會切斷字元', () => {
    const noteBytes = Buffer.byteLength(SUMMARY_NOTE, 'utf8');
    for (const unit of ['😀', '中文']) {
      const text = unit.repeat(500);
      for (let maxBytes = noteBytes; maxBytes <= noteBytes + 30; maxBytes += 1) {
        const result = truncateUtf8(text, maxBytes);
        assert.ok(Buffer.byteLength(result.text, 'utf8') <= maxBytes);
        assert.ok(!result.text.includes('�'));
        assert.ok(!LONE_SURROGATE.test(result.text));
        assert.equal(Buffer.from(result.text, 'utf8').toString('utf8'), result.text);
      }
    }
  });

  it('傳入非字串時丟出 TypeError；maxBytes 不合理時丟出對應錯誤', () => {
    for (const value of NON_STRINGS) {
      assert.throws(() => truncateUtf8(value), { name: 'TypeError', message: /必須是字串/ });
    }
    assert.throws(() => truncateUtf8('abc', '10'), { name: 'TypeError' });
    assert.throws(() => truncateUtf8('abc', Infinity), { name: 'RangeError' });
    assert.throws(() => truncateUtf8('abc', 10), { name: 'RangeError' });
  });
});

describe('toInlineCode', () => {
  it('一般路徑以單一反引號包住', () => {
    assert.equal(toInlineCode('apps/web/src/a.ts:12'), '`apps/web/src/a.ts:12`');
  });

  it('含反引號的文字改用更長的反引號，並在需要時補空白，無法跳出 code span', () => {
    assert.equal(toInlineCode('a`b'), '``a`b``');
    assert.equal(toInlineCode('`x`'), '`` `x` ``');
    assert.equal(toInlineCode('``` @org/team <!--'), '```` ``` @org/team <!-- ````');
  });

  it('換行換成空白', () => {
    assert.equal(toInlineCode('a\nb\r\nc'), '`a b c`');
  });

  it('傳入非字串時丟出 TypeError', () => {
    assert.throws(() => toInlineCode(1), TypeError);
  });
});
