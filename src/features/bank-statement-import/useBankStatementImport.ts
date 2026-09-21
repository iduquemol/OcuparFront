import { useCallback, useEffect, useState } from "react"
import { getAccountsByBank, getBanks } from "@/api/banks"
import { submitCajaSocialExtracto } from "@/api/extractos"
import type { Bank, BankAccount } from "@/api/types"
import { hasParser, parseStatementCsv } from "@/statement-parsing/registry"

const CSV_EXTENSION = /\.csv$/i

interface FormState {
  bankId: string | null
  accountId: string | null
  startDate: Date | undefined
  endDate: Date | undefined
  file: File | null
}

const initialFormState: FormState = {
  bankId: null,
  accountId: null,
  startDate: undefined,
  endDate: undefined,
  file: null,
}

export function useBankStatementImport() {
  const [banks, setBanks] = useState<Bank[]>([])
  const [banksLoading, setBanksLoading] = useState(true)
  const [banksError, setBanksError] = useState<string | null>(null)

  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [accountsLoading, setAccountsLoading] = useState(false)
  const [accountsError, setAccountsError] = useState<string | null>(null)

  const [form, setForm] = useState<FormState>(initialFormState)
  const [fileError, setFileError] = useState<string | null>(null)

  const [idExtracto, setIdExtracto] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadBanks() {
      setBanksLoading(true)
      setBanksError(null)
      try {
        const result = await getBanks()
        if (!cancelled) setBanks(result)
      } catch (error) {
        if (!cancelled) {
          setBanksError(error instanceof Error ? error.message : "No se pudieron cargar los bancos")
        }
      } finally {
        if (!cancelled) setBanksLoading(false)
      }
    }

    void loadBanks()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadAccounts(bankId: string) {
      setAccountsLoading(true)
      setAccountsError(null)
      try {
        const result = await getAccountsByBank(bankId)
        if (!cancelled) setAccounts(result)
      } catch (error) {
        if (!cancelled) {
          setAccountsError(
            error instanceof Error ? error.message : "No se pudieron cargar las cuentas"
          )
        }
      } finally {
        if (!cancelled) setAccountsLoading(false)
      }
    }

    if (form.bankId) {
      void loadAccounts(form.bankId)
    }

    return () => {
      cancelled = true
    }
  }, [form.bankId])

  const visibleAccounts = form.bankId ? accounts : []
  const visibleAccountsError = form.bankId ? accountsError : null

  const selectBank = useCallback((bankId: string | null) => {
    setForm((prev) => ({ ...prev, bankId, accountId: null }))
  }, [])

  const selectAccount = useCallback((accountId: string | null) => {
    setForm((prev) => ({ ...prev, accountId }))
  }, [])

  const setStartDate = useCallback((startDate: Date | undefined) => {
    setForm((prev) => ({ ...prev, startDate }))
  }, [])

  const setEndDate = useCallback((endDate: Date | undefined) => {
    setForm((prev) => ({ ...prev, endDate }))
  }, [])

  const selectFile = useCallback((file: File | null) => {
    if (file && !CSV_EXTENSION.test(file.name)) {
      setFileError("Solo se aceptan archivos .csv")
      setForm((prev) => ({ ...prev, file: null }))
      return
    }
    setFileError(null)
    setForm((prev) => ({ ...prev, file }))
  }, [])

  const dateRangeError =
    form.startDate && form.endDate && form.endDate < form.startDate
      ? "La fecha final no puede ser anterior a la fecha inicial"
      : null

  const bankUnsupported = !!form.bankId && !hasParser(form.bankId)

  const isFormComplete =
    !!form.bankId &&
    !!form.accountId &&
    !!form.startDate &&
    !!form.endDate &&
    !!form.file &&
    !dateRangeError &&
    !fileError &&
    !bankUnsupported

  const submit = useCallback(async () => {
    if (!isFormComplete || !form.bankId || !form.accountId || !form.startDate || !form.endDate || !form.file) {
      return
    }

    if (!hasParser(form.bankId)) {
      setSubmitError(`El banco "${form.bankId}" aún no está soportado`)
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    setIdExtracto(null)
    try {
      const extracto = await parseStatementCsv({
        bankCode: form.bankId,
        accountCode: form.accountId,
        startDate: form.startDate,
        endDate: form.endDate,
        file: form.file,
      })
      const result = await submitCajaSocialExtracto(extracto)
      setIdExtracto(result.idExtracto)
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "No se pudo procesar el extracto"
      )
    } finally {
      setSubmitting(false)
    }
  }, [isFormComplete, form])

  return {
    banks,
    banksLoading,
    banksError,
    accounts: visibleAccounts,
    accountsLoading,
    accountsError: visibleAccountsError,
    form,
    fileError,
    dateRangeError,
    bankUnsupported,
    isFormComplete,
    idExtracto,
    submitting,
    submitError,
    selectBank,
    selectAccount,
    setStartDate,
    setEndDate,
    selectFile,
    submit,
  }
}
