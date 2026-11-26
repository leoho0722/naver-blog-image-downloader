## Purpose

The PR AI review reviews every pull request's diff with an AI model through LKAIKit and publishes the result back to the pull request. It keeps generated files out of the review budget, splits oversized diffs into related chunks that are all reviewed, and publishes one review with inline comments so findings are anchored to the code they describe. Findings with severity `blocker` or `warning` leave unresolved review threads that block merging until they are fixed, while optional suggestions are listed in the review body only.

## ADDED Requirements

### Requirement: Generated, deleted, and binary files are excluded from review content

The review SHALL NOT send the patch content of a file when the file is marked `linguist-generated` by the `.gitattributes` of the pull request's base commit, when the file is deleted in the pull request, or when the file is binary. The review SHALL evaluate `linguist-generated` against the base commit, so a pull request that changes `.gitattributes` SHALL NOT exclude its own files by doing so. When the pull request changes `.gitattributes`, the published review SHALL state that generated files were determined by the base commit's rules. Each excluded file SHALL still appear in the published review, labelled with the reason it was skipped, and SHALL be represented in the file overview given to the model as defined by the overview rules. The workflow SHALL fetch the base commit before planning, and when the base commit is not available locally, or when the generated-file check against the base commit cannot run (for example because the installed Git is older than 2.40), planning SHALL fail with a message that states the cause, without classifying any file, and the run SHALL NOT send any model request, publish any review, or resolve any thread.

#### Scenario: Files are classified before chunking

- **WHEN** the review plans a pull request whose diff contains generated, deleted, binary, and ordinary source files
- **THEN** only the ordinary source files are assigned to chunks
- **AND** every other file is listed in the published review with its skip reason

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

#### Scenario: Base commit is unavailable

- **WHEN** the base commit of the pull request cannot be found locally after fetching
- **THEN** planning fails, no model request is sent, no review is published, no thread is resolved, and the workflow fails

#### Scenario: Nothing is reviewable

- **WHEN** every changed file in the pull request is generated, deleted, or binary
- **THEN** the review SHALL NOT send any model request
- **AND** it publishes a review stating that no reviewable changes exist
- **AND** the workflow succeeds

### Requirement: Reviewable files are packed into relevance-grouped chunks

The review SHALL count each reviewable file's annotated patch lines, including the file's heading line, and pack files into chunks whose size does not exceed `MAX_CHUNK_LINES` (default 6000). Files SHALL be grouped by component area: the first two path segments under `apps/`, the first path segment elsewhere, and a single area named by the empty string for files at the repository root. Areas SHALL be processed in name order, so the repository root area comes first. Within an area, files sharing a feature key SHALL form one feature group. The feature key is the path with every `src`, `__tests__`, `tests`, and `test` directory segment removed, and with the file name stripped of its extension and then of a `.test` or `.spec` suffix, a `test_` prefix, and a `_test` suffix. Feature groups SHALL be ordered by feature key, and files within a group by path. Every ordering SHALL compare strings by Unicode code point. An area SHALL be appended to the current chunk when it fits the remaining space, SHALL start a new chunk when it fits an empty chunk, and SHALL otherwise be split by feature group, each group appended to the current chunk when it fits or starting a new chunk otherwise. A feature group larger than `MAX_CHUNK_LINES` SHALL be split by file in group order, each file appended to the current chunk when it fits or starting a new chunk otherwise. A single file larger than `MAX_CHUNK_LINES` SHALL form its own chunk truncated to `MAX_CHUNK_LINES` lines and SHALL be marked truncated.

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
| `apps/web/src/__tests__/lib/x.test.ts` | `apps/web/lib/x` |
| `apps/web/src/__tests__/lib/x.test.tsx` | `apps/web/lib/x` |
| `apps/web/src/lib/x.ts` | `apps/web/lib/x` |
| `apps/backend/tests/test_app.py` | `apps/backend/app` |
| `apps/backend/src/app.py` | `apps/backend/app` |
| `apps/backend/src/handler_test.py` | `apps/backend/handler` |
| `README.md` | `README` |

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

