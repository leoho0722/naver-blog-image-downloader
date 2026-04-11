## ADDED Requirements

### Requirement: PhotoDownloadRequest DTO defined

The file `lib/data/models/dtos/photo_download_request.dart` SHALL define a `PhotoDownloadRequest` class for serializing API request parameters to JSON.

- `PhotoDownloadRequest` SHALL provide a `toJson()` method that returns a `Map<String, dynamic>`.
- The `toJson()` method SHALL use `blog_url` (snake_case) as the JSON key for the blog URL parameter.

#### Scenario: Request serialized to JSON

- **WHEN** `toJson()` is called on a `PhotoDownloadRequest` instance
- **THEN** it SHALL return a `Map<String, dynamic>` containing the `blog_url` key with the blog URL value

#### Scenario: Request fields are accessible

- **WHEN** a `PhotoDownloadRequest` is created with valid parameters
- **THEN** all parameters SHALL be accessible as properties on the instance

### Requirement: PhotoDownloadResponse DTO defined

The file `lib/data/models/dtos/photo_download_response.dart` SHALL define a `PhotoDownloadResponse` class for deserializing API response JSON.

- `PhotoDownloadResponse` SHALL have a `totalImages` property of type `int`.
- `PhotoDownloadResponse` SHALL have a `successfulDownloads` property of type `int`.
- `PhotoDownloadResponse` SHALL have a `failureDownloads` property of type `int`.
- `PhotoDownloadResponse` SHALL have an `imageUrls` property of type `List<String>`.
- `PhotoDownloadResponse` SHALL have an `errors` property of type `List<String>`.
- `PhotoDownloadResponse` SHALL have an `elapsedTime` property of type `double`.
- `PhotoDownloadResponse` SHALL provide a `factory PhotoDownloadResponse.fromJson(Map<String, dynamic> json)` constructor.

#### Scenario: Response deserialized from JSON

- **WHEN** `PhotoDownloadResponse.fromJson(json)` is called with a valid JSON map containing `total_images`, `successful_downloads`, `failure_downloads`, `image_urls`, `errors`, and `elapsed_time`
- **THEN** it SHALL return a `PhotoDownloadResponse` instance with the correct properties mapped from snake_case JSON keys

#### Scenario: Response with empty image URL list

- **WHEN** `PhotoDownloadResponse.fromJson(json)` is called with a valid JSON map containing an empty `image_urls` list
- **THEN** the `imageUrls` property SHALL be an empty `List<String>`

### Requirement: PhotoDownloadResponse toEntities conversion

The `PhotoDownloadResponse` class SHALL provide a `toEntities()` method that converts the `imageUrls` list to a `List<PhotoEntity>`.

- `toEntities()` SHALL return a `List<PhotoEntity>`.
- Each `PhotoEntity` SHALL have its `id`, `url`, and `filename` derived from the corresponding image URL.

#### Scenario: toEntities converts URL list to PhotoEntity list

- **WHEN** `toEntities()` is called on a `PhotoDownloadResponse` with image URLs
- **THEN** it SHALL return a `List<PhotoEntity>` with the same number of elements as `imageUrls`
- **AND** each `PhotoEntity` SHALL have its `url` set to the corresponding image URL

#### Scenario: toEntities with empty URL list

- **WHEN** `toEntities()` is called on a `PhotoDownloadResponse` with an empty `imageUrls` list
- **THEN** it SHALL return an empty `List<PhotoEntity>`
