import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatementResultsTable } from "./StatementResultsTable"
import { useBankStatementImport } from "./useBankStatementImport"

export function BankStatementImportForm() {
  const {
    banks,
    banksLoading,
    banksError,
    accounts,
    accountsLoading,
    accountsError,
    form,
    fileError,
    dateRangeError,
    isFormComplete,
    rows,
    submitting,
    submitError,
    selectBank,
    selectAccount,
    setStartDate,
    setEndDate,
    selectFile,
    submit,
  } = useBankStatementImport()

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Importar Extracto Bancario</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              void submit()
            }}
          >
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-4">
                <Field>
                  <FieldLabel htmlFor="bank">Banco</FieldLabel>
                  <Select
                    value={form.bankId}
                    onValueChange={(value) => selectBank(value)}
                    disabled={banksLoading}
                  >
                    <SelectTrigger id="bank" className="w-full">
                      <SelectValue>
                        {(value: string | null) =>
                          banks.find((bank) => bank.id === value)?.name ??
                          (banksLoading ? "Cargando bancos..." : "Selecciona un banco")
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map((bank) => (
                        <SelectItem key={bank.id} value={bank.id}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError>{banksError}</FieldError>
                </Field>

                <Field>
                  <FieldLabel htmlFor="account">Cuenta</FieldLabel>
                  <Select
                    value={form.accountId}
                    onValueChange={(value) => selectAccount(value)}
                    disabled={!form.bankId || accountsLoading}
                  >
                    <SelectTrigger id="account" className="w-full">
                      <SelectValue>
                        {(value: string | null) => {
                          const account = accounts.find((a) => a.id === value)
                          if (account) {
                            return `${account.name} (${account.accountNumber})`
                          }
                          if (!form.bankId) return "Selecciona un banco primero"
                          return accountsLoading
                            ? "Cargando cuentas..."
                            : "Selecciona una cuenta"
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} ({account.accountNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError>{accountsError}</FieldError>
                </Field>

                <Field>
                  <FieldLabel htmlFor="start-date">Fecha Inicial</FieldLabel>
                  <DatePicker
                    id="start-date"
                    value={form.startDate}
                    onChange={setStartDate}
                    placeholder="Fecha inicial del extracto"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="end-date">Fecha Final</FieldLabel>
                  <DatePicker
                    id="end-date"
                    value={form.endDate}
                    onChange={setEndDate}
                    placeholder="Fecha final del extracto"
                  />
                </Field>
              </div>
              <FieldError>{dateRangeError}</FieldError>

              <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto]">
                <Field>
                  <FieldLabel htmlFor="csv-file">Archivo del Extracto (CSV)</FieldLabel>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={(event) =>
                      selectFile(event.target.files?.[0] ?? null)
                    }
                  />
                  <FieldError>{fileError}</FieldError>
                </Field>

                <Button type="submit" disabled={!isFormComplete || submitting}>
                  {submitting ? "Procesando..." : "Procesar Extracto"}
                </Button>
              </div>

              <FieldError>{submitError}</FieldError>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <StatementResultsTable rows={rows} />
    </div>
  )
}
