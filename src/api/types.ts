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

export interface CuentaContableItem {
  codigo: string
  nombre: string
  tipo: string
}

export interface CarteraDocumento {
  codigoCliente: string
  nitCliente: string
  anoDocumento: string
  periodoDocumento: string
  tipoDocumento: string
  subTipoDocumento: string
  numeroDocumento: string
  registroDocumento: number
  detalleDocumento: string | null
  fechaVencimiento: string
  codigoSucursal: string
  codigoCentroCosto: string
  codigoClasificador1: string
  codigoClasificador2: string
  codigoClasificador3: string
  indicadorConciliacion: string
  saldoDocumento: number
  valorRetencion: number
  valorIca: number
  retencionIva: number
  mayorValor: number
  menorValor: number
  valorPago: number
  codigoCuentaContable: string
  tipoMoneda: string
  codigoPais: string
  codigoDepartamento: string
  codigoCiudad: string
  // Local-only fields set by CarteraSelectionForm; not part of the API response.
  codigoCuentaRetFuente?: string | null
  codigoCuentaRetIca?: string | null
  codigoCuentaRetIva?: string | null
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}
