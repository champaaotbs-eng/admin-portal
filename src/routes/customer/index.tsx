import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Search, Clock, MapPin, ChevronRight, X } from 'lucide-react'
import { getPublicTrips } from 'services/public/trip.service'
import { formatVnd, formatDate } from 'utils/format'
import type { ITrip } from 'types/trip'
import { ETripStatus } from 'types/trip'
import { APP_ROUTES } from '@/constants/app-routes'

export const Route = createFileRoute('/customer/')({
    component: CustomerSearchPage,
})

function durationLabel(dep: string, arr: string): string {
    const mins = Math.round((new Date(arr).getTime() - new Date(dep).getTime()) / 60000)
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}h ${m}m`
}

function TripCard({ trip }: { trip: ITrip }) {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.customer.trip_card' })
    const availableCount = trip.seatAvailability?.filter(s => s.isAvailable).length ?? '?'
    const from = trip.route?.fromLocationName ?? trip.routeId
    const to = trip.route?.toLocationName ?? ''

    return (
        <div className="rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span>{from}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{to}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                            {new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {durationLabel(trip.departureTime, trip.arrivalTime)}
                        </span>
                        <span>{formatDate(trip.departureTime)}</span>
                    </div>
                    {trip.busCompany?.name && (
                        <p className="text-xs text-muted-foreground">{trip.busCompany.name}</p>
                    )}
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                    <p className="text-lg font-bold text-primary">{formatVnd(trip.basePrice)}</p>
                    <p className="text-xs text-muted-foreground">{t('seats_left', { count: availableCount })}</p>
                    <Link
                        to="/customer/trips/$tripId"
                        params={{ tripId: trip.tripId }}
                        className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                        {t('book_now')}
                    </Link>
                </div>
            </div>
        </div>
    )
}

function CustomerSearchPage() {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.customer.search' })
    const [date, setDate] = useState('')
    const [fromText, setFromText] = useState('')
    const [toText, setToText] = useState('')
    const [submitted, setSubmitted] = useState(false)

    const { data, isLoading } = useQuery({
        queryKey: ['public-trips', date],
        queryFn: () => getPublicTrips({ departureDate: date || undefined, limit: 50 }),
        enabled: true,
    })

    const allTrips: ITrip[] = (() => {
        const payload = (data as any)?.data ?? data
        if (Array.isArray(payload)) return payload
        if (Array.isArray(payload?.data)) return payload.data
        if (Array.isArray(payload?.result)) return payload.result
        return []
    })()

    const filtered = allTrips.filter(trip => {
        if (trip.status === ETripStatus.CANCELLED || trip.status === ETripStatus.COMPLETED) return false
        if (!trip.isPublished) return false
        if (fromText) {
            const from = (trip.route?.fromLocationName ?? '').toLowerCase()
            if (!from.includes(fromText.toLowerCase())) return false
        }
        if (toText) {
            const to = (trip.route?.toLocationName ?? '').toLowerCase()
            if (!to.includes(toText.toLowerCase())) return false
        }
        return true
    })

    const hasFilter = date || fromText || toText

    return (
        <div className="space-y-8">
            {/* Hero */}
            <div className="rounded-xl bg-primary/5 px-6 py-10 text-center">
                <h1 className="text-3xl font-bold">{t('hero_title')}</h1>
                <p className="mt-1 text-muted-foreground">{t('hero_subtitle')}</p>
            </div>

            {/* Search form */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-36">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={fromText}
                        onChange={e => setFromText(e.target.value)}
                        placeholder={t('from_placeholder')}
                        className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
                <div className="relative flex-1 min-w-36">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={toText}
                        onChange={e => setToText(e.target.value)}
                        placeholder={t('to_placeholder')}
                        className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground whitespace-nowrap">{t('date_label')}:</label>
                    <input
                        type="date"
                        value={date}
                        onChange={e => { setDate(e.target.value); setSubmitted(true) }}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
                {hasFilter && (
                    <button
                        onClick={() => { setDate(''); setFromText(''); setToText(''); setSubmitted(false) }}
                        className="flex items-center gap-1 rounded-md border border-input px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
                    >
                        <X className="h-4 w-4" /> {t('clear')}
                    </button>
                )}
            </div>

            {/* Results */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{t('all_trips')}</h2>
                    {!isLoading && (
                        <span className="text-sm text-muted-foreground">{t('results_count', { count: filtered.length })}</span>
                    )}
                </div>

                {isLoading && (
                    <div className="py-10 text-center text-muted-foreground">{t('all_trips')}…</div>
                )}

                {!isLoading && filtered.length === 0 && (
                    <div className="py-10 text-center text-muted-foreground">{t('no_trips')}</div>
                )}

                {filtered.map(trip => (
                    <TripCard key={trip.tripId} trip={trip} />
                ))}
            </div>
        </div>
    )
}
