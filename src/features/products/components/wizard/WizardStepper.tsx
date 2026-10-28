import { CheckIcon } from "@/components/ui/icons"
import { cn } from "@/lib/utils/cn"
import { WIZARD_STEPS } from "../../constants"

interface WizardStepperProps {
  current: number
  reached: number
  onSelect: (step: number) => void
}

export function WizardStepper({ current, reached, onSelect }: Readonly<WizardStepperProps>) {
  return (
    <nav aria-label="Progress">
      <ol className="grid grid-cols-4 gap-2">
        {WIZARD_STEPS.map((step, index) => {
          const isCurrent = index === current
          const isComplete = index < current
          const canSelect = index <= reached && !isCurrent

          return (
            <li key={step.title}>
              <button
                type="button"
                disabled={!canSelect}
                onClick={() => onSelect(index)}
                aria-current={isCurrent ? "step" : undefined}
                className="group flex w-full flex-col gap-2 text-left disabled:cursor-default"
              >
                <span
                  className={cn(
                    "h-1.5 w-full rounded-full transition-colors",
                    isCurrent || isComplete ? "bg-brand-600" : "bg-slate-200",
                  )}
                />
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      isComplete && "bg-brand-600 text-white",
                      isCurrent && "bg-brand-50 text-brand-700 ring-2 ring-brand-600",
                      !isComplete && !isCurrent && "bg-slate-100 text-slate-500",
                    )}
                  >
                    {isComplete ? <CheckIcon className="size-3.5" /> : index + 1}
                  </span>
                  <span className="hidden min-w-0 sm:block">
                    <span
                      className={cn(
                        "block truncate text-sm font-medium",
                        isCurrent ? "text-slate-900" : "text-slate-500",
                        canSelect && "group-hover:text-slate-900",
                      )}
                    >
                      {step.title}
                    </span>
                    <span className="block truncate text-xs text-slate-400">{step.description}</span>
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
