# bank-statement-csv-parsing Specification

## Purpose

Converts a selected bank statement CSV file into a normalized JSON extract structure, using a bank-specific parser selected by bank code, so the result can later be sent to a backend processing endpoint.

## Requirements

### Requirement: Bank-specific parser selection
The system SHALL select a CSV parser based on the bank code the user chose in the form. When no parser is registered for that bank code, the system SHALL raise a clear, catchable error identifying the unsupported bank code rather than producing partial or incorrect output.

#### Scenario: Supported bank code
- **WHEN** parsing is requested for bank code `32`
- **THEN** the Caja Social parser is used

#### Scenario: Unsupported bank code
- **WHEN** parsing is requested for a bank code with no registered parser
- **THEN** the system raises an error identifying the unsupported bank code and produces no output

### Requirement: Caja Social (bank 32) CSV structure
The Caja Social parser SHALL read the CSV file as Windows-1252 encoded text, skip exactly the first two lines (the report title line and the column header line), and treat every remaining non-blank line as one data record with 10 semicolon-delimited columns, in this order: `fechaSaldo`, `fechaTransaccion`, `descripcion`, `valor`, `saldo`, `regionalOficina`, `tipoTransaccion`, `oficina`, `refTitularCuenta`, `detallesAdicionales`. An empty column value SHALL map to `null`.

#### Scenario: Data row mapped positionally
- **WHEN** a data line has values in all 10 columns
- **THEN** each value is assigned to its corresponding field in order, with no reordering or reinterpretation of the columns

#### Scenario: Empty column becomes null
- **WHEN** a column in a data line is empty
- **THEN** the corresponding field in the resulting record is `null`, not an empty string

#### Scenario: Title and header lines are skipped
- **WHEN** the CSV's first line is the report title and its second line is the column header
- **THEN** neither line appears as a record in the parsed output

#### Scenario: Blank lines are ignored
- **WHEN** the CSV contains a blank line (e.g. a trailing empty line at end of file)
- **THEN** that line does not produce a record

#### Scenario: Accented characters are preserved
- **WHEN** a data line contains accented characters or "ñ" encoded as Windows-1252
- **THEN** the resulting field value contains the correct accented characters, not corrupted/replacement characters

### Requirement: Extract JSON envelope
The system SHALL wrap the Caja Social parser's records in a JSON object with `idExtracto` (`null`), `codigoBanco` (the selected bank's code), `codigoCuenta` (the selected account's code), `fechaInicial` and `fechaFinal` (the selected statement date range, formatted `YYYY-MM-DD`), and a `cajaSocial` array of records, each with `idRegistroExtracto` (`null`) plus the 10 mapped fields.

#### Scenario: Envelope fields populated from form state
- **WHEN** the parser is invoked with a selected bank, account, start date, end date, and CSV file
- **THEN** the resulting JSON's `codigoBanco`, `codigoCuenta`, `fechaInicial`, and `fechaFinal` reflect those selections, and `idExtracto` is `null`
