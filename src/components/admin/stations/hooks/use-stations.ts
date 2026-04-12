import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
    createLocation,
    getLocations,
    updateLocation,
} from 'services/admins/location.service'
import type {
    ICreateStationPayload,
    IStation,
    IUpdateStationPayload,
} from 'types/station'
import type { IRequestPagination } from 'types'

const QUERY_KEY = 'admin-locations'

interface IStationQueryParams extends Partial<IRequestPagination<IStation>> {
    search?: string
    isActive?: boolean
}

const buildStationsQuery = (params: IStationQueryParams): IRequestPagination<IStation> => {
    const searchValue = typeof params.search === 'string' ? params.search.trim() : ''
    const mergedFilters = {
        ...(params.filters ?? {}),
        ...(searchValue ? { address: searchValue } : {}),
        ...(typeof params.isActive === 'boolean' ? { isActive: params.isActive } : {}),
    }

    return {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        ...(Object.keys(mergedFilters).length > 0
            ? { filters: mergedFilters as IRequestPagination<IStation>['filters'] }
            : {}),
        ...(params.sort ? { sort: params.sort } : {}),
    }
}

const toServiceCreatePayload = (payload: ICreateStationPayload): Parameters<typeof createLocation>[0] => ({
    name: payload.label,
    address: payload.address,
    province: payload.provinceName,
    lat: String(payload.latitude),
    lng: String(payload.longitude),
})

const toServiceUpdatePayload = (payload: IUpdateStationPayload): Parameters<typeof updateLocation>[1] => {
    const mappedPayload = {
        ...(payload.label ? { name: payload.label } : {}),
        ...(typeof payload.address === 'string' ? { address: payload.address } : {}),
        ...(typeof payload.provinceName === 'string' ? { province: payload.provinceName } : {}),
        ...(payload.latitude !== undefined ? { lat: String(payload.latitude) } : {}),
        ...(payload.longitude !== undefined ? { lng: String(payload.longitude) } : {}),
        ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
    }

    return mappedPayload as Parameters<typeof updateLocation>[1]
}

const normalizeStation = (station: Partial<IStation>): IStation => {
    const provinceCode = station.provinceCode ?? station.provinceId ?? ''
    const provinceId = station.provinceId ?? station.provinceCode ?? ''
    const wardCode = station.wardCode ?? station.wardId ?? null
    const wardId = station.wardId ?? station.wardCode ?? null

    return {
        locationId: station.locationId ?? '',
        name: station.name ?? station.address ?? '',
        address: station.address ?? '',
        wardCode,
        provinceCode,
        wardId,
        provinceId,
        latitude: station.latitude ?? 0,
        longitude: station.longitude ?? 0,
        isActive: station.isActive ?? true,
        createdAt: station.createdAt ?? new Date().toISOString(),
    }
}

export const useStations = (params: IStationQueryParams) => {
    return useQuery({
        queryKey: [QUERY_KEY, params],
        queryFn: () => getLocations(buildStationsQuery(params)),
        select: (response) => {
            const payload = response.data

            if (!payload) {
                return payload
            }

            return {
                ...payload,
                result: Array.isArray(payload.result)
                    ? payload.result.map((station) => normalizeStation(station as Partial<IStation>))
                    : [],
            }
        },
    })
}

export const useCreateStation = () => {
    const queryClient = useQueryClient()
    const { t } = useTranslation()

    return useMutation({
        mutationFn: (payload: ICreateStationPayload) => createLocation(toServiceCreatePayload(payload)),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
            toast.success(t('stations.create_success'))
        },
        onError: (error: unknown) => {
            const message =
                (error as { localizedMessage?: string; message?: string }).localizedMessage
                ?? (error as { message?: string }).message
                ?? t('errors.internal_server_error')

            toast.error(message)
        },
    })
}

export const useUpdateStation = () => {
    const queryClient = useQueryClient()
    const { t } = useTranslation()

    return useMutation({
        mutationFn: ({
            locationId,
            payload,
        }: {
            locationId: string
            payload: IUpdateStationPayload
        }) => updateLocation(locationId, toServiceUpdatePayload(payload)),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
            toast.success(t('stations.update_success'))
        },
        onError: (error: unknown) => {
            const message =
                (error as { localizedMessage?: string; message?: string }).localizedMessage
                ?? (error as { message?: string }).message
                ?? t('errors.internal_server_error')

            toast.error(message)
        },
    })
}

export const useToggleStationActive = () => {
    const { mutate, isPending } = useUpdateStation()

    const toggle = (station: IStation) => {
        mutate({
            locationId: station.locationId,
            payload: { isActive: !station.isActive },
        })
    }

    return { toggle, isPending }
}
