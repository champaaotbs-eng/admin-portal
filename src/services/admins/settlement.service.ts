import type { IPagination, IRequestPagination } from '@/types/pagination'
import type { ESettlementStatus, ISettlement } from '@/types/revenue'
import { api } from 'utils/axios.instance'

export interface IGetAdminSettlementsQuery extends IRequestPagination {
    companyId?: string
    status?: ESettlementStatus
}

export interface ICreateAdminSettlementPayload {
    companyId: string
    periodFrom: string
    periodTo: string
}

export type IUpdateAdminSettlementPayload = Partial<ICreateAdminSettlementPayload>

const buildQuery = (query: IGetAdminSettlementsQuery = {}) => {
    const urlQuery = new URLSearchParams()

    if (query.page) urlQuery.set('page', String(query.page))
    if (query.limit) urlQuery.set('limit', String(query.limit))
    if (query.companyId) urlQuery.set('company_id', query.companyId)
    if (query.status) urlQuery.set('status', query.status)

    const search = urlQuery.toString()
    return search.length > 0 ? `?${search}` : ''
}

const toBody = (payload: ICreateAdminSettlementPayload | IUpdateAdminSettlementPayload) => ({
    company_id: payload.companyId,
    period_from: payload.periodFrom,
    period_to: payload.periodTo,
})

export const getAdminSettlements = async (query: IGetAdminSettlementsQuery = {}) => {
    const response = await api.get<IPagination<ISettlement>>(`/admin/settlements${buildQuery(query)}`)
    return response
}

export const createAdminSettlement = async (payload: ICreateAdminSettlementPayload) => {
    const response = await api.post<ISettlement>('/admin/settlements', toBody(payload))
    return response
}

export const markAdminSettlementPaid = async (settlementId: string) => {
    const response = await api.patch<ISettlement>(`/admin/settlements/${settlementId}/mark-paid`)
    return response
}
