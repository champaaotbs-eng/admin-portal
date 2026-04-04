import type { ISeat, ISeatLayout } from 'types/seat-layout'
import { api } from 'utils/axios.instance'

export interface ICreateSeatLayoutPayload {
    name: string
    rows: number
    columns: number
}

export type IUpdateSeatLayoutPayload = Partial<ICreateSeatLayoutPayload>

export const getCompanySeatLayouts = async () => {
    const response = await api.get<ISeatLayout[]>('/company/seat-layouts')
    return response
}

export const getCompanySeatLayoutById = async (seatLayoutId: string) => {
    const response = await api.get<ISeatLayout>(`/company/seat-layouts/${seatLayoutId}`)
    return response
}

export const createCompanySeatLayout = async (payload: ICreateSeatLayoutPayload) => {
    const response = await api.post<ISeatLayout>('/company/seat-layouts', payload)
    return response
}

export const updateCompanySeatLayout = async (seatLayoutId: string, payload: IUpdateSeatLayoutPayload) => {
    const response = await api.patch<ISeatLayout>(`/company/seat-layouts/${seatLayoutId}`, payload)
    return response
}

export const deleteCompanySeatLayout = async (seatLayoutId: string) => {
    const response = await api.delete(`/company/seat-layouts/${seatLayoutId}`)
    return response
}

export const updateCompanySeatLayoutSeats = async (seatLayoutId: string, seats: ISeat[]) => {
    const response = await api.put<ISeat[]>(`/company/seat-layouts/${seatLayoutId}/seats`, { seats })
    return response
}
