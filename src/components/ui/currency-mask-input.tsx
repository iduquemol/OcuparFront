import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/currency"

interface CurrencyMaskInputProps {
  value: number
  onValueChange: (value: number) => void
  disabled?: boolean
  className?: string
}

function parseCentsMask(rawValue: string): number {
  const digits = rawValue.replace(/\D/g, "")
  if (!digits) return 0
  return Number.parseInt(digits, 10) / 100
}

export function CurrencyMaskInput({
  value,
  onValueChange,
  disabled,
  className,
}: CurrencyMaskInputProps) {
  return (
    <Input
      type="text"
      inputMode="numeric"
      value={formatCurrency(value)}
      disabled={disabled}
      className={className}
      onChange={(event) => onValueChange(parseCentsMask(event.target.value))}
    />
  )
}
