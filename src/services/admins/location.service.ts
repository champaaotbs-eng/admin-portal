import type { StationFormData } from 'components/admin/locations/validation-schema'
import type { ILocation } from 'types/location'
import type { IPagination, IRequestPagination } from 'types/pagination'
import type { IProvince } from 'types/province'
import { api } from 'utils/axios.instance'

export interface IGetLocationsQuery extends IRequestPagination {
    provinceId?: string
    isActive?: boolean
}

export type ICreateLocationPayload = StationFormData
export type IUpdateLocationPayload = Partial<StationFormData>

const buildQuery = (query: IGetLocationsQuery = {}) => {
    const urlQuery = new URLSearchParams()

    if (query.page) urlQuery.set('page', String(query.page))
    if (query.limit) urlQuery.set('limit', String(query.limit))
    if (query.provinceId) urlQuery.set('province_id', query.provinceId)
    if (typeof query.isActive === 'boolean') urlQuery.set('is_active', String(query.isActive))

    const search = urlQuery.toString()
    return search.length > 0 ? `?${search}` : ''
}

const toLocationBody = (payload: ICreateLocationPayload | IUpdateLocationPayload) => ({
    name: payload.name,
    address: payload.address,
    province_id: payload.province,
    latitude: payload.lat ? Number(payload.lat) : undefined,
    longitude: payload.lng ? Number(payload.lng) : undefined,
})

export const getProvinces = async () => {
    const response = await api.get<IProvince[]>('/provinces')
    return response
}

export const getLocations = async (query: IGetLocationsQuery = {}) => {
    const response = await api.get<IPagination<ILocation>>(`/locations${buildQuery(query)}`)
    return response
}

export const getLocationById = async (locationId: string) => {
    const response = await api.get<ILocation>(`/locations/${locationId}`)
    return response
}

export const createLocation = async (payload: ICreateLocationPayload) => {
    const response = await api.post<ILocation>('/locations', toLocationBody(payload))
    return response
}

export const updateLocation = async (locationId: string, payload: IUpdateLocationPayload) => {
    const response = await api.patch<ILocation>(`/locations/${locationId}`, toLocationBody(payload))
    return response
}

export const toggleLocationActive = async (locationId: string) => {
    const response = await api.patch<ILocation>(`/locations/${locationId}/toggle-active`)
    return response
}
