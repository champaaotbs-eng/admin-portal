import type { StationFormData } from 'components/admin/stations/validation-schema'
import type { IPagination, IRequestPagination } from 'types'
import type { ILocation } from 'types/location'
import type { IProvince } from 'types/province'
import { api } from 'utils/axios.instance'

export type ICreateLocationPayload = StationFormData
export type IUpdateLocationPayload = Partial<StationFormData>

const buildQuery = (query: IRequestPagination<any>) => {
    const urlQuery = new URLSearchParams()
    urlQuery.set('page', String(query.page))
    urlQuery.set('limit', String(query.limit))
    urlQuery.set('filters', JSON.stringify(query.filters))

    const search = urlQuery.toString()
    return search.length > 0 ? `?${search}` : ''
}

export const getProvinces = async (query: IRequestPagination<IProvince>) => {
    const response = await api.get<IPagination<IProvince>>(`/v1/provinces${buildQuery(query)}`)
    return response
}

export const getProvincesByIds = async (provinceId: string) => {
    const response = await api.get<IProvince>(`/v1/provinces/${provinceId}`)
    return response
}

export const getLocations = async (query: IRequestPagination<ILocation>) => {
    const response = await api.get<IPagination<ILocation>>(`/v1/locations${buildQuery(query)}`)
    return response
}

export const getLocationById = async (locationId: string) => {
    const response = await api.get<ILocation>(`/v1/locations/${locationId}`)
    return response
}

export const createLocation = async (payload: ICreateLocationPayload) => {
    const response = await api.post<ILocation>('/v1/locations', payload)
    return response
}

export const updateLocation = async (locationId: string, payload: IUpdateLocationPayload) => {
    const response = await api.patch<ILocation>(`/v1/locations/${locationId}`, payload)
    return response
}
