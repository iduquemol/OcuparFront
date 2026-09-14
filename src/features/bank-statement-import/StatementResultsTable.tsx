import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { StatementRow } from "@/api/types"

interface StatementResultsTableProps {
  rows: StatementRow[] | null
}

export function StatementResultsTable({ rows }: StatementResultsTableProps) {
  return (
    <Card>
      <CardContent>
        <Table containerClassName="max-h-[32rem] overflow-y-auto">
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!rows || rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  {rows === null
                    ? "Envía un extracto para ver aquí las filas procesadas."
                    : "No se devolvieron filas para este extracto."}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow key={`${row.date}-${index}`}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell className="text-right">{row.amount}</TableCell>
                  <TableCell className="text-right">{row.balance}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
