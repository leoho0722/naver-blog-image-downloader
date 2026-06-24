## ADDED Requirements

### Requirement: Android release pipeline SHALL trigger automatically when mobile semver bump lands on main

The Android release pipeline SHALL be invoked as part of `.github/workflows/mobile-cd.yml` after the `Mobile CI` workflow completes successfully on the `main` branch. The pipeline SHALL execute only when the semver portion of `apps/mobile/pubspec.yaml` (`X.Y.Z`, ignoring `+buildNumber`) does not already have a corresponding `mobile-v<X.Y.Z>` git tag. If the tag already exists, the pipeline SHALL emit a `::notice::` log entry and skip without failure.

#### Scenario: Semver bumped and no prior tag exists

- **WHEN** a push to `main` changes `apps/mobile/pubspec.yaml` from `1.6.1+1` to `1.7.0+1`, `Mobile CI` succeeds, and `mobile-v1.7.0` does not exist
- **THEN** the Android release pipeline SHALL run to completion: build signed AAB, upload to Internal, upload to Closed, commit bumped `+buildNumber` back to `main`, and create `mobile-v1.7.0` tag and GitHub Release

#### Scenario: Semver unchanged between two CI runs

- **WHEN** a push to `main` does not change the semver portion of `pubspec.yaml` and `Mobile CI` succeeds
- **THEN** the Android release pipeline SHALL skip with a `::notice::` log entry and SHALL NOT upload anything to Play Store, commit anything, or create any tag

#### Scenario: Tag already exists for current semver

- **WHEN** `pubspec.yaml` has `version: 1.7.0+3` and `mobile-v1.7.0` tag already exists
- **THEN** the Android release pipeline SHALL skip with a `::notice::` log entry indicating the tag already exists

### Requirement: Pipeline SHALL produce a signed Android App Bundle from release signing configuration

The pipeline SHALL produce a release AAB signed with the upload keystore material provided via GitHub Actions Secrets. The keystore file SHALL NOT be committed to the repository under any circumstance. `apps/mobile/android/app/build.gradle.kts` SHALL read signing parameters from `apps/mobile/android/key.properties`. The pipeline SHALL restore the keystore file and generate `key.properties` at runtime from secrets, and SHALL fail the job with an actionable error message when any required secret is missing.

#### Scenario: All signing secrets present

