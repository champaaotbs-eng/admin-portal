import type { IPagination, IRequestPagination } from 'types/pagination'
import type { IRoute } from 'types/route'
import { api } from 'utils/axios.instance'

export interface IGetPublicRoutesQuery extends IRequestPagination {
    fromLocationId?: string
    toLocationId?: string
}

const buildQuery = (query: IGetPublicRoutesQuery = {}) => {
    const urlQuery = new URLSearchParams()

    if (query.page) urlQuery.set('page', String(query.page))
    if (query.limit) urlQuery.set('limit', String(query.limit))
    if (query.fromLocationId) urlQuery.set('from_location_id', query.fromLocationId)
    if (query.toLocationId) urlQuery.set('to_location_id', query.toLocationId)

    const search = urlQuery.toString()
    return search.length > 0 ? `?${search}` : ''
}

export const getPublicRoutes = async (query: IGetPublicRoutesQuery = {}) => {
    const response = await api.get<IPagination<IRoute>>(`/routes${buildQuery(query)}`)
    return response
}

export const getPublicRouteById = async (routeId: string) => {
    const response = await api.get<IRoute>(`/routes/${routeId}`)
    return response
}
