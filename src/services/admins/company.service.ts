import type { CompanyFormData } from "components/admin/companies/validation-schema"
import { type IPagination, type IRequestPagination } from "types"
import { BusCompanyAdminPosition, BusCompanyStatus, type ICompany } from "types/company"
import { api } from "utils/axios.instance"

export const getAllCompanies = async (query: IRequestPagination<ICompany>) => {
    const urlQuery = new URLSearchParams()

    urlQuery.set('page', String(query.page))
    urlQuery.set('limit', String(query.limit))
    urlQuery.set('filters', JSON.stringify(query.filters))

    const response = await api.get<IPagination<ICompany>>(`/v1/bus-companies?${urlQuery.toString()}`)
    return response
}

export const getCompanyById = async (companyId: string) => {
    const response = await api.get<ICompany>(`/v1/bus-companies/${companyId}`)
    return response
}

export const createCompany = async (payload: CompanyFormData) => {
    const response = await api.post<ICompany>('/v1/bus-companies', payload)
    return response
}

export const updateCompany = async (companyId: string, payload: CompanyFormData) => {
    const response = await api.patch<ICompany>(`/v1/bus-companies/${companyId}`, payload)
    return response
}
