import { useEffect, useState } from "react"
import { getCuentasContables, getSubTiposDocumento, getTerceros } from "@/api/catalogos"
import type { CatalogItem } from "@/api/types"

interface CatalogState {
  items: CatalogItem[]
  loading: boolean
  error: string | null
}

const initialCatalogState: CatalogState = {
  items: [],
  loading: true,
  error: null,
}

function useCatalog(fetcher: () => Promise<CatalogItem[]>): CatalogState {
  const [state, setState] = useState<CatalogState>(initialCatalogState)

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

export function useCatalogos() {
  const terceros = useCatalog(getTerceros)
  const cuentasContables = useCatalog(getCuentasContables)
  const subTiposDocumento = useCatalog(getSubTiposDocumento)

  return { terceros, cuentasContables, subTiposDocumento }
}
