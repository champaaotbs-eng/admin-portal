import { useMemo, type Dispatch, type SetStateAction } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/auth.store'
import {
    getCompanyTrips,
    createCompanyTrip,
    updateCompanyTrip,
    cancelCompanyTrip,
    type ICreateCompanyTripPayload,
    type IUpdateCompanyTripPayload,
} from 'services/company/trip.service'
import type { ITrip } from 'types/trip'
import type { TripFormData } from '../validation-schema'

export const TRIPS_QUERY_KEY = ['company-trips']

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

const toPayload = (data: TripFormData, busCompanyId: string): ICreateCompanyTripPayload => ({
    routeId: data.routeId,
    busVersionId: data.busVersionId || undefined,
    busCompanyId,
    departureTime: new Date(data.departureTime).toISOString(),
    arrivalTime: new Date(data.arrivalTime).toISOString(),
    basePrice: Number(data.basePrice),
    isPublished: data.isPublished ?? true,
})

interface UseTripsPageProps {
    search: string
    setSearch: Dispatch<SetStateAction<string>>
    statusFilter: string
    setStatusFilter: Dispatch<SetStateAction<string>>
    setDialogOpen: Dispatch<SetStateAction<boolean>>
}

export const useTripsPage = ({ search, setSearch, statusFilter, setStatusFilter, setDialogOpen }: UseTripsPageProps) => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { admin } = useAuthStore()
    const busCompanyId = admin?.busCompanyId ?? ''

    const tripsQuery = useQuery({
        queryKey: [...TRIPS_QUERY_KEY, busCompanyId],
        queryFn: () => getCompanyTrips({ busCompanyId, limit: 200 }),
        select: (res) => readRows<ITrip>(res.data),
        enabled: !!busCompanyId,
        staleTime: 30_000,
    })

    const trips = tripsQuery.data ?? []

    const filtered = useMemo(() => {
        let list = trips
        if (search) {
            const q = search.toLowerCase()
            list = list.filter(t =>
                t.fromLocationName?.toLowerCase().includes(q) ||
                t.toLocationName?.toLowerCase().includes(q) ||
                t.route?.fromLocationName?.toLowerCase().includes(q) ||
                t.route?.toLocationName?.toLowerCase().includes(q) ||
                t.tripId.toLowerCase().includes(q)
            )
        }
        if (statusFilter !== 'all') {
            list = list.filter(t => t.status.toLowerCase() === statusFilter.toLowerCase())
        }
        return list
    }, [trips, search, statusFilter])

    const stats = useMemo(() => ({
        total: trips.length,
        scheduled: trips.filter(t => t.status.toUpperCase() === 'SCHEDULED').length,
        completed: trips.filter(t => t.status.toUpperCase() === 'COMPLETED').length,
        cancelled: trips.filter(t => t.status.toUpperCase() === 'CANCELLED').length,
    }), [trips])

    const createMutation = useMutation({
        mutationFn: (data: TripFormData) => createCompanyTrip(toPayload(data, busCompanyId)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TRIPS_QUERY_KEY })
            toast.success(t('pages.trips.create_success', 'Trip created successfully'))
            setDialogOpen(false)
        },
        onError: (err: unknown) => {
            const msg = (err as { localizedMessage?: string })?.localizedMessage ?? t('common.error')
            toast.error(msg)
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ tripId, data }: { tripId: string; data: TripFormData }) => {
            const payload: IUpdateCompanyTripPayload = {
                routeId: data.routeId,
                busVersionId: data.busVersionId || undefined,
                departureTime: new Date(data.departureTime).toISOString(),
                arrivalTime: new Date(data.arrivalTime).toISOString(),
                basePrice: Number(data.basePrice),
                isPublished: data.isPublished ?? true,
            }
            return updateCompanyTrip(tripId, payload)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TRIPS_QUERY_KEY })
            toast.success(t('pages.trips.update_success', 'Trip updated successfully'))
        },
        onError: (err: unknown) => {
            const msg = (err as { localizedMessage?: string })?.localizedMessage ?? t('common.error')
            toast.error(msg)
        },
    })

    const cancelMutation = useMutation({
        mutationFn: ({ tripId, cancelReason }: { tripId: string; cancelReason: string }) =>
            cancelCompanyTrip(tripId, { cancelReason }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TRIPS_QUERY_KEY })
            toast.success(t('pages.trips.cancel_success', 'Trip cancelled successfully'))
        },
        onError: (err: unknown) => {
            const msg = (err as { localizedMessage?: string })?.localizedMessage ?? t('common.error')
            toast.error(msg)
        },
    })

    const openDialog = () => setDialogOpen(true)
    const closeDialog = () => setDialogOpen(false)
    const clearFilters = () => { setSearch(''); setStatusFilter('all') }
    const hasFilter = search || statusFilter !== 'all'

    return {
        trips,
        filtered,
        stats,
        openDialog,
        closeDialog,
        clearFilters,
        hasFilter,
        isLoading: tripsQuery.isLoading,
        isError: tripsQuery.isError,
        createMutation,
        updateMutation,
        cancelMutation,
        busCompanyId,
    }
}
