import { useState, useMemo } from 'react'
import { Search, Eye, X, Ticket, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { formatDate, formatVnd } from '@/utils/format'
import { getCompanyBookings } from '@/services/company/booking.service'
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
    if (Array.isArray(p.data)) return p.data as T[]
    if (p.data && typeof p.data === 'object') {
        const nested = p.data as Record<string, unknown>
        if (Array.isArray(nested.result)) return nested.result as T[]
    }
    return []
}

interface BookingRow {
    id: string
    bookingCode: string
    routeLabel: string
    customerName: string
    customerEmail: string
    createdAt: string
    seatCount: number
    totalAmount: number
    status: string
    paymentMethod: string
    raw: IBooking
}

const toRow = (b: IBooking): BookingRow => {
    const trip = (b as unknown as { trip?: Record<string, unknown> }).trip
    const from = (trip?.fromLocationName as string | undefined) ?? ''
    const to = (trip?.toLocationName as string | undefined) ?? ''
    const user = (b as unknown as { user?: Record<string, unknown> }).user
    return {
        id: b.bookingId,
        bookingCode: b.bookingCode,
        routeLabel: from && to ? `${from} → ${to}` : b.tripId,
        customerName: (user?.fullName as string | undefined) ?? (b as unknown as { passengerName?: string }).passengerName ?? '—',
        customerEmail: (user?.email as string | undefined) ?? '—',
        createdAt: b.createdAt,
        seatCount: Array.isArray(b.seats) ? b.seats.length : 0,
        totalAmount: b.totalAmount,
        status: b.status.toString().toLowerCase(),
        paymentMethod: b.paymentMethod?.toString().toLowerCase() ?? '—',
        raw: b,
    }
}

