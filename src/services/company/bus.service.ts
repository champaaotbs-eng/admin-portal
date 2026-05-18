import type { IPagination, IRequestPagination } from 'types'
import type { IBus, IBusCurrentLocation, ICreateBus, IUpdateBus } from 'types/bus'

import { api } from 'utils/axios.instance'

export const getAllBuses = async (query: IRequestPagination<IBus>) => {
    const { data } = await api.get<IPagination<IBus>>('/v1/buses', {
        params: query
    })
    return data
}

export const getBusById = async (id: string) => {
    const { data } = await api.get<IBus>(`/v1/buses/${id}`)
    return data
}

export const getCompanyBusCurrentLocation = async (busId: string) => {
    return api.get<IBusCurrentLocation>(`/v1/buses/${busId}/current-location`)
}

export const getCompanyBusVersionCurrentLocation = async (busVersionId: string) => {
    return api.get<IBusCurrentLocation>(`/v1/buses/versions/${busVersionId}/current-location`)
}

export const createBus = async (payload: ICreateBus) => {
    const { data } = await api.post<IBus>('/v1/buses', payload)
    return data
}

export const updateBus = async (busId: string, payload: IUpdateBus) => {
    const { data } = await api.patch<IBus>(`/v1/buses/${busId}`, payload)
    return data
}

export const deleteBus = async (busId: string) => {
    await api.delete(`/v1/buses/${busId}`)
}
