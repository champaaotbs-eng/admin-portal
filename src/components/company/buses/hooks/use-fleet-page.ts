import { useMemo } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { deleteBus, getAllBuses } from 'services/company/bus.service'
import { EBusType } from 'types/bus'
import type { BusType, FleetItem } from '../data'
import { normalizeBusList } from '../utils/normalize-bus'

const BUSES_QUERY_KEY = ['company-buses']

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
    page: number
    pageSize: number
}

export const useFleetPage = ({
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    page,
    pageSize,
}: UseFleetPageProps) => {
    const queryClient = useQueryClient()
    const { t } = useTranslation('translation', { keyPrefix: 'pages.buses' })
    const { t: tRoot } = useTranslation()

    const busesQuery = useQuery({
        queryKey: [...BUSES_QUERY_KEY, page, pageSize],
        queryFn: () => getAllBuses({ page, limit: pageSize }),
        select: (response) => ({
            items: normalizeBusList(response),
            meta: response.meta ?? { page, limit: pageSize, totalItems: 0, totalPages: 1 },
        }),
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

    const buses = busesQuery.data?.items ?? []
    const meta = busesQuery.data?.meta ?? { page, limit: pageSize, totalItems: 0, totalPages: 1 }

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
        meta,
        isLoading: busesQuery.isLoading,
        isDeleting: deleteMutation.isPending,
        clearFilters, hasFilter,
        handleDelete,
    }
}
