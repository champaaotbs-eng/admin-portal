import { Eye, EyeOff } from 'lucide-react'

interface AdminPasswordFieldProps {
    id: string
    label: string
    value: string
    onChange: (value: string) => void
    visible: boolean
    onToggleVisibility: () => void
    placeholder?: string
    error?: string
    required?: boolean
    disabled?: boolean
    helperText?: string
}

/**
 * Password input with independent visibility toggle.
 */
export const AdminPasswordField = ({
    id,
    label,
    value,
    onChange,
    visible,
    onToggleVisibility,
    placeholder,
    error,
    required,
    disabled,
    helperText,
}: AdminPasswordFieldProps) => {
    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-800">
                {label} {required ? <span className="text-rose-500">*</span> : null}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={visible ? 'text' : 'password'}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="h-10 w-full rounded-md border border-slate-300 px-3 pr-11 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-[#f5f5f5]"
                />
                <button
                    type="button"
                    onClick={onToggleVisibility}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100"
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    disabled={disabled}
                >
                    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
            {helperText ? <p className="mt-1 text-xs text-slate-500">{helperText}</p> : null}
            {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
        </div>
    )
}