The review SHALL produce the diff with `core.quotePath` disabled and SHALL decode any quoted path, so file paths appear unescaped. Each chunk prompt SHALL contain the review instructions, a file overview, and the chunk's annotated patch. The overview SHALL list every file of that chunk; SHALL then list deleted files, binary files, and the files of other chunks, in that order, each with its category and chunk number, up to 100 entries, followed by a line that counts the entries left out per chunk and per category; and SHALL state the number of generated files without listing them. The overview therefore SHALL NOT grow beyond that limit with the number of files outside the chunk. In the annotated patch, every context line and added line SHALL be prefixed with its line number in the new file, right-aligned to the width of the file's largest line number, and every deleted line and every `\ No newline at end of file` line SHALL be prefixed with a blank line-number column. A `\ No newline at end of file` line SHALL NOT advance the new-file line number. The lines that carry a line number and were sent to the model SHALL be recorded as the file's commentable lines; for a truncated file, only lines within the sent portion are commentable. The prompt SHALL require the answer to end with exactly one fenced `json` block holding an object with `summary` (string), `verdict` (`blocker`, `changes_suggested`, or `no_concerns`), and `findings` (an array of objects with `path`, `line` as an integer or null, `severity` as `blocker`, `warning`, or `nit`, `title`, and `body`). When the prompt lists earlier AI review threads, the object SHALL also hold `previousThreads`, an array of objects with `ref` as a string, `fixed` as a boolean, and `note` as a string; a missing `previousThreads` SHALL count as no judgement for every listed thread, and an entry whose `ref` is not listed in that chunk SHALL be ignored. The review SHALL parse the last fenced `json` block in the answer and SHALL treat the chunk as failed when that block is missing or does not match this shape.

#### Scenario: Overview stays bounded for a pull request with many files

- **WHEN** the review builds the prompt of one chunk in a pull request with many files outside that chunk
- **THEN** the overview lists every file of the chunk, at most 100 other entries, a count of the entries left out, and the number of generated files

##### Example: overview of chunk 1

| Files in the pull request | Overview of chunk 1 |
| ------------------------- | ------------------- |
| 3 files in chunk 1, 2 deleted files, 40 files in chunk 2, 500 generated files | 3 chunk-1 files, 2 deleted files, 40 chunk-2 files, generated count 500 |
| 3 files in chunk 1, 2 deleted files, 150 files in chunk 2, 0 generated files | 3 chunk-1 files, 2 deleted files, 98 chunk-2 files, a line counting 52 more files in chunk 2 |

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

- **WHEN** a chunk answer has no fenced `json` block, its last fenced `json` block lacks `summary`, `verdict`, or `findings`, or its `previousThreads` is present but is not an array of objects with a string `ref`, a boolean `fixed`, and a string `note`
- **THEN** the chunk is marked failed
- **AND** the raw answer is included in a collapsed section of the published review

### Requirement: Multi-chunk results are consolidated into one summary

When two or more chunks produced a valid result, the review SHALL send one synthesis request containing each chunk's summary, verdict, and findings list without code, together with the overall verdict computed by the script, and SHALL require the returned `summary` and `conclusion` to be consistent with that verdict. When only one chunk produced a valid result, the review SHALL NOT send a synthesis request and SHALL use that chunk's summary. When no chunk produced a valid result, the review SHALL NOT send a synthesis request, and its summary SHALL state that no chunk produced a valid result and list the failure of each chunk. Findings from all chunks SHALL be merged by the script, ordered by severity (`blocker`, `warning`, `nit`), then path, then line. The overall verdict SHALL be computed by the script from finding severities and earlier AI review threads, in this order: `blocker` when any finding has severity `blocker` or an earlier AI review thread with severity `blocker` stays unresolved after this run; otherwise `incomplete` when any chunk failed; otherwise `changes_suggested` when any finding has severity `warning` or an earlier AI review thread with severity `warning` stays unresolved after this run; otherwise `no_concerns`, even when findings with severity `nit` exist. An earlier thread stays unresolved after this run when this run does not reply to and resolve it. Chunk verdicts SHALL NOT change the overall verdict. The published review SHALL show the script's verdict as the authoritative result. When the synthesis request fails, the review SHALL list each chunk's summary in chunk order instead and SHALL emit a workflow warning.

#### Scenario: Single chunk skips synthesis

- **WHEN** exactly one chunk produced a valid result
- **THEN** no synthesis request is sent and that chunk's summary becomes the overall summary

#### Scenario: Synthesis failure falls back to chunk summaries

- **WHEN** two or more chunks produced valid results and the synthesis request fails
- **THEN** the review body lists the chunk summaries in chunk order
- **AND** the workflow emits a warning and does not fail because of the synthesis failure

#### Scenario: Optional suggestions alone keep the verdict clear

