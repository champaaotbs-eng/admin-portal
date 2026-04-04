import type { ILocation } from './location'

export interface IRoute {
    routeId: string
    fromLocationId: string
    toLocationId: string
    fromLocation: ILocation
    toLocation: ILocation
    distanceKm: number
    estimateDurationMins: number
    createdAt: string
}

export interface IRouteStop {
    routeStopId: string
    routeId: string
    companyId: string | null
    locationId: string
    location: ILocation
    stopOrder: number
    stopType: EStopType
    offsetMins: number
    isActive: boolean
}

export enum EStopType {
    PICKUP = 'PICKUP',
    DROPOFF = 'DROPOFF',
    BOTH = 'BOTH',
}
