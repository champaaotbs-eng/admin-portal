import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { AsyncSelect, type AsyncSelectOption } from '@/components/ui/async-select'
import { PaginatedTable, type PaginatedTableColumn } from '@/components/shared/pagination-table'
import { formatDateTime } from '@/utils/format'
import { ERouteStopType } from 'configs/constants'
import { useAuthStore } from '@/store/auth.store'
import { getAllStations, getStationById } from 'services/admins/stations.service'
import { createRoute, deleteRoute, getAllRoutes, getRouteById, updateRoute } from 'services/company/routes.service'
import type { ICompany } from 'types/company'
import type { IRoute, IRouteStop } from 'types/route'
import type { IStation } from 'types/station'
import type { TRouteFormData } from './validation-schema'
import { getAllCompanies } from 'services/admins/company.service'
import { RouteAddModal } from './route-add-modal'
import { RouteEditModal } from './route-edit-modal'

const ROUTES_QUERY_KEY = ['company-routes']
const PAGE_SIZE = 10

const readRows = <T,>(payload: unknown): T[] => {
    if (Array.isArray(payload)) return payload
    if (!payload || typeof payload !== 'object') return []
    const data = payload as Record<string, unknown>
    if (Array.isArray(data.result)) return data.result as T[]
    if (Array.isArray(data.data)) return data.data as T[]
    if (data.data && typeof data.data === 'object') {
        const nested = data.data as Record<string, unknown>
        if (Array.isArray(nested.result)) return nested.result as T[]
        if (Array.isArray(nested.data)) return nested.data as T[]
    }
    return []
}

const readMeta = (payload: unknown): { totalItems: number; totalPages: number } => {
    const source = payload as Record<string, unknown> | null
    const meta = (source?.data as Record<string, unknown>)?.meta
        ?? (source as Record<string, unknown>)?.meta
    if (meta && typeof meta === 'object') {
        const m = meta as Record<string, unknown>
        return {
            totalItems: Number(m.totalItems ?? m.total ?? 0),
            totalPages: Number(m.totalPages ?? m.pages ?? 1),
        }
    }
    return { totalItems: 0, totalPages: 1 }
}

const readOne = <T,>(payload: unknown): T | null => {
    if (!payload) return null
    if (typeof payload === 'object') {
        const data = (payload as Record<string, unknown>).data
        if (data && typeof data === 'object') return data as T
        return payload as T
    }
    return null
}

const getCompanyIdFromAdmin = (admin: unknown): string => {
    if (!admin || typeof admin !== 'object') return ''
    const source = admin as {
        busCompanyId?: string
        companyId?: string
        company?: { busCompanyId?: string; companyId?: string }
        busCompany?: { busCompanyId?: string }
    }
    return source.busCompanyId
        ?? source.companyId
        ?? source.company?.busCompanyId
        ?? source.company?.companyId
        ?? source.busCompany?.busCompanyId
        ?? ''
}

const getRouteStops = (route: IRoute): IRouteStop[] => {
    if (Array.isArray(route.stops)) return route.stops
    const fallback = route as unknown as { routeStops?: IRouteStop[] }
    if (Array.isArray(fallback.routeStops)) return fallback.routeStops
    return []
}

const getStopStationId = (stop: IRouteStop): string => {
    const source = stop as IRouteStop & { stationId?: string; location_id?: string; station_id?: string }
    return source.locationId || source.stationId || source.location_id || source.station_id || ''
}

const getStopStationLabel = (stop: IRouteStop): string => {
    const source = stop as IRouteStop & {
        location?: { name?: string; label?: string }
        station?: { name?: string; label?: string }
        locationName?: string
        stationName?: string
    }
    return source.location?.name || source.location?.label || source.station?.label
        || source.station?.name || source.locationName || source.stationName || ''
}

const resolveErrorMessage = (error: unknown, t: (key: string) => string): string => {
    const source = error as { localizedMessage?: string; message?: string; response?: { data?: { message?: string } } }
    return source.localizedMessage ?? source.message ?? source.response?.data?.message ?? t('errors.internal_server_error')
}