- **WHEN** every chunk succeeds, every finding has severity `nit`, and no earlier AI review thread with severity `blocker` or `warning` stays unresolved
- **THEN** the overall verdict is `no_concerns`

##### Example: overall verdict

| Chunk verdicts | Finding severities | Earlier AI threads still unresolved after this run | Overall verdict |
| -------------- | ------------------ | -------------------------------------------------- | --------------- |
| `no_concerns`, `no_concerns` | none | none | `no_concerns` |
| `no_concerns`, `changes_suggested` | `nit` | none | `no_concerns` |
| `changes_suggested`, `no_concerns` | `warning`, `blocker` | none | `blocker` |
| `blocker`, `no_concerns` | none | none | `no_concerns` |
| `no_concerns`, `no_concerns` | `nit` | one `warning` judged not fixed | `changes_suggested` |
| `no_concerns`, `no_concerns` | none | one `blocker` on a truncated file | `blocker` |
| `no_concerns`, failed chunk | none | none | `incomplete` |
| `no_concerns`, failed chunk | `warning` | none | `incomplete` |
| `changes_suggested`, failed chunk | `blocker` | none | `blocker` |
| failed chunk, failed chunk | none | none | `incomplete` |

### Requirement: The review is published as one pull request review with inline comments

The review SHALL publish its result as one pull request review created with event `COMMENT` and with `commit_id` equal to the pull request's head commit, which is also the commit the diff was produced from as `<base>...<head>`. The review SHALL NOT use the merge commit that GitHub creates for the pull request. The plan SHALL record that head commit, and building the review SHALL fail without producing a review when the head commit given to it differs from the recorded one. Findings with severity `blocker` or `warning` SHALL block merging through unresolved review threads, and findings with severity `nit` SHALL NOT. A finding with severity `blocker` or `warning` SHALL become an inline comment on the `RIGHT` side when its path was sent for review in the chunk that produced the finding and its line is one of that file's commentable lines. Any other finding with severity `blocker` or `warning` whose path is a file in the pull request's diff SHALL be published, after the review is published, as a file-level review comment on that path at the head commit, and SHALL also be listed in the review body. A finding with severity `blocker` or `warning` whose path is not a file in the diff SHALL be listed in the review body with a note that it does not block merging. A finding with severity `nit` SHALL be listed in the review body only. Every finding listed in the body SHALL show its `path:line` location, and the body SHALL state that findings with severity `blocker` or `warning` are also published as file-level comments and that findings with severity `nit` do not block merging. Each file-level comment body SHALL also contain the current run's marker before `<!-- lkai-review-comment -->`. When the request that publishes a file-level comment fails, the workflow SHALL check whether a comment with the same path and body already exists on the pull request and SHALL count it as published when it does; otherwise the workflow SHALL retry the request once. When the comment still cannot be published, the workflow SHALL emit an error, SHALL still publish the remaining file-level comments and handle the earlier threads, and SHALL fail. The review body SHALL start with the marker `<!-- lkai-review -->`, followed by a line `<!-- lkai-review-run: <run id> -->` that identifies the workflow run attempt, and SHALL contain the overall verdict computed by the script, the overall summary, the synthesis conclusion when a synthesis result exists, the skipped and truncated files, a summary of how earlier AI review threads were handled, and any warning and failure notes. Each inline comment and file-level comment body SHALL start with the severity label and the title, contain the finding body, and end with the marker `<!-- lkai-review-comment -->`. When GitHub rejects the review, the workflow SHALL publish a second review without inline comments that lists every finding in the body together with a note that inline comments could not be published, SHALL publish every finding with severity `blocker` or `warning` whose path is a file in the diff as a file-level comment, and SHALL emit a workflow warning. When no review could be published, the workflow SHALL NOT publish file-level comments. Before publishing that second review, the workflow SHALL check the pull request's reviews and SHALL NOT publish it when a review carrying the current run's marker already exists.

#### Scenario: Findings are routed to inline comments or the body

- **WHEN** the review builds the pull request review from the merged findings
- **THEN** each `blocker` or `warning` finding on a commentable line of a file reviewed in the finding's own chunk becomes an inline comment, every other `blocker` or `warning` finding on a file in the diff becomes a file-level comment and is also listed in the body, and every remaining finding is listed in the body only

##### Example: finding routing

