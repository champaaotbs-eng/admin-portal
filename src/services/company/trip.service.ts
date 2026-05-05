import type { IPagination } from 'types'
import type { ETripStatus, ITrip } from 'types/trip'
import { api } from 'utils/axios.instance'

export interface IGetCompanyTripsQuery {
    page?: number
    limit?: number
    busCompanyId?: string
    status?: ETripStatus
    departureDate?: string
}

export interface ICreateCompanyTripPayload {
    routeId: string
    busVersionId?: string
    busCompanyId: string
    departureTime: string
    arrivalTime: string
    basePrice: number
    isPublished?: boolean
}

export type IUpdateCompanyTripPayload = Partial<Omit<ICreateCompanyTripPayload, 'busCompanyId'>> & { status?: string }

export interface ICancelCompanyTripPayload {
    cancelReason: string
}

const buildQuery = (query: IGetCompanyTripsQuery = {}) => {
    const params = new URLSearchParams()
    if (query.page) params.set('page', String(query.page))
    if (query.limit) params.set('limit', String(query.limit))

    const filters: Record<string, unknown> = {}
    if (query.busCompanyId) filters.busCompanyId = query.busCompanyId
    if (query.status) filters.status = query.status
    if (query.departureDate) filters.departureDate = query.departureDate
    if (Object.keys(filters).length > 0) {
        params.set('filters', JSON.stringify(filters))
    }

    const search = params.toString()
    return search ? `?${search}` : ''
}

export const getCompanyTrips = async (query: IGetCompanyTripsQuery = {}) => {
    return api.get<IPagination<ITrip>>(`/v1/trips${buildQuery(query)}`)
}

export const getCompanyTripById = async (tripId: string) => {
    return api.get<ITrip>(`/v1/trips/${tripId}`)
}

export const createCompanyTrip = async (payload: ICreateCompanyTripPayload) => {
    return api.post<ITrip>('/v1/trips', payload)
}

export const updateCompanyTrip = async (tripId: string, payload: IUpdateCompanyTripPayload) => {
    return api.patch<ITrip>(`/v1/trips/${tripId}`, payload)
}

export const cancelCompanyTrip = async (tripId: string, payload: ICancelCompanyTripPayload) => {
    return api.patch<ITrip>(`/v1/trips/${tripId}`, {
        status: 'CANCELLED',
        cancelReason: payload.cancelReason,
    })
}
