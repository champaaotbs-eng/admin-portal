import { useState } from 'react'
import { Search, X, Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PaginatedTable } from '@/components/shared/pagination-table'
import { formatDate, formatVnd } from '@/utils/format'
import { getAdminBookings } from 'services/admins/booking.service'
import { getBookingSeatLayout } from 'services/company/booking.service'
import type { IBooking } from 'types/booking'
import { Dialog } from '@/components/ui/dialog'

const PAGE_SIZE = 15

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

const readMeta = (payload: unknown) => {
    if (!payload || typeof payload !== 'object') return null
    const p = payload as Record<string, unknown>
    if (p.meta && typeof p.meta === 'object') return p.meta as { totalPages: number; totalItems: number }
    if (p.data && typeof p.data === 'object') {
        const nested = p.data as Record<string, unknown>
        if (nested.meta && typeof nested.meta === 'object') return nested.meta as { totalPages: number; totalItems: number }
    }
    return null
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
                                    <div key={seat.seatId} className={`flex h-8 w-8 items-center justify-center rounded border text-[10px] font-medium ${seat.isBooked ? 'border-primary bg-primary text-primary-foreground' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
                                        {seat.seatCode}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export const AdminBookingsPage = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.bookings' })
    const { t: tCommon } = useTranslation()

    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null)

    const { data, isLoading } = useQuery({
        queryKey: ['admin-bookings', page, search],
        queryFn: () => getAdminBookings({ page, limit: PAGE_SIZE, search: search || undefined }),
    })

    const rows = readRows<IBooking>(data)
    const meta = readMeta(data)

    const hasFilter = !!search

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{t('title')}</h1>
                <p className="text-sm text-muted-foreground">{t('description')}</p>
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
                {hasFilter && (
                    <Button variant="outline" size="sm" onClick={() => { setSearch(''); setPage(1) }}>
                        <X className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>

            <PaginatedTable
                data={rows}
                rowKey={(b) => (b as any).id ?? b.bookingId}
                isLoading={isLoading}
                emptyMessage={tCommon('common.no_results')}
                pagination={{
                    currentPage: page,
                    totalPages: meta?.totalPages ?? 1,
                    totalItems: meta?.totalItems ?? 0,
                    pageSize: PAGE_SIZE,
                    onPageChange: setPage,
                }}
                columns={[
                    {
                        id: 'code', header: t('table.booking_code'),
                        renderCell: (b) => <span className="font-mono text-xs font-medium">{b.bookingCode}</span>,
                    },
                    {
                        id: 'route', header: t('table.route'),
                        renderCell: (b) => {
                            const ti = (b as any).tripInfo
                            const label = ti?.fromLocationName && ti?.toLocationName ? `${ti.fromLocationName} → ${ti.toLocationName}` : '—'
                            return <span className="text-xs text-muted-foreground truncate block max-w-40" aria-label={label} title={label}>{label}</span>
                        },
                    },
                    {
                        id: 'company', header: t('table.company'),
                        renderCell: (b) => <span className="text-xs truncate block max-w-32">{(b as any).tripInfo?.busCompanyName ?? '—'}</span>,
                    },
                    {
                        id: 'customer', header: t('table.customer'),
                        renderCell: (b) => <span className="text-xs">{(b as any).passengerName ?? (b as any).user?.fullName ?? '—'}</span>,
                    },
                    {
                        id: 'date', header: t('table.booking_date'),
                        renderCell: (b) => <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(b.createdAt)}</span>,
                    },
                    {
                        id: 'seats', header: t('table.seats'),
                        renderCell: (b) => {
                            const codes = Array.isArray(b.seats) ? b.seats.map((s) => s.seatCode).filter(Boolean).join(', ') : '—'
                            return <span className="text-xs text-muted-foreground">{codes}</span>
                        },
                    },
                    {
                        id: 'amount', header: t('table.amount'), headerClassName: 'text-right', cellClassName: 'text-right',
                        renderCell: (b) => <span className="text-xs font-medium">{formatVnd(b.totalAmount)}</span>,
                    },
                    {
                        id: 'status', header: t('table.booking_status'),
                        renderCell: (b) => {
                            const status = b.status.toString().toLowerCase()
                            return <Badge variant={STATUS_VARIANTS[status] ?? 'secondary'} className="text-xs">{tCommon(`status.${status}`, { defaultValue: status })}</Badge>
                        },
                    },
                    {
                        id: 'action', header: '',
                        renderCell: (b) => (
                            <button onClick={() => setSelectedBooking(b)} className="text-muted-foreground hover:text-foreground p-1">
                                <Eye className="h-4 w-4" />
                            </button>
                        ),
                    },
                ]}
            />

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
                            {([
                                [t('table.customer'), (selectedBooking as any).passengerName ?? (selectedBooking as any).user?.fullName ?? '—'],
                                ['Phone', (selectedBooking as any).passengerPhone ?? '—'],
                                ['Email', (selectedBooking as any).passengerEmail ?? (selectedBooking as any).user?.email ?? '—'],
                                [t('table.company'), (selectedBooking as any).tripInfo?.busCompanyName ?? '—'],
                                [t('table.route'), (() => { const ti = (selectedBooking as any).tripInfo; return ti?.fromLocationName && ti?.toLocationName ? `${ti.fromLocationName} → ${ti.toLocationName}` : '—' })()],
                                [t('table.amount'), formatVnd(selectedBooking.totalAmount)],
                                [t('table.booking_date'), formatDate(selectedBooking.createdAt)],
                            ] as [string, string][]).map(([label, value]) => (
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
