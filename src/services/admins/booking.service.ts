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

    const filters: Record<string, unknown> = {}
    if (query.companyId) filters.busCompanyId = query.companyId
    if (query.status) filters.status = query.status
    if (query.paymentMethod) filters.paymentMethod = query.paymentMethod
    if (query.dateFrom) filters.dateFrom = query.dateFrom
    if (query.dateTo) filters.dateTo = query.dateTo
    if (Object.keys(filters).length > 0) {
        urlQuery.set('filters', JSON.stringify(filters))
    }
    if (query.search) urlQuery.set('search', query.search)

    const qs = urlQuery.toString()
    return qs ? `?${qs}` : ''
}

export const getAdminBookings = async (query: IGetAdminBookingsQuery = {}) => {
    const response = await api.get<IPagination<IBooking>>(`/v1/admin/bookings${buildQuery(query)}`)
    return response
}
