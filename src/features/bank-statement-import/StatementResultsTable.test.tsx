import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { StatementResultsTable } from "./StatementResultsTable"

describe("StatementResultsTable", () => {
  it("shows a placeholder when rows is null", () => {
    render(<StatementResultsTable rows={null} />)
    expect(
      screen.getByText("Envía un extracto para ver aquí las filas procesadas.")
    ).toBeInTheDocument()
  })

  it("shows an empty-results message when rows is an empty array", () => {
    render(<StatementResultsTable rows={[]} />)
    expect(
      screen.getByText("No se devolvieron filas para este extracto.")
    ).toBeInTheDocument()
  })

  it("renders the given rows", () => {
    render(
      <StatementResultsTable
        rows={[
          { date: "2024-01-01", description: "Deposit", amount: 100, balance: 100 },
          { date: "2024-01-02", description: "Withdrawal", amount: -20, balance: 80 },
        ]}
      />
    )

    expect(screen.getByText("Deposit")).toBeInTheDocument()
    expect(screen.getByText("Withdrawal")).toBeInTheDocument()
    expect(screen.getByText("80")).toBeInTheDocument()
  })
})
