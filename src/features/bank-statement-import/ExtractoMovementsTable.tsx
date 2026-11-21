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
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Receipt } from "lucide-react"
import type { ExtractoMovement } from "@/api/types"
import { CatalogCombobox } from "./CatalogCombobox"
import { useCatalogos } from "./useCatalogos"
import { CarteraSelectionForm } from "./CarteraSelectionForm"
import { formatCurrency } from "@/lib/currency"

interface ExtractoMovementsTableProps {
  movements: ExtractoMovement[] | null
  loading: boolean
  error: string | null
}

const COLUMN_COUNT = 9

export function ExtractoMovementsTable({
  movements,
  loading,
  error,
}: ExtractoMovementsTableProps) {
  const { terceros, cuentasContables, subTiposDocumento } = useCatalogos()
  const [rows, setRows] = useState<ExtractoMovement[] | null>(movements)
  const [lastMovements, setLastMovements] = useState(movements)
  const [carteraTarget, setCarteraTarget] = useState<ExtractoMovement | null>(null)

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
    <TooltipProvider>
      <Card className="w-full">
      <CardContent>
        <Table containerClassName="max-h-[32rem] overflow-y-auto">
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Débito</TableHead>
              <TableHead className="text-right">Crédito</TableHead>
              <TableHead>NIT Tercero</TableHead>
              <TableHead>Nombre Tercero</TableHead>
              <TableHead></TableHead>
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
                  <TableCell className="text-right">{formatCurrency(movement.debito)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(movement.credito)}</TableCell>
                  <TableCell>
                    <CatalogCombobox
                      items={terceros.items}
                      loading={terceros.loading}
                      value={movement.nitTercero}
                      placeholder="Buscar tercero..."
                      triggerDisplay="code"
                      onSelect={(item) =>
                        updateMovement(movement.idRegistroExtracto, {
                          nitTercero: item.codigo,
                          nombreTercero: item.nombre,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell>{movement.nombreTercero ?? "-"}</TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="default"
                            size="icon-sm"
                            disabled={!movement.nitTercero}
                            onClick={() => setCarteraTarget(movement)}
                          >
                            <Receipt />
                            <span className="sr-only">Seleccionar Facturas</span>
                          </Button>
                        }
                      />
                      <TooltipContent>Seleccionar Facturas</TooltipContent>
                    </Tooltip>
                  </TableCell>
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
      {carteraTarget && (
        <CarteraSelectionForm
          nitTercero={carteraTarget.nitTercero!}
          nombreTercero={carteraTarget.nombreTercero}
          creditoMovimiento={carteraTarget.credito}
          open={carteraTarget !== null}
          onOpenChange={(open) => {
            if (!open) setCarteraTarget(null)
          }}
        />
      )}
      </Card>
    </TooltipProvider>
  )
}
