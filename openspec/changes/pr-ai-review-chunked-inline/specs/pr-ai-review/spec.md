## Purpose

The PR AI review reviews every pull request's diff with an AI model through LKAIKit and publishes the result back to the pull request. It keeps generated files out of the review budget, splits oversized diffs into related chunks that are all reviewed, and publishes one review with inline comments so findings are anchored to the code they describe.

## ADDED Requirements

### Requirement: Generated, deleted, and binary files are excluded from review content

The review SHALL NOT send the patch content of a file when the file is marked `linguist-generated` by the `.gitattributes` of the pull request's base commit, when the file is deleted in the pull request, or when the file is binary. The review SHALL evaluate `linguist-generated` against the base commit, so a pull request that changes `.gitattributes` SHALL NOT exclude its own files by doing so. When the pull request changes `.gitattributes`, the published review SHALL state that generated files were determined by the base commit's rules. Each excluded file SHALL still appear in the file overview given to the model and in the published review, labelled with the reason it was skipped.

#### Scenario: Files are classified before chunking

- **WHEN** the review plans a pull request whose diff contains generated, deleted, binary, and ordinary source files
- **THEN** only the ordinary source files are assigned to chunks
- **AND** every other file is listed in the overview with its skip reason

##### Example: file classification

| Path | Change | `linguist-generated` at base | Category |
| ---- | ------ | ---------------------------- | -------- |
| `.agents/skills/spectra-apply/SKILL.md` | modified | set | generated |
| `apps/web/pnpm-lock.yaml` | modified | set | generated |
| `apps/web/src/main.tsx` | modified | unspecified | reviewed |
| `apps/web/src/legacy.ts` | deleted | unspecified | deleted |
| `apps/web/public/icon.png` | added (binary) | unspecified | binary |

#### Scenario: Pull request cannot exclude its own files through .gitattributes

- **WHEN** a pull request adds the line `apps/web/** linguist-generated` to `.gitattributes` and also modifies `apps/web/src/main.tsx`
- **THEN** `apps/web/src/main.tsx` is classified as reviewed and sent for review
- **AND** `.gitattributes` itself is sent for review
- **AND** the published review states that generated files were determined by the base commit's `.gitattributes`

#### Scenario: Nothing is reviewable

- **WHEN** every changed file in the pull request is generated, deleted, or binary
- **THEN** the review SHALL NOT send any model request
- **AND** it publishes a review stating that no reviewable changes exist
- **AND** the workflow succeeds

### Requirement: Reviewable files are packed into relevance-grouped chunks

The review SHALL count each reviewable file's annotated patch lines, including the file's heading line, and pack files into chunks whose size does not exceed `MAX_CHUNK_LINES` (default 6000). Files SHALL be grouped by component area: the first two path segments under `apps/`, the first path segment elsewhere, and a single area named by the empty string for files at the repository root. Areas SHALL be processed in name order, so the repository root area comes first. Within an area, files sharing a feature key SHALL form one feature group. The feature key is the path with every `src`, `__tests__`, `tests`, and `test` directory segment removed, and with the file name stripped of a `.test` or `.spec` suffix before the extension, a `test_` prefix, and a `_test` suffix before the extension. Feature groups SHALL be ordered by feature key, and files within a group by path. An area SHALL be appended to the current chunk when it fits the remaining space, SHALL start a new chunk when it fits an empty chunk, and SHALL otherwise be split by feature group, each group appended to the current chunk when it fits or starting a new chunk otherwise. A feature group larger than `MAX_CHUNK_LINES` SHALL be split by file in group order, each file appended to the current chunk when it fits or starting a new chunk otherwise. A single file larger than `MAX_CHUNK_LINES` SHALL form its own chunk truncated to `MAX_CHUNK_LINES` lines and SHALL be marked truncated.

#### Scenario: Small diff stays in one chunk

- **WHEN** the total annotated patch lines of all reviewable files do not exceed `MAX_CHUNK_LINES`
- **THEN** the review produces exactly one chunk and sends exactly one model request for review

