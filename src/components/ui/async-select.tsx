import { useState, useRef, useEffect } from 'react'
import { Check, ChevronsUpDown, Loader2, Search } from 'lucide-react'
import { useDebounce } from '@/components/shared/hooks/use-debounce'
import { cn } from '@/lib/utils'

export interface AsyncSelectOption {
    label: string
    value: string
    description?: string
}

interface AsyncSelectProps {
    value?: string
    onChange: (value: string) => void
    fetchOptions: (search: string) => Promise<AsyncSelectOption[]>
    placeholder?: string
    searchPlaceholder?: string
    noOptionsMessage?: string
    className?: string
    disabled?: boolean
}

export function AsyncSelect({
    value,
    onChange,
    fetchOptions,
    placeholder = 'Select an option...',
    searchPlaceholder = 'Search...',
    noOptionsMessage = 'No options found.',
    className,
    disabled = false,
}: AsyncSelectProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [options, setOptions] = useState<AsyncSelectOption[]>([])
    const [loading, setLoading] = useState(false)
    const debouncedSearch = useDebounce(search, 300)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let isMounted = true

        const loadOptions = async () => {
            setLoading(true)
            try {
                const results = await fetchOptions(debouncedSearch)
                if (isMounted) {
                    setOptions(results)
                }
            } catch (error) {
                console.error('Failed to fetch options', error)
                if (isMounted) setOptions([])
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        if (open) {
            loadOptions()
        }

        return () => {
            isMounted = false
        }
    }, [debouncedSearch, open, fetchOptions])

    useEffect(() => {
        if (value && !open && options.length === 0) {
            fetchOptions('').then(res => {
                setOptions(res)
            }).catch(() => { })
        }
    }, [value, open, options.length, fetchOptions])


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const selectedOption = options.find(opt => opt.value === value)

    return (
        <div className={cn('relative w-full', className)} ref={containerRef}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(!open)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <span className={cn('truncate', !selectedOption && 'text-muted-foreground')}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </button>

            {open && (
                <div className="absolute top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md outline-none">
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <input
                            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="p-1">
                        {loading ? (
                            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </div>
                        ) : options.length === 0 ? (
                            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                                {noOptionsMessage}
                            </div>
                        ) : (
                            options.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() => {
                                        onChange(option.value === value ? '' : option.value)
                                        setOpen(false)
                                        setSearch('')
                                    }}
                                    className={cn(
                                        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                                        value === option.value ? 'bg-accent text-accent-foreground' : ''
                                    )}
                                >
                                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                        {value === option.value && (
                                            <Check className="h-4 w-4" />
                                        )}
                                    </span>
                                    <div className="flex flex-col">
                                        <span>{option.label}</span>
                                        {option.description && (
                                            <span className="text-xs text-muted-foreground">
                                                {option.description}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
