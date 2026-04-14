## ADDED Requirements

### Requirement: Screenshot mode bootstrap

The mobile app SHALL provide a debug-only screenshot mode that bypasses the normal app bootstrap when launch arguments set `screenshotMode=true`.

The screenshot bootstrap SHALL:

- parse `scenario`, `locale`, and `theme` launch arguments before Firebase and Amplify initialization
- create a screenshot-specific app root with `SharedPreferences` overrides
- keep the normal app bootstrap unchanged when screenshot mode is not requested

#### Scenario: Launch arguments enter screenshot mode

- **WHEN** the app starts in debug mode with `screenshotMode=true`, `scenario=blog_input_empty`, `locale=zhTW`, and `theme=light`
- **THEN** the app SHALL render the screenshot app root for that scenario
- **AND** it SHALL NOT initialize the normal Firebase and Amplify bootstrap before rendering

#### Scenario: Normal startup keeps production bootstrap

- **WHEN** the app starts without the screenshot mode launch argument
- **THEN** it SHALL continue using the normal app bootstrap path

### Requirement: Screenshot scenario manifest

The screenshot framework SHALL define a single scenario manifest that is shared by the screenshot app, golden tests, and the Maestro matrix generator.

Each scenario definition SHALL declare:

- a stable scenario identifier
- a wait target identifier for Maestro
- whether the scenario supports Flutter golden testing
- a widget builder that renders the scenario

#### Scenario: Screenshot app resolves scenario from manifest

- **WHEN** the screenshot app receives a known scenario identifier
- **THEN** it SHALL resolve the widget builder from the shared manifest

#### Scenario: Unknown scenario renders a failure surface

- **WHEN** the screenshot app receives an unknown scenario identifier
- **THEN** it SHALL render an error surface instead of crashing

### Requirement: Screenshot rendering is banner-free and waitable

The screenshot app SHALL render banner-free output and SHALL expose a stable ready marker for Flutter scenarios.

The screenshot app SHALL set `debugShowCheckedModeBanner` to `false`.
Flutter-rendered screenshot scenarios SHALL expose a `screenshot_ready` marker after the first stable frame.

#### Scenario: Screenshot output hides Flutter debug banner

- **WHEN** a Flutter screenshot scenario is rendered through the screenshot app
- **THEN** the top-right Flutter debug banner SHALL NOT be visible

#### Scenario: Maestro waits for stable Flutter frame

- **WHEN** Maestro launches a Flutter screenshot scenario
- **THEN** it SHALL be able to wait for the `screenshot_ready` marker before taking a screenshot

### Requirement: Screenshot mode suppresses interactive side effects

Flutter screenshot scenarios SHALL suppress interactive side effects that would make automated capture nondeterministic.

At minimum, screenshot mode SHALL prevent:

- automatic clipboard inspection on blog input resume
- automatic What’s New dialog presentation during blog input startup
- automatic batch download execution when rendering download screenshot content

#### Scenario: Blog input screenshot skips startup popups

- **WHEN** the blog input screen is rendered in screenshot mode
- **THEN** it SHALL NOT automatically inspect the clipboard
- **AND** it SHALL NOT automatically present the What’s New dialog

#### Scenario: Download screenshot does not start real download

- **WHEN** a download progress scenario is rendered in screenshot mode
- **THEN** it SHALL display fixed progress content without starting the real download workflow

### Requirement: Maestro and golden coverage boundaries

The screenshot automation framework SHALL support both Maestro captures and Flutter golden tests with explicit boundaries.

Maestro SHALL cover all registered screenshot scenarios, including the native photo viewer scenario.
Flutter golden tests SHALL cover only scenarios marked as golden-compatible and SHALL exclude native viewer scenarios.

#### Scenario: Native viewer is excluded from golden tests

- **WHEN** the golden test suite enumerates screenshot scenarios
- **THEN** it SHALL skip scenarios whose definitions are not golden-compatible

#### Scenario: Maestro matrix includes all registered scenarios

- **WHEN** the Maestro matrix file is generated
- **THEN** it SHALL contain every registered scenario for each supported locale and theme combination
