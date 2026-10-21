import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { CatalogItem } from "@/api/types"

interface CatalogComboboxProps {
  items: CatalogItem[]
  loading: boolean
  value: string | null
  onSelect: (item: CatalogItem) => void
  placeholder?: string
}

export function CatalogCombobox({
  items,
  loading,
  value,
  onSelect,
  placeholder = "Seleccionar...",
}: CatalogComboboxProps) {
  const [open, setOpen] = useState(false)

  const selected = value ? items.find((item) => item.codigo === value) : undefined
  const label = loading
    ? "Cargando..."
    : selected
      ? `${selected.codigo} — ${selected.nombre}`
      : (value ?? placeholder)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            className={cn(
              "w-full min-w-40 justify-start truncate text-left font-normal",
              !selected && !value && "text-muted-foreground"
            )}
          >
            {label}
          </Button>
        }
      />
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar por código o nombre..." />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.codigo}
                  value={`${item.codigo} ${item.nombre}`}
                  onSelect={() => {
                    onSelect(item)
                    setOpen(false)
                  }}
                >
                  {item.codigo} — {item.nombre}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
