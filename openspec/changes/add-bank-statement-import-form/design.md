## Context

See proposal.md - Why. This is a greenfield feature in a Vite + React 19 + TypeScript project that already uses shadcn/ui (Base UI-based components under `src/components/ui/`), Tailwind v4, react-hook-form + zod, and react-router-dom. There is no existing HTTP client layer, no date-picker component, and no established feature-folder convention yet, so this change also establishes those conventions.

The backend API contract for banks/accounts/statement-processing does not exist yet, so endpoint paths and response shapes are placeholders that can be adjusted once a real contract is available.

## Goals / Non-Goals

**Goals:**
- Establish a small, typed `src/api/` layer for calling the backend over `fetch`, reusable by future features.
- Establish a `src/features/<feature-name>/` convention for feature-specific UI + hooks, starting with `bank-statement-import`.
- Implement the form and results table per `specs/bank-statement-import/spec.md`.

**Non-Goals:**
- Defining or implementing the backend API itself.
- Persisting or caching statement results beyond the current form session (e.g. no global state store, no react-query) - a simple local hook/state is enough for one form.
- CSV parsing/validation of file contents on the client - the API is the sole processor of the file's contents (see proposal.md; only the `.csv` extension is validated client-side).

## Decisions

### HTTP client: native `fetch`, no new dependency
Use the browser's `fetch` wrapped in a small `src/api/http.ts` helper (base URL + JSON handling + error normalization) instead of adding axios. Rationale: user preference, and the project has no HTTP client today - `fetch` avoids a new dependency for a handful of endpoints. Alternative considered: axios (nicer interceptors/error ergonomics) - rejected for now since it isn't needed at this scale; can be revisited if the API surface grows.

### API base URL via Vite env var
Read the base URL from `import.meta.env.VITE_API_BASE_URL`, defined in `.env` / `.env.example` (placeholder value, e.g. `http://localhost:5000/api`). Rationale: keeps the backend location out of source and lets each environment point at a different API without code changes.

### Folder architecture
```
src/
  api/
    http.ts            # fetch wrapper: base URL, JSON parsing, error normalization
    banks.ts            # getBanks(), getAccountsByBank(bankId)
    statements.ts        # submitStatement({ bankId, accountId, startDate, endDate, file })
    types.ts             # Bank, BankAccount, StatementRow, ApiError shapes
  features/
    bank-statement-import/
      BankStatementImportForm.tsx   # form: bank/account selects, date range, file input, submit
      StatementResultsTable.tsx      # renders StatementRow[] using components/ui/table
      useBankStatementImport.ts       # local state + orchestration hook (banks/accounts fetch, submit, results)
  components/ui/
    calendar.tsx, popover.tsx, date-picker.tsx   # new shadcn/ui primitives (added via shadcn CLI) backing the two date controls
```
Rationale: mirrors the existing `components/ui/` primitive-vs-feature split already implied by the codebase (shadcn primitives vs app code), keeps API concerns out of UI components, and keeps the hook testable independent of rendering. Alternative considered: colocating API calls directly inside the form component - rejected because a dedicated `api/` layer is explicitly requested and will be reused by future features.

### Date controls
Add shadcn/ui's `calendar` + `popover` primitives (not yet installed) and a thin `date-picker.tsx` composed from them, matching the pattern of existing installed primitives (`select.tsx`, `input.tsx`, etc.). Alternative considered: plain `<input type="date">` - rejected to stay visually consistent with the rest of the shadcn-based UI.

### Statement submission and results
`BankStatementImportForm` calls `useBankStatementImport`, which calls `api/statements.ts#submitStatement` with `multipart/form-data` (bank id, account id, ISO start/end dates, and the CSV file). The hook holds `rows: StatementRow[] | null` and an error/loading state; `StatementResultsTable` renders `rows` (or an empty/placeholder state when `null`).

## Risks / Trade-offs

- [Backend contract doesn't exist yet] → Endpoint paths/response shapes in `api/types.ts` are placeholders; isolating them in `api/` limits the blast radius when the real contract arrives (mitigation: keep parsing/mapping localized to `api/*.ts` files, not spread into UI components).
- [No caching/dedup of bank or account requests] → Acceptable for a single form today; revisit if multiple places need the same lists (mitigation: the `api/banks.ts` functions are the natural place to add caching later without touching the UI).
- [`fetch` error handling is more manual than axios] → Centralized once in `api/http.ts`, so the manual work is paid only once, not per call site.
