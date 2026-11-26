## Purpose

The PR AI review reviews every pull request's diff with an AI model through LKAIKit and publishes the result back to the pull request. It keeps generated files out of the review budget, splits oversized diffs into related chunks, and publishes one review with inline comments so findings are anchored to the code they describe.

## ADDED Requirements

### Requirement: Generated, deleted, and binary files are excluded from review content

The review SHALL NOT send the patch content of a file when the file is marked `linguist-generated` in `.gitattributes`, when the file is deleted in the pull request, or when the file is binary. Each excluded file SHALL still appear in the file overview given to the model and in the published review, labelled with the reason it was skipped.

#### Scenario: Files are classified before chunking

- **WHEN** the review plans a pull request whose diff contains generated, deleted, binary, and ordinary source files
- **THEN** only the ordinary source files are assigned to chunks
- **AND** every other file is listed in the overview with its skip reason

##### Example: file classification

| Path | Change | `linguist-generated` | Category |
| ---- | ------ | -------------------- | -------- |
| `.agents/skills/spectra-apply/SKILL.md` | modified | set | generated |
| `apps/web/pnpm-lock.yaml` | modified | set | generated |
| `apps/web/src/main.tsx` | modified | unspecified | reviewed |
| `apps/web/src/legacy.ts` | deleted | unspecified | deleted |
| `apps/web/public/icon.png` | added (binary) | unspecified | binary |

#### Scenario: Nothing is reviewable

- **WHEN** every changed file in the pull request is generated, deleted, or binary
- **THEN** the review SHALL NOT send any model request
- **AND** it publishes a review stating that no reviewable changes exist
- **AND** the workflow succeeds

### Requirement: Reviewable files are packed into relevance-grouped chunks

The review SHALL count each reviewable file's annotated patch lines, including the file's heading line, and pack files into chunks whose size does not exceed `MAX_CHUNK_LINES` (default 6000). Files SHALL be grouped by component area: the first two path segments under `apps/`, the first path segment elsewhere, and a single area for files at the repository root. Areas SHALL be processed in name order. Within an area, files sharing a feature key SHALL form one feature group. The feature key is the path with `__tests__`, `tests`, and `test` directory segments removed and with the `.test` or `.spec` suffix before the extension removed. An area SHALL be appended to the current chunk when it fits the remaining space, SHALL start a new chunk when it fits an empty chunk, and SHALL otherwise be split by feature group in feature key order, each group appended to the current chunk when it fits or starting a new chunk otherwise. A single file larger than `MAX_CHUNK_LINES` SHALL form its own chunk truncated to `MAX_CHUNK_LINES` lines and SHALL be marked truncated.

#### Scenario: Small diff stays in one chunk

- **WHEN** the total annotated patch lines of all reviewable files do not exceed `MAX_CHUNK_LINES`
- **THEN** the review produces exactly one chunk and sends exactly one model request for review

#### Scenario: Oversized diff is split by area and feature group

- **WHEN** the total annotated patch lines exceed `MAX_CHUNK_LINES`
- **THEN** each chunk stays within `MAX_CHUNK_LINES`
- **AND** a source file and its test file share a chunk whenever their feature group fits within `MAX_CHUNK_LINES`

##### Example: packing with a budget of 100 lines

- **GIVEN** `MAX_CHUNK_LINES` is 100 and the reviewable files are `.github/workflows/a.yml` (30 lines), `apps/backend/src/app.py` (50), `apps/web/src/components/Y.tsx` (60), `apps/web/src/lib/x.ts` (40), and `apps/web/src/__tests__/lib/x.test.ts` (30)
- **WHEN** the review plans the chunks
- **THEN** chunk 1 contains `.github/workflows/a.yml` and `apps/backend/src/app.py` (80 lines)
- **AND** chunk 2 contains `apps/web/src/components/Y.tsx` (60 lines)
- **AND** chunk 3 contains `apps/web/src/__tests__/lib/x.test.ts` and `apps/web/src/lib/x.ts` (70 lines)

