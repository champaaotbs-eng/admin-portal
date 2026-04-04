import type { IPagination, IRequestPagination } from 'types/pagination'
import type { ETripStatus, ITrip, ITripStop } from 'types/trip'
import { api } from 'utils/axios.instance'

export interface IGetCompanyTripsQuery extends IRequestPagination {
    status?: ETripStatus
    dateFrom?: string
    dateTo?: string
}

export interface ICreateCompanyTripPayload {
    routeId: string
    busVersionId: string
    departureTime: string
    arrivalTime: string
    basePrice: number
    isPublished?: boolean
}

export type IUpdateCompanyTripPayload = Partial<ICreateCompanyTripPayload>

export interface ICancelCompanyTripPayload {
    cancelReason: string
}

const buildQuery = (query: IGetCompanyTripsQuery = {}) => {
    const urlQuery = new URLSearchParams()

    if (query.page) urlQuery.set('page', String(query.page))
    if (query.limit) urlQuery.set('limit', String(query.limit))
    if (query.status) urlQuery.set('status', query.status)
    if (query.dateFrom) urlQuery.set('date_from', query.dateFrom)
    if (query.dateTo) urlQuery.set('date_to', query.dateTo)

    const search = urlQuery.toString()
    return search.length > 0 ? `?${search}` : ''
}

const toBody = (payload: ICreateCompanyTripPayload | IUpdateCompanyTripPayload) => ({
    route_id: payload.routeId,
    bus_version_id: payload.busVersionId,
    departure_time: payload.departureTime,
    arrival_time: payload.arrivalTime,
    base_price: payload.basePrice,
    is_published: payload.isPublished,
})

export const getCompanyTrips = async (query: IGetCompanyTripsQuery = {}) => {
    const response = await api.get<IPagination<ITrip>>(`/company/trips${buildQuery(query)}`)
    return response
}

export const getCompanyTripById = async (tripId: string) => {
    const response = await api.get<ITrip>(`/company/trips/${tripId}`)
    return response
}

export const createCompanyTrip = async (payload: ICreateCompanyTripPayload) => {
    const response = await api.post<ITrip>('/company/trips', toBody(payload))
    return response
}

export const updateCompanyTrip = async (tripId: string, payload: IUpdateCompanyTripPayload) => {
    const response = await api.patch<ITrip>(`/company/trips/${tripId}`, toBody(payload))
    return response
}

export const cancelCompanyTrip = async (tripId: string, payload: ICancelCompanyTripPayload) => {
    const response = await api.patch<ITrip>(`/company/trips/${tripId}/cancel`, payload)
    return response
}

export const updateCompanyTripStops = async (tripId: string, tripStops: ITripStop[]) => {
    const response = await api.patch<ITripStop[]>(`/company/trips/${tripId}/stops`, { tripStops })
    return response
}