#### Scenario: Oversized diff is split by area and feature group

- **WHEN** the total annotated patch lines exceed `MAX_CHUNK_LINES`
- **THEN** each chunk stays within `MAX_CHUNK_LINES`
- **AND** a source file and its test file share a chunk whenever their feature group fits within `MAX_CHUNK_LINES`

##### Example: packing with a budget of 100 lines

- **GIVEN** `MAX_CHUNK_LINES` is 100 and the reviewable files are `README.md` (10 lines), `.github/workflows/a.yml` (30), `apps/backend/src/app.py` (50), `apps/web/src/components/Y.tsx` (60), `apps/web/src/lib/x.ts` (40), and `apps/web/src/__tests__/lib/x.test.ts` (30)
- **WHEN** the review plans the chunks
- **THEN** chunk 1 contains `README.md`, `.github/workflows/a.yml`, and `apps/backend/src/app.py` (90 lines)
- **AND** chunk 2 contains `apps/web/src/components/Y.tsx` (60 lines)
- **AND** chunk 3 contains `apps/web/src/__tests__/lib/x.test.ts` and `apps/web/src/lib/x.ts` (70 lines)

##### Example: feature group larger than the budget

- **GIVEN** `MAX_CHUNK_LINES` is 100 and the only reviewable files are `apps/web/src/lib/z.ts` (70 lines) and `apps/web/src/__tests__/lib/z.test.ts` (60)
- **WHEN** the review plans the chunks
- **THEN** chunk 1 contains `apps/web/src/__tests__/lib/z.test.ts` (60 lines)
- **AND** chunk 2 contains `apps/web/src/lib/z.ts` (70 lines)

##### Example: feature keys

| Path | Feature key |
| ---- | ----------- |
| `apps/web/src/__tests__/lib/x.test.ts` | `apps/web/lib/x.ts` |
| `apps/web/src/lib/x.ts` | `apps/web/lib/x.ts` |
| `apps/backend/tests/test_app.py` | `apps/backend/app.py` |
| `apps/backend/src/app.py` | `apps/backend/app.py` |
| `apps/backend/src/handler_test.py` | `apps/backend/handler.py` |
| `README.md` | `README.md` |

#### Scenario: File larger than one chunk is truncated

- **WHEN** a single reviewable file has more annotated lines than `MAX_CHUNK_LINES`
- **THEN** that file forms its own chunk containing its first `MAX_CHUNK_LINES` annotated lines
- **AND** the published review lists the file as truncated

### Requirement: Every chunk is reviewed with bounded concurrency

The review SHALL send a review request for every chunk and SHALL NOT skip any reviewable file because of the number of chunks. The review SHALL run at most `MAX_PARALLEL_CHUNKS` (default 3) chunk requests at the same time, sending the chunks in batches in chunk order. When the number of chunks exceeds `WARN_CHUNKS` (default 6), the review SHALL still review every chunk, SHALL place a warning recommending a smaller pull request at the start of the published review body, and SHALL emit a workflow warning.

#### Scenario: Many chunks are reviewed in batches

- **WHEN** packing produces more chunks than `MAX_PARALLEL_CHUNKS`
- **THEN** at most `MAX_PARALLEL_CHUNKS` chunk requests run at the same time and every chunk is reviewed

##### Example: eight chunks

- **GIVEN** packing produced 8 chunks, `MAX_PARALLEL_CHUNKS` is 3, and `WARN_CHUNKS` is 6
- **WHEN** the review sends the chunk requests
- **THEN** the requests run in three batches of 3, 3, and 2 chunks in chunk order
- **AND** the published review contains the results of all 8 chunks
- **AND** the review body starts with a warning recommending a smaller pull request and the workflow emits a warning

### Requirement: Patches are annotated with new-file line numbers and findings are structured

