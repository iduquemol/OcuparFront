## 1. Environment and dependencies

- [x] 1.1 Add `VITE_API_BASE_URL` to `.env.example` (placeholder value) and document it; verify `import.meta.env.VITE_API_BASE_URL` is readable in a local `.env`
- [x] 1.2 Install missing shadcn/ui primitives (`calendar`, `popover`) into `src/components/ui/` via the shadcn CLI; verify the generated files build with `npm run build`
- [x] 1.3 Install and configure Vitest + Testing Library (`vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`) so the unit tests required by later tasks can run; verify with a `npm run test` script and a trivial passing test

## 2. API client layer (`src/api/`)

- [x] 2.1 Create `src/api/types.ts` with `Bank`, `BankAccount`, `StatementRow`, and `ApiError` types per `specs/bank-api-client/spec.md`
- [x] 2.2 Create `src/api/http.ts`: a `fetch` wrapper that builds URLs from `VITE_API_BASE_URL`, parses JSON responses, and throws a normalized `ApiError` on non-success status; verify with a unit test covering a success and a failure response
- [x] 2.3 Create `src/api/banks.ts` with `getBanks()` and `getAccountsByBank(bankId: string)`, both using `http.ts`; verify with unit tests mocking `fetch` for success and error cases (matches `specs/bank-api-client/spec.md` "List banks" and "List accounts by bank")
- [x] 2.4 Create `src/api/statements.ts` with `submitStatement({ bankId, accountId, startDate, endDate, file })` that posts `multipart/form-data` and returns `StatementRow[]`; verify with a unit test mocking `fetch` for success and error cases (matches `specs/bank-api-client/spec.md` "Submit statement for processing")

## 3. Bank statement import feature (`src/features/bank-statement-import/`)

- [x] 3.1 Create `useBankStatementImport.ts`: fetches banks on mount, fetches accounts when a bank is selected (clearing the previous account selection on bank change), holds form field state, and exposes a `submit()` that calls `api/statements.ts` and stores `rows`/error/loading state; verify with unit tests covering bank load, account reload on bank change, and submit success/failure (matches the "Bank selection" and "Account selection filtered by bank" scenarios in `specs/bank-statement-import/spec.md`)
- [x] 3.2 Add client-side validation in the hook or form: end date not before start date, file must have a `.csv` extension, and submit disabled unless bank/account/dates/file are all valid; verify with unit tests for each validation scenario in `specs/bank-statement-import/spec.md` ("Statement date range", "CSV file selection", "Form submission requires all fields")
- [x] 3.3 Build `BankStatementImportForm.tsx` using `components/ui/select`, the new `date-picker`, and a file input, wired to `useBankStatementImport`; verify by rendering the form in the app and checking bank/account selects, date pickers, and file input behave per spec (loading/disabled/error states)
- [x] 3.4 Build `StatementResultsTable.tsx` using `components/ui/table` to render `rows` from the hook, with an empty/placeholder state when `rows` is `null`; verify by rendering with sample rows and with `null` and checking both states match `specs/bank-statement-import/spec.md` ("Processed results table")
- [x] 3.5 Render `BankStatementImportForm` (which includes the results table) from `App.tsx` or an appropriate route; verify `npm run dev` shows the form and table on the page

## 4. Verification

- [x] 4.1 Run `npm run lint` and `npm run build` and confirm both succeed with no new errors
- [x] 4.2 Manually exercise the flow against a mocked/local API (or temporarily stubbed responses) confirming: bank list loads, account list updates on bank change, invalid date range and non-CSV file are rejected, submit is disabled until the form is complete, and a successful submit populates the results table
