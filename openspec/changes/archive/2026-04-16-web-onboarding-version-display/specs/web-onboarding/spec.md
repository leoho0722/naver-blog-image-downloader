## ADDED Requirements

### Requirement: First-visit onboarding card

The HomePage SHALL display a modal overlay onboarding card when the user opens the Web app for the first time in the current browser. The onboarding card SHALL explain the complete usage flow: pasting a Naver Blog URL, the system extracting photos and navigating to the gallery page, and browsing/selecting/downloading photos. The card SHALL include a dismiss button labeled with a localized "Start" text. Pressing Escape SHALL also dismiss the card.

#### Scenario: First visit shows onboarding card

- **WHEN** a user opens the Web app homepage and `localStorage` does not contain `hasSeenOnboarding`
- **THEN** a modal overlay onboarding card is displayed with usage instructions

#### Scenario: Dismiss onboarding card

- **WHEN** the user clicks the "Start" button on the onboarding card
- **THEN** the card closes, `hasSeenOnboarding` is set to `"true"` in `localStorage`, and the homepage input form is visible

#### Scenario: Escape key dismisses onboarding card

- **WHEN** the user presses Escape while the onboarding card is visible
- **THEN** the card closes and `hasSeenOnboarding` is persisted to `localStorage`

#### Scenario: Returning visit does not show onboarding card

- **WHEN** a user opens the Web app homepage and `localStorage` contains `hasSeenOnboarding` set to `"true"`
- **THEN** the onboarding card is not displayed

### Requirement: Onboarding card i18n support

The onboarding card content SHALL be fully localized using react-i18next. Translation keys SHALL be provided for all four supported locales: zh-TW, en, ja, ko. Keys SHALL include `onboardingTitle`, `onboardingDesc`, and `onboardingStart`.

#### Scenario: Language switch updates onboarding text

- **WHEN** the user switches locale to English while the onboarding card is visible
- **THEN** the card title, description, and button text update to English
