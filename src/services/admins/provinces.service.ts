import { api } from "utils/axios.instance"

interface IProvinceCode {
    provinceCode: string
    wardCode?: string
}

export const getProvincesCodeByName = async (provinceName: string, wardName?: string) => {
    const result = await api.get<IProvinceCode>(`/v1/provinces/by-name?provinceName=${provinceName}&wardName=${wardName}`)
    return result
    //response.data: { provinceCode: string, wardCode?: string }
}
