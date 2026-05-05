import type { IPagination } from '@/types'
import type { ETripStatus, ITrip } from '@/types/trip'
import { api } from 'utils/axios.instance'

export interface IGetAdminTripsQuery {
    page?: number
    limit?: number
    companyId?: string
    status?: ETripStatus
    departureDate?: string
}

export interface ICreateAdminTripPayload {
    routeId: string
    busVersionId?: string
    busCompanyId: string
    departureTime: string
    arrivalTime: string
    basePrice: number
    isPublished?: boolean
}

export type IUpdateAdminTripPayload = Partial<ICreateAdminTripPayload>

const buildQuery = (query: IGetAdminTripsQuery = {}) => {
    const params = new URLSearchParams()
    if (query.page) params.set('page', String(query.page))
    if (query.limit) params.set('limit', String(query.limit))

    const filters: Record<string, unknown> = {}
    if (query.companyId) filters.busCompanyId = query.companyId
    if (query.status) filters.status = query.status
    if (query.departureDate) filters.departureDate = query.departureDate
    if (Object.keys(filters).length > 0) {
        params.set('filters', JSON.stringify(filters))
    }

    const search = params.toString()
    return search ? `?${search}` : ''
}

export const getAdminTrips = async (query: IGetAdminTripsQuery = {}) => {
    return api.get<IPagination<ITrip>>(`/v1/trips${buildQuery(query)}`)
}

export const getAdminTripById = async (tripId: string) => {
    return api.get<ITrip>(`/v1/trips/${tripId}`)
}

export const createAdminTrip = async (payload: ICreateAdminTripPayload) => {
    return api.post<ITrip>('/v1/trips', payload)
}

export const updateAdminTrip = async (tripId: string, payload: IUpdateAdminTripPayload) => {
    return api.patch<ITrip>(`/v1/trips/${tripId}`, payload)
}

export const cancelAdminTrip = async (tripId: string, cancelReason: string) => {
    return api.patch<ITrip>(`/v1/trips/${tripId}`, {
        status: 'CANCELLED',
        cancelReason,
    })
}
