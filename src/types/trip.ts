import type { IRoute, IRouteStop, EStopType } from './route'
import type { ESeatType } from './seat-layout'

export interface ITrip {
    tripId: string
    routeId: string
    route?: IRoute
    fromLocationName?: string
    toLocationName?: string
    busVersionId?: string
    busCompanyId: string
    busCompany?: { busCompanyId: string; name: string; phone?: string }
    departureTime: string
    arrivalTime: string
    basePrice: number
    status: ETripStatus
    isPublished: boolean
    cancelReason?: string | null
    createdAt: string
    updatedAt?: string
    tripStops?: ITripStop[]
    seatAvailability?: ISeatAvailability[]
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

export interface ISeatAvailability {
    seatId: string
    seatCode: string
    seatType: ESeatType
    row: number
    col: number
    floor: number
    price: number
    isAvailable: boolean
}

export enum ETripStatus {
    SCHEDULED = 'SCHEDULED',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}
