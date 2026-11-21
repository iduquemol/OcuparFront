# cartera-selection-form Specification

## Purpose

Lets a user open a client's accounts-receivable (cartera) from a bank movement row, see the client's current balance, pick invoices from the full list to accumulate in a working set, and see totals for that working set.

## Requirements

### Requirement: Opening the cartera form
Clicking a movement row's "Seleccionar Facturas" button SHALL open a form that requests `GET /cartera/{nitTercero}` using that row's `nitTercero` and, once the response arrives, populates the form with it. The form SHALL also receive that row's `credito` value, for display in "Facturas Abonadas".

#### Scenario: Form opens and loads cartera
- **WHEN** the user clicks "Seleccionar Facturas" on a row with a `nitTercero`
- **THEN** the form opens, requests that tercero's cartera, and shows a loading state until the response arrives

#### Scenario: Cartera fails to load
- **WHEN** the cartera request fails
- **THEN** the form shows an error message and no totals, summary table, or detail table

### Requirement: Cartera form header
The form SHALL display a header showing the originating movement's `nitTercero` and `nombreTercero`.

#### Scenario: Header shows tercero identity
- **WHEN** the form is open
- **THEN** its header shows the `nitTercero` and `nombreTercero` of the movement row that opened it

### Requirement: Saldo Actual totals
The form SHALL display a "Saldo Actual" card, to the left of "Facturas Abonadas", with totals computed over every document in the cartera response regardless of selection: Cantidad Facturas (count of documents) and Saldo Total (sum of `sal_doc`).

#### Scenario: Totals computed over the full response
- **WHEN** the cartera response loads with N documents
- **THEN** Cantidad Facturas shows N and Saldo Total shows the sum of `sal_doc` across all N documents

#### Scenario: Empty cartera shows zeroed totals
- **WHEN** the cartera response has no documents
- **THEN** Cantidad Facturas shows 0 and Saldo Total shows 0

#### Scenario: Saldo Total is formatted as currency
- **WHEN** Saldo Total is displayed
- **THEN** it shows a `$` sign and the value with thousands and decimal separators (e.g. `$ 130,00`)

### Requirement: Facturas Abonadas totals
The form SHALL display a "Facturas Abonadas" card with: Valor Banco, set directly to the originating movement's `credito` value (not computed from the cartera response); and totals computed over only the documents currently selected in the summary table (the working set shown in the detail table): Cantidad (count of selected documents), RteFte (sum of `val_ret`), ReteIca (sum of `val_ica`), ReteIva (sum of `ret_iva`), Mayor Valor (sum of `may_val`), Menor Valor (sum of `men_val`), and Abono Cartera (sum of `valorPago`).

#### Scenario: Valor Banco shows the originating movement's credito
- **WHEN** the form is open
- **THEN** Valor Banco shows the `credito` value of the movement row that opened the form, formatted as currency, regardless of any selection in the summary table

#### Scenario: Totals computed over the selected documents only
- **WHEN** the user has selected M documents in the summary table
- **THEN** Cantidad shows M, and each of the other monetary totals (excluding Valor Banco) shows the sum of its mapped field across only those M documents

#### Scenario: Nothing selected shows zeroed totals
- **WHEN** no document is selected in the summary table
- **THEN** Cantidad shows 0 and every monetary total other than Valor Banco shows 0

#### Scenario: Selecting a document updates the totals
- **WHEN** the user selects another document in the summary table
- **THEN** every total in the Facturas Abonadas card other than Valor Banco increases by that document's contribution

### Requirement: Cartera summary table
Below the totals cards, the form SHALL display a table listing every document in the cartera response with columns Factura (`num_doc`), Reg (`reg_doc`), Detalle (`det_doc`), Fecha Vencimiento (`fec_ven`), and Saldo (`sal_doc`), in that order, each with a checkbox supporting independent multi-row selection. The table SHALL show at most 4 rows at a time, scrolling for any additional rows.

#### Scenario: Summary table lists every document
- **WHEN** the cartera response loads with N documents
- **THEN** the summary table shows N rows, each with its `num_doc`, `reg_doc`, `det_doc`, `fec_ven`, `sal_doc`, and an unchecked checkbox

#### Scenario: Checking a summary row adds it to the detail table
- **WHEN** the user checks a row's checkbox in the summary table
- **THEN** that document appears as a new row in the detail table below

#### Scenario: Unchecking a summary row removes it from the detail table
- **WHEN** the user unchecks a previously-checked row's checkbox in the summary table
- **THEN** that document's row is removed from the detail table

