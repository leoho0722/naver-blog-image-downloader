## MODIFIED Requirements

### Requirement: Responsive photo grid layout

The PhotoGrid SHALL display photos in a responsive CSS grid: 3 columns on mobile (<640px), 4 columns on tablet (640–1024px), and 5–6 columns on desktop (>1024px). Images SHALL use `<img>` tags with Naver CDN URLs directly, `loading="lazy"` for performance, and `referrerPolicy="no-referrer"` to prevent the browser from sending a `Referer` header that would cause Naver CDN to reject the image request.

#### Scenario: Mobile viewport displays 3 columns

- **WHEN** the viewport width is 375px and 10 photos are loaded
- **THEN** the grid renders with 3 columns

#### Scenario: Desktop viewport displays 5+ columns

- **WHEN** the viewport width is 1440px and 10 photos are loaded
- **THEN** the grid renders with 5 or 6 columns

#### Scenario: Lazy loading of images

- **WHEN** the gallery page loads with 50 photos
- **THEN** only visible images are loaded initially; off-screen images load as the user scrolls

#### Scenario: Cross-origin image loading with no referrer

- **WHEN** the gallery page renders photos from Naver CDN on a non-Naver domain
- **THEN** the `<img>` tag includes `referrerPolicy="no-referrer"` and the images load successfully