export const CompanyRoutesPage = () => {
    const { admin } = useAuthStore()
    const queryClient = useQueryClient()
    const { t } = useTranslation('translation', { keyPrefix: 'pages.company_routes' })
    const { t: tRoot } = useTranslation()
    const [page, setPage] = useState(1)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingRouteId, setEditingRouteId] = useState<string | null>(null)
    const [stationLabelById, setStationLabelById] = useState<Record<string, string>>({})
    const companyLabelByIdRef = useRef<Record<string, string>>({})
    const stationLabelByIdRef = useRef<Record<string, string>>({})

    const companyId = useMemo(() => getCompanyIdFromAdmin(admin), [admin])

    const routesQuery = useQuery({
        queryKey: [...ROUTES_QUERY_KEY, page],
        queryFn: () => getAllRoutes({ page, limit: PAGE_SIZE }),
    })

    const routes = useMemo(() => readRows<IRoute>(routesQuery.data?.data), [routesQuery.data])
    const { totalItems, totalPages } = useMemo(() => readMeta(routesQuery.data), [routesQuery.data])

    const routeDetailQuery = useQuery({
        queryKey: [...ROUTES_QUERY_KEY, 'detail', editingRouteId],
        queryFn: () => getRouteById(editingRouteId ?? ''),
        enabled: Boolean(isEditModalOpen && editingRouteId),
        select: (response) => readOne<IRoute>(response.data),
    })

    const createMutation = useMutation({
        mutationFn: (payload: TRouteFormData) => createRoute(payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ROUTES_QUERY_KEY })
            toast.success(t('messages.create_success'))
            setIsAddModalOpen(false)
        },
        onError: (error) => toast.error(resolveErrorMessage(error, tRoot)),
    })

    const updateMutation = useMutation({
        mutationFn: ({ routeId, payload }: { routeId: string; payload: Partial<TRouteFormData> }) =>
            updateRoute(routeId, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ROUTES_QUERY_KEY })
            toast.success(t('messages.update_success'))
            setIsEditModalOpen(false)
        },
        onError: (error) => toast.error(resolveErrorMessage(error, tRoot)),
    })

    const deleteMutation = useMutation({
        mutationFn: (routeId: string) => deleteRoute(routeId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ROUTES_QUERY_KEY })
            toast.success(t('messages.delete_success'))
        },
        onError: (error) => toast.error(resolveErrorMessage(error, tRoot)),
    })

    const fetchBusCompanyOptions = useCallback(async (
        searchValue: string,
        page: number,
        limit: number,
        selectedCompanyId?: string,
    ) => {
        const trimmedSearch = searchValue.trim()
        const response = await getAllCompanies({
            ...(trimmedSearch ? { page, limit, filters: { name: trimmedSearch } } : { page, limit }),
        })
        const companies = readRows<ICompany>(response.data)

        if (companies.length > 0) {
            setStationLabelById((prev) => {
                const next = { ...prev }
                let changed = false
                companies.forEach((company) => {
                    if (companyLabelByIdRef.current[company.busCompanyId] !== company.name) {
                        companyLabelByIdRef.current[company.busCompanyId] = company.name
                        changed = true
                    }
                })
                return changed ? next : prev
            })
        }

        const options: AsyncSelectOption[] = companies.map((company) => ({
            value: company.busCompanyId,
            label: company.name,
            description: company.email || company.phone || company.address || undefined,
        }))

        if (selectedCompanyId && !options.some((o) => o.value === selectedCompanyId)) {
            options.unshift({ value: selectedCompanyId, label: companyLabelByIdRef.current[selectedCompanyId] || selectedCompanyId })
        }

        return options
    }, [])

    const fetchStationOptions = useCallback(async (
        searchValue: string,
        page: number,
        limit: number,
        selectedStationId?: string,
    ) => {
        const trimmedSearch = searchValue.trim()
        const response = await getAllStations({
            ...(trimmedSearch ? { page, limit, filters: { label: trimmedSearch } } : { page, limit }),
        })
        const stations = readRows<IStation>(response.data)

        if (stations.length > 0) {
            setStationLabelById((prev) => {
                const next = { ...prev }
                let changed = false
                stations.forEach((station) => {
                    if (!station.stationId) return
                    const label = station.label || station.address || station.stationId
                    if (next[station.stationId] !== label) {
                        next[station.stationId] = label
                        stationLabelByIdRef.current[station.stationId] = label
                        changed = true
                    }
                })
                return changed ? next : prev
            })
        }

        const options: AsyncSelectOption[] = stations
            .filter((s) => Boolean(s.stationId))
            .map((station) => ({
                value: station.stationId as string,
                label: station.label || station.address || (station.stationId as string),
                description: station.address,
            }))

        if (selectedStationId && !options.some((o) => o.value === selectedStationId)) {
            options.unshift({ value: selectedStationId, label: stationLabelByIdRef.current[selectedStationId] || selectedStationId })
        }

        return options
    }, [])

    const editingRoute = useMemo(
        () => routes.find((route) => route.routeId === editingRouteId) ?? null,
        [editingRouteId, routes],
    )
    const selectedRoute = routeDetailQuery.data ?? editingRoute

    useEffect(() => {
        if (!selectedRoute) return

        const stops = getRouteStops(selectedRoute)
        if (stops.length === 0) return

        const stationEntries = stops
            .map((stop) => ({ stationId: getStopStationId(stop), stationLabel: getStopStationLabel(stop) }))
            .filter((e) => Boolean(e.stationId))

        setStationLabelById((prev) => {
            const next = { ...prev }
            let changed = false
            stationEntries.forEach((entry) => {
                if (!entry.stationLabel) return
                if (next[entry.stationId] !== entry.stationLabel) {
                    next[entry.stationId] = entry.stationLabel
                    stationLabelByIdRef.current[entry.stationId] = entry.stationLabel
                    changed = true
                }
            })
            return changed ? next : prev
        })

        const unresolvedIds = [...new Set(
            stationEntries
                .filter((e) => !e.stationLabel && !stationLabelByIdRef.current[e.stationId])
                .map((e) => e.stationId),
        )]

        if (unresolvedIds.length === 0) return

        let isCancelled = false
        const loadMissing = async () => {
            const results = await Promise.allSettled(unresolvedIds.map((id) => getStationById(id)))
            if (isCancelled) return
            setStationLabelById((prev) => {
                const next = { ...prev }
                let changed = false
                results.forEach((result) => {
                    if (result.status !== 'fulfilled') return
                    const station = readOne<IStation>(result.value.data)
                    if (!station?.stationId) return
                    const label = station.label || station.address || station.stationId
                    if (next[station.stationId] !== label) {
                        next[station.stationId] = label
                        stationLabelByIdRef.current[station.stationId] = label
                        changed = true
                    }
                })
                return changed ? next : prev
            })
        }
        void loadMissing()
        return () => { isCancelled = true }
    }, [selectedRoute])

    const getRouteLabel = useCallback(
        (route: IRoute) => `${route.fromLocationName || t('unknown_location')} → ${route.toLocationName || t('unknown_location')}`,
        [t],
    )

    const getStopArrangement = useCallback((route: IRoute) =>
        getRouteStops(route)
            .slice()
            .sort((a, b) => a.stopOrder - b.stopOrder)
            .map((stop) => {
                const stationId = getStopStationId(stop)
                return getStopStationLabel(stop) || stationLabelById[stationId] || stationId
            })
            .join(' → '),
        [stationLabelById],
    )

    const handleDelete = (route: IRoute) => {
        if (!window.confirm(t('messages.confirm_delete', { route: getRouteLabel(route) }))) return
        deleteMutation.mutate(route.routeId)
    }

    const columns: PaginatedTableColumn<IRoute>[] = [
        {
            id: 'route',
            header: t('table.route'),
            renderCell: (route) => (
                <div>
                    <p className="font-medium">{getRouteLabel(route)}</p>
                    {getStopArrangement(route) ? (
                        <p className="mt-1 text-xs text-muted-foreground">{getStopArrangement(route)}</p>
                    ) : null}
                </div>
            ),
        },
        {
            id: 'distance',
            header: t('table.distance'),
            renderCell: (route) => `${Number(route.distanceKm).toLocaleString()} ${t('unit.km')}`,
        },
        {
            id: 'duration',
            header: t('table.duration'),
            renderCell: (route) => `${Number(route.estimateDurationMins).toLocaleString()} ${t('unit.minutes')}`,
        },
        {
            id: 'stops',
            header: t('table.stops'),
            renderCell: (route) => getRouteStops(route).length,
        },
        {
            id: 'createdAt',
            header: t('table.created_at'),
            renderCell: (route) => (
                <span className="text-xs text-muted-foreground">
                    {route.createdAt ? formatDateTime(route.createdAt) : t('empty_value')}
                </span>
            ),
        },
        {
            id: 'actions',
            header: tRoot('common.actions'),
            headerClassName: 'text-right',
            cellClassName: 'text-right',
            renderCell: (route) => (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => { setEditingRouteId(route.routeId); setIsEditModalOpen(true) }}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        {tRoot('common.edit')}
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        loading={deleteMutation.isPending}
                        onClick={() => handleDelete(route)}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        {tRoot('common.delete')}
                    </Button>
                </div>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('description')}</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="h-4 w-4" />
                    {t('add_route')}
                </Button>
            </div>

            <PaginatedTable
                columns={columns}
                data={routes}
                rowKey={(route) => route.routeId}
                isLoading={routesQuery.isLoading}
                emptyMessage={t('empty_state')}
                pagination={{
                    currentPage: page,
                    totalPages,
                    totalItems,
                    pageSize: PAGE_SIZE,
                    onPageChange: setPage,
                }}
            />

            <RouteAddModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                initialCompanyId={companyId}
                lockBusCompany={Boolean(companyId)}
                stationLabelById={stationLabelById}
                isSubmitting={createMutation.isPending}
                fetchBusCompanyOptions={fetchBusCompanyOptions}
                fetchStationOptions={fetchStationOptions}
                onSubmit={async (values) => { await createMutation.mutateAsync(values) }}
            />

            <RouteEditModal
                open={isEditModalOpen}
                onClose={() => { setIsEditModalOpen(false); setEditingRouteId(null) }}
                route={selectedRoute}
                isLoading={routeDetailQuery.isLoading}
                stationLabelById={stationLabelById}
                isSubmitting={updateMutation.isPending}
                fetchBusCompanyOptions={fetchBusCompanyOptions}
                fetchStationOptions={fetchStationOptions}
                onSubmit={async (values) => {
                    if (!editingRouteId) { toast.error(t('messages.load_route_detail_failed')); return }
                    await updateMutation.mutateAsync({ routeId: editingRouteId, payload: values })
                }}
            />
        </div>
    )
}
