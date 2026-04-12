import { type IPagination, type IRequestPagination } from "types"
import { type ICreateStation, type IStation } from "types/station"
import { api } from "utils/axios.instance"

export const getAllStations = async (query: IRequestPagination<IStation>) => {
    const response = await api.get<IPagination<IStation>>('v1/stations', { params: query })
    return response
}

export const getStationById = async (stationId: string) => {
    const response = await api.get<IStation>(`v1/stations/${stationId}`)
    return response
}

export const createStation = async (payload: ICreateStation) => {
    const response = await api.post('/v1/stations', payload)
    return response
}

export const updateStation = async (stationId: string, payload: Partial<ICreateStation> & { isActive?: boolean }) => {
    const response = await api.patch(`/v1/stations/${stationId}`, payload)
    return response
}

export const deleteStation = async (stationId: string) => {
    const response = await api.delete(`/v1/stations/${stationId}`)
    return response
}
