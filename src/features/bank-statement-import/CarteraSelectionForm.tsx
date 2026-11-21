import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { getCartera } from "@/api/cartera"
import { formatCurrency } from "@/lib/currency"
import { CatalogCombobox } from "./CatalogCombobox"
import { CurrencyMaskInput } from "@/components/ui/currency-mask-input"
import { useCarteraCatalogos } from "./useCarteraCatalogos"
import type { CarteraDocumento } from "@/api/types"

interface CarteraSelectionFormProps {
  nitTercero: string
  nombreTercero: string | null
  creditoMovimiento: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SaldoActual {
  cantidadFacturas: number
  saldoTotal: number
}

interface FacturasAbonadasTotales {
  cantidad: number
  rteFte: number
  reteIca: number
  reteIva: number
  mayorValor: number
  menorValor: number
  abonoCartera: number
}

const ZERO_SALDO_ACTUAL: SaldoActual = {
  cantidadFacturas: 0,
  saldoTotal: 0,
}

const ZERO_FACTURAS_ABONADAS: FacturasAbonadasTotales = {
  cantidad: 0,
  rteFte: 0,
  reteIca: 0,
  reteIva: 0,
  mayorValor: 0,
  menorValor: 0,
  abonoCartera: 0,
}

function documentoKey(documento: CarteraDocumento): string {
  return `${documento.numeroDocumento}-${documento.anoDocumento}-${documento.periodoDocumento}`
}

function computeSaldoActual(documentos: CarteraDocumento[]): SaldoActual {
  return documentos.reduce(
    (totales, documento) => ({
      cantidadFacturas: totales.cantidadFacturas + 1,
      saldoTotal: totales.saldoTotal + documento.saldoDocumento,
    }),
    ZERO_SALDO_ACTUAL
  )
}

function computeFacturasAbonadas(documentos: CarteraDocumento[]): FacturasAbonadasTotales {
  return documentos.reduce(
    (totales, documento) => ({
      cantidad: totales.cantidad + 1,
      rteFte: totales.rteFte + documento.valorRetencion,
      reteIca: totales.reteIca + documento.valorIca,
      reteIva: totales.reteIva + documento.retencionIva,
      mayorValor: totales.mayorValor + documento.mayorValor,
      menorValor: totales.menorValor + documento.menorValor,
      abonoCartera: totales.abonoCartera + documento.valorPago,
    }),
    ZERO_FACTURAS_ABONADAS
  )
}

export function CarteraSelectionForm({
  nitTercero,
  nombreTercero,
  creditoMovimiento,
  open,
  onOpenChange,
}: CarteraSelectionFormProps) {
  const [documentos, setDocumentos] = useState<CarteraDocumento[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const { clasificador3, cuentasRetFuente, cuentasReteIca, cuentasReteIva } =
    useCarteraCatalogos()

  useEffect(() => {
    if (!open) return

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      setDocumentos(null)
      setSelectedKeys(new Set())
      try {
        const result = await getCartera(nitTercero)
        if (!cancelled) {
          setDocumentos(result)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudo cargar la cartera")
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [open, nitTercero])

  function toggleSelected(key: string, checked: boolean) {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (checked) next.add(key)
      else next.delete(key)
      return next
    })
  }

  function updateDocumento(key: string, changes: Partial<CarteraDocumento>) {
    setDocumentos((prev) =>
      prev
        ? prev.map((documento) =>
            documentoKey(documento) === key ? { ...documento, ...changes } : documento
          )
        : prev
    )
  }

  const saldoActual = documentos ? computeSaldoActual(documentos) : ZERO_SALDO_ACTUAL
  const selectedDocumentos = documentos?.filter((d) => selectedKeys.has(documentoKey(d))) ?? []
  const facturasAbonadas = computeFacturasAbonadas(selectedDocumentos)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-7xl overflow-y-auto sm:max-w-7xl">
        <DialogHeader>
          <DialogTitle>
            {nitTercero} — {nombreTercero ?? "-"}
          </DialogTitle>
        </DialogHeader>

        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : loading ? (
          <p className="text-sm text-muted-foreground">Cargando cartera...</p>
        ) : (
          <>
            <div className="grid gap-2 sm:grid-cols-2">
              <Card size="sm">
                <CardHeader>
                  <CardTitle>Saldo Actual</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                  <TotalField label="Cantidad Facturas" value={saldoActual.cantidadFacturas} />
                  <TotalField label="Saldo Total" value={formatCurrency(saldoActual.saldoTotal)} />
                </CardContent>
              </Card>

              <Card size="sm">
                <CardHeader>
                  <CardTitle>Facturas Abonadas</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <TotalField label="Cantidad" value={facturasAbonadas.cantidad} />
                  <TotalField label="Valor Banco" value={formatCurrency(creditoMovimiento)} />
                  <TotalField label="RteFte" value={facturasAbonadas.rteFte} />
                  <TotalField label="ReteIca" value={facturasAbonadas.reteIca} />
                  <TotalField label="ReteIva" value={facturasAbonadas.reteIva} />
                  <TotalField label="Mayor Valor" value={facturasAbonadas.mayorValor} />
                  <TotalField label="Menor Valor" value={facturasAbonadas.menorValor} />
                  <TotalField label="Abono cartera" value={facturasAbonadas.abonoCartera} />
                </CardContent>
              </Card>
            </div>

            <Table containerClassName="max-h-[13rem] overflow-y-auto">
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>Factura</TableHead>
                  <TableHead>Reg</TableHead>
                  <TableHead>Detalle</TableHead>
                  <TableHead>Fecha Vencimiento</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!documentos || documentos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No hay documentos en la cartera.
                    </TableCell>
                  </TableRow>
                ) : (
                  documentos.map((documento) => {
                    const key = documentoKey(documento)
                    const checked = selectedKeys.has(key)
                    return (
                      <TableRow key={key} data-state={checked ? "selected" : undefined}>
                        <TableCell>
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) => toggleSelected(key, value === true)}
                          />
                        </TableCell>
                        <TableCell>{documento.numeroDocumento}</TableCell>
                        <TableCell>{documento.registroDocumento}</TableCell>
                        <TableCell>{documento.detalleDocumento ?? "-"}</TableCell>
                        <TableCell>{documento.fechaVencimiento}</TableCell>
                        <TableCell className="text-right">{formatCurrency(documento.saldoDocumento)}</TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>

            <Table containerClassName="max-h-[13rem] overflow-y-auto">
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead>Factura</TableHead>
                  <TableHead>Reg</TableHead>
                  <TableHead>Detalle</TableHead>
                  <TableHead>Fecha Vencimiento</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead>Clasificador3</TableHead>
                  <TableHead className="text-right">Valor recibido</TableHead>
                  <TableHead>Rete Fuente</TableHead>
                  <TableHead>Cta Contable Rete Fuente</TableHead>
                  <TableHead>Rete Ica</TableHead>
                  <TableHead>Cta Contable Rete Ica</TableHead>
                  <TableHead>Rete Iva</TableHead>
                  <TableHead>Cta Contable Rete Iva</TableHead>
                  <TableHead className="text-right">Mayor Valor</TableHead>
                  <TableHead className="text-right">Menor Valor</TableHead>
                  <TableHead className="text-right">Abono cartera</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedDocumentos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={16} className="text-center text-muted-foreground">
                      Seleccione uno o varios documentos en la tabla superior.
                    </TableCell>
                  </TableRow>
                ) : (
                  selectedDocumentos.map((documento) => {
                    const key = documentoKey(documento)
                    return (
                      <TableRow key={key}>
                        <TableCell>{documento.numeroDocumento}</TableCell>
                        <TableCell>{documento.registroDocumento}</TableCell>
                        <TableCell>{documento.detalleDocumento ?? "-"}</TableCell>
                        <TableCell>{documento.fechaVencimiento}</TableCell>
                        <TableCell className="text-right">{formatCurrency(documento.saldoDocumento)}</TableCell>
                        <TableCell>
                          <CatalogCombobox
                            items={clasificador3.items}
                            loading={clasificador3.loading}
                            value={documento.codigoClasificador3}
                            placeholder="Buscar clasificador3..."
                            onSelect={(item) =>
                              updateDocumento(key, { codigoClasificador3: item.codigo })
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">{documento.valorPago}</TableCell>
                        <TableCell>
                          <CurrencyMaskInput
                            value={documento.valorRetencion}
                            onValueChange={(value) =>
                              updateDocumento(key, { valorRetencion: value })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <CatalogCombobox
                            items={cuentasRetFuente.items}
                            loading={cuentasRetFuente.loading}
                            value={documento.codigoCuentaRetFuente ?? null}
                            placeholder="Buscar cuenta..."
                            disabled={!(documento.valorRetencion > 0)}
                            onSelect={(item) =>
                              updateDocumento(key, { codigoCuentaRetFuente: item.codigo })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <CurrencyMaskInput
                            value={documento.valorIca}
                            onValueChange={(value) => updateDocumento(key, { valorIca: value })}
                          />
                        </TableCell>
                        <TableCell>
                          <CatalogCombobox
                            items={cuentasReteIca.items}
                            loading={cuentasReteIca.loading}
                            value={documento.codigoCuentaRetIca ?? null}
                            placeholder="Buscar cuenta..."
                            disabled={!(documento.valorIca > 0)}
                            onSelect={(item) =>
                              updateDocumento(key, { codigoCuentaRetIca: item.codigo })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <CurrencyMaskInput
                            value={documento.retencionIva}
                            onValueChange={(value) =>
                              updateDocumento(key, { retencionIva: value })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <CatalogCombobox
                            items={cuentasReteIva.items}
                            loading={cuentasReteIva.loading}
                            value={documento.codigoCuentaRetIva ?? null}
                            placeholder="Buscar cuenta..."
                            disabled={!(documento.retencionIva > 0)}
                            onSelect={(item) =>
                              updateDocumento(key, { codigoCuentaRetIva: item.codigo })
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">{documento.mayorValor}</TableCell>
                        <TableCell className="text-right">{documento.menorValor}</TableCell>
                        <TableCell className="text-right">{documento.valorPago}</TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>

            <div className="flex justify-end">
              <Button>Procesar</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function TotalField({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
