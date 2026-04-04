import type { EStopType, IRouteStop } from 'types/route'
import { api } from 'utils/axios.instance'

export interface IGetRouteStopsQuery {
    companyId?: string
}

export interface ICreateRouteStopPayload {
    locationId: string
    stopType: EStopType
    stopOrder: number
    offsetMins: number
    companyId?: string | null
    isActive?: boolean
}

export type IUpdateRouteStopPayload = Partial<ICreateRouteStopPayload>

const buildQuery = (query: IGetRouteStopsQuery = {}) => {
    const urlQuery = new URLSearchParams()
    if (query.companyId) urlQuery.set('company_id', query.companyId)

    const search = urlQuery.toString()
    return search.length > 0 ? `?${search}` : ''
}

const toBody = (payload: ICreateRouteStopPayload | IUpdateRouteStopPayload) => ({
    location_id: payload.locationId,
    stop_type: payload.stopType,
    stop_order: payload.stopOrder,
    offset_mins: payload.offsetMins,
    company_id: payload.companyId,
    is_active: payload.isActive,
})

export const getRouteStops = async (routeId: string, query: IGetRouteStopsQuery = {}) => {
    const response = await api.get<IRouteStop[]>(`/routes/${routeId}/stops${buildQuery(query)}`)
    return response
}

export const createRouteStop = async (routeId: string, payload: ICreateRouteStopPayload) => {
    const response = await api.post<IRouteStop>(`/routes/${routeId}/stops`, toBody(payload))
    return response
}

export const updateRouteStop = async (routeStopId: string, payload: IUpdateRouteStopPayload) => {
    const response = await api.patch<IRouteStop>(`/route-stops/${routeStopId}`, toBody(payload))
    return response
}

export const deleteRouteStop = async (routeStopId: string) => {
    const response = await api.delete(`/route-stops/${routeStopId}`)
    return response
}

export const toggleRouteStopActive = async (routeStopId: string) => {
    const response = await api.patch<IRouteStop>(`/route-stops/${routeStopId}/toggle-active`)
    return response
}
