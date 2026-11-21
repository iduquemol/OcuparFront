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
The client SHALL expose a function to retrieve the full cuentas-contables catalog from the API, as a list of `{ codigo, nombre, tipo }` items.

#### Scenario: Successful listing
- **WHEN** the list-cuentas-contables function is called
- **THEN** it returns the catalog parsed from the API response, including each item's `tipo`

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

### Requirement: List sucursales catalog
The client SHALL expose a function to retrieve the full sucursales catalog from the API, as a list of `{ codigo, nombre }` items.

#### Scenario: Successful listing
- **WHEN** the list-sucursales function is called
- **THEN** it returns the catalog parsed from the API response

#### Scenario: Request failure
- **WHEN** the underlying HTTP request fails or the API returns a non-success status
- **THEN** the function surfaces an error that the caller can distinguish from a successful empty list

### Requirement: List centros de costo catalog
The client SHALL expose a function to retrieve the full centros-de-costo catalog from the API, as a list of `{ codigo, nombre }` items.

#### Scenario: Successful listing
- **WHEN** the list-centros-costo function is called
- **THEN** it returns the catalog parsed from the API response

#### Scenario: Request failure
- **WHEN** the underlying HTTP request fails or the API returns a non-success status
- **THEN** the function surfaces an error that the caller can distinguish from a successful empty list

### Requirement: List clasificador1 catalog
The client SHALL expose a function to retrieve the full clasificador1 catalog from the API, as a list of `{ codigo, nombre }` items.

#### Scenario: Successful listing
- **WHEN** the list-clasificador1 function is called
- **THEN** it returns the catalog parsed from the API response

#### Scenario: Request failure
- **WHEN** the underlying HTTP request fails or the API returns a non-success status
- **THEN** the function surfaces an error that the caller can distinguish from a successful empty list

### Requirement: List clasificador2 catalog
The client SHALL expose a function to retrieve the full clasificador2 catalog from the API, as a list of `{ codigo, nombre }` items.

#### Scenario: Successful listing
- **WHEN** the list-clasificador2 function is called
- **THEN** it returns the catalog parsed from the API response

#### Scenario: Request failure
- **WHEN** the underlying HTTP request fails or the API returns a non-success status
- **THEN** the function surfaces an error that the caller can distinguish from a successful empty list

### Requirement: List clasificador3 catalog
The client SHALL expose a function to retrieve the full clasificador3 catalog from the API, as a list of `{ codigo, nombre }` items.

#### Scenario: Successful listing
- **WHEN** the list-clasificador3 function is called
- **THEN** it returns the catalog parsed from the API response

#### Scenario: Request failure
- **WHEN** the underlying HTTP request fails or the API returns a non-success status
- **THEN** the function surfaces an error that the caller can distinguish from a successful empty list
