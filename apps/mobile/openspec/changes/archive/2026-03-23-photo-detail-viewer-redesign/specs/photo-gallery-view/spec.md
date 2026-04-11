## MODIFIED Requirements

### Requirement: PhotoCard tap behavior

The `PhotoCard` widget SHALL use a `GestureDetector` to handle tap events. In select mode, tapping SHALL call the `onSelect` callback. In normal mode, tapping SHALL call the `onTap` callback. The `onTap` callback in `PhotoGalleryView` SHALL navigate to `PhotoDetailView` by calling `context.push('/detail/${photo.id}', extra: (photos: viewModel.photos, blogId: viewModel.blogId, initialIndex: index))`, passing the full photo list, blog ID, and the tapped photo's index.

#### Scenario: Tap in normal mode navigates with full photo list

- **GIVEN** the gallery is in normal mode (not select mode)
- **WHEN** the user taps a `PhotoCard` at index N
- **THEN** the app SHALL navigate to `/detail/${photo.id}` with `extra` containing the full photos list, blogId, and `initialIndex: N`

#### Scenario: Tap in select mode toggles selection

- **GIVEN** the gallery is in select mode
- **WHEN** the user taps a `PhotoCard`
- **THEN** the `onSelect` callback SHALL be invoked
