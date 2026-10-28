import { GridIcon, TableIcon } from "@/components/ui/icons"
import { cn } from "@/lib/utils/cn"
import type { ProductView } from "../types"

interface ViewToggleProps {
  view: ProductView
  onChange: (view: ProductView) => void
}

const OPTIONS: { value: ProductView; label: string; Icon: typeof TableIcon }[] = [
  { value: "table", label: "Table view", Icon: TableIcon },
  { value: "cards", label: "Card view", Icon: GridIcon },
]

export function ViewToggle({ view, onChange }: Readonly<ViewToggleProps>) {
  return (
    <div
      role="group"
      aria-label="Layout"
      className="inline-flex rounded-lg bg-white p-0.5 shadow-sm ring-1 ring-slate-300"
    >
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          aria-label={label}
          aria-pressed={view === value}
          className={cn(
            "inline-flex size-9 items-center justify-center rounded-md transition-colors",
            view === value ? "bg-brand-600 text-white" : "text-slate-500 hover:text-slate-900",
          )}
        >
          <Icon />
        </button>
      ))}
    </div>
  )
}