| Severity | Finding path | Finding line | Commentable lines of path | Placement |
| -------- | ------------ | ------------ | ------------------------- | --------- |
| `warning` | `apps/web/src/a.ts` | 11 | 10–12 | inline comment |
| `nit` | `apps/web/src/a.ts` | 11 | 10–12 | body only, `apps/web/src/a.ts:11` |
| `warning` | `apps/web/src/a.ts` | 99 | 10–12 | file-level comment and body, `apps/web/src/a.ts:99` |
| `blocker` | `apps/web/src/a.ts` | null | 10–12 | file-level comment and body, `apps/web/src/a.ts` |
| `warning` | `apps/web/pnpm-lock.yaml`, generated | 5 | not reviewed | file-level comment and body, `apps/web/pnpm-lock.yaml:5` |
| `warning` | `apps/web/src/b.ts`, reported by a chunk that does not contain it | 5 | 1–20 | file-level comment and body, `apps/web/src/b.ts:5` |
| `blocker` | `docs/missing.md`, not in the diff | 3 | none | body only, `docs/missing.md:3`, marked as not blocking |

#### Scenario: Optional suggestions stay in the body

- **WHEN** a finding has severity `nit`
- **THEN** it is listed in the review body only, and no inline comment or file-level comment is published for it

#### Scenario: Failed file-level comment fails the workflow

- **WHEN** the review is published and both attempts to publish one file-level comment fail without the comment existing on the pull request
- **THEN** the remaining file-level comments are published and the earlier threads are handled, the finding stays listed in the review body, and the workflow fails

#### Scenario: Lost file-level comment response is not duplicated

- **WHEN** the request that publishes a file-level comment reports a failure but a comment with the same path and body, which carries the current run's marker, exists on the pull request
- **THEN** the workflow does not publish that comment again and counts it as published

#### Scenario: Head commit mismatch stops publication

- **WHEN** the head commit given to the review builder differs from the head commit recorded in the plan
- **THEN** no review is published and the workflow fails

#### Scenario: Lost response does not duplicate the review

- **WHEN** the request that publishes the review with inline comments reports a failure but a review carrying the current run's marker exists on the pull request
- **THEN** the workflow does not publish the body-only review

#### Scenario: Rejected review falls back to a body-only review

- **WHEN** GitHub rejects the review that contains inline comments
- **THEN** the workflow publishes a review without inline comments that lists every finding in the body
- **AND** every `blocker` or `warning` finding whose path is a file in the diff is published as a file-level comment
- **AND** the workflow emits a warning and does not fail because of the rejection

### Requirement: Published text is sanitized and kept within GitHub limits

Before publishing, the review SHALL sanitize every model-written text placed in the review body, an inline comment, a file-level comment, or a reply to an earlier AI review thread. It SHALL insert U+200B ZERO WIDTH SPACE between `@` and a following account or team name when the `@` is not preceded by an ASCII letter or digit, SHALL replace `<!--` with `&lt;!--` and `-->` with `--&gt;`, and SHALL replace `<details` with `&lt;details` and `</details` with `&lt;/details` regardless of letter case, so model text can neither open nor close a collapsed section. A raw answer of a failed chunk SHALL be placed inside a `<details>` section in a code fence whose backtick count exceeds the longest backtick run in the answer, with `</details` in the answer replaced by `&lt;/details`. The review body SHALL list at most 100 paths in each of its lists of skipped generated files and of deleted or binary files, followed by the number of paths left out and a pointer to the job summary, so lists that grow with the pull request cannot push findings out of the body. When the review body exceeds 60,000 characters, the review SHALL first remove raw-answer sections, then shorten the end of the list of findings that are not inline comments, and, when the body is still too long, SHALL cut the remaining body from its end while closing any collapsed section left open by the cut; it SHALL append a note that the content was truncated and SHALL emit a workflow warning. The complete, untruncated body, including the complete file lists, SHALL be written to the workflow job summary, truncated with a note only when it exceeds 1,000,000 bytes. An inline comment or file-level comment body longer than 60,000 characters SHALL be truncated with a note, and a reply SHALL contain at most 1,000 characters of the model's note.

#### Scenario: Model text is sanitized

- **WHEN** a finding written by the model contains a mention, an HTML comment delimiter, or a closing details tag
- **THEN** the published text cannot notify the mentioned account, cannot create an HTML comment, and cannot close a collapsed section

##### Example: sanitizing

