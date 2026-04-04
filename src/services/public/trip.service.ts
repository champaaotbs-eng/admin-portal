import type { IPagination, IRequestPagination } from 'types/pagination'
import type { ITrip } from 'types/trip'
import { api } from 'utils/axios.instance'

export interface IGetPublicTripsQuery extends IRequestPagination {
    fromLocationId?: string
    toLocationId?: string
    departureDate?: string
}

const buildQuery = (query: IGetPublicTripsQuery = {}) => {
    const urlQuery = new URLSearchParams()

    if (query.page) urlQuery.set('page', String(query.page))
    if (query.limit) urlQuery.set('limit', String(query.limit))
    if (query.fromLocationId) urlQuery.set('from_location_id', query.fromLocationId)
    if (query.toLocationId) urlQuery.set('to_location_id', query.toLocationId)
    if (query.departureDate) urlQuery.set('departure_date', query.departureDate)

    const search = urlQuery.toString()
    return search.length > 0 ? `?${search}` : ''
}

export const getPublicTrips = async (query: IGetPublicTripsQuery = {}) => {
    const response = await api.get<IPagination<ITrip>>(`/trips${buildQuery(query)}`)
    return response
}

export const getPublicTripById = async (tripId: string) => {
    const response = await api.get<ITrip>(`/trips/${tripId}`)
    return response
}
