export interface CajaSocialRecord {
  idRegistroExtracto: null
  fechaSaldo: string | null
  fechaTransaccion: string | null
  descripcion: string | null
  valor: string | null
  saldo: string | null
  regionalOficina: string | null
  tipoTransaccion: string | null
  oficina: string | null
  refTitularCuenta: string | null
  detallesAdicionales: string | null
}

export interface CajaSocialExtracto {
  idExtracto: null
  codigoBanco: string
  codigoCuenta: string
  fechaInicial: string
  fechaFinal: string
  cajaSocial: CajaSocialRecord[]
}

export interface ParseStatementInput {
  bankCode: string
  accountCode: string
  startDate: Date
  endDate: Date
  file: File
}
