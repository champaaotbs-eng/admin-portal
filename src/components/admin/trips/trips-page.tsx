import { useState, useMemo } from 'react'
import { Plus, Search, Calendar, Clock, X, MapPin, Pencil, Ban, Building2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { getAdminTrips, createAdminTrip, updateAdminTrip, cancelAdminTrip } from 'services/admins/trip.service'
import { getAllCompanies } from 'services/admins/company.service'
import type { ITrip } from 'types/trip'
import type { ICompany } from 'types/company'
import type { TripFormData } from '../../company/trips/validation-schema'
import { TripForm } from '../../company/trips/components/TripForm'
import { STATUS_VARIANTS } from '../../company/trips/data'
import { formatVnd, formatDate, formatTime } from '@/utils/format'
import { useAuthStore } from '@/store/auth.store'

const TRIPS_QUERY_KEY = ['admin-trips']

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

const toDateTimeLocal = (iso: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const tripToFormDefaults = (trip: ITrip): Partial<TripFormData> => ({
    routeId: trip.routeId,
    busVersionId: trip.busVersionId ?? '',
    departureTime: toDateTimeLocal(trip.departureTime),
    arrivalTime: toDateTimeLocal(trip.arrivalTime),
    basePrice: String(trip.basePrice),
    isPublished: trip.isPublished,
})

export const AdminTripsPage = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.trips' })
    const { t: tCommon } = useTranslation()
    const queryClient = useQueryClient()
    const { admin } = useAuthStore()

    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [companyFilter, setCompanyFilter] = useState<string>('all')
    const [dateFrom, setDateFrom] = useState('')
    const [createOpen, setCreateOpen] = useState(false)
    const [editTrip, setEditTrip] = useState<ITrip | null>(null)
    const [cancelTrip, setCancelTrip] = useState<ITrip | null>(null)
    const [cancelReason, setCancelReason] = useState('')
    const [selectedCompanyId, setSelectedCompanyId] = useState(admin?.busCompanyId ?? '')

    const tripsQuery = useQuery({
        queryKey: [...TRIPS_QUERY_KEY],
        queryFn: () => getAdminTrips({ limit: 300 }),
        select: (res) => readRows<ITrip>(res.data),
        staleTime: 30_000,
    })

    const companiesQuery = useQuery({
        queryKey: ['admin-companies-select'],
        queryFn: () => getAllCompanies({ page: 1, limit: 200 }),
        select: (res) => readRows<ICompany>(res.data),
        staleTime: 60_000,
    })

    const trips = tripsQuery.data ?? []
    const companies = companiesQuery.data ?? []

    const filtered = useMemo(() => {
        let list = trips
        if (search) {
            const q = search.toLowerCase()
            list = list.filter(trip =>
                trip.fromLocationName?.toLowerCase().includes(q) ||
                trip.toLocationName?.toLowerCase().includes(q) ||
                trip.route?.fromLocationName?.toLowerCase().includes(q) ||
                trip.route?.toLocationName?.toLowerCase().includes(q) ||
                trip.busCompany?.name?.toLowerCase().includes(q) ||
                trip.tripId.toLowerCase().includes(q)
            )
        }
        if (statusFilter !== 'all') {
            list = list.filter(trip => trip.status.toLowerCase() === statusFilter.toLowerCase())
        }
        if (companyFilter !== 'all') {
            list = list.filter(trip => trip.busCompanyId === companyFilter)
        }
        if (dateFrom) {
            list = list.filter(trip => trip.departureTime.slice(0, 10) >= dateFrom)
        }
        return list
    }, [trips, search, statusFilter, companyFilter, dateFrom])

    const stats = useMemo(() => ({
        total: trips.length,
        scheduled: trips.filter(t => t.status.toUpperCase() === 'SCHEDULED').length,
        completed: trips.filter(t => t.status.toUpperCase() === 'COMPLETED').length,
        cancelled: trips.filter(t => t.status.toUpperCase() === 'CANCELLED').length,
    }), [trips])

    const hasFilter = search || statusFilter !== 'all' || companyFilter !== 'all' || dateFrom
    const clearFilters = () => { setSearch(''); setStatusFilter('all'); setCompanyFilter('all'); setDateFrom('') }

    const createMutation = useMutation({
        mutationFn: (data: TripFormData) => createAdminTrip({
            routeId: data.routeId,
            busVersionId: data.busVersionId || undefined,
            busCompanyId: selectedCompanyId,
            departureTime: new Date(data.departureTime).toISOString(),
            arrivalTime: new Date(data.arrivalTime).toISOString(),
            basePrice: Number(data.basePrice),
            isPublished: data.isPublished ?? true,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TRIPS_QUERY_KEY })
            toast.success(t('create_success', 'Trip created successfully'))
            setCreateOpen(false)
        },
        onError: (err: unknown) => {
            toast.error((err as { localizedMessage?: string })?.localizedMessage ?? tCommon('common.error'))
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ tripId, data }: { tripId: string; data: TripFormData }) =>
            updateAdminTrip(tripId, {
                routeId: data.routeId,
                busVersionId: data.busVersionId || undefined,
                departureTime: new Date(data.departureTime).toISOString(),
                arrivalTime: new Date(data.arrivalTime).toISOString(),
                basePrice: Number(data.basePrice),
                isPublished: data.isPublished ?? true,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TRIPS_QUERY_KEY })
            toast.success(t('update_success', 'Trip updated successfully'))
            setEditTrip(null)
        },
        onError: (err: unknown) => {
            toast.error((err as { localizedMessage?: string })?.localizedMessage ?? tCommon('common.error'))
        },
    })

    const cancelMutation = useMutation({
        mutationFn: ({ tripId, reason }: { tripId: string; reason: string }) =>
            cancelAdminTrip(tripId, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TRIPS_QUERY_KEY })
            toast.success(t('cancel_success', 'Trip cancelled successfully'))
            setCancelTrip(null)
            setCancelReason('')
        },
        onError: (err: unknown) => {
            toast.error((err as { localizedMessage?: string })?.localizedMessage ?? tCommon('common.error'))
        },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('admin_description')}</p>
                </div>
                <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="h-4 w-4" /> {t('add_trip')}
                </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
                {[
                    { label: t('stats.total'), value: stats.total, color: 'text-foreground' },
                    { label: t('stats.scheduled'), value: stats.scheduled, color: 'text-blue-500' },
                    { label: t('stats.completed'), value: stats.completed, color: 'text-green-500' },
                    { label: t('stats.cancelled'), value: stats.cancelled, color: 'text-red-500' },
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
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={t('search_placeholder')}
                        className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
                >
                    <option value="all">{tCommon('status.all')}</option>
                    <option value="scheduled">{tCommon('status.scheduled')}</option>
                    <option value="active">{tCommon('status.in_progress')}</option>
                    <option value="completed">{tCommon('status.completed')}</option>
                    <option value="cancelled">{tCommon('status.cancelled')}</option>
                </select>
                <select
                    value={companyFilter}
                    onChange={e => setCompanyFilter(e.target.value)}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
                >
                    <option value="all">{t('all_companies')}</option>
                    {companies.map(c => (
                        <option key={c.busCompanyId} value={c.busCompanyId}>{c.name}</option>
                    ))}
                </select>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={e => setDateFrom(e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
                    />
                </div>
                {hasFilter && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                        <X className="h-3.5 w-3.5" /> {tCommon('common.clear_filters')}
                    </Button>
                )}
            </div>

            {tripsQuery.isLoading && <p className="text-sm text-muted-foreground">{tCommon('common.loading')}</p>}
            {tripsQuery.isError && <p className="text-sm text-destructive">{tCommon('common.error')}</p>}

            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.route')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.departure')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.company')}</th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t('table.price')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.status')}</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(trip => {
                            const fromName = trip.fromLocationName ?? trip.route?.fromLocationName ?? trip.routeId
                            const toName = trip.toLocationName ?? trip.route?.toLocationName ?? trip.routeId
                            const isCancellable = trip.status.toUpperCase() === 'SCHEDULED'

                            return (
                                <tr key={trip.tripId} className="border-t border-border hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            <span className="truncate max-w-40">{fromName} → {toName}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(trip.departureTime)}
                                        </div>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <Clock className="h-3 w-3" />
                                            {formatTime(trip.departureTime)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1 text-xs">
                                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="truncate max-w-32">{trip.busCompany?.name ?? trip.busCompanyId}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">
                                        {formatVnd(trip.basePrice)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant={STATUS_VARIANTS[trip.status.toLowerCase()] ?? 'secondary'} className="text-xs">
                                            {tCommon(`status.${trip.status.toLowerCase()}`, { defaultValue: trip.status })}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setEditTrip(trip)}
                                                className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                                                title={tCommon('common.edit')}
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            {isCancellable && (
                                                <button
                                                    onClick={() => { setCancelTrip(trip); setCancelReason('') }}
                                                    className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                    title={t('cancel_trip')}
                                                >
                                                    <Ban className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        {!tripsQuery.isLoading && filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                                    {tCommon('common.no_results')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create dialog */}
            <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title={t('add_trip_title')} className="max-w-2xl">
                <div className="mb-4">
                    <label className="text-sm font-medium mb-1 block">{t('company_label')}</label>
                    <select
                        value={selectedCompanyId}
                        onChange={e => setSelectedCompanyId(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">{tCommon('common.select_option')}</option>
                        {companies.map(c => (
                            <option key={c.busCompanyId} value={c.busCompanyId}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <TripForm
                    onSubmit={(data) => createMutation.mutate(data)}
                    onCancel={() => setCreateOpen(false)}
                    isSubmitting={createMutation.isPending}
                />
            </Dialog>

            {/* Edit dialog */}
            <Dialog open={!!editTrip} onClose={() => setEditTrip(null)} title={t('edit_trip_title')} className="max-w-2xl">
                {editTrip && (
                    <TripForm
                        defaultValues={tripToFormDefaults(editTrip)}
                        onSubmit={(data) => updateMutation.mutate({ tripId: editTrip.tripId, data })}
                        onCancel={() => setEditTrip(null)}
                        isSubmitting={updateMutation.isPending}
                    />
                )}
            </Dialog>

            {/* Cancel dialog */}
            <Dialog open={!!cancelTrip} onClose={() => setCancelTrip(null)} title={t('cancel_trip_title')}>
                <div className="grid gap-4">
                    <p className="text-sm text-muted-foreground">{t('cancel_trip_confirm')}</p>
                    <div>
                        <label className="text-sm font-medium mb-1 block">{t('cancel_reason_label')}</label>
                        <textarea
                            value={cancelReason}
                            onChange={e => setCancelReason(e.target.value)}
                            placeholder={t('cancel_reason_placeholder')}
                            rows={3}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="destructive"
                            onClick={() => cancelTrip && cancelMutation.mutate({ tripId: cancelTrip.tripId, reason: cancelReason })}
                            disabled={!cancelReason.trim() || cancelMutation.isPending}
                        >
                            {cancelMutation.isPending ? tCommon('common.loading') : t('cancel_confirm_btn')}
                        </Button>
                        <Button variant="outline" onClick={() => setCancelTrip(null)}>
                            {tCommon('common.cancel')}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}
