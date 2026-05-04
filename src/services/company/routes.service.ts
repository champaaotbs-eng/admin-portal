import type { TRouteFormData } from "components/company/routes/validation-schema"
import { type IPagination, type IRequestPagination } from "types"
import type { IRoute } from "types/route"
import { api } from "utils/axios.instance"

export const getAllRoutes = async (query: IRequestPagination<IRoute>) => {
    const response = await api.get<IPagination<IRoute>>('/v1/routes', {
        params: query
    })
    return response;
}

export const getRouteById = async (id: string) => {
    const response = await api.get<IRoute>(`/v1/routes/${id}`)
    return response;
}

export const createRoute = async (payload: TRouteFormData) => {
    const response = await api.post<IRoute>('/v1/routes', payload)
    return response;
}

export const updateRoute = async (routeId: string, payload: Partial<TRouteFormData>) => {
    const response = await api.patch<IRoute>(`/v1/routes/${routeId}`, payload)
    return response;
}

export const deleteRoute = async (routeId: string) => {
    const response = await api.delete(`/v1/routes/${routeId}`)
    return response;
}