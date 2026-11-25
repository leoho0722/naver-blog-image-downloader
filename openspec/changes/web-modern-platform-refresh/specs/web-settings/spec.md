## MODIFIED Requirements

### Requirement: Theme switching with three modes

The settings panel SHALL provide a segmented control for switching between system, light, and dark themes. Selecting light or dark SHALL persist the literal value under the `theme` key in `localStorage`; selecting system SHALL remove the `theme` key. A stored value other than `light` or `dark`, including the legacy value `system`, SHALL be treated as system. The active theme SHALL be applied by setting the content of `<meta name="color-scheme">` to `light dark` for system, `light` for light, or `dark` for dark. A classic inline script placed directly after that meta in `apps/web/index.html` SHALL apply the stored value before first paint, and it SHALL NOT throw when `localStorage` is unavailable. System mode SHALL follow the OS `prefers-color-scheme` through CSS without a JavaScript media-query listener. Theme changes SHALL apply immediately without page reload, and a theme change made in another tab SHALL be applied in the current tab through the `storage` event. When `localStorage` cannot be written, the selected theme SHALL still apply to the current page.

#### Scenario: Switch to dark theme

- **WHEN** user selects "Dark" in the theme switcher
- **THEN** the color-scheme meta content becomes `dark`, dark tokens activate, and `localStorage.theme` is `"dark"`

#### Scenario: Switch back to system removes the stored value

- **WHEN** user selects "System" after having selected "Dark"
- **THEN** the color-scheme meta content becomes `light dark` and the `theme` key no longer exists in `localStorage`

#### Scenario: System theme follows OS

- **WHEN** user selects "System" and the OS is in dark mode
- **THEN** dark theme is applied; when the OS switches to light mode, light theme is applied automatically

#### Scenario: Theme persists across page reload

- **WHEN** user selects "Light", the OS is in dark mode, and the page reloads
- **THEN** the first paint already uses the light theme because the inline script set the meta content to `light` before the body rendered

##### Example: stored value to meta content on load

| `localStorage.theme` | Meta content after the inline script |
| -------------------- | ------------------------------------ |
| absent               | `light dark`                         |
| `"system"` (legacy)  | `light dark`                         |
| `"light"`            | `light`                              |
| `"dark"`             | `dark`                               |
| `"blue"` (unknown)   | `light dark`                         |

#### Scenario: Theme change in another tab

- **WHEN** the app is open in two tabs and the user selects "Dark" in the first tab
- **THEN** the second tab's color-scheme meta content becomes `dark` and its settings store theme becomes `dark` without a reload

## ADDED Requirements

### Requirement: Two-state header theme toggle

The always-visible theme buttons in the AppLayout header (`AppHeaderControls`) and in the PublicLayout navigation (`ThemeLocaleControls`) SHALL act as two-state toggles. The button's icon SHALL show the currently rendered scheme, resolving system to the OS preference. The button's accessible name SHALL describe the action, using the localized keys `settingsSwitchToDark` when the rendered scheme is light and `settingsSwitchToLight` when it is dark. Activating the button SHALL target the opposite of the rendered scheme: when the target equals the current OS preference the theme SHALL become system and the stored value SHALL be removed; otherwise the target SHALL be stored literally. A stored value SHALL NOT be cleared when the OS preference later changes to match it. The OS preference SHALL be read with `matchMedia("(prefers-color-scheme: dark)")` and SHALL be kept current through that media query list's `change` event.

#### Scenario: Toggle picks the opposite of what the user sees

- **WHEN** the user activates the header theme button
- **THEN** the page switches to the opposite of the scheme it was rendering

##### Example: theme after one activation

| Theme before | OS preference | Rendered before | Theme after |
| ------------ | ------------- | --------------- | ----------- |
| system       | light         | light           | dark        |
| system       | dark          | dark            | light       |
| dark         | light         | dark            | system      |
| light        | dark          | light           | system      |
| dark         | dark          | dark            | light       |
| light        | light         | light           | dark        |

#### Scenario: Accessible name describes the action

- **WHEN** the rendered scheme is light
- **THEN** the button's accessible name is the localized `settingsSwitchToDark` text and its icon is the light-scheme icon

#### Scenario: OS change keeps a stored override

- **WHEN** the theme is stored as `dark` while the OS prefers light, and the OS then switches to dark
- **THEN** `localStorage.theme` remains `"dark"`, and when the OS switches back to light the page stays dark

### Requirement: Settings panel popover

The settings panel SHALL open from a settings button in the AppLayout header and SHALL render as a native popover (`popover="auto"`) invoked through `popovertarget`, positioned below the button and aligned to the button's inline end. Clicking outside the panel or pressing Escape SHALL close it, and focus SHALL return to the settings button when focus was inside the panel. The settings button SHALL expose `aria-expanded` matching whether the panel is open. The panel SHALL NOT use `role="menu"` and the button SHALL NOT use `aria-haspopup="menu"`, because the panel contains ordinary toggle buttons reached with Tab. Selecting a language SHALL close the panel; changing the theme inside the panel SHALL keep it open. In browsers without native Popover support the app SHALL load `@oddbird/popover-polyfill` on demand after feature detection, and SHALL NOT load it when native support exists. In browsers without CSS anchor positioning the panel SHALL be positioned by script when it opens.

#### Scenario: Open and light-dismiss

- **WHEN** the user clicks the settings button and then clicks anywhere outside the panel
- **THEN** the panel opens on the first click, closes on the outside click, and the button's `aria-expanded` follows both changes

#### Scenario: Escape returns focus

- **WHEN** focus is on a theme option inside the open panel and the user presses Escape
- **THEN** the panel closes and focus moves to the settings button

#### Scenario: Language selection closes the panel

- **WHEN** the user selects English in the open panel
- **THEN** the locale changes to `en` and the panel closes

#### Scenario: Polyfill only where needed

- **WHEN** the app starts in a browser whose `HTMLElement.prototype` has its own `popover` property
- **THEN** the popover polyfill module is not requested

## REMOVED Requirements

### Requirement: Settings panel responsive layout

**Reason**: The side drawer (desktop) and modal dialog (mobile) layout no longer matches the app: settings already live in a dropdown panel inside the AppLayout header, and this change makes that panel a native popover.
**Migration**: Use the "Settings panel popover" requirement in this spec; the unused `SettingsDrawer` component is out of scope for this change.
