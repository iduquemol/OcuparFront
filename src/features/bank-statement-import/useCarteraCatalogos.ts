import { useEffect, useMemo, useState } from "react"
import { getClasificador3, getCuentasContables } from "@/api/catalogos"
import type { CatalogItem, CuentaContableItem } from "@/api/types"

interface CatalogState<T> {
  items: T[]
  loading: boolean
  error: string | null
}

function initialCatalogState<T>(): CatalogState<T> {
  return { items: [], loading: true, error: null }
}

function useCatalog<T>(fetcher: () => Promise<T[]>): CatalogState<T> {
  const [state, setState] = useState<CatalogState<T>>(initialCatalogState)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setState({ items: [], loading: true, error: null })
      try {
        const items = await fetcher()
        if (!cancelled) setState({ items, loading: false, error: null })
      } catch (error) {
        if (!cancelled) {
          setState({
            items: [],
            loading: false,
            error: error instanceof Error ? error.message : "No se pudo cargar el catálogo",
          })
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return state
}

function filterByTipo(
  cuentasContables: CatalogState<CuentaContableItem>,
  tipo: string
): CatalogState<CatalogItem> {
  return {
    ...cuentasContables,
    items: cuentasContables.items.filter((item) => item.tipo === tipo),
  }
}

export function useCarteraCatalogos() {
  const clasificador3 = useCatalog<CatalogItem>(getClasificador3)
  const cuentasContables = useCatalog<CuentaContableItem>(getCuentasContables)

  const cuentasRetFuente = useMemo(() => filterByTipo(cuentasContables, "RteFte"), [cuentasContables])
  const cuentasReteIca = useMemo(() => filterByTipo(cuentasContables, "ReteIca"), [cuentasContables])
  const cuentasReteIva = useMemo(() => filterByTipo(cuentasContables, "ReteIva"), [cuentasContables])

  return { clasificador3, cuentasRetFuente, cuentasReteIca, cuentasReteIva }
}
