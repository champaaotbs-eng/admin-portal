import { useState, useMemo } from 'react'
import { Search, X, Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatDate, formatVnd } from '@/utils/format'
import { getCompanyBookings, getBookingSeatLayout } from '@/services/company/booking.service'
import { useAuthStore } from '@/store/auth.store'
import type { IBooking } from '@/types/booking'

const STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
    confirmed: 'success',
    completed: 'success',
    reserved: 'warning',
    pending_payment: 'warning',
    cancelled: 'destructive',
    expired: 'secondary',
}

const readRows = <T,>(payload: unknown): T[] => {
    if (!payload || typeof payload !== 'object') return []
    const p = payload as Record<string, unknown>
    if (Array.isArray(p.result)) return p.result as T[]
    if (p.data && typeof p.data === 'object') {
        const nested = p.data as Record<string, unknown>
        if (Array.isArray(nested.result)) return nested.result as T[]
    }
    return []
}

const formatTripOption = (b: IBooking) => {
    const tripInfo = (b as any).tripInfo
    const dep = tripInfo?.departureTime
    const from = tripInfo?.fromLocationName ?? ''
    const to = tripInfo?.toLocationName ?? ''
    const dateStr = dep
        ? (() => {
            const d = new Date(dep)
            const hh = String(d.getHours()).padStart(2, '0')
            const mm = String(d.getMinutes()).padStart(2, '0')
            const dd = String(d.getDate()).padStart(2, '0')
            const MM = String(d.getMonth() + 1).padStart(2, '0')
            const yyyy = d.getFullYear()
            return `${hh}:${mm} ${dd}/${MM}/${yyyy}`
        })()
        : ''
    return `${dateStr}${from && to ? ` · ${from} → ${to}` : ''}`
}