#### Scenario: Saldo is formatted as currency
- **WHEN** a summary row's Saldo is displayed
- **THEN** it shows a `$` sign and the value with thousands and decimal separators (e.g. `$ 130,00`)

#### Scenario: More than 4 documents scrolls instead of growing
- **WHEN** the cartera response has more than 4 documents
- **THEN** the summary table stays at a fixed height showing 4 rows and scrolls to reveal the rest

### Requirement: Cartera detail table
Below the summary table, the form SHALL display a detail table listing every document currently selected (checked) in the summary table. This table does not support row selection. The table SHALL show at most 4 rows at a time, scrolling for any additional rows. The `Clasificador3` column SHALL render as a searchable catalog combobox (see "Searchable catalog lookups in the cartera detail table"). The `Rete Fuente`, `Rete Ica`, and `Rete Iva` columns SHALL each render as an editable currency input (see "Editable retention amounts in the cartera detail table"). Immediately to the right of `Rete Fuente`, `Rete Ica`, and `Rete Iva` respectively, the table SHALL show the `Cta Contable Rete Fuente`, `Cta Contable Rete Ica`, and `Cta Contable Rete Iva` columns, each rendering a conditional searchable combobox (see "Retention account lookups in the cartera detail table").

#### Scenario: Detail table lists the selected documents
- **WHEN** M documents are selected in the summary table
- **THEN** the detail table shows exactly those M documents, each with columns Factura (`num_doc`), Reg (`reg_doc`), Detalle (`det_doc`), Fecha Vencimiento (`fec_ven`), Saldo (`sal_doc`), Clasificador3 (`cod_cl3`), Valor recibido (`valorPago`), Rete Fuente (`val_ret`), Cta Contable Rete Fuente, Rete Ica (`val_ica`), Cta Contable Rete Ica, Rete Iva (`ret_iva`), Cta Contable Rete Iva, Mayor Valor (`may_val`), Menor Valor (`men_val`), and Abono cartera (`valorPago`)

#### Scenario: No documents selected yet
- **WHEN** no document has been selected in the summary table
- **THEN** the detail table shows an empty/placeholder state

#### Scenario: Saldo is formatted as currency
- **WHEN** a detail row's Saldo is displayed
- **THEN** it shows a `$` sign and the value with thousands and decimal separators (e.g. `$ 130,00`)

#### Scenario: More than 4 selected documents scrolls instead of growing
- **WHEN** more than 4 documents are selected in the summary table
- **THEN** the detail table stays at a fixed height showing 4 rows and scrolls to reveal the rest

#### Scenario: Sucursal, Centro Costo, Clasificador1 and Clasificador2 are not shown
- **WHEN** the detail table is rendered
- **THEN** it has no `Sucursal`, `Centro Costo`, `Clasificador1`, or `Clasificador2` column

### Requirement: Procesar button
Below the detail table, right-aligned, the form SHALL display a "Procesar" button. This button has no action wired to it in this change.

#### Scenario: Procesar button is present
- **WHEN** the form is open and has loaded its cartera
- **THEN** a "Procesar" button appears below the detail table, aligned to the right

### Requirement: Searchable catalog lookups in the cartera detail table
In the cartera detail table, the `Clasificador3` column SHALL render as a searchable combobox backed by its matching catalog. Selecting an option SHALL update that row's corresponding field locally, without sending any request to the API.

#### Scenario: Searching filters the catalog incrementally
- **WHEN** the user types into the `Clasificador3` combobox (backed by the clasificador3 catalog)
- **THEN** the list of options is filtered, incrementally as they type, to entries whose code or name matches what was typed

#### Scenario: Selecting a clasificador3 updates its cell
- **WHEN** the user selects an option in a row's `Clasificador3` combobox
- **THEN** that row's `cod_cl3` field is set to the selected option's `codigo`

#### Scenario: Selecting a catalog option does not change the totals
- **WHEN** the user selects an option in the `Clasificador3` combobox
- **THEN** the "Facturas Abonadas" card's totals remain unchanged

### Requirement: Retention account lookups in the cartera detail table
In the cartera detail table, the `Cta Contable Rete Fuente`, `Cta Contable Rete Ica`, and `Cta Contable Rete Iva` columns SHALL each render a searchable combobox that lets the user search by code and name. Each combobox SHALL be backed by the `cuentas-contables` catalog filtered, client-side, to entries whose `tipo` equals `RteFte`, `ReteIca`, and `ReteIva` respectively. Selecting an option SHALL update that row's corresponding account field locally, without sending any request to the API. Each combobox SHALL be enabled only when its row's matching retention value (`val_ret` for Rete Fuente, `val_ica` for Rete Ica, `ret_iva` for Rete Iva) is greater than 0; otherwise it SHALL be disabled and offer no selectable options. This retention value is the one currently shown in the row's editable retention input (see "Editable retention amounts in the cartera detail table"), so editing that input re-evaluates the combobox's enabled state.

