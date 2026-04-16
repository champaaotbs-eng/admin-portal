import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { AsyncSelect, type AsyncSelectOption } from '@/components/ui/async-select'
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

const readRows = <T,>(payload: unknown): T[] => {
    if (Array.isArray(payload)) {
        return payload
    }

    if (!payload || typeof payload !== 'object') {
        return []
    }

    const data = payload as Record<string, unknown>

    if (Array.isArray(data.result)) {
        return data.result as T[]
    }

    if (Array.isArray(data.data)) {
        return data.data as T[]
    }

    if (data.data && typeof data.data === 'object') {
        const nested = data.data as Record<string, unknown>

        if (Array.isArray(nested.result)) {
            return nested.result as T[]
        }

        if (Array.isArray(nested.data)) {
            return nested.data as T[]
        }
    }

    return []
}

const readOne = <T,>(payload: unknown): T | null => {
    if (!payload) {
        return null
    }

    if (payload && typeof payload === 'object') {
        const data = payload as Record<string, unknown>

        if (data.data && typeof data.data === 'object') {
            return data.data as T
        }

        return payload as T
    }

    return null
}

const getCompanyIdFromAdmin = (admin: unknown): string => {
    if (!admin || typeof admin !== 'object') {
        return ''
    }

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
    if (Array.isArray(route.stops)) {
        return route.stops
    }

    const fallback = route as unknown as { routeStops?: IRouteStop[] }

    if (Array.isArray(fallback.routeStops)) {
        return fallback.routeStops
    }

    return []
}

const getStopStationId = (stop: IRouteStop): string => {
    const source = stop as IRouteStop & {
        stationId?: string
        location_id?: string
        station_id?: string
    }

    return source.locationId
        || source.stationId
        || source.location_id
        || source.station_id
        || ''
}

const getStopStationLabel = (stop: IRouteStop): string => {
    const source = stop as IRouteStop & {
        location?: { name?: string; label?: string }
        station?: { name?: string; label?: string }
        locationName?: string
        stationName?: string
    }

    return source.location?.name
        || source.location?.label
        || source.station?.label
        || source.station?.name
        || source.locationName
        || source.stationName
        || ''
}

const toDefaultValues = (busCompanyId: string): TRouteFormData => ({
    busCompanyId,
    distanceKm: '',
    estimateDurationMins: '',
    routeStops: [],
})

const toFormValues = (route: IRoute, fallbackCompanyId: string): TRouteFormData => {
    const routeStops = getRouteStops(route)
        .slice()
        .sort((a, b) => a.stopOrder - b.stopOrder)
        .map((stop, index) => ({
            stationId: getStopStationId(stop),
            stopType: (stop.stopType as unknown as ERouteStopType) || ERouteStopType.BOTH,
            stopOrder: Number.isFinite(stop.stopOrder) ? stop.stopOrder : index + 1,
            offsetMins: String(stop.offsetMins ?? 0),
            isActive: stop.isActive ?? true,
        }))

    const routeSource = route as unknown as { busCompanyId?: string }

    return {
        busCompanyId: routeSource.busCompanyId ?? fallbackCompanyId,
        distanceKm: String(route.distanceKm ?? ''),
        estimateDurationMins: String(route.estimateDurationMins ?? ''),
        routeStops,
    }
}

const resolveErrorMessage = (error: unknown, t: (key: string) => string): string => {
    const source = error as {
        localizedMessage?: string
        message?: string
        response?: { data?: { message?: string } }
    }

    return source.localizedMessage
        ?? source.message
        ?? source.response?.data?.message
        ?? t('errors.internal_server_error')
}


