import type { IPagination, IRequestPagination } from 'types'
import type { IAdmin } from 'types/admin'
import { api } from 'utils/axios.instance'

export interface ICompanyStaffPayload {
    username: string
    fullName: string
    roleId: string
    password?: string
    isActive: boolean
}

export const getCompanyStaff = async (query: IRequestPagination<IAdmin> & { filters?: { username?: string; fullName?: string; roleId?: string; isActive?: boolean } }) => {
    const urlQuery = new URLSearchParams()

    urlQuery.set('page', String(query.page))
    urlQuery.set('limit', String(query.limit))

    if (query.filters) {
        const filters = Object.fromEntries(
            Object.entries(query.filters).filter(([, value]) => value !== undefined && value !== null && value !== ''),
        )
        if (Object.keys(filters).length > 0) {
            urlQuery.set('filters', JSON.stringify(filters))
        }
    }

    if (query.sort && query.sort.length > 0) {
        urlQuery.set('sort', JSON.stringify(query.sort))
    }

    return api.get<IPagination<IAdmin>>(`/v1/admins/company/staff?${urlQuery.toString()}`)
}

export const createCompanyStaff = async (payload: ICompanyStaffPayload) => {
    return api.post<IAdmin>('/v1/admins/company/staff', payload)
}

export const updateCompanyStaff = async (adminId: string, payload: Partial<ICompanyStaffPayload>) => {
    return api.patch<IAdmin>(`/v1/admins/company/staff/${adminId}`, payload)
}

export const deleteCompanyStaff = async (adminId: string) => {
    return api.delete(`/v1/admins/company/staff/${adminId}`)
}
