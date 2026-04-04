import type { EPaymentMethod } from 'types/booking'
import type { IPagination, IRequestPagination } from 'types/pagination'
import type { IRevenue } from 'types/revenue'
import { api } from 'utils/axios.instance'

export interface IGetCompanyRevenuesQuery extends IRequestPagination {
    dateFrom?: string
    dateTo?: string
    paymentType?: EPaymentMethod
}

const buildQuery = (query: IGetCompanyRevenuesQuery = {}) => {
    const urlQuery = new URLSearchParams()

    if (query.page) urlQuery.set('page', String(query.page))
    if (query.limit) urlQuery.set('limit', String(query.limit))
    if (query.dateFrom) urlQuery.set('date_from', query.dateFrom)
    if (query.dateTo) urlQuery.set('date_to', query.dateTo)
    if (query.paymentType) urlQuery.set('payment_type', query.paymentType)

    const search = urlQuery.toString()
    return search.length > 0 ? `?${search}` : ''
}

export const getCompanyRevenues = async (query: IGetCompanyRevenuesQuery = {}) => {
    const response = await api.get<IPagination<IRevenue>>(`/company/revenues${buildQuery(query)}`)
    return response
}
