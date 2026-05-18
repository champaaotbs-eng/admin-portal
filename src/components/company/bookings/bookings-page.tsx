import { useState, useMemo, useEffect } from 'react'
import { Search, X, Eye, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { VndInput } from '@/components/ui/vnd-input'
import { formatDateTime, formatVnd } from '@/utils/format'
import { getBookingStatusVariant, getPaymentMethodLabelKey, getPaymentMethodVariant, getPaymentStatusLabelKey, getPaymentStatusVariant, normalizeStatusKey } from '@/utils/booking-status'
import { getCompanyBookings, getBookingSeatLayout } from '@/services/company/booking.service'
import { confirmCompanyPaymentOnBoard, getCompanyPaymentByBookingId } from '@/services/company/payment.service'
import { useAuthStore } from '@/store/auth.store'
import type { IBooking } from '@/types/booking'
import { EBookingStatus, EPaymentMethod } from '@/types/booking'
import type { IPayment } from '@/types/payment'
import { EPaymentStatus } from '@/types/payment'
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

const toDateTimeLocalValue = (input: Date | string) => {
    const date = new Date(input)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
}

function SeatLayoutGrid({ bookingId }: { bookingId: string }) {
    const { data, isLoading } = useQuery({
        queryKey: ['booking-seat-layout', bookingId],
        queryFn: () => getBookingSeatLayout(bookingId),
        select: (res) => (res as any).data ?? res,
        staleTime: 60_000,
    })
    const [activeFloor, setActiveFloor] = useState<number | null>(null)
    const floors = [...new Set((data ?? []).map((s: any) => s.floor))].sort()

    useEffect(() => {
        if (!floors.length) return
        setActiveFloor((current) => (current && floors.includes(current) ? current : floors[0]))
    }, [bookingId, floors])

    if (isLoading) return <p className="text-xs text-muted-foreground">Loading...</p>
    if (!data?.length) return <p className="text-xs text-muted-foreground">No seat layout</p>

    const currentFloor = activeFloor && floors.includes(activeFloor) ? activeFloor : floors[0]
    const visibleFloors = floors.length > 1 ? [currentFloor] : floors

    return (
        <div className="space-y-3">
            {floors.length > 1 && (
                <div className="flex flex-wrap gap-2">
                    {floors.map((floor: number) => (
                        <button
                            key={floor}
                            type="button"
                            onClick={() => setActiveFloor(floor)}
                            className={
                                currentFloor === floor
                                    ? 'rounded-lg border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground'
                                    : 'rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent'
                            }
                        >
                            Floor {floor}
                        </button>
                    ))}
                </div>
            )}
            {visibleFloors.map((floor: number) => {
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
    const qc = useQueryClient()
    const busCompanyId = admin?.busCompanyId ?? ''

    const [search, setSearch] = useState('')
    const [tripFilter, setTripFilter] = useState('all')
    const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null)
    const [confirmationNote, setConfirmationNote] = useState('')
    const [collectedAmountInput, setCollectedAmountInput] = useState('')
    const [confirmedAtInput, setConfirmedAtInput] = useState('')
    const [confirmFeedback, setConfirmFeedback] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const PER_PAGE = 15

    const { data: bookings = [], isLoading } = useQuery({
        queryKey: ['company-bookings', busCompanyId],
        queryFn: () => getCompanyBookings({ page: 1, limit: 1000 }),
        select: (res) => readRows<IBooking>(res.data),
        enabled: !!busCompanyId,
        staleTime: 30_000,
    })

    const selectedBookingId = (selectedBooking as any)?.id ?? selectedBooking?.bookingId ?? ''
    const paymentQuery = useQuery({
        queryKey: ['company-booking-payment', selectedBookingId],
        queryFn: () => getCompanyPaymentByBookingId(selectedBookingId),
        select: (res) => (res.data ?? res) as IPayment,
        enabled: !!selectedBookingId,
        staleTime: 30_000,
    })

    const confirmOnBoardMutation = useMutation({
        mutationFn: ({
            paymentId,
            collectedAmount,
            repayAmount,
            confirmedAt,
            note,
        }: {
            paymentId: string
            collectedAmount: number
            repayAmount: number
            confirmedAt: string
            note?: string
        }) =>
            confirmCompanyPaymentOnBoard(paymentId, { collectedAmount, repayAmount, confirmedAt, note }),
        onSuccess: () => {
            setConfirmFeedback(t('detail.confirm_success', { defaultValue: 'Payment confirmed. Booking moved to confirmed.' }))
            setSelectedBooking((current) => current ? { ...current, status: EBookingStatus.CONFIRMED } : current)
            void qc.invalidateQueries({ queryKey: ['company-bookings', busCompanyId] })
            void qc.invalidateQueries({ queryKey: ['company-booking-payment', selectedBookingId] })
        },
        onError: (error: any) => {
            setConfirmFeedback(error?.localizedMessage || error?.message || tCommon('common.error'))
        },
    })

    useEffect(() => {
        setConfirmationNote('')
        setCollectedAmountInput(selectedBooking ? String(Number(selectedBooking.totalAmount)) : '')
        setConfirmedAtInput(toDateTimeLocalValue(new Date()))
        setConfirmFeedback(null)
    }, [selectedBookingId])

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

    const canConfirmOnBoardPayment = Boolean(
        selectedBooking &&
        paymentQuery.data &&
        selectedBooking.paymentMethod === EPaymentMethod.PAY_ON_BOARD &&
        selectedBooking.status === EBookingStatus.RESERVED &&
        paymentQuery.data.status === EPaymentStatus.PENDING,
    )
    const bookingTotalAmount = Number(selectedBooking?.totalAmount ?? 0)
    const collectedAmount = Number(collectedAmountInput || 0)
    const repayAmount = Math.max(0, Number((collectedAmount - bookingTotalAmount).toFixed(2)))
    const isCollectedAmountValid = collectedAmount >= bookingTotalAmount
    const isConfirmedAtValid = Boolean(confirmedAtInput)

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
                                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(b.createdAt)}</td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground">{seatCodes}</td>
                                    <td className="px-4 py-3 text-right text-xs font-medium">{formatVnd(b.totalAmount)}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant={getBookingStatusVariant(status)} className="text-xs">
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
                <Dialog open onClose={() => setSelectedBooking(null)} title={t('detail.title', { code: selectedBooking.bookingCode })} className="max-w-4xl">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-lg font-bold">{selectedBooking.bookingCode}</span>
                            <Badge variant={getBookingStatusVariant(selectedBooking.status)}>
                                {tCommon(`status.${normalizeStatusKey(selectedBooking.status)}`, { defaultValue: selectedBooking.status })}
                            </Badge>
                        </div>
                        <div className="rounded-lg bg-muted/40 p-3 space-y-2 text-sm">
                            {[
                                [t('detail.customer', { defaultValue: t('table.customer') }), (selectedBooking as any).passengerName ?? (selectedBooking as any).user?.fullName ?? '-'],
                                [t('detail.phone', { defaultValue: 'Phone' }), (selectedBooking as any).passengerPhone ?? '-'],
                                [t('detail.email', { defaultValue: 'Email' }), (selectedBooking as any).passengerEmail ?? (selectedBooking as any).user?.email ?? '-'],
                                [t('detail.amount', { defaultValue: t('table.amount') }), formatVnd(selectedBooking.totalAmount)],
                                [t('detail.booking_date', { defaultValue: t('table.booking_date') }), formatDateTime(selectedBooking.createdAt)],
                            ].map(([label, value]) => (
                                <div key={label} className="flex justify-between">
                                    <span className="text-muted-foreground">{label}</span>
                                    <span className="font-medium">{value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="rounded-lg bg-muted/40 p-3 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('detail.payment_method', { defaultValue: 'Payment method' })}</span>
                                <Badge variant={getPaymentMethodVariant(selectedBooking.paymentMethod)}>
                                    {tCommon(getPaymentMethodLabelKey(selectedBooking.paymentMethod), { defaultValue: selectedBooking.paymentMethod })}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('detail.payment_status', { defaultValue: 'Payment status' })}</span>
                                {paymentQuery.isLoading ? (
                                    <span className="font-medium">{tCommon('common.loading')}</span>
                                ) : paymentQuery.data?.status ? (
                                    <Badge variant={getPaymentStatusVariant(paymentQuery.data.status)}>
                                        {tCommon(getPaymentStatusLabelKey(paymentQuery.data.status), { defaultValue: paymentQuery.data.status })}
                                    </Badge>
                                ) : (
                                    <span className="font-medium">-</span>
                                )}
                            </div>
                            {paymentQuery.data?.collectedAmount !== null && paymentQuery.data?.collectedAmount !== undefined && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('detail.collected_amount', { defaultValue: 'Collected amount' })}</span>
                                    <span className="font-medium">{formatVnd(Number(paymentQuery.data.collectedAmount))}</span>
                                </div>
                            )}
                            {paymentQuery.data?.repayAmount !== null && paymentQuery.data?.repayAmount !== undefined && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('detail.repay_amount', { defaultValue: 'Repay amount' })}</span>
                                    <span className="font-medium">{formatVnd(Number(paymentQuery.data.repayAmount))}</span>
                                </div>
                            )}
                            {paymentQuery.data?.confirmedAt && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('detail.confirm_time', { defaultValue: 'Time' })}</span>
                                    <span className="font-medium">{formatDateTime(paymentQuery.data.confirmedAt)}</span>
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="mb-2 text-sm font-medium">{t('table.seats')}</p>
                            <SeatLayoutGrid bookingId={(selectedBooking as any).id ?? selectedBooking.bookingId} />
                        </div>
                        {canConfirmOnBoardPayment && paymentQuery.data && (
                            <div className="rounded-lg border border-border p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    <p className="text-sm font-medium">
                                        {t('detail.confirm_on_board_title', { defaultValue: 'Confirm pay-on-board payment' })}
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {t('detail.confirm_on_board_desc', { defaultValue: 'Mark this reserved booking as paid and move it to confirmed.' })}
                                </p>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">
                                            {t('detail.amount_received', { defaultValue: 'Amount received from customer' })}
                                        </label>
                                        <VndInput
                                            value={collectedAmountInput}
                                            onChange={(e) => setCollectedAmountInput(e.target.value)}
                                            placeholder="100.000"
                                            inputClassName="bg-background"
                                        />
                                        {!isCollectedAmountValid && (
                                            <p className="text-xs text-destructive">
                                                {t('detail.amount_received_error', { defaultValue: 'Received amount must be at least the booking total.' })}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">
                                            {t('detail.repay_amount', { defaultValue: 'Repay amount' })}
                                        </label>
                                        <VndInput
                                            value={repayAmount}
                                            readOnly
                                            inputClassName="bg-muted text-muted-foreground"
                                        />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-medium text-muted-foreground">
                                            {t('detail.confirm_time', { defaultValue: 'Time' })}
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={confirmedAtInput}
                                            onChange={(e) => setConfirmedAtInput(e.target.value)}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">
                                        {t('detail.confirm_note', { defaultValue: 'Note' })}
                                    </label>
                                    <textarea
                                        value={confirmationNote}
                                        onChange={(e) => setConfirmationNote(e.target.value)}
                                        rows={3}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        placeholder={t('detail.confirm_note_placeholder', { defaultValue: 'Optional payment note' })}
                                    />
                                </div>
                                {confirmFeedback && (
                                    <p className="text-xs text-muted-foreground">{confirmFeedback}</p>
                                )}
                                <Button
                                    className="w-full"
                                    loading={confirmOnBoardMutation.isPending}
                                    onClick={() => {
                                        setConfirmFeedback(null)
                                        const paymentId = paymentQuery.data.paymentId || paymentQuery.data.id
                                        if (!paymentId) {
                                            setConfirmFeedback(t('detail.confirm_payment_missing', { defaultValue: 'Payment record is missing. Reload booking details and try again.' }))
                                            return
                                        }
                                        confirmOnBoardMutation.mutate({
                                            paymentId,
                                            collectedAmount,
                                            repayAmount,
                                            confirmedAt: new Date(confirmedAtInput).toISOString(),
                                            note: confirmationNote.trim() || undefined,
                                        })
                                    }}
                                    disabled={!isCollectedAmountValid || !isConfirmedAtValid}
                                >
                                    {t('detail.confirm_on_board_cta', { defaultValue: 'Confirm payment' })}
                                </Button>
                            </div>
                        )}
                        <Button variant="outline" className="w-full" onClick={() => setSelectedBooking(null)}>{tCommon('common.close')}</Button>
                    </div>
                </Dialog>
            )}
        </div>
    )
}
