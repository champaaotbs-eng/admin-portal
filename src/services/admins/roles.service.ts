import type { TInsertRole } from "components/admin/roles/validation-schema"
import type { IPagination, IRequestPagination } from "types"
import { type IRole } from "types/role"
import { api } from "utils/axios.instance"

export const getAllRoles = async (query: IRequestPagination<IRole>) => {
    const urlQuery = new URLSearchParams()

    urlQuery.set('page', String(query.page))
    urlQuery.set('limit', String(query.limit))
    urlQuery.set('filters', JSON.stringify(query.filters))


    const response = await api.get<IPagination<IRole>>(`/v1/roles?${urlQuery.toString()}`)
    return response
}

export const getCompanyRoles = async () => {
    const response = await api.get<IRole[]>(`/v1/roles/company`)
    return response
}

export const getRoleById = async (roleId: string) => {
    const response = await api.get<IRole>(`/v1/roles/${roleId}`)
    return response
}

export const createRole = async (payload: TInsertRole) => {
    const response = await api.post<IRole>('/v1/roles', payload)
    return response
}

export const updateRole = async (roleId: string, payload: TInsertRole) => {
    const response = await api.patch<IRole>(`/v1/roles/${roleId}`, payload)
    return response
}

export const deleteRole = async (roleId: string) => {
    const response = await api.delete(`/v1/roles/${roleId}`)
    return response
}