export const CompanyRoutesPage = () => {
    const { admin } = useAuthStore()
    const queryClient = useQueryClient()
    const { t } = useTranslation('translation', { keyPrefix: 'pages.company_routes' })
    const { t: tRoot } = useTranslation()
    const [search, setSearch] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingRouteId, setEditingRouteId] = useState<string | null>(null)
    const [companyLabelById, setCompanyLabelById] = useState<Record<string, string>>({})
    const [stationLabelById, setStationLabelById] = useState<Record<string, string>>({})
    const companyLabelByIdRef = useRef<Record<string, string>>({})
    const stationLabelByIdRef = useRef<Record<string, string>>({})

    const companyId = useMemo(() => getCompanyIdFromAdmin(admin), [admin])

    const routesQuery = useQuery({
        queryKey: ROUTES_QUERY_KEY,
        queryFn: () => getAllRoutes({ page: 1, limit: 500 }),
        select: (response) => readRows<IRoute>(response.data),
    })

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
        onError: (error) => {
            toast.error(resolveErrorMessage(error, tRoot))
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ routeId, payload }: { routeId: string; payload: Partial<TRouteFormData> }) =>
            updateRoute(routeId, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ROUTES_QUERY_KEY })
            toast.success(t('messages.update_success'))
            setIsEditModalOpen(false)
        },
        onError: (error) => {
            toast.error(resolveErrorMessage(error, tRoot))
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (routeId: string) => deleteRoute(routeId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ROUTES_QUERY_KEY })
            toast.success(t('messages.delete_success'))
        },
        onError: (error) => {
            toast.error(resolveErrorMessage(error, tRoot))
        },
    })

    const routes = routesQuery.data ?? []

    const fetchBusCompanyOptions = useCallback(async (
        searchValue: string,
        page: number,
        limit: number,
        selectedCompanyId?: string,
    ) => {
        const trimmedSearch = searchValue.trim()

        const response = await getAllCompanies({
            ...(trimmedSearch ? {
                page,
                limit,
                filters: { name: trimmedSearch },
            } : {
                page,
                limit,
            }),
        })

        const companies = readRows<ICompany>(response.data)

        if (companies.length > 0) {
            setCompanyLabelById((prev) => {
                const next = { ...prev }
                let changed = false

                companies.forEach((company) => {
                    if (next[company.busCompanyId] !== company.name) {
                        next[company.busCompanyId] = company.name
                        changed = true
                    }
                })

                if (!changed) {
                    return prev
                }

                companyLabelByIdRef.current = next

                return next
            })
        }

        const options: AsyncSelectOption[] = companies.map((company) => ({
            value: company.busCompanyId,
            label: company.name,
            description: company.email || company.phone || company.address || undefined,
        }))

        if (selectedCompanyId && !options.some((option) => option.value === selectedCompanyId)) {
            options.unshift({
                value: selectedCompanyId,
                label: companyLabelByIdRef.current[selectedCompanyId] || selectedCompanyId,
            })
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
            ...(trimmedSearch ? {
                page,
                limit,
                filters: { label: trimmedSearch },
            } : {
                page,
                limit,
            }),
        })

        const stations = readRows<IStation>(response.data)

        if (stations.length > 0) {
            setStationLabelById((prev) => {
                const next = { ...prev }
                let changed = false

                stations.forEach((station) => {
                    if (!station.stationId) {
                        return
                    }

                    const label = station.label || station.address || station.stationId
                    if (next[station.stationId] !== label) {
                        next[station.stationId] = label
                        changed = true
                    }
                })

                if (!changed) {
                    return prev
                }

                stationLabelByIdRef.current = next

                return next
            })
        }

        const options: AsyncSelectOption[] = stations
            .filter((station) => Boolean(station.stationId))
            .map((station) => ({
                value: station.stationId as string,
                label: station.label || station.address || (station.stationId as string),
                description: station.address,
            }))

        if (selectedStationId && !options.some((option) => option.value === selectedStationId)) {
            options.unshift({
                value: selectedStationId,
                label: stationLabelByIdRef.current[selectedStationId] || selectedStationId,
            })
        }

        return options
    }, [])

    const filteredRoutes = useMemo(() => {
        const trimmedSearch = search.trim().toLowerCase()

        if (!trimmedSearch) {
            return routes
        }

        return routes.filter((route) => {
            const routeLabel = `${route.fromLocationName} ${route.toLocationName}`.toLowerCase()
            return routeLabel.includes(trimmedSearch) || route.routeId.toLowerCase().includes(trimmedSearch)
        })
    }, [routes, search])

    const editingRoute = useMemo(
        () => routes.find((route) => route.routeId === editingRouteId) ?? null,
        [editingRouteId, routes],
    )

    const selectedRoute = routeDetailQuery.data ?? editingRoute

    useEffect(() => {
        if (!selectedRoute) {
            return
        }

        const routeSource = selectedRoute as unknown as { busCompanyId?: string }

        if (routeSource.busCompanyId && !companyLabelByIdRef.current[routeSource.busCompanyId]) {
            setCompanyLabelById((prev) => ({
                ...prev,
                [routeSource.busCompanyId as string]: routeSource.busCompanyId as string,
            }))
            companyLabelByIdRef.current = {
                ...companyLabelByIdRef.current,
                [routeSource.busCompanyId as string]: routeSource.busCompanyId as string,
            }
        }

        const stops = getRouteStops(selectedRoute)

        if (stops.length === 0) {
            return
        }

        const stationEntries = stops
            .map((stop) => ({
                stationId: getStopStationId(stop),
                stationLabel: getStopStationLabel(stop),
            }))
            .filter((entry) => Boolean(entry.stationId))

        setStationLabelById((prev) => {
            const next = { ...prev }
            let changed = false

            stationEntries.forEach((entry) => {
                if (!entry.stationLabel) {
                    return
                }

                if (next[entry.stationId] !== entry.stationLabel) {
                    next[entry.stationId] = entry.stationLabel
                    changed = true
                }
            })

            if (!changed) {
                return prev
            }

            stationLabelByIdRef.current = next

            return next
        })

        const unresolvedStationIds = [...new Set(
            stationEntries
                .filter((entry) => !entry.stationLabel && !stationLabelByIdRef.current[entry.stationId])
                .map((entry) => entry.stationId),
        )]

        if (unresolvedStationIds.length === 0) {
            return
        }

        let isCancelled = false

        const loadMissingStationLabels = async () => {
            const results = await Promise.allSettled(
                unresolvedStationIds.map((stationId) => getStationById(stationId)),
            )

            if (isCancelled) {
                return
            }

            setStationLabelById((prev) => {
                const next = { ...prev }
                let changed = false

                results.forEach((result) => {
                    if (result.status !== 'fulfilled') {
                        return
                    }

                    const station = readOne<IStation>(result.value.data)

                    if (!station || !station.stationId) {
                        return
                    }

                    const stationLabel = station.label || station.address || station.stationId
                    if (next[station.stationId] !== stationLabel) {
                        next[station.stationId] = stationLabel
                        changed = true
                    }
                })

                if (!changed) {
                    return prev
                }

                stationLabelByIdRef.current = next

                return next
            })
        }

        void loadMissingStationLabels()

        return () => {
            isCancelled = true
        }
    }, [selectedRoute])

    const getRouteLabel = useCallback(
        (route: IRoute) => {
            const fromName = route.fromLocationName || t('unknown_location')
            const toName = route.toLocationName || t('unknown_location')

            return `${fromName} → ${toName}`
        },
        [t],
    )

    const getStopArrangement = useCallback((route: IRoute) => {
        const stops = getRouteStops(route)
            .slice()
            .sort((a, b) => a.stopOrder - b.stopOrder)

        if (stops.length === 0) {
            return ''
        }

        return stops
            .map((stop) => {
                const stationId = getStopStationId(stop)
                return getStopStationLabel(stop) || stationLabelById[stationId] || stationId
            })
            .join(' -> ')
    }, [stationLabelById])

    const openAddModal = () => {
        setIsAddModalOpen(true)
    }

    const openEditModal = (routeId: string) => {
        setEditingRouteId(routeId)
        setIsEditModalOpen(true)
    }

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false)
    }

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false)
        setEditingRouteId(null)
    }

    const handleDelete = (route: IRoute) => {
        const confirmText = t('messages.confirm_delete', { route: getRouteLabel(route) })

        if (!window.confirm(confirmText)) {
            return
        }

        deleteMutation.mutate(route.routeId)
    }

    const handleAddSubmit = async (values: TRouteFormData) => {
        await createMutation.mutateAsync(values)
    }

    const handleEditSubmit = async (values: TRouteFormData) => {
        if (!editingRouteId) {
            toast.error(t('messages.load_route_detail_failed'))
            return
        }

        await updateMutation.mutateAsync({
            routeId: editingRouteId,
            payload: values,
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('description')}</p>
                </div>
                <Button onClick={openAddModal}>
                    <Plus className="h-4 w-4" />
                    {t('add_route')}
                </Button>
            </div>

            <div className="flex items-center gap-3">
                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={t('search_placeholder')}
                    className="h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>

            {routesQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">{tRoot('common.loading')}</p>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.route')}</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.distance')}</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.duration')}</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.stops')}</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.created_at')}</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">{tRoot('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRoutes.map((route) => (
                                <tr key={route.routeId} className="border-t border-border hover:bg-muted/30">
                                    <td className="px-4 py-3">
                                        <p className="font-medium">{getRouteLabel(route)}</p>
                                        {getStopArrangement(route) ? (
                                            <p className="mt-1 text-xs text-muted-foreground">{getStopArrangement(route)}</p>
                                        ) : null}
                                    </td>
                                    <td className="px-4 py-3">{Number(route.distanceKm).toLocaleString()} {t('unit.km')}</td>
                                    <td className="px-4 py-3">{Number(route.estimateDurationMins).toLocaleString()} {t('unit.minutes')}</td>
                                    <td className="px-4 py-3">{getRouteStops(route).length}</td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground">
                                        {route.createdAt ? formatDateTime(route.createdAt) : t('empty_value')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEditModal(route.routeId)}
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
                                    </td>
                                </tr>
                            ))}

                            {filteredRoutes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                                        {t('empty_state')}
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            )}

            <RouteAddModal
                open={isAddModalOpen}
                onClose={handleCloseAddModal}
                initialCompanyId={companyId}
                lockBusCompany={Boolean(companyId)}
                stationLabelById={stationLabelById}
                isSubmitting={createMutation.isPending}
                fetchBusCompanyOptions={fetchBusCompanyOptions}
                fetchStationOptions={fetchStationOptions}
                onSubmit={handleAddSubmit}
            />

            <RouteEditModal
                open={isEditModalOpen}
                onClose={handleCloseEditModal}
                route={selectedRoute}
                isLoading={routeDetailQuery.isLoading}
                stationLabelById={stationLabelById}
                isSubmitting={updateMutation.isPending}
                fetchBusCompanyOptions={fetchBusCompanyOptions}
                fetchStationOptions={fetchStationOptions}
                onSubmit={handleEditSubmit}
            />
        </div>
    )
}
