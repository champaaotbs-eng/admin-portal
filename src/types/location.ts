export interface ILocation {
    locationId: string
    name: string
    address: string
    wardCode: string | null
    provinceCode: string
    wardId: string | null
    provinceId: string
    latitude: number
    longitude: number
    isActive: boolean
    createdAt: string
}

export interface ICreateLocationPayload {
    label: string
    address: string
    provinceName: string
    wardName: string | null
    latitude: number
    longitude: number
}

export interface IUpdateLocationPayload {
    label?: string
    address?: string
    provinceName?: string
    wardName?: string | null
    latitude?: number
    longitude?: number
    isActive?: boolean
}

export interface IGooglePlaceParsed {
    address: string
    provinceName: string
    wardName: string | null
    latitude: number
    longitude: number
    placeId: string
}
