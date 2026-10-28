import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react"
import { cn } from "@/lib/utils/cn"

interface FieldShellProps {
  id: string
  label: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: ReactNode
}

export function FieldShell({ id, label, error, hint, required, className, children }: Readonly<FieldShellProps>) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

const controlClass =
  "block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm ring-1 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50"

function controlState(error?: string): string {
  return error ? "ring-red-400 focus:ring-red-500" : "ring-slate-300 focus:ring-brand-600"
}

function describedBy(id: string, error?: string, hint?: string): string | undefined {
  if (error) return `${id}-error`
  if (hint) return `${id}-hint`
  return undefined
}

interface BaseFieldProps {
  label: string
  error?: string
  hint?: string
  fieldClassName?: string
}

export const TextField = forwardRef<HTMLInputElement, BaseFieldProps & InputHTMLAttributes<HTMLInputElement>>(
  function TextField({ label, error, hint, fieldClassName, className, required, ...props }, ref) {
    const id = useId()
    return (
      <FieldShell id={id} label={label} error={error} hint={hint} required={required} className={fieldClassName}>
        <input
          ref={ref}
          id={id}
          required={false}
          aria-required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy(id, error, hint)}
          className={cn(controlClass, controlState(error), className)}
          {...props}
        />
      </FieldShell>
    )
  },
)

export const TextareaField = forwardRef<
  HTMLTextAreaElement,
  BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>
>(function TextareaField({ label, error, hint, fieldClassName, className, required, ...props }, ref) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required} className={fieldClassName}>
      <textarea
        ref={ref}
        id={id}
        rows={4}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(controlClass, controlState(error), className)}
        {...props}
      />
    </FieldShell>
  )
})

interface SelectFieldProps extends BaseFieldProps, SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, error, hint, fieldClassName, className, required, placeholder, children, ...props },
  ref,
) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required} className={fieldClassName}>
      <select
        ref={ref}
        id={id}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(controlClass, controlState(error), "pr-8", className)}
        {...props}
      >
        {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
        {children}
      </select>
    </FieldShell>
  )
})

interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string
  description?: string
  error?: string
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(function CheckboxField(
  { label, description, error, className, ...props },
  ref,
) {
  const id = useId()
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-600"
          {...props}
        />
        <label htmlFor={id} className="text-sm">
          <span className="font-medium text-slate-700">{label}</span>
          {description ? <span className="block text-slate-500">{description}</span> : null}
        </label>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="pl-7 text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  )
})
