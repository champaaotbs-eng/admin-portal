import type { IPagination, IRequestPagination } from '@/types/pagination'
import type { ESettlementStatus, ISettlement } from '@/types/revenue'
import { api } from 'utils/axios.instance'

export interface IGetAdminSettlementsQuery extends IRequestPagination {
    companyId?: string
    status?: ESettlementStatus
    dateFrom?: string
    dateTo?: string
}

export interface ICreateAdminSettlementPayload {
    companyId: string
    periodFrom: string
    periodTo: string
}

export type IUpdateAdminSettlementPayload = Partial<ICreateAdminSettlementPayload>

const buildQuery = (query: IGetAdminSettlementsQuery = {}) => {
    const urlQuery = new URLSearchParams()
    const filters: Record<string, string> = {}

    if (query.page) urlQuery.set('page', String(query.page))
    if (query.limit) urlQuery.set('limit', String(query.limit))
    if (query.companyId) filters.companyId = query.companyId
    if (query.status) filters.status = query.status
    if (query.dateFrom) filters.fromDate = query.dateFrom
    if (query.dateTo) filters.toDate = query.dateTo
    if (Object.keys(filters).length > 0) urlQuery.set('filters', JSON.stringify(filters))

    const search = urlQuery.toString()
    return search.length > 0 ? `?${search}` : ''
}

const toBody = (payload: ICreateAdminSettlementPayload | IUpdateAdminSettlementPayload) => ({
    companyId: payload.companyId,
    periodFrom: payload.periodFrom,
    periodTo: payload.periodTo,
})

export const getAdminSettlements = async (query: IGetAdminSettlementsQuery = {}) => {
    const response = await api.get<IPagination<ISettlement>>(`/v1/admin/settlements${buildQuery(query)}`)
    return response
}

export const createAdminSettlement = async (payload: ICreateAdminSettlementPayload) => {
    const response = await api.post<ISettlement>('/v1/admin/settlements', toBody(payload))
    return response
}

export const markAdminSettlementPaid = async (settlementId: string) => {
    const response = await api.patch<ISettlement>(`/v1/admin/settlements/${settlementId}/mark-paid`)
    return response
}
