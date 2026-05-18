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

export interface ISeatPrice {
    seatId: string
    price: number
}

export interface ICreateCompanyTripPayload {
    routeId: string
    busVersionId?: string
    busCompanyId: string
    departureTime: string
    arrivalTime: string
    basePrice: number
    isPublished?: boolean
    seatPrices?: ISeatPrice[]
}

export type IUpdateCompanyTripPayload = Partial<Omit<ICreateCompanyTripPayload, 'busCompanyId'>> & { status?: string; seatPrices?: ISeatPrice[] }

export interface ICancelCompanyTripPayload {
    cancelReason: string
}

export interface IBusAvailabilityQuery {
    busVersionId: string
    departureTime: string
    arrivalTime: string
    excludeTripId?: string
}

export interface IBusAvailabilityResponse {
    available: boolean
    conflictTrip?: Pick<ITrip, 'tripId' | 'departureTime' | 'arrivalTime' | 'fromLocationName' | 'toLocationName'> | null
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

export const checkCompanyTripBusAvailability = async (query: IBusAvailabilityQuery) => {
    const params = new URLSearchParams()
    params.set('busVersionId', query.busVersionId)
    params.set('departureTime', query.departureTime)
    params.set('arrivalTime', query.arrivalTime)
    if (query.excludeTripId) params.set('excludeTripId', query.excludeTripId)

    return api.get<IBusAvailabilityResponse>(`/v1/trips/bus-availability?${params.toString()}`)
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
