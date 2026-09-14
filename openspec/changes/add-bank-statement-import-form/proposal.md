## Why

There is currently no way to import a bank statement into the system. Users need a form to pick a bank and one of its accounts, define the statement date range, upload the corresponding CSV flat file, and see the processed rows in a table. There is also no frontend API layer yet to talk to the backend, so it must be built alongside the form.

## What Changes

- Add a bank statement import form with:
  - A bank selector populated from an API call.
  - An account selector populated from an API call filtered by the selected bank; disabled/empty until a bank is chosen.
  - Two date pickers: statement start date and end date.
  - A file picker restricted to `.csv` files.
  - A submit action that sends bank, account, date range, and the CSV file to an API endpoint for processing.
  - A results table below the form that renders the rows returned by the processing endpoint.
- Add a frontend API client layer (`src/api/`) using the native `fetch` API, with a configurable base URL (via Vite env var) and typed functions for: listing banks, listing accounts by bank, and submitting a statement for processing.
- Add missing shadcn/ui primitives needed by the form (date picker/calendar, popover) since they are not yet installed in `src/components/ui/`.

## Capabilities

### New Capabilities
- `bank-statement-import`: Form to select bank, account, date range, and CSV file, submit it for processing, and display the processed results in a table.
- `bank-api-client`: Frontend HTTP client layer (fetch-based) for listing banks, listing accounts by bank, and submitting a statement file for processing, with a configurable API base URL.

### Modified Capabilities
(none — greenfield feature, no existing specs)

## Impact

- New folders: `src/api/` (HTTP client, endpoints, types), `src/features/bank-statement-import/` (form + table components, local state/hooks).
- New shadcn/ui components: calendar/date-picker and popover (added under `src/components/ui/`).
- `App.tsx` will need to render the new form (wiring only; exact placement decided during implementation).
- Environment config: a new Vite env var for the API base URL (e.g. `VITE_API_BASE_URL`), with a placeholder value since the backend contract does not exist yet.
- No breaking changes; this is new functionality only.
