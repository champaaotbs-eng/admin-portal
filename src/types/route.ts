import type { ILocation } from './location'

export interface IRoute {
    routeId: string
    fromLocationId: string
    toLocationId: string
    fromLocationName: string
    toLocationName: string
    distanceKm: number
    estimateDurationMins: number
    createdAt: string
    stops?: IRouteStop[];
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
}
