import type { IPagination, IRequestPagination } from 'types'
import type {
    ISeatLayout,
    ICreateSeatLayout,
    IUpdateSeatLayout,
} from 'types/seat-layout'
import { api } from 'utils/axios.instance'

export const getAllSeatLayouts = async (query: IRequestPagination<ISeatLayout>) => {
    const response = await api.get<IPagination<ISeatLayout>>('/v1/seat-layouts', {
        params: query
    })
    return response
}

export const getSeatLayoutById = async (id: string) => {
    const response = await api.get<ISeatLayout>(`/v1/seat-layouts/${id}`)
    return response
}

export const createSeatLayout = async (payload: ICreateSeatLayout) => {
    const response = await api.post<ISeatLayout>('/v1/seat-layouts', payload)
    return response
}

export const updateSeatLayout = async (seatLayoutId: string, payload: IUpdateSeatLayout) => {
    const response = await api.patch<ISeatLayout>(`/v1/seat-layouts/${seatLayoutId}`, payload)
    return response
}

export const deleteSeatLayout = async (seatLayoutId: string) => {
    const response = await api.delete(`/v1/seat-layouts/${seatLayoutId}`)
    return response
}

export const checkEligibilityForSeatLayout = async (seatLayoutId: string) => {
    const response = await api.get<{ isEligible: boolean }>(`/v1/seat-layouts/${seatLayoutId}/check-eligibility`)
    return response
}