function SeatLayoutGrid({ bookingId }: { bookingId: string }) {
    const { data, isLoading } = useQuery({
        queryKey: ['booking-seat-layout', bookingId],
        queryFn: () => getBookingSeatLayout(bookingId),
        select: (res) => (res as any).data ?? res,
        staleTime: 60_000,
    })

    if (isLoading) return <p className="text-xs text-muted-foreground">Loading...</p>
    if (!data?.length) return <p className="text-xs text-muted-foreground">No seat layout</p>

    const floors = [...new Set(data.map((s: any) => s.floor))].sort()

    return (
        <div className="space-y-3">
            {floors.map((floor: number) => {
                const floorSeats = data.filter((s: any) => s.floor === floor)
                const maxRow = Math.max(...floorSeats.map((s: any) => s.row))
                const maxCol = Math.max(...floorSeats.map((s: any) => s.col))
                return (
                    <div key={floor}>
                        {floors.length > 1 && <p className="mb-1 text-xs text-muted-foreground">Floor {floor}</p>}
                        <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${maxCol + 1}, minmax(0, 1fr))` }}>
                            {Array.from({ length: (maxRow + 1) * (maxCol + 1) }).map((_, idx) => {
                                const row = Math.floor(idx / (maxCol + 1))
                                const col = idx % (maxCol + 1)
                                const seat = floorSeats.find((s: any) => s.row === row && s.col === col)
                                if (!seat) return <div key={idx} className="h-8 w-8" />
                                return (
                                    <div
                                        key={seat.seatId}
                                        className={`flex h-8 w-8 items-center justify-center rounded border text-[10px] font-medium ${
                                            seat.isBooked
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-800'
                                        }`}
                                    >
                                        {seat.seatCode}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
            <div className="flex gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <div className="h-3.5 w-3.5 rounded border border-primary bg-primary" />
                    <span>Booked</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-3.5 w-3.5 rounded border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800" />
                    <span>Other</span>
                </div>
            </div>
        </div>
    )
}

export function CompanyBookingsPage() {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.bookings' })
    const { t: tCommon } = useTranslation()
    const { admin } = useAuthStore()
    const busCompanyId = admin?.busCompanyId ?? ''

    const [search, setSearch] = useState('')
    const [tripFilter, setTripFilter] = useState('all')
    const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null)
    const [page, setPage] = useState(1)
    const PER_PAGE = 15

    const { data: bookings = [], isLoading } = useQuery({
        queryKey: ['company-bookings', busCompanyId],
        queryFn: () => getCompanyBookings(busCompanyId, { page: 1, limit: 1000 }),
        select: (res) => readRows<IBooking>(res.data),
        enabled: !!busCompanyId,
        staleTime: 30_000,
    })

    const tripOptions = useMemo(() => {
        const seen = new Set<string>()
        return bookings
            .filter((b) => { if (seen.has(b.tripId)) return false; seen.add(b.tripId); return true })
            .sort((a, b) => {
                const ta = (a as any).tripInfo?.departureTime ?? ''
                const tb = (b as any).tripInfo?.departureTime ?? ''
                return ta.localeCompare(tb)
            })
            .map((b) => ({ tripId: b.tripId, label: formatTripOption(b) }))
    }, [bookings])

    const filtered = useMemo(() => {
        let list = bookings
        if (tripFilter !== 'all') list = list.filter((b) => b.tripId === tripFilter)
        if (search) {
            const q = search.toLowerCase()
            list = list.filter((b) =>
                b.bookingCode?.toLowerCase().includes(q) ||
                (b as any).passengerName?.toLowerCase().includes(q) ||
                (b as any).passengerEmail?.toLowerCase().includes(q) ||
                (b as any).passengerPhone?.toLowerCase().includes(q)
            )
        }
        return list
    }, [bookings, tripFilter, search])

    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
    const hasFilter = search || tripFilter !== 'all'

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{t('company_title')}</h1>
                <p className="text-sm text-muted-foreground">{t('company_description')}</p>
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        placeholder={t('search_placeholder')}
                        className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
                <select
                    value={tripFilter}
                    onChange={(e) => { setTripFilter(e.target.value); setPage(1) }}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none w-72"
                >
                    <option value="all">{t('filter_all_trips')}</option>
                    {tripOptions.map((o) => (
                        <option key={o.tripId} value={o.tripId}>{o.label}</option>
                    ))}
                </select>
                {hasFilter && (
                    <Button variant="outline" size="sm" onClick={() => { setSearch(''); setTripFilter('all'); setPage(1) }}>
                        <X className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>

            {isLoading && <p className="text-sm text-muted-foreground">{tCommon('common.loading')}</p>}

            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.booking_code')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.route')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.customer')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.booking_date')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.seats')}</th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t('table.amount')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.booking_status')}</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.map((b) => {
                            const tripInfo = (b as any).tripInfo
                            const from = tripInfo?.fromLocationName ?? ''
                            const to = tripInfo?.toLocationName ?? ''
                            const routeLabel = from && to ? `${from} → ${to}` : '—'
                            const passenger = (b as any).passengerName ?? (b as any).user?.fullName ?? '—'
                            const status = b.status.toString().toLowerCase()
                            const seatCodes = Array.isArray(b.seats) ? b.seats.map((s) => s.seatCode).filter(Boolean).join(', ') : '—'
                            return (
                                <tr key={(b as any).id ?? b.bookingId} className="border-t hover:bg-muted/30">
                                    <td className="px-4 py-3 font-mono text-xs font-medium">{b.bookingCode}</td>
                                    <td className="px-4 py-3 text-xs max-w-40 truncate" title={routeLabel}>{routeLabel}</td>
                                    <td className="px-4 py-3 text-xs">{passenger}</td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(b.createdAt)}</td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground">{seatCodes}</td>
                                    <td className="px-4 py-3 text-right text-xs font-medium">{formatVnd(b.totalAmount)}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant={STATUS_VARIANTS[status] ?? 'secondary'} className="text-xs">
                                            {tCommon(`status.${status}`, { defaultValue: status })}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => setSelectedBooking(b)} className="text-muted-foreground hover:text-foreground p-1">
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                        {!isLoading && paginated.length === 0 && (
                            <tr>
                                <td colSpan={8} className="py-10 text-center text-muted-foreground">{tCommon('common.no_results')}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{tCommon('common.showing', { shown: paginated.length, total: filtered.length })}</span>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>{tCommon('common.prev')}</Button>
                        <span>{page} / {totalPages}</span>
                        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>{tCommon('common.next')}</Button>
                    </div>
                </div>
            )}

            {selectedBooking && (
                <Dialog open onClose={() => setSelectedBooking(null)} title={t('detail.title', { code: selectedBooking.bookingCode })} className="max-w-lg">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-lg font-bold">{selectedBooking.bookingCode}</span>
                            <Badge variant={STATUS_VARIANTS[selectedBooking.status.toString().toLowerCase()] ?? 'secondary'}>
                                {tCommon(`status.${selectedBooking.status.toString().toLowerCase()}`, { defaultValue: selectedBooking.status })}
                            </Badge>
                        </div>
                        <div className="rounded-lg bg-muted/40 p-3 space-y-2 text-sm">
                            {[
                                [t('table.customer'), (selectedBooking as any).passengerName ?? (selectedBooking as any).user?.fullName ?? '—'],
                                ['Phone', (selectedBooking as any).passengerPhone ?? '—'],
                                ['Email', (selectedBooking as any).passengerEmail ?? (selectedBooking as any).user?.email ?? '—'],
                                [t('table.amount'), formatVnd(selectedBooking.totalAmount)],
                                [t('table.booking_date'), formatDate(selectedBooking.createdAt)],
                            ].map(([label, value]) => (
                                <div key={label} className="flex justify-between">
                                    <span className="text-muted-foreground">{label}</span>
                                    <span className="font-medium">{value}</span>
                                </div>
                            ))}
                        </div>
                        <div>
                            <p className="mb-2 text-sm font-medium">{t('table.seats')}</p>
                            <SeatLayoutGrid bookingId={(selectedBooking as any).id ?? selectedBooking.bookingId} />
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => setSelectedBooking(null)}>{tCommon('common.close')}</Button>
                    </div>
                </Dialog>
            )}
        </div>
    )
}
