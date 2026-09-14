## Purpose

Lets a user import a bank statement by selecting a bank and account, a statement date range, and a CSV flat file, then view the processed statement rows in a table.

## ADDED Requirements

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
The form SHALL only allow submission when a bank, an account, a valid start date, a valid end date (not before start date), and a CSV file are all provided.

#### Scenario: Submission blocked when incomplete
- **WHEN** any of bank, account, start date, end date, or CSV file is missing or invalid
- **THEN** the submit action is disabled

#### Scenario: Submission allowed when complete
- **WHEN** bank, account, a valid date range, and a CSV file are all provided
- **THEN** the submit action is enabled

### Requirement: Processed results table
Below the form, the system SHALL display a table that shows the statement rows returned after the CSV file is submitted for processing. Before any submission, the table SHALL be empty or show a placeholder state.

#### Scenario: Results appear after successful processing
- **WHEN** the submitted statement is processed successfully by the API
- **THEN** the table displays the returned rows

#### Scenario: Processing fails
- **WHEN** the API returns an error while processing the submitted statement
- **THEN** the form shows an error message and the table remains empty
