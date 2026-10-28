import { Button } from "@/components/ui/Button"
import { AlertIcon, BoxIcon } from "@/components/ui/icons"

interface StateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

function StatePanel({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: Readonly<StateProps & { icon: React.ReactNode }>) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">{icon}</span>
      <h2 className="mt-4 text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-5" variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}

export function EmptyState(props: Readonly<StateProps>) {
  return <StatePanel icon={<BoxIcon />} {...props} />
}

export function ErrorState(props: Readonly<StateProps>) {
  return <StatePanel icon={<AlertIcon />} {...props} />
}
