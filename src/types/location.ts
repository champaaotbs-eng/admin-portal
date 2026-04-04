export interface ILocation {
    locationId: string
    name: string
    address: string
    wardId: string | null
    provinceId: string
    latitude: number
    longitude: number
    isActive: boolean
    createdAt: string
}