- **WHEN** the pipeline runs with `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, and `ANDROID_KEY_PASSWORD` all set
- **THEN** the pipeline SHALL decode the keystore, write `key.properties`, and produce `apps/mobile/build/app/outputs/bundle/release/app-release.aab` signed with the upload key

#### Scenario: A signing secret is missing

- **WHEN** `ANDROID_KEYSTORE_BASE64` is unset or empty at pipeline run time
- **THEN** the pipeline SHALL fail with an error message that names the missing secret and references `apps/mobile/docs/android-release.md`

#### Scenario: Repository does not contain any keystore material

- **WHEN** any commit to `main` is inspected
- **THEN** `apps/mobile/android/key.properties`, `apps/mobile/android/app/keystore.jks`, and any other keystore-like file SHALL be absent (covered by `.gitignore`)

### Requirement: Pipeline SHALL auto-increment versionCode from pubspec.yaml and commit it back to main

The pipeline SHALL read the current `+buildNumber` from `apps/mobile/pubspec.yaml`, compute `buildNumber + 1`, use the incremented value for the AAB build (via `flutter build appbundle --build-number=<N+1>`), and after successful upload to both Internal and Closed tracks, commit the updated `pubspec.yaml` back to `main`. The commit message SHALL be in Traditional Chinese Conventional Commits style with scope `mobile`, and SHALL include the literal token `[skip ci]` to prevent `Mobile CI` from re-triggering.

#### Scenario: buildNumber increment and commit-back

- **WHEN** `pubspec.yaml` starts at `1.7.0+3`, the pipeline runs, AAB uploads to Internal and Closed both succeed
- **THEN** the AAB SHALL be built with `--build-number=4`, and a new commit SHALL appear on `main` changing `pubspec.yaml` to `1.7.0+4` with a message matching `chore(mobile): bump build number 至 +4` containing `[skip ci]` in the body

#### Scenario: Commit-back does not retrigger Mobile CI

- **WHEN** the pipeline pushes the buildNumber bump commit to `main`
- **THEN** `Mobile CI` SHALL NOT be triggered by that push (enforced by `[skip ci]` token in the commit message)

### Requirement: Pipeline SHALL publish the produced AAB to both Internal and Closed tracks

The pipeline SHALL upload the produced AAB to the Google Play Store Internal testing track (fastlane `track: "internal"`) and SHALL then make the same release available on the Closed testing track (fastlane `track: "alpha"`) by invoking `upload_to_play_store` with `track: "internal"` and `track_promote_to: "alpha"` (and `skip_upload_aab: true`), so that both tracks hold the identical versionCode as a single release. Both steps SHALL be attempted in sequence within a single pipeline run. The pipeline SHALL NOT re-upload the same AAB twice (Play Developer API rejects duplicate versionCodes). The pipeline SHALL NOT upload to Open testing (`beta`) or Production (`production`) automatically under any circumstance.

#### Scenario: Both tracks succeed

- **WHEN** fastlane uploads the AAB to Internal and the upload succeeds, then promotes the Internal draft release to Closed (alpha) via `track_promote_to`
- **THEN** the pipeline SHALL proceed to the commit-back and tag/release steps

#### Scenario: Internal succeeds, Closed promote fails

- **WHEN** Internal upload succeeds but the `track_promote_to: "alpha"` step fails (network error, Play API rejection, track not configured, etc.)
- **THEN** the pipeline SHALL fail, SHALL NOT commit buildNumber back to `main`, and SHALL NOT create the git tag or GitHub Release

#### Scenario: Attempt to reach Production automatically

- **WHEN** any automatic code path in `.github/workflows/mobile-cd.yml` is inspected
- **THEN** no step SHALL invoke a fastlane lane or API call that promotes, submits, or rolls out to the Production track

### Requirement: Git tag and GitHub Release SHALL be created only after both track uploads succeed

The pipeline SHALL create the `mobile-v<X.Y.Z>` git tag and its GitHub Release only after the Android release job reports success (both Internal and Closed uploads completed, buildNumber committed back). If the Android release job fails at any step, no tag and no GitHub Release SHALL be produced for that run.

#### Scenario: Android release succeeds

- **WHEN** the `android-release` job completes successfully
- **THEN** the downstream `release` job SHALL create `mobile-v<X.Y.Z>` tag and its corresponding GitHub Release with generated release notes

#### Scenario: Android release fails partway

- **WHEN** the `android-release` job fails at AAB build, Internal upload, Closed upload, or commit-back
- **THEN** no git tag SHALL be created, no GitHub Release SHALL be created, and the repository SHALL remain in a state where the same semver can be retried on the next push

### Requirement: Production promote SHALL be a manually triggered workflow separate from the main CD

A dedicated workflow `.github/workflows/mobile-android-promote.yml` SHALL exist with `on: workflow_dispatch` trigger accepting two inputs: `tag` (required, the `mobile-v<X.Y.Z>` tag to promote) and `rollout` (optional, a decimal between 0.0 and 1.0, defaulting to `0.1`). The workflow SHALL check out the commit referenced by the input tag, SHALL invoke a fastlane lane that promotes the existing Closed-track release to Production with the specified staged rollout fraction, and SHALL NOT upload any new AAB.

#### Scenario: Operator triggers promote with default rollout

- **WHEN** operator opens GitHub Actions, selects `mobile-android-promote` workflow, inputs `tag=mobile-v1.7.0`, leaves `rollout` blank, and clicks Run
- **THEN** the workflow SHALL promote the AAB already present on the Closed track under tag `mobile-v1.7.0` to Production with rollout `0.1` (10% staged rollout)

#### Scenario: Operator specifies custom rollout

- **WHEN** operator triggers the workflow with `tag=mobile-v1.7.0` and `rollout=1.0`
- **THEN** the workflow SHALL promote to Production with rollout `1.0` (100%, no staged rollout)

#### Scenario: Production promote never runs automatically

- **WHEN** the main `mobile-cd.yml` workflow runs in any mode (push to main, workflow_run, manual dispatch)
- **THEN** no promotion to Production SHALL occur from `mobile-cd.yml`; the only code path to Production SHALL be `mobile-android-promote.yml` with human-provided `workflow_dispatch` inputs

### Requirement: Pipeline SHALL use fastlane with version locked via Gemfile

The pipeline SHALL invoke fastlane via `bundle exec fastlane <lane>`. `apps/mobile/android/Gemfile` SHALL declare a pinned fastlane version, and `apps/mobile/android/Gemfile.lock` SHALL be committed. GitHub Actions SHALL use `ruby/setup-ruby@v1` with `bundler-cache: true` and `working-directory: apps/mobile/android`.

#### Scenario: CI installs fastlane from Gemfile

- **WHEN** the `android-release` job executes
- **THEN** Ruby and bundler SHALL be set up from `apps/mobile/android/Gemfile`, and all fastlane calls SHALL use `bundle exec fastlane`

#### Scenario: Local developer invokes the same lane

- **WHEN** a developer on macOS runs `cd apps/mobile/android && bundle install && bundle exec fastlane upload_beta` with valid `key.properties` and Play service account JSON configured locally
- **THEN** the lane SHALL execute with the same fastlane version used by CI

### Requirement: All Play Store credentials SHALL come from GitHub Actions Secrets at runtime only

The Google Play Developer API service account JSON SHALL be supplied to the pipeline via the `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` secret and SHALL be written to a transient file inside the job workspace. The credential file SHALL NOT be committed to the repository. No Play API credential, keystore password, or key alias SHALL appear as plaintext in any file under version control.

#### Scenario: Service account JSON available at runtime

- **WHEN** the pipeline runs with `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` secret set
- **THEN** the pipeline SHALL materialize the JSON into a transient file (for example `apps/mobile/android/fastlane/play-service-account.json`) and pass its path to fastlane `supply` via the `json_key` option

#### Scenario: Service account JSON missing

- **WHEN** the pipeline runs without `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` set
- **THEN** the pipeline SHALL fail before attempting any upload, with an error message naming the missing secret and referencing `apps/mobile/docs/android-release.md`

#### Scenario: Repository scan for credentials

- **WHEN** any file under version control is inspected
- **THEN** no Play Developer API JSON content, keystore password, or key alias SHALL appear in plaintext
