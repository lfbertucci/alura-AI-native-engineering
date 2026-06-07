import { Label } from '../atoms/Label'
import { Input } from '../atoms/Input'
import type { InputHTMLAttributes } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  error?: string
}

export function FormField({ id, label, error, ...inputProps }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} hasError={!!error} {...inputProps} />
      {error && (
        <p role="alert" className="text-xs text-[var(--color-error)] mt-0.5">
          {error}
        </p>
      )}
    </div>
  )
}