| Model text | Published text |
| ---------- | -------------- |
| `cc @octocat` | `cc @` followed by U+200B and `octocat` |
| `user@example.com` | `user@example.com` |
| `<!-- lkai-review-comment -->` | `&lt;!-- lkai-review-comment --&gt;` |
| raw answer containing three consecutive backticks | raw answer inside a fence of four backticks |
| raw answer containing `</details>` | raw answer containing `&lt;/details>` |
| finding body containing `<details>` and `</DETAILS>` | finding body containing `&lt;details>` and `&lt;/details>` |

#### Scenario: Oversized body is truncated

- **WHEN** the assembled review body is longer than 60,000 characters
- **THEN** the published body is at most 60,000 characters and ends with a note that the content was truncated
- **AND** the job summary contains the complete body
- **AND** the workflow emits a warning

#### Scenario: Long file lists do not push findings out of the body

- **WHEN** a pull request skips 3,000 generated files and the review has findings listed in the body
- **THEN** the body lists 100 of the skipped files with a line counting the other 2,900, the findings stay in the body, and the job summary lists all 3,000 files

### Requirement: Previous AI review threads are resolved after a new review is published

Before planning, the workflow SHALL collect every unresolved review thread of the pull request whose first comment was written by the `github-actions` bot and contains `<!-- lkai-review-comment -->`, together with its path, its line (the original line when the thread is outdated, and no line when the thread is a file-level thread), its first comment, and the commit on which its first comment was made. When the collection fails, the workflow SHALL emit a warning, SHALL still review and publish, and SHALL NOT reply to or resolve any thread. Planning SHALL read each collected thread's severity from the severity label at the start of its first comment, and SHALL treat a thread whose label cannot be read as severity `warning`. A thread with severity `nit` SHALL NOT be listed in any prompt and SHALL be resolvable without a judgement. Planning SHALL classify every other collected thread by its file in this run, matching the thread's path against both the current path and the previous path of files renamed in this run's diff: a thread on a file that belongs to a chunk and is not truncated SHALL be listed in that chunk's prompt with a reference, its path, its line, and its first comment, and the prompt SHALL ask the model to judge whether the issue is fixed in the reviewed code and SHALL instruct the model not to report an issue that is still present as a new finding; a thread on a file that is no longer in this run's diff SHALL be resolvable without a judgement; a thread on a file that is deleted in this run's diff SHALL be resolvable without a judgement only when the file existed in the commit on which the thread's first comment was made, because only then was the thread about code that is now gone, and SHALL otherwise be kept open, including when that commit is not available; every other thread SHALL be kept open. After the new review is published, either with inline comments or as the body-only fallback, the workflow SHALL reply to and then resolve every thread that the model judged fixed in a chunk whose request succeeded, with a reply that states the issue was confirmed fixed at the head commit together with the model's note, every thread whose file is no longer in the diff or is a resolvable deleted file, with a reply that states the file has no changes left to review, and every thread with severity `nit`, with a reply that states optional suggestions do not block merging. The workflow SHALL NOT reply to or resolve a thread that the model judged not fixed, a thread with no judgement, a thread whose chunk failed, a kept thread, any thread whose first comment was written by another author, or any thread without the marker. When no review could be published, the workflow SHALL NOT reply to or resolve any thread. A failure to reply to a thread SHALL produce a workflow warning and SHALL NOT prevent its resolution; a failure to resolve a thread SHALL produce a workflow warning and SHALL NOT fail the workflow.

#### Scenario: Confirmed fix resolves the thread with a reply

- **WHEN** an earlier AI thread is on a file reviewed in a successful chunk and the model reports `fixed` as true for it
- **THEN** after the new review is published the thread receives a reply that names the head commit and the model's note, and then becomes resolved

#### Scenario: Unfixed issue keeps the thread open

- **WHEN** the model reports `fixed` as false for an earlier AI thread, or gives no judgement for it
- **THEN** the thread stays unresolved without a reply, and the new review does not repeat the issue as a new finding when the model follows the prompt

#### Scenario: Earlier optional suggestion is resolved without a judgement

- **WHEN** an earlier AI thread's first comment starts with the severity label of `nit`
- **THEN** the thread is not listed in any prompt, and after the new review is published it receives a reply that optional suggestions do not block merging and then becomes resolved

#### Scenario: Thread about a deletion stays open

- **WHEN** an earlier AI thread is on a file that is deleted in this run's diff and the file did not exist in the commit on which the thread's first comment was made
- **THEN** the thread stays unresolved without a reply, because it is about the deletion itself

#### Scenario: Thread on a renamed file follows the file

