import type { EBookingStatus, EPaymentMethod, IBooking } from 'types/booking'
import type { IPagination, IRequestPagination } from 'types/pagination'
import { api } from 'utils/axios.instance'

export interface IGetCompanyBookingsQuery extends IRequestPagination {
    tripId?: string
    status?: EBookingStatus
    paymentMethod?: EPaymentMethod
    dateFrom?: string
    dateTo?: string
}

export interface ICreateCompanyBookingPayload {
    tripId: string
    seatIds: string[]
    paymentMethod: EPaymentMethod
    passengerName: string
    passengerPhone: string
    passengerEmail?: string
    pickupStopId?: string
    dropoffStopId?: string
}

const buildQuery = (busCompanyId: string, query: IGetCompanyBookingsQuery = {}) => {
    const urlQuery = new URLSearchParams()
    urlQuery.set('companyId', busCompanyId)
    if (query.page) urlQuery.set('page', String(query.page))
    if (query.limit) urlQuery.set('limit', String(query.limit))

    const filters: Record<string, unknown> = {}
    if (query.tripId) filters.tripId = query.tripId
    if (query.status) filters.status = query.status
    if (query.paymentMethod) filters.paymentMethod = query.paymentMethod
    if (query.dateFrom) filters.dateFrom = query.dateFrom
    if (query.dateTo) filters.dateTo = query.dateTo
    if (Object.keys(filters).length > 0) {
        urlQuery.set('filters', JSON.stringify(filters))
    }

    return `?${urlQuery.toString()}`
}

export const getCompanyBookings = async (busCompanyId: string, query: IGetCompanyBookingsQuery = {}) => {
    const response = await api.get<IPagination<IBooking>>(`/v1/company/bookings${buildQuery(busCompanyId, query)}`)
    return response
}

export const createCompanyBooking = async (busCompanyId: string, payload: ICreateCompanyBookingPayload) => {
    const response = await api.post<IBooking>(`/v1/company/bookings?companyId=${encodeURIComponent(busCompanyId)}`, payload)
    return response
}