The review SHALL produce the diff with `core.quotePath` disabled and SHALL decode any quoted path, so file paths appear unescaped. Each chunk prompt SHALL contain the review instructions, the overview of every changed file with its category and chunk number, and the chunk's annotated patch. In the annotated patch, every context line and added line SHALL be prefixed with its line number in the new file, right-aligned to the width of the file's largest line number, and every deleted line and every `\ No newline at end of file` line SHALL be prefixed with a blank line-number column. A `\ No newline at end of file` line SHALL NOT advance the new-file line number. The lines that carry a line number and were sent to the model SHALL be recorded as the file's commentable lines; for a truncated file, only lines within the sent portion are commentable. The prompt SHALL require the answer to end with exactly one fenced `json` block holding an object with `summary` (string), `verdict` (`blocker`, `changes_suggested`, or `no_concerns`), and `findings` (an array of objects with `path`, `line` as an integer or null, `severity` as `blocker`, `warning`, or `nit`, `title`, and `body`). The review SHALL parse the last fenced `json` block in the answer and SHALL treat the chunk as failed when that block is missing or does not match this shape.

#### Scenario: Hunk lines are numbered

- **WHEN** the review annotates a hunk of a modified file
- **THEN** context and added lines carry their new-file line numbers, deleted lines carry none, and the numbered lines become the file's commentable lines

##### Example: one hunk

- **GIVEN** the hunk `@@ -10,3 +10,3 @@` with the lines ` a`, `-b`, `+c`, and ` d`
- **WHEN** the review annotates the hunk
- **THEN** the annotated lines are `10| a`, `  |-b`, `11|+c`, and `12| d`
- **AND** the commentable lines of the file are 10 through 12

##### Example: missing newline at end of file

- **GIVEN** the hunk `@@ -1 +1 @@` with the lines `-old`, `\ No newline at end of file`, `+new`, and `\ No newline at end of file`
- **WHEN** the review annotates the hunk
- **THEN** the annotated lines are ` |-old`, ` |\ No newline at end of file`, `1|+new`, and ` |\ No newline at end of file`
- **AND** the commentable lines of the file are 1 through 1

#### Scenario: Non-ASCII paths are not escaped

- **WHEN** the pull request modifies the file `docs/說明.md`
- **THEN** the plan, the overview, and any inline comment use the path `docs/說明.md` exactly

#### Scenario: Answer without a valid JSON block fails the chunk

- **WHEN** a chunk answer has no fenced `json` block, or its last fenced `json` block lacks `summary`, `verdict`, or `findings`
- **THEN** the chunk is marked failed
- **AND** the raw answer is included in a collapsed section of the published review

### Requirement: Multi-chunk results are consolidated into one summary

When two or more chunks produced a valid result, the review SHALL send one synthesis request containing each chunk's summary, verdict, and findings list without code, together with the overall verdict computed by the script, and SHALL require the returned `summary` and `conclusion` to be consistent with that verdict. When only one chunk produced a valid result, the review SHALL NOT send a synthesis request and SHALL use that chunk's summary. Findings from all chunks SHALL be merged by the script, ordered by severity (`blocker`, `warning`, `nit`), then path, then line. The overall verdict SHALL be computed by the script in this order: `blocker` when any chunk verdict is `blocker` or any finding has severity `blocker`; otherwise `incomplete` when any chunk failed; otherwise `changes_suggested` when any finding exists or any chunk verdict is `changes_suggested`; otherwise `no_concerns`. The published review SHALL show the script's verdict as the authoritative result. When the synthesis request fails, the review SHALL list each chunk's summary in chunk order instead and SHALL emit a workflow warning.

#### Scenario: Single chunk skips synthesis

- **WHEN** exactly one chunk produced a valid result
- **THEN** no synthesis request is sent and that chunk's summary becomes the overall summary

#### Scenario: Synthesis failure falls back to chunk summaries

- **WHEN** two or more chunks produced valid results and the synthesis request fails
- **THEN** the review body lists the chunk summaries in chunk order
- **AND** the workflow emits a warning and does not fail because of the synthesis failure

##### Example: overall verdict

