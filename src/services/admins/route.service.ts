import type { RouteFormData } from 'components/admin/stations/validation-schema'
import type { IPagination, IRequestPagination } from 'types/pagination'
import type { IRoute } from 'types/route'
import { api } from 'utils/axios.instance'

export interface IGetRoutesQuery extends IRequestPagination {
    fromLocationId?: string
    toLocationId?: string
}

export type ICreateRoutePayload = RouteFormData
export type IUpdateRoutePayload = Partial<RouteFormData>

const buildQuery = (query: IGetRoutesQuery = {}) => {
    const urlQuery = new URLSearchParams()

    if (query.page) urlQuery.set('page', String(query.page))
    if (query.limit) urlQuery.set('limit', String(query.limit))
    if (query.fromLocationId) urlQuery.set('from_location_id', query.fromLocationId)
    if (query.toLocationId) urlQuery.set('to_location_id', query.toLocationId)

    const search = urlQuery.toString()
    return search.length > 0 ? `?${search}` : ''
}

const toRouteBody = (payload: ICreateRoutePayload | IUpdateRoutePayload) => ({
    from_location_id: payload.from,
    to_location_id: payload.to,
    distance_km: payload.distance ? Number(payload.distance) : undefined,
    estimate_duration_mins: payload.duration ? Number(payload.duration) : undefined,
})

export const getRoutes = async (query: IGetRoutesQuery = {}) => {
    const response = await api.get<IPagination<IRoute>>(`/routes${buildQuery(query)}`)
    return response
}

export const getRouteById = async (routeId: string) => {
    const response = await api.get<IRoute>(`/routes/${routeId}`)
    return response
}

export const createRoute = async (payload: ICreateRoutePayload) => {
    const response = await api.post<IRoute>('/routes', toRouteBody(payload))
    return response
}

export const updateRoute = async (routeId: string, payload: IUpdateRoutePayload) => {
    const response = await api.patch<IRoute>(`/routes/${routeId}`, toRouteBody(payload))
    return response
}

export const deleteRoute = async (routeId: string) => {
    const response = await api.delete(`/routes/${routeId}`)
    return response
}
