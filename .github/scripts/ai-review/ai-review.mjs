#!/usr/bin/env node
// ai-review.mjs：PR AI 審查的命令列進入點，由 .github/workflows/pr-ai-review.yml 呼叫。
//
// 子命令：
//   plan             產生 diff、替檔案分類、切段，寫出 plan.json 與每段的提示詞 chunk-<n>.md
//   synthesis-prompt 兩段以上取得有效結果時，寫出彙整請求的提示詞；否則不寫檔案
//   build-review     組出要發布的 review（review.json、review-body-only.json）、summary.md 與 outcome.json
//
// 用法：node ai-review.mjs <子命令> --<參數> <值> ...
// 出錯時把原因寫到 stderr，並以非 0 退出碼結束；呼叫端依退出碼判斷是否繼續。

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { buildPlan, DEFAULT_MAX_CHUNK_LINES, PlanError, writePlan } from './plan.mjs';
import { renderSynthesisPrompt } from './prompts.mjs';
import { buildReview, DEFAULT_WARN_CHUNKS, loadChunkResults, ReviewError, summarizeResults } from './review.mjs';

/** 命令列參數錯誤 */
class UsageError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UsageError';
  }
}

/**
 * 解析 `--key value` 形式的參數。同一個參數出現兩次、或缺少值時視為錯誤。
 *
 * @param {string[]} args
 * @returns {Record<string, string>}
 */
export function parseOptions(args) {
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    if (!key?.startsWith('--') || key.length <= 2) {
      throw new UsageError(`看不懂的參數：${key}`);
    }
    if (value === undefined || value.startsWith('--')) {
      throw new UsageError(`參數 ${key} 缺少值`);
    }
    const name = key.slice(2);
    if (Object.hasOwn(options, name)) {
      throw new UsageError(`參數 ${key} 重複出現`);
    }
    options[name] = value;
  }
  return options;
}

/**
 * 取出必填參數。
 *
 * @param {Record<string, string>} options
 * @param {string} name
 * @returns {string}
 */
function required(options, name) {
  if (!options[name]) {
    throw new UsageError(`缺少必填參數 --${name}`);
  }
  return options[name];
}

/**
 * 把參數轉成正整數。
 *
 * @param {string | undefined} value
 * @param {string} name
 * @param {number} fallback 沒有提供時的預設值
 * @returns {number}
 */
function positiveInteger(value, name, fallback) {
  if (value === undefined) {
    return fallback;
  }
  if (!/^[1-9][0-9]*$/.test(value)) {
    throw new UsageError(`參數 --${name} 必須是正整數，收到「${value}」`);
  }
  return Number(value);
}

/**
 * plan 子命令。
 *
 * @param {Record<string, string>} options
 */
function commandPlan(options) {
  const result = buildPlan({
    cwd: process.cwd(),
    base: required(options, 'base'),
    head: required(options, 'head'),
    maxChunkLines: positiveInteger(options['max-chunk-lines'], 'max-chunk-lines', DEFAULT_MAX_CHUNK_LINES),
  });
  writePlan(required(options, 'out'), result);

  const { files, chunks } = result.plan;
  const reviewed = files.filter((file) => file.category === 'reviewed').length;
  const lines = chunks.map((chunk) => chunk.lines).join('、') || '無';
  console.log(`規劃完成：共 ${files.length} 個檔案，其中 ${reviewed} 個送審，分成 ${chunks.length} 段（各段行數：${lines}）`);
  if (result.prompts.length > 0) {
    // 提示詞還包含審查指示與整個 PR 的檔案總覽；印出實際行數，供核對每段上限的估計值
    const promptLines = result.prompts.map((prompt) => prompt.split('\n').length).join('、');
    console.log(`各段提示詞的實際行數（含審查指示與檔案總覽）：${promptLines}`);
  }
}

/**
 * 讀取 plan.json。
 *
 * @param {string} path
 * @returns {object}
 */
function readPlan(path) {
  if (!existsSync(path)) {
    throw new UsageError(`找不到規劃檔 ${path}`);
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

/**
 * synthesis-prompt 子命令：兩段以上取得有效結果時才寫出提示詞。
 * 呼叫端以輸出檔案是否存在，決定要不要送彙整請求。
 *
 * @param {Record<string, string>} options
 */
function commandSynthesisPrompt(options) {
  const plan = readPlan(required(options, 'plan'));
  const results = loadChunkResults(plan, required(options, 'results'));
  const valid = results.filter((result) => result.ok).length;
  if (valid < 2) {
    console.log(`不需要彙整：有效的段落只有 ${valid} 段`);
    return;
  }
  const { verdict } = summarizeResults(results);
  writeFileSync(required(options, 'out'), renderSynthesisPrompt({ verdict, chunks: results }));
  console.log(`需要彙整：有效的段落共 ${valid} 段`);
}

/**
 * build-review 子命令。
 *
 * @param {Record<string, string>} options
 */
function commandBuildReview(options) {
  const plan = readPlan(required(options, 'plan'));
  const results = loadChunkResults(plan, required(options, 'results'));
  const synthesisPath = options.synthesis;
  const synthesisRaw = synthesisPath && existsSync(synthesisPath) ? readFileSync(synthesisPath, 'utf8') : null;
  const output = buildReview({
    plan,
    results,
    synthesisRaw,
    headSha: required(options, 'head-sha'),
    runId: required(options, 'run-id'),
    warnChunks: positiveInteger(options['warn-chunks'], 'warn-chunks', DEFAULT_WARN_CHUNKS),
    modelLabel: options['model-label'],
  });

  const out = required(options, 'out');
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'review.json'), `${JSON.stringify(output.review)}\n`);
  writeFileSync(join(out, 'review-body-only.json'), `${JSON.stringify(output.bodyOnly)}\n`);
  writeFileSync(join(out, 'summary.md'), output.summaryMarkdown);
  // outcome.json 最後寫：呼叫端可以用它是否存在判斷組裝是否完整
  writeFileSync(join(out, 'outcome.json'), `${JSON.stringify(output.outcome, null, 2)}\n`);

  const { outcome } = output;
  console.log(
    `review 組裝完成：整體結論 ${outcome.verdict}，inline comment ${outcome.inlineCount} 則，意見共 ${outcome.bodyOnlyCount} 項，失敗段落 ${outcome.failedChunks.length} 段`,
  );
}

const COMMANDS = {
  plan: commandPlan,
  'synthesis-prompt': commandSynthesisPrompt,
  'build-review': commandBuildReview,
};

/**
 * 執行命令列。
 *
 * @param {string[]} argv 不含 node 與 script 路徑的參數
 * @returns {number} 退出碼
 */
export function main(argv) {
  const [command, ...rest] = argv;
  try {
    const handler = COMMANDS[command];
    if (!handler) {
      throw new UsageError(`不認得的子命令「${command ?? ''}」，可用的子命令：${Object.keys(COMMANDS).join('、')}`);
    }
    handler(parseOptions(rest));
    return 0;
  } catch (error) {
    if (error instanceof UsageError || error instanceof PlanError || error instanceof ReviewError) {
      console.error(`錯誤：${error.message}`);
      return error instanceof UsageError ? 64 : 1;
    }
    throw error;
  }
}

// 直接執行時才跑命令列；被測試 import 時不執行
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  process.exitCode = main(process.argv.slice(2));
}
