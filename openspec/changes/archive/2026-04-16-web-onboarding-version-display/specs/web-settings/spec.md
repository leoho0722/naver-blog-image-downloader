## ADDED Requirements

### Requirement: Onboarding seen flag persistence

The settings store SHALL include a `hasSeenOnboarding` boolean state initialized from `localStorage.getItem("hasSeenOnboarding")`. If the key does not exist in `localStorage`, the value SHALL default to `false`. The store SHALL provide a `dismissOnboarding()` action that sets `hasSeenOnboarding` to `true` and writes `"true"` to `localStorage` under the key `hasSeenOnboarding`.

#### Scenario: Load onboarding flag from localStorage

- **WHEN** the settings store initializes and `localStorage` contains `hasSeenOnboarding` set to `"true"`
- **THEN** `hasSeenOnboarding` in the store is `true`

#### Scenario: Load onboarding flag when not set

- **WHEN** the settings store initializes and `localStorage` does not contain `hasSeenOnboarding`
- **THEN** `hasSeenOnboarding` in the store is `false`

#### Scenario: Dismiss onboarding persists to localStorage

- **WHEN** `dismissOnboarding()` is called
- **THEN** `hasSeenOnboarding` becomes `true` in the store and `localStorage.getItem("hasSeenOnboarding")` returns `"true"`
