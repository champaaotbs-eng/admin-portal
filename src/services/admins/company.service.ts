import { type IPagination, type IRequestPagination } from "types"
import { type ICompany } from "types/company"
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

export const createCompany = async (payload: Partial<ICompany>) => {
    const response = await api.post<ICompany>('/v1/bus-companies', payload)
    return response
}

export const updateCompany = async (companyId: string, payload: Partial<ICompany>) => {
    const response = await api.patch<ICompany>(`/v1/bus-companies/${companyId}`, payload)
    return response
}

export const addAdmin = async (companyId: string, adminId: string, position: string) => {
    const response = await api.post(`/v1/bus-companies/${companyId}/admins`, { adminId, position })
    return response
}

export const removeAdmin = async (companyId: string, adminId: string) => {
    const response = await api.delete(`/v1/bus-companies/${companyId}/admins/${adminId}`)
}
