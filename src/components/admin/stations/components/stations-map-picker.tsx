import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { searchVietMapLocations, type IVietMapLocation } from 'lib/vietmap'
import { MapPin, Search } from 'lucide-react'
import { useDebounce } from 'components/shared/hooks/use-debounce'

interface IStationMapPickerProps {
    address: string
    latitude: number
    longitude: number
    title: string
    description: string
    searchLabel: string
    searchPlaceholder: string
    helperText: string
    emptyStateText: string
    searchFailedText: string
    onSelectLocation: (location: IVietMapLocation) => void
}

const StationMapCanvas = lazy(async () => {
    const module = await import('./stations-map-canvas')
    return { default: module.StationMapCanvas }
})

export const StationMapPicker = ({
    address,
    latitude,
    longitude,
    title,
    description,
    searchLabel,
    searchPlaceholder,
    helperText,
    emptyStateText,
    searchFailedText,
    onSelectLocation,
}: IStationMapPickerProps) => {
    const [searchQuery, setSearchQuery] = useState(address)
    const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false)
    const [suggestions, setSuggestions] = useState<IVietMapLocation[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isClient, setIsClient] = useState(false)
    const suggestionRequestRef = useRef(0)
    const debouncedSearchQuery = useDebounce(searchQuery, 400)

    useEffect(() => {
        setSearchQuery(address)
    }, [address])

    useEffect(() => {
        setIsClient(typeof window !== 'undefined')
    }, [])

    const hasCoordinates = latitude !== 0 || longitude !== 0

    useEffect(() => {
        const trimmedQuery = debouncedSearchQuery.trim()

        if (trimmedQuery.length < 2) {
            setSuggestions([])
            setIsSuggestionsLoading(false)
            return
        }

        const requestId = suggestionRequestRef.current + 1
        suggestionRequestRef.current = requestId
        setIsSuggestionsLoading(true)

        void searchVietMapLocations(trimmedQuery, 6)
            .then((results) => {
                if (suggestionRequestRef.current !== requestId) {
                    return
                }

                setSuggestions(results)
            })
            .catch(() => {
                if (suggestionRequestRef.current !== requestId) {
                    return
                }

                setSuggestions([])
            })
            .finally(() => {
                if (suggestionRequestRef.current !== requestId) {
                    return
                }

                setIsSuggestionsLoading(false)
            })
    }, [debouncedSearchQuery])

    const handleSelectLocation = useCallback((location: IVietMapLocation) => {
        setErrorMessage(null)
        setSearchQuery(location.address)
        setSuggestions([])
        setShowSuggestions(false)
        onSelectLocation(location)
    }, [onSelectLocation])

    const handleSearchEnter: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
        if (event.key !== 'Enter') {
            return
        }

        event.preventDefault()

        if (suggestions.length > 0) {
            handleSelectLocation(suggestions[0])
            return
        }

        setErrorMessage(searchFailedText)
    }

    const showSuggestionPanel = showSuggestions && (isSuggestionsLoading || suggestions.length > 0 || debouncedSearchQuery.trim().length >= 2)

    return (
        <section className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
            <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>

            <div className="relative z-[1200] space-y-1">
                <label className="text-xs font-medium text-foreground">{searchLabel}</label>
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={searchQuery}
                        onChange={(event) => {
                            setSearchQuery(event.target.value)
                            setErrorMessage(null)
                            setShowSuggestions(true)
                        }}
                        onKeyDown={handleSearchEnter}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder={searchPlaceholder}
                        className="h-10 w-full min-w-0 flex-1 rounded-md border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />

                    {showSuggestionPanel ? (
                        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-[1200] overflow-hidden rounded-md border border-border bg-background shadow-lg">
                            {isSuggestionsLoading ? (
                                <p className="px-3 py-2 text-xs text-muted-foreground">Loading...</p>
                            ) : null}

                            {!isSuggestionsLoading && suggestions.length === 0 ? (
                                <p className="px-3 py-2 text-xs text-muted-foreground">{emptyStateText}</p>
                            ) : null}

                            {!isSuggestionsLoading
                                ? suggestions.map((suggestion) => (
                                    <button
                                        key={`${suggestion.latitude}-${suggestion.longitude}-${suggestion.address}`}
                                        type="button"
                                        onClick={() => handleSelectLocation(suggestion)}
                                        className="flex w-full items-start gap-2 border-t border-border px-3 py-2 text-left text-xs transition first:border-t-0 hover:bg-muted/40"
                                    >
                                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                                        <span className="line-clamp-2">{suggestion.address}</span>
                                    </button>
                                ))
                                : null}
                        </div>
                    ) : null}
                </div>
            </div>

            {errorMessage ? <p className="text-xs text-destructive">{errorMessage}</p> : null}

            <div className="relative z-0 overflow-hidden rounded-lg border border-border bg-card">
                <div className="relative h-80 w-full">
                    {isClient ? (
                        <Suspense
                            fallback={
                                <div className="flex h-full w-full items-center justify-center bg-muted/20 text-sm text-muted-foreground">
                                    Loading...
                                </div>
                            }
                        >
                            <StationMapCanvas
                                latitude={latitude}
                                longitude={longitude}
                                onSelectLocation={handleSelectLocation}
                            />
                        </Suspense>
                    ) : (
                        <div className="h-full w-full bg-muted/20" />
                    )}

                    {!hasCoordinates ? (
                        <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-md border border-border bg-background/90 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span>{helperText}</span>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </section>
    )
}