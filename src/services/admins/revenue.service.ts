import type { EPaymentMethod } from 'types/booking'
import type { IPagination } from 'types'
import type { IRevenue, IRevenueStats } from 'types/revenue'
import { api } from 'utils/axios.instance'

export interface IGetRevenuesQuery {
    page?: number
    limit?: number
    companyId?: string
    dateFrom?: string
    dateTo?: string
    paymentType?: EPaymentMethod
}

const buildQuery = (query: IGetRevenuesQuery = {}) => {
    const urlQuery = new URLSearchParams()
    if (query.page) urlQuery.set('page', String(query.page))
    if (query.limit) urlQuery.set('limit', String(query.limit))

    const filters: Record<string, string> = {}
    if (query.companyId) filters.companyId = query.companyId
    if (query.dateFrom) filters.fromDate = query.dateFrom
    if (query.dateTo) filters.toDate = query.dateTo
    if (query.paymentType) filters.paymentType = query.paymentType
    if (Object.keys(filters).length) urlQuery.set('filters', JSON.stringify(filters))

    const search = urlQuery.toString()
    return search ? `?${search}` : ''
}

const buildStatsQuery = (dateFrom?: string, dateTo?: string, companyId?: string) => {
    const filters: Record<string, string> = {}
    if (companyId) filters.companyId = companyId
    if (dateFrom) filters.fromDate = dateFrom
    if (dateTo) filters.toDate = dateTo
    return Object.keys(filters).length ? `?filters=${encodeURIComponent(JSON.stringify(filters))}` : ''
}

export const getRevenues = async (query: IGetRevenuesQuery = {}) =>
    api.get<IPagination<IRevenue>>(`/v1/revenues${buildQuery(query)}`)

export const getRevenueStats = async (dateFrom?: string, dateTo?: string, companyId?: string) =>
    api.get<IRevenueStats>(`/v1/revenues/stats${buildStatsQuery(dateFrom, dateTo, companyId)}`)
