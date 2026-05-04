import type { IPagination, IRequestPagination } from 'types'
import type { EBusType, EBusVersionStatus, IBus, IBusVersion } from 'types/bus'

import { api } from 'utils/axios.instance'

export const getAllBuses = async (query: IRequestPagination<IBus>) => {
    const { data } = await api.get<IPagination<IBus>>('/buses', {
        params: query
    })
    return data
}

export const getBusById = async (id: string) => {
    const { data } = await api.get<IBus>(`/buses/${id}`)
    return data
}

export const createBus = async (payload: Omit<IBus, 'id'>) => {
    const { data } = await api.post<IBus>('/buses', payload)
    return data
}

export const updateBus = async (busId: string, payload: Partial<Omit<IBus, 'id'>>) => {
    const { data } = await api.patch<IBus>(`/buses/${busId}`, payload)
    return data
}

export const deleteBus = async (busId: string) => {
    await api.delete(`/buses/${busId}`)
}
