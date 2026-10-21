import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ExtractoMovement } from "@/api/types"
import { CatalogCombobox } from "./CatalogCombobox"
import { useCatalogos } from "./useCatalogos"

interface ExtractoMovementsTableProps {
  movements: ExtractoMovement[] | null
  loading: boolean
  error: string | null
}

const COLUMN_COUNT = 10

export function ExtractoMovementsTable({
  movements,
  loading,
  error,
}: ExtractoMovementsTableProps) {
  const { terceros, cuentasContables, subTiposDocumento } = useCatalogos()
  const [rows, setRows] = useState<ExtractoMovement[] | null>(movements)
  const [lastMovements, setLastMovements] = useState(movements)

  // Reset local edits whenever a fresh `movements` prop arrives, by adjusting
  // state during render instead of an Effect (React's recommended pattern for
  // deriving state from a prop change) - see https://react.dev/learn/you-might-not-need-an-effect
  if (movements !== lastMovements) {
    setLastMovements(movements)
    setRows(movements)
  }

  function updateMovement(
    idRegistroExtracto: number,
    changes: Partial<ExtractoMovement>
  ) {
    setRows((prev) =>
      prev
        ? prev.map((movement) =>
            movement.idRegistroExtracto === idRegistroExtracto
              ? { ...movement, ...changes }
              : movement
          )
        : prev
    )
  }

  return (
    <Card className="w-full">
      <CardContent>
        <Table containerClassName="max-h-[32rem] overflow-y-auto">
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Detalle</TableHead>
              <TableHead className="text-right">Débito</TableHead>
              <TableHead className="text-right">Crédito</TableHead>
              <TableHead>NIT Tercero</TableHead>
              <TableHead>Nombre Tercero</TableHead>
              <TableHead>Tipo Movimiento</TableHead>
              <TableHead>Subtipo Documento</TableHead>
              <TableHead>Cuenta Contable</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {error ? (
              <TableRow>
                <TableCell colSpan={COLUMN_COUNT} className="text-center text-destructive">
                  {error}
                </TableCell>
              </TableRow>
            ) : loading ? (
              <TableRow>
                <TableCell
                  colSpan={COLUMN_COUNT}
                  className="text-center text-muted-foreground"
                >
                  Cargando movimientos...
                </TableCell>
              </TableRow>
            ) : !rows || rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={COLUMN_COUNT}
                  className="text-center text-muted-foreground"
                >
                  No hay movimientos para este extracto.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((movement) => (
                <TableRow key={movement.idRegistroExtracto}>
                  <TableCell>{movement.fechaMovimiento}</TableCell>
                  <TableCell>{movement.descripcionMovimiento ?? "-"}</TableCell>
                  <TableCell>{movement.detalleMovimiento ?? "-"}</TableCell>
                  <TableCell className="text-right">{movement.debito}</TableCell>
                  <TableCell className="text-right">{movement.credito}</TableCell>
                  <TableCell>
                    <CatalogCombobox
                      items={terceros.items}
                      loading={terceros.loading}
                      value={movement.nitTercero}
                      placeholder="Buscar tercero..."
                      onSelect={(item) =>
                        updateMovement(movement.idRegistroExtracto, {
                          nitTercero: item.codigo,
                          nombreTercero: item.nombre,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell>{movement.nombreTercero ?? "-"}</TableCell>
                  <TableCell>{movement.tipoMovimiento ?? "-"}</TableCell>
                  <TableCell>
                    <CatalogCombobox
                      items={subTiposDocumento.items}
                      loading={subTiposDocumento.loading}
                      value={movement.subTipoDocumento}
                      placeholder="Buscar subtipo..."
                      onSelect={(item) =>
                        updateMovement(movement.idRegistroExtracto, {
                          subTipoDocumento: item.codigo,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <CatalogCombobox
                      items={cuentasContables.items}
                      loading={cuentasContables.loading}
                      value={movement.cuentaContable}
                      placeholder="Buscar cuenta..."
                      onSelect={(item) =>
                        updateMovement(movement.idRegistroExtracto, {
                          cuentaContable: item.codigo,
                        })
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