- **WHEN** an earlier AI thread's path is the previous path of a file renamed in this run's diff
- **THEN** the thread is classified by the renamed file, and when that file is reviewed and not truncated the thread is listed in that file's chunk prompt with the new path

##### Example: which threads are resolved

| First comment author | Has marker | Severity label | Thread file in this run | Model judgement | Resolved |
| -------------------- | ---------- | -------------- | ----------------------- | --------------- | -------- |
| `github-actions` | yes | `warning` | reviewed in a successful chunk, not truncated | fixed | yes, with a reply |
| `github-actions` | yes | `blocker` | reviewed in a successful chunk, not truncated | not fixed | no |
| `github-actions` | yes | `warning` | reviewed in a successful chunk, not truncated | none | no |
| `github-actions` | yes | unreadable | reviewed in a successful chunk, not truncated | fixed | yes, with a reply |
| `github-actions` | yes | `warning` | previous path of a renamed file reviewed in a successful chunk | fixed | yes, with a reply |
| `github-actions` | yes | `warning` | in a failed chunk | not asked | no |
| `github-actions` | yes | `warning` | truncated | not asked | no |
| `github-actions` | yes | `warning` | not in this diff | not asked | yes, with a reply |
| `github-actions` | yes | `warning` | deleted in this diff, existed when the thread was made | not asked | yes, with a reply |
| `github-actions` | yes | `blocker` | deleted in this diff, already deleted when the thread was made | not asked | no |
| `github-actions` | yes | `warning` | deleted in this diff, commit of the thread not available | not asked | no |
| `github-actions` | yes | `warning` | generated | not asked | no |
| `github-actions` | yes | `nit` | any | not asked | yes, with a reply |
| `github-actions` | no | `warning` | reviewed in a successful chunk, not truncated | not asked | no |
| a person | no | none | reviewed in a successful chunk, not truncated | not asked | no |

#### Scenario: Failed publication keeps the previous round

- **WHEN** neither the inline review nor the body-only fallback could be published
- **THEN** no earlier AI thread receives a reply or becomes resolved

#### Scenario: Collection failure resolves nothing

- **WHEN** the query for earlier review threads fails
- **THEN** the workflow emits a warning, the review is still published, and no thread is replied to or resolved

#### Scenario: Threads left by a cancelled run are judged later

- **WHEN** a run was cancelled after publishing its review but before resolving the earlier threads, and a later run reviews the pull request
- **THEN** the later run collects the still unresolved AI threads from every earlier round and handles them by the same rules

### Requirement: Review run outcome reflects missing review content

The workflow SHALL fail when any chunk request fails, returns an incomplete answer, or returns an answer that cannot be parsed, when the base commit is unavailable, when the head commit check stops publication, when no review can be published, when a file-level comment cannot be published after its retry, when the generated-file check cannot run, and when the plan file cannot be parsed. Even when a chunk fails, the workflow SHALL publish the results it obtained and SHALL list the failed chunks with their files in the review body. The severity of findings SHALL NOT affect the workflow result. A newer run for the same pull request SHALL cancel an older run that is still in progress. The workflow SHALL request only the `contents: write` and `pull-requests: write` permissions, SHALL set the GitHub token only in the environments of the step that collects earlier threads and the step that publishes the review and resolves threads, SHALL NOT persist git credentials when checking out the pull request, and SHALL stop after 60 minutes.

#### Scenario: One chunk fails

- **WHEN** one of three chunk requests fails and the other two succeed
- **THEN** the published review contains the findings of the two successful chunks, names the failed chunk with its files, and shows the overall verdict `incomplete` unless a finding has severity `blocker` or an earlier AI review thread with severity `blocker` stays unresolved after this run
- **AND** the workflow fails

#### Scenario: Blocker findings do not fail the workflow

- **WHEN** every chunk succeeds and some findings have severity `blocker`
- **THEN** the review is published and the workflow succeeds

#### Scenario: Newer push cancels the running review

- **WHEN** a new commit is pushed to a pull request while its previous review run is still in progress
- **THEN** the previous run is cancelled and only the new run publishes a review

#### Scenario: Workflow runs with least privilege

- **WHEN** the review workflow definition is inspected
- **THEN** its permissions are exactly `contents: write` and `pull-requests: write`, the GitHub token appears only in the environments of the thread-collecting step and the publishing step, checkout sets `persist-credentials: false`, its concurrency group is unique per pull request with in-progress cancellation, and its timeout is 60 minutes
