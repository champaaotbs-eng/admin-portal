export type RouteStopType = 'pickup' | 'dropoff' | 'both' | string

export interface IRouteStop {
    id: string
    routeId: string
    locationId: string
    locationName?: string
    stopType: RouteStopType
    stopOrder: number
    offsetMins: number
    note: string
    isActive: boolean
    createdAt?: string
    updatedAt?: string
}
