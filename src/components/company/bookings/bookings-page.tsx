import { useState, useMemo } from 'react'
import { Search, Eye, X, Ticket, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { MOCK_BOOKINGS } from '@/data/mock-extended'
import { formatDate, formatVnd } from '@/utils/format'

// Filter to just this company's bookings (c1 = Phuong Trang)
const MY_BOOKINGS = MOCK_BOOKINGS.filter(b => b.companyId === 'c1')

const STATUS_LABELS: Record<string, string> = {
    confirmed: 'Da xac nhan',
    pending_payment: 'Cho thanh toan',
    cancelled: 'Da huy',
    expired: 'Het han',
    completed: 'Hoan thanh',
}
const STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
    confirmed: 'success',
    pending_payment: 'warning',
    cancelled: 'destructive',
    expired: 'secondary',
    completed: 'success',
}

export function CompanyBookingsPage() {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [page, setPage] = useState(1)
    const [selectedBooking, setSelectedBooking] = useState<typeof MOCK_BOOKINGS[0] | null>(null)
    const PER_PAGE = 15

    const filtered = useMemo(() => {
        let list = MY_BOOKINGS
        if (search) {
            const q = search.toLowerCase()
            list = list.filter(b =>
                b.bookingCode.toLowerCase().includes(q) ||
                b.userEmail.toLowerCase().includes(q) ||
                b.routeLabel.toLowerCase().includes(q)
            )
        }
        if (statusFilter !== 'all') list = list.filter(b => b.status === statusFilter)
        return list
    }, [search, statusFilter])

    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))

    const stats = useMemo(() => ({
        total: MY_BOOKINGS.length,
        confirmed: MY_BOOKINGS.filter(b => b.status === 'confirmed').length,
        pending: MY_BOOKINGS.filter(b => b.status === 'pending_payment').length,
        cancelled: MY_BOOKINGS.filter(b => b.status === 'cancelled').length,
    }), [])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Quan Ly Dat Ve</h1>
                <p className="text-sm text-muted-foreground">Danh sach dat ve cua cong ty</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
                {[
                    { label: 'Tong dat ve', value: stats.total, color: 'text-foreground', icon: Ticket },
                    { label: 'Da xac nhan', value: stats.confirmed, color: 'text-green-500', icon: CheckCircle2 },
                    { label: 'Cho thanh toan', value: stats.pending, color: 'text-orange-500', icon: Clock },
                    { label: 'Da huy', value: stats.cancelled, color: 'text-red-500', icon: XCircle },
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

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Tim ma ve, email, tuyen..."
                        className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none">
                    <option value="all">Tat ca</option>
                    <option value="confirmed">Da xac nhan</option>
                    <option value="pending_payment">Cho TT</option>
                    <option value="cancelled">Da huy</option>
                    <option value="completed">Hoan thanh</option>
                </select>
                {(search || statusFilter !== 'all') && (
                    <Button variant="outline" size="sm" onClick={() => { setSearch(''); setStatusFilter('all') }}>
                        <X className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ma ve</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tuyen xe</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Khach hang</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Dat luc</th>
                            <th className="px-4 py-3 text-center font-medium text-muted-foreground">Ghe</th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Tong tien</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Trang thai</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.map(b => (
                            <tr key={b.id} className="border-t border-border hover:bg-muted/30">
                                <td className="px-4 py-3 font-mono text-xs">{b.bookingCode}</td>
                                <td className="px-4 py-3 text-xs max-w-32 truncate">{b.routeLabel}</td>
                                <td className="px-4 py-3 text-xs text-muted-foreground">{b.userEmail}</td>
                                <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(b.createdAt)}</td>
                                <td className="px-4 py-3 text-center">{b.seatCount}</td>
                                <td className="px-4 py-3 text-right font-medium">{formatVnd(b.totalAmount)}</td>
                                <td className="px-4 py-3">
                                    <Badge variant={STATUS_VARIANTS[b.status] ?? 'secondary'} className="text-xs">
                                        {STATUS_LABELS[b.status] ?? b.status}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3">
                                    <button onClick={() => setSelectedBooking(b)} className="text-muted-foreground hover:text-foreground p-1">
                                        <Eye className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {paginated.length === 0 && (
                            <tr>
                                <td colSpan={8} className="py-10 text-center text-muted-foreground">Khong co du lieu</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{filtered.length} ket qua</span>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Truoc</Button>
                    <span>{page} / {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Sau</Button>
                </div>
            </div>

            {/* Detail Dialog */}
            {selectedBooking && (
                <Dialog open={!!selectedBooking} onClose={() => setSelectedBooking(null)} title="Chi tiet dat ve">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-lg font-bold">{selectedBooking.bookingCode}</span>
                            <Badge variant={STATUS_VARIANTS[selectedBooking.status] ?? 'secondary'}>
                                {STATUS_LABELS[selectedBooking.status] ?? selectedBooking.status}
                            </Badge>
                        </div>
                        <div className="rounded-lg bg-muted/40 p-3 space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Tuyen xe</span><span className="font-medium">{selectedBooking.routeLabel}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Khach hang</span><span>{selectedBooking.userName}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{selectedBooking.userEmail}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">So ghe</span><span>{selectedBooking.seatCount}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Tong tien</span><span className="font-semibold text-green-600">{formatVnd(selectedBooking.totalAmount)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Phuong thuc TT</span><span>{selectedBooking.paymentMethod}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Dat luc</span><span>{formatDate(selectedBooking.createdAt)}</span></div>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => setSelectedBooking(null)}>Dong</Button>
                    </div>
                </Dialog>
            )}
        </div>
    )
}
