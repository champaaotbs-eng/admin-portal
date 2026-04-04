import type { EBookingStatus, EPaymentMethod, IBooking } from '@/types/booking'
import type { IPagination, IRequestPagination } from '@/types/pagination'
import { api } from 'utils/axios.instance'

export interface IGetAdminBookingsQuery extends IRequestPagination {
    companyId?: string
    status?: EBookingStatus
    paymentMethod?: EPaymentMethod
    dateFrom?: string
    dateTo?: string
    search?: string
}

const buildQuery = (query: IGetAdminBookingsQuery = {}) => {
    const urlQuery = new URLSearchParams()

    if (query.page) urlQuery.set('page', String(query.page))
    if (query.limit) urlQuery.set('limit', String(query.limit))
    if (query.companyId) urlQuery.set('company_id', query.companyId)
    if (query.status) urlQuery.set('status', query.status)
    if (query.paymentMethod) urlQuery.set('payment_method', query.paymentMethod)
    if (query.dateFrom) urlQuery.set('date_from', query.dateFrom)
    if (query.dateTo) urlQuery.set('date_to', query.dateTo)
    if (query.search) urlQuery.set('search', query.search)

    const search = urlQuery.toString()
    return search.length > 0 ? `?${search}` : ''
}

export const getAdminBookings = async (query: IGetAdminBookingsQuery = {}) => {
    const response = await api.get<IPagination<IBooking>>(`/admin/bookings${buildQuery(query)}`)
    return response
}
