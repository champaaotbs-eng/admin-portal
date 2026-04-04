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
}

const buildQuery = (query: IGetCompanyBookingsQuery = {}) => {
    const urlQuery = new URLSearchParams()

    if (query.page) urlQuery.set('page', String(query.page))
    if (query.limit) urlQuery.set('limit', String(query.limit))
    if (query.tripId) urlQuery.set('trip_id', query.tripId)
    if (query.status) urlQuery.set('status', query.status)
    if (query.paymentMethod) urlQuery.set('payment_method', query.paymentMethod)
    if (query.dateFrom) urlQuery.set('date_from', query.dateFrom)
    if (query.dateTo) urlQuery.set('date_to', query.dateTo)

    const search = urlQuery.toString()
    return search.length > 0 ? `?${search}` : ''
}

const toBody = (payload: ICreateCompanyBookingPayload) => ({
    trip_id: payload.tripId,
    seat_ids: payload.seatIds,
    payment_method: payload.paymentMethod,
    passenger_name: payload.passengerName,
    passenger_phone: payload.passengerPhone,
    passenger_email: payload.passengerEmail,
})

export const getCompanyBookings = async (query: IGetCompanyBookingsQuery = {}) => {
    const response = await api.get<IPagination<IBooking>>(`/company/bookings${buildQuery(query)}`)
    return response
}

export const createCompanyBooking = async (payload: ICreateCompanyBookingPayload) => {
    const response = await api.post<IBooking>('/company/bookings', toBody(payload))
    return response
}