| Chunk verdicts | Finding severities | Overall verdict |
| -------------- | ------------------ | --------------- |
| `no_concerns`, `no_concerns` | none | `no_concerns` |
| `no_concerns`, `changes_suggested` | `nit` | `changes_suggested` |
| `changes_suggested`, `no_concerns` | `warning`, `blocker` | `blocker` |
| `blocker`, `no_concerns` | none | `blocker` |
| `no_concerns`, failed chunk | none | `incomplete` |
| `changes_suggested`, failed chunk | `blocker` | `blocker` |

### Requirement: The review is published as one pull request review with inline comments

The review SHALL publish its result as one pull request review created with event `COMMENT` and with `commit_id` equal to the head commit from which the diff was produced. The plan SHALL record that head commit, and building the review SHALL fail without producing a review when the head commit given to it differs from the recorded one. A finding SHALL become an inline comment on the `RIGHT` side when its path was sent for review and its line is one of that file's commentable lines. Every other finding SHALL be listed in the review body with its `path:line` location. The review body SHALL start with the marker `<!-- lkai-review -->` and contain the overall verdict computed by the script, the overall summary, the synthesis conclusion when a synthesis result exists, the skipped and truncated files, and any warning and failure notes. Each inline comment body SHALL contain the severity label, the title, the finding body, and end with the marker `<!-- lkai-review-comment -->`. When GitHub rejects the review, the workflow SHALL publish a second review without inline comments that lists every finding in the body together with a note that inline comments could not be published, and SHALL emit a workflow warning.

#### Scenario: Findings are routed to inline comments or the body

- **WHEN** the review builds the pull request review from the merged findings
- **THEN** each finding on a commentable line of a reviewed file becomes an inline comment and every other finding is listed in the body

##### Example: finding routing

| Finding path | Finding line | Commentable lines of path | Placement |
| ------------ | ------------ | ------------------------- | --------- |
| `apps/web/src/a.ts` | 11 | 10–12 | inline comment |
| `apps/web/src/a.ts` | 99 | 10–12 | body, `apps/web/src/a.ts:99` |
| `apps/web/src/a.ts` | null | 10–12 | body, `apps/web/src/a.ts` |
| `apps/web/pnpm-lock.yaml` | 5 | not reviewed | body, `apps/web/pnpm-lock.yaml:5` |

#### Scenario: Head commit mismatch stops publication

- **WHEN** the head commit given to the review builder differs from the head commit recorded in the plan
- **THEN** no review is published and the workflow fails

#### Scenario: Rejected review falls back to a body-only review

- **WHEN** GitHub rejects the review that contains inline comments
- **THEN** the workflow publishes a review without inline comments that lists every finding in the body
- **AND** the workflow emits a warning and does not fail because of the rejection

### Requirement: Published text is sanitized and kept within GitHub limits

Before publishing, the review SHALL sanitize every model-written text placed in the review body or an inline comment. It SHALL insert U+200B ZERO WIDTH SPACE between `@` and a following account or team name, and SHALL replace `<!--` with `&lt;!--` and `-->` with `--&gt;`. A raw answer of a failed chunk SHALL be placed inside a `<details>` section in a code fence whose backtick count exceeds the longest backtick run in the answer, with `</details` in the answer replaced by `&lt;/details`. When the review body exceeds 60,000 characters, the review SHALL first remove raw-answer sections and then shorten the end of the list of findings that are not inline comments, SHALL append a note that the content was truncated, and SHALL emit a workflow warning. The complete, untruncated body SHALL be written to the workflow job summary. An inline comment body longer than 60,000 characters SHALL be truncated with a note.

#### Scenario: Model text is sanitized

- **WHEN** a finding written by the model contains a mention, an HTML comment delimiter, or a closing details tag
- **THEN** the published text cannot notify the mentioned account, cannot create an HTML comment, and cannot close a collapsed section

##### Example: sanitizing

