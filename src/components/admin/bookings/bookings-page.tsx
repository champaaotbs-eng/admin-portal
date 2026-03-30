import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, CalendarDays, X, CheckCircle2, XCircle, AlertCircle, Building2, Eye, Ticket } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate, formatVnd } from '@/utils/format'
import { useBookingsPage } from './hooks/use-bookings-page'
import type { BookingStatus, PaymentStatus, PaymentMethod } from './hooks/use-bookings-page'
import type { BookingExtended } from '@/types'
import { BookingDetailModal, statusBadge, paymentBadge } from './components/BookingDetailModal'

export const AdminBookingsPage = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.bookings' })
    const { t: tCommon } = useTranslation()
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<BookingStatus>('all')
    const [paymentFilter, setPaymentFilter] = useState<PaymentStatus>('all')
    const [methodFilter, setMethodFilter] = useState<PaymentMethod>('all')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [detailBooking, setDetailBooking] = useState<BookingExtended | null>(null)
    const [page, setPage] = useState(1)

    const {
        filtered, paginated, totalPages, hasFilter, statCounts,
        handleSearch, handleStatusFilter, handlePaymentFilter, handleDateFrom, handleDateTo,
        clearFilters,
    } = useBookingsPage({ search, setSearch, statusFilter, setStatusFilter, paymentFilter, setPaymentFilter, methodFilter, setMethodFilter, dateFrom, setDateFrom, dateTo, setDateTo, page, setPage })

    const stats = [
        { label: t('stats.total'), value: statCounts.total, color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Ticket },
        { label: t('stats.confirmed'), value: statCounts.confirmed, color: 'text-green-500', bg: 'bg-green-500/10', icon: CheckCircle2 },
        { label: t('stats.cancelled'), value: statCounts.cancelled, color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle },
        { label: t('stats.pending'), value: statCounts.pending, color: 'text-orange-500', bg: 'bg-orange-500/10', icon: AlertCircle },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{t('title')}</h1>
                <p className="text-sm text-muted-foreground">{t('description')}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
                {stats.map(s => {
                    const Icon = s.icon
                    return (
                        <Card key={s.label}>
                            <CardContent className="p-4 flex items-center gap-3">
                                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                                    <Icon className={`h-4 w-4 ${s.color}`} />
                                </span>
                                <div>
                                    <p className="text-xs text-muted-foreground">{s.label}</p>
                                    <p className="text-xl font-bold">{s.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48 max-w-xs">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={search} onChange={e => handleSearch(e.target.value)}
                        placeholder={t('search_placeholder')}
                        className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <select value={statusFilter} onChange={e => handleStatusFilter(e.target.value as BookingStatus)}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="all">{tCommon('status.all')}</option>
                    <option value="confirmed">{tCommon('status.confirmed')}</option>
                    <option value="pending">{tCommon('status.pending')}</option>
                    <option value="cancelled">{tCommon('status.cancelled')}</option>
                    <option value="expired">{tCommon('status.expired')}</option>
                </select>
                <select value={paymentFilter} onChange={e => handlePaymentFilter(e.target.value as PaymentStatus)}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="all">{tCommon('payment_status.all')}</option>
                    <option value="paid">{tCommon('payment_status.paid')}</option>
                    <option value="unpaid">{tCommon('payment_status.unpaid')}</option>
                    <option value="refunded">{tCommon('payment_status.refunded')}</option>
                </select>
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <input type="date" value={dateFrom} onChange={e => handleDateFrom(e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    <span className="text-muted-foreground">—</span>
                    <input type="date" value={dateTo} onChange={e => handleDateTo(e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                {hasFilter && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                        <X className="h-3.5 w-3.5" /> {tCommon('common.clear_filters')}
                    </Button>
                )}
            </div>

            <p className="text-sm text-muted-foreground">{tCommon('common.showing', { shown: paginated.length, total: filtered.length })}</p>

            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">{t('table.booking_code')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">{t('table.route')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">{t('table.company')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">{t('table.customer')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">{t('table.booking_date')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">{t('table.seats')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">{t('table.amount')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">{t('table.booking_status')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">{t('table.payment_status')}</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.map(b => (
                            <tr key={b.id} className="border-t border-border hover:bg-muted/30">
                                <td className="px-4 py-3">
                                    <span className="font-mono text-xs font-medium">{b.bookingCode}</span>
                                </td>
                                <td className="px-4 py-3 max-w-40">
                                    <p className="text-xs text-muted-foreground truncate">{b.routeLabel}</p>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="flex items-center gap-1 text-xs">
                                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="truncate max-w-28">{b.companyName}</span>
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="text-xs truncate max-w-36">{b.userEmail}</p>
                                </td>
                                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                    {formatDate(b.createdAt)}
                                </td>
                                <td className="px-4 py-3 text-center font-medium">{b.seatCount}</td>
                                <td className="px-4 py-3 font-medium whitespace-nowrap">{formatVnd(b.totalAmount)}</td>
                                <td className="px-4 py-3">{statusBadge(b.status, tCommon)}</td>
                                <td className="px-4 py-3">{paymentBadge(b.paymentStatus, tCommon)}</td>
                                <td className="px-4 py-3">
                                    <button onClick={() => setDetailBooking(b)}
                                        className="text-muted-foreground hover:text-primary">
                                        <Eye className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {paginated.length === 0 && (
                            <tr>
                                <td colSpan={10} className="px-4 py-10 text-center text-muted-foreground">
                                    {tCommon('common.no_results')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{tCommon('common.page', { page, total: totalPages })}</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>{tCommon('common.prev')}</Button>
                        <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>{tCommon('common.next')}</Button>
                    </div>
                </div>
            )}

            {detailBooking && <BookingDetailModal booking={detailBooking} onClose={() => setDetailBooking(null)} />}
        </div>
    )
}
