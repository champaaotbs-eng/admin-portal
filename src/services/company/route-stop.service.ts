import type { EStopType, IRouteStop } from 'types/route'
import { api } from 'utils/axios.instance'

export interface IGetCompanyRouteStopsQuery {
    companyId?: string
}

export interface ICreateCompanyRouteStopPayload {
    locationId: string
    stopOrder: number
    stopType: EStopType
    offsetMins: number
    isActive?: boolean
}

export type IUpdateCompanyRouteStopPayload = Partial<ICreateCompanyRouteStopPayload>

const buildQuery = (query: IGetCompanyRouteStopsQuery = {}) => {
    const urlQuery = new URLSearchParams()
    if (query.companyId) urlQuery.set('company_id', query.companyId)

    const search = urlQuery.toString()
    return search.length > 0 ? `?${search}` : ''
}

const toBody = (payload: ICreateCompanyRouteStopPayload | IUpdateCompanyRouteStopPayload) => ({
    location_id: payload.locationId,
    stop_order: payload.stopOrder,
    stop_type: payload.stopType,
    offset_mins: payload.offsetMins,
    is_active: payload.isActive,
})

export const getCompanyRouteStops = async (routeId: string, query: IGetCompanyRouteStopsQuery = {}) => {
    const response = await api.get<IRouteStop[]>(`/routes/${routeId}/stops${buildQuery(query)}`)
    return response
}

export const createCompanyRouteStop = async (routeId: string, payload: ICreateCompanyRouteStopPayload) => {
    const response = await api.post<IRouteStop>(`/routes/${routeId}/stops`, toBody(payload))
    return response
}

export const updateCompanyRouteStop = async (routeStopId: string, payload: IUpdateCompanyRouteStopPayload) => {
    const response = await api.patch<IRouteStop>(`/route-stops/${routeStopId}`, toBody(payload))
    return response
}

export const deleteCompanyRouteStop = async (routeStopId: string) => {
    const response = await api.delete(`/route-stops/${routeStopId}`)
    return response
}

export const toggleCompanyRouteStopActive = async (routeStopId: string) => {
    const response = await api.patch<IRouteStop>(`/route-stops/${routeStopId}/toggle-active`)
    return response
}