| Model text | Published text |
| ---------- | -------------- |
| `cc @octocat` | `cc @` followed by U+200B and `octocat` |
| `<!-- lkai-review-comment -->` | `&lt;!-- lkai-review-comment --&gt;` |
| raw answer containing three consecutive backticks | raw answer inside a fence of four backticks |
| raw answer containing `</details>` | raw answer containing `&lt;/details>` |

#### Scenario: Oversized body is truncated

- **WHEN** the assembled review body is longer than 60,000 characters
- **THEN** the published body is at most 60,000 characters and ends with a note that the content was truncated
- **AND** the job summary contains the complete body
- **AND** the workflow emits a warning

### Requirement: Previous AI review threads are resolved after a new review is published

Before publishing a new review, the workflow SHALL collect every unresolved review thread of the pull request whose first comment was written by the `github-actions` bot, contains `<!-- lkai-review-comment -->`, and is on a file that this run reviewed completely, meaning the file belongs to a chunk whose request succeeded and the file is not truncated. After the new review is published, either with inline comments or as the body-only fallback, the workflow SHALL resolve every collected thread. The workflow SHALL NOT resolve any thread whose first comment was written by another author, any thread without the marker, or any thread on a file that this run did not review completely. When no review could be published, the workflow SHALL NOT resolve any thread. A failure to resolve a thread SHALL produce a workflow warning and SHALL NOT fail the workflow.

#### Scenario: New push resolves the previous round

- **WHEN** a pull request has unresolved inline comment threads from an earlier AI review on files that this run reviewed completely, and a new review is published
- **THEN** those earlier AI threads become resolved and the threads from the new review stay unresolved

##### Example: which threads are resolved

| First comment author | Has marker | Thread file in this run | Resolved |
| -------------------- | ---------- | ----------------------- | -------- |
| `github-actions` | yes | reviewed in a successful chunk, not truncated | yes |
| `github-actions` | yes | in a failed chunk | no |
| `github-actions` | yes | truncated | no |
| `github-actions` | yes | not in this diff | no |
| `github-actions` | no | reviewed in a successful chunk, not truncated | no |
| a person | no | reviewed in a successful chunk, not truncated | no |

#### Scenario: Failed publication keeps the previous round

- **WHEN** neither the inline review nor the body-only fallback could be published
- **THEN** the earlier AI threads stay unresolved

#### Scenario: Threads left by a cancelled run are resolved later

- **WHEN** a run was cancelled after publishing its review but before resolving the earlier threads, and a later run publishes a new review
- **THEN** the later run resolves the still unresolved AI threads from every earlier round on files it reviewed completely

### Requirement: Review run outcome reflects missing review content

The workflow SHALL fail when any chunk request fails, returns an incomplete answer, or returns an answer that cannot be parsed, when the head commit check stops publication, and when no review can be published. Even when a chunk fails, the workflow SHALL publish the results it obtained and SHALL list the failed chunks with their files in the review body. The severity of findings SHALL NOT affect the workflow result. A newer run for the same pull request SHALL cancel an older run that is still in progress. The workflow SHALL request only the `contents: read` and `pull-requests: write` permissions and SHALL stop after 60 minutes.

#### Scenario: One chunk fails

- **WHEN** one of three chunk requests fails and the other two succeed
- **THEN** the published review contains the findings of the two successful chunks, names the failed chunk with its files, and shows the overall verdict `incomplete` unless a finding has severity `blocker`
- **AND** the workflow fails

#### Scenario: Blocker findings do not fail the workflow

- **WHEN** every chunk succeeds and some findings have severity `blocker`
- **THEN** the review is published and the workflow succeeds

#### Scenario: Newer push cancels the running review

- **WHEN** a new commit is pushed to a pull request while its previous review run is still in progress
- **THEN** the previous run is cancelled and only the new run publishes a review

#### Scenario: Workflow runs with least privilege

- **WHEN** the review workflow definition is inspected
- **THEN** its permissions are exactly `contents: read` and `pull-requests: write`, its concurrency group is unique per pull request with in-progress cancellation, and its timeout is 60 minutes
