import { useState, useRef, useEffect } from 'react'
import { Check, ChevronsUpDown, Loader2, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDebounce } from '@/components/shared/hooks/use-debounce'
import { cn } from '@/lib/utils'

const DEFAULT_LIMIT = 20
const LOAD_MORE_THRESHOLD = 24

export interface AsyncSelectOption {
    label: string
    value: string
    description?: string
}

interface AsyncSelectProps {
    value?: string
    onChange: (value: string) => void
    fetchOptions: (search: string, page: number, limit: number) => Promise<AsyncSelectOption[]>
    placeholder?: string
    searchPlaceholder?: string
    noOptionsMessage?: string
    className?: string
    disabled?: boolean
    limit?: number
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
    limit = DEFAULT_LIMIT,
}: AsyncSelectProps) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [options, setOptions] = useState<AsyncSelectOption[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const debouncedSearch = useDebounce(search, 300)
    const containerRef = useRef<HTMLDivElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const optionsRef = useRef<AsyncSelectOption[]>([])
    const fetchOptionsRef = useRef(fetchOptions)
    const loadingRef = useRef(false)
    const loadingMoreRef = useRef(false)
    const pageRef = useRef(1)
    const hasMoreRef = useRef(true)

    useEffect(() => {
        fetchOptionsRef.current = fetchOptions
    }, [fetchOptions])

    const mergeUniqueOptions = (baseOptions: AsyncSelectOption[], incomingOptions: AsyncSelectOption[]) => {
        if (baseOptions.length === 0) {
            return incomingOptions
        }

        const existing = new Set(baseOptions.map((option) => option.value))
        const next = [...baseOptions]

        incomingOptions.forEach((option) => {
            if (!existing.has(option.value)) {
                existing.add(option.value)
                next.push(option)
            }
        })

        return next
    }

    const loadOptions = async ({
        searchValue,
        targetPage,
        append,
    }: {
        searchValue: string
        targetPage: number
        append: boolean
    }) => {
        if (append) {
            if (loadingRef.current || loadingMoreRef.current || !hasMoreRef.current) {
                return
            }
            loadingMoreRef.current = true
            setLoadingMore(true)
        } else {
            loadingRef.current = true
            setLoading(true)
        }

        try {
            const results = await fetchOptionsRef.current(searchValue, targetPage, limit)

            if (append) {
                const prevLength = optionsRef.current.length
                const merged = mergeUniqueOptions(optionsRef.current, results)
                optionsRef.current = merged
                setOptions(merged)

                const hasNewOptions = merged.length > prevLength
                const canLoadMore = results.length >= limit && hasNewOptions
                hasMoreRef.current = canLoadMore
                setHasMore(canLoadMore)
            } else {
                optionsRef.current = results
                setOptions(results)

                const canLoadMore = results.length >= limit
                hasMoreRef.current = canLoadMore
                setHasMore(canLoadMore)
            }

            pageRef.current = targetPage
            setPage(targetPage)
        } catch (error) {
            console.error('Failed to fetch options', error)
            if (!append) {
                optionsRef.current = []
                setOptions([])
            }
            hasMoreRef.current = false
            setHasMore(false)
        } finally {
            if (append) {
                loadingMoreRef.current = false
                setLoadingMore(false)
            } else {
                loadingRef.current = false
                setLoading(false)
            }
        }
    }

    useEffect(() => {
        if (open) {
            if (dropdownRef.current) {
                dropdownRef.current.scrollTop = 0
            }
            hasMoreRef.current = true
            pageRef.current = 1
            setHasMore(true)
            setPage(1)
            void loadOptions({
                searchValue: debouncedSearch,
                targetPage: 1,
                append: false,
            })
        }
    }, [debouncedSearch, open, limit])

    useEffect(() => {
        if (value && !open && options.length === 0) {
            fetchOptionsRef.current('', 1, limit).then(res => {
                optionsRef.current = res
                setOptions(res)
            }).catch(() => { })
        }
    }, [value, open, options.length, limit])

    const handleOptionsScroll = (event: React.UIEvent<HTMLDivElement>) => {
        if (loadingRef.current || loadingMoreRef.current || !hasMoreRef.current) {
            return
        }

        const { scrollTop, scrollHeight, clientHeight } = event.currentTarget

        // Guard against auto-pagination when list isn't actually scrollable.
        if (scrollHeight <= clientHeight) {
            return
        }

        const isNearBottom = scrollHeight - (scrollTop + clientHeight) <= LOAD_MORE_THRESHOLD

        if (!isNearBottom) {
            return
        }

        void loadOptions({
            searchValue: debouncedSearch,
            targetPage: pageRef.current + 1,
            append: true,
        })
    }


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
    const resolvedPlaceholder = placeholder === 'Select an option...' ? t('common.select_option') : placeholder
    const resolvedSearchPlaceholder = searchPlaceholder === 'Search...' ? t('common.search') : searchPlaceholder
    const resolvedNoOptionsMessage = noOptionsMessage === 'No options found.' ? t('common.no_results') : noOptionsMessage

    return (
        <div className={cn('relative w-full', className)} ref={containerRef}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(!open)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <span className={cn('truncate', !selectedOption && 'text-muted-foreground')}>
                    {selectedOption ? selectedOption.label : resolvedPlaceholder}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </button>

            {open && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md outline-none"
                    onScroll={handleOptionsScroll}
                >
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <input
                            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder={resolvedSearchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="p-1">
                        {loading ? (
                            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('common.loading')}
                            </div>
                        ) : options.length === 0 ? (
                            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                                {resolvedNoOptionsMessage}
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
                        {loadingMore ? (
                            <div className="flex items-center justify-center p-2 text-xs text-muted-foreground">
                                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                {t('common.loading')}
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    )
}
