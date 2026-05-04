import { useMemo } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { deleteBus, getAllBuses } from 'services/company/bus.service'
import { EBusType } from 'types/bus'
import type { IBus } from 'types/bus'
import type { BusType, FleetItem } from '../data'

const BUSES_QUERY_KEY = ['company-buses']
const readRows = (payload: unknown): IBus[] => {
    if (Array.isArray(payload)) {
        return payload
    }

    if (!payload || typeof payload !== 'object') {
        return []
    }

    const source = payload as Record<string, unknown>

    if (Array.isArray(source.result)) {
        return source.result as IBus[]
    }

    if (Array.isArray(source.data)) {
        return source.data as IBus[]
    }

    if (source.data && typeof source.data === 'object') {
        const nested = source.data as Record<string, unknown>

        if (Array.isArray(nested.result)) {
            return nested.result as IBus[]
        }

        if (Array.isArray(nested.data)) {
            return nested.data as IBus[]
        }
    }

    return []
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

interface UseFleetPageProps {
    search: string
    setSearch: Dispatch<SetStateAction<string>>
    typeFilter: BusType | 'all'
    setTypeFilter: Dispatch<SetStateAction<BusType | 'all'>>
}

export const useFleetPage = ({
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
}: UseFleetPageProps) => {
    const queryClient = useQueryClient()
    const { t } = useTranslation('translation', { keyPrefix: 'pages.buses' })
    const { t: tRoot } = useTranslation()

    const busesQuery = useQuery({
        queryKey: BUSES_QUERY_KEY,
        queryFn: () => getAllBuses({ page: 1, limit: 500 }),
        select: (response) => readRows(response),
    })

    const deleteMutation = useMutation({
        mutationFn: (busId: string) => deleteBus(busId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: BUSES_QUERY_KEY })
            toast.success(t('messages.delete_success'))
        },
        onError: (error) => {
            toast.error(resolveErrorMessage(error, tRoot))
        },
    })

    const buses = busesQuery.data ?? []

    const filtered = useMemo(() => {
        let list = buses

        if (search) {
            const query = search.toLowerCase().trim()
            list = list.filter((bus) => {
                const fields = [bus.busCode, bus.busName, bus.licensePlate]
                return fields.some((field) => field.toLowerCase().includes(query))
            })
        }

        if (typeFilter !== 'all') {
            list = list.filter((bus) => bus.busType === typeFilter)
        }

        return list
    }, [buses, search, typeFilter])

    const stats = useMemo(() => ({
        total: buses.length,
        seat: buses.filter((bus) => bus.busType === EBusType.SEAT).length,
        sleeper: buses.filter((bus) => bus.busType === EBusType.SLEEPER).length,
        limousine: buses.filter((bus) => bus.busType === EBusType.LIMOUSINE).length,
    }), [buses])

    const clearFilters = () => { setSearch(''); setTypeFilter('all') }
    const hasFilter = search || typeFilter !== 'all'

    const handleDelete = (bus: FleetItem) => {
        const busLabel = bus.busName || bus.licensePlate || bus.busCode || bus.busId
        const isConfirmed = window.confirm(t('messages.confirm_delete', { name: busLabel }))

        if (!isConfirmed) {
            return
        }

        deleteMutation.mutate(bus.busId)
    }

    return {
        filtered,
        stats,
        isLoading: busesQuery.isLoading,
        isDeleting: deleteMutation.isPending,
        clearFilters, hasFilter,
        handleDelete,
    }
}
