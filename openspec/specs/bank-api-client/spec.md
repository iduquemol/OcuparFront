# bank-api-client Specification

## Purpose

Provides a frontend HTTP client layer that other features use to list banks, list accounts for a bank, and submit a bank statement file for processing, against a configurable API base URL.

## Requirements

### Requirement: Configurable API base URL
The client SHALL resolve the API base URL from application configuration (an environment variable) rather than hard-coding it, so the target API can change per environment without code changes.

#### Scenario: Base URL is used to build requests
- **WHEN** any client function issues a request
- **THEN** the request URL is built by joining the configured base URL with the endpoint path

### Requirement: List banks
The client SHALL expose a function to retrieve the list of banks from the API.

#### Scenario: Successful listing
- **WHEN** the list-banks function is called
- **THEN** it returns the list of banks parsed from the API response

#### Scenario: Request failure
- **WHEN** the underlying HTTP request fails or the API returns a non-success status
- **THEN** the function surfaces an error that the caller can distinguish from a successful empty list

### Requirement: List accounts by bank
The client SHALL expose a function to retrieve the list of accounts for a given bank identifier.

#### Scenario: Successful listing
- **WHEN** the list-accounts function is called with a bank identifier
- **THEN** it sends that identifier as a filter to the API and returns the accounts belonging to that bank

#### Scenario: Request failure
- **WHEN** the underlying HTTP request fails or the API returns a non-success status
- **THEN** the function surfaces an error that the caller can distinguish from a successful empty list

### Requirement: Submit Caja Social extract for loading
The client SHALL expose a function to submit a Caja Social (bank `32`) extract JSON document to an API endpoint that loads it and returns the generated extract identifier.

#### Scenario: Successful submission
- **WHEN** the submit-Caja-Social-extract function is called with a valid extract JSON document
- **THEN** it sends the document to the API and returns the generated extract identifier from the response

#### Scenario: Submission failure
- **WHEN** the API returns a non-success status while loading the extract
- **THEN** the function surfaces an error that the caller can use to show a failure message
