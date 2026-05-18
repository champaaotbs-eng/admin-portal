import * as React from 'react'
import { LucideCircleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatVndNumberInput, parseVndNumberInput } from '@/utils/vnd-number'

interface VndInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
    label?: string
    error?: string
    value?: string | number | null
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
    inputClassName?: string
}

export const VndInput = React.forwardRef<HTMLInputElement, VndInputProps>(
    ({ className, inputClassName, label, error, value, onChange, ...props }, ref) => {
        const displayValue = formatVndNumberInput(value)

        const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const rawValue = parseVndNumberInput(event.target.value)
            onChange?.({
                ...event,
                target: {
                    ...event.target,
                    value: rawValue,
                },
            } as React.ChangeEvent<HTMLInputElement>)
        }

        return (
            <div className={cn('flex flex-col gap-1', className)}>
                {label && (
                    <label className="text-sm font-medium leading-none">
                        {label}
                    </label>
                )}
                <input
                    {...props}
                    ref={ref}
                    type="text"
                    inputMode="numeric"
                    value={displayValue}
                    onChange={handleChange}
                    className={cn('min-h-10 h-10 w-full rounded-md border px-3 py-2 text-sm', inputClassName)}
                />
                {error && (
                    <p className="text-destructive text-xs mt-1 flex items-center">
                        <LucideCircleAlert className="mr-1 size-3" />
                        {error}
                    </p>
                )}
            </div>
        )
    },
)

VndInput.displayName = 'VndInput'
