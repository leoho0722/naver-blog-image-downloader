<!-- SPECTRA:START v1.0.2 -->

# Spectra Instructions

This project uses Spectra for Spec-Driven Development(SDD). Specs live in `openspec/specs/`, change proposals in `openspec/changes/`.

## Use `/spectra-*` skills when:

- A discussion needs structure before coding → `/spectra-discuss`
- User wants to plan, propose, or design a change → `/spectra-propose`
- Tasks are ready to implement → `/spectra-apply`
- There's an in-progress change to continue → `/spectra-ingest`
- User asks about specs or how something works → `/spectra-ask`
- Implementation is done → `/spectra-archive`
- Commit only files related to a specific change → `/spectra-commit`

## Workflow

discuss? → propose → apply ⇄ ingest → archive

- `discuss` is optional — skip if requirements are clear
- Requirements change mid-work? Plan mode → `ingest` → resume `apply`

## Parked Changes

Changes can be parked（暫存）— temporarily moved out of `openspec/changes/`. Parked changes won't appear in `spectra list` but can be found with `spectra list --parked`. To restore: `spectra unpark <name>`. The `/spectra-apply` and `/spectra-ingest` skills handle parked changes automatically.

<!-- SPECTRA:END -->

# Naver Blog Image Downloader — Monorepo Guidelines

此 monorepo 包含兩個元件：

- `apps/backend/` — Python AWS Lambda（詳見 [apps/backend/CLAUDE.md](apps/backend/CLAUDE.md)）
- `apps/web/` — Vite + React 19 + TypeScript Web app（詳見 [apps/web/CLAUDE.md](apps/web/CLAUDE.md)）

行動版 App（Flutter iOS/Android）已停止維護並自 repo 移除，最後一版保存在 `mobile-v1.6.1` tag。

## 共用開發規範

### 程式碼註解與 log 語言

所有程式碼註解、docstring、log 訊息、錯誤訊息一律以**正體中文**撰寫，使用連 PM 或新手也能理解的白話說明，避免過度技術術語。

### 版號管理與發布流程

新增功能、重大變更或修正 bug 前，須 bump 該元件的 version 檔案，遵循 semver：

- **Minor**（`1.5.0 → 1.6.0`）：對使用者可見的新功能或行為變更。
- **Patch**（`1.5.0 → 1.5.1`）：Bug 修正、開發者工具、自動化腳本、CI/CD 等不影響正式使用者的改動。
- **Major**：API 破壞性變更。

例如 Spectra 工具腳本、lint/format 規則調整皆屬 patch；新畫面、新 API、行為調整則屬 minor。

| 元件    | version 檔案                  | Tag 格式             | 未 bump 時的 CD 行為 |
|---------|-------------------------------|----------------------|----------------------|
| backend | `apps/backend/pyproject.toml` | `backend-v<version>` | Fail                 |
| web     | `apps/web/package.json`       | `web-v<version>`     | Skip（notice）         |

`<version>` 為 semver 三段。CD workflow 會依此產生對應 tag 與 GitHub Release。

### Commit 風格

使用正體中文撰寫 Conventional Commits：`<type>(<scope>): <描述>`

常用 type：`feat`（新功能）、`fix`（修正）、`refactor`（重構）、`docs`（文件）、`chore`（雜項）、`ci`（CI/CD）、`test`（測試）、`style`（排版）。

description（body）使用列點格式，例如：

```text
refactor(web): 路由扁平化，landing 頁移至根路徑

- 移除 /intro/* 中介層，/ 直接呈現產品介紹
- SPA 入口由 /app/web 簡化為 /app
```

### 鐵的紀律：Spectra SDD 工作流

所有功能變更皆須走 `propose → apply ⇄ ingest → archive` 流程。建立 change 時，若 `openspec/specs/` 已有相關 spec，須在 proposal 的 Modified Capabilities 中自動關聯，確保 archive 時 delta spec 能同步回主 spec。詳細工具用法請參考頂部 Spectra 區塊。