#### Scenario: Searching filters the catalog incrementally
- **WHEN** the user types into one of the three retention-account comboboxes
- **THEN** the list of options is filtered, incrementally as they type, to cuentas-contables entries of the matching `tipo` whose code or name matches what was typed

#### Scenario: Selecting a retention account updates its cell
- **WHEN** the user selects an option in a row's `Cta Contable Rete Fuente`, `Cta Contable Rete Ica`, or `Cta Contable Rete Iva` combobox
- **THEN** that row's corresponding account field is set to the selected option's `codigo`

#### Scenario: Combobox is disabled when the retention value is zero
- **WHEN** a row's `val_ret`, `val_ica`, or `ret_iva` is 0
- **THEN** that row's matching `Cta Contable Rete Fuente`, `Cta Contable Rete Ica`, or `Cta Contable Rete Iva` combobox is disabled and has no selectable options

#### Scenario: Combobox is enabled when the retention value is greater than zero
- **WHEN** a row's `val_ret`, `val_ica`, or `ret_iva` is greater than 0
- **THEN** that row's matching combobox is enabled and offers the cuentas-contables entries of the matching `tipo`

#### Scenario: Selecting a retention account does not change the totals
- **WHEN** the user selects an option in any of the three retention-account comboboxes
- **THEN** the "Facturas Abonadas" card's totals remain unchanged

#### Scenario: Editing a retention amount down to zero disables its combobox
- **WHEN** the user edits a row's `Rete Fuente`, `Rete Ica`, or `Rete Iva` input down to `0`
- **THEN** that row's matching retention-account combobox becomes disabled and offers no selectable options

#### Scenario: Editing a retention amount above zero enables its combobox
- **WHEN** the user edits a row's `Rete Fuente`, `Rete Ica`, or `Rete Iva` input from `0` to a value greater than `0`
- **THEN** that row's matching retention-account combobox becomes enabled and offers the cuentas-contables entries of the matching `tipo`

### Requirement: Editable retention amounts in the cartera detail table
In the cartera detail table, the `Rete Fuente`, `Rete Ica`, and `Rete Iva` columns SHALL each render as an editable currency input, formatted with a `$` sign, thousands separator, and decimal separator (e.g. `$ 130,00`), consistent with how currency values are formatted elsewhere in the form. Each input SHALL use a cents-mask entry pattern: as the user types digits, they accumulate from the right, with the two rightmost digits always treated as the decimal part, so the displayed value is always validly formatted while typing. Editing an input SHALL update that row's corresponding field locally (`val_ret` for Rete Fuente, `val_ica` for Rete Ica, `ret_iva` for Rete Iva), without sending any request to the API, and SHALL be reflected in the "Facturas Abonadas" card's totals for selected rows.

#### Scenario: Retention amount is displayed as currency
- **WHEN** a detail row's `Rete Fuente`, `Rete Ica`, or `Rete Iva` input is not focused
- **THEN** it shows the row's value with a `$` sign and thousands/decimal separators (e.g. `$ 130,00`)

#### Scenario: Typing digits builds the value from the right
- **WHEN** the user types digits `1`, `3`, `0`, `0` into an empty retention input
- **THEN** the input shows `$ 13,00`

#### Scenario: Editing a retention amount updates the row's field
- **WHEN** the user edits a row's `Rete Fuente`, `Rete Ica`, or `Rete Iva` input to a new value
- **THEN** that row's corresponding field (`val_ret`, `val_ica`, or `ret_iva`) is set to the new value locally, without any request to the API

#### Scenario: Editing a retention amount updates the Facturas Abonadas totals
- **WHEN** the user edits the `Rete Fuente`, `Rete Ica`, or `Rete Iva` value of a row that is selected in the summary table
- **THEN** the "Facturas Abonadas" card's matching total (`RteFte`, `ReteIca`, or `ReteIva`) recomputes to include the edited value

### Requirement: Cartera form dialog width
The form's dialog SHALL be wider than the default dialog width, to give the summary and detail tables more room.

#### Scenario: Dialog is wider than the default
- **WHEN** the form is open
- **THEN** its dialog is rendered wider than the application's default dialog width
