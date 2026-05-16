import type { IPagination, IRequestPagination } from 'types'
import type { ESettlementStatus, ISettlement } from 'types/revenue'
import { api } from 'utils/axios.instance'

export interface IGetCompanySettlementsQuery extends Partial<IRequestPagination<ISettlement>> {
    status?: ESettlementStatus
    dateFrom?: string
    dateTo?: string
}

const buildQuery = (query: IGetCompanySettlementsQuery = {}) => {
    const urlQuery = new URLSearchParams()
    if (query.page) urlQuery.set('page', String(query.page))
    if (query.limit) urlQuery.set('limit', String(query.limit))

    const filters: Record<string, string> = {}
    if (query.status) filters.status = query.status
    if (query.dateFrom) filters.fromDate = query.dateFrom
    if (query.dateTo) filters.toDate = query.dateTo
    if (Object.keys(filters).length > 0) urlQuery.set('filters', JSON.stringify(filters))

    const search = urlQuery.toString()
    return search.length > 0 ? `?${search}` : ''
}

export const getCompanySettlements = async (query: IGetCompanySettlementsQuery = {}) => {
    const response = await api.get<IPagination<ISettlement>>(`/v1/company/settlements${buildQuery(query)}`)
    return response
}