##### Example: feature keys

| Path | Feature key |
| ---- | ----------- |
| `apps/web/src/__tests__/lib/x.test.ts` | `apps/web/src/lib/x.ts` |
| `apps/web/src/lib/x.ts` | `apps/web/src/lib/x.ts` |
| `apps/backend/tests/test_app.spec.py` | `apps/backend/test_app.py` |
| `README.md` | `README.md` |

#### Scenario: File larger than one chunk is truncated

- **WHEN** a single reviewable file has more annotated lines than `MAX_CHUNK_LINES`
- **THEN** that file forms its own chunk containing its first `MAX_CHUNK_LINES` annotated lines
- **AND** the published review lists the file as truncated

### Requirement: The number of chunks is capped

The review SHALL send at most `MAX_CHUNKS` (default 6) chunk review requests. Files that would be placed in chunks beyond `MAX_CHUNKS` SHALL NOT be sent and SHALL be listed in the published review as unreviewed because the chunk limit was reached.

#### Scenario: Files beyond the chunk limit are reported

- **WHEN** packing produces more than `MAX_CHUNKS` chunks
- **THEN** only the first `MAX_CHUNKS` chunks are sent for review
- **AND** every file of the remaining chunks is listed in the published review as unreviewed

### Requirement: Patches are annotated with new-file line numbers and findings are structured

Each chunk prompt SHALL contain the review instructions, the overview of every changed file with its category and chunk number, and the chunk's annotated patch. In the annotated patch, every context line and added line SHALL be prefixed with its line number in the new file, and every deleted line SHALL be prefixed with a blank line-number column. The lines that carry a line number SHALL be recorded as the file's commentable lines. The prompt SHALL require the answer to end with exactly one fenced `json` block holding an object with `summary` (string), `verdict` (`blocker`, `changes_suggested`, or `no_concerns`), and `findings` (an array of objects with `path`, `line` as an integer or null, `severity` as `blocker`, `warning`, or `nit`, `title`, and `body`). The review SHALL parse the last fenced `json` block in the answer and SHALL treat the chunk as failed when that block is missing or does not match this shape.

#### Scenario: Hunk lines are numbered

- **WHEN** the review annotates a hunk of a modified file
- **THEN** context and added lines carry their new-file line numbers, deleted lines carry none, and the numbered lines become the file's commentable lines

##### Example: one hunk

- **GIVEN** the hunk `@@ -10,3 +10,3 @@` with the lines ` a`, `-b`, `+c`, and ` d`
- **WHEN** the review annotates the hunk
- **THEN** the annotated lines are `10| a`, `  |-b`, `11|+c`, and `12| d` with the number column right-aligned
- **AND** the commentable lines of the file are 10 through 12

#### Scenario: Answer without a valid JSON block fails the chunk

- **WHEN** a chunk answer has no fenced `json` block, or its last fenced `json` block lacks `summary`, `verdict`, or `findings`
- **THEN** the chunk is marked failed
- **AND** the raw answer is included in a collapsed section of the published review

### Requirement: Multi-chunk results are consolidated into one summary

When more than one chunk produced a valid result, the review SHALL send one synthesis request containing each chunk's summary, verdict, and findings list without code, and SHALL use the returned `summary` and `conclusion` as the review's overall summary. When only one chunk was reviewed, the review SHALL NOT send a synthesis request and SHALL use that chunk's summary. Findings from all chunks SHALL be merged by the script, ordered by severity (`blocker`, `warning`, `nit`), then path, then line. The overall verdict SHALL be computed by the script: `blocker` when any chunk verdict is `blocker` or any finding has severity `blocker`, `changes_suggested` when any finding exists or any chunk verdict is `changes_suggested`, and `no_concerns` otherwise. When the synthesis request fails, the review SHALL list each chunk's summary in chunk order instead and SHALL emit a workflow warning.

#### Scenario: Single chunk skips synthesis

- **WHEN** exactly one chunk was reviewed
- **THEN** no synthesis request is sent and that chunk's summary becomes the overall summary

