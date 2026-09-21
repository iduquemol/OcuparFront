# bank-statement-import Specification

## Purpose

Lets a user import a bank statement by selecting a bank and account, a statement date range, and a CSV flat file, then view the processed statement rows in a table.

## Requirements

### Requirement: Bank selection
The form SHALL display a bank selector control populated with the list of banks returned by the banks API. The control SHALL show a loading state while the request is in flight and an error state if the request fails.

#### Scenario: Banks load successfully
- **WHEN** the form mounts
- **THEN** the bank selector is populated with the banks returned by the API and no bank is pre-selected

#### Scenario: Banks fail to load
- **WHEN** the banks API call fails
- **THEN** the form shows an error indicator for the bank selector and the account selector remains disabled

### Requirement: Account selection filtered by bank
The form SHALL display an account selector control that is disabled and empty until a bank is selected. When a bank is selected, the control SHALL be populated with the accounts returned by the accounts API for that bank. Changing the selected bank SHALL clear the current account selection and re-fetch accounts for the newly selected bank.

#### Scenario: Selecting a bank loads its accounts
- **WHEN** the user selects a bank
- **THEN** the account selector requests accounts filtered by that bank's identifier and becomes populated with the returned accounts

#### Scenario: Changing bank resets accounts
- **WHEN** the user has an account selected and then changes the selected bank
- **THEN** the previously selected account is cleared and the account selector is re-populated with accounts for the new bank

#### Scenario: No bank selected
- **WHEN** no bank is selected
- **THEN** the account selector is disabled and shows no options

### Requirement: Statement date range
The form SHALL provide two date controls, a start date and an end date for the statement period. The end date SHALL NOT be before the start date.

#### Scenario: End date before start date is rejected
- **WHEN** the user picks an end date earlier than the selected start date
- **THEN** the form shows a validation error and does not allow submission until corrected

### Requirement: CSV file selection
The form SHALL provide a file picker that accepts a single `.csv` file. Selecting a non-CSV file SHALL be rejected with a validation message.

#### Scenario: Valid CSV selected
- **WHEN** the user selects a file with a `.csv` extension
- **THEN** the file is accepted and its name is shown in the form

#### Scenario: Non-CSV file rejected
- **WHEN** the user selects a file that is not `.csv`
- **THEN** the form shows a validation error and does not accept the file

### Requirement: Form submission requires all fields
The form SHALL only allow submission when a bank, an account, a valid start date, a valid end date (not before start date), a CSV file, and a registered CSV parser for the selected bank are all provided.

#### Scenario: Submission blocked when incomplete
- **WHEN** any of bank, account, start date, end date, or CSV file is missing or invalid
- **THEN** the submit action is disabled

#### Scenario: Submission allowed when complete
- **WHEN** bank, account, a valid date range, a CSV file, and a registered parser for the selected bank are all provided
- **THEN** the submit action is enabled

### Requirement: Submission confirmation
After a successful submission, the system SHALL display a confirmation message that includes the generated extract identifier returned by the API.

#### Scenario: Confirmation shown after successful load
- **WHEN** the submitted extract is loaded successfully by the API
- **THEN** the form shows a confirmation message including the returned extract identifier

#### Scenario: Loading fails
- **WHEN** the API returns an error while loading the submitted extract
- **THEN** the form shows an error message and no confirmation

### Requirement: Unsupported bank blocks submission
When the selected bank has no registered CSV parser, the system SHALL prevent submission and SHALL show a clear message identifying the bank as unsupported, without attempting any API call.

#### Scenario: Selected bank has no parser
- **WHEN** the user selects a bank for which no CSV parser is registered
- **THEN** the submit action is disabled or blocked with a message stating that bank is not yet supported, and no API request is made
