import type { IPagination, IRequestPagination } from 'types/pagination'
import type { ISettlement } from 'types/revenue'
import { api } from 'utils/axios.instance'

export interface IGetCompanySettlementsQuery extends IRequestPagination { }

const buildQuery = (query: IGetCompanySettlementsQuery = {}) => {
    const urlQuery = new URLSearchParams()
    if (query.page) urlQuery.set('page', String(query.page))
    if (query.limit) urlQuery.set('limit', String(query.limit))

    const search = urlQuery.toString()
    return search.length > 0 ? `?${search}` : ''
}

export const getCompanySettlements = async (query: IGetCompanySettlementsQuery = {}) => {
    const response = await api.get<IPagination<ISettlement>>(`/company/settlements${buildQuery(query)}`)
    return response
}
