import type { CompanyFormData } from 'components/admin/companies/validation-schema'
import type { IPagination, IRequestPagination } from 'types'
import type { ICompany } from 'types/company'
import { api } from 'utils/axios.instance'
export type ICreateAdminBusCompanyPayload = CompanyFormData
export type IUpdateAdminBusCompanyPayload = Partial<CompanyFormData>

const buildQuery = (query: IRequestPagination<ICompany>) => {
    const urlQuery = new URLSearchParams()

    if (query.page) urlQuery.set('page', String(query.page))
    if (query.limit) urlQuery.set('limit', String(query.limit))
    if (query.filters) urlQuery.set('filters', JSON.stringify(query.filters))

    const search = urlQuery.toString()
    return search.length > 0 ? `?${search}` : ''
}

export const getAdminBusCompanies = async (query: IRequestPagination<ICompany>) => {
    const response = await api.get<IPagination<ICompany>>(`/admin/companies${buildQuery(query)}`)
    return response
}

export const getAdminBusCompanyById = async (companyId: string) => {
    const response = await api.get<ICompany>(`/admin/companies/${companyId}`)
    return response
}

export const createAdminBusCompany = async (payload: ICreateAdminBusCompanyPayload) => {
    const response = await api.post<ICompany>('/admin/companies', payload)
    return response
}

export const updateAdminBusCompany = async (companyId: string, payload: IUpdateAdminBusCompanyPayload) => {
    const response = await api.patch<ICompany>(`/admin/companies/${companyId}`, payload)
    return response
}

export const toggleAdminBusCompanyActive = async (companyId: string) => {
    const response = await api.patch<ICompany>(`/admin/companies/${companyId}/toggle-active`)
    return response
}
