import type { ILocation } from 'types/location'
import type { IPagination, IRequestPagination } from 'types/pagination'
import { api } from 'utils/axios.instance'

export interface IGetPublicLocationsQuery extends IRequestPagination {
    provinceId?: string
    isActive?: boolean
}

const buildQuery = (query: IGetPublicLocationsQuery = {}) => {
    const urlQuery = new URLSearchParams()

    if (query.page) urlQuery.set('page', String(query.page))
    if (query.limit) urlQuery.set('limit', String(query.limit))
    if (query.provinceId) urlQuery.set('province_id', query.provinceId)
    if (typeof query.isActive === 'boolean') urlQuery.set('is_active', String(query.isActive))

    const search = urlQuery.toString()
    return search.length > 0 ? `?${search}` : ''
}

export const getPublicLocations = async (query: IGetPublicLocationsQuery = {}) => {
    const response = await api.get<IPagination<ILocation>>(`/locations${buildQuery(query)}`)
    return response
}

export const getPublicLocationById = async (locationId: string) => {
    const response = await api.get<ILocation>(`/locations/${locationId}`)
    return response
}
