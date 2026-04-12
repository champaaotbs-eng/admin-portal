export interface IStation {
    stationId?: string
    label?: string
    address: string
    provinceName?: string
    wardName?: string
    provinceCode?: string
    wardCode?: string
    provinceId?: string
    wardId?: string
    latitude?: number
    longitude?: number
    isActive: boolean
    createdAt?: string
}

export interface ICreateStation {
    label: string
    address: string
    provinceCode: string
    wardCode?: string
    latitude?: number
    longitude?: number
}

export interface IUpdateStation {
    label?: string
    address?: string
    provinceCode?: string
    wardCode?: string
    latitude?: number
    longitude?: number
    isActive?: boolean
}