export function CompanyBookingsPage() {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.bookings' })
    const { t: tCommon } = useTranslation()
    const { admin } = useAuthStore()
    const busCompanyId = admin?.busCompanyId ?? ''

    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [page, setPage] = useState(1)
    const [selectedBooking, setSelectedBooking] = useState<BookingRow | null>(null)
    const PER_PAGE = 15

    const bookingsQuery = useQuery({
        queryKey: ['company-bookings', busCompanyId],
        queryFn: () => getCompanyBookings(busCompanyId, { page: 1, limit: 500 }),
        select: (res) => readRows<IBooking>(res.data),
        enabled: !!busCompanyId,
        staleTime: 30_000,
    })

    const rows = useMemo(() => (bookingsQuery.data ?? []).map(toRow), [bookingsQuery.data])

    const filtered = useMemo(() => {
        let list = rows
        if (search) {
            const q = search.toLowerCase()
            list = list.filter(b =>
                b.bookingCode.toLowerCase().includes(q) ||
                b.customerEmail.toLowerCase().includes(q) ||
                b.routeLabel.toLowerCase().includes(q) ||
                b.customerName.toLowerCase().includes(q)
            )
        }
        if (statusFilter !== 'all') list = list.filter(b => b.status === statusFilter)
        return list
    }, [rows, search, statusFilter])

    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))

    const stats = useMemo(() => ({
        total: rows.length,
        confirmed: rows.filter(b => b.status === 'confirmed' || b.status === 'completed').length,
        pending: rows.filter(b => b.status === 'pending_payment' || b.status === 'reserved').length,
        cancelled: rows.filter(b => b.status === 'cancelled').length,
    }), [rows])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{t('company_title')}</h1>
                <p className="text-sm text-muted-foreground">{t('company_description')}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
                {[
                    { label: t('stats.total'), value: stats.total, color: 'text-foreground', icon: Ticket },
                    { label: t('stats.confirmed'), value: stats.confirmed, color: 'text-green-500', icon: CheckCircle2 },
                    { label: t('stats.pending'), value: stats.pending, color: 'text-orange-500', icon: Clock },
                    { label: t('stats.cancelled'), value: stats.cancelled, color: 'text-red-500', icon: XCircle },
                ].map(s => {
                    const Icon = s.icon
                    return (
                        <Card key={s.label}>
                            <CardContent className="p-4 flex items-center gap-3">
                                <Icon className={`h-5 w-5 ${s.color}`} />
                                <div>
                                    <p className="text-xs text-muted-foreground">{s.label}</p>
                                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1) }}
                        placeholder={t('search_placeholder')}
                        className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
                >
                    <option value="all">{tCommon('status.all')}</option>
                    <option value="confirmed">{tCommon('status.confirmed')}</option>
                    <option value="reserved">{tCommon('status.reserved')}</option>
                    <option value="pending_payment">{tCommon('status.pending_payment')}</option>
                    <option value="cancelled">{tCommon('status.cancelled')}</option>
                    <option value="completed">{tCommon('status.completed')}</option>
                </select>
                {(search || statusFilter !== 'all') && (
                    <Button variant="outline" size="sm" onClick={() => { setSearch(''); setStatusFilter('all') }}>
                        <X className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>

            {bookingsQuery.isLoading && <p className="text-sm text-muted-foreground">{tCommon('common.loading')}</p>}
            {bookingsQuery.isError && <p className="text-sm text-destructive">{tCommon('common.error')}</p>}

            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.booking_code')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.route')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.customer')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.booking_date')}</th>
                            <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t('table.seats')}</th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t('table.amount')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.booking_status')}</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.map(b => (
                            <tr key={b.id} className="border-t border-border hover:bg-muted/30">
                                <td className="px-4 py-3 font-mono text-xs font-medium">{b.bookingCode}</td>
                                <td className="px-4 py-3 text-xs max-w-32 truncate">{b.routeLabel}</td>
                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                    <div>{b.customerName}</div>
                                    <div className="text-muted-foreground/60">{b.customerEmail}</div>
                                </td>
                                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(b.createdAt)}</td>
                                <td className="px-4 py-3 text-center">{b.seatCount}</td>
                                <td className="px-4 py-3 text-right font-medium">{formatVnd(b.totalAmount)}</td>
                                <td className="px-4 py-3">
                                    <Badge variant={STATUS_VARIANTS[b.status] ?? 'secondary'} className="text-xs">
                                        {tCommon(`status.${b.status}`, { defaultValue: b.status })}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => setSelectedBooking(b)}
                                        className="text-muted-foreground hover:text-foreground p-1"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!bookingsQuery.isLoading && paginated.length === 0 && (
                            <tr>
                                <td colSpan={8} className="py-10 text-center text-muted-foreground">
                                    {tCommon('common.no_results')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{tCommon('common.showing', { shown: paginated.length, total: filtered.length })}</span>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                            {tCommon('common.prev')}
                        </Button>
                        <span>{page} / {totalPages}</span>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                            {tCommon('common.next')}
                        </Button>
                    </div>
                </div>
            )}

            {selectedBooking && (
                <Dialog
                    open={!!selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    title={t('detail.title', { code: selectedBooking.bookingCode })}
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-lg font-bold">{selectedBooking.bookingCode}</span>
                            <Badge variant={STATUS_VARIANTS[selectedBooking.status] ?? 'secondary'}>
                                {tCommon(`status.${selectedBooking.status}`, { defaultValue: selectedBooking.status })}
                            </Badge>
                        </div>
                        <div className="rounded-lg bg-muted/40 p-3 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('table.route')}</span>
                                <span className="font-medium">{selectedBooking.routeLabel}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('table.customer')}</span>
                                <span>{selectedBooking.customerName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{tCommon('pages.companies.email')}</span>
                                <span>{selectedBooking.customerEmail}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('table.seats')}</span>
                                <span>{selectedBooking.seatCount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('table.amount')}</span>
                                <span className="font-semibold text-green-600">{formatVnd(selectedBooking.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('table.payment_status')}</span>
                                <span>{selectedBooking.paymentMethod === 'pay_on_board' ? 'Pay on board' : selectedBooking.paymentMethod || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('table.booking_date')}</span>
                                <span>{formatDate(selectedBooking.createdAt)}</span>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => setSelectedBooking(null)}>
                            {tCommon('common.close')}
                        </Button>
                    </div>
                </Dialog>
            )}
        </div>
    )
}
