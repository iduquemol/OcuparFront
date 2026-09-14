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

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}
