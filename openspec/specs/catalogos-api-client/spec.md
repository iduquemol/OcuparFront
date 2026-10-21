# catalogos-api-client Specification

## Purpose

Provides a frontend HTTP client layer for the read-only reference catalogs (third parties, chart-of-accounts, document subtypes) used to back searchable lookups in the extract movements table.

## Requirements

### Requirement: List terceros catalog
The client SHALL expose a function to retrieve the full terceros catalog from the API, as a list of `{ codigo, nombre }` items.

#### Scenario: Successful listing
- **WHEN** the list-terceros function is called
- **THEN** it returns the catalog parsed from the API response

#### Scenario: Request failure
- **WHEN** the underlying HTTP request fails or the API returns a non-success status
- **THEN** the function surfaces an error that the caller can distinguish from a successful empty list

### Requirement: List cuentas contables catalog
The client SHALL expose a function to retrieve the full cuentas-contables catalog from the API, as a list of `{ codigo, nombre }` items.

#### Scenario: Successful listing
- **WHEN** the list-cuentas-contables function is called
- **THEN** it returns the catalog parsed from the API response

#### Scenario: Request failure
- **WHEN** the underlying HTTP request fails or the API returns a non-success status
- **THEN** the function surfaces an error that the caller can distinguish from a successful empty list

### Requirement: List subtipos de documento catalog
The client SHALL expose a function to retrieve the full subtipos-documento catalog from the API, as a list of `{ codigo, nombre }` items.

#### Scenario: Successful listing
- **WHEN** the list-subtipos-documento function is called
- **THEN** it returns the catalog parsed from the API response

#### Scenario: Request failure
- **WHEN** the underlying HTTP request fails or the API returns a non-success status
- **THEN** the function surfaces an error that the caller can distinguish from a successful empty list
