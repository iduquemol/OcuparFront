export interface Bank {
  id: string
  name: string
}

export interface BankAccount {
  id: string
  bankId: string
  name: string
  accountNumber: string
}

export interface StatementRow {
  date: string
  description: string
  amount: number
  balance: number
}

export interface ExtractoMovement {
  idRegistroExtracto: number
  idExtracto: number
  fechaMovimiento: string
  descripcionMovimiento: string | null
  detalleMovimiento: string | null
  debito: number
  credito: number
  nitTercero: string | null
  nombreTercero: string | null
  tipoMovimiento: string | null
  subTipoDocumento: string | null
  cuentaContable: string | null
}

export interface CatalogItem {
  codigo: string
  nombre: string
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}
