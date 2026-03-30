import { useState } from 'react'
import { Plus, Search, Calendar, Clock, MapPin, Bus, X, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { STATUS_LABELS, STATUS_VARIANTS } from './data'
import { useTripsPage } from './hooks/use-trips-page'
import { TripForm } from './components/TripForm'

export const CompanyTripsPage = () => {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [dialogOpen, setDialogOpen] = useState(false)
    const {
        filtered, stats,
        openDialog, closeDialog,
        clearFilters, hasFilter,
    } = useTripsPage({ search, setSearch, statusFilter, setStatusFilter, setDialogOpen })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Quan Ly Chuyen Di</h1>
                    <p className="text-sm text-muted-foreground">Lich trinh cac chuyen xe cua cong ty</p>
                </div>
                <Button onClick={openDialog}>
                    <Plus className="h-4 w-4" /> Them chuyen
                </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
                {[
                    { label: 'Tong chuyen', value: stats.total, color: 'text-foreground' },
                    { label: 'Sap khoi hanh', value: stats.scheduled, color: 'text-blue-500' },
                    { label: 'Hoan thanh', value: stats.completed, color: 'text-green-500' },
                    { label: 'Da huy', value: stats.cancelled, color: 'text-red-500' },
                ].map(s => (
                    <Card key={s.label}>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tim theo tuyen, xe, tai xe..."
                        className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none">
                    <option value="all">Tat ca trang thai</option>
                    <option value="scheduled">Sap khoi hanh</option>
                    <option value="in_progress">Dang chay</option>
                    <option value="completed">Hoan thanh</option>
                    <option value="cancelled">Da huy</option>
                </select>
                {hasFilter && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                        <X className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tuyen xe</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Khoi hanh</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Xe</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tai xe</th>
                            <th className="px-4 py-3 text-center font-medium text-muted-foreground">Ghe (ban/tong)</th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Gia ve</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Trang thai</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(trip => (
                            <tr key={trip.id} className="border-t border-border hover:bg-muted/30">
                                <td className="px-4 py-3 font-medium">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                        {trip.route}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(trip.departure).toLocaleDateString('vi-VN')}
                                    </div>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <Clock className="h-3 w-3" />
                                        {new Date(trip.departure).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1 text-xs">
                                        <Bus className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="font-mono">{trip.bus}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm">{trip.driver}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="text-xs">
                                            <span className={trip.sold === trip.seats ? 'text-green-600 font-semibold' : ''}>
                                                {trip.sold}
                                            </span>
                                            /{trip.seats}
                                        </span>
                                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden hidden sm:block">
                                            <div className={`h-full rounded-full ${trip.sold === trip.seats ? 'bg-green-500' : 'bg-primary'}`}
                                                style={{ width: `${(trip.sold / trip.seats) * 100}%` }} />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right font-medium">
                                    {trip.price.toLocaleString('vi-VN')}₫
                                </td>
                                <td className="px-4 py-3">
                                    <Badge variant={STATUS_VARIANTS[trip.status] ?? 'secondary'} className="text-xs">
                                        {STATUS_LABELS[trip.status] ?? trip.status}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3">
                                    <button className="text-xs text-primary hover:underline">Chi tiet</button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                                    Khong co chuyen di nao
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Dialog open={dialogOpen} onClose={closeDialog} title="Thêm chuyến đi mới">
                <TripForm
                    onSubmit={() => closeDialog()}
                    onCancel={closeDialog}
                />
            </Dialog>
        </div>
    )
}
