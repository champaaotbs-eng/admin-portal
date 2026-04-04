import type { IRoute, IRouteStop, EStopType } from './route'

export interface ITrip {
    tripId: string
    routeId: string
    route: IRoute
    busVersionId: string
    busCompanyId: string
    departureTime: string
    arrivalTime: string
    basePrice: number
    status: ETripStatus
    isPublished: boolean
    cancelReason: string | null
    createdAt: string
    updatedAt: string
}

export interface ITripStop {
    tripStopId: string
    tripId: string
    stopId: string
    routeStop: IRouteStop
    stopOrder: number
    stopType: EStopType
    pickupTime: string | null
    dropoffTime: string | null
    note: string | null
}

export enum ETripStatus {
    SCHEDULED = 'SCHEDULED',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}
