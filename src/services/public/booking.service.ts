import type { EBookingStatus, EPaymentMethod, IBooking } from 'types/booking'
import type { IPagination, IRequestPagination } from 'types/pagination'
import { api } from 'utils/axios.instance'

export interface ICreatePublicBookingPayload {
    tripId: string
    seatIds: string[]
    pickupStopId: string
    dropoffStopId: string
    paymentMethod: EPaymentMethod
    passengerName: string
    passengerPhone: string
    passengerEmail?: string
}

export interface IUpdatePublicBookingPayload extends Partial<ICreatePublicBookingPayload> { }

export interface IGetMyBookingsQuery extends IRequestPagination {
    status?: EBookingStatus
}

const buildQuery = (query: IGetMyBookingsQuery = {}) => {
    const urlQuery = new URLSearchParams()

    if (query.page) urlQuery.set('page', String(query.page))
    if (query.limit) urlQuery.set('limit', String(query.limit))
    if (query.status) urlQuery.set('status', query.status)

    const search = urlQuery.toString()
    return search.length > 0 ? `?${search}` : ''
}

const toBody = (payload: ICreatePublicBookingPayload | IUpdatePublicBookingPayload) => ({
    trip_id: payload.tripId,
    seat_ids: payload.seatIds,
    pickup_stop_id: payload.pickupStopId,
    dropoff_stop_id: payload.dropoffStopId,
    payment_method: payload.paymentMethod,
    passenger_name: payload.passengerName,
    passenger_phone: payload.passengerPhone,
    passenger_email: payload.passengerEmail,
})

export const createPublicBooking = async (payload: ICreatePublicBookingPayload) => {
    const response = await api.post<IBooking>('/bookings', toBody(payload))
    return response
}

export const getMyPublicBookings = async (query: IGetMyBookingsQuery = {}) => {
    const response = await api.get<IPagination<IBooking>>(`/bookings/my${buildQuery(query)}`)
    return response
}

export const getPublicBookingByCode = async (bookingCode: string) => {
    const response = await api.get<IBooking>(`/bookings/${bookingCode}`)
    return response
}

export const cancelPublicBooking = async (bookingId: string) => {
    const response = await api.patch<IBooking>(`/bookings/${bookingId}/cancel`)
    return response
}
