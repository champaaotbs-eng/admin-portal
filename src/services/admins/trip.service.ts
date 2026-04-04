import type { IPagination, IRequestPagination } from '@/types/pagination'
import type { ETripStatus, ITrip } from '@/types/trip'
import { api } from 'utils/axios.instance'

export interface IGetAdminTripsQuery extends IRequestPagination {
    companyId?: string
    status?: ETripStatus
    dateFrom?: string
    dateTo?: string
}

const buildQuery = (query: IGetAdminTripsQuery = {}) => {
    const urlQuery = new URLSearchParams()

    if (query.page) urlQuery.set('page', String(query.page))
    if (query.limit) urlQuery.set('limit', String(query.limit))
    if (query.companyId) urlQuery.set('company_id', query.companyId)
    if (query.status) urlQuery.set('status', query.status)
    if (query.dateFrom) urlQuery.set('date_from', query.dateFrom)
    if (query.dateTo) urlQuery.set('date_to', query.dateTo)

    const search = urlQuery.toString()
    return search.length > 0 ? `?${search}` : ''
}

export const getAdminTrips = async (query: IGetAdminTripsQuery = {}) => {
    const response = await api.get<IPagination<ITrip>>(`/admin/trips${buildQuery(query)}`)
    return response
}
