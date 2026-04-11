## ADDED Requirements

### Requirement: Fetch failure warning dialog

The `BlogInputView` SHALL display a warning dialog when `fetchResult.failureDownloads > 0`, before proceeding to the download flow.

The dialog SHALL display:
- A title: "部分照片擷取失敗"
- A content message summarizing total, successful, and failed counts (e.g., "總共有 31 張照片，成功取得 30 張，無法取得 1 張。請問是否繼續下載已取得的照片？")
- A "繼續下載" button that proceeds to the download flow with the successfully fetched photos
- A "取消下載" button that dismisses the dialog and returns to the input page

The dialog SHALL NOT display individual error messages from `fetchErrors`.

#### Scenario: Failure downloads present

- **WHEN** `fetchResult.failureDownloads` is greater than `0`
- **THEN** a warning `AlertDialog` SHALL be displayed before navigation

#### Scenario: User chooses to continue

- **GIVEN** the warning dialog is displayed
- **WHEN** the user taps "繼續下載"
- **THEN** the app SHALL proceed to the download flow with the available photos

#### Scenario: User chooses to cancel

- **GIVEN** the warning dialog is displayed
- **WHEN** the user taps "取消下載"
- **THEN** the dialog SHALL be dismissed and the user SHALL remain on the input page

#### Scenario: No failure downloads

- **WHEN** `fetchResult.failureDownloads` is `0`
- **THEN** no warning dialog SHALL be displayed and the app SHALL proceed directly to the download flow
