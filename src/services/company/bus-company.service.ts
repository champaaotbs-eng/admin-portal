import type { CompanyFormData } from 'components/admin/companies/validation-schema'
import type { IAdmin } from 'types/admin'
import type { ICompany, ICompanyAdmins } from 'types/company'
import type { IPagination, IRequestPagination } from 'types/pagination'
import { api } from 'utils/axios.instance'

export interface IGetCompaniesQuery extends IRequestPagination {
    search?: string
    status?: string
}

export type ICreateBusCompanyPayload = CompanyFormData
export type IUpdateBusCompanyPayload = Partial<CompanyFormData>

export interface IAddCompanyAdminPayload {
    adminId: string
    position: 'OWNER' | 'STAFF'
}

const buildQuery = (query: IGetCompaniesQuery = {}) => {
    const urlQuery = new URLSearchParams()

    if (query.page) urlQuery.set('page', String(query.page))
    if (query.limit) urlQuery.set('limit', String(query.limit))

    const filters: Record<string, unknown> = {}
    if (query.search?.trim()) {
        filters.name = query.search.trim()
    }
    if (query.status && query.status !== 'all') {
        filters.status = query.status.toUpperCase()
    }

    if (Object.keys(filters).length > 0) {
        urlQuery.set('filters', JSON.stringify(filters))
    }

    const search = urlQuery.toString()
    return search.length > 0 ? `?${search}` : ''
}

export const getAllCompanies = async (query: IGetCompaniesQuery = {}) => {
    const response = await api.get<IPagination<ICompany>>(`/v1/bus-companies${buildQuery(query)}`)
    return response
}

export const getCompanyById = async (companyId: string) => {
    const response = await api.get<ICompany>(`/v1/bus-companies/${companyId}`)
    return response
}

export const createCompany = async (payload: ICreateBusCompanyPayload) => {
    const response = await api.post<ICompany>('/v1/bus-companies', payload)
    return response
}

export const updateCompany = async (companyId: string, payload: IUpdateBusCompanyPayload) => {
    const response = await api.patch<ICompany>(`/v1/bus-companies/${companyId}`, payload)
    return response
}

export const deleteCompany = async (companyId: string) => {
    const response = await api.delete(`/v1/bus-companies/${companyId}`)
    return response
}

export const toggleCompanyStatus = async (companyId: string) => {
    const response = await api.patch<ICompany>(`/v1/bus-companies/${companyId}/toggle-status`)
    return response
}

export const getCompanyAdmins = async (companyId: string) => {
    const response = await api.get<ICompanyAdmins[]>(`/v1/bus-companies/${companyId}/admins`)
    return response
}

export const addCompanyAdmin = async (companyId: string, payload: IAddCompanyAdminPayload) => {
    const response = await api.post<ICompanyAdmins>(`/v1/bus-companies/${companyId}/admins`, payload)
    return response
}

export const removeCompanyAdmin = async (companyId: string, adminId: string) => {
    const response = await api.delete(`/v1/bus-companies/${companyId}/admins/${adminId}`)
    return response
}

export const getAllAdmins = async (search?: string) => {
    const urlQuery = new URLSearchParams()
    urlQuery.set('page', '1')
    urlQuery.set('limit', '1000')

    if (search?.trim()) {
        urlQuery.set('filters', JSON.stringify({ fullName: search.trim() }))
    }

    const response = await api.get<IPagination<IAdmin>>(`/v1/admins?${urlQuery.toString()}`)
    return response
}
