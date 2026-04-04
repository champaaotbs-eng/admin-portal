import type { IProvince, IWard } from 'types/province'
import { api } from 'utils/axios.instance'

export const getPublicProvinces = async () => {
    const response = await api.get<IProvince[]>('/provinces')
    return response
}

export const getPublicWardsByProvinceId = async (provinceId: string) => {
    const response = await api.get<IWard[]>(`/provinces/${provinceId}/wards`)
    return response
}
