## ADDED Requirements

### Requirement: HomePage navigation flow tests

Unit tests SHALL cover the HomePage component's navigation effect. Tests SHALL verify that when `fetchPhase` transitions to `"completed"` with a non-null `fetchResult`, `navigate()` is called with the correct gallery path and router state, and the blog input store is reset afterward. Tests SHALL also verify that no navigation occurs when `fetchPhase` is not `"completed"`.

#### Scenario: Navigate on fetch completion

- **WHEN** the HomePage component renders and `fetchPhase` transitions to `"completed"` with a valid `fetchResult`
- **THEN** `navigate()` is called with `/gallery/<blogId>` and `{ fetchResult, jobId }` as state

#### Scenario: Store reset after navigation

- **WHEN** the HomePage effect triggers navigation on `fetchPhase === "completed"`
- **THEN** the blog input store is reset to idle state with empty `blogUrl`, null `fetchResult`, and null `jobId`

#### Scenario: No navigation when not completed

- **WHEN** the HomePage component renders with `fetchPhase === "processing"`
- **THEN** `navigate()` is not called
