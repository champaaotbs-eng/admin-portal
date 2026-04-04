import type { EBusType, EBusVersionStatus, IBus, IBusVersion } from 'types/bus'
import type { IPagination, IRequestPagination } from 'types/pagination'
import { api } from 'utils/axios.instance'

export interface IGetCompanyBusesQuery extends IRequestPagination {
    busType?: EBusType
    status?: EBusVersionStatus
}

export interface ICreateBusPayload {
    busName: string
    busCode: string
    busType: EBusType
    licensePlate: string
    description?: string
}

export interface ICreateBusVersionPayload {
    driverPhone: string
    status: EBusVersionStatus
}

export type IUpdateBusPayload = Partial<ICreateBusPayload>
export type IUpdateBusVersionPayload = Partial<ICreateBusVersionPayload>

const buildQuery = (query: IGetCompanyBusesQuery = {}) => {
    const urlQuery = new URLSearchParams()

    if (query.page) urlQuery.set('page', String(query.page))
    if (query.limit) urlQuery.set('limit', String(query.limit))
    if (query.busType) urlQuery.set('bus_type', query.busType)
    if (query.status) urlQuery.set('status', query.status)

    const search = urlQuery.toString()
    return search.length > 0 ? `?${search}` : ''
}

export const getCompanyBuses = async (query: IGetCompanyBusesQuery = {}) => {
    const response = await api.get<IPagination<IBus>>(`/company/buses${buildQuery(query)}`)
    return response
}

export const getCompanyBusById = async (busId: string) => {
    const response = await api.get<IBus>(`/company/buses/${busId}`)
    return response
}

export const createCompanyBus = async (payload: ICreateBusPayload) => {
    const response = await api.post<IBus>('/company/buses', payload)
    return response
}

export const updateCompanyBus = async (busId: string, payload: IUpdateBusPayload) => {
    const response = await api.patch<IBus>(`/company/buses/${busId}`, payload)
    return response
}

export const getCompanyBusVersions = async (busId: string) => {
    const response = await api.get<IBusVersion[]>(`/company/buses/${busId}/versions`)
    return response
}

export const createCompanyBusVersion = async (busId: string, payload: ICreateBusVersionPayload) => {
    const response = await api.post<IBusVersion>(`/company/buses/${busId}/versions`, payload)
    return response
}

export const updateCompanyBusVersion = async (versionId: string, payload: IUpdateBusVersionPayload) => {
    const response = await api.patch<IBusVersion>(`/company/buses/versions/${versionId}`, payload)
    return response
}

export const assignCompanyBusLayout = async (versionId: string, seatLayoutId: string) => {
    const response = await api.post(`/company/buses/versions/${versionId}/layout`, { seatLayoutId })
    return response
}
