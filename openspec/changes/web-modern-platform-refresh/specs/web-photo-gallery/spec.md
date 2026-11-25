## MODIFIED Requirements

### Requirement: Responsive photo grid layout

The PhotoGrid SHALL display photos in a responsive CSS grid: 2 columns below 640px, 3 columns from 640px, and 4 columns from 768px. Images SHALL use `<img>` tags with Naver CDN URLs directly and `referrerPolicy="no-referrer"` to prevent the browser from sending a `Referer` header that would cause Naver CDN to reject the image request. The first 4 photos in the grid SHALL NOT be lazy-loaded, and the first photo SHALL use `fetchpriority="high"`; every later photo SHALL use `loading="lazy"`.

#### Scenario: Mobile viewport displays 2 columns

- **WHEN** the viewport width is 375px and 10 photos are loaded
- **THEN** the grid renders with 2 columns

#### Scenario: Desktop viewport displays 4 columns

- **WHEN** the viewport width is 1440px and 10 photos are loaded
- **THEN** the grid renders with 4 columns

#### Scenario: Lazy loading of images

- **WHEN** the gallery page loads with 50 photos
- **THEN** only visible images are loaded initially; off-screen images load as the user scrolls

##### Example: loading attributes by grid position

| Photo position (1-based) | `loading` | `fetchpriority` |
| ------------------------ | --------- | --------------- |
| 1                        | absent    | `high`          |
| 2–4                      | absent    | absent          |
| 5 and later              | `lazy`    | absent          |

#### Scenario: Cross-origin image loading with no referrer

- **WHEN** the gallery page renders photos from Naver CDN on a non-Naver domain
- **THEN** the `<img>` tag includes `referrerPolicy="no-referrer"` and the images load successfully

## ADDED Requirements

### Requirement: Selection state exposed to assistive technologies

In selection mode, each photo card button SHALL expose `aria-pressed` reflecting whether that photo is selected. Outside selection mode, the photo card button SHALL NOT expose `aria-pressed`, because activating it opens the image viewer instead of toggling a state.

#### Scenario: Selected card reports pressed state

- **WHEN** selection mode is on and the user selects the second photo
- **THEN** the second photo card button has `aria-pressed="true"` and the other cards have `aria-pressed="false"`

#### Scenario: No pressed state outside selection mode

- **WHEN** selection mode is off
- **THEN** no photo card button has an `aria-pressed` attribute