#### Scenario: Synthesis failure falls back to chunk summaries

- **WHEN** two or more chunks were reviewed and the synthesis request fails
- **THEN** the review body lists the chunk summaries in chunk order
- **AND** the workflow emits a warning and does not fail because of the synthesis failure

##### Example: overall verdict

| Chunk verdicts | Finding severities | Overall verdict |
| -------------- | ------------------ | --------------- |
| `no_concerns`, `no_concerns` | none | `no_concerns` |
| `no_concerns`, `changes_suggested` | `nit` | `changes_suggested` |
| `changes_suggested`, `no_concerns` | `warning`, `blocker` | `blocker` |
| `blocker`, `no_concerns` | none | `blocker` |

### Requirement: The review is published as one pull request review with inline comments

The review SHALL publish its result as one pull request review created with event `COMMENT` on the pull request head commit. A finding SHALL become an inline comment on the `RIGHT` side when its path was sent for review and its line is one of that file's commentable lines. Every other finding SHALL be listed in the review body with its `path:line` location. The review body SHALL start with the marker `<!-- lkai-review -->` and contain the overall verdict computed by the script, the overall summary, the synthesis conclusion when a synthesis result exists, the skipped, truncated, and unreviewed files, and any failure notes. Each inline comment body SHALL contain the severity label, the title, the finding body, and end with the marker `<!-- lkai-review-comment -->`. When GitHub rejects the review, the workflow SHALL publish a second review without inline comments that lists every finding in the body together with a note that inline comments could not be published, and SHALL emit a workflow warning.

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

#### Scenario: Rejected review falls back to a body-only review

- **WHEN** GitHub rejects the review that contains inline comments
- **THEN** the workflow publishes a review without inline comments that lists every finding in the body
- **AND** the workflow emits a warning and does not fail because of the rejection

### Requirement: Previous AI review threads are resolved after a new review is published

Before publishing a new review, the workflow SHALL collect every unresolved review thread of the pull request whose first comment was written by the `github-actions` bot and contains `<!-- lkai-review-comment -->`. After the new review is published, either with inline comments or as the body-only fallback, the workflow SHALL resolve every collected thread. The workflow SHALL NOT resolve any thread whose first comment was written by another author. When no review could be published, the workflow SHALL NOT resolve any thread. A failure to resolve a thread SHALL produce a workflow warning and SHALL NOT fail the workflow.

#### Scenario: New push resolves the previous round

- **WHEN** a pull request has unresolved inline comment threads from an earlier AI review and a new review is published
- **THEN** those earlier AI threads become resolved and the threads from the new review stay unresolved

#### Scenario: Human threads are left alone

- **WHEN** a pull request has an unresolved review thread started by a person
- **THEN** publishing a new AI review leaves that thread unresolved

#### Scenario: Failed publication keeps the previous round

- **WHEN** neither the inline review nor the body-only fallback could be published
- **THEN** the earlier AI threads stay unresolved

### Requirement: Review run outcome reflects missing review content

The workflow SHALL fail when any chunk request fails, returns an incomplete answer, or returns an answer that cannot be parsed, and when no review can be published. Even when it fails, the workflow SHALL publish the results it obtained and SHALL list the failed chunks in the review body. The severity of findings SHALL NOT affect the workflow result. A newer run for the same pull request SHALL cancel an older run that is still in progress.

#### Scenario: One chunk fails

- **WHEN** one of three chunk requests fails and the other two succeed
- **THEN** the published review contains the findings of the two successful chunks and names the failed chunk with its files
- **AND** the workflow fails

#### Scenario: Blocker findings do not fail the workflow

- **WHEN** every chunk succeeds and some findings have severity `blocker`
- **THEN** the review is published and the workflow succeeds

#### Scenario: Newer push cancels the running review

- **WHEN** a new commit is pushed to a pull request while its previous review run is still in progress
- **THEN** the previous run is cancelled and only the new run publishes a review
